import PptxGenJS from 'pptxgenjs';
import { 
  ProjectItem, 
  MaterialRequest, 
  MaterialShipment, 
  ForemanItem, 
  WorkPlan, 
  MasterMaterialItem 
} from '../types';
import { formatDateIndo, formatRupiah, formatShortRupiah } from './formatters';

// Color Palette
const COLORS = {
  primaryDark: '0F172A', // Slate 900
  secondaryDark: '1E293B', // Slate 800
  accentAmber: 'D97706', // Amber 600
  gold: 'F59E0B', // Amber 500
  accentBlue: '2563EB', // Blue 600
  accentGreen: '10B981', // Emerald 500
  accentOrange: 'EA580C', // Orange 600
  accentRed: 'EF4444', // Red 500
  bgLight: 'F8FAFC', // Slate 50
  cardBg: 'FFFFFF',
  textPrimary: '0F172A',
  textSecondary: '475569',
  textMuted: '64748B',
  borderLight: 'E2E8F0',
  tableHeaderBg: '1E293B',
  tableAltRow: 'F8FAFC',
};

// Common header & footer builder
function addSlideHeaderFooter(
  slide: PptxGenJS.Slide,
  title: string,
  subtitle: string,
  categoryBadge = 'SISTEM MONITORING ME'
) {
  // Top Accent Bar
  slide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.12,
    fill: { color: COLORS.gold },
    line: { color: COLORS.gold },
  });

  // Category Pill Badge
  slide.addShape('roundRect' as unknown as PptxGenJS.ShapeType, {
    x: 0.6,
    y: 0.35,
    w: 2.5,
    h: 0.28,
    rectRadius: 0.14,
    fill: { color: COLORS.primaryDark },
    line: { color: COLORS.primaryDark },
  });
  slide.addText(categoryBadge.toUpperCase(), {
    x: 0.6,
    y: 0.35,
    w: 2.5,
    h: 0.28,
    fontSize: 8,
    bold: true,
    color: 'F59E0B',
    align: 'center',
    valign: 'middle',
  });

  // Slide Title
  slide.addText(title, {
    x: 0.6,
    y: 0.68,
    w: 8.8,
    h: 0.45,
    fontSize: 17,
    bold: true,
    color: COLORS.textPrimary,
    fontFace: 'Arial',
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.25,
      fontSize: 9.5,
      color: COLORS.textSecondary,
      fontFace: 'Arial',
    });
  }

  // Footer Line
  slide.addShape('line' as unknown as PptxGenJS.ShapeType, {
    x: 0.6,
    y: 5.1,
    w: 8.8,
    h: 0,
    line: { color: COLORS.borderLight, width: 1 },
  });

  // Footer Left: Company Name
  slide.addText('PT SAPTA MANUNGGAL KARYA • DIVISI MECHANICAL ELECTRICAL', {
    x: 0.6,
    y: 5.15,
    w: 5.5,
    h: 0.3,
    fontSize: 8,
    bold: true,
    color: COLORS.textMuted,
  });

  // Footer Right: Date
  slide.addText(`Tanggal: ${formatDateIndo(new Date().toISOString().slice(0, 10))}`, {
    x: 6.2,
    y: 5.15,
    w: 3.2,
    h: 0.3,
    fontSize: 8,
    align: 'right',
    color: COLORS.textMuted,
  });
}

// 1. Cover Slide Creator
function addCoverSlide(
  pptx: PptxGenJS,
  mainTitle: string,
  subTitle: string,
  extraDetails?: { label: string; val: string }[]
) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primaryDark };

  // Top decorative amber stripe
  slide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.18,
    fill: { color: COLORS.gold },
    line: { color: COLORS.gold },
  });

  // Small Badge
  slide.addShape('roundRect' as unknown as PptxGenJS.ShapeType, {
    x: 1.0,
    y: 1.1,
    w: 3.8,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: '1E293B' },
    line: { color: '334155' },
  });
  slide.addText('⚡ EXECUTIVE PRESENTATION & MONITORING', {
    x: 1.0,
    y: 1.1,
    w: 3.8,
    h: 0.35,
    fontSize: 9,
    bold: true,
    color: COLORS.gold,
    align: 'center',
    valign: 'middle',
  });

  // Main Title
  slide.addText(mainTitle, {
    x: 1.0,
    y: 1.6,
    w: 8.0,
    h: 1.1,
    fontSize: 26,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
  });

  // Subtitle
  slide.addText(subTitle, {
    x: 1.0,
    y: 2.7,
    w: 8.0,
    h: 0.6,
    fontSize: 13,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  // Divider Line
  slide.addShape('line' as unknown as PptxGenJS.ShapeType, {
    x: 1.0,
    y: 3.45,
    w: 8.0,
    h: 0,
    line: { color: '334155', width: 1.5 },
  });

  // Company Details
  slide.addText('PT SAPTA MANUNGGAL KARYA', {
    x: 1.0,
    y: 3.65,
    w: 5.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: 'F1F5F9',
  });
  slide.addText('Divisi Mechanical Electrical • Standar Keselamatan K3 & SPBJ PLN', {
    x: 1.0,
    y: 3.95,
    w: 5.0,
    h: 0.3,
    fontSize: 9.5,
    color: '94A3B8',
  });

  // Extra Details Box (e.g. summary pills on the right)
  if (extraDetails && extraDetails.length > 0) {
    let startY = 3.6;
    extraDetails.forEach((item) => {
      slide.addText(`${item.label}:`, {
        x: 6.2,
        y: startY,
        w: 1.8,
        h: 0.25,
        fontSize: 9,
        bold: true,
        color: '94A3B8',
        align: 'right',
      });
      slide.addText(item.val, {
        x: 8.1,
        y: startY,
        w: 1.4,
        h: 0.25,
        fontSize: 9,
        bold: true,
        color: COLORS.gold,
      });
      startY += 0.28;
    });
  }

  // Footer stamp
  slide.addText(`Dicetak pada: ${formatDateIndo(new Date().toISOString().slice(0, 10))} • Format Presentasi Resmi PPTX`, {
    x: 1.0,
    y: 4.9,
    w: 8.0,
    h: 0.3,
    fontSize: 8.5,
    color: '64748B',
  });
}

// ----------------------------------------------------
// 1. PPT EXPORT: MONITORING PEKERJAAN (SPBJ)
// ----------------------------------------------------
export const generateProjectsPPT = async (projects: ProjectItem[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Laporan Monitoring Pekerjaan SPBJ - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';
  pptx.company = 'Divisi Mechanical Electrical';

  const totalNilai = projects.reduce((acc, p) => acc + p.nilaiKontrak, 0);
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progressRealisasi, 0) / projects.length)
    : 0;
  const onProgressCount = projects.filter((p) => p.status === 'ON_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'MONITORING PEKERJAAN & PROGRES SPBJ',
    'Rekapitulasi Paket Proyek Mechanical Electrical, Nilai Kontrak & Progres Lapangan',
    [
      { label: 'Total Paket', val: `${projects.length} SPBJ` },
      { label: 'Total Nilai', val: formatShortRupiah(totalNilai) },
      { label: 'Avg Progres', val: `${avgProgress}%` },
    ]
  );

  // Slide 2: Executive Summary Cards
  const summarySlide = pptx.addSlide();
  summarySlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    summarySlide,
    'Ringkasan Eksekutif Portfolio SPBJ',
    'Overview seluruh kontrak pekerjaan kelistrikan aktif PT Sapta Manunggal Karya',
    'Monitoring SPBJ'
  );

  // 4 KPI Cards
  const cards = [
    { label: 'TOTAL NILAI KONTRAK', val: formatShortRupiah(totalNilai), sub: `${projects.length} Paket SPBJ Terdaftar`, color: COLORS.accentAmber },
    { label: 'RATA-RATA PROGRES', val: `${avgProgress}%`, sub: 'Realisasi fisik lapangan', color: COLORS.accentBlue },
    { label: 'PROYEK BERJALAN', val: `${onProgressCount} Paket`, sub: 'Aktif pengerjaan site', color: COLORS.accentOrange },
    { label: 'PROYEK SELESAI', val: `${completedCount} Paket`, sub: 'Siap BAST / Komisioning', color: COLORS.accentGreen },
  ];

  cards.forEach((card, idx) => {
    const cardX = 0.6 + idx * 2.25;
    summarySlide.addShape('roundRect' as unknown as PptxGenJS.ShapeType, {
      x: cardX,
      y: 1.5,
      w: 2.1,
      h: 1.5,
      rectRadius: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.borderLight, width: 1 },
    });
    // Top colored indicator
    summarySlide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
      x: cardX,
      y: 1.5,
      w: 2.1,
      h: 0.08,
      fill: { color: card.color },
      line: { color: card.color },
    });
    summarySlide.addText(card.label, {
      x: cardX + 0.15,
      y: 1.68,
      w: 1.8,
      h: 0.25,
      fontSize: 8,
      bold: true,
      color: COLORS.textMuted,
    });
    summarySlide.addText(card.val, {
      x: cardX + 0.15,
      y: 1.95,
      w: 1.8,
      h: 0.55,
      fontSize: 16,
      bold: true,
      color: COLORS.textPrimary,
    });
    summarySlide.addText(card.sub, {
      x: cardX + 0.15,
      y: 2.55,
      w: 1.8,
      h: 0.3,
      fontSize: 8,
      color: COLORS.textSecondary,
    });
  });

  // Table summary of all projects (Chunked by 6 per slide)
  const chunkSize = 6;
  for (let i = 0; i < projects.length; i += chunkSize) {
    const chunk = projects.slice(i, i + chunkSize);
    const tableSlide = pptx.addSlide();
    tableSlide.background = { color: COLORS.bgLight };
    addSlideHeaderFooter(
      tableSlide,
      `Daftar Paket SPBJ (Halaman ${Math.floor(i / chunkSize) + 1})`,
      'Rincian nomor SPBJ, nama pekerjaan, lokasi, nilai kontrak, PIC & mandor pelaksana',
      'Data Proyek SPBJ'
    );

    const tableRows: PptxGenJS.TableRow[] = [
      [
        { text: 'No SPBJ / Paket', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Lokasi & Sistem', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Nilai Kontrak', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'right' } },
        { text: 'Rencana vs Realisasi', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'PIC / Mandor', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      ],
    ];

    chunk.forEach((p, idx) => {
      const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
      const statusText = p.status === 'COMPLETED' ? 'SELESAI' : p.status === 'ON_PROGRESS' ? 'BERJALAN' : p.status === 'DELAYED' ? 'TERKENDALA' : 'PENDING';
      
      tableRows.push([
        {
          text: `${p.noSPBJ}\n${p.namaPekerjaan}`,
          options: { fill: { color: rowFill }, fontSize: 8, bold: true, color: COLORS.textPrimary },
        },
        {
          text: `${p.lokasi}\nKat: ${p.kategori}`,
          options: { fill: { color: rowFill }, fontSize: 8, color: COLORS.textSecondary },
        },
        {
          text: formatRupiah(p.nilaiKontrak),
          options: { fill: { color: rowFill }, fontSize: 8, bold: true, color: COLORS.accentAmber, align: 'right' },
        },
        {
          text: `Renc: ${p.progressRencana}%\nReal: ${p.progressRealisasi}%`,
          options: { fill: { color: rowFill }, fontSize: 8, bold: true, color: p.progressRealisasi >= p.progressRencana ? '10B981' : 'EF4444', align: 'center' },
        },
        {
          text: `PIC: ${p.pic}\nMandor: ${p.mandor}`,
          options: { fill: { color: rowFill }, fontSize: 8, color: COLORS.textSecondary },
        },
        {
          text: statusText,
          options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: p.status === 'COMPLETED' ? '10B981' : '2563EB' },
        },
      ]);
    });

    tableSlide.addTable(tableRows, {
      x: 0.6,
      y: 1.5,
      w: 8.8,
      colW: [2.5, 1.8, 1.3, 1.1, 1.2, 0.9],
      rowH: 0.45,
      border: { pt: 0.5, color: COLORS.borderLight },
    });
  }

  const fileName = `PPT_Monitoring_Pekerjaan_SPBJ_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 2. PPT EXPORT: TIMELINE & FASE KERJA
// ----------------------------------------------------
export const generateTimelinePPT = async (projects: ProjectItem[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Timeline & Realisasi Fase Kerja - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'TIMELINE & FASE KERJA PEKERJAAN',
    'Matriks Tahapan Proyek, Realisasi Milestone & Rekap Material Terpasang di Site',
    [
      { label: 'Total Proyek', val: `${projects.length} Paket` },
      { label: 'Standar Fase', val: '6 Tahap Baku' },
    ]
  );

  // Slide per project or chunk of projects
  projects.forEach((proj, pIdx) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgLight };
    addSlideHeaderFooter(
      slide,
      `Timeline: ${proj.namaPekerjaan}`,
      `No SPBJ: ${proj.noSPBJ} • Lokasi: ${proj.lokasi} • PIC: ${proj.pic}`,
      `Fase Proyek #${pIdx + 1}`
    );

    // Phases summary table
    const phases = proj.timelinePhases || [];
    const tableRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Fase Pekerjaan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Target Jadwal', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Durasi', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Progres', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Penanggung Jawab', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Status Fase', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      ],
    ];

    if (phases.length === 0) {
      tableRows.push([
        { text: '1. Persiapan & Survey', options: { fill: { color: 'FFFFFF' }, fontSize: 8, bold: true } },
        { text: proj.tanggalMulai, options: { fill: { color: 'FFFFFF' }, fontSize: 8 } },
        { text: '3 Hari', options: { fill: { color: 'FFFFFF' }, fontSize: 8, align: 'center' } },
        { text: `${proj.progressRealisasi}%`, options: { fill: { color: 'FFFFFF' }, fontSize: 8, align: 'center', bold: true } },
        { text: proj.pic, options: { fill: { color: 'FFFFFF' }, fontSize: 8 } },
        { text: 'TERJADWAL', options: { fill: { color: 'FFFFFF' }, fontSize: 8, align: 'center', bold: true } },
      ]);
    } else {
      phases.forEach((ph, idx) => {
        const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
        tableRows.push([
          { text: `${ph.judulFase}\n${ph.subJudul}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
          { text: `${ph.tanggalMulai} s/d\n${ph.tanggalSelesai}`, options: { fill: { color: rowFill }, fontSize: 7.5 } },
          { text: `${ph.durasiHari} Hari`, options: { fill: { color: rowFill }, fontSize: 8, align: 'center' } },
          { text: `${ph.progress}%`, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: ph.progress === 100 ? '10B981' : '2563EB' } },
          { text: ph.penanggungJawab || proj.pic, options: { fill: { color: rowFill }, fontSize: 8 } },
          { text: ph.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
        ]);
      });
    }

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.5,
      w: 8.8,
      colW: [2.8, 1.8, 0.8, 0.8, 1.4, 1.2],
      rowH: 0.42,
      border: { pt: 0.5, color: COLORS.borderLight },
    });
  });

  const fileName = `PPT_Timeline_Fase_Kerja_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 3. PPT EXPORT: RENCANA KERJA LAPANGAN (WORK PLANS)
// ----------------------------------------------------
export const generateWorkPlansPPT = async (workPlans: WorkPlan[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Rencana Kerja Lapangan - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  const totalItems = workPlans.reduce((acc, wp) => acc + (wp.items?.length || 0), 0);

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'RENCANA KERJA LAPANGAN (WORK PLAN)',
    'Target Uraian Pekerjaan Harian/Mingguan, Kesiapan APD K3 & Alokasi Manpower Mandor',
    [
      { label: 'Total Dokumen', val: `${workPlans.length} Rencana` },
      { label: 'Total Item Target', val: `${totalItems} Uraian` },
    ]
  );

  // Slide per Work Plan
  workPlans.forEach((plan, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgLight };
    addSlideHeaderFooter(
      slide,
      `Rencana Kerja: ${plan.judulRencana}`,
      `No: ${plan.nomorRencana} • Tgl: ${formatDateIndo(plan.tanggal)} • Lokasi: ${plan.lokasi}`,
      `Work Plan #${idx + 1}`
    );

    // Meta Box on Top
    slide.addShape('roundRect' as unknown as PptxGenJS.ShapeType, {
      x: 0.6,
      y: 1.45,
      w: 8.8,
      h: 0.65,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.borderLight, width: 1 },
    });
    slide.addText(
      `Mandor: ${plan.mandor} (${plan.manpowerCount} Manpower) | PIC: ${plan.pic} | Status: ${plan.status} | SPBJ: ${plan.noSPBJ || '-'}`,
      {
        x: 0.8,
        y: 1.55,
        w: 8.4,
        h: 0.22,
        fontSize: 8.5,
        bold: true,
        color: COLORS.textPrimary,
      }
    );
    slide.addText(
      `Alat Kerja: ${plan.alatKerja || 'Standar Alat ME'} | Catatan K3: ${plan.catatanK3 || 'Gunakan APD Lengkap & SOP'}`,
      {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        h: 0.22,
        fontSize: 8,
        color: COLORS.textSecondary,
      }
    );

    // Items Table
    const items = plan.items || [];
    const tableRows: PptxGenJS.TableRow[] = [
      [
        { text: 'No', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Uraian Pekerjaan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Kategori', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Volume Target', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Target Waktu', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Status Item', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      ],
    ];

    items.forEach((it, itIdx) => {
      const rowFill = itIdx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
      tableRows.push([
        { text: `${itIdx + 1}`, options: { fill: { color: rowFill }, fontSize: 8, align: 'center' } },
        { text: it.uraianPekerjaan, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
        { text: it.kategori || 'Elektrikal', options: { fill: { color: rowFill }, fontSize: 8 } },
        { text: `${it.volume} ${it.satuan}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
        { text: it.targetWaktu || 'Shift Pagi', options: { fill: { color: rowFill }, fontSize: 8, align: 'center' } },
        { text: it.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: it.status === 'SELESAI' ? '10B981' : '2563EB' } },
      ]);
    });

    slide.addTable(tableRows, {
      x: 0.6,
      y: 2.25,
      w: 8.8,
      colW: [0.5, 3.8, 1.3, 1.2, 1.0, 1.0],
      rowH: 0.38,
      border: { pt: 0.5, color: COLORS.borderLight },
    });
  });

  const fileName = `PPT_Rencana_Kerja_Lapangan_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 4. PPT EXPORT: KEBUTUHAN MATERIAL (BON MDU / NON-MDU)
// ----------------------------------------------------
export const generateMaterialRequestsPPT = async (requests: MaterialRequest[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Kebutuhan Material Bon MDU & Non-MDU - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'KEBUTUHAN MATERIAL (BON MDU & NON-MDU)',
    'Permintaan Penarikan Material dari Gudang Logistik PLN untuk Pelaksanaan SPBJ',
    [
      { label: 'Total Bon Permintaan', val: `${requests.length} Dokumen` },
      { label: 'Kategori', val: 'MDU & Non-MDU' },
    ]
  );

  // Summary Slide
  const sumSlide = pptx.addSlide();
  sumSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    sumSlide,
    'Daftar Pengajuan Bon Permintaan Material',
    'Rekapitulasi nomor bon, paket pekerjaan, pemohon mandor & status approval',
    'Kebutuhan Material'
  );

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: 'No Bon Permintaan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Pekerjaan & No SPBJ', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Lokasi Proyek', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Pemohon / Mandor', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Jml Item', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'Status Approval', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  requests.forEach((r, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    const totalItems = (r.itemsMDU?.length || 0) + (r.itemsNonMDU?.length || 0);
    tableRows.push([
      { text: `${r.nomorPermintaan}\nTgl: ${r.tanggalPermintaan}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: `${r.pekerjaan}\nSPBJ: ${r.noSPBJ}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: r.lokasi, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${r.pemohon}\nPengawas: ${r.direksiPengawas}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${totalItems} item`, options: { fill: { color: rowFill }, fontSize: 8, align: 'center', bold: true } },
      { text: r.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: r.status === 'DIKELUARKAN' || r.status === 'DISETUJUI' ? '10B981' : 'F59E0B' } },
    ]);
  });

  sumSlide.addTable(tableRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [1.8, 2.4, 1.6, 1.4, 0.8, 0.8],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  const fileName = `PPT_Kebutuhan_Material_Bon_MDU_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 5. PPT EXPORT: PENGIRIMAN MATERIAL (SURAT JALAN)
// ----------------------------------------------------
export const generateShipmentsPPT = async (shipments: MaterialShipment[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Pengiriman Material & Surat Jalan - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'LOGISTIK & PENGIRIMAN MATERIAL',
    'Tracking Surat Jalan Ekspedisi, Armada Kendaraan, Driver & Status Penerimaan Material di Site',
    [
      { label: 'Total Surat Jalan', val: `${shipments.length} Pengiriman` },
      { label: 'Status Armada', val: 'Internal & Ekspedisi' },
    ]
  );

  // Summary Table Slide
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    slide,
    'Daftar Surat Jalan & Logistik Pengiriman',
    'Informasi nomor surat jalan, driver, armada, rute gudang dan status muatan',
    'Pengiriman Material'
  );

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: 'No Surat Jalan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Pekerjaan & Tujuan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Ekspedisi & Armada', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Driver & Kontak', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Muatan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'Status Kirim', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  shipments.forEach((s, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    tableRows.push([
      { text: `${s.nomorSuratJalan}\nTgl: ${s.tanggalKirim}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: `${s.pekerjaan}\nKe: ${s.lokasiTujuan}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${s.namaEkspedisi}\n${s.jenisArmada} (${s.nomorPolisi})`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${s.namaDriver}\n${s.kontakDriver || '-'}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${s.items?.length || 0} item`, options: { fill: { color: rowFill }, fontSize: 8, align: 'center', bold: true } },
      { text: s.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: s.status === 'TERKIRIM' ? '10B981' : '2563EB' } },
    ]);
  });

  slide.addTable(tableRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [1.8, 2.2, 1.8, 1.4, 0.8, 0.8],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  const fileName = `PPT_Pengiriman_Material_Surat_Jalan_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 6. PPT EXPORT: DATA MANDOR & MANPOWER
// ----------------------------------------------------
export const generateForemenPPT = async (foremen: ForemanItem[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Data Mandor & Manpower Lapangan - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  const totalManpower = foremen.reduce((acc, f) => acc + (f.jumlahAnggota || 0), 0);

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'DATA MANDOR & MANPOWER LAPANGAN',
    'Manajemen Tenaga Kerja Lapangan, Sertifikasi K3, Spesialisasi & Penugasan Multi-Lokasi/PIC',
    [
      { label: 'Total Mandor', val: `${foremen.length} Mandor` },
      { label: 'Total Manpower', val: `${totalManpower} Personil` },
    ]
  );

  // Slide 2: Table
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    slide,
    'Daftar Mandor & Penugasan Lapangan',
    'Data kontak mandor, spesialisasi pekerjaan, jumlah personil aktif dan penugasan proyek',
    'Data Mandor'
  );

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Nama Mandor', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Kontak HP/WA', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Spesialisasi Keahlian', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Manpower', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'Penugasan Lokasi & PIC', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  foremen.forEach((f, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    const assignText = f.assignments && f.assignments.length > 0
      ? f.assignments.map((a) => `${a.lokasiPekerjaan} (PIC: ${a.pic})`).join('\n')
      : 'Belum ada penugasan';

    tableRows.push([
      { text: f.namaMandor, options: { fill: { color: rowFill }, fontSize: 8.5, bold: true } },
      { text: f.kontak, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: f.spesialisasi || 'Instalasi Elektrikal', options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${f.jumlahAnggota || 0} Orang`, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
      { text: assignText, options: { fill: { color: rowFill }, fontSize: 7.5 } },
      { text: f.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: f.status === 'AKTIF' ? '10B981' : '64748B' } },
    ]);
  });

  slide.addTable(tableRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [1.8, 1.2, 1.8, 0.9, 2.3, 0.8],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  const fileName = `PPT_Data_Mandor_Manpower_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 7. PPT EXPORT: MASTER DATA MATERIAL
// ----------------------------------------------------
export const generateMasterMaterialsPPT = async (materials: MasterMaterialItem[]) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Master Data Material MDU & Non-MDU - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';

  // Slide 1: Cover
  addCoverSlide(
    pptx,
    'MASTER DATA MATERIAL KELISTRIKAN',
    'Katalog Komponen Kelistrikan Standar SPLN / PLN (MDU & Non-MDU)',
    [
      { label: 'Total Material', val: `${materials.length} Item Katalog` },
      { label: 'Standar Mutu', val: 'SPLN & ISO' },
    ]
  );

  // Table Slides (Chunked by 7 items)
  const chunkSize = 7;
  for (let i = 0; i < materials.length; i += chunkSize) {
    const chunk = materials.slice(i, i + chunkSize);
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgLight };
    addSlideHeaderFooter(
      slide,
      `Katalog Material MDU & Non-MDU (Halaman ${Math.floor(i / chunkSize) + 1})`,
      'Spesifikasi teknis, satuan, kelompok komponen dan referensi stok',
      'Master Data Material'
    );

    const tableRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Kode Material', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Nama Komponen Material', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Kategori', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
        { text: 'Kelompok / Sub-Kategori', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Spesifikasi Teknis', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
        { text: 'Satuan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      ],
    ];

    chunk.forEach((m, idx) => {
      const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
      tableRows.push([
        { text: m.kodeMaterial, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
        { text: m.namaMaterial, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
        { text: m.kategori, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: m.kategori === 'MDU' ? 'D97706' : '2563EB' } },
        { text: m.kelompok, options: { fill: { color: rowFill }, fontSize: 8 } },
        { text: m.spesifikasi || '-', options: { fill: { color: rowFill }, fontSize: 7.5 } },
        { text: m.satuan, options: { fill: { color: rowFill }, fontSize: 8, align: 'center' } },
      ]);
    });

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.5,
      w: 8.8,
      colW: [1.4, 2.5, 0.9, 1.6, 1.6, 0.8],
      rowH: 0.42,
      border: { pt: 0.5, color: COLORS.borderLight },
    });
  }

  const fileName = `PPT_Master_Data_Material_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};

// ----------------------------------------------------
// 8. PPT EXPORT: MASTER ALL-IN-ONE EXECUTIVE DECK
// ----------------------------------------------------
export const generateAllMenusExecutivePPT = async (allData: {
  projects: ProjectItem[];
  materialRequests: MaterialRequest[];
  materialShipments: MaterialShipment[];
  foremen: ForemanItem[];
  workPlans: WorkPlan[];
  masterMaterials: MasterMaterialItem[];
}) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Executive Presentation All Modules - PT SMK';
  pptx.author = 'PT Sapta Manunggal Karya';
  pptx.company = 'Divisi Mechanical Electrical';

  const { projects, materialRequests, materialShipments, foremen, workPlans } = allData;
  const totalNilai = projects.reduce((acc, p) => acc + p.nilaiKontrak, 0);

  // 1. Cover
  addCoverSlide(
    pptx,
    'LAPORAN EKSEKUTIF OPERASIONAL & SPBJ',
    'Divisi Mechanical Electrical PT Sapta Manunggal Karya • All Modules Presentation',
    [
      { label: 'Total Nilai Kontrak', val: formatShortRupiah(totalNilai) },
      { label: 'Total Proyek SPBJ', val: `${projects.length} Paket` },
      { label: 'Rencana Kerja', val: `${workPlans.length} Rencana` },
      { label: 'Mandor Terdaftar', val: `${foremen.length} Tim` },
    ]
  );

  // 2. Executive Dashboard Overview
  const dashSlide = pptx.addSlide();
  dashSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    dashSlide,
    'Executive Summary: Portfolio & Operasional',
    'Dashboard terpadu pencapaian proyek SPBJ, logistik, pengiriman dan kesiapan manpower',
    'All Modules'
  );

  const dashCards = [
    { label: 'PORTFOLIO SPBJ', val: `${projects.length} Paket`, sub: formatShortRupiah(totalNilai), color: COLORS.accentAmber },
    { label: 'RENCANA KERJA', val: `${workPlans.length} Rencana`, sub: 'Target Lapangan Terjadwal', color: COLORS.accentBlue },
    { label: 'PERMINTAAN MATERIAL', val: `${materialRequests.length} Bon`, sub: 'MDU & Non-MDU Gudang', color: COLORS.accentOrange },
    { label: 'PENGIRIMAN SURAT JALAN', val: `${materialShipments.length} Kirim`, sub: 'Armada & Ekspedisi Logistik', color: COLORS.accentGreen },
  ];

  dashCards.forEach((c, idx) => {
    const cardX = 0.6 + idx * 2.25;
    dashSlide.addShape('roundRect' as unknown as PptxGenJS.ShapeType, {
      x: cardX,
      y: 1.5,
      w: 2.1,
      h: 1.5,
      rectRadius: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.borderLight, width: 1 },
    });
    dashSlide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
      x: cardX,
      y: 1.5,
      w: 2.1,
      h: 0.08,
      fill: { color: c.color },
      line: { color: c.color },
    });
    dashSlide.addText(c.label, {
      x: cardX + 0.15,
      y: 1.68,
      w: 1.8,
      h: 0.25,
      fontSize: 8,
      bold: true,
      color: COLORS.textMuted,
    });
    dashSlide.addText(c.val, {
      x: cardX + 0.15,
      y: 1.95,
      w: 1.8,
      h: 0.55,
      fontSize: 16,
      bold: true,
      color: COLORS.textPrimary,
    });
    dashSlide.addText(c.sub, {
      x: cardX + 0.15,
      y: 2.55,
      w: 1.8,
      h: 0.3,
      fontSize: 8,
      color: COLORS.textSecondary,
    });
  });

  // Section 1: Monitoring SPBJ (Top Projects)
  const spbjSlide = pptx.addSlide();
  spbjSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    spbjSlide,
    'Modul 1: Monitoring Paket SPBJ Aktif',
    'Daftar paket pekerjaan prioritas, progres fisik dan tim pelaksana lapangan',
    'Modul SPBJ'
  );

  const spbjRows: PptxGenJS.TableRow[] = [
    [
      { text: 'No SPBJ / Paket Pekerjaan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Lokasi & Sistem', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Nilai Kontrak', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'right' } },
      { text: 'Realisasi', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'PIC / Mandor', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  projects.slice(0, 6).forEach((p, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    spbjRows.push([
      { text: `${p.noSPBJ}\n${p.namaPekerjaan}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: `${p.lokasi}\n${p.kategori}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: formatRupiah(p.nilaiKontrak), options: { fill: { color: rowFill }, fontSize: 8, bold: true, color: COLORS.accentAmber, align: 'right' } },
      { text: `${p.progressRealisasi}%`, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: p.progressRealisasi >= p.progressRencana ? '10B981' : 'EF4444' } },
      { text: `${p.pic}\nMandor: ${p.mandor}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: p.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
    ]);
  });

  spbjSlide.addTable(spbjRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [2.5, 1.8, 1.4, 1.0, 1.2, 0.9],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  // Section 2: Work Plans Slide
  const wpSlide = pptx.addSlide();
  wpSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    wpSlide,
    'Modul 2: Rencana Kerja Lapangan',
    'Jadwal target pelaksanaan teknis di lapangan, alokasi mandor & kepatuhan K3',
    'Modul Work Plan'
  );

  const wpRows: PptxGenJS.TableRow[] = [
    [
      { text: 'No Rencana & Judul', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Tanggal & Lokasi', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Mandor & Manpower', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'PIC / Pengawas', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Jml Item', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  workPlans.slice(0, 6).forEach((wp, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    wpRows.push([
      { text: `${wp.nomorRencana}\n${wp.judulRencana}`, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: `${formatDateIndo(wp.tanggal)}\n${wp.lokasi}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${wp.mandor}\n(${wp.manpowerCount} Orang)`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: wp.pic, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${wp.items?.length || 0} item`, options: { fill: { color: rowFill }, fontSize: 8, align: 'center', bold: true } },
      { text: wp.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
    ]);
  });

  wpSlide.addTable(wpRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [2.5, 2.0, 1.5, 1.2, 0.8, 0.8],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  // Section 3: Material Requests & Shipments Slide
  const matSlide = pptx.addSlide();
  matSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    matSlide,
    'Modul 3: Logistik, Bon Material & Pengiriman',
    'Integrasi permintaan penarikan material gudang PLN dan tracking ekspedisi surat jalan',
    'Modul Logistik'
  );

  const matRows: PptxGenJS.TableRow[] = [
    [
      { text: 'No Dokumen', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Jenis Dokumen', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Pekerjaan & Tujuan', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Pihak Terkait / Driver', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  // Mix 3 material requests + 3 shipments
  materialRequests.slice(0, 3).forEach((mr, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    matRows.push([
      { text: mr.nomorPermintaan, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: 'Bon Permintaan Material', options: { fill: { color: rowFill }, fontSize: 8, color: COLORS.accentOrange, bold: true } },
      { text: `${mr.pekerjaan}\n${mr.lokasi}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `Pemohon: ${mr.pemohon}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: mr.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
    ]);
  });

  materialShipments.slice(0, 3).forEach((ms, idx) => {
    const rowFill = (idx + 3) % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    matRows.push([
      { text: ms.nomorSuratJalan, options: { fill: { color: rowFill }, fontSize: 8, bold: true } },
      { text: 'Surat Jalan Ekspedisi', options: { fill: { color: rowFill }, fontSize: 8, color: COLORS.accentGreen, bold: true } },
      { text: `${ms.pekerjaan}\n${ms.lokasiTujuan}`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `Driver: ${ms.namaDriver} (${ms.jenisArmada})`, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: ms.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
    ]);
  });

  matSlide.addTable(matRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [2.0, 1.8, 2.4, 1.6, 1.0],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  // Section 4: Mandor & Manpower Overview
  const forSlide = pptx.addSlide();
  forSlide.background = { color: COLORS.bgLight };
  addSlideHeaderFooter(
    forSlide,
    'Modul 4: Kesiapan Mandor & Manpower Lapangan',
    'Pemetaan tenaga kerja ahli, multi-lokasi penugasan dan pengawasan teknis',
    'Modul Mandor'
  );

  const forRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Nama Mandor', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Kontak', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Spesialisasi', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Personil', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
      { text: 'Penugasan Proyek Aktif', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5 } },
      { text: 'Status', options: { fill: { color: COLORS.tableHeaderBg }, color: 'FFFFFF', bold: true, fontSize: 8.5, align: 'center' } },
    ],
  ];

  foremen.slice(0, 6).forEach((f, idx) => {
    const rowFill = idx % 2 === 0 ? 'FFFFFF' : COLORS.tableAltRow;
    const assign = f.assignments && f.assignments.length > 0
      ? f.assignments.map((a) => a.lokasiPekerjaan).join(', ')
      : 'Standby';
    forRows.push([
      { text: f.namaMandor, options: { fill: { color: rowFill }, fontSize: 8.5, bold: true } },
      { text: f.kontak, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: f.spesialisasi || 'Elektrikal', options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: `${f.jumlahAnggota || 0} Orang`, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center' } },
      { text: assign, options: { fill: { color: rowFill }, fontSize: 8 } },
      { text: f.status, options: { fill: { color: rowFill }, fontSize: 8, bold: true, align: 'center', color: f.status === 'AKTIF' ? '10B981' : '64748B' } },
    ]);
  });

  forSlide.addTable(forRows, {
    x: 0.6,
    y: 1.5,
    w: 8.8,
    colW: [1.8, 1.2, 1.8, 0.9, 2.3, 0.8],
    rowH: 0.45,
    border: { pt: 0.5, color: COLORS.borderLight },
  });

  const fileName = `PPT_Executive_All_Modules_PT_SMK_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
};
