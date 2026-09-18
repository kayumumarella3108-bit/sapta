import React, { useState, useEffect } from 'react';
import { ProjectItem, ProjectCategory, ProjectStatus, VoltageStatus, SafetyStatus } from '../types';
import { X, Save, Zap, FileText, MapPin, Users, Calendar, AlertCircle, FileUp, Sparkles } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectItem) => void;
  projectToEdit?: ProjectItem | null;
  nextNo: number;
  onOpenImportPDF?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  nextNo,
  onOpenImportPDF,
}) => {
  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    no: nextNo,
    namaPekerjaan: '',
    kategori: 'TM',
    lokasi: '',
    nilaiKontrak: 0,
    noSPBJ: '',
    pic: '',
    picKontak: '',
    mandor: '',
    mandorKontak: '',
    manpower: {
      total: 6,
      teknisiListrik: 3,
      helper: 2,
      hseOfficer: 1,
      operatorAlat: 0,
    },
    tanggalMulai: new Date().toISOString().slice(0, 10),
    targetSelesai: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    progressRencana: 0,
    progressRealisasi: 0,
    status: 'ON_PROGRESS',
    statusManuver: 'BEBAS_TEGANGAN',
    k3Status: 'AMAN',
    catatanHarian: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (projectToEdit) {
      setFormData(projectToEdit);
    } else {
      setFormData({
        no: nextNo,
        namaPekerjaan: '',
        kategori: 'TM',
        lokasi: '',
        nilaiKontrak: 0,
        noSPBJ: '',
        pic: '',
        picKontak: '',
        mandor: '',
        mandorKontak: '',
        manpower: {
          total: 6,
          teknisiListrik: 3,
          helper: 2,
          hseOfficer: 1,
          operatorAlat: 0,
        },
        tanggalMulai: new Date().toISOString().slice(0, 10),
        targetSelesai: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        progressRencana: 0,
        progressRealisasi: 0,
        status: 'ON_PROGRESS',
        statusManuver: 'BEBAS_TEGANGAN',
        k3Status: 'AMAN',
        catatanHarian: '',
      });
    }
    setErrors({});
  }, [projectToEdit, nextNo, isOpen]);

  if (!isOpen) return null;

  const handleManpowerChange = (field: keyof typeof formData.manpower, value: number) => {
    const val = Math.max(0, value || 0);
    const updated = {
      ...(formData.manpower || {
        total: 0,
        teknisiListrik: 0,
        helper: 0,
        hseOfficer: 0,
        operatorAlat: 0,
      }),
      [field]: val,
    };

    if (field !== 'total') {
      updated.total = (updated.teknisiListrik || 0) + (updated.helper || 0) + (updated.hseOfficer || 0) + (updated.operatorAlat || 0);
    }

    setFormData({
      ...formData,
      manpower: updated,
    });
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.namaPekerjaan?.trim()) errs.namaPekerjaan = 'Nama pekerjaan wajib diisi';
    if (!formData.lokasi?.trim()) errs.lokasi = 'Lokasi pekerjaan wajib diisi';
    if (!formData.noSPBJ?.trim()) errs.noSPBJ = 'Nomor SPBJ wajib diisi';
    if (!formData.pic?.trim()) errs.pic = 'Nama PIC / Pengawas wajib diisi';
    if (!formData.mandor?.trim()) errs.mandor = 'Nama Mandor wajib diisi';
    if (!formData.nilaiKontrak || formData.nilaiKontrak <= 0) errs.nilaiKontrak = 'Nilai kontrak harus lebih dari 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const projectItem: ProjectItem = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      no: Number(formData.no) || nextNo,
      namaPekerjaan: formData.namaPekerjaan || '',
      kategori: (formData.kategori as ProjectCategory) || 'TM',
      lokasi: formData.lokasi || '',
      nilaiKontrak: Number(formData.nilaiKontrak) || 0,
      noSPBJ: formData.noSPBJ || '',
      pic: formData.pic || '',
      picKontak: formData.picKontak || '',
      mandor: formData.mandor || '',
      mandorKontak: formData.mandorKontak || '',
      manpower: formData.manpower || {
        total: 0,
        teknisiListrik: 0,
        helper: 0,
        hseOfficer: 0,
        operatorAlat: 0,
      },
      tanggalMulai: formData.tanggalMulai || '',
      targetSelesai: formData.targetSelesai || '',
      progressRencana: Number(formData.progressRencana) || 0,
      progressRealisasi: Number(formData.progressRealisasi) || 0,
      status: (formData.status as ProjectStatus) || 'ON_PROGRESS',
      statusManuver: (formData.statusManuver as VoltageStatus) || 'BEBAS_TEGANGAN',
      k3Status: (formData.k3Status as SafetyStatus) || 'AMAN',
      catatanHarian: formData.catatanHarian || '',
      dailyLogs: projectToEdit?.dailyLogs || [],
      updatedAt: new Date().toISOString(),
    };

    onSave(projectItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {projectToEdit ? 'Edit Data Pekerjaan Proyek' : 'Tambah Pekerjaan Proyek Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Lengkapi seluruh parameter SPBJ, lokasi, nilai kontrak, PIC & manpower
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Import PDF Shortcut Banner */}
          {!projectToEdit && onOpenImportPDF && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Punya berkas PDF SPBJ atau RAB?
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Gunakan fitur import otomatis untuk mengisi parameter SPBJ dan RAB langsung dari berkas PDF.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportPDF();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Import PDF</span>
              </button>
            </div>
          )}

          {/* Section 1: Nomor & No SPBJ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                No. Urut
              </label>
              <input
                type="number"
                value={formData.no}
                onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>No. SPBJ (Surat Perjanjian)</span>
                {errors.noSPBJ && <span className="text-rose-500 text-[11px] lowercase">{errors.noSPBJ}</span>}
              </label>
              <input
                type="text"
                placeholder="Contoh: 0142.PJ/DAN.02.01/UP3-MENTENG/2026"
                value={formData.noSPBJ}
                onChange={(e) => setFormData({ ...formData, noSPBJ: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                  errors.noSPBJ ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Section 2: Nama Pekerjaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span>Nama Pekerjaan Kelistrikan</span>
              {errors.namaPekerjaan && <span className="text-rose-500 text-[11px] lowercase">{errors.namaPekerjaan}</span>}
            </label>
            <input
              type="text"
              placeholder="Contoh: Penarikan Kabel SKTM 20kV Feeder Gambir"
              value={formData.namaPekerjaan}
              onChange={(e) => setFormData({ ...formData, namaPekerjaan: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none ${
                errors.namaPekerjaan ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500'
              }`}
            />
          </div>

          {/* Section 3: Lokasi & Nilai Kontrak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Lokasi Pekerjaan</span>
                {errors.lokasi && <span className="text-rose-500 text-[11px] lowercase">{errors.lokasi}</span>}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Gardu Induk Cawang - Penyulang Melati KM 4"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Nilai Kontrak (Rupiah / IDR)</span>
                {errors.nilaiKontrak && <span className="text-rose-500 text-[11px] lowercase">{errors.nilaiKontrak}</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nilaiKontrak || ''}
                  onChange={(e) => setFormData({ ...formData, nilaiKontrak: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: PIC & Mandor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                <span>PIC / Project Engineer (Direksi)</span>
                {errors.pic && <span className="text-rose-500 text-[11px] lowercase">{errors.pic}</span>}
              </label>
              <input
                type="text"
                placeholder="Nama PIC (e.g. Ir. Hendra Pratama, ST)"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-amber-500 focus:outline-none mb-2"
              />
              <input
                type="text"
                placeholder="No. Telp / WA PIC (Opsional)"
                value={formData.picKontak}
                onChange={(e) => setFormData({ ...formData, picKontak: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                <span>Mandor Lapangan</span>
                {errors.mandor && <span className="text-rose-500 text-[11px] lowercase">{errors.mandor}</span>}
              </label>
              <input
                type="text"
                placeholder="Nama Mandor (e.g. Pak Supardi)"
                value={formData.mandor}
                onChange={(e) => setFormData({ ...formData, mandor: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-amber-500 focus:outline-none mb-2"
              />
              <input
                type="text"
                placeholder="No. Telp / WA Mandor (Opsional)"
                value={formData.mandorKontak}
                onChange={(e) => setFormData({ ...formData, mandorKontak: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Manpower Breakdown */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-700" />
                Alokasi Manpower (Tenaga Kerja Lapangan)
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Total: {formData.manpower?.total || 0} Orang
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Teknisi Listrik
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.manpower?.teknisiListrik ?? 0}
                  onChange={(e) => handleManpowerChange('teknisiListrik', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Helper / Tenaga Kasar
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.manpower?.helper ?? 0}
                  onChange={(e) => handleManpowerChange('helper', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Petugas HSE / K3
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.manpower?.hseOfficer ?? 0}
                  onChange={(e) => handleManpowerChange('hseOfficer', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Operator Crane/Alat
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.manpower?.operatorAlat ?? 0}
                  onChange={(e) => handleManpowerChange('operatorAlat', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Tanggal & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Target Selesai
              </label>
              <input
                type="date"
                value={formData.targetSelesai}
                onChange={(e) => setFormData({ ...formData, targetSelesai: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status Pekerjaan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="ON_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai (BAST)</option>
                <option value="DELAYED">Terkendala / Deviasi</option>
                <option value="PENDING">Persiapan / Pending</option>
              </select>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Pekerjaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
