import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Box, 
  PackageCheck,
  Coins,
  Sparkles,
  Info,
  Presentation
} from 'lucide-react';
import { MasterMaterialCategory, MasterMaterialItem } from '../types';
import { exportMasterMaterialsToExcel, exportMasterMaterialsToCSV } from '../utils/masterMaterialExport';

interface MasterMaterialViewProps {
  materials: MasterMaterialItem[];
  onAddMaterial: (category?: MasterMaterialCategory) => void;
  onEditMaterial: (item: MasterMaterialItem) => void;
  onDeleteMaterial: (id: string, namaMaterial: string) => void;
  onResetToDefault: () => void;
  onOpenMaterialRequests?: () => void;
  onDownloadPPT?: () => void;
}

export const MasterMaterialView: React.FC<MasterMaterialViewProps> = ({
  materials,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onResetToDefault,
  onOpenMaterialRequests,
  onDownloadPPT,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MDU' | 'NON_MDU'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedKelompok, setSelectedKelompok] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter based on active tab
  const tabFiltered = useMemo(() => {
    if (activeTab === 'ALL') return materials;
    return materials.filter((m) => m.kategori === activeTab);
  }, [materials, activeTab]);

  // Unique kelompok for current tab
  const availableKelompok = useMemo(() => {
    const set = new Set<string>();
    tabFiltered.forEach((m) => set.add(m.kelompok));
    return Array.from(set).sort();
  }, [tabFiltered]);

  // Search & Kelompok Filter
  const filteredMaterials = useMemo(() => {
    return tabFiltered.filter((m) => {
      const matchSearch =
        search === '' ||
        m.namaMaterial.toLowerCase().includes(search.toLowerCase()) ||
        m.kodeMaterial.toLowerCase().includes(search.toLowerCase()) ||
        (m.spesifikasi ? m.spesifikasi.toLowerCase().includes(search.toLowerCase()) : false) ||
        m.kelompok.toLowerCase().includes(search.toLowerCase());

      const matchKelompok = selectedKelompok === 'ALL' || m.kelompok === selectedKelompok;

      return matchSearch && matchKelompok;
    });
  }, [tabFiltered, search, selectedKelompok]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = materials.length;
    const mduCount = materials.filter((m) => m.kategori === 'MDU').length;
    const nonMduCount = materials.filter((m) => m.kategori === 'NON_MDU').length;
    const uniqueKelompokCount = new Set(materials.map((m) => m.kelompok)).size;
    const totalStockUnits = materials.reduce((acc, curr) => acc + (curr.stokGudang || 0), 0);

    return { total, mduCount, nonMduCount, uniqueKelompokCount, totalStockUnits };
  }, [materials]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleExportExcel = () => {
    exportMasterMaterialsToExcel(filteredMaterials);
  };

  const handleExportCSV = () => {
    exportMasterMaterialsToCSV(filteredMaterials);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Master Material */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Master Data
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs font-medium text-slate-500">Item Terdaftar</span>
          </div>
        </div>

        {/* Total MDU */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Rincian MDU
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
              M
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950">{metrics.mduCount}</span>
            <span className="text-xs font-medium text-amber-700">Item Utama</span>
          </div>
        </div>

        {/* Total Non-MDU */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Rincian Non-MDU
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold text-xs">
              N
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950">{metrics.nonMduCount}</span>
            <span className="text-xs font-medium text-blue-700">Item Aksesoris</span>
          </div>
        </div>

        {/* Kelompok / Sub-Kategori */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kelompok SPLN
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.uniqueKelompokCount}</span>
            <span className="text-xs font-medium text-slate-500">Klasifikasi</span>
          </div>
        </div>

        {/* Total Stok Fisik */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Total Stok Gudang
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-emerald-950 truncate">
              {metrics.totalStockUnits.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] font-medium text-emerald-700">
              Unit/Pcs Tersedia
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Master Data Material MDU dan Non-MDU
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Katalog master resmi item kelistrikan PLN standar SPLN. Digunakan langsung pada Bon Permintaan Gudang dan RAB Pekerjaan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onDownloadPPT && (
                <button
                  id="btn-download-ppt-master-materials"
                  onClick={onDownloadPPT}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Download Presentasi PPT Master Data Material PLN"
                >
                  <Presentation className="w-3.5 h-3.5 text-amber-600" />
                  <span>Download PPT</span>
                </button>
              )}

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                title="Download Master Data ke format Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => onAddMaterial('MDU')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Master Material</span>
              </button>

              <button
                onClick={onResetToDefault}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reset ke Katalog Standar PLN SPLN"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => {
                  setActiveTab('ALL');
                  setSelectedKelompok('ALL');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Semua Material ({materials.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('MDU');
                  setSelectedKelompok('ALL');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'MDU'
                    ? 'bg-white text-amber-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  M
                </span>
                <span>Rincian Kebutuhan MDU ({metrics.mduCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('NON_MDU');
                  setSelectedKelompok('ALL');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'NON_MDU'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  N
                </span>
                <span>Rincian Kebutuhan Non-MDU ({metrics.nonMduCount})</span>
              </button>
            </div>

            {/* Quick Link to Material Requests */}
            {onOpenMaterialRequests && (
              <button
                onClick={onOpenMaterialRequests}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold inline-flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Lihat Formulir Permintaan Material Bon PLN &rarr;</span>
              </button>
            )}
          </div>

          {/* Search & Kelompok Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan kode material, nama, spesifikasi SPLN, kelompok..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedKelompok}
                onChange={(e) => setSelectedKelompok(e.target.value)}
                className="w-full sm:w-auto text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">Semua Kelompok / Sub-Kategori ({availableKelompok.length})</option>
                {availableKelompok.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Database className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Tidak Ada Data Material Ditemukan</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || selectedKelompok !== 'ALL'
                  ? 'Tidak ada item yang sesuai dengan filter pencarian.'
                  : 'Belum ada item master material pada kategori ini.'}
              </p>
              <button
                onClick={() => onAddMaterial(activeTab === 'ALL' ? 'MDU' : activeTab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Material Sekarang</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-32">Kode Material</th>
                  <th className="py-3 px-3 w-28">Kategori</th>
                  <th className="py-3 px-3 w-44">Kelompok</th>
                  <th className="py-3 px-4 min-w-[220px]">Nama Material</th>
                  <th className="py-3 px-3 w-24 text-center">Satuan</th>
                  <th className="py-3 px-3 w-28 text-right">Stok Gudang</th>
                  <th className="py-3 px-3 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((item, idx) => {
                  const isMDU = item.kategori === 'MDU';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Kode Material */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            {item.kodeMaterial}
                          </span>
                          <button
                            onClick={() => handleCopyCode(item.kodeMaterial, item.id)}
                            className="text-slate-300 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                            title="Salin Kode Material"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Kategori Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isMDU
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isMDU ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                          />
                          <span>{isMDU ? 'MDU' : 'Non-MDU'}</span>
                        </span>
                      </td>

                      {/* Kelompok */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="line-clamp-1 text-[11px]" title={item.kelompok}>
                          {item.kelompok}
                        </span>
                      </td>

                      {/* Nama Material */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{item.namaMaterial}</div>
                        {item.keterangan && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                            {item.keterangan}
                          </div>
                        )}
                      </td>

                      {/* Satuan */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          {item.satuan}
                        </span>
                      </td>

                      {/* Stok Gudang */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {item.stokGudang !== undefined ? (
                          <span
                            className={`text-xs ${
                              item.stokGudang > 0 ? 'text-slate-900' : 'text-rose-500'
                            }`}
                          >
                            {item.stokGudang.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditMaterial(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Material"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteMaterial(item.id, item.namaMaterial)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer Summary */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredMaterials.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{materials.length}</span> total master material
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>MDU: {metrics.mduCount} item</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Non-MDU: {metrics.nonMduCount} item</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
