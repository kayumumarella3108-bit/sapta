import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Presentation, 
  LayoutList, 
  Calendar, 
  CalendarCheck2, 
  PackagePlus, 
  Truck, 
  HardHat, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  ProjectItem, 
  MaterialRequest, 
  MaterialShipment, 
  ForemanItem, 
  WorkPlan, 
  MasterMaterialItem 
} from '../types';
import { ActiveViewType } from './Sidebar';
import {
  generateProjectsPPT,
  generateTimelinePPT,
  generateWorkPlansPPT,
  generateMaterialRequestsPPT,
  generateShipmentsPPT,
  generateForemenPPT,
  generateMasterMaterialsPPT,
  generateAllMenusExecutivePPT,
} from '../utils/pptExport';

interface PPTExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveViewType;
  projects: ProjectItem[];
  materialRequests: MaterialRequest[];
  materialShipments: MaterialShipment[];
  foremen: ForemanItem[];
  workPlans: WorkPlan[];
  masterMaterials: MasterMaterialItem[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const PPTExportModal: React.FC<PPTExportModalProps> = ({
  isOpen,
  onClose,
  activeView,
  projects,
  materialRequests,
  materialShipments,
  foremen,
  workPlans,
  masterMaterials,
  showToast,
}) => {
  const [downloadingMenu, setDownloadingMenu] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPPT = async (menuKey: ActiveViewType | 'all') => {
    try {
      setDownloadingMenu(menuKey);
      let fileName = '';

      if (menuKey === 'all') {
        fileName = await generateAllMenusExecutivePPT({
          projects,
          materialRequests,
          materialShipments,
          foremen,
          workPlans,
          masterMaterials,
        });
      } else if (menuKey === 'table') {
        fileName = await generateProjectsPPT(projects);
      } else if (menuKey === 'timeline') {
        fileName = await generateTimelinePPT(projects);
      } else if (menuKey === 'work-plans') {
        fileName = await generateWorkPlansPPT(workPlans);
      } else if (menuKey === 'material-requests') {
        fileName = await generateMaterialRequestsPPT(materialRequests);
      } else if (menuKey === 'material-shipments') {
        fileName = await generateShipmentsPPT(materialShipments);
      } else if (menuKey === 'foremen') {
        fileName = await generateForemenPPT(foremen);
      } else if (menuKey === 'master-materials') {
        fileName = await generateMasterMaterialsPPT(masterMaterials);
      }

      showToast(`File PPT berhasil diunduh: ${fileName}`, 'success');
    } catch (error) {
      console.error('Error generating PPT:', error);
      showToast('Gagal membuat file presentasi PPT. Silakan coba lagi.', 'error');
    } finally {
      setDownloadingMenu(null);
    }
  };

  const menuOptions = [
    {
      key: 'table' as ActiveViewType,
      title: '1. Monitoring Pekerjaan SPBJ',
      sub: 'Slide rekapitulasi paket proyek, nilai kontrak, status fisik & PIC mandor.',
      icon: LayoutList,
      count: `${projects.length} SPBJ`,
      accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    },
    {
      key: 'timeline' as ActiveViewType,
      title: '2. Timeline & Fase Kerja',
      sub: 'Slide matriks 6 tahapan proyek, jadwal milestone & rekap material terpasang.',
      icon: Calendar,
      count: `${projects.length} Paket`,
      accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      key: 'work-plans' as ActiveViewType,
      title: '3. Rencana Kerja Lapangan',
      sub: 'Slide target uraian harian/mingguan, shift, volume, APD K3 & alat kerja.',
      icon: CalendarCheck2,
      count: `${workPlans.length} Rencana`,
      accentColor: 'text-amber-700 bg-amber-100 border-amber-300',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      key: 'material-requests' as ActiveViewType,
      title: '4. Kebutuhan Material (Bon MDU/Non-MDU)',
      sub: 'Slide bon penarikan material gudang PLN, status approval & daftar komponen.',
      icon: PackagePlus,
      count: `${materialRequests.length} Bon`,
      accentColor: 'text-orange-600 bg-orange-50 border-orange-200',
      btnColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    {
      key: 'material-shipments' as ActiveViewType,
      title: '5. Pengiriman Material (Surat Jalan)',
      sub: 'Slide logistik ekspedisi, nomor surat jalan, driver, armada & rute site.',
      icon: Truck,
      count: `${materialShipments.length} Kirim`,
      accentColor: 'text-sky-600 bg-sky-50 border-sky-200',
      btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
    {
      key: 'foremen' as ActiveViewType,
      title: '6. Data Mandor & Manpower',
      sub: 'Slide profil mandor, kontak, spesialisasi, jumlah personil & penugasan.',
      icon: HardHat,
      count: `${foremen.length} Mandor`,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      key: 'master-materials' as ActiveViewType,
      title: '7. Master Data Material PLN',
      sub: 'Slide katalog komponen standar SPLN, spesifikasi teknis & satuan.',
      icon: Database,
      count: `${masterMaterials.length} Item`,
      accentColor: 'text-slate-700 bg-slate-100 border-slate-200',
      btnColor: 'bg-slate-800 hover:bg-slate-900 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        id="modal-download-ppt"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pusat Unduh Presentasi PowerPoint (.PPTX)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500 text-slate-950">
                  Format 16:9 Widescreen
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih menu tertentu atau unduh slide deck presentasi lengkap PT Sapta Manunggal Karya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master All-In-One Presentation Highlight Box */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-amber-50 via-amber-100/50 to-orange-50 border-b border-amber-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wide">
                  Master Executive Slide Deck
                </span>
                <span className="text-xs text-amber-900 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Semua 7 Modul Terintegrasi
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Download Presentasi Lengkap (All Modules Deck)
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Menghasilkan 1 file PPT lengkap berisi Cover Eksekutif, Portfolio SPBJ, Timeline Fase Kerja, Work Plan Lapangan, Kebutuhan Material, Pengiriman &amp; Tim Mandor untuk Rapat Koordinasi PLN/Direksi.
              </p>
            </div>

            <button
              id="btn-download-all-ppt"
              onClick={() => handleDownloadPPT('all')}
              disabled={downloadingMenu !== null}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {downloadingMenu === 'all' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Membuat Slide...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Master PPT (Semua Menu)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grid per Menu PPT */}
        <div className="p-5 sm:p-6 max-h-[55vh] overflow-y-auto space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-500">
              Download PPT Berdasarkan Menu Spesifik:
            </h4>
            <span className="text-[11px] text-slate-400">
              Menu Aktif Saat Ini:{' '}
              <span className="font-bold text-slate-700 underline">
                {menuOptions.find((m) => m.key === activeView)?.title.replace(/^[0-9]\.\s*/, '')}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuOptions.map((opt) => {
              const Icon = opt.icon;
              const isCurrentActive = activeView === opt.key;
              const isDownloading = downloadingMenu === opt.key;

              return (
                <div
                  key={opt.key}
                  className={`p-3.5 rounded-xl border bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-3 ${
                    isCurrentActive
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${opt.accentColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {opt.title}
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {opt.count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {opt.sub}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                    {isCurrentActive ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sedang dibuka di layar
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-slate-400">
                        Format .pptx siap edit
                      </span>
                    )}

                    <button
                      id={`btn-download-ppt-${opt.key}`}
                      onClick={() => handleDownloadPPT(opt.key)}
                      disabled={downloadingMenu !== null}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${opt.btnColor}`}
                      title={`Download PPT ${opt.title}`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Proses...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh PPT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Format slide terstandarisasi untuk Microsoft PowerPoint, Google Slides &amp; LibreOffice Impress.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
