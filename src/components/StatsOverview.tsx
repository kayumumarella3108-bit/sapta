import React from 'react';
import { ProjectItem } from '../types';
import { formatShortRupiah } from '../utils/formatters';
import { 
  Banknote, 
  Users, 
  CheckCircle2, 
  Activity, 
  AlertTriangle,
  HardHat,
  Wrench,
  ShieldCheck
} from 'lucide-react';

interface StatsOverviewProps {
  projects: ProjectItem[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ projects }) => {
  const totalNilaiKontrak = projects.reduce((acc, p) => acc + p.nilaiKontrak, 0);
  
  const totalManpower = projects.reduce((acc, p) => acc + (p.manpower?.total || 0), 0);
  const totalTeknisi = projects.reduce((acc, p) => acc + (p.manpower?.teknisiListrik || 0), 0);
  const totalHelper = projects.reduce((acc, p) => acc + (p.manpower?.helper || 0), 0);
  const totalHSE = projects.reduce((acc, p) => acc + (p.manpower?.hseOfficer || 0), 0);

  const onProgressCount = projects.filter(p => p.status === 'ON_PROGRESS').length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const delayedCount = projects.filter(p => p.status === 'DELAYED').length;
  const pendingCount = projects.filter(p => p.status === 'PENDING').length;

  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progressRealisasi, 0) / projects.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Nilai Kontrak Total */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Nilai Kontrak
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatShortRupiah(totalNilaiKontrak)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{projects.length} SPBJ</span> tercatat aktif & terdata
          </div>
        </div>
      </div>

      {/* 2. Total Manpower Hari Ini */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Manpower Lapangan
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{totalManpower}</span>
            <span className="text-sm font-normal text-slate-500">Personil</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700">
              <Wrench className="w-3 h-3 text-amber-600" />
              {totalTeknisi} Teknisi
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700">
              <HardHat className="w-3 h-3 text-blue-600" />
              {totalHelper} Helper
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {totalHSE} HSE
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rata-rata Progres Fisik */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rata-rata Progres Fisik
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {avgProgress}%
            </span>
            <span className="text-xs font-medium text-blue-600">
              {onProgressCount} Berjalan
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, avgProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Status Pekerjaan & BAST */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Status Pekerjaan
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-1 text-xs">
          <div className="flex flex-col">
            <span className="font-bold text-base text-blue-700">{onProgressCount}</span>
            <span className="text-slate-500 text-[11px]">Sedang Berjalan</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="font-bold text-base text-emerald-700">{completedCount}</span>
            <span className="text-slate-500 text-[11px]">Selesai (BAST)</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="font-bold text-base text-rose-700">{delayedCount}</span>
            <span className="text-slate-500 text-[11px] flex items-center gap-0.5">
              {delayedCount > 0 && <AlertTriangle className="w-3 h-3 text-rose-500 inline" />}
              Kendala
            </span>
          </div>
          {pendingCount > 0 && (
            <>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="font-bold text-base text-amber-700">{pendingCount}</span>
                <span className="text-slate-500 text-[11px]">Persiapan</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
