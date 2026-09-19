import React, { useState, useMemo } from 'react';
import { 
  WorkPlan, 
  WorkPlanItem, 
  WorkPlanStatus, 
  WorkPlanItemStatus, 
  ProjectItem, 
  ForemanItem 
} from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  UserCheck, 
  HardHat, 
  Users, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileSpreadsheet, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Sparkles,
  Zap,
  Check,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Table as TableIcon,
  Presentation
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

interface WorkPlanListProps {
  workPlans: WorkPlan[];
  projects: ProjectItem[];
  foremen: ForemanItem[];
  onAddPlan: () => void;
  onEditPlan: (plan: WorkPlan) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlan: (plan: WorkPlan) => void;
  onPrintPlan: (plan: WorkPlan) => void;
  onDownloadPPT?: () => void;
}

export const WorkPlanList: React.FC<WorkPlanListProps> = ({
  workPlans,
  projects,
  foremen,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onUpdatePlan,
  onPrintPlan,
  onDownloadPPT,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(new Set());

  // Toggle expanded card items
  const toggleExpand = (id: string) => {
    setExpandedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const toggleExpandAll = () => {
    if (expandedPlanIds.size === workPlans.length) {
      setExpandedPlanIds(new Set());
    } else {
      setExpandedPlanIds(new Set(workPlans.map((w) => w.id)));
    }
  };

  // Quick toggle item status in a plan
  const handleToggleItemStatus = (plan: WorkPlan, itemId: string) => {
    const updatedItems = plan.items.map((item) => {
      if (item.id === itemId) {
        let nextStatus: WorkPlanItemStatus = 'BELUM_MULAI';
        if (item.status === 'BELUM_MULAI') nextStatus = 'SEDANG_DIKERJAKAN';
        else if (item.status === 'SEDANG_DIKERJAKAN') nextStatus = 'SELESAI';
        else nextStatus = 'BELUM_MULAI';
        return { ...item, status: nextStatus };
      }
      return item;
    });

    // Compute automatic plan status if all items completed
    const allDone = updatedItems.length > 0 && updatedItems.every((it) => it.status === 'SELESAI');
    const hasStarted = updatedItems.some((it) => it.status === 'SEDANG_DIKERJAKAN' || it.status === 'SELESAI');
    
    let updatedPlanStatus = plan.status;
    if (allDone) {
      updatedPlanStatus = 'SELESAI';
    } else if (hasStarted && plan.status === 'TERJADWAL') {
      updatedPlanStatus = 'SEDANG_BERJALAN';
    }

    onUpdatePlan({
      ...plan,
      items: updatedItems,
      status: updatedPlanStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Quick change whole plan status
  const handleChangePlanStatus = (plan: WorkPlan, newStatus: WorkPlanStatus) => {
    onUpdatePlan({
      ...plan,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Filtered work plans
  const filteredPlans = useMemo(() => {
    return workPlans.filter((plan) => {
      // Search term
      const matchesSearch =
        searchTerm === '' ||
        plan.nomorRencana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.judulRencana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.mandor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.namaPekerjaan && plan.namaPekerjaan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.noSPBJ && plan.noSPBJ.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plan.items.some((it) => it.uraianPekerjaan.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'ALL' || (plan.prioritas || 'NORMAL') === priorityFilter;

      // Date filter
      const matchesDate = !dateFilter || plan.tanggal === dateFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [workPlans, searchTerm, statusFilter, priorityFilter, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = workPlans.length;
    const terjadwal = workPlans.filter((w) => w.status === 'TERJADWAL').length;
    const berjalan = workPlans.filter((w) => w.status === 'SEDANG_BERJALAN').length;
    const selesai = workPlans.filter((w) => w.status === 'SELESAI').length;
    
    let totalItems = 0;
    let completedItems = 0;
    let totalManpower = 0;

    workPlans.forEach((w) => {
      totalManpower += w.manpowerCount || 0;
      totalItems += w.items.length;
      completedItems += w.items.filter((it) => it.status === 'SELESAI').length;
    });

    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return { total, terjadwal, berjalan, selesai, totalItems, completedItems, completionRate, totalManpower };
  }, [workPlans]);

  // Export All to CSV
  const handleExportAllCSV = () => {
    const headers = [
      'No Rencana',
      'Tanggal',
      'Judul Rencana',
      'Lokasi',
      'Paket Pekerjaan / SPBJ',
      'PIC Pengawas',
      'Mandor',
      'Tenaga Kerja (Org)',
      'Status Rencana',
      'Prioritas',
      'Total Item',
      'Item Selesai',
      'Progress (%)',
      'Daftar Uraian Pekerjaan'
    ];

    const rows = filteredPlans.map((p) => {
      const totalIt = p.items.length;
      const doneIt = p.items.filter((it) => it.status === 'SELESAI').length;
      const pct = totalIt > 0 ? Math.round((doneIt / totalIt) * 100) : 0;
      const itemsStr = p.items.map((it, idx) => `${idx + 1}. ${it.uraianPekerjaan} (${it.volume} ${it.satuan} - ${it.status})`).join('; ');

      return [
        `"${p.nomorRencana}"`,
        `"${p.tanggal}"`,
        `"${p.judulRencana.replace(/"/g, '""')}"`,
        `"${p.lokasi.replace(/"/g, '""')}"`,
        `"${(p.namaPekerjaan || '').replace(/"/g, '""')}"`,
        `"${p.pic}"`,
        `"${p.mandor}"`,
        `"${p.manpowerCount}"`,
        `"${p.status}"`,
        `"${p.prioritas || 'NORMAL'}"`,
        `"${totalIt}"`,
        `"${doneIt}"`,
        `"${pct}%"`,
        `"${itemsStr.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Rencana_Kerja_ME_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: WorkPlanStatus) => {
    switch (status) {
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai
          </span>
        );
      case 'SEDANG_BERJALAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Sedang Berjalan
          </span>
        );
      case 'TERJADWAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            Terjadwal
          </span>
        );
      case 'TERTUNDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Tertunda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: 'NORMAL' | 'TINGGI' | 'URGENT') => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-red-600 text-white shadow-xs">
            <Flame className="w-3 h-3 text-amber-300" />
            URGENT
          </span>
        );
      case 'TINGGI':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950">
            TINGGI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Row */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              Operasional Lapangan
            </span>
            <span className="text-xs text-amber-300/80 font-medium">PT Sapta Manunggal Karya</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-amber-400" />
            Rencana Kerja Lapangan (Work Plan)
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Perencanaan jadwal harian/mingguan divisi Mechanical Electrical: penugasan lokasi titik kerja, PIC pengawas, mandor pelaksana, serta rincian item uraian pekerjaan elektrikal terintegrasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onDownloadPPT && (
            <button
              id="btn-download-ppt-workplans"
              onClick={onDownloadPPT}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 transition-all shadow-xs cursor-pointer"
              title="Download Presentasi PPT Rencana Kerja Lapangan"
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>Download PPT</span>
            </button>
          )}

          <button
            onClick={handleExportAllCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all shadow-xs cursor-pointer"
            title="Download Rekap CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Rekap Excel</span>
          </button>

          <button
            onClick={onAddPlan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/25 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Rencana Kerja</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Rencana</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-medium">Rencana Kerja Terdata</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Terjadwal</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.terjadwal}</p>
          <span className="text-[10px] text-amber-700/80 font-medium">Siap Dilaksanakan</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Sedang Berjalan</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.berjalan}</p>
          <span className="text-[10px] text-blue-700/80 font-medium">Dalam Pelaksanaan</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Selesai</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.selesai}</p>
          <span className="text-[10px] text-emerald-700/80 font-medium">Tuntas Lapangan</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Item Pekerjaan</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats.completedItems}<span className="text-xs text-slate-400 font-normal">/{stats.totalItems}</span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Tenaga</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats.totalManpower} <span className="text-xs text-slate-500 font-normal">Org</span>
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Personil Lapangan</span>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no rencana, lokasi, PIC, mandor, uraian..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              title="Filter Berdasarkan Tanggal"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="ALL">Semua Status</option>
              <option value="TERJADWAL">Terjadwal</option>
              <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
              <option value="SELESAI">Selesai</option>
              <option value="TERTUNDA">Tertunda</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="URGENT">Urgent</option>
              <option value="TINGGI">Tinggi</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          {/* View Toggle & Expand All */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
            <button
              onClick={toggleExpandAll}
              className="px-2.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Buka / Tutup Semua Rincian Item"
            >
              {expandedPlanIds.size === workPlans.length ? 'Tutup Rincian' : 'Buka Rincian'}
            </button>

            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Active filter reset notice */}
        {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Menampilkan <strong>{filteredPlans.length}</strong> dari <strong>{workPlans.length}</strong> rencana kerja
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setDateFilter('');
              }}
              className="text-amber-700 font-bold hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Content: CARDS VIEW */}
      {viewMode === 'CARDS' ? (
        filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Rencana Kerja Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' || dateFilter
                ? 'Tidak ada rencana kerja yang cocok dengan filter pencarian Anda.'
                : 'Belum ada data rencana kerja lapangan. Klik tombol "+ Buat Rencana Kerja" di atas untuk mulai membuat jadwal pekerjaan.'}
            </p>
            <button
              onClick={onAddPlan}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Rencana Kerja Baru</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPlans.map((plan) => {
              const isExpanded = expandedPlanIds.has(plan.id);
              const totalItems = plan.items.length;
              const completedItems = plan.items.filter((it) => it.status === 'SELESAI').length;
              const percentDone = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs overflow-hidden transition-all"
                >
                  {/* Card Header Top */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {plan.nomorRencana}
                        </span>
                        {getStatusBadge(plan.status)}
                        {getPriorityBadge(plan.prioritas)}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <strong className="text-slate-800 font-semibold">{formatDateIndo(plan.tanggal)}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {plan.judulRencana}
                      </h3>

                      {plan.namaPekerjaan && (
                        <p className="text-xs text-slate-500 font-medium">
                          Paket: <span className="text-slate-800 font-semibold">{plan.namaPekerjaan}</span>
                          {plan.noSPBJ && <span className="text-slate-400 font-mono"> ({plan.noSPBJ})</span>}
                        </p>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Dropdown */}
                      <select
                        value={plan.status}
                        onChange={(e) => handleChangePlanStatus(plan, e.target.value as WorkPlanStatus)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="TERJADWAL">Terjadwal</option>
                        <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="TERTUNDA">Tertunda</option>
                      </select>

                      {/* Print Sheet */}
                      <button
                        onClick={() => onPrintPlan(plan)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                        title="Cetak Lembar Rencana Kerja Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditPlan(plan)}
                        className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                        title="Edit Rencana Kerja"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Hapus rencana kerja ${plan.nomorRencana} (${plan.lokasi})?`)) {
                            onDeletePlan(plan.id);
                          }
                        }}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                        title="Hapus Rencana Kerja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/40 text-xs">
                    
                    {/* Location Box */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 border border-blue-100">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Lokasi Pekerjaan:</span>
                        <p className="font-bold text-slate-900 mt-0.5">{plan.lokasi}</p>
                        {plan.targetSelesai && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {plan.targetSelesai}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PIC & Mandor Box */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0 border border-amber-100">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Mandor Pelaksana:</span>
                          <p className="font-black text-amber-950">
                            {plan.mandor} {plan.mandorKontak && <span className="text-[10px] text-slate-500 font-normal">({plan.mandorKontak})</span>}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase">PIC Pengawas:</span>
                          <p className="font-bold text-blue-900">
                            {plan.pic} {plan.picKontak && <span className="text-[10px] text-slate-500 font-normal">({plan.picKontak})</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Manpower & Items Progress Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Tenaga Kerja:
                        </span>
                        <span className="font-black text-slate-900 bg-slate-200/70 px-2 py-0.5 rounded-md">
                          {plan.manpowerCount} Orang
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">Progress Item:</span>
                          <span className="font-bold text-slate-800">
                            {completedItems}/{totalItems} Item ({percentDone}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              percentDone === 100
                                ? 'bg-emerald-500'
                                : percentDone > 0
                                ? 'bg-blue-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentDone}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Work Items Expandable Section */}
                  <div className="border-t border-slate-200">
                    <button
                      onClick={() => toggleExpand(plan.id)}
                      className="w-full px-5 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Rincian Uraian Pekerjaan ({totalItems} Item)</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          (Klik checkbox untuk mengubah status item secara langsung)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="text-[11px]">{isExpanded ? 'Sembunyikan' : 'Lihat Rincian'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 bg-slate-100/70 border-t border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                        {plan.items.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-2">
                            Tidak ada uraian pekerjaan.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {plan.items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                  item.status === 'SELESAI'
                                    ? 'bg-emerald-50/70 border-emerald-200'
                                    : item.status === 'SEDANG_DIKERJAKAN'
                                    ? 'bg-blue-50/70 border-blue-200'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 flex-1">
                                  {/* Quick toggle check box button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItemStatus(plan, item.id)}
                                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                      item.status === 'SELESAI'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : item.status === 'SEDANG_DIKERJAKAN'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-100 border border-slate-300 text-transparent hover:border-slate-400'
                                    }`}
                                    title={`Klik untuk ubah status: saat ini ${item.status}`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">{item.uraianPekerjaan}</span>
                                      {item.kategori && (
                                        <span className="text-[10px] px-2 py-0.2 bg-slate-200/80 text-slate-700 rounded-md font-medium">
                                          {item.kategori}
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                        item.status === 'SELESAI'
                                          ? 'bg-emerald-200 text-emerald-900'
                                          : item.status === 'SEDANG_DIKERJAKAN'
                                          ? 'bg-blue-200 text-blue-900'
                                          : 'bg-slate-200 text-slate-800'
                                      }`}>
                                        {item.status === 'SELESAI' ? 'Selesai' : item.status === 'SEDANG_DIKERJAKAN' ? 'Sedang Dikerjakan' : 'Belum Mulai'}
                                      </span>
                                    </div>
                                    
                                    {(item.catatan || item.targetWaktu) && (
                                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                        {item.targetWaktu && (
                                          <span className="font-semibold text-slate-700">Waktu: {item.targetWaktu}</span>
                                        )}
                                        {item.catatan && (
                                          <span>• {item.catatan}</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                                    {item.volume} {item.satuan}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* K3 and Equipment notice */}
                        {(plan.catatanK3 || plan.alatKerja) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                            {plan.catatanK3 && (
                              <div className="p-2 bg-emerald-50/80 rounded-lg text-emerald-900 border border-emerald-200">
                                <strong>Instruksi K3:</strong> {plan.catatanK3}
                              </div>
                            )}
                            {plan.alatKerja && (
                              <div className="p-2 bg-amber-50/80 rounded-lg text-amber-900 border border-amber-200">
                                <strong>Kebutuhan Alat:</strong> {plan.alatKerja}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">No Rencana</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Lokasi Pekerjaan</th>
                  <th className="py-3 px-3">PIC Pengawas</th>
                  <th className="py-3 px-3">Mandor</th>
                  <th className="py-3 px-3 text-center">Tenaga</th>
                  <th className="py-3 px-3 text-center">Item Kerja</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      Tidak ada rencana kerja yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan) => {
                    const totalItems = plan.items.length;
                    const doneItems = plan.items.filter((it) => it.status === 'SELESAI').length;
                    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

                    return (
                      <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {plan.nomorRencana}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {formatDateIndo(plan.tanggal)}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">
                          {plan.lokasi}
                        </td>
                        <td className="py-3 px-3 text-blue-900 font-bold">
                          {plan.pic}
                        </td>
                        <td className="py-3 px-3 text-amber-900 font-bold">
                          {plan.mandor}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-slate-800">
                          {plan.manpowerCount} Org
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-800">{doneItems}/{totalItems}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">({pct}%)</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getStatusBadge(plan.status)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onPrintPlan(plan)}
                              className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
                              title="Cetak Rencana Kerja"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditPlan(plan)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus rencana kerja ${plan.nomorRencana}?`)) {
                                  onDeletePlan(plan.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
