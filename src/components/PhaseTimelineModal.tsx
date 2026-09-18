import React, { useState } from 'react';
import { ProjectItem, ProjectTimelinePhase, PhaseStatus } from '../types';
import { PHASE_CONFIG, getDaysDiff, addDaysToDate } from '../utils/timelinePhases';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Save, 
  RotateCcw,
  CheckSquare,
  Plus,
  Trash2
} from 'lucide-react';

interface PhaseTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  phases: ProjectTimelinePhase[];
  onSavePhases: (updatedPhases: ProjectTimelinePhase[]) => void;
}

export const PhaseTimelineModal: React.FC<PhaseTimelineModalProps> = ({
  isOpen,
  onClose,
  project,
  phases,
  onSavePhases,
}) => {
  if (!isOpen) return null;

  const [localPhases, setLocalPhases] = useState<ProjectTimelinePhase[]>(
    JSON.parse(JSON.stringify(phases))
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newChecklistText, setNewChecklistText] = useState('');

  const currentPhase = localPhases[activeTab] || localPhases[0];
  const phaseConfig = PHASE_CONFIG[currentPhase.kategoriFase] || PHASE_CONFIG.PERSIAPAN;

  const handleFieldChange = (field: keyof ProjectTimelinePhase, value: any) => {
    setLocalPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== activeTab) return p;
        const updated = { ...p, [field]: value };
        if (field === 'tanggalMulai' || field === 'tanggalSelesai') {
          updated.durasiHari = getDaysDiff(
            field === 'tanggalMulai' ? value : p.tanggalMulai,
            field === 'tanggalSelesai' ? value : p.tanggalSelesai
          );
        }
        return updated;
      })
    );
  };

  const handleToggleChecklist = (checkId: string) => {
    setLocalPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== activeTab) return p;
        const updatedChecklists = p.checklists.map((c) =>
          c.id === checkId ? { ...c, selesai: !c.selesai } : c
        );
        const completedCount = updatedChecklists.filter((c) => c.selesai).length;
        const newProg = updatedChecklists.length > 0 
          ? Math.round((completedCount / updatedChecklists.length) * 100) 
          : p.progress;
        
        let newStatus: PhaseStatus = p.status;
        if (newProg === 100) newStatus = 'SELESAI';
        else if (newProg > 0 && p.status === 'BELUM_MULAI') newStatus = 'SEDANG_BERJALAN';

        return {
          ...p,
          checklists: updatedChecklists,
          progress: newProg,
          status: newStatus,
        };
      })
    );
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    setLocalPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== activeTab) return p;
        const newCheck = {
          id: `custom-${Date.now()}`,
          label: newChecklistText.trim(),
          selesai: false,
        };
        const updatedChecklists = [...p.checklists, newCheck];
        return {
          ...p,
          checklists: updatedChecklists,
        };
      })
    );
    setNewChecklistText('');
  };

  const handleDeleteChecklist = (checkId: string) => {
    setLocalPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== activeTab) return p;
        return {
          ...p,
          checklists: p.checklists.filter((c) => c.id !== checkId),
        };
      })
    );
  };

  const handleAutoAlignDates = () => {
    // Reset dates proportionally across project date range
    const start = project.tanggalMulai;
    const end = project.targetSelesai;
    const totalDays = getDaysDiff(start, end);

    setLocalPhases((prev) => {
      const p1S = start;
      const p1E = addDaysToDate(start, Math.max(2, Math.round(totalDays * 0.18)));
      const p2S = addDaysToDate(start, Math.max(1, Math.round(totalDays * 0.10)));
      const p2E = addDaysToDate(start, Math.max(3, Math.round(totalDays * 0.30)));
      const p3S = addDaysToDate(start, Math.max(2, Math.round(totalDays * 0.20)));
      const p3E = addDaysToDate(start, Math.max(4, Math.round(totalDays * 0.45)));
      const p4S = addDaysToDate(start, Math.max(3, Math.round(totalDays * 0.30)));
      const p4E = addDaysToDate(start, Math.max(5, Math.round(totalDays * 0.85)));
      const p5S = addDaysToDate(start, Math.max(4, Math.round(totalDays * 0.80)));
      const p5E = addDaysToDate(start, Math.max(6, Math.round(totalDays * 0.94)));
      const p6S = addDaysToDate(start, Math.max(5, Math.round(totalDays * 0.90)));
      const p6E = end;

      const datePairs = [
        [p1S, p1E],
        [p2S, p2E],
        [p3S, p3E],
        [p4S, p4E],
        [p5S, p5E],
        [p6S, p6E],
      ];

      return prev.map((p, i) => {
        const pair = datePairs[i] || [start, end];
        return {
          ...p,
          tanggalMulai: pair[0],
          tanggalSelesai: pair[1],
          durasiHari: getDaysDiff(pair[0], pair[1]),
        };
      });
    });
  };

  const handleSave = () => {
    onSavePhases(localPhases);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Pengaturan Jadwal & Tanggal Fase
                </span>
                <span className="text-xs text-slate-400">SPBJ: {project.noSPBJ}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {project.namaPekerjaan}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Tabs Selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-5 py-2 overflow-x-auto flex gap-2 shrink-0">
          {localPhases.map((phase, idx) => {
            const conf = PHASE_CONFIG[phase.kategoriFase] || PHASE_CONFIG.PERSIAPAN;
            const isActive = idx === activeTab;
            return (
              <button
                key={phase.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-white/60 text-slate-600 hover:bg-white border-slate-200 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    isActive ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{conf.shortTitle}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {phase.durasiHari}h
                </span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Phase Header Card */}
          <div className={`p-4 rounded-xl border ${phaseConfig.bgLight} ${phaseConfig.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                  Tahap ke-{activeTab + 1} dari {localPhases.length}
                </span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{currentPhase.judulFase}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">{currentPhase.subJudul}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${phaseConfig.badgeBg}`}>
                  {currentPhase.status.replace('_', ' ')} ({currentPhase.progress}%)
                </span>
              </div>
            </div>
          </div>

          {/* Form: Tanggal & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Tanggal Mulai Fase</span>
              </label>
              <input
                type="date"
                value={currentPhase.tanggalMulai}
                onChange={(e) => handleFieldChange('tanggalMulai', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Tanggal Selesai Fase</span>
              </label>
              <input
                type="date"
                value={currentPhase.tanggalSelesai}
                onChange={(e) => handleFieldChange('tanggalSelesai', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Durasi Hari Kerja</span>
              </label>
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{currentPhase.durasiHari} Hari Kalender</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ({Math.round((currentPhase.durasiHari / Math.max(1, getDaysDiff(project.tanggalMulai, project.targetSelesai))) * 100)}% dari total kontrak)
                </span>
              </div>
            </div>
          </div>

          {/* Status & Penanggung Jawab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pelaksanaan Fase
              </label>
              <select
                value={currentPhase.status}
                onChange={(e) => handleFieldChange('status', e.target.value as PhaseStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="BELUM_MULAI">Belum Dimulai</option>
                <option value="SEDANG_BERJALAN">Sedang Berjalan (Aktif)</option>
                <option value="SELESAI">Selesai (100%)</option>
                <option value="TERKENDALA">Terkendala / Delay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Penanggung Jawab (PIC / Mandor)</span>
              </label>
              <input
                type="text"
                value={currentPhase.penanggungJawab}
                onChange={(e) => handleFieldChange('penanggungJawab', e.target.value)}
                placeholder="Contoh: Pak Supardi (Mandor) & Tim K3"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Progres Realisasi Fase</span>
              <span className="text-amber-600 font-mono text-sm">{currentPhase.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentPhase.progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleFieldChange('progress', val);
                if (val === 100) handleFieldChange('status', 'SELESAI');
                else if (val > 0 && currentPhase.status === 'BELUM_MULAI') handleFieldChange('status', 'SEDANG_BERJALAN');
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Lingkup Kegiatan Lapangan
            </label>
            <textarea
              rows={2}
              value={currentPhase.catatan || ''}
              onChange={(e) => handleFieldChange('catatan', e.target.value)}
              placeholder="Rincian aktivitas, kendala lalu lintas, atau koordinasi khusus pada fase ini..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Checklist Kegiatan Fase */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Checklist Realisasi Kegiatan ({currentPhase.checklists.filter((c) => c.selesai).length}/{currentPhase.checklists.length} Selesai)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Klik kotak untuk mencentang kegiatan
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {currentPhase.checklists.map((check) => (
                <div
                  key={check.id}
                  className={`flex items-start justify-between p-2.5 rounded-lg border transition-all ${
                    check.selesai
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer select-none flex-1">
                    <input
                      type="checkbox"
                      checked={check.selesai}
                      onChange={() => handleToggleChecklist(check.id)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs ${check.selesai ? 'line-through text-slate-500 font-medium' : 'font-medium'}`}>
                      {check.label}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(check.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Hapus checklist ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form tambah checklist */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Tambah butir checklist baru untuk fase ini..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAutoAlignDates}
            className="text-xs text-slate-600 hover:text-amber-600 flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tanggal Otomatis Sesuai SPBJ ({project.tanggalMulai} s/d {project.targetSelesai})</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Jadwal Timeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
