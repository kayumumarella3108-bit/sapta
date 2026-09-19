import React, { useState, useMemo } from 'react';
import { ProjectItem, ProjectCategory, InstalledMaterial, ProjectTimelinePhase, PhaseStatus, DailyLog } from '../types';
import { 
  formatDateIndo, 
  formatRupiah, 
  getCategoryBadge, 
  getStatusBadge, 
  getVoltageBadge,
  getMaterialConditionBadge,
  getCumulativeMaterials
} from '../utils/formatters';
import { 
  getProjectPhases, 
  PHASE_CONFIG, 
  getPhaseStatusBadge, 
  getDaysDiff, 
  addDaysToDate 
} from '../utils/timelinePhases';
import { PhaseTimelineModal } from './PhaseTimelineModal';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  PlusCircle, 
  UserCheck, 
  HardHat, 
  Users, 
  MapPin, 
  FileText, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Filter,
  Layers,
  Search,
  Settings,
  Edit3,
  Sliders,
  CheckSquare,
  Square,
  Flag,
  Truck,
  Activity,
  Check,
  Printer,
  Presentation
} from 'lucide-react';

interface TimelineViewProps {
  projects: ProjectItem[];
  onOpenDailyLog: (project: ProjectItem) => void;
  onOpenDetail: (project: ProjectItem) => void;
  onUpdateProject?: (project: ProjectItem) => void;
  onPrintDailyLog?: (project: ProjectItem, log: DailyLog) => void;
  onDownloadPPT?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  projects,
  onOpenDailyLog,
  onOpenDetail,
  onUpdateProject,
  onPrintDailyLog,
  onDownloadPPT,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );
  // Default to workflow timeline per user request: "dari awal persiapan , mobilisasi manpower , material sampe ke pekerjaan"
  const [mode, setMode] = useState<'workflow' | 'gantt' | 'material-summary'>('workflow');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal edit fase tanggal
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);

  // Active project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Current active project's timeline phases
  const activePhases = useMemo(() => {
    if (!activeProject) return [];
    return getProjectPhases(activeProject);
  }, [activeProject]);

  // Filtered projects for Gantt mode
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && p.kategori !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.namaPekerjaan.toLowerCase().includes(q) ||
          p.noSPBJ.toLowerCase().includes(q) ||
          p.lokasi.toLowerCase().includes(q) ||
          p.pic.toLowerCase().includes(q) ||
          p.mandor.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, statusFilter, categoryFilter, search]);

  // Aggregate materials across all projects
  const allProjectsMaterials = useMemo(() => {
    const list: {
      projectId: string;
      projectNo: number;
      projectNama: string;
      noSPBJ: string;
      material: InstalledMaterial;
      tanggal: string;
    }[] = [];

    projects.forEach((p) => {
      (p.dailyLogs || []).forEach((log) => {
        (log.materialTerpasang || []).forEach((mat) => {
          list.push({
            projectId: p.id,
            projectNo: p.no,
            projectNama: p.namaPekerjaan,
            noSPBJ: p.noSPBJ,
            material: mat,
            tanggal: log.tanggal,
          });
        });
      });
    });

    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [projects]);

  // Calculate project schedule days
  const getScheduleStats = (startDateStr: string, endDateStr: string, progress: number) => {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const today = new Date().getTime();

    const totalDurationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.round((end - today) / (1000 * 60 * 60 * 24));
    
    const timePercentage = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDurationDays) * 100)));
    const isLate = remainingDays < 0 && progress < 100;

    return {
      totalDurationDays,
      elapsedDays: Math.min(totalDurationDays, elapsedDays),
      remainingDays,
      timePercentage,
      isLate,
    };
  };

  // Toggle checklist item directly from the workflow card
  const handleToggleChecklistInCard = (phaseIndex: number, checkId: string) => {
    if (!activeProject || !onUpdateProject) return;

    const updatedPhases = activePhases.map((phase, pIdx) => {
      if (pIdx !== phaseIndex) return phase;

      const updatedChecklists = phase.checklists.map((c) =>
        c.id === checkId ? { ...c, selesai: !c.selesai } : c
      );

      const completedCount = updatedChecklists.filter((c) => c.selesai).length;
      const newProg = updatedChecklists.length > 0
        ? Math.round((completedCount / updatedChecklists.length) * 100)
        : phase.progress;

      let newStatus: PhaseStatus = phase.status;
      if (newProg === 100) newStatus = 'SELESAI';
      else if (newProg > 0 && phase.status === 'BELUM_MULAI') newStatus = 'SEDANG_BERJALAN';

      return {
        ...phase,
        checklists: updatedChecklists,
        progress: newProg,
        status: newStatus,
      };
    });

    onUpdateProject({
      ...activeProject,
      timelinePhases: updatedPhases,
      updatedAt: new Date().toISOString(),
    });
  };

  // Save updated phases from modal
  const handleSavePhases = (updatedPhases: ProjectTimelinePhase[]) => {
    if (!activeProject || !onUpdateProject) return;
    onUpdateProject({
      ...activeProject,
      timelinePhases: updatedPhases,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Timeline Berbentuk Tanggal: Persiapan ➔ Manpower ➔ Material ➔ Pekerjaan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Pelacakan alur kerja kelistrikan terstruktur berbasis tanggal: Awal Persiapan & K3, Mobilisasi Tenaga Kerja, Drop Material, hingga Eksekusi Pekerjaan Fisik.
            </p>
          </div>

          {/* Mode Switcher Tabs & Download PPT */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setMode('workflow')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'workflow'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Timeline Alur Tanggal</span>
              </button>

              <button
                onClick={() => setMode('gantt')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'gantt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Matriks Jadwal Semua SPBJ</span>
              </button>

              <button
                onClick={() => setMode('material-summary')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'material-summary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rekap Material Terpasang</span>
              </button>
            </div>

            {onDownloadPPT && (
              <button
                id="btn-download-ppt-timeline"
                onClick={onDownloadPPT}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                title="Download Presentasi PPT Timeline & Fase Kerja"
              >
                <Presentation className="w-3.5 h-3.5 text-amber-600" />
                <span>Download PPT Timeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls for Gantt Mode */}
        {mode === 'gantt' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pekerjaan, SPBJ, PIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori Pekerjaan</option>
                <option value="TM">TM (Tegangan Menengah 20kV)</option>
                <option value="TR">TR (Tegangan Rendah)</option>
                <option value="Gardu">Gardu & Trafo Distribusi</option>
                <option value="Panel">Panel & Switchgear</option>
                <option value="Jaringan">Jaringan SUTM/SUTR</option>
                <option value="Grounding">Grounding & Petir</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status Proyek</option>
                <option value="ON_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai (BAST)</option>
                <option value="DELAYED">Terkendala / Terlambat</option>
                <option value="PENDING">Persiapan / Pending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MODE 1: WORKFLOW DATE TIMELINE (Persiapan ➔ Manpower ➔ Material ➔ Pekerjaan) */}
      {mode === 'workflow' && activeProject && (
        <div className="space-y-6">
          {/* Project Selector & Actions Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Pilih SPBJ Pekerjaan:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 md:w-96 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.no} - {p.namaPekerjaan} ({p.noSPBJ})
                  </option>
                ))}
              </select>

              {onPrintDailyLog && activeProject.dailyLogs && activeProject.dailyLogs.length > 0 && (
                <button
                  onClick={() => {
                    const latestLog = activeProject.dailyLogs[0];
                    onPrintDailyLog(activeProject, latestLog);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Cetak Laporan Harian Terakhir dalam format PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Cetak Laporan PDF</span>
                </button>
              )}

              <button
                onClick={() => setIsPhaseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                title="Atur tanggal mulai & selesai tiap fase pekerjaan"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Atur Tanggal Fase</span>
              </button>

              <button
                onClick={() => onOpenDailyLog(activeProject)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                title="Input Laporan Harian & Realisasi Material"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Input Realisasi</span>
              </button>
            </div>
          </div>

          {/* Project Summary Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-xs font-black">
                    PROYEK #{activeProject.no}
                  </span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    No. SPBJ: {activeProject.noSPBJ}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(activeProject.kategori).bg}`}>
                    {getCategoryBadge(activeProject.kategori).short}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getVoltageBadge(activeProject.statusManuver).bg}`}>
                    {getVoltageBadge(activeProject.statusManuver).short}
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                  {activeProject.namaPekerjaan}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {activeProject.lokasi}
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold text-amber-300">
                    Nilai Kontrak: {formatRupiah(activeProject.nilaiKontrak)}
                  </span>
                  <span>&bull;</span>
                  <span>
                    PIC: <strong className="text-white">{activeProject.pic}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    Mandor: <strong className="text-white">{activeProject.mandor}</strong> ({activeProject.manpower.total} Personil)
                  </span>
                </div>
              </div>

              {/* Progress & Duration Box */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right min-w-[130px]">
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Realisasi Fisik
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">
                    {activeProject.progressRealisasi}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Rencana: {activeProject.progressRencana}%
                  </div>
                </div>

                <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 min-w-[150px]">
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Durasi Kontrak
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {getDaysDiff(activeProject.tanggalMulai, activeProject.targetSelesai)} Hari
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{formatDateIndo(activeProject.tanggalMulai)} s/d {formatDateIndo(activeProject.targetSelesai)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VISUAL DATE AXIS / RIBBON TANGGAL HORIZONTAL */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Alur Garis Waktu Fase (Persiapan ➔ Mobilisasi Manpower ➔ Material ➔ Pekerjaan):</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Hari ini: <strong className="text-white">{formatDateIndo(new Date().toISOString().slice(0, 10))}</strong>
                </span>
              </div>

              {/* Progress bar segmented by the 6 phases with dates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {activePhases.map((phase, idx) => {
                  const conf = PHASE_CONFIG[phase.kategoriFase] || PHASE_CONFIG.PERSIAPAN;
                  const isFinished = phase.status === 'SELESAI';
                  const isRunning = phase.status === 'SEDANG_BERJALAN';

                  return (
                    <div
                      key={phase.id}
                      onClick={() => setIsPhaseModalOpen(true)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:border-amber-400 ${
                        isRunning
                          ? 'bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30'
                          : isFinished
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-800/50 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                            isFinished ? 'bg-emerald-500 text-white' : isRunning ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="truncate">{conf.shortTitle}</span>
                        </span>
                        <span className="font-mono text-[10px] text-amber-400 font-bold">
                          {phase.durasiHari}h
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{phase.tanggalMulai.slice(5)} s/d {phase.tanggalSelesai.slice(5)}</span>
                      </div>

                      {/* Mini progress */}
                      <div className="w-full bg-slate-700/60 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${
                            isFinished ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TIMELINE BERBENTUK TANGGAL: DETAILED STEP-BY-STEP CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-100 text-amber-700 rounded-md">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Rincian Tanggal & Realisasi Setiap Fase Pelaksanaan
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Klik checkbox untuk memperbarui realisasi kegiatan harian
              </span>
            </div>

            <div className="space-y-4">
              {activePhases.map((phase, pIdx) => {
                const conf = PHASE_CONFIG[phase.kategoriFase] || PHASE_CONFIG.PERSIAPAN;
                const statusInfo = getPhaseStatusBadge(phase.status);
                const completedChecklists = phase.checklists.filter((c) => c.selesai).length;
                const totalChecklists = phase.checklists.length;

                return (
                  <div
                    key={phase.id}
                    className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                      phase.status === 'SEDANG_BERJALAN'
                        ? 'border-amber-400 ring-2 ring-amber-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Phase Card Top Header with Date Badge */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Step Number Badge */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0 bg-gradient-to-br ${conf.color}`}
                          >
                            {pIdx + 1}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                                Tahap {pIdx + 1}:
                              </span>
                              <h4 className="text-base font-bold text-slate-900">
                                {phase.judulFase}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600">
                              {phase.subJudul}
                            </p>
                          </div>
                        </div>

                        {/* DATE BADGE (Prominent date container) */}
                        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs text-right">
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              <span>Rentang Tanggal Fase:</span>
                            </div>
                            <div className="text-xs font-extrabold text-slate-800 font-mono mt-0.5">
                              {formatDateIndo(phase.tanggalMulai)} &mdash; {formatDateIndo(phase.tanggalSelesai)}
                            </div>
                            <div className="text-[10.5px] text-slate-400 font-semibold">
                              Durasi: {phase.durasiHari} Hari Kerja
                            </div>
                          </div>

                          <button
                            onClick={() => setIsPhaseModalOpen(true)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="Edit tanggal fase ini"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar for this phase */}
                      <div className="mt-3 pt-3 border-t border-slate-200/70">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">
                            Progres Realisasi Tahap:
                          </span>
                          <span className="font-bold font-mono text-amber-600">
                            {phase.progress}% Selesai ({completedChecklists}/{totalChecklists} Kegiatan)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              phase.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phase Body: Specific Content & Interactive Checklists */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Meta Context Pill */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Penanggung Jawab:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            {phase.penanggungJawab}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Lingkup & Catatan:</span>
                          <span className="font-medium text-slate-700 mt-0.5 line-clamp-1">
                            {phase.catatan || 'Sesuai instruksi kerja dan SOP kelistrikan.'}
                          </span>
                        </div>

                        {/* Phase-specific Highlights */}
                        <div>
                          {phase.kategoriFase === 'PERSIAPAN' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Status K3 & Working Permit:</span>
                              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                JSA & Surat Ijin Kerja Siap
                              </span>
                            </>
                          )}

                          {phase.kategoriFase === 'MOB_MANPOWER' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Kesiapan Manpower:</span>
                              <span className="font-bold text-blue-700 flex items-center gap-1 mt-0.5">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                {activeProject.manpower.total} Personil Siap Kerja
                              </span>
                            </>
                          )}

                          {phase.kategoriFase === 'MOB_MATERIAL' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Logistik Material:</span>
                              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                                <Package className="w-3.5 h-3.5 text-emerald-600" />
                                Kabel, Tiang, Trafo & Aksesoris
                              </span>
                            </>
                          )}

                          {phase.kategoriFase === 'PEKERJAAN' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Manuver Tegangan:</span>
                              <span className="font-bold text-purple-700 flex items-center gap-1 mt-0.5">
                                <Zap className="w-3.5 h-3.5 text-purple-600" />
                                {getVoltageBadge(activeProject.statusManuver).short}
                              </span>
                            </>
                          )}

                          {phase.kategoriFase === 'TESTING_COMMISSIONING' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Standar Uji Isolasi:</span>
                              <span className="font-bold text-cyan-700 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                                Megger &gt; 1000 MΩ, Ground &lt; 5Ω
                              </span>
                            </>
                          )}

                          {phase.kategoriFase === 'FINISHING_BAST' && (
                            <>
                              <span className="text-slate-400 block text-[11px]">Target Serah Terima:</span>
                              <span className="font-bold text-teal-700 flex items-center gap-1 mt-0.5">
                                <Flag className="w-3.5 h-3.5 text-teal-600" />
                                BAST Pertama (PHO 100%)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Extra Sub-Component: Manpower breakdown for Fase 2 */}
                      {phase.kategoriFase === 'MOB_MANPOWER' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs text-slate-500 font-semibold">Komposisi Tim Lapangan:</span>
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                            <HardHat className="w-3.5 h-3.5 text-blue-600" />
                            {activeProject.manpower.teknisiListrik} Teknisi Listrik
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {activeProject.manpower.helper} Helper
                          </span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {activeProject.manpower.hseOfficer} HSE Officer
                          </span>
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            <Truck className="w-3.5 h-3.5 text-amber-600" />
                            {activeProject.manpower.operatorAlat} Operator Alat Berat/Crane
                          </span>
                        </div>
                      )}

                      {/* Extra Sub-Component: Material terpasang preview for Fase 3 & 4 */}
                      {(phase.kategoriFase === 'MOB_MATERIAL' || phase.kategoriFase === 'PEKERJAAN') && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Material Komponen Kelistrikan Terkait:</span>
                            </span>
                            <button
                              onClick={() => onOpenDailyLog(activeProject)}
                              className="text-amber-600 hover:text-amber-700 font-bold text-[11px] cursor-pointer"
                            >
                              + Catat Drop / Pasang Material Baru
                            </button>
                          </div>

                          {getCumulativeMaterials(activeProject).length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                              {getCumulativeMaterials(activeProject).slice(0, 4).map((mat, i) => (
                                <div
                                  key={i}
                                  className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs"
                                >
                                  <span className="font-extrabold text-amber-600">
                                    {mat.totalVolume} {mat.satuan}
                                  </span>
                                  <span className="font-semibold text-slate-800">{mat.namaMaterial}</span>
                                </div>
                              ))}
                              {getCumulativeMaterials(activeProject).length > 4 && (
                                <span className="text-xs text-slate-500 font-semibold">
                                  +{getCumulativeMaterials(activeProject).length - 4} material lainnya
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                              Belum ada catatan material fisik terpasang di log harian. Klik &quot;Input Realisasi&quot; untuk mencatat kabel, tiang, trafo, dll.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Checklist Kegiatan Fase */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                          <span>Checklist Milestone & Realisasi Kegiatan:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {phase.checklists.map((check) => (
                            <div
                              key={check.id}
                              onClick={() => handleToggleChecklistInCard(pIdx, check.id)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                check.selesai
                                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {check.selesai ? (
                                  <div className="w-4 h-4 rounded-sm bg-emerald-600 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-sm border border-slate-300 bg-white" />
                                )}
                              </div>
                              <span
                                className={`text-xs ${
                                  check.selesai
                                    ? 'line-through text-slate-500 font-medium'
                                    : 'font-medium'
                                }`}
                              >
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GANTT CHART & SCHEDULE MATRIX */}
      {mode === 'gantt' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
                Matriks Jadwal Waktu & Progres Realisasi ({filteredProjects.length} SPBJ)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Hari ini: <strong>{formatDateIndo(new Date().toISOString().slice(0, 10))}</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada data proyek sesuai filter timeline.
              </div>
            ) : (
              filteredProjects.map((p) => {
                const schedule = getScheduleStats(p.tanggalMulai, p.targetSelesai, p.progressRealisasi);
                const catBadge = getCategoryBadge(p.kategori);
                const statusBadge = getStatusBadge(p.status);
                const voltBadge = getVoltageBadge(p.statusManuver);
                const cumulativeMats = getCumulativeMaterials(p);
                const totalMatCount = cumulativeMats.reduce((acc, m) => acc + m.totalVolume, 0);

                return (
                  <div 
                    key={p.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3"
                  >
                    {/* Top Row: Meta info & badges */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-900 text-white">
                            NO. {p.no}
                          </span>
                          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            SPBJ: {p.noSPBJ}
                          </span>
                          <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded border ${catBadge.bg}`}>
                            {catBadge.short}
                          </span>
                          <span className={`inline-flex text-[10.5px] font-medium px-2 py-0.5 rounded border ${voltBadge.bg}`}>
                            {voltBadge.short}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setMode('workflow');
                            }}
                        >
                          {p.namaPekerjaan}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {p.lokasi}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-800">
                            Nilai: {formatRupiah(p.nilaiKontrak)}
                          </span>
                          <span>&bull;</span>
                          <span>
                            PIC: <strong className="text-slate-700">{p.pic}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Mandor: <strong className="text-slate-700">{p.mandor}</strong> ({p.manpower.total} Org)
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                          onClick={() => onOpenDailyLog(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          title="Input Laporan Harian & Realisasi Material"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Input Realisasi</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setMode('workflow');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                        >
                          <span>Timeline Fase</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline Bar Section */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            📅 {formatDateIndo(p.tanggalMulai)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">
                            🏁 {formatDateIndo(p.targetSelesai)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            Durasi: <strong>{schedule.totalDurationDays} Hari</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className={`${schedule.remainingDays < 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                            {schedule.remainingDays >= 0 
                              ? `Sisa ${schedule.remainingDays} Hari` 
                              : `Terlambat ${Math.abs(schedule.remainingDays)} Hari`}
                          </span>
                        </div>
                      </div>

                      {/* Visual Timeline Dual Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <span>Realisasi Fisik Lapangan:</span>
                            <span className="text-amber-600 font-extrabold">{p.progressRealisasi}%</span>
                          </span>
                          <span className="text-slate-400">
                            Rencana SPBJ: {p.progressRencana}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${
                              p.progressRealisasi >= 100 
                                ? 'bg-emerald-500' 
                                : p.progressRealisasi < p.progressRencana 
                                  ? 'bg-rose-500' 
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, p.progressRealisasi)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5">
                          <span>Waktu Kontrak Berjalan: {schedule.elapsedDays} / {schedule.totalDurationDays} Hari ({schedule.timePercentage}%)</span>
                          <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.2 rounded-full border ${statusBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* Quick Installed Materials Snippet */}
                      {cumulativeMats.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-semibold text-slate-800">
                              Material Terpasang:
                            </span>
                            <span className="text-slate-600">
                              {cumulativeMats.length} jenis komponen ({totalMatCount} total vol)
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {cumulativeMats.slice(0, 3).map((mat, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium shadow-2xs"
                              >
                                <span className="font-bold text-amber-700">{mat.totalVolume} {mat.satuan}</span>
                                <span className="truncate max-w-[140px]">{mat.namaMaterial}</span>
                              </span>
                            ))}
                            {cumulativeMats.length > 3 && (
                              <span className="text-[11px] text-slate-500 font-semibold">
                                +{cumulativeMats.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODE 3: ALL MATERIAL RECAPITULATION */}
      {mode === 'material-summary' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Rekapitulasi Seluruh Material Fisik yang Terpasang di Lapangan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {allProjectsMaterials.length} catatan komponen material terpasang dari seluruh paket SPBJ.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              Agregasi Laporan Lapangan Harian
            </div>
          </div>

          {allProjectsMaterials.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Belum ada material yang diinput</p>
              <p className="text-xs">
                Klik tombol &quot;+ Input Realisasi&quot; pada proyek untuk mencatat material kabel, trafo, atau komponen yang dipasang hari ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Tanggal Pasang</th>
                    <th className="p-3">No. SPBJ & Proyek</th>
                    <th className="p-3">Nama Material & Komponen</th>
                    <th className="p-3">Spesifikasi</th>
                    <th className="p-3 text-right">Volume</th>
                    <th className="p-3">Lokasi Titik Pasang</th>
                    <th className="p-3 text-center">Status & Uji</th>
                    <th className="p-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProjectsMaterials.map((item, idx) => {
                    const statusBadge = getMaterialConditionBadge(item.material.kondisiStatus);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                          {formatDateIndo(item.tanggal)}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 line-clamp-1 max-w-[200px]" title={item.projectNama}>
                            #{item.projectNo} {item.projectNama}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {item.noSPBJ}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">
                            {item.material.namaMaterial}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 max-w-[180px] truncate" title={item.material.spesifikasi}>
                          {item.material.spesifikasi || '-'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className="font-black text-amber-600 text-sm">
                            {item.material.volume}
                          </span>{' '}
                          <span className="font-semibold text-slate-700">{item.material.satuan}</span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-[180px] truncate" title={item.material.lokasiTitik}>
                          {item.material.lokasiTitik ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{item.material.lokasiTitik}</span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10.5px] font-semibold border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] max-w-[180px] truncate" title={item.material.keterangan}>
                          {item.material.keterangan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Edit Tanggal & Durasi Fase */}
      {activeProject && isPhaseModalOpen && (
        <PhaseTimelineModal
          isOpen={isPhaseModalOpen}
          onClose={() => setIsPhaseModalOpen(false)}
          project={activeProject}
          phases={activePhases}
          onSavePhases={handleSavePhases}
        />
      )}
    </div>
  );
};
