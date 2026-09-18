import React, { useRef, useState } from 'react';
import { ProjectItem, DailyLog, ForemanItem } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  MapPin, 
  Calendar, 
  Clock, 
  Sun, 
  CloudRain, 
  CloudSun, 
  CloudLightning,
  ShieldCheck, 
  Users, 
  HardHat, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Camera, 
  Compass, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText,
  Share2,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { formatDateIndo, formatRupiah, getCategoryBadge, getVoltageBadge, getSafetyBadge } from '../utils/formatters';
import { getGoogleMapsDirectionsUrl, getGoogleMapsUrl, getWazeUrl } from '../utils/geoUtils';

interface DailyLogPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  dailyLog: DailyLog | null;
  foremen?: ForemanItem[];
}

export const DailyLogPrintModal: React.FC<DailyLogPrintModalProps> = ({
  isOpen,
  onClose,
  project,
  dailyLog,
  foremen = [],
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedWaText, setCopiedWaText] = useState<boolean>(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project || !dailyLog) return null;

  // Active coordinates
  const lat = project.koordinatLat || -6.176820;
  const lng = project.koordinatLng || 106.830610;
  const coordGpsString = dailyLog.koordinatGps || project.koordinatGps || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  // Combine photos from log and uploaded in-modal photos
  const allPhotos = [
    ...(dailyLog.fotoDokumentasi || []),
    ...uploadedPhotos,
  ];

  // Default sample photos if none provided
  const displayPhotos = allPhotos.length > 0 ? allPhotos : [
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyGps = () => {
    navigator.clipboard.writeText(coordGpsString);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyWaSummary = () => {
    const waText = `*LAPORAN HARIAN PEKERJAAN - PT SAPTA MANUNGGAL KARYA*
📅 *Tanggal:* ${formatDateIndo(dailyLog.tanggal)}
⚡ *Pekerjaan:* ${project.namaPekerjaan}
📋 *No. SPBJ:* ${project.noSPBJ}
📍 *Lokasi:* ${project.lokasi}
🎯 *Progres Hari Ini:* ${dailyLog.progressHariIni}% | *Kumulatif:* ${project.progressRealisasi}%
👷 *Mandor:* ${project.mandor} (${dailyLog.manpowerHadir} Personil)
☀️ *Cuaca:* ${dailyLog.kondisiCuaca}
🛡️ *Status K3:* ${project.k3Status} | *Manuver:* ${project.statusManuver}

📝 *Uraian Kerja:*
${dailyLog.pekerjaanHariIni}

${dailyLog.kendala ? `⚠️ *Kendala:* ${dailyLog.kendala}\n💡 *Solusi:* ${dailyLog.solusi || '-'}\n` : ''}
📦 *Material Terpasang:*
${dailyLog.materialTerpasang && dailyLog.materialTerpasang.length > 0 
  ? dailyLog.materialTerpasang.map((m, i) => `${i+1}. ${m.namaMaterial} (${m.volume} ${m.satuan}) - ${m.lokasiTitik || '-'}`).join('\n')
  : '- Tidak ada material terpasang hari ini -'}

📍 *Koordinat GPS:* ${coordGpsString}
🗺️ *Google Maps:* ${getGoogleMapsUrl(lat, lng)}`;

    navigator.clipboard.writeText(waText);
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 2500);
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readers: Promise<string>[] = Array.from(files).map((file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        setUploadedPhotos((prev) => [...prev, ...results]);
      });
    }
  };

  // Weather icon helper
  const getWeatherIcon = (cuaca: string) => {
    switch (cuaca) {
      case 'Cerah':
        return <Sun className="w-4 h-4 text-amber-500 inline mr-1" />;
      case 'Berawan':
        return <CloudSun className="w-4 h-4 text-sky-500 inline mr-1" />;
      case 'Hujan Ringan':
        return <CloudRain className="w-4 h-4 text-blue-500 inline mr-1" />;
      case 'Hujan Lebat':
        return <CloudLightning className="w-4 h-4 text-indigo-600 inline mr-1" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500 inline mr-1" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[96vh] overflow-hidden">
        
        {/* Top Floating Control Bar (Hidden when printed) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                Pratinjau &amp; Cetak Laporan Harian Pekerjaan (PDF)
              </h3>
              <p className="text-xs text-slate-400">
                Format resmi Standar PLN &amp; PT Sapta Manunggal Karya dengan catatan lapangan &amp; foto koordinat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick WhatsApp Text Copy */}
            <button
              onClick={handleCopyWaSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Salin ringkasan laporan untuk dikirim via WhatsApp"
            >
              {copiedWaText ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin ke WA!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Salin Teks WA</span>
                </>
              )}
            </button>

            {/* Add Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Tambah foto dokumentasi lapangan"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Tambah Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddPhoto}
            />

            {/* Print Button (Ctrl + P / Browser Print to PDF) */}
            <button
              id="btn-print-daily-log"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-6 lg:p-8 flex justify-center">
          
          {/* A4 Printable White Paper Sheet */}
          <div 
            id="printable-daily-report"
            className="bg-white w-full max-w-4xl p-6 sm:p-8 md:p-10 rounded-xl shadow-lg border border-slate-200 text-slate-900 space-y-6 print:p-0 print:shadow-none print:border-0 print:max-w-none print:w-full print:rounded-none"
          >
            {/* 1. KOP SURAT RESMI */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                    <Zap className="w-7 h-7 fill-slate-950 text-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-none">
                      PT SAPTA MANUNGGAL KARYA
                    </h2>
                    <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mt-1">
                      DIVISI MECHANICAL &amp; ELECTRICAL &bull; KONTRAKTOR &amp; SUPLIER KELISTRIKAN
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-tight">
                      Jl. Pegangsaan No. 45, Jakarta | Telp: (021) 8899-7711 | Email: me@saptamanunggal.co.id
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-amber-400 font-extrabold text-[11px] rounded tracking-wider uppercase">
                    LAPORAN HARIAN PEKERJAAN
                  </span>
                  <div className="text-[11px] font-mono text-slate-600 mt-1">
                    No: DLR/{new Date(dailyLog.tanggal).getFullYear()}/{(new Date(dailyLog.tanggal).getMonth()+1).toString().padStart(2, '0')}/{project.no.toString().padStart(3, '0')}
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-medium">
                    Tanggal: <strong>{formatDateIndo(dailyLog.tanggal)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. INFORMASI PROYEK & PARAMETER LAPANGAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Kolom Kiri: Detail SPBJ */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Identitas Kontrak &amp; SPBJ
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded">
                    Kategori: {project.kategori}
                  </span>
                </div>

                <table className="w-full text-[11px] space-y-1">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 w-28 py-0.5">Nama Pekerjaan</td>
                      <td className="font-bold text-slate-950 py-0.5">: {project.namaPekerjaan}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Nomor SPBJ</td>
                      <td className="font-mono font-bold text-slate-800 py-0.5">: {project.noSPBJ}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Lokasi Proyek</td>
                      <td className="font-semibold text-slate-800 py-0.5">: {project.lokasi}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Nilai Kontrak</td>
                      <td className="font-bold text-amber-800 py-0.5">: {formatRupiah(project.nilaiKontrak)}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Periode Kontrak</td>
                      <td className="text-slate-700 py-0.5">: {formatDateIndo(project.tanggalMulai)} s/d {formatDateIndo(project.targetSelesai)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kolom Kanan: Parameter Operasional & K3 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Kondisi Kerja &amp; Manpower
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black rounded">
                    {dailyLog.kondisiCuaca}
                  </span>
                </div>

                <table className="w-full text-[11px]">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 w-32 py-0.5">PIC Pengawas SMK</td>
                      <td className="font-bold text-slate-950 py-0.5">: {project.pic} {project.picKontak ? `(${project.picKontak})` : ''}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Mandor Pelaksana</td>
                      <td className="font-bold text-slate-950 py-0.5">: {project.mandor} {project.mandorKontak ? `(${project.mandorKontak})` : ''}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Jumlah Personil</td>
                      <td className="font-bold text-slate-800 py-0.5">: {dailyLog.manpowerHadir} Orang (Teknisi: {project.manpower.teknisiListrik}, Helper: {project.manpower.helper}, HSE: {project.manpower.hseOfficer})</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Manuver Tegangan</td>
                      <td className="font-bold text-slate-800 py-0.5">: {project.statusManuver.replace('_', ' ')}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Status K3 Lapangan</td>
                      <td className="font-bold text-emerald-700 py-0.5">: {project.k3Status === 'AMAN' ? '✅ AMAN (Nihil Kecelakaan)' : project.k3Status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. INDIKATOR PROGRES PEKERJAAN */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Status Kemajuan Fisik (Progres)
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Hari Ini: </span>
                    <span className="font-black text-white text-sm">{dailyLog.progressHariIni}%</span>
                  </div>
                  <div className="text-slate-600">|</div>
                  <div>
                    <span className="text-slate-400">Kumulatif Realisasi: </span>
                    <span className="font-black text-amber-400 text-sm">{project.progressRealisasi}%</span>
                  </div>
                  <div className="text-slate-600">|</div>
                  <div>
                    <span className="text-slate-400">Target Rencana: </span>
                    <span className="font-semibold text-slate-300">{project.progressRencana}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-[10.5px] text-slate-300 mb-1">
                  <span>Realisasi Lapangan</span>
                  <span className="font-mono font-bold text-amber-300">{project.progressRealisasi}% / 100%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(project.progressRealisasi, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4. CATATAN LAPANGAN & KRONOLOGI PEKERJAAN */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  I. Catatan Lapangan &amp; Uraian Pekerjaan Hari Ini
                </h4>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-[11.5px] mb-1">
                    A. Uraian Pekerjaan Fisik:
                  </span>
                  <p className="text-slate-800 leading-relaxed pl-3 border-l-2 border-amber-500">
                    {dailyLog.pekerjaanHariIni}
                  </p>
                </div>

                {(dailyLog.kendala || dailyLog.solusi) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                    <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                      <span className="text-[10.5px] font-bold text-rose-800 block mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Kendala / Hambatan:
                      </span>
                      <p className="text-[11px] text-rose-950">
                        {dailyLog.kendala || 'Tidak ada kendala kritis.'}
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                      <span className="text-[10.5px] font-bold text-emerald-800 block mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Tindakan / Solusi:
                      </span>
                      <p className="text-[11px] text-emerald-950">
                        {dailyLog.solusi || 'Pekerjaan berjalan sesuai SOP kerja PLN.'}
                      </p>
                    </div>
                  </div>
                )}

                {dailyLog.catatanK3 && (
                  <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-[11px]">
                    <span className="font-bold text-blue-900 block mb-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Instruksi Keselamatan K3 &amp; Toolbox Meeting:
                    </span>
                    <p className="text-blue-950">{dailyLog.catatanK3}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. STATUS MATERIAL TERPASANG HARI INI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    II. Status Material Terpasang di Lapangan (MDU &amp; Non-MDU)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Total: {dailyLog.materialTerpasang?.length || 0} Item Material
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold text-[10.5px] uppercase tracking-wider border-b border-slate-300">
                      <th className="py-2.5 px-2 text-center w-8 border-r border-slate-300">No</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Nama Material &amp; Spesifikasi</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Titik / Trase Lokasi</th>
                      <th className="py-2.5 px-2 text-center w-20 border-r border-slate-300">Volume</th>
                      <th className="py-2.5 px-2 text-center w-16 border-r border-slate-300">Satuan</th>
                      <th className="py-2.5 px-2 text-center w-28 border-r border-slate-300">Status Fisik</th>
                      <th className="py-2.5 px-3">Keterangan Teknis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {dailyLog.materialTerpasang && dailyLog.materialTerpasang.length > 0 ? (
                      dailyLog.materialTerpasang.map((mat, idx) => (
                        <tr key={mat.id || idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2 text-center font-bold text-slate-500 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200">
                            <span className="font-bold text-slate-900 block leading-tight">{mat.namaMaterial}</span>
                            {mat.spesifikasi && (
                              <span className="text-[10px] text-slate-500 block">{mat.spesifikasi}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-700 border-r border-slate-200 font-medium">
                            {mat.lokasiTitik || '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                            {mat.volume}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200">
                            {mat.satuan}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-200">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black ${
                              mat.kondisiStatus === 'TERPASANG_BAIK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mat.kondisiStatus === 'SUDAH_DITES'
                                ? 'bg-blue-100 text-blue-800'
                                : mat.kondisiStatus === 'BELUM_ENERGIZE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {mat.kondisiStatus?.replace('_', ' ') || 'TERPASANG'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[10.5px]">
                            {mat.keterangan || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-400 italic">
                          Tidak ada pemasangan material baru pada log harian tanggal ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. DOKUMENTASI FOTO & KOORDINAT GEOTAGGING GPS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    III. Dokumentasi Foto Lapangan &amp; Verifikasi Geotagging GPS
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>GPS: {coordGpsString}</span>
                </div>
              </div>

              {/* Grid 2 Foto Dokumentasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayPhotos.slice(0, 2).map((photoUrl, pIdx) => (
                  <div 
                    key={pIdx}
                    className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-xs flex flex-col"
                  >
                    <div className="relative aspect-4/3 w-full bg-slate-800 overflow-hidden">
                      <img 
                        src={photoUrl} 
                        alt={`Dokumentasi Pekerjaan ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Watermark Tag GPS Overlay di atas foto */}
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs p-2.5 text-white text-[10px] space-y-0.5 border-t border-slate-700">
                        <div className="flex items-center justify-between font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Foto Dokumentasi #{pIdx + 1}
                          </span>
                          <span>{dailyLog.tanggal}</span>
                        </div>
                        <div className="font-mono text-slate-200">
                          📍 Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                        </div>
                        <div className="text-slate-300 truncate">
                          Pekerjaan: {project.namaPekerjaan} ({project.lokasi})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GPS Koordinat & Akses Peta Digital */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">
                      Titik Presisi Lokasi Pekerjaan
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-600">
                      Latitude: {lat.toFixed(6)} | Longitude: {lng.toFixed(6)} (Radius: {project.radiusAreaMeter || 300}m)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyGps}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Salin GPS</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getGoogleMapsDirectionsUrl(lat, lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition-colors shadow-2xs"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 7. LEMBAR PENGESAHAN & TANDA TANGAN (4 KOLOM STANDAR PLN) */}
            <div className="pt-4 border-t-2 border-slate-900 space-y-3">
              <div className="text-[11px] font-bold text-slate-700 text-center uppercase tracking-wider">
                LEMBAR VERIFIKASI DAN PENGESAHAN LAPORAN HARIAN
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* 1. Mandor */}
                <div className="p-2 border border-slate-300 rounded-lg flex flex-col justify-between h-32 bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Dibuat Oleh:</span>
                    <span className="text-[10.5px] font-bold text-slate-900 block mt-0.5">Mandor Pelaksana</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold text-slate-900 block text-[11px] underline">
                      {project.mandor}
                    </span>
                    <span className="text-[9.5px] text-slate-500">Pelaksana Lapangan</span>
                  </div>
                </div>

                {/* 2. HSE Officer */}
                <div className="p-2 border border-slate-300 rounded-lg flex flex-col justify-between h-32 bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Diperiksa K3:</span>
                    <span className="text-[10.5px] font-bold text-slate-900 block mt-0.5">HSE Officer</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold text-slate-900 block text-[11px] underline">
                      HSE Officer PT SMK
                    </span>
                    <span className="text-[9.5px] text-slate-500">Pengawas K3 Lapangan</span>
                  </div>
                </div>

                {/* 3. Site Manager / PIC */}
                <div className="p-2 border border-slate-300 rounded-lg flex flex-col justify-between h-32 bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Disetujui Oleh:</span>
                    <span className="text-[10.5px] font-bold text-slate-900 block mt-0.5">Project Manager</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold text-slate-900 block text-[11px] underline">
                      {project.pic}
                    </span>
                    <span className="text-[9.5px] text-slate-500">PIC / Site Manager SMK</span>
                  </div>
                </div>

                {/* 4. Pengawas PLN */}
                <div className="p-2 border border-slate-300 rounded-lg flex flex-col justify-between h-32 bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Diketahui Oleh:</span>
                    <span className="text-[10.5px] font-bold text-slate-900 block mt-0.5">Pengawas Lapangan PLN</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold text-slate-900 block text-[11px] underline">
                      .......................................
                    </span>
                    <span className="text-[9.5px] text-slate-500">PT PLN (Persero)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Cetak */}
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200">
              <span>Sistem Monitoring Proyek Mechanical Electrical PT Sapta Manunggal Karya</span>
              <span>Dicetak secara elektronik pada: {new Date().toLocaleString('id-ID')}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
