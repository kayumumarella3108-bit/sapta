import React, { useState, useMemo } from 'react';
import { ProjectItem, ForemanItem, ProjectStatus } from '../types';
import { 
  parseCoordinates, 
  getCoordinatesForLocationName, 
  calculateDistanceKm, 
  formatDistance, 
  getGoogleMapsUrl, 
  getGoogleMapsDirectionsUrl 
} from '../utils/geoUtils';
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  Layers, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  HardHat, 
  Users, 
  Activity, 
  Globe, 
  Filter, 
  Compass, 
  Eye, 
  Sparkles,
  Zap,
  Building2,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { formatRupiah, formatShortRupiah } from '../utils/formatters';

interface ProjectLocationGridCardProps {
  projects: ProjectItem[];
  foremen?: ForemanItem[];
  onOpenProjectDetail?: (project: ProjectItem) => void;
  onOpenDailyLog?: (project: ProjectItem) => void;
}

interface ProjectLocationData {
  project: ProjectItem;
  coords: { lat: number; lng: number };
  zone: string;
  isOngoing: boolean;
  distanceFromHubKm: number;
}

// Hub Reference Center (Cikarang / Greater Jakarta Hub)
const HUB_CENTER = { lat: -6.2845, lng: 107.1425, name: 'PLN Hub Cikarang/Bekasi' };

const REGIONS = [
  { id: 'ALL', label: 'Semua Wilayah' },
  { id: 'BEKASI_CIKARANG', label: 'Bekasi & Cikarang' },
  { id: 'JAKARTA', label: 'DKI Jakarta' },
  { id: 'KARAWANG', label: 'Karawang' },
  { id: 'TANGERANG', label: 'Tangerang' },
];

function getRegionZone(locName: string): string {
  const l = locName.toLowerCase();
  if (l.includes('cikarang') || l.includes('bekasi') || l.includes('cibitung') || l.includes('tambun') || l.includes('jababeka') || l.includes('giic') || l.includes('deltamas') || l.includes('mm2100')) {
    return 'BEKASI_CIKARANG';
  }
  if (l.includes('jakarta') || l.includes('gambir') || l.includes('menteng') || l.includes('cempaka') || l.includes('selatan') || l.includes('timur') || l.includes('barat') || l.includes('utara') || l.includes('pusat')) {
    return 'JAKARTA';
  }
  if (l.includes('karawang') || l.includes('kiic') || l.includes('suryacipta') || l.includes('jatiluhur')) {
    return 'KARAWANG';
  }
  if (l.includes('tangerang') || l.includes('bsd') || l.includes('serpong') || l.includes('banten')) {
    return 'TANGERANG';
  }
  return 'BEKASI_CIKARANG';
}

function getRegionLabel(zoneKey: string): string {
  switch (zoneKey) {
    case 'BEKASI_CIKARANG': return 'Bekasi & Cikarang';
    case 'JAKARTA': return 'DKI Jakarta';
    case 'KARAWANG': return 'Karawang';
    case 'TANGERANG': return 'Tangerang';
    default: return 'Jawa Barat';
  }
}

export const ProjectLocationGridCard: React.FC<ProjectLocationGridCardProps> = ({
  projects,
  foremen = [],
  onOpenProjectDetail,
  onOpenDailyLog,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ON_PROGRESS'); // default highlight ongoing work
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [gridDensity, setGridDensity] = useState<'compact' | 'detailed'>('detailed');

  // Process all projects with coordinates and metadata
  const locationDataList: ProjectLocationData[] = useMemo(() => {
    return projects.map((p, idx) => {
      let coords = parseCoordinates(
        p.koordinatLat && p.koordinatLng
          ? { lat: p.koordinatLat, lng: p.koordinatLng }
          : p.koordinatGps
      );

      if (!coords) {
        coords = getCoordinatesForLocationName(p.lokasi, p.no || idx + 1);
      }

      const zone = getRegionZone(p.lokasi);
      const dist = calculateDistanceKm(HUB_CENTER.lat, HUB_CENTER.lng, coords.lat, coords.lng);

      return {
        project: p,
        coords,
        zone,
        isOngoing: p.status === 'ON_PROGRESS',
        distanceFromHubKm: dist,
      };
    });
  }, [projects]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return locationDataList.filter((item) => {
      // Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'ON_PROGRESS' && item.project.status !== 'ON_PROGRESS') return false;
        if (selectedStatus === 'COMPLETED' && item.project.status !== 'COMPLETED') return false;
        if (selectedStatus === 'PENDING' && item.project.status !== 'PENDING') return false;
        if (selectedStatus === 'DELAYED' && item.project.status !== 'DELAYED') return false;
      }

      // Region Filter
      if (selectedRegion !== 'ALL' && item.zone !== selectedRegion) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.project.namaPekerjaan.toLowerCase().includes(q);
        const matchLoc = item.project.lokasi.toLowerCase().includes(q);
        const matchSpbj = item.project.noSPBJ.toLowerCase().includes(q);
        const matchMandor = item.project.mandor.toLowerCase().includes(q);
        const matchPic = item.project.pic.toLowerCase().includes(q);
        const matchCoord = `${item.coords.lat}, ${item.coords.lng}`.includes(q);
        return matchName || matchLoc || matchSpbj || matchMandor || matchPic || matchCoord;
      }

      return true;
    });
  }, [locationDataList, selectedStatus, selectedRegion, searchQuery]);

  // Statistics
  const ongoingCount = useMemo(() => locationDataList.filter((i) => i.isOngoing).length, [locationDataList]);
  const totalManpowerOngoing = useMemo(() => {
    return locationDataList
      .filter((i) => i.isOngoing)
      .reduce((acc, curr) => acc + (curr.project.manpower?.total || 0), 0);
  }, [locationDataList]);

  const avgProgressOngoing = useMemo(() => {
    const ongoingList = locationDataList.filter((i) => i.isOngoing);
    if (ongoingList.length === 0) return 0;
    const sum = ongoingList.reduce((acc, curr) => acc + curr.project.progressRealisasi, 0);
    return Math.round(sum / ongoingList.length);
  }, [locationDataList]);

  // Coordinate Bounds for Grid Plotting
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    if (locationDataList.length === 0) {
      return { minLat: -6.45, maxLat: -6.10, minLng: 106.60, maxLng: 107.40 };
    }
    const lats = locationDataList.map((d) => d.coords.lat);
    const lngs = locationDataList.map((d) => d.coords.lng);
    const paddingLat = 0.04;
    const paddingLng = 0.05;
    return {
      minLat: Math.min(...lats) - paddingLat,
      maxLat: Math.max(...lats) + paddingLat,
      minLng: Math.min(...lngs) - paddingLng,
      maxLng: Math.max(...lngs) + paddingLng,
    };
  }, [locationDataList]);

  // Copy GPS Coordinates
  const handleCopy = (coords: { lat: number; lng: number }, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const str = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    navigator.clipboard.writeText(str);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Convert GPS coordinates to percentage positions inside grid
  const getGridPosition = (lat: number, lng: number) => {
    const latSpan = maxLat - minLat || 0.1;
    const lngSpan = maxLng - minLng || 0.1;
    // Note: Latitude increases upwards (Y inverted in screen coordinates)
    const xPct = ((lng - minLng) / lngSpan) * 100;
    const yPct = ((maxLat - lat) / latSpan) * 100;
    return {
      x: Math.max(5, Math.min(95, xPct)),
      y: Math.max(5, Math.min(95, yPct)),
    };
  };

  const selectedItem = useMemo(() => {
    if (!selectedProjectId) return null;
    return locationDataList.find((i) => i.project.id === selectedProjectId) || null;
  }, [selectedProjectId, locationDataList]);

  return (
    <div 
      id="card-project-geographical-distribution"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Distribusi Geografis &amp; Grid Koordinat Lokasi Proyek
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wide">
                Geospatial Grid
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pemetaan sebaran titik lokasi pekerjaan SPBJ, koordinat GPS lapangan, dan monitoring aktivitas mandor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Panel' : 'Buka Panel'}
          >
            <span>{isExpanded ? 'Ringkas' : 'Tampilkan Detail'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6 bg-slate-50/50">
          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Active Sites */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pekerjaan Berjalan (Ongoing)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">{ongoingCount}</span>
                <span className="text-xs text-slate-400 font-medium">/ {locationDataList.length} Total SPBJ</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                Titik lokasi aktif di lapangan
              </p>
            </div>

            {/* KPI 2: Manpower */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Manpower Lapangan</span>
                <HardHat className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{totalManpowerOngoing}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                  Personil
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Regu mandor, teknisi &amp; K3 aktif
              </p>
            </div>

            {/* KPI 3: Avg Progress */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Rata-rata Progres Realisasi</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{avgProgressOngoing}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${avgProgressOngoing}%` }} 
                />
              </div>
            </div>

            {/* KPI 4: Primary Hub & Coverage */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pusat Hub Logistik</span>
                <Crosshair className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <span className="text-sm font-bold text-slate-900 block truncate">
                  Cikarang &amp; Jabodetabek
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {HUB_CENTER.lat.toFixed(4)}, {HUB_CENTER.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Radius rata-rata ~15 - 45 km
              </p>
            </div>
          </div>

          {/* Filter and Search Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi, SPBJ, nama proyek, mandor, atau koordinat..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setSelectedStatus('ON_PROGRESS')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    selectedStatus === 'ON_PROGRESS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ongoing ({locationDataList.filter(i => i.isOngoing).length})
                </button>
                <button
                  onClick={() => setSelectedStatus('ALL')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    selectedStatus === 'ALL'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({locationDataList.length})
                </button>
                <button
                  onClick={() => setSelectedStatus('COMPLETED')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    selectedStatus === 'COMPLETED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Selesai
                </button>
              </div>

              {/* Region Select */}
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Filter Wilayah Proyek"
                  className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer appearance-none"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Main 2-Column Bento Grid: [Visual Coordinate-Based Map Grid] + [Location Detail Cards] */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Column: Visual 2D Coordinate Grid Plane (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              {/* Grid Header & Legend */}
              <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-100 tracking-wide uppercase">
                    Peta Plot Koordinat (2D Geospatial Plane)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-300" />
                    Ongoing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Selesai
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </div>
              </div>

              {/* 2D Coordinate Scatter Grid Container */}
              <div className="relative p-4 bg-slate-950/95 overflow-hidden select-none min-h-[360px] sm:min-h-[420px] flex items-center justify-center">
                {/* Background Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #38bdf8 1px, transparent 1px),
                      linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                  }}
                />

                {/* Radar Ring Visual Centered on Hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-sky-500/15" />
                  <div className="w-48 h-48 rounded-full border border-sky-500/20" />
                  <div className="w-24 h-24 rounded-full border border-sky-500/25" />
                </div>

                {/* Coordinate Axis Labels */}
                <div className="absolute top-2 left-3 text-[10px] font-mono text-sky-400/70 pointer-events-none">
                  ▲ Lat: {maxLat.toFixed(3)}° S
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] font-mono text-sky-400/70 pointer-events-none">
                  ▼ Lat: {minLat.toFixed(3)}° S
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] font-mono text-sky-400/70 pointer-events-none">
                  Lng: {maxLng.toFixed(3)}° E ▶
                </div>
                <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>North Grid</span>
                </div>

                {/* Hub Reference Marker */}
                {(() => {
                  const pos = getGridPosition(HUB_CENTER.lat, HUB_CENTER.lng);
                  return (
                    <div 
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                    >
                      <div className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/30 animate-pulse" />
                      <span className="text-[9px] font-bold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded-xs mt-1 border border-amber-500/40 shadow-xs whitespace-nowrap">
                        ★ {HUB_CENTER.name}
                      </span>
                    </div>
                  );
                })()}

                {/* Project Location Pins on the Coordinate Grid */}
                <div className="absolute inset-6">
                  {filteredData.map((item) => {
                    const pos = getGridPosition(item.coords.lat, item.coords.lng);
                    const isSelected = selectedProjectId === item.project.id;
                    const isHovered = hoveredProjectId === item.project.id;
                    const isOngoing = item.isOngoing;

                    let pinBg = 'bg-blue-500 ring-blue-400';
                    let pinBadge = 'bg-blue-600 text-white';
                    if (item.project.status === 'COMPLETED') {
                      pinBg = 'bg-emerald-500 ring-emerald-400';
                      pinBadge = 'bg-emerald-600 text-white';
                    } else if (item.project.status === 'PENDING') {
                      pinBg = 'bg-amber-500 ring-amber-400';
                      pinBadge = 'bg-amber-600 text-white';
                    } else if (item.project.status === 'DELAYED') {
                      pinBg = 'bg-rose-500 ring-rose-400';
                      pinBadge = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={item.project.id}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        onClick={() => setSelectedProjectId(item.project.id)}
                        onMouseEnter={() => setHoveredProjectId(item.project.id)}
                        onMouseLeave={() => setHoveredProjectId(null)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-20 ${
                          isSelected ? 'scale-125 z-40' : isHovered ? 'scale-115 z-30' : 'hover:scale-110'
                        }`}
                      >
                        {/* Ping radar effect for ongoing projects */}
                        {isOngoing && (
                          <span className="absolute -inset-2 rounded-full bg-blue-400/40 animate-ping pointer-events-none" />
                        )}

                        {/* Interactive Dot */}
                        <div 
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-slate-950 shadow-md ring-2 transition-all ${pinBg} ${
                            isSelected ? 'ring-4 ring-white shadow-amber-400/50' : 'ring-slate-900'
                          }`}
                        >
                          {item.project.no || '•'}
                        </div>

                        {/* Mini Tooltip on Hover / Selected */}
                        <div 
                          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-slate-900/95 text-white border border-slate-700 shadow-xl backdrop-blur-xs pointer-events-none transition-all duration-150 ${
                            isHovered || isSelected ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-1 invisible'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1 mb-1">
                            <span className="text-[10px] font-bold text-amber-400 truncate">
                              SPBJ: {item.project.noSPBJ}
                            </span>
                            <span className={`text-[9px] px-1 py-0.2 rounded-xs font-bold ${pinBadge}`}>
                              {item.project.status}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-semibold text-slate-100 line-clamp-1">
                            {item.project.namaPekerjaan}
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5 line-clamp-1">
                            📍 {item.project.lokasi}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[9px] text-slate-300 font-mono">
                            <span>{item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}</span>
                            <span className="font-bold text-amber-400">{item.project.progressRealisasi}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid Footer Information */}
              <div className="px-4 py-2.5 bg-slate-100 text-slate-600 text-xs border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] flex items-center gap-1.5 text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  Menampilkan {filteredData.length} dari {locationDataList.length} titik koordinat proyek
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Sistem Koordinat: WGS 84 (GPS Standar)
                </span>
              </div>
            </div>

            {/* Right Column: Project Location List & Selected Focus Card (5 cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              {/* Selected Focus Card */}
              {selectedItem ? (
                <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 via-white to-amber-50/30 border-2 border-amber-400 shadow-sm transition-all animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                          No. {selectedItem.project.no}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          selectedItem.project.status === 'ON_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          selectedItem.project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedItem.project.status}
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-500">
                          {selectedItem.project.noSPBJ}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {selectedItem.project.namaPekerjaan}
                      </h4>
                    </div>

                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                      title="Batal pilih"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Location & GPS Info */}
                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{selectedItem.project.lokasi}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Zona: {getRegionLabel(selectedItem.zone)} • ±{selectedItem.distanceFromHubKm} km dari Hub Cikarang
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                        <Crosshair className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedItem.coords.lat.toFixed(6)}, {selectedItem.coords.lng.toFixed(6)}</span>
                      </div>

                      <button
                        onClick={(e) => handleCopy(selectedItem.coords, selectedItem.project.id, e)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-semibold transition-colors cursor-pointer"
                        title="Salin Koordinat"
                      >
                        {copiedId === selectedItem.project.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mandor & Manpower summary */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Mandor Lapangan:</span>
                      <span className="font-bold text-slate-900 truncate block">
                        {selectedItem.project.mandor || '-'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Realisasi / Target:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-emerald-600">{selectedItem.project.progressRealisasi}%</span>
                        <span className="text-[10px] text-slate-400">/ {selectedItem.project.progressRencana}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={getGoogleMapsDirectionsUrl(selectedItem.coords.lat, selectedItem.coords.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rute Google Maps</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>

                    {onOpenProjectDetail && (
                      <button
                        onClick={() => onOpenProjectDetail(selectedItem.project)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail SPBJ</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Klik salah satu titik pada grid peta atau daftar di bawah untuk melihat rincian koordinat &amp; navigasi lokasi.
                  </span>
                </div>
              )}

              {/* Scrollable Location List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1">
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Daftar Titik Koordinat SPBJ</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {filteredData.length} Titik
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {filteredData.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                      <MapPin className="w-6 h-6 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada lokasi yang cocok</p>
                      <p className="text-[11px]">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                    </div>
                  ) : (
                    filteredData.map((item) => {
                      const isSelected = selectedProjectId === item.project.id;
                      const isHovered = hoveredProjectId === item.project.id;

                      let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (item.project.status === 'COMPLETED') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      else if (item.project.status === 'PENDING') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                      else if (item.project.status === 'DELAYED') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';

                      return (
                        <div
                          key={item.project.id}
                          onClick={() => setSelectedProjectId(item.project.id)}
                          onMouseEnter={() => setHoveredProjectId(item.project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                          className={`p-3 transition-colors cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-amber-50/80 border-l-4 border-l-amber-500'
                              : isHovered
                              ? 'bg-slate-50'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-xs text-[10px]">
                                  #{item.project.no}
                                </span>
                                <span className="font-bold text-slate-900 truncate">
                                  {item.project.namaPekerjaan}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="truncate">{item.project.lokasi}</span>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge}`}>
                              {item.project.status === 'ON_PROGRESS' ? 'Ongoing' : item.project.status}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10.5px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                                {item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Mandor: <strong className="text-slate-700">{item.project.mandor}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleCopy(item.coords, item.project.id, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Salin Koordinat"
                              >
                                {copiedId === item.project.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <a
                                href={getGoogleMapsUrl(item.coords.lat, item.coords.lng, item.project.lokasi)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                                title="Buka di Google Maps"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
