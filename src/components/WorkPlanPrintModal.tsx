import React, { useRef } from 'react';
import { WorkPlan } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Calendar, 
  MapPin, 
  UserCheck, 
  HardHat, 
  Users, 
  ShieldCheck, 
  Wrench, 
  Zap,
  CheckCircle2,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

interface WorkPlanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  workPlan: WorkPlan | null;
}

export const WorkPlanPrintModal: React.FC<WorkPlanPrintModalProps> = ({
  isOpen,
  onClose,
  workPlan,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !workPlan) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No Rencana',
      'Tanggal',
      'Target Selesai',
      'Lokasi',
      'Nama Proyek / SPBJ',
      'No SPBJ',
      'PIC Pengawas',
      'No Kontak PIC',
      'Mandor',
      'No Kontak Mandor',
      'Manpower (Org)',
      'Status Rencana',
      'Prioritas',
      'No Item',
      'Uraian Pekerjaan',
      'Kategori Item',
      'Volume Target',
      'Satuan',
      'Target Waktu',
      'Status Item',
      'Catatan Item',
      'Instruksi K3',
      'Alat Kerja'
    ];

    const rows: string[][] = [];

    if (workPlan.items.length === 0) {
      rows.push([
        `"${workPlan.nomorRencana}"`,
        `"${workPlan.tanggal}"`,
        `"${workPlan.targetSelesai || ''}"`,
        `"${workPlan.lokasi.replace(/"/g, '""')}"`,
        `"${(workPlan.namaPekerjaan || '').replace(/"/g, '""')}"`,
        `"${workPlan.noSPBJ || ''}"`,
        `"${workPlan.pic}"`,
        `"${workPlan.picKontak || ''}"`,
        `"${workPlan.mandor}"`,
        `"${workPlan.mandorKontak || ''}"`,
        `"${workPlan.manpowerCount}"`,
        `"${workPlan.status}"`,
        `"${workPlan.prioritas || 'NORMAL'}"`,
        '1',
        '-',
        '-',
        '0',
        '-',
        '-',
        '-',
        '-',
        `"${(workPlan.catatanK3 || '').replace(/"/g, '""')}"`,
        `"${(workPlan.alatKerja || '').replace(/"/g, '""')}"`
      ]);
    } else {
      workPlan.items.forEach((item, idx) => {
        rows.push([
          `"${workPlan.nomorRencana}"`,
          `"${workPlan.tanggal}"`,
          `"${workPlan.targetSelesai || ''}"`,
          `"${workPlan.lokasi.replace(/"/g, '""')}"`,
          `"${(workPlan.namaPekerjaan || '').replace(/"/g, '""')}"`,
          `"${workPlan.noSPBJ || ''}"`,
          `"${workPlan.pic}"`,
          `"${workPlan.picKontak || ''}"`,
          `"${workPlan.mandor}"`,
          `"${workPlan.mandorKontak || ''}"`,
          `"${workPlan.manpowerCount}"`,
          `"${workPlan.status}"`,
          `"${workPlan.prioritas || 'NORMAL'}"`,
          `"${idx + 1}"`,
          `"${item.uraianPekerjaan.replace(/"/g, '""')}"`,
          `"${item.kategori || '-'}"`,
          `"${item.volume}"`,
          `"${item.satuan}"`,
          `"${item.targetWaktu || '-'}"`,
          `"${item.status}"`,
          `"${(item.catatan || '').replace(/"/g, '""')}"`,
          `"${(workPlan.catatanK3 || '').replace(/"/g, '""')}"`,
          `"${(workPlan.alatKerja || '').replace(/"/g, '""')}"`
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rencana_Kerja_${workPlan.nomorRencana.replace(/\//g, '_')}_${workPlan.tanggal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Controls Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">Lembar Rencana Kerja Lapangan Resmi (Divisi ME)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-slate-700"
              title="Download Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printContentRef} className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 text-slate-900 bg-white font-sans text-xs print:p-6 print:overflow-visible">
          
          {/* Header Kop Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider text-slate-950 uppercase">
                  PT SAPTA MANUNGGAL KARYA
                </span>
              </div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                DIVISI MECHANICAL &amp; ELECTRICAL KETENAGALISTRIKAN
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Spesialis Jaringan Distribusi TM 20 kV, TR 380 V, Gardu Trafo &amp; Panel PHB-TR
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-sm">
                LEMBAR RENCANA KERJA
              </span>
              <p className="text-[11px] font-mono font-bold text-slate-800 mt-1.5">
                No: {workPlan.nomorRencana}
              </p>
              <p className="text-[10px] text-slate-500">
                Tanggal: {formatDateIndo(workPlan.tanggal)}
              </p>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {workPlan.judulRencana || 'RENCANA PELAKSANAAN PEKERJAAN LAPANGAN'}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Standar Operasional Prosedur SPBJ, K2/K3 Ketenagalistrikan &amp; Pengawasan Mutu PLN
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Left Column */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Tanggal Kerja</span>
                <span className="font-bold text-slate-900">: {formatDateIndo(workPlan.tanggal)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Target Selesai</span>
                <span className="font-semibold text-slate-800">: {workPlan.targetSelesai || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Lokasi Pekerjaan</span>
                <span className="font-bold text-slate-900">: {workPlan.lokasi}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Paket / SPBJ</span>
                <span className="font-medium text-slate-800">: {workPlan.namaPekerjaan || '-'} {workPlan.noSPBJ ? `(${workPlan.noSPBJ})` : ''}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">PIC / Pengawas</span>
                <span className="font-bold text-blue-900">: {workPlan.pic} {workPlan.picKontak ? `(${workPlan.picKontak})` : ''}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Mandor Pelaksana</span>
                <span className="font-bold text-amber-900">: {workPlan.mandor} {workPlan.mandorKontak ? `(${workPlan.mandorKontak})` : ''}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Tenaga Kerja</span>
                <span className="font-bold text-slate-900">: {workPlan.manpowerCount} Orang Personil</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Status / Prioritas</span>
                <span className="font-bold text-slate-900">: [{workPlan.status}] - Prioritas {workPlan.prioritas || 'NORMAL'}</span>
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan Itemized Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>RINCIAN URAIAN PEKERJAAN ({workPlan.items.length} ITEM)</span>
              <span className="text-[10px] text-slate-500 font-normal">Target Output Kuantitas &amp; Waktu</span>
            </h3>

            <table className="w-full border-collapse text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-200/90 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                  <th className="py-2 px-2.5 w-10 text-center border-r border-slate-300">NO</th>
                  <th className="py-2 px-3 border-r border-slate-300">URAIAN PEKERJAAN</th>
                  <th className="py-2 px-2.5 w-32 border-r border-slate-300">KATEGORI</th>
                  <th className="py-2 px-2.5 w-20 text-center border-r border-slate-300">VOLUME</th>
                  <th className="py-2 px-2 w-16 text-center border-r border-slate-300">SATUAN</th>
                  <th className="py-2 px-2.5 w-24 text-center border-r border-slate-300">WAKTU</th>
                  <th className="py-2 px-2.5 w-20 text-center border-r border-slate-300">STATUS</th>
                  <th className="py-2 px-3">CATATAN KHUSUS / K3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workPlan.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                      Tidak ada rincian item uraian pekerjaan.
                    </td>
                  </tr>
                ) : (
                  workPlan.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {item.uraianPekerjaan}
                      </td>
                      <td className="py-2 px-2.5 text-[10px] text-slate-600 border-r border-slate-200 font-medium">
                        {item.kategori || '-'}
                      </td>
                      <td className="py-2 px-2.5 text-center font-black text-slate-950 border-r border-slate-200">
                        {item.volume}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 font-medium">
                        {item.satuan}
                      </td>
                      <td className="py-2 px-2.5 text-center text-[10px] text-slate-600 border-r border-slate-200">
                        {item.targetWaktu || '-'}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                          item.status === 'SELESAI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'SEDANG_DIKERJAKAN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status === 'SELESAI' ? 'SELESAI' : item.status === 'SEDANG_DIKERJAKAN' ? 'PROSES' : 'BELUM'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-600">
                        {item.catatan || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* K3 & Peralatan Kerja Box */}
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Instruksi K3 &amp; Keselamatan Kerja Listrik:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {workPlan.catatanK3 || 'Wajib menggunakan APD lengkap 20 kV, safety briefing sebelum kerja, pasang rambu peringatan dan periksa tegangan sisa sebelum menyentuh konduktor.'}
              </p>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Kesiapan Alat Kerja &amp; Alat Ukur:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {workPlan.alatKerja || 'Alat kerja lengkap, truk crane / hoist, megger insulation tester 5kV terkalibrasi, earth tester, tangga fiber, dan perlengkapan P3K.'}
              </p>
            </div>
          </div>

          {/* Signature Blocks */}
          <div className="pt-6 border-t border-slate-300">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              {/* Mandor */}
              <div className="space-y-16">
                <div>
                  <p className="text-slate-500 font-medium">Dibuat &amp; Dilaksanakan Oleh,</p>
                  <p className="font-bold text-slate-900">Mandor Pelaksana Lapangan</p>
                </div>
                <div className="border-t border-slate-400 pt-1 mx-4">
                  <p className="font-bold text-slate-900">{workPlan.mandor}</p>
                  <p className="text-[10px] text-slate-500">Pelaksana Divisi ME</p>
                </div>
              </div>

              {/* PIC Proyek */}
              <div className="space-y-16">
                <div>
                  <p className="text-slate-500 font-medium">Diperiksa &amp; Diawasi Oleh,</p>
                  <p className="font-bold text-slate-900">Supervisor / PIC Proyek</p>
                </div>
                <div className="border-t border-slate-400 pt-1 mx-4">
                  <p className="font-bold text-slate-900">{workPlan.pic}</p>
                  <p className="text-[10px] text-slate-500">PT Sapta Manunggal Karya</p>
                </div>
              </div>

              {/* Manajer ME / Direksi PLN */}
              <div className="space-y-16">
                <div>
                  <p className="text-slate-500 font-medium">Mengetahui / Menyetujui,</p>
                  <p className="font-bold text-slate-900">Direksi Pengawas PLN / Manajer</p>
                </div>
                <div className="border-t border-slate-400 pt-1 mx-4">
                  <p className="font-bold text-slate-900">_______________________</p>
                  <p className="text-[10px] text-slate-500">Manajer ME / Pengawas PLN</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
