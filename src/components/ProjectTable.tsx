import React from 'react';
import { ProjectItem } from '../types';
import { 
  formatRupiah, 
  getStatusBadge, 
  formatDateIndo 
} from '../utils/formatters';
import { 
  MapPin, 
  FileText, 
  UserCheck, 
  HardHat, 
  Users, 
  Edit3, 
  Trash2, 
  Eye, 
  PlusCircle, 
  Clock, 
  Zap, 
  AlertCircle,
  PackagePlus
} from 'lucide-react';

interface ProjectTableProps {
  projects: ProjectItem[];
  onOpenDailyLog: (project: ProjectItem) => void;
  onOpenDetail: (project: ProjectItem) => void;
  onEditProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string, namaPekerjaan: string) => void;
  onCreateMaterialRequest?: (project: ProjectItem) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onOpenDailyLog,
  onOpenDetail,
  onEditProject,
  onDeleteProject,
  onCreateMaterialRequest,
}) => {
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Tidak ada data pekerjaan ditemukan</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Coba sesuaikan kata kunci pencarian atau ubah filter status untuk melihat data proyek lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Title Bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Daftar Monitoring Harian Pekerjaan Kelistrikan
          </h2>
          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
            {projects.length} SPBJ
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Realtime Daily Tracking</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4 text-center w-12 whitespace-nowrap align-middle">No</th>
              <th className="py-3.5 px-4 min-w-[260px] whitespace-nowrap align-middle">Nama Pekerjaan</th>
              <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap align-middle">Lokasi</th>
              <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap align-middle">Nilai Kontrak</th>
              <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap align-middle">No. SPBJ</th>
              <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap align-middle">PIC (Engineer)</th>
              <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap align-middle">Mandor &amp; Manpower</th>
              <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap align-middle">Progres &amp; Status</th>
              <th className="py-3.5 px-4 text-center min-w-[120px] whitespace-nowrap align-middle">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {projects.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const isDeviationNegative = item.progressRealisasi < item.progressRencana;
              const deviation = item.progressRealisasi - item.progressRencana;

              return (
                <tr 
                  key={item.id} 
                  className="hover:bg-amber-50/30 transition-colors group"
                >
                  {/* 1. NO */}
                  <td className="py-4 px-4 text-center font-bold text-slate-500">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      {item.no}
                    </span>
                  </td>

                  {/* 2. NAMA PEKERJAAN */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 leading-snug text-[13.5px]">
                      {item.namaPekerjaan}
                    </div>
                    {item.catatanHarian && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        &ldquo;{item.catatanHarian}&rdquo;
                      </p>
                    )}
                  </td>

                  {/* 3. LOKASI */}
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 leading-relaxed">
                        {item.lokasi}
                      </span>
                    </div>
                  </td>

                  {/* 4. NILAI KONTRAK */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-[13.5px] whitespace-nowrap">
                      {formatRupiah(item.nilaiKontrak)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Target: {formatDateIndo(item.targetSelesai)}
                    </div>
                  </td>

                  {/* 5. NO SPBJ */}
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200/80">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[150px]" title={item.noSPBJ}>
                        {item.noSPBJ}
                      </span>
                    </div>
                  </td>

                  {/* 6. PIC */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-xs text-slate-800">
                        {item.pic}
                      </span>
                    </div>
                    {item.picKontak && (
                      <span className="text-[11px] text-slate-400 block mt-0.5 pl-5">
                        {item.picKontak}
                      </span>
                    )}
                  </td>

                  {/* 7. MANDOR & MANPOWER */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold text-xs text-slate-900">
                        {item.mandor}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                        <Users className="w-3 h-3" />
                        {item.manpower?.total || 0} Orang
                      </span>
                    </div>
                  </td>

                  {/* 8. PROGRES & STATUS */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">
                        {item.progressRealisasi}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Plan: {item.progressRencana}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.progressRealisasi >= 100 
                            ? 'bg-emerald-500' 
                            : isDeviationNegative 
                              ? 'bg-rose-500' 
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.progressRealisasi)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>

                      {deviation !== 0 && (
                        <span className={`text-[10.5px] font-semibold ${deviation > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {deviation > 0 ? `+${deviation}%` : `${deviation}%`}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 9. AKSI */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Update Log Harian */}
                      <button
                        id={`btn-log-${item.id}`}
                        onClick={() => onOpenDailyLog(item)}
                        className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Input / Update Laporan Harian"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>

                      {/* Buat Bon Permintaan MDU/Non-MDU */}
                      {onCreateMaterialRequest && (
                        <button
                          id={`btn-bon-mdu-${item.id}`}
                          onClick={() => onCreateMaterialRequest(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                          title="Buat Bon Permintaan Material MDU & Non-MDU untuk SPBJ ini"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Detail SPBJ */}
                      <button
                        id={`btn-detail-${item.id}`}
                        onClick={() => onOpenDetail(item)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail & Riwayat Proyek"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Proyek */}
                      <button
                        id={`btn-edit-${item.id}`}
                        onClick={() => onEditProject(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Informasi SPBJ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Hapus Proyek */}
                      <button
                        id={`btn-delete-${item.id}`}
                        onClick={() => onDeleteProject(item.id, item.namaPekerjaan)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data Pekerjaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer on Table */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Format Standard:</span>
          <span>SPBJ &bull; No &bull; Pekerjaan &bull; Lokasi &bull; Nilai &bull; PIC &bull; Mandor Manpower</span>
        </div>
        <div className="font-medium text-slate-600">
          Menampilkan {projects.length} dari total pekerjaan aktif
        </div>
      </div>
    </div>
  );
};
