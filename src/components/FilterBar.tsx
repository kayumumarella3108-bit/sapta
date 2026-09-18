import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { ProjectFilter, ProjectCategory } from '../types';

interface FilterBarProps {
  filter: ProjectFilter;
  onChange: (filter: ProjectFilter) => void;
  onReset: () => void;
  categories?: { key: ProjectCategory | 'ALL'; label: string }[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChange,
  onReset,
}) => {
  const hasActiveFilters = 
    filter.search !== '' || 
    filter.status !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-project"
            type="text"
            placeholder="Cari No, Nama Pekerjaan, Lokasi, No SPBJ, PIC, atau Mandor..."
            value={filter.search}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
          {filter.search && (
            <button
              onClick={() => onChange({ ...filter, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[150px]">
            <select
              id="select-status"
              value={filter.status}
              onChange={(e) => onChange({ ...filter, status: e.target.value })}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 text-sm font-medium text-slate-700 py-2 pl-3 pr-8 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ON_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai (BAST)</option>
              <option value="DELAYED">Terkendala / Deviasi</option>
              <option value="PENDING">Persiapan / Pending</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              id="select-sort"
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                onChange({ ...filter, sortBy, sortOrder });
              }}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 text-sm font-medium text-slate-700 py-2 pl-3 pr-8 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="no-asc">Urutan No (1 - 9)</option>
              <option value="nilaiKontrak-desc">Nilai Kontrak Tertinggi</option>
              <option value="nilaiKontrak-asc">Nilai Kontrak Terendah</option>
              <option value="progressRealisasi-desc">Progres Tertinggi</option>
              <option value="progressRealisasi-asc">Progres Terendah</option>
              <option value="targetSelesai-asc">Target Selesai Terdekat</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
