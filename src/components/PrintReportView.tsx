import React, { useState } from 'react';
import { ProjectItem } from '../types';
import { 
  formatRupiah, 
  formatDateIndo, 
  downloadReportTableCSV, 
  downloadReportHTML,
  downloadReportPDF
} from '../utils/formatters';
import { Printer, X, Zap, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

interface PrintReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  if (!isOpen) return null;

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalNilai = projects.reduce((sum, p) => sum + p.nilaiKontrak, 0);

  const triggerFeedback = (label: string) => {
    setDownloadSuccess(label);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadPDF = () => {
    downloadReportPDF(projects);
    triggerFeedback('File PDF berhasil diunduh!');
  };

  const handleDownloadCSV = () => {
    downloadReportTableCSV(projects);
    triggerFeedback('File Excel (.csv) berhasil diunduh!');
  };

  const handleDownloadHTML = () => {
    downloadReportHTML(projects);
    triggerFeedback('Dokumen Laporan (.html) berhasil diunduh!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto print:border-none print:shadow-none print:w-full print:max-w-none animate-in fade-in zoom-in-95 duration-150">
        
        {/* Print & Download Toolbar (Hidden during browser print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight">Laporan Rekapitulasi SPBJ</span>
              <span className="text-[11px] text-slate-400">Pilih format untuk mengunduh atau mencetak dokumen</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {downloadSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-3 py-1.5 rounded-lg mr-1 font-medium animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {downloadSuccess}
              </span>
            )}

            {/* 1. Download PDF Langsung */}
            <button
              id="btn-download-pdf-modal"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Unduh laporan resmi langsung dalam format file PDF (.pdf)"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>

            {/* 2. Download Excel / CSV */}
            <button
              id="btn-download-csv-modal"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Unduh data tabel dalam format spreadsheet (.csv)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.csv)</span>
            </button>

            {/* 3. Download HTML Doc */}
            <button
              id="btn-download-html-modal"
              onClick={handleDownloadHTML}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Unduh dokumen laporan mandiri (.html) yang siap dibuka offline"
            >
              <FileText className="w-4 h-4" />
              <span>Download Dokumen (.html)</span>
            </button>

            {/* 4. Cetak / Print */}
            <button
              id="btn-print-modal"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Cetak via dialog printer browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-10 space-y-5 text-slate-900 bg-white font-sans text-xs">
          
          {/* Header Dokumen Rapi & Resmi */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                <span>DIVISI MECHANICAL ELECTRICAL PT SAPTA MANUNGGAL KARYA</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Rekapitulasi Proyek Pekerjaan Kelistrikan (SPBJ)
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Surat Perjanjian Pemborongan Pekerjaan &amp; Rekapitulasi Pelaksanaan Lapangan
              </p>
            </div>

            {/* Parameter Header Rapi */}
            <div className="flex items-center gap-5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Tanggal Laporan</span>
                <span className="font-bold text-xs text-slate-800">{formatDateIndo(todayStr)}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Total Pekerjaan</span>
                <span className="font-extrabold text-xs text-slate-900">{projects.length} SPBJ</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Total Nilai Kontrak</span>
                <span className="font-extrabold text-xs text-amber-700">{formatRupiah(totalNilai)}</span>
              </div>
            </div>
          </div>

          {/* Tabel Laporan Lengkap, Rapi & Semua Kolom Center */}
          <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-xs">
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 uppercase text-[11px] tracking-wide">
                  <th className="border-r border-slate-300 px-3 py-3 text-center w-12 whitespace-nowrap align-middle">
                    No
                  </th>
                  <th className="border-r border-slate-300 px-4 py-3 text-center min-w-[200px] whitespace-nowrap align-middle">
                    Nama Pekerjaan
                  </th>
                  <th className="border-r border-slate-300 px-3.5 py-3 text-center min-w-[140px] whitespace-nowrap align-middle">
                    Lokasi
                  </th>
                  <th className="border-r border-slate-300 px-3.5 py-3 text-center min-w-[125px] whitespace-nowrap align-middle">
                    Nilai Kontrak
                  </th>
                  <th className="border-r border-slate-300 px-3.5 py-3 text-center min-w-[135px] whitespace-nowrap align-middle">
                    No. SPBJ
                  </th>
                  <th className="border-r border-slate-300 px-3.5 py-3 text-center min-w-[145px] whitespace-nowrap align-middle">
                    PIC (Direksi)
                  </th>
                  <th className="px-4 py-3 text-center min-w-[150px] whitespace-nowrap align-middle">
                    Mandor &amp; Manpower
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                  >
                    {/* 1. NO */}
                    <td className="border-r border-slate-200 px-3 py-3 text-center font-bold text-slate-700 align-middle">
                      {item.no}
                    </td>

                    {/* 2. NAMA PEKERJAAN (CENTER) */}
                    <td className="border-r border-slate-200 px-4 py-3 text-center align-middle">
                      <div className="font-bold text-slate-900 leading-snug">{item.namaPekerjaan}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        Kat: {item.kategori} &bull; {item.statusManuver}
                      </div>
                    </td>

                    {/* 3. LOKASI (CENTER) */}
                    <td className="border-r border-slate-200 px-3.5 py-3 text-center text-slate-700 leading-relaxed align-middle">
                      {item.lokasi}
                    </td>

                    {/* 4. NILAI KONTRAK (CENTER) */}
                    <td className="border-r border-slate-200 px-3.5 py-3 text-center font-bold text-slate-900 whitespace-nowrap align-middle">
                      {formatRupiah(item.nilaiKontrak)}
                    </td>

                    {/* 5. NO SPBJ (CENTER) */}
                    <td className="border-r border-slate-200 px-3.5 py-3 text-center font-mono text-[10.5px] text-slate-700 whitespace-nowrap align-middle">
                      {item.noSPBJ}
                    </td>

                    {/* 6. PIC (CENTER) */}
                    <td className="border-r border-slate-200 px-3.5 py-3 text-center align-middle">
                      <div className="font-bold text-slate-900">{item.pic}</div>
                      {item.picKontak && (
                        <div className="text-[10.5px] text-slate-500 mt-0.5">{item.picKontak}</div>
                      )}
                    </td>

                    {/* 7. MANDOR & MANPOWER (CENTER) */}
                    <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.mandor}</div>
                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        {item.manpower?.total || 0} Orang
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Kaki Dokumen */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Divisi Mechanical Electrical PT Sapta Manunggal Karya &bull; K3 Zero Accident</span>
            <span>Halaman 1 dari 1</span>
          </div>

        </div>
      </div>
    </div>
  );
};

