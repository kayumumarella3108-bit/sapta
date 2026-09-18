import React, { useState } from 'react';
import { ProjectItem, ProjectCategory } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { formatShortRupiah } from '../utils/formatters';

interface ProjectSummaryChartsProps {
  projects: ProjectItem[];
}

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completed (Selesai BAST)',
    shortLabel: 'Completed',
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
  ON_PROGRESS: {
    label: 'On Progress (Berjalan)',
    shortLabel: 'On Progress',
    color: '#3b82f6', // blue-500
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: PlayCircle,
  },
  PENDING: {
    label: 'Pending (Persiapan)',
    shortLabel: 'Pending',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  DELAYED: {
    label: 'Delayed (Kendala)',
    shortLabel: 'Delayed',
    color: '#f43f5e', // rose-500
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    icon: AlertCircle,
  },
};

export const ProjectSummaryCharts: React.FC<ProjectSummaryChartsProps> = ({ projects }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'status' | 'category'>('status');

  const totalProjects = projects.length;

  // Calculate status counts & percentages
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const onProgressCount = projects.filter((p) => p.status === 'ON_PROGRESS').length;
  const pendingCount = projects.filter((p) => p.status === 'PENDING').length;
  const delayedCount = projects.filter((p) => p.status === 'DELAYED').length;

  const pieData = [
    {
      name: 'Completed',
      fullName: 'Completed (Selesai BAST)',
      value: completedCount,
      percentage: totalProjects > 0 ? ((completedCount / totalProjects) * 100).toFixed(1) : '0',
      color: STATUS_CONFIG.COMPLETED.color,
    },
    {
      name: 'On Progress',
      fullName: 'On Progress (Berjalan)',
      value: onProgressCount,
      percentage: totalProjects > 0 ? ((onProgressCount / totalProjects) * 100).toFixed(1) : '0',
      color: STATUS_CONFIG.ON_PROGRESS.color,
    },
    {
      name: 'Pending',
      fullName: 'Pending (Persiapan/SPBJ)',
      value: pendingCount,
      percentage: totalProjects > 0 ? ((pendingCount / totalProjects) * 100).toFixed(1) : '0',
      color: STATUS_CONFIG.PENDING.color,
    },
    {
      name: 'Delayed',
      fullName: 'Delayed (Ada Kendala)',
      value: delayedCount,
      percentage: totalProjects > 0 ? ((delayedCount / totalProjects) * 100).toFixed(1) : '0',
      color: STATUS_CONFIG.DELAYED.color,
    },
  ].filter((item) => item.value > 0);

  // Status Bar Chart data (Count and Percentage)
  const statusBarData = [
    {
      status: 'Completed',
      label: 'Completed',
      jumlah: completedCount,
      persen: totalProjects > 0 ? Number(((completedCount / totalProjects) * 100).toFixed(1)) : 0,
      fill: STATUS_CONFIG.COMPLETED.color,
    },
    {
      status: 'On Progress',
      label: 'On Progress',
      jumlah: onProgressCount,
      persen: totalProjects > 0 ? Number(((onProgressCount / totalProjects) * 100).toFixed(1)) : 0,
      fill: STATUS_CONFIG.ON_PROGRESS.color,
    },
    {
      status: 'Pending',
      label: 'Pending',
      jumlah: pendingCount,
      persen: totalProjects > 0 ? Number(((pendingCount / totalProjects) * 100).toFixed(1)) : 0,
      fill: STATUS_CONFIG.PENDING.color,
    },
    {
      status: 'Delayed',
      label: 'Delayed',
      jumlah: delayedCount,
      persen: totalProjects > 0 ? Number(((delayedCount / totalProjects) * 100).toFixed(1)) : 0,
      fill: STATUS_CONFIG.DELAYED.color,
    },
  ];

  // Category Breakdown Data (Rencana vs Realisasi)
  const categories: ProjectCategory[] = ['TM', 'TR', 'Gardu', 'Panel', 'Jaringan', 'Grounding'];
  const categoryData = categories.map((cat) => {
    const projs = projects.filter((p) => p.kategori === cat);
    const count = projs.length;
    const avgRencana = count > 0 ? Math.round(projs.reduce((acc, p) => acc + p.progressRencana, 0) / count) : 0;
    const avgRealisasi = count > 0 ? Math.round(projs.reduce((acc, p) => acc + p.progressRealisasi, 0) / count) : 0;
    const totalNilai = projs.reduce((acc, p) => acc + p.nilaiKontrak, 0);

    return {
      kategori: cat,
      count,
      rencana: avgRencana,
      realisasi: avgRealisasi,
      nilaiKontrak: totalNilai,
    };
  }).filter((item) => item.count > 0);

  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
  const activeRate = totalProjects > 0 ? Math.round((onProgressCount / totalProjects) * 100) : 0;

  return (
    <div id="project-summary-charts-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 sm:py-3.5 border-b border-slate-100 gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Dashboard Ringkasan Progres &amp; Status Proyek
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Divisi ME
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Analisis visual distribusi status pekerjaan SPBJ dan capaian progres divisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart View Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              id="btn-chart-status-mode"
              type="button"
              onClick={() => setChartMode('status')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'status'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Status &amp; Persentase</span>
            </button>
            <button
              id="btn-chart-category-mode"
              type="button"
              onClick={() => setChartMode('category')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'category'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Progres per Kategori</span>
            </button>
          </div>

          {/* Toggle Expand/Collapse */}
          <button
            id="btn-toggle-summary-charts"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {totalProjects === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada data proyek untuk ditampilkan pada grafik ringkasan.
            </div>
          ) : chartMode === 'status' ? (
            <div className="space-y-4">
              {/* Dual Visual Panel: Pie/Donut Chart + Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                
                {/* 1. Pie / Donut Chart Panel (5 cols) */}
                <div className="lg:col-span-5 bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <PieIcon className="w-3.5 h-3.5 text-blue-600" />
                      Persentase Status Proyek
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {completionRate}% BAST Selesai
                    </span>
                  </div>

                  <div className="relative w-full h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
                                  <div className="font-bold flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: data.color }}
                                    />
                                    <span>{data.fullName}</span>
                                  </div>
                                  <div className="mt-1 text-slate-300">
                                    Jumlah:{' '}
                                    <span className="font-bold text-white">
                                      {data.value} Proyek
                                    </span>
                                  </div>
                                  <div className="text-amber-400 font-bold">
                                    Porsi: {data.percentage}%
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {totalProjects}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Total SPBJ
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Horizontal/Vertical Bar Chart Panel (7 cols) */}
                <div className="lg:col-span-7 bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                      Grafik Batang Distribusi Status &amp; Persentase (%)
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Total {totalProjects} Pekerjaan
                    </span>
                  </div>

                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusBarData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="status" 
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis 
                          unit="%" 
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
                                  <div className="font-bold">{d.label}</div>
                                  <div className="text-slate-300 mt-0.5">
                                    Jumlah:{' '}
                                    <span className="font-bold text-white">{d.jumlah} SPBJ</span>
                                  </div>
                                  <div className="text-emerald-400 font-bold">
                                    Persentase: {d.persen}%
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="persen" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={48}
                        >
                          {statusBarData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 3. Status Summary Cards (Detailed Percentage Breakdown) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* Completed */}
                <div className={`p-3 rounded-lg border ${STATUS_CONFIG.COMPLETED.bgColor} ${STATUS_CONFIG.COMPLETED.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${STATUS_CONFIG.COMPLETED.textColor} uppercase`}>
                      Completed
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-emerald-900">
                      {completedCount}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {totalProjects > 0 ? ((completedCount / totalProjects) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700/80 block mt-0.5">
                    Pekerjaan Selesai (BAST)
                  </span>
                </div>

                {/* On Progress */}
                <div className={`p-3 rounded-lg border ${STATUS_CONFIG.ON_PROGRESS.bgColor} ${STATUS_CONFIG.ON_PROGRESS.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${STATUS_CONFIG.ON_PROGRESS.textColor} uppercase`}>
                      On Progress
                    </span>
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-blue-900">
                      {onProgressCount}
                    </span>
                    <span className="text-xs font-bold text-blue-700">
                      {totalProjects > 0 ? ((onProgressCount / totalProjects) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700/80 block mt-0.5">
                    Pekerjaan Aktif Lapangan
                  </span>
                </div>

                {/* Pending */}
                <div className={`p-3 rounded-lg border ${STATUS_CONFIG.PENDING.bgColor} ${STATUS_CONFIG.PENDING.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${STATUS_CONFIG.PENDING.textColor} uppercase`}>
                      Pending
                    </span>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-amber-900">
                      {pendingCount}
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      {totalProjects > 0 ? ((pendingCount / totalProjects) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700/80 block mt-0.5">
                    Tahap Persiapan / SPBJ
                  </span>
                </div>

                {/* Delayed */}
                <div className={`p-3 rounded-lg border ${STATUS_CONFIG.DELAYED.bgColor} ${STATUS_CONFIG.DELAYED.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${STATUS_CONFIG.DELAYED.textColor} uppercase`}>
                      Delayed
                    </span>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-rose-900">
                      {delayedCount}
                    </span>
                    <span className="text-xs font-bold text-rose-700">
                      {totalProjects > 0 ? ((delayedCount / totalProjects) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-700/80 block mt-0.5">
                    Memerlukan Tindakan Khusus
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Category Progress Comparison (Bar Chart) */
            <div className="space-y-4">
              <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Komparasi Progres Rencana vs Realisasi Fisik per Kategori
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Persentase progres pekerjaan rata-rata berdasarkan kelompok tegangan &amp; peralatan
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-slate-400" />
                      <span className="text-slate-600 font-medium">Rencana (%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-500" />
                      <span className="text-slate-800 font-bold">Realisasi (%)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="kategori" 
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis 
                        unit="%" 
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white text-xs px-3 py-2.5 rounded-lg shadow-lg border border-slate-700 space-y-1">
                                <div className="font-bold text-amber-400 text-sm">
                                  Kategori {d.kategori}
                                </div>
                                <div className="text-slate-300">
                                  Jumlah Proyek: <span className="font-bold text-white">{d.count} SPBJ</span>
                                </div>
                                <div className="text-slate-300">
                                  Rencana: <span className="font-bold text-slate-200">{d.rencana}%</span>
                                </div>
                                <div className="text-emerald-400 font-bold">
                                  Realisasi: {d.realisasi}%
                                </div>
                                <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-700">
                                  Nilai Kontrak: {formatShortRupiah(d.nilaiKontrak)}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="rencana" 
                        name="Rencana" 
                        fill="#94a3b8" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={28}
                      />
                      <Bar 
                        dataKey="realisasi" 
                        name="Realisasi" 
                        fill="#f59e0b" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Mini Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {categoryData.map((cat) => (
                  <div key={cat.kategori} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{cat.kategori}</span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {cat.count} SPBJ
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between text-[11px]">
                      <span className="text-slate-500">Realisasi:</span>
                      <span className="font-bold text-amber-600">{cat.realisasi}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, cat.realisasi))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
