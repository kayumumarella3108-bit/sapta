import React, { useState, useMemo } from 'react';
import { 
  PackagePlus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Layers, 
  Box, 
  Calendar, 
  MapPin, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { MaterialRequest, MaterialRequestStatus } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { 
  exportMaterialRequestToPDF, 
  exportMaterialRequestToExcel, 
  exportAllMaterialRequestsToExcel,
  getStatusBadgeStyle 
} from '../utils/materialExport';

interface MaterialRequestListProps {
  requests: MaterialRequest[];
  onCreateNew: () => void;
  onEdit: (request: MaterialRequest) => void;
  onDelete: (id: string) => void;
  onPrint: (request: MaterialRequest) => void;
}

export const MaterialRequestList: React.FC<MaterialRequestListProps> = ({
  requests,
  onCreateNew,
  onEdit,
  onDelete,
  onPrint,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Search matching
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchNo = r.nomorPermintaan.toLowerCase().includes(q);
        const matchPekerjaan = r.pekerjaan.toLowerCase().includes(q);
        const matchLokasi = r.lokasi.toLowerCase().includes(q);
        const matchSPBJ = r.noSPBJ.toLowerCase().includes(q);
        const matchPemohon = r.pemohon.toLowerCase().includes(q);
        const matchDireksi = r.direksiPengawas.toLowerCase().includes(q);
        const matchItem = 
          r.itemsMDU.some(item => item.namaMaterial.toLowerCase().includes(q)) ||
          r.itemsNonMDU.some(item => item.namaMaterial.toLowerCase().includes(q));

        if (!matchNo && !matchPekerjaan && !matchLokasi && !matchSPBJ && !matchPemohon && !matchDireksi && !matchItem) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [requests, search, statusFilter]);

  // Summary counts
  const totalMDUCount = useMemo(() => {
    return requests.reduce((sum, r) => sum + (r.itemsMDU?.length || 0), 0);
  }, [requests]);

  const totalNonMDUCount = useMemo(() => {
    return requests.reduce((sum, r) => sum + (r.itemsNonMDU?.length || 0), 0);
  }, [requests]);

  const handleExportAllExcel = () => {
    exportAllMaterialRequestsToExcel(filteredRequests);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shrink-0">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Permintaan
            </span>
            <span className="text-xl font-bold text-slate-900">
              {requests.length} <span className="text-xs font-medium text-slate-500">Dokumen Bon</span>
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 shrink-0 font-bold">
            MDU
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Item MDU Diminta
            </span>
            <span className="text-xl font-bold text-amber-900">
              {totalMDUCount} <span className="text-xs font-medium text-slate-500">Jenis Material</span>
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-300 shrink-0 font-bold">
            NON
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Item Non-MDU
            </span>
            <span className="text-xl font-bold text-blue-900">
              {totalNonMDUCount} <span className="text-xs font-medium text-slate-500">Aksesoris/Perkakas</span>
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Disetujui / Keluar
            </span>
            <span className="text-xl font-bold text-emerald-700">
              {requests.filter(r => r.status === 'DISETUJUI' || r.status === 'DIKELUARKAN').length}
              <span className="text-xs font-medium text-slate-500"> / {requests.length} Bon</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Action Buttons */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor bon, pekerjaan, lokasi, nomor SPBJ, mandor..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="DIAJUKAN">Diajukan</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DIKELUARKAN">Dikeluarkan</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Add Request & Export All Excel */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportAllExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            title="Export semua data permintaan material ke file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Rincian Kebutuhan MDU &amp; Non-MDU</span>
          </button>
        </div>
      </div>

      {/* List of Material Requests */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackagePlus className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Tidak Ada Data Permintaan Material</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Tidak ditemukan permintaan material yang cocok dengan filter pencarian Anda.'
              : 'Belum ada formulir permintaan material MDU atau Non-MDU yang dibuat.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Permintaan Sekarang</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const statusInfo = getStatusBadgeStyle(req.status);
            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-4 sm:px-6 sm:py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300 shrink-0 font-mono font-bold text-xs">
                      BON
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          {req.nomorPermintaan}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Diajukan: {formatDateIndo(req.tanggalPermintaan)}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono text-amber-700 font-semibold">
                          SPBJ: {req.noSPBJ}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this request */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onPrint(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Buka pratinjau cetak resmi dan cetak dokumen"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cetak</span>
                    </button>

                    <button
                      onClick={() => exportMaterialRequestToPDF(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Unduh langsung PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => exportMaterialRequestToExcel(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Unduh file Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>

                    <button
                      onClick={() => onEdit(req)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit formulir permintaan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus permintaan ${req.nomorPermintaan}?`)) {
                          onDelete(req.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus permintaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Pekerjaan & Lokasi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Pekerjaan
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {req.pekerjaan}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Lokasi
                      </span>
                      <p className="text-slate-700 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{req.lokasi}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mandor / Pemohon & Direksi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Pemohon (Mandor)</span>
                      <div className="font-bold text-slate-800 mt-0.5">{req.pemohon}</div>
                      {req.kontakPemohon && <div className="text-[11px] text-slate-500">{req.kontakPemohon}</div>}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Direksi Pengawas (PLN)</span>
                      <div className="font-bold text-slate-800 mt-0.5">{req.direksiPengawas}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Petugas Gudang</span>
                      <div className="font-bold text-slate-800 mt-0.5">{req.petugasGudang || 'Bagian Logistik UP3'}</div>
                    </div>
                  </div>

                  {/* Items Preview Grid (MDU vs Non-MDU) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {/* MDU Items Box */}
                    <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                            M
                          </span>
                          <span>Rincian Kebutuhan MDU</span>
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          {req.itemsMDU.length} Item
                        </span>
                      </div>

                      <div className="divide-y divide-amber-100/80 text-xs">
                        {req.itemsMDU.slice(0, 3).map((item, i) => (
                          <div key={item.id || i} className="py-1.5 flex items-center justify-between gap-2">
                            <div className="truncate flex-1">
                              <span className="font-semibold text-slate-800">{item.namaMaterial}</span>
                              {item.spesifikasi && (
                                <span className="text-[11px] text-slate-500 block truncate">{item.spesifikasi}</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-slate-900">{item.volume} {item.satuan}</span>
                            </div>
                          </div>
                        ))}
                        {req.itemsMDU.length > 3 && (
                          <div className="pt-1.5 text-[11px] text-amber-800 font-medium italic">
                            + {req.itemsMDU.length - 3} item MDU lainnya...
                          </div>
                        )}
                        {req.itemsMDU.length === 0 && (
                          <div className="py-2 text-slate-400 italic text-center">Tidak ada item MDU</div>
                        )}
                      </div>
                    </div>

                    {/* Non-MDU Items Box */}
                    <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                            N
                          </span>
                          <span>Rincian Kebutuhan Non-MDU</span>
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          {req.itemsNonMDU.length} Item
                        </span>
                      </div>

                      <div className="divide-y divide-blue-100/80 text-xs">
                        {req.itemsNonMDU.slice(0, 3).map((item, i) => (
                          <div key={item.id || i} className="py-1.5 flex items-center justify-between gap-2">
                            <div className="truncate flex-1">
                              <span className="font-semibold text-slate-800">{item.namaMaterial}</span>
                              {item.spesifikasi && (
                                <span className="text-[11px] text-slate-500 block truncate">{item.spesifikasi}</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-slate-900">{item.volume} {item.satuan}</span>
                            </div>
                          </div>
                        ))}
                        {req.itemsNonMDU.length > 3 && (
                          <div className="pt-1.5 text-[11px] text-blue-800 font-medium italic">
                            + {req.itemsNonMDU.length - 3} item Non-MDU lainnya...
                          </div>
                        )}
                        {req.itemsNonMDU.length === 0 && (
                          <div className="py-2 text-slate-400 italic text-center">Tidak ada item Non-MDU</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Catatan if any */}
                  {req.catatan && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">Catatan: </span>
                      <span>{req.catatan}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
