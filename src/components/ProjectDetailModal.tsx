import React from 'react';
import { ProjectItem, ForemanItem, DailyLog } from '../types';
import { 
  formatRupiah, 
  getCategoryBadge, 
  getStatusBadge, 
  getVoltageBadge, 
  getSafetyBadge,
  formatDateIndo,
  getMaterialConditionBadge,
  getCumulativeMaterials
} from '../utils/formatters';
import { 
  getProjectPhases, 
  PHASE_CONFIG, 
  getPhaseStatusBadge 
} from '../utils/timelinePhases';
import { ProjectLocationMap } from './ProjectLocationMap';
import { 
  X, 
  FileText, 
  MapPin, 
  Calendar, 
  UserCheck, 
  HardHat, 
  Users, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Zap,
  PlusCircle,
  Phone,
  Package,
  Activity,
  CheckCircle2,
  PackagePlus,
  Compass,
  Printer
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  foremen?: ForemanItem[];
  onClose: () => void;
  onOpenAddLog: (project: ProjectItem) => void;
  onCreateMaterialRequest?: (project: ProjectItem) => void;
  onPrintDailyLog?: (project: ProjectItem, log: DailyLog) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  project,
  foremen = [],
  onClose,
  onOpenAddLog,
  onCreateMaterialRequest,
  onPrintDailyLog,
}) => {
  if (!isOpen || !project) return null;

  const catBadge = getCategoryBadge(project.kategori);
  const statusBadge = getStatusBadge(project.status);
  const voltBadge = getVoltageBadge(project.statusManuver);
  const safetyBadge = getSafetyBadge(project.k3Status);
  const deviation = project.progressRealisasi - project.progressRencana;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500 text-slate-950">
                PROYEK NO. {project.no}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                SPBJ: {project.noSPBJ}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {project.namaPekerjaan}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{project.lokasi}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Nilai Kontrak SPBJ</span>
              <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {formatRupiah(project.nilaiKontrak)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Progres Realisasi</span>
              <div className="text-base sm:text-lg font-bold text-amber-600 mt-0.5 flex items-baseline gap-1.5">
                <span>{project.progressRealisasi}%</span>
                <span className={`text-xs font-medium ${deviation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({deviation >= 0 ? `+${deviation}%` : `${deviation}%`})
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Kondisi Tegangan</span>
              <div className="mt-1">
                <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded border ${voltBadge.bg}`}>
                  {voltBadge.short}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Status Pekerjaan</span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* PIC, Mandor & Manpower Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PIC Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Person In Charge (PIC / Pengawas)
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                  Direksi Pekerjaan
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">{project.pic}</div>
              {project.picKontak && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{project.picKontak}</span>
                </div>
              )}
              <div className="text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-3">
                <span>Mulai: <strong>{formatDateIndo(project.tanggalMulai)}</strong></span>
                <span>&bull;</span>
                <span>Target: <strong>{formatDateIndo(project.targetSelesai)}</strong></span>
              </div>
            </div>

            {/* Mandor & Manpower Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  Mandor & Manpower Lapangan
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                  Total {project.manpower?.total || 0} Orang
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                Mandor: {project.mandor}
              </div>
              {project.mandorKontak && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{project.mandorKontak}</span>
                </div>
              )}

              {/* Breakdown */}
              <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-[10px] text-slate-500 block">Teknisi</span>
                  <span className="text-xs font-bold text-slate-800">{project.manpower?.teknisiListrik || 0}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-[10px] text-slate-500 block">Helper</span>
                  <span className="text-xs font-bold text-slate-800">{project.manpower?.helper || 0}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-[10px] text-slate-500 block">HSE / K3</span>
                  <span className="text-xs font-bold text-slate-800">{project.manpower?.hseOfficer || 0}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-[10px] text-slate-500 block">Operator</span>
                  <span className="text-xs font-bold text-slate-800">{project.manpower?.operatorAlat || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Peta & Titik Koordinat Lokasi Proyek & Mandor Lapangan */}
          <ProjectLocationMap
            project={project}
            foremen={foremen}
            onOpenAddLog={onOpenAddLog}
          />

          {/* Section: Timeline Berbentuk Tanggal (Persiapan s/d Pekerjaan) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Timeline Tanggal: Persiapan ➔ Manpower ➔ Material ➔ Pekerjaan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Alur 6 tahapan kerja SPBJ terstruktur berbasis rentang tanggal kalender
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {formatDateIndo(project.tanggalMulai)} &mdash; {formatDateIndo(project.targetSelesai)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {getProjectPhases(project).map((phase, idx) => {
                const conf = PHASE_CONFIG[phase.kategoriFase] || PHASE_CONFIG.PERSIAPAN;
                const statusInfo = getPhaseStatusBadge(phase.status);
                const completedCount = phase.checklists.filter((c) => c.selesai).length;

                return (
                  <div
                    key={phase.id}
                    className={`p-3 rounded-xl border transition-all ${
                      phase.status === 'SEDANG_BERJALAN'
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-500/20'
                        : phase.status === 'SELESAI'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {conf.shortTitle}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${statusInfo.bg}`}>
                        {phase.progress}%
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1 my-1">
                      <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{formatDateIndo(phase.tanggalMulai)} s/d {formatDateIndo(phase.tanggalSelesai)}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {phase.penanggungJawab}
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          phase.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{phase.durasiHari} Hari Kerja</span>
                      <span>{completedCount}/{phase.checklists.length} Checklist</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Akumulasi Material Terpasang */}
          {(() => {
            const cumulativeMats = getCumulativeMaterials(project);
            if (cumulativeMats.length === 0) return null;

            return (
              <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                        Akumulasi Komponen & Material Terpasang
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Rekapitulasi kuantitas material terverifikasi dari seluruh realisasi harian
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
                    {cumulativeMats.length} Jenis Material
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {cumulativeMats.map((mat, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs space-y-1 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-slate-900 leading-snug">
                          {mat.namaMaterial}
                        </span>
                        <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0 text-xs">
                          {mat.totalVolume} {mat.satuan}
                        </span>
                      </div>
                      {mat.spesifikasi && (
                        <div className="text-[11px] text-slate-500">
                          {mat.spesifikasi}
                        </div>
                      )}
                      {mat.lokasiList.length > 0 && (
                        <div className="text-[10.5px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{mat.lokasiList.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Daily Logs Timeline Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Riwayat Realisasi Harian & Material Lapangan (Daily Logs)
                </h4>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {project.dailyLogs?.length || 0} Entri
                </span>
              </div>

              <button
                onClick={() => onOpenAddLog(project)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Input Realisasi Baru</span>
              </button>
            </div>

            {(!project.dailyLogs || project.dailyLogs.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                Belum ada catatan harian untuk pekerjaan ini. Klik &quot;+ Input Realisasi Baru&quot; untuk mencatat progres dan material terpasang.
              </div>
            ) : (
              <div className="space-y-3">
                {project.dailyLogs.map((log, index) => (
                  <div 
                    key={log.id || index}
                    className="p-4 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-200 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          📅 {formatDateIndo(log.tanggal)}
                        </span>
                        <span className="text-slate-500">
                          Cuaca: <strong>{log.kondisiCuaca}</strong>
                        </span>
                        <span className="text-slate-500">
                          Manpower: <strong>{log.manpowerHadir} Orang</strong>
                        </span>
                        {log.koordinatGps && (
                          <span className="text-slate-500 font-mono text-[10.5px] bg-slate-200/60 px-1.5 py-0.5 rounded">
                            📍 {log.koordinatGps}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Progres: {log.progressHariIni}%
                        </span>
                        {onPrintDailyLog && (
                          <button
                            type="button"
                            onClick={() => onPrintDailyLog(project, log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md shadow-2xs text-[11px] transition-colors cursor-pointer"
                            title="Cetak Laporan Harian PDF Resmi"
                          >
                            <Printer className="w-3 h-3 text-amber-400" />
                            <span>Cetak PDF</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-800 text-xs font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <strong>Realisasi Pekerjaan:</strong> {log.pekerjaanHariIni}
                    </div>

                    {/* Installed Material List for this log */}
                    {log.materialTerpasang && log.materialTerpasang.length > 0 && (
                      <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/70 space-y-1.5">
                        <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5 uppercase">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          <span>Material Terpasang Hari Ini ({log.materialTerpasang.length} Item):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {log.materialTerpasang.map((mat, idxMat) => {
                            const matBadge = getMaterialConditionBadge(mat.kondisiStatus);
                            return (
                              <div
                                key={mat.id || idxMat}
                                className="bg-white p-2 rounded border border-amber-100 shadow-2xs space-y-1"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-semibold text-slate-900">
                                    {mat.namaMaterial}
                                  </span>
                                  <span className="font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10.5px]">
                                    {mat.volume} {mat.satuan}
                                  </span>
                                </div>
                                {mat.spesifikasi && (
                                  <div className="text-[10px] text-slate-500">
                                    {mat.spesifikasi}
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                                  <span className="text-slate-500">
                                    📍 {mat.lokasiTitik || '-'}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded border font-semibold ${matBadge.bg}`}>
                                    {matBadge.label}
                                  </span>
                                </div>
                                {mat.keterangan && (
                                  <div className="text-[10px] text-slate-500 italic bg-slate-50 p-1 rounded">
                                    Catatan: {mat.keterangan}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(log.kendala || log.solusi) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {log.kendala && (
                          <div className="bg-rose-50/70 p-2 rounded border border-rose-200 text-rose-800">
                            <strong>Kendala:</strong> {log.kendala}
                          </div>
                        )}
                        {log.solusi && (
                          <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 text-emerald-800">
                            <strong>Solusi:</strong> {log.solusi}
                          </div>
                        )}
                      </div>
                    )}

                    {log.catatanK3 && (
                      <div className="text-slate-600 text-[11px] flex items-center gap-1.5 pt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>K3: {log.catatanK3}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Terakhir diperbarui: {new Date(project.updatedAt).toLocaleString('id-ID')}</span>
          
          <div className="flex items-center gap-2">
            {onCreateMaterialRequest && (
              <button
                type="button"
                onClick={() => {
                  onCreateMaterialRequest(project);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Buat Bon MDU/Non-MDU</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
