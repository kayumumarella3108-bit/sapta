import React from 'react';
import {
  LayoutList,
  Calendar,
  CalendarCheck2,
  PackagePlus,
  Truck,
  HardHat,
  Database,
  FileUp,
  Plus,
  Download,
  Printer,
  RotateCcw,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Presentation,
  X
} from 'lucide-react';

export type ActiveViewType =
  | 'table'
  | 'timeline'
  | 'work-plans'
  | 'material-requests'
  | 'material-shipments'
  | 'foremen'
  | 'master-materials';

interface SidebarProps {
  activeView: ActiveViewType;
  setActiveView: (view: ActiveViewType) => void;
  totalProjects: number;
  totalInstalledMaterials: number;
  totalWorkPlans: number;
  totalMaterialRequests: number;
  totalMaterialShipments: number;
  totalForemen: number;
  totalMasterMaterials: number;
  onAddProject: () => void;
  onImportSPBJ: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onOpenPPTModal?: () => void;
  onResetData: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  totalProjects,
  totalInstalledMaterials,
  totalWorkPlans,
  totalMaterialRequests,
  totalMaterialShipments,
  totalForemen,
  totalMasterMaterials,
  onAddProject,
  onImportSPBJ,
  onExportCSV,
  onPrintReport,
  onOpenPPTModal,
  onResetData,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'table' as ActiveViewType,
      label: 'Monitoring Pekerjaan',
      sublabel: 'Daftar SPBJ & Progres',
      icon: LayoutList,
      count: `${totalProjects} SPBJ`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      activeBadgeColor: 'bg-slate-900 text-amber-300 border-slate-800',
      iconColor: 'text-amber-500',
    },
    {
      id: 'timeline' as ActiveViewType,
      label: 'Timeline & Realisasi',
      sublabel: 'Matriks Waktu & Material',
      icon: Calendar,
      count: `${totalInstalledMaterials} Mat`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      activeBadgeColor: 'bg-blue-600 text-white border-blue-500',
      iconColor: 'text-blue-500',
    },
    {
      id: 'work-plans' as ActiveViewType,
      label: 'Rencana Kerja',
      sublabel: 'Jadwal & Uraian Lapangan',
      icon: CalendarCheck2,
      count: `${totalWorkPlans} Rencana`,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      activeBadgeColor: 'bg-amber-500 text-slate-950 font-black border-amber-400',
      iconColor: 'text-amber-600',
    },
    {
      id: 'material-requests' as ActiveViewType,
      label: 'Kebutuhan Material',
      sublabel: 'Bon MDU & Non-MDU',
      icon: PackagePlus,
      count: `${totalMaterialRequests} Bon`,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      activeBadgeColor: 'bg-orange-500 text-white border-orange-400',
      iconColor: 'text-orange-500',
    },
    {
      id: 'material-shipments' as ActiveViewType,
      label: 'Pengiriman Material',
      sublabel: 'Ekspedisi & Surat Jalan',
      icon: Truck,
      count: `${totalMaterialShipments} Kirim`,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      activeBadgeColor: 'bg-sky-600 text-white border-sky-500',
      iconColor: 'text-sky-500',
    },
    {
      id: 'foremen' as ActiveViewType,
      label: 'Data Mandor',
      sublabel: 'Multi-Lokasi & PIC',
      icon: HardHat,
      count: `${totalForemen} Mandor`,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      activeBadgeColor: 'bg-slate-900 text-amber-300 border-slate-700',
      iconColor: 'text-amber-500',
    },
    {
      id: 'master-materials' as ActiveViewType,
      label: 'Master Data Material',
      sublabel: 'Katalog Standar PLN',
      icon: Database,
      count: `${totalMasterMaterials} Item`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      activeBadgeColor: 'bg-slate-800 text-white border-slate-700',
      iconColor: 'text-slate-600',
    },
  ];

  const handleSelectView = (viewId: ActiveViewType) => {
    setActiveView(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[73px] left-0 h-screen lg:h-[calc(100vh-73px)] w-72 sm:w-80 bg-white border-r border-slate-200 shadow-sm lg:shadow-none z-50 lg:z-10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar (Mobile only) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between lg:hidden bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Menu Navigasi</span>
              <span className="text-[10.5px] text-amber-400">PT Sapta Manunggal Karya</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Section: Navigasi Utama */}
          <div>
            <div className="px-2.5 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
                Menu Utama
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                7 Modul
              </span>
            </div>

            {/* Vertical Menu List (Dari Atas ke Bawah) */}
            <nav className="space-y-1.5" aria-label="Sidebar Menu">
              {menuItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-menu-${item.id}`}
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full group flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/60 shadow-xs'
                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : item.iconColor}`} />
                      </div>
                      <div className="truncate">
                        <span
                          className={`block text-xs sm:text-[13px] font-bold tracking-tight truncate ${
                            isActive ? 'text-slate-950 font-black' : 'text-slate-800'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block text-[10.5px] text-slate-500 truncate">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          isActive ? item.activeBadgeColor : item.badgeColor
                        }`}
                      >
                        {item.count}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive
                            ? 'text-amber-600 translate-x-0.5'
                            : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Aksi Cepat & Dokumen Proyek */}
          <div className="pt-3 border-t border-slate-200">
            <div className="px-2.5 mb-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
                Aksi Cepat &amp; Dokumen
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Import SPBJ / RAB (PDF) */}
              <button
                onClick={() => {
                  onImportSPBJ();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs transition-colors cursor-pointer border border-slate-800 shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <FileUp className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="truncate">
                  <span className="block font-bold">Import SPBJ / RAB</span>
                  <span className="block text-[10px] text-slate-400">Unggah berkas PDF</span>
                </div>
              </button>

              {/* Tambah Proyek Manual */}
              <button
                onClick={() => {
                  onAddProject();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer border border-amber-600 shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-slate-950 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-slate-950" />
                </div>
                <div className="truncate">
                  <span className="block font-bold">Tambah Proyek SPBJ</span>
                  <span className="block text-[10px] text-amber-950 font-medium">Input data manual</span>
                </div>
              </button>

              {/* Download PPT Presentasi */}
              {onOpenPPTModal && (
                <button
                  id="btn-sidebar-open-ppt-modal"
                  onClick={() => {
                    onOpenPPTModal();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors cursor-pointer border border-amber-300 shadow-2xs"
                  title="Buka Pusat Unduh Presentasi PowerPoint (.PPTX) per Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Presentation className="w-4 h-4 text-amber-900" />
                  </div>
                  <div className="truncate">
                    <span className="block font-bold">Download PPT per Menu</span>
                    <span className="block text-[10px] text-amber-700 font-medium">PowerPoint .pptx 16:9</span>
                  </div>
                </button>
              )}

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {/* Export Excel */}
                <button
                  onClick={onExportCSV}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Export data ke spreadsheet Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Excel</span>
                </button>

                {/* Cetak Laporan */}
                <button
                  onClick={onPrintReport}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Cetak dan pratinjau dokumen laporan resmi"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Laporan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Sidebar: Reset Data & Company Badge */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Standar PLN K3</span>
            </span>
            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded hover:bg-white border border-transparent hover:border-slate-200"
              title="Reset data contoh bawaan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
