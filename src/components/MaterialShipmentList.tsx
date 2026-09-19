import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Edit3, 
  Trash2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  FileText, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Navigation,
  Phone,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  Presentation
} from 'lucide-react';
import { MaterialShipment, MaterialShipmentStatus } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface MaterialShipmentListProps {
  shipments: MaterialShipment[];
  onCreateNew: () => void;
  onEdit: (shipment: MaterialShipment) => void;
  onDelete: (id: string) => void;
  onPrint: (shipment: MaterialShipment) => void;
  onStatusChange?: (id: string, newStatus: MaterialShipmentStatus) => void;
  onDownloadPPT?: () => void;
}

export const MaterialShipmentList: React.FC<MaterialShipmentListProps> = ({
  shipments,
  onCreateNew,
  onEdit,
  onDelete,
  onPrint,
  onStatusChange,
  onDownloadPPT,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(null);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchNo = s.nomorSuratJalan.toLowerCase().includes(q);
        const matchEkspedisi = s.namaEkspedisi.toLowerCase().includes(q);
        const matchDriver = s.namaDriver.toLowerCase().includes(q);
        const matchPolisi = s.nomorPolisi.toLowerCase().includes(q);
        const matchPekerjaan = s.pekerjaan.toLowerCase().includes(q);
        const matchLokasi = s.lokasiTujuan.toLowerCase().includes(q);
        const matchSPBJ = s.noSPBJ.toLowerCase().includes(q);
        const matchItem = s.items.some(
          (item) =>
            item.namaMaterial.toLowerCase().includes(q) ||
            item.kodeMaterial.toLowerCase().includes(q)
        );

        if (
          !matchNo &&
          !matchEkspedisi &&
          !matchDriver &&
          !matchPolisi &&
          !matchPekerjaan &&
          !matchLokasi &&
          !matchSPBJ &&
          !matchItem
        ) {
          return false;
        }
      }

      if (statusFilter !== 'ALL' && s.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [shipments, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = shipments.length;
    const prosesMuat = shipments.filter((s) => s.status === 'PROSES_MUAT').length;
    const dalamPengiriman = shipments.filter((s) => s.status === 'DIKIRIM').length;
    const selesaiTerkirim = shipments.filter((s) => s.status === 'TERKIRIM').length;
    const totalVolume = shipments.reduce(
      (sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + (Number(item.jumlah) || 0), 0),
      0
    );

    return { total, prosesMuat, dalamPengiriman, selesaiTerkirim, totalVolume };
  }, [shipments]);

  const toggleExpand = (id: string) => {
    setExpandedShipmentId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: MaterialShipmentStatus) => {
    switch (status) {
      case 'PROSES_MUAT':
        return {
          label: 'Proses Muat / Persiapan',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'DIKIRIM':
        return {
          label: 'Dalam Perjalanan (On Delivery)',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'TERKIRIM':
        return {
          label: 'Telah Diterima di Lokasi',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'TERTUNDA':
        return {
          label: 'Pengiriman Tertunda / Kendala',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Pengiriman */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pengiriman</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Surat Jalan Terdata</div>
        </div>

        {/* Card 2: Dalam Pengiriman */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">Dalam Pengiriman</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">{stats.dalamPengiriman}</div>
          <div className="text-[11px] text-blue-700 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Armada sedang di jalan
          </div>
        </div>

        {/* Card 3: Selesai Terkirim */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Selesai Terkirim</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{stats.selesaiTerkirim}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Diterima mandor lokasi</div>
        </div>

        {/* Card 4: Total Volume Material */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Total Material</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{stats.totalVolume}</div>
          <div className="text-[11px] text-amber-800 mt-0.5">Volume unit/meter/batang</div>
        </div>
      </div>

      {/* 2. Filter, Search & Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Surat Jalan, Ekspedisi, Driver, No Plat, Proyek, atau Material..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filter by Status & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({shipments.length})
            </button>
            <button
              onClick={() => setStatusFilter('PROSES_MUAT')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'PROSES_MUAT'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Muat ({stats.prosesMuat})
            </button>
            <button
              onClick={() => setStatusFilter('DIKIRIM')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'DIKIRIM'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dikirim ({stats.dalamPengiriman})
            </button>
            <button
              onClick={() => setStatusFilter('TERKIRIM')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'TERKIRIM'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terkirim ({stats.selesaiTerkirim})
            </button>
          </div>

          {onDownloadPPT && (
            <button
              id="btn-download-ppt-shipments"
              onClick={onDownloadPPT}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Download Presentasi PPT Pengiriman Material (Surat Jalan)"
            >
              <Presentation className="w-4 h-4 text-amber-600" />
              <span>Download PPT</span>
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Surat Jalan Baru</span>
          </button>
        </div>
      </div>

      {/* 3. Shipment Cards List */}
      {filteredShipments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada data pengiriman material</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Tidak ada surat jalan pengiriman yang cocok dengan filter atau kata kunci pencarian.'
              : 'Belum ada pengiriman yang dicatat. Buat surat jalan pengiriman material pertama untuk mencatat ekspedisi dan armada pengangkut.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Jalan Pengiriman</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => {
            const statusStyle = getStatusBadge(shipment.status);
            const isExpanded = expandedShipmentId === shipment.id;
            const mduCount = shipment.items.filter((i) => i.kategori === 'MDU').length;
            const nonMduCount = shipment.items.filter((i) => i.kategori === 'NON_MDU').length;
            const totalVol = shipment.items.reduce((acc, i) => acc + (Number(i.jumlah) || 0), 0);

            return (
              <div
                key={shipment.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Main Card Header & Overview */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info Surat Jalan & Ekspedisi */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-amber-400 shadow-2xs">
                          {shipment.nomorSuratJalan}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyle.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                          <span>{statusStyle.label}</span>
                        </span>

                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Kirim: {formatDateIndo(shipment.tanggalKirim)}</span>
                        </span>
                      </div>

                      {/* Ekspedisi & Driver Detail */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{shipment.namaEkspedisi}</span>
                          <span className="text-slate-400 font-normal">({shipment.jenisArmada})</span>
                        </div>

                        <div className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {shipment.nomorPolisi}
                        </div>

                        <div className="text-slate-600 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Driver: <strong className="text-slate-800">{shipment.namaDriver}</strong> {shipment.kontakDriver && `(${shipment.kontakDriver})`}</span>
                        </div>
                      </div>

                      {/* Project & Rute Destination */}
                      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <span className="text-slate-500">Proyek: </span>
                            <strong className="text-slate-900">{shipment.pekerjaan}</strong>
                            {shipment.noSPBJ && (
                              <span className="font-mono text-slate-500 ml-1">({shipment.noSPBJ})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <span className="text-slate-500">Tujuan: </span>
                            <strong className="text-slate-800">{shipment.lokasiTujuan}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons & Status Selector */}
                    <div className="flex flex-wrap lg:flex-col items-end justify-between lg:justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      {/* Status quick changer */}
                      {onStatusChange && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">Ubah Status:</span>
                          <select
                            value={shipment.status}
                            onChange={(e) => onStatusChange(shipment.id, e.target.value as MaterialShipmentStatus)}
                            className="text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="PROSES_MUAT">Proses Muat</option>
                            <option value="DIKIRIM">Dikirim (On Delivery)</option>
                            <option value="TERKIRIM">Terkirim (Diterima)</option>
                            <option value="TERTUNDA">Tertunda</option>
                          </select>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPrint(shipment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200"
                          title="Cetak Surat Jalan Pengiriman"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>Cetak Surat Jalan</span>
                        </button>

                        <button
                          onClick={() => onEdit(shipment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                          title="Edit Informasi Surat Jalan"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onDelete(shipment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title="Hapus Surat Jalan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleExpand(shipment.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title={isExpanded ? 'Tutup Rincian Material' : 'Buka Rincian Material'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Material summary pills bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-amber-500" />
                        <span>Total: <strong>{shipment.items.length} Item</strong> ({totalVol} Volume)</span>
                      </span>
                      {mduCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                          {mduCount} Material MDU
                        </span>
                      )}
                      {nonMduCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-blue-100 text-blue-800 border border-blue-200">
                          {nonMduCount} Material Non-MDU
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpand(shipment.id)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Sembunyikan Rincian' : 'Lihat Rincian Item'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Material Items Table */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        Rincian Manifest Material dalam Armada
                      </h4>
                      {shipment.penerimaNama && (
                        <span className="text-[11px] text-slate-600">
                          Penerima: <strong className="text-slate-900">{shipment.penerimaNama}</strong> {shipment.penerimaKontak ? `(${shipment.penerimaKontak})` : ''}
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 w-10 text-center">No</th>
                            <th className="px-3 py-2 w-20">Kategori</th>
                            <th className="px-3 py-2 w-28">Kode</th>
                            <th className="px-3 py-2">Nama &amp; Spesifikasi Material</th>
                            <th className="px-3 py-2 w-20 text-center">Jumlah</th>
                            <th className="px-3 py-2 w-20 text-center">Satuan</th>
                            <th className="px-3 py-2 w-32">Kondisi</th>
                            <th className="px-3 py-2 w-36">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {shipment.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-center font-bold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                    item.kategori === 'MDU'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {item.kategori}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                                {item.kodeMaterial}
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-bold text-slate-900">{item.namaMaterial}</div>
                                {item.spesifikasi && (
                                  <div className="text-[11px] text-slate-500">{item.spesifikasi}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center font-black text-amber-700 bg-amber-50/50">
                                {item.jumlah}
                              </td>
                              <td className="px-3 py-2 text-center text-slate-600 uppercase font-medium">
                                {item.satuan}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {item.kondisi || 'Baik'}
                              </td>
                              <td className="px-3 py-2 text-[11px] text-slate-500">
                                {item.keterangan || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {shipment.catatanPengiriman && (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                        <strong>Catatan Khusus Pengiriman:</strong> {shipment.catatanPengiriman}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
