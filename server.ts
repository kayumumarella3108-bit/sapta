import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as pdfParseModule from "pdf-parse";

// Robust extractor for PDF buffer supporting pdf-parse v2+ (PDFParse class) and v1 (function)
async function extractPDFTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const anyModule = pdfParseModule as any;
    // 1. pdf-parse v2.x exports { PDFParse: class ... }
    if (anyModule.PDFParse) {
      const parser = new anyModule.PDFParse({ data: buffer });
      try {
        const res = await parser.getText();
        if (res && typeof res.text === "string" && res.text.trim()) {
          return res.text;
        }
        if (res && Array.isArray(res.pages)) {
          const pagesText = res.pages.map((p: any) => p.text || "").join("\n");
          if (pagesText.trim()) return pagesText;
        }
      } finally {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup error
        }
      }
    }

    // 2. pdf-parse v1.x exports a direct callable function
    const candidateFn = typeof anyModule.default === "function" 
      ? anyModule.default 
      : (typeof anyModule === "function" ? anyModule : null);

    if (candidateFn) {
      const res = await candidateFn(buffer);
      if (res && res.text) return res.text;
    }
  } catch (err) {
    console.warn("[PDFParse] Gagal mengekstrak teks via library PDFParse, mencoba pemindaian binary teks:", err);
  }

  // 3. Fallback: extract string literals from uncompressed PDF streams
  try {
    const raw = buffer.toString("latin1");
    const textMatches = raw.match(/\(([^)]{2,100})\)/g);
    if (textMatches && textMatches.length > 5) {
      return textMatches.map((m) => m.slice(1, -1)).join(" ");
    }
  } catch {
    // ignore
  }

  return "";
}

interface ExtractedSPBJData {
  namaPekerjaan: string;
  noSPBJ: string;
  lokasi: string;
  nilaiKontrak: number;
  kategori: 'TM' | 'TR' | 'Gardu' | 'Panel' | 'Jaringan' | 'Grounding';
  statusManuver: 'BEBAS_TEGANGAN' | 'BERTEGANGAN' | 'PADAM_TERENCANA';
  pic: string;
  picKontak: string;
  mandor: string;
  mandorKontak: string;
  manpower: {
    total: number;
    teknisiListrik: number;
    helper: number;
    hseOfficer: number;
    operatorAlat: number;
  };
  tanggalMulai: string;
  targetSelesai: string;
  catatanHarian: string;
  itemsRAB: Array<{
    namaMaterial: string;
    volume: number;
    satuan: string;
    spesifikasi?: string;
    hargaSatuan?: number;
    totalHarga?: number;
  }>;
  method: 'gemini_ai' | 'pdf_parse_heuristic';
}

// Heuristic rule-based extractor from plain text
function extractFromPlainText(text: string): ExtractedSPBJData {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // 1. Nomor SPBJ
  let noSPBJ = '';
  const spbjMatch = text.match(/(\d{3,5}\.[A-Z0-9\.\-_/]+(?:UP3|PLN|UID|DIST|KONSTRUKSI|DAN)[A-Z0-9\.\-_/]*)/i)
    || text.match(/(?:No(?:mor|\.)?\s*(?:SPBJ|Kontrak|Perjanjian)\s*[:\.]?\s*)([A-Z0-9\.\-/_]{6,})/i)
    || text.match(/SPBJ[\s\w]*[:\.]\s*([^\n\r]+)/i);
  if (spbjMatch) {
    noSPBJ = spbjMatch[1].trim();
  } else {
    noSPBJ = `0${Math.floor(100 + Math.random() * 900)}.PJ/KON.01/UP3/${new Date().getFullYear()}`;
  }

  // 2. Nilai Kontrak / Total RAB
  let nilaiKontrak = 0;
  const nilaiMatch = text.match(/(?:Total\s*(?:Biaya|RAB|Kontrak|Harga|Nilai)?|Nilai\s*Kontrak|Biaya\s*Pekerjaan)[\s\w]*[:\.]?\s*Rp?[\s\.]*([\d\.,]+)/i)
    || text.match(/Rp[\s\.]*([\d]{1,3}(?:\.[\d]{3}){1,4})/i);
  if (nilaiMatch) {
    const rawNum = nilaiMatch[1].replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 1000) {
      nilaiKontrak = parsed;
    }
  }
  if (!nilaiKontrak) {
    // Search any large number that looks like currency in IDR (millions)
    const matches = text.match(/Rp\s*([\d\.\,]+)/gi);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        const cleaned = m.replace(/[^\d]/g, '');
        const val = parseInt(cleaned, 10);
        if (val > nilaiKontrak && val >= 5000000) {
          nilaiKontrak = val;
        }
      }
    }
  }
  if (!nilaiKontrak) {
    nilaiKontrak = 450000000;
  }

  // 3. Nama Pekerjaan
  let namaPekerjaan = '';
  const judulMatch = text.match(/(?:Nama\s*Pekerjaan|Pekerjaan|Perihal|Tentang|Uraian\s*Pekerjaan)\s*[:\.]?\s*([^\n\r]{10,120})/i);
  if (judulMatch) {
    namaPekerjaan = judulMatch[1].trim();
  } else {
    // Search first line containing electrical keywords
    const candidate = lines.find(l => 
      /(?:SKTM|SUTM|Trafo|Gardu|Kabel|JTR|Pemasangan|Penarikan|Grounding|Panel|ATS|Cubicle)/i.test(l) &&
      !/(?:PT PLN|SURAT|PERJANJIAN|LAMPIRAN)/i.test(l)
    );
    namaPekerjaan = candidate || 'Pekerjaan Kelistrikan Distribusi SPBJ';
  }

  // 4. Lokasi
  let lokasi = '';
  const lokasiMatch = text.match(/(?:Lokasi|Wilayah|Tempat\s*Pekerjaan|Area)\s*[:\.]?\s*([^\n\r]{5,100})/i);
  if (lokasiMatch) {
    lokasi = lokasiMatch[1].trim();
  } else {
    const candidate = lines.find(l => /(?:Gardu|Jl\.|Jalan|Penyulang|Kawasan|GI |Kecamatan|Kabupaten)/i.test(l));
    lokasi = candidate || 'Wilayah Kerja Distribusi UP3';
  }

  // 5. PIC Direksi
  let pic = 'Ir. Bambang Santoso, ST';
  let picKontak = '0812-3456-7890';
  const picMatch = text.match(/(?:PIC|Direksi\s*Pekerjaan|Pengawas\s*Lapangan|Pejabat\s*Pelaksana)\s*[:\.]?\s*([^\r\n]{3,60})/i);
  if (picMatch) {
    pic = picMatch[1].split(/[\r\n]/)[0].replace(/(?:Nomor|Telp|HP|Alamat|Mandor|Manpower).*/i, '').trim();
  }

  // 6. Mandor / Kontraktor
  let mandor = 'Pak Supardi';
  let mandorKontak = '0821-9876-5432';
  const mandorMatch = text.match(/(?:Mandor|Pelaksana\s*Lapangan|Penyedia|Penanggung\s*Jawab|Kontraktor)\s*[:\.]?\s*([^\r\n]{3,60})/i);
  if (mandorMatch) {
    mandor = mandorMatch[1].split(/[\r\n]/)[0].replace(/(?:Nomor|Telp|HP|Alamat|Manpower|Tenaga).*/i, '').trim();
  }

  // 7. Kategori Pekerjaan
  let kategori: ExtractedSPBJData['kategori'] = 'TM';
  const lower = text.toLowerCase();
  if (lower.includes('trafo') || lower.includes('gardu')) {
    kategori = 'Gardu';
  } else if (lower.includes('panel') || lower.includes('lvm dp') || lower.includes('ats') || lower.includes('cubicle')) {
    kategori = 'Panel';
  } else if (lower.includes('grounding') || lower.includes('petir') || lower.includes('pentanahan')) {
    kategori = 'Grounding';
  } else if (lower.includes('jtr') || lower.includes('tegangan rendah') || lower.includes('380v') || lower.includes('sambungan rumah')) {
    kategori = 'TR';
  } else if (lower.includes('tiang') || lower.includes('sutm') || lower.includes('rekonfigurasi') || lower.includes('jaringan')) {
    kategori = 'Jaringan';
  } else {
    kategori = 'TM';
  }

  // 8. Status Manuver
  let statusManuver: ExtractedSPBJData['statusManuver'] = 'BEBAS_TEGANGAN';
  if (lower.includes('padam') || lower.includes('padam terencana')) {
    statusManuver = 'PADAM_TERENCANA';
  } else if (lower.includes('pdkb') || lower.includes('bertegangan') || lower.includes('tanpa padam')) {
    statusManuver = 'BERTEGANGAN';
  }

  // 9. Manpower
  let totalManpower = 8;
  const mpMatch = text.match(/(?:Manpower|Tenaga\s*Kerja|Personil|Jumlah\s*Pekerja)\s*[:\.]?\s*(\d{1,3})\s*(?:Orang|Personil|Orang\/Hari)?/i);
  if (mpMatch) {
    totalManpower = parseInt(mpMatch[1], 10) || 8;
  }
  const teknisi = Math.max(2, Math.round(totalManpower * 0.5));
  const helper = Math.max(1, totalManpower - teknisi - 2);

  // 10. Items RAB & Material
  const itemsRAB: ExtractedSPBJData['itemsRAB'] = [];
  const materialRegex = /(?:Kabel|Trafo|Tiang|Jointing|Termination|Isolator|Arrester|Fuse|MCCB|Grounding|Conductor|Sepatu\s*Kabel)[^\n\r]+/gi;
  const matMatches = text.match(materialRegex) || [];
  
  matMatches.slice(0, 8).forEach((itemLine) => {
    // Attempt to extract volume & unit
    const volMatch = itemLine.match(/(\d+(?:[.,]\d+)?)\s*(meter|m|unit|set|buah|btg|batang|titik|roll|kg)/i);
    let volume = 1;
    let satuan = 'unit';
    let namaMat = itemLine.trim();

    if (volMatch) {
      volume = parseFloat(volMatch[1].replace(',', '.')) || 1;
      satuan = volMatch[2].toLowerCase();
      namaMat = itemLine.replace(volMatch[0], '').replace(/^[0-9\.\-\s]+/, '').trim();
    }

    if (namaMat.length > 3) {
      itemsRAB.push({
        namaMaterial: namaMat.slice(0, 60),
        volume: volume || 1,
        satuan: satuan || 'unit',
        spesifikasi: 'Sesuai Standar SPLN / SPBJ',
      });
    }
  });

  // Default fallback materials if none found in raw text
  if (itemsRAB.length === 0) {
    if (kategori === 'TM') {
      itemsRAB.push(
        { namaMaterial: 'Kabel SKTM 20kV XLPE 3x300mm²', volume: 450, satuan: 'meter', spesifikasi: 'SPLN Cu/XLPE/CTS/PVC' },
        { namaMaterial: 'Indoor Termination Kit 20kV 3x300mm²', volume: 2, satuan: 'set', spesifikasi: 'Heat Shrink 24kV' },
        { namaMaterial: 'Straight Jointing Kit 20kV 3x300mm²', volume: 2, satuan: 'set', spesifikasi: 'Cold Shrink 24kV' }
      );
    } else if (kategori === 'Gardu') {
      itemsRAB.push(
        { namaMaterial: 'Trafo Distribusi 3 Phasa 20kV/400V 630 kVA', volume: 1, satuan: 'unit', spesifikasi: 'Hermetically Sealed Dyn5' },
        { namaMaterial: 'Cut Out Lightning Arrester 24kV 10kA', volume: 3, satuan: 'set', spesifikasi: 'Polymeric MOV' },
        { namaMaterial: 'Low Voltage Distribution Panel (LVDP) 4 Jurusan', volume: 1, satuan: 'unit', spesifikasi: 'IP54 Outdoor Busbar 1000A' }
      );
    } else {
      itemsRAB.push(
        { namaMaterial: 'Tiang Beton 12 Meter 350 daN', volume: 6, satuan: 'batang', spesifikasi: 'Kekuatan 350 daN SNI' },
        { namaMaterial: 'Kabel Twisted TR 4x70mm²', volume: 320, satuan: 'meter', spesifikasi: 'LV Twisted Cable Al/XLPE' },
        { namaMaterial: 'Grounding Rod Tembaga 5/8" x 3 Meter', volume: 4, satuan: 'batang', spesifikasi: 'Tembaga Murni 99%' }
      );
    }
  }

  const today = new Date();
  const startStr = today.toISOString().slice(0, 10);
  const finishDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const finishStr = finishDate.toISOString().slice(0, 10);

  return {
    namaPekerjaan,
    noSPBJ,
    lokasi,
    nilaiKontrak,
    kategori,
    statusManuver,
    pic,
    picKontak,
    mandor,
    mandorKontak,
    manpower: {
      total: totalManpower,
      teknisiListrik: teknisi,
      helper: helper,
      hseOfficer: 1,
      operatorAlat: 1,
    },
    tanggalMulai: startStr,
    targetSelesai: finishStr,
    catatanHarian: `Hasil import & konversi dokumen SPBJ nomor ${noSPBJ}. Pekerjaan: ${namaPekerjaan}`,
    itemsRAB,
    method: 'pdf_parse_heuristic',
  };
}

// Gemini AI-powered deep extractor with automatic fallback across models
async function extractWithGemini(pdfBase64: string, apiKey: string): Promise<ExtractedSPBJData> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Anda adalah asisten ahli administrasi teknik ketenagalistrikan PT PLN (Persero).
Tugas Anda adalah membaca dan menganalisis berkas PDF dokumen SPBJ (Surat Perjanjian Pemborongan Pekerjaan) atau RAB (Rencana Anggaran Biaya).
Ekstrak semua informasi inti dari dokumen ini dan kembalikan secara HANYA DALAM FORMAT JSON murni (valid JSON, tanpa markdown formatting, tanpa penjelasan tambahan).

Format JSON yang diwajibkan:
{
  "namaPekerjaan": "Nama lengkap pekerjaan pemborongan kelistrikan",
  "noSPBJ": "Nomor SPBJ / Kontrak lengkap",
  "lokasi": "Lokasi spesifik pekerjaan (Gardu, Penyulang, Jalan, Kota)",
  "nilaiKontrak": 850000000, // angka bulat nilai kontrak/RAB dalam IDR (tanpa simbol Rp)
  "kategori": "TM", // pilih salah satu: "TM" | "TR" | "Gardu" | "Panel" | "Jaringan" | "Grounding"
  "statusManuver": "BEBAS_TEGANGAN", // pilih salah satu: "BEBAS_TEGANGAN" | "BERTEGANGAN" | "PADAM_TERENCANA"
  "pic": "Nama Direksi/Pengawas PLN",
  "picKontak": "Nomor telepon PIC jika ditemukan atau kosongkan",
  "mandor": "Nama Mandor/Pelaksana Kontraktor",
  "mandorKontak": "Nomor kontak pelaksana",
  "manpower": {
    "total": 8, // estimasi jumlah tenaga kerja total
    "teknisiListrik": 4,
    "helper": 2,
    "hseOfficer": 1,
    "operatorAlat": 1
  },
  "tanggalMulai": "YYYY-MM-DD",
  "targetSelesai": "YYYY-MM-DD",
  "catatanHarian": "Ringkasan ruang lingkup pekerjaan dari SPBJ/RAB",
  "itemsRAB": [
    {
      "namaMaterial": "Nama material / uraian item pekerjaan",
      "volume": 100,
      "satuan": "meter",
      "spesifikasi": "Spesifikasi teknis",
      "hargaSatuan": 50000,
      "totalHarga": 5000000
    }
  ]
}
Catatan: Pastikan nilaiKontrak bertipe number bulat murni. Jika tanggal tidak tertulis eksplisit, gunakan perkiraan wajar berdasarkan durasi pekerjaan.`;

  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      });

      const rawText = response.text || '';
      const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        ...parsed,
        method: `gemini_ai (${model})`,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[SPBJ Import] Model ${model} mengalami kendala (${err?.message || err?.status || 'error'}). Mencoba opsi berikutnya...`);
    }
  }

  throw lastError || new Error('Semua model Gemini AI sedang sibuk');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API 1: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // API 2: Parse SPBJ / RAB PDF
  app.post("/api/parse-spbj-pdf", async (req, res) => {
    try {
      const { fileBase64, textContent, fileName } = req.body;

      if (!fileBase64 && !textContent) {
        return res.status(400).json({ 
          error: "Harap sertakan file PDF (base64) atau teks isi dokumen SPBJ/RAB." 
        });
      }

      let result: ExtractedSPBJData | null = null;
      let usedGeminiModel: string | null = null;

      // 1. Try Gemini AI if API Key is available and PDF base64 is provided
      if (process.env.GEMINI_API_KEY && fileBase64) {
        try {
          console.log(`[SPBJ Import] Menggunakan Gemini AI untuk analisis PDF: ${fileName || 'dokumen.pdf'}`);
          result = await extractWithGemini(fileBase64, process.env.GEMINI_API_KEY);
          usedGeminiModel = result.method || 'gemini_ai';
        } catch (geminiError: any) {
          console.warn("[SPBJ Import] Gemini gagal atau kuota terbatas, beralih ke fallback parser:", geminiError?.message || geminiError);
        }
      }

      // 2. If Gemini was not used or failed, use PDF extraction on base64 buffer
      if (!result && fileBase64) {
        try {
          console.log(`[SPBJ Import] Menggunakan engine PDF parser untuk ekstraksi teks berkas: ${fileName || 'dokumen.pdf'}`);
          const buffer = Buffer.from(fileBase64, 'base64');
          const pdfText = await extractPDFTextFromBuffer(buffer);
          if (pdfText && pdfText.trim().length > 0) {
            result = extractFromPlainText(pdfText);
          } else {
            console.warn('[SPBJ Import] Teks PDF kosong atau berupa gambar scan murni, menggunakan fallback nama berkas');
          }
        } catch (pdfParseError) {
          console.error("[SPBJ Import] Error parsing PDF buffer:", pdfParseError);
        }
      }

      // 3. If textContent was sent directly or fallback
      if (!result && textContent) {
        result = extractFromPlainText(textContent);
      }

      // 4. Default fallback if both failed
      if (!result) {
        result = extractFromPlainText(fileName || 'SPBJ Pekerjaan Kelistrikan PLN');
      }

      return res.json({
        success: true,
        data: result,
        engine: usedGeminiModel ? `Gemini AI (${usedGeminiModel})` : "PDF Text Parser Engine (Fallback)",
      });
    } catch (err: any) {
      console.error("[SPBJ Import] Unhandled error:", err);
      return res.status(500).json({ 
        error: "Gagal memproses dokumen SPBJ/RAB", 
        details: err?.message || String(err) 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server PLN Project Monitoring berjalan di http://localhost:${PORT}`);
  });
}

startServer();
