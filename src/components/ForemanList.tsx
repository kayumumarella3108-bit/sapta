import React, { useState, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  UserCheck, 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  HardHat,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ChevronDown,
  Building2,
  Sparkles,
  Presentation
} from 'lucide-react';
import { ForemanItem, ForemanStatus, ForemanAssignment } from '../types';

interface ForemanListProps {
  foremen: ForemanItem[];
  onCreateNew: () => void;
  onEdit: (foreman: ForemanItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: ForemanStatus) => void;
  onDownloadPPT?: () => void;
}

export const ForemanList: React.FC<ForemanListProps> = ({
  foremen,
  onCreateNew,
  onEdit,
  onDelete,
  onStatusChange,
  onDownloadPPT,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [picFilter, setPicFilter] = useState<string>('ALL');
  const [lokasiFilter, setLokasiFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract all unique PICs and locations across all foreman assignments
  const allPics = useMemo(() => {
    const set = new Set<string>();
    foremen.forEach((f) => {
      f.assignments.forEach((a) => {
        if (a.pic && a.pic.trim()) set.add(a.pic.trim());
      });
    });
    return Array.from(set).sort();
  }, [foremen]);

  const allLocations = useMemo(() => {
    const set = new Set<string>();
    foremen.forEach((f) => {
      f.assignments.forEach((a) => {
        if (a.lokasiPekerjaan && a.lokasiPekerjaan.trim()) set.add(a.lokasiPekerjaan.trim());
      });
    });
    return Array.from(set).sort();
  }, [foremen]);

  // Filtered Foremen
  const filteredForemen = useMemo(() => {
    return foremen.filter((f) => {
      // Search matching nama mandor, kontak, spesialisasi, lokasi, or pic
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.namaMandor.toLowerCase().includes(q) ||
        (f.kontak && f.kontak.toLowerCase().includes(q)) ||
        (f.spesialisasi && f.spesialisasi.toLowerCase().includes(q)) ||
        (f.catatan && f.catatan.toLowerCase().includes(q)) ||
        f.assignments.some(
          (a) =>
            a.lokasiPekerjaan.toLowerCase().includes(q) ||
            a.pic.toLowerCase().includes(q) ||
            (a.namaPekerjaan && a.namaPekerjaan.toLowerCase().includes(q)) ||
            (a.keterangan && a.keterangan.toLowerCase().includes(q))
        );

      // Status filter
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;

      // PIC filter
      const matchPic =
        picFilter === 'ALL' || f.assignments.some((a) => a.pic.trim() === picFilter);

      // Lokasi filter
      const matchLokasi =
        lokasiFilter === 'ALL' ||
        f.assignments.some((a) => a.lokasiPekerjaan.trim() === lokasiFilter);

      return matchSearch && matchStatus && matchPic && matchLokasi;
    });
  }, [foremen, search, statusFilter, picFilter, lokasiFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalMandor = foremen.length;
    const activeMandor = foremen.filter((f) => f.status === 'AKTIF').length;
    const standbyMandor = foremen.filter((f) => f.status === 'STANDBY').length;
    const totalAssignments = foremen.reduce((acc, f) => acc + (f.assignments?.length || 0), 0);
    const totalWorkers = foremen.reduce((acc, f) => acc + (f.jumlahAnggota || 0), 0);
    const uniqueLocationsCount = allLocations.length;
    const uniquePicsCount = allPics.length;

    return {
      totalMandor,
      activeMandor,
      standbyMandor,
      totalAssignments,
      totalWorkers,
      uniqueLocationsCount,
      uniquePicsCount
    };
  }, [foremen, allLocations, allPics]);

  const getStatusBadge = (status: ForemanStatus) => {
    switch (status) {
      case 'AKTIF':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Aktif (Di Lapangan)
          </span>
        );
      case 'STANDBY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Standby (Siap Tugas)
          </span>
        );
      case 'CUTI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Cuti
          </span>
        );
      case 'NON_AKTIF':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Non-Aktif
          </span>
        );
      default:
        return null;
    }
  };

  const getAssignmentStatusPill = (status?: string) => {
    switch (status) {
      case 'BERJALAN':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Berjalan</span>;
      case 'PERSIAPAN':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Persiapan</span>;
      case 'SELESAI':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">Selesai</span>;
      default:
        return null;
    }
  };

  // Export foremen to CSV
  const handleExportCSV = () => {
    if (foremen.length === 0) return;
    const headers = ['Nama Mandor', 'Kontak / WA', 'Status', 'Spesialisasi', 'Jumlah Tim (Org)', 'Lokasi Pekerjaan', 'PIC Pengawas', 'No SPBJ', 'Status Penugasan', 'Catatan'];
    
    const rows: string[][] = [];
    foremen.forEach((f) => {
      if (f.assignments.length === 0) {
        rows.push([
          f.namaMandor,
          f.kontak,
          f.status,
          f.spesialisasi || '',
          String(f.jumlahAnggota || 0),
          '-',
          '-',
          '-',
          '-',
          f.catatan || ''
        ]);
      } else {
        f.assignments.forEach((a) => {
          rows.push([
            f.namaMandor,
            f.kontak,
            f.status,
            f.spesialisasi || '',
            String(f.jumlahAnggota || 0),
            a.lokasiPekerjaan,
            a.pic,
            a.noSPBJ || a.namaPekerjaan || '',
            a.statusPenugasan || 'BERJALAN',
            f.catatan || ''
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Mandor_PLN_ME_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="foreman-list-view">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Mandor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Mandor</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalMandor} <span className="text-xs font-medium text-slate-500">Orang</span></p>
          </div>
        </div>

        {/* Mandor Aktif */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Mandor Aktif Lapangan</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats.activeMandor} <span className="text-xs font-medium text-slate-500">Tim</span></p>
          </div>
        </div>

        {/* Total Penugasan / Lokasi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Lokasi Dikelola</p>
            <p className="text-xl font-bold text-blue-700 mt-0.5">{stats.totalAssignments} <span className="text-xs font-medium text-slate-500">Titik</span></p>
          </div>
        </div>

        {/* PIC Terhubung */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">PIC Pengawas Terkait</p>
            <p className="text-xl font-bold text-purple-700 mt-0.5">{stats.uniquePicsCount} <span className="text-xs font-medium text-slate-500">Pengawas</span></p>
          </div>
        </div>

        {/* Total Tenaga Kerja */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Estimasi Total Pekerja</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalWorkers} <span className="text-xs font-medium text-slate-500">Personil</span></p>
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar (Search, Filter, Mode & Action) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama mandor, lokasi, PIC pengawas, spesialisasi atau no telp..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download PPT */}
            {onDownloadPPT && (
              <button
                id="btn-download-ppt-foremen"
                onClick={onDownloadPPT}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
                title="Download Presentasi PPT Data Mandor & Manpower"
              >
                <Presentation className="w-3.5 h-3.5 text-amber-600" />
                <span>Download PPT</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Download Data Rekap Mandor dalam format Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Kartu
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tabel Rinci
              </button>
            </div>

            {/* Tambah Mandor Button */}
            <button
              id="btn-tambah-mandor-baru"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mandor Baru</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">Semua Status Mandor</option>
            <option value="AKTIF">🟢 Aktif di Lapangan</option>
            <option value="STANDBY">🟡 Standby Siap Tugas</option>
            <option value="CUTI">⚪ Sedang Cuti</option>
            <option value="NON_AKTIF">🔴 Non-Aktif</option>
          </select>

          {/* Filter PIC */}
          <select
            value={picFilter}
            onChange={(e) => setPicFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">Semua PIC Pengawas ({allPics.length})</option>
            {allPics.map((pic) => (
              <option key={pic} value={pic}>
                PIC: {pic}
              </option>
            ))}
          </select>

          {/* Filter Lokasi */}
          <select
            value={lokasiFilter}
            onChange={(e) => setLokasiFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer max-w-[220px] truncate"
          >
            <option value="ALL">Semua Lokasi ({allLocations.length})</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                Lokasi: {loc}
              </option>
            ))}
          </select>

          {(search || statusFilter !== 'ALL' || picFilter !== 'ALL' || lokasiFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPicFilter('ALL');
                setLokasiFilter('ALL');
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer ml-auto"
            >
              Reset Filter ({filteredForemen.length} hasil)
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Foremen Content (Grid Cards or Table) */}
      {filteredForemen.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tidak ada data mandor yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Silakan sesuaikan kata kunci pencarian atau filter, atau tambahkan data mandor baru beserta daftar lokasi pekerjaan dan PIC pengawas.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mandor Sekarang</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filteredForemen.map((foreman) => (
            <div
              key={foreman.id}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              id={`foreman-card-${foreman.id}`}
            >
              {/* Card Header: Profil, Kontak, Status */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0">
                      <HardHat className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{foreman.namaMandor}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {foreman.kontak && (
                          <a
                            href={`https://wa.me/${foreman.kontak.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium"
                            title="Chat WhatsApp Mandor"
                          >
                            <Phone className="w-3 h-3 text-amber-600" />
                            <span>{foreman.kontak}</span>
                          </a>
                        )}
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Users className="w-3 h-3 text-slate-400" />
                          <strong className="font-semibold text-slate-700">{foreman.jumlahAnggota || 1}</strong> Personil
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>{getStatusBadge(foreman.status)}</div>
                </div>

                {/* Spesialisasi */}
                <div className="py-2.5">
                  <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                    🛠️ {foreman.spesialisasi || 'General Mechanical & Electrical'}
                  </span>
                </div>

                {/* USER CORE FEATURE: Multi-Lokasi & Multi-PIC */}
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Daftar Lokasi &amp; PIC Terkait</span>
                    </span>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      {foreman.assignments?.length || 0} Lokasi
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {foreman.assignments && foreman.assignments.length > 0 ? (
                      foreman.assignments.map((asg, idx) => (
                        <div
                          key={asg.id || idx}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs hover:bg-amber-50/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span className="truncate">{asg.lokasiPekerjaan}</span>
                            </div>
                            {getAssignmentStatusPill(asg.statusPenugasan)}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate font-medium">
                                PIC: <strong className="text-slate-800">{asg.pic}</strong>
                              </span>
                            </div>

                            {asg.picKontak && (
                              <div className="flex items-center gap-1 text-slate-500 truncate">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{asg.picKontak}</span>
                              </div>
                            )}
                          </div>

                          {asg.namaPekerjaan && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate pt-0.5 border-t border-slate-200/60">
                              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{asg.namaPekerjaan}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">Belum ada lokasi pekerjaan yang ditugaskan.</p>
                    )}
                  </div>

                  {foreman.catatan && (
                    <p className="text-[11px] text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100 italic mt-2">
                      &ldquo;{foreman.catatan}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100">
                {/* Status Toggle dropdown */}
                <select
                  value={foreman.status}
                  onChange={(e) => onStatusChange(foreman.id, e.target.value as ForemanStatus)}
                  className="text-xs font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  <option value="AKTIF">Ubah: Aktif</option>
                  <option value="STANDBY">Ubah: Standby</option>
                  <option value="CUTI">Ubah: Cuti</option>
                  <option value="NON_AKTIF">Ubah: Non-Aktif</option>
                </select>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(foreman)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDelete(foreman.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Data Mandor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW (TABEL RINCI PENUGASAN MULTI-LOKASI & PIC) */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Mandor &amp; Kontak</th>
                  <th className="py-3.5 px-4">Spesialisasi &amp; Tim</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Daftar Lokasi &amp; PIC Pengawas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredForemen.map((foreman) => (
                  <tr key={foreman.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">{foreman.namaMandor}</div>
                      {foreman.kontak && (
                        <div className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-600" />
                          <span>{foreman.kontak}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-[220px]">
                      <div className="text-slate-800 font-medium truncate" title={foreman.spesialisasi}>
                        {foreman.spesialisasi || 'Mekanikal Elektrikal'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{foreman.jumlahAnggota || 1} Personil Tim</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      {getStatusBadge(foreman.status)}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5">
                        {foreman.assignments.map((asg, idx) => (
                          <div
                            key={asg.id || idx}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-600" />
                                <span>{asg.lokasiPekerjaan}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                                <UserCheck className="w-3 h-3 text-blue-600" />
                                <span>PIC: <strong>{asg.pic}</strong> {asg.picKontak ? `(${asg.picKontak})` : ''}</span>
                              </div>
                            </div>
                            {getAssignmentStatusPill(asg.statusPenugasan)}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(foreman)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(foreman.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Mandor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
