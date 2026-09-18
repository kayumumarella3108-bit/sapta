import React from 'react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  X, 
  Zap, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { MaterialRequest } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { 
  exportMaterialRequestToPDF, 
  exportMaterialRequestToExcel, 
  getStatusBadgeStyle 
} from '../utils/materialExport';

interface MaterialRequestPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaterialRequest | null;
}

export const MaterialRequestPrintModal: React.FC<MaterialRequestPrintModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    exportMaterialRequestToPDF(request);
  };

  const handleExportExcel = () => {
    exportMaterialRequestToExcel(request);
  };

  const statusInfo = getStatusBadgeStyle(request.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 print:border-none print:shadow-none print:max-h-none print:max-w-none">
        
        {/* Action Toolbar (Hidden during Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pratinjau Cetak Bon Permintaan Material</h3>
              <p className="text-[11px] text-slate-400">Siap cetak ke printer / simpan PDF atau unduh Excel (.xlsx)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Cetak dokumen atau simpan lewat dialog browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Unduh berkas format PDF resmi"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Unduh berkas Excel .xlsx lengkap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 space-y-6 text-slate-900 print:p-4 print:overflow-visible" id="printable-material-request">
          
          {/* PLN Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-xs shrink-0 print:border print:border-amber-600">
                  <Zap className="w-7 h-7 fill-slate-950 stroke-slate-950" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    PT PLN (PERSERO) &bull; UNIT INDUK DISTRIBUSI / UP3
                  </h4>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                    SURAT PERMINTAAN PENGELUARAN MATERIAL (MDU &amp; NON-MDU)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Formulir Resmi Pengeluaran Material Distribusi Gudang &bull; Sistem Monitoring SPBJ Kelistrikan
                  </p>
                </div>
              </div>

              {/* Status Badge in Print */}
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-slate-300 bg-slate-100 text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{statusInfo.label}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Dicetak: {formatDateIndo(new Date().toISOString().slice(0, 10))}
                </div>
              </div>
            </div>
          </div>

          {/* Identity & SPBJ Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">No. Permintaan / Bon:</span>
                <span className="font-mono font-bold text-slate-900">{request.nomorPermintaan}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Tanggal Permintaan:</span>
                <span className="font-medium text-slate-900">{formatDateIndo(request.tanggalPermintaan)}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Nama Pekerjaan:</span>
                <span className="font-bold text-slate-950 flex-1">{request.pekerjaan}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Lokasi Pekerjaan:</span>
                <span className="font-medium text-slate-800 flex-1">{request.lokasi}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">No. SPBJ / Kontrak:</span>
                <span className="font-mono font-bold text-amber-700">{request.noSPBJ}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Pemohon (Mandor):</span>
                <span className="font-medium text-slate-900">
                  {request.pemohon} {request.kontakPemohon ? `(${request.kontakPemohon})` : ''}
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Direksi Pengawas:</span>
                <span className="font-medium text-slate-900">{request.direksiPengawas}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Petugas Gudang:</span>
                <span className="font-medium text-slate-900">{request.petugasGudang || 'Petugas Gudang UP3'}</span>
              </div>
            </div>
          </div>

          {/* TABLE 1: RINCIAN KEBUTUHAN MDU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  I
                </span>
                <span>Rincian Kebutuhan MDU</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {request.itemsMDU.length} Macam Material
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-amber-100/70 text-amber-950 font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-2.5 py-2 w-10 text-center border-r border-amber-200">No</th>
                    <th className="px-2.5 py-2 w-28 border-r border-amber-200">Kode Material</th>
                    <th className="px-3 py-2 min-w-[180px] border-r border-amber-200">Nama Material MDU</th>
                    <th className="px-3 py-2 min-w-[150px] border-r border-amber-200">Spesifikasi / Standar</th>
                    <th className="px-2.5 py-2 w-20 text-center border-r border-amber-200">Diminta</th>
                    <th className="px-2.5 py-2 w-20 text-center border-r border-amber-200">Satuan</th>
                    <th className="px-3 py-2 min-w-[140px]">Keterangan / Titik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {request.itemsMDU.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-3 text-center text-slate-400 italic">
                        Tidak ada item material MDU pada permintaan ini.
                      </td>
                    </tr>
                  ) : (
                    request.itemsMDU.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-2.5 py-2 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="px-2.5 py-2 font-mono text-slate-600 border-r border-slate-200">{item.kodeMaterial || `MDU-${idx + 1}`}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-200">{item.namaMaterial}</td>
                        <td className="px-3 py-2 text-slate-600 border-r border-slate-200">{item.spesifikasi || '-'}</td>
                        <td className="px-2.5 py-2 text-center font-bold text-slate-900 border-r border-slate-200">{item.volume}</td>
                        <td className="px-2.5 py-2 text-center text-slate-700 border-r border-slate-200">{item.satuan}</td>
                        <td className="px-3 py-2 text-slate-600">{item.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: RINCIAN KEBUTUHAN NON-MDU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  II
                </span>
                <span>Rincian Kebutuhan Non-MDU</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {request.itemsNonMDU.length} Macam Material
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-100/70 text-blue-950 font-bold border-b border-blue-200">
                  <tr>
                    <th className="px-2.5 py-2 w-10 text-center border-r border-blue-200">No</th>
                    <th className="px-2.5 py-2 w-28 border-r border-blue-200">Kode Material</th>
                    <th className="px-3 py-2 min-w-[180px] border-r border-blue-200">Nama Material Non-MDU</th>
                    <th className="px-3 py-2 min-w-[150px] border-r border-blue-200">Spesifikasi / Standar</th>
                    <th className="px-2.5 py-2 w-20 text-center border-r border-blue-200">Diminta</th>
                    <th className="px-2.5 py-2 w-20 text-center border-r border-blue-200">Satuan</th>
                    <th className="px-3 py-2 min-w-[140px]">Keterangan / Titik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {request.itemsNonMDU.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-3 text-center text-slate-400 italic">
                        Tidak ada item material Non-MDU pada permintaan ini.
                      </td>
                    </tr>
                  ) : (
                    request.itemsNonMDU.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-2.5 py-2 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="px-2.5 py-2 font-mono text-slate-600 border-r border-slate-200">{item.kodeMaterial || `NON-${idx + 1}`}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-200">{item.namaMaterial}</td>
                        <td className="px-3 py-2 text-slate-600 border-r border-slate-200">{item.spesifikasi || '-'}</td>
                        <td className="px-2.5 py-2 text-center font-bold text-slate-900 border-r border-slate-200">{item.volume}</td>
                        <td className="px-2.5 py-2 text-center text-slate-700 border-r border-slate-200">{item.satuan}</td>
                        <td className="px-3 py-2 text-slate-600">{item.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan Pengambilan */}
          {request.catatan && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-950">Catatan Pengambilan Gudang:</span>
              <p className="text-slate-700">{request.catatan}</p>
            </div>
          )}

          {/* 3-Column Signatures */}
          <div className="pt-6 border-t border-slate-300">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              {/* Kolom 1: Pemohon */}
              <div className="flex flex-col justify-between h-36">
                <div>
                  <div className="font-bold text-slate-900">Yang Meminta (Pemohon)</div>
                  <div className="text-[11px] text-slate-500">Mandor / Pelaksana SPBJ</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-900 underline">{request.pemohon}</div>
                  <div className="text-[10px] text-slate-500">Kontraktor Pelaksana</div>
                </div>
              </div>

              {/* Kolom 2: Pengawas PLN */}
              <div className="flex flex-col justify-between h-36">
                <div>
                  <div className="font-bold text-slate-900">Menyetujui (Pengawas)</div>
                  <div className="text-[11px] text-slate-500">Direksi Pekerjaan PLN</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-900 underline">{request.direksiPengawas}</div>
                  <div className="text-[10px] text-slate-500">Pengawas Lapangan PLN</div>
                </div>
              </div>

              {/* Kolom 3: Petugas Gudang */}
              <div className="flex flex-col justify-between h-36">
                <div>
                  <div className="font-bold text-slate-900">Menyerahkan (Petugas Gudang)</div>
                  <div className="text-[11px] text-slate-500">Bagian Logistik UP3</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-900 underline">{request.petugasGudang || 'Petugas Gudang PLN'}</div>
                  <div className="text-[10px] text-slate-500">Logistik &amp; Pergudangan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
            Dokumen ini dihasilkan secara elektronik oleh Sistem Monitoring Proyek Kelistrikan &amp; SPBJ. Sah digunakan sebagai bukti pengambilan material gudang.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
