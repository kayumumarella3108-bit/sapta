import React, { useState, useEffect } from 'react';
import { 
  WorkPlan, 
  WorkPlanItem, 
  WorkPlanStatus, 
  WorkPlanItemStatus, 
  ProjectItem, 
  ForemanItem 
} from '../types';
import { 
  WORK_ITEM_TEMPLATES, 
  WORK_ITEM_CATEGORIES, 
  WorkItemTemplate 
} from '../utils/workPlanTemplates';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  UserCheck, 
  HardHat, 
  Users, 
  FileText, 
  ShieldAlert, 
  Wrench, 
  Search, 
  Check, 
  Layers, 
  Clock, 
  AlertTriangle,
  BookmarkPlus,
  Sparkles
} from 'lucide-react';

interface WorkPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workPlan: WorkPlan) => void;
  workPlanToEdit?: WorkPlan | null;
  projects?: ProjectItem[];
  foremen?: ForemanItem[];
}

const COMMON_UNITS = ['Meter', 'Titik', 'Batang', 'Unit', 'Set', 'Lot', 'Gawang', 'Sesi', 'Cell', 'Pcs', 'Hari'];

export const WorkPlanModal: React.FC<WorkPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workPlanToEdit,
  projects = [],
  foremen = [],
}) => {
  const [formData, setFormData] = useState<Partial<WorkPlan>>({
    nomorRencana: '',
    judulRencana: '',
    tanggal: new Date().toISOString().split('T')[0],
    targetSelesai: '',
    lokasi: '',
    pic: '',
    picKontak: '',
    mandor: '',
    mandorKontak: '',
    manpowerCount: 6,
    namaPekerjaan: '',
    noSPBJ: '',
    projectId: '',
    status: 'TERJADWAL',
    prioritas: 'NORMAL',
    catatanK3: 'Wajib mengenakan APD Lengkap (Helm, Sepatu Safety, Kacamata, Rompi Reflektif, Sarung Tangan 20kV). Pastikan safety briefing (TBM) sebelum mulai pekerjaan.',
    alatKerja: 'Truk Crane, Roll Kabel, Tang Press Hidrolik, Megger 5kV terkalibrasi, Earth Tester, Tangga Fiber, Toolset ME.',
  });

  const [items, setItems] = useState<WorkPlanItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Template Picker State
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<string>('Semua Kategori');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());

  // Manual Item Quick Add State
  const [manualItem, setManualItem] = useState<{
    uraianPekerjaan: string;
    kategori: string;
    volume: number;
    satuan: string;
    targetWaktu: string;
    catatan: string;
  }>({
    uraianPekerjaan: '',
    kategori: 'Kabel & Jaringan TM/TR',
    volume: 1,
    satuan: 'Meter',
    targetWaktu: '08:00 - 16:00',
    catatan: '',
  });
  const [showManualForm, setShowManualForm] = useState(false);

  // Initialize or Reset form
  useEffect(() => {
    if (workPlanToEdit) {
      setFormData({
        nomorRencana: workPlanToEdit.nomorRencana,
        judulRencana: workPlanToEdit.judulRencana,
        tanggal: workPlanToEdit.tanggal,
        targetSelesai: workPlanToEdit.targetSelesai || '',
        lokasi: workPlanToEdit.lokasi,
        pic: workPlanToEdit.pic,
        picKontak: workPlanToEdit.picKontak || '',
        mandor: workPlanToEdit.mandor,
        mandorKontak: workPlanToEdit.mandorKontak || '',
        manpowerCount: workPlanToEdit.manpowerCount || 6,
        namaPekerjaan: workPlanToEdit.namaPekerjaan || '',
        noSPBJ: workPlanToEdit.noSPBJ || '',
        projectId: workPlanToEdit.projectId || '',
        status: workPlanToEdit.status || 'TERJADWAL',
        prioritas: workPlanToEdit.prioritas || 'NORMAL',
        catatanK3: workPlanToEdit.catatanK3 || '',
        alatKerja: workPlanToEdit.alatKerja || '',
      });
      setItems(workPlanToEdit.items ? [...workPlanToEdit.items] : []);
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const today = new Date();
      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
      const yearStr = today.getFullYear();
      
      setFormData({
        nomorRencana: `RK-SMK/${yearStr}/${monthStr}/${randomNum}`,
        judulRencana: '',
        tanggal: today.toISOString().split('T')[0],
        targetSelesai: `${today.toISOString().split('T')[0]} (08:00 - 17:00 WIB)`,
        lokasi: '',
        pic: projects.length > 0 ? projects[0].pic : '',
        picKontak: projects.length > 0 ? projects[0].picKontak || '' : '',
        mandor: foremen.length > 0 ? foremen[0].namaMandor : (projects.length > 0 ? projects[0].mandor : ''),
        mandorKontak: foremen.length > 0 ? foremen[0].kontak : (projects.length > 0 ? projects[0].mandorKontak || '' : ''),
        manpowerCount: 6,
        namaPekerjaan: '',
        noSPBJ: '',
        projectId: '',
        status: 'TERJADWAL',
        prioritas: 'NORMAL',
        catatanK3: 'Wajib mengenakan APD Lengkap (Helm, Sepatu Safety, Kacamata, Rompi Reflektif, Sarung Tangan 20kV). Pastikan safety briefing (TBM) sebelum mulai pekerjaan.',
        alatKerja: 'Truk Crane, Roll Kabel, Tang Press Hidrolik, Megger 5kV terkalibrasi, Earth Tester, Tangga Fiber, Toolset ME.',
      });

      // Default sample item
      setItems([
        {
          id: 'item-init-1',
          uraianPekerjaan: 'Safety Briefing Pagi / Tool Box Meeting (TBM) & Pemeriksaan APD 20 kV',
          kategori: 'Sistem Proteksi Grounding & K3',
          volume: 1,
          satuan: 'Sesi',
          targetWaktu: '07:30 - 08:00',
          status: 'BELUM_MULAI',
          catatan: 'Wajib cek APD dan SIKA PLN sebelum ke titik kerja',
        },
        {
          id: 'item-init-2',
          uraianPekerjaan: 'Penarikan Kabel TM N2XSEBY 3x150 mm² 20 kV',
          kategori: 'Kabel & Jaringan TM/TR',
          volume: 200,
          satuan: 'Meter',
          targetWaktu: '08:00 - 12:00',
          status: 'BELUM_MULAI',
          catatan: 'Gunakan roll kabel dan jaga radius tekukan aman',
        }
      ]);
    }
    setErrors({});
    setIsTemplatePickerOpen(false);
    setSelectedTemplateIds(new Set());
    setShowManualForm(false);
  }, [workPlanToEdit, isOpen]);

  // Handle Project selection to autofill
  const handleSelectProject = (projectId: string) => {
    if (!projectId) {
      setFormData((prev) => ({
        ...prev,
        projectId: '',
        namaPekerjaan: '',
        noSPBJ: '',
      }));
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    if (selectedProj) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedProj.id,
        namaPekerjaan: selectedProj.namaPekerjaan,
        noSPBJ: selectedProj.noSPBJ,
        lokasi: prev.lokasi ? prev.lokasi : selectedProj.lokasi,
        pic: prev.pic ? prev.pic : selectedProj.pic,
        picKontak: prev.picKontak ? prev.picKontak : (selectedProj.picKontak || ''),
        mandor: prev.mandor ? prev.mandor : selectedProj.mandor,
        mandorKontak: prev.mandorKontak ? prev.mandorKontak : (selectedProj.mandorKontak || ''),
        manpowerCount: selectedProj.manpower ? selectedProj.manpower.total : prev.manpowerCount,
        judulRencana: prev.judulRencana ? prev.judulRencana : `Rencana Kerja Lapangan - ${selectedProj.namaPekerjaan}`,
      }));
    }
  };

  // Handle Foreman selection to autofill
  const handleSelectForeman = (foremanName: string) => {
    const selectedF = foremen.find((f) => f.namaMandor === foremanName);
    if (selectedF) {
      setFormData((prev) => ({
        ...prev,
        mandor: selectedF.namaMandor,
        mandorKontak: selectedF.kontak || prev.mandorKontak,
        manpowerCount: selectedF.jumlahAnggota || prev.manpowerCount,
        lokasi: prev.lokasi || (selectedF.assignments.length > 0 ? selectedF.assignments[0].lokasiPekerjaan : ''),
        pic: prev.pic || (selectedF.assignments.length > 0 ? selectedF.assignments[0].pic : ''),
      }));
    } else {
      setFormData((prev) => ({ ...prev, mandor: foremanName }));
    }
  };

  // Add items from selected templates
  const handleAddSelectedTemplates = () => {
    const newItems: WorkPlanItem[] = [];
    WORK_ITEM_TEMPLATES.forEach((tpl) => {
      if (selectedTemplateIds.has(tpl.id)) {
        newItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          uraianPekerjaan: tpl.uraianPekerjaan,
          kategori: tpl.kategori,
          volume: tpl.volumeDefault,
          satuan: tpl.satuanDefault,
          targetWaktu: '08:00 - 16:00',
          status: 'BELUM_MULAI',
          catatan: tpl.catatanDefault || '',
        });
      }
    });

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setSelectedTemplateIds(new Set());
      setIsTemplatePickerOpen(false);
    }
  };

  // Add manual custom item
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualItem.uraianPekerjaan.trim()) {
      alert('Uraian pekerjaan wajib diisi.');
      return;
    }

    const newItem: WorkPlanItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uraianPekerjaan: manualItem.uraianPekerjaan.trim(),
      kategori: manualItem.kategori || 'Umum',
      volume: Number(manualItem.volume) > 0 ? Number(manualItem.volume) : 1,
      satuan: manualItem.satuan || 'Meter',
      targetWaktu: manualItem.targetWaktu || '08:00 - 16:00',
      status: 'BELUM_MULAI',
      catatan: manualItem.catatan.trim(),
    };

    setItems((prev) => [...prev, newItem]);
    setManualItem({
      uraianPekerjaan: '',
      kategori: 'Kabel & Jaringan TM/TR',
      volume: 1,
      satuan: 'Meter',
      targetWaktu: '08:00 - 16:00',
      catatan: '',
    });
    setShowManualForm(false);
  };

  // Update item in list
  const handleUpdateItem = (index: number, field: keyof WorkPlanItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Delete item from list
  const handleDeleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle template selection
  const toggleTemplateSelection = (id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered templates in picker
  const filteredTemplates = WORK_ITEM_TEMPLATES.filter((tpl) => {
    const matchCat = templateCategory === 'Semua Kategori' || tpl.kategori === templateCategory;
    const matchSearch = tpl.uraianPekerjaan.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.kategori.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nomorRencana?.trim()) newErrors.nomorRencana = 'Nomor Rencana Kerja wajib diisi';
    if (!formData.tanggal?.trim()) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.lokasi?.trim()) newErrors.lokasi = 'Lokasi pekerjaan wajib diisi';
    if (!formData.pic?.trim()) newErrors.pic = 'PIC / Pengawas wajib diisi';
    if (!formData.mandor?.trim()) newErrors.mandor = 'Nama Mandor wajib diisi';
    if (items.length === 0) newErrors.items = 'Minimal harus memiliki 1 uraian item pekerjaan';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalPlan: WorkPlan = {
      id: workPlanToEdit?.id || `rk-${Date.now()}`,
      nomorRencana: formData.nomorRencana!.trim(),
      judulRencana: formData.judulRencana?.trim() || `Rencana Kerja Lapangan - ${formData.lokasi}`,
      tanggal: formData.tanggal!,
      targetSelesai: formData.targetSelesai?.trim(),
      lokasi: formData.lokasi!.trim(),
      pic: formData.pic!.trim(),
      picKontak: formData.picKontak?.trim(),
      mandor: formData.mandor!.trim(),
      mandorKontak: formData.mandorKontak?.trim(),
      manpowerCount: Number(formData.manpowerCount) || 1,
      namaPekerjaan: formData.namaPekerjaan?.trim(),
      noSPBJ: formData.noSPBJ?.trim(),
      projectId: formData.projectId || undefined,
      status: (formData.status as WorkPlanStatus) || 'TERJADWAL',
      prioritas: (formData.prioritas as 'NORMAL' | 'TINGGI' | 'URGENT') || 'NORMAL',
      items: items,
      catatanK3: formData.catatanK3?.trim(),
      alatKerja: formData.alatKerja?.trim(),
      createdAt: workPlanToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(finalPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {workPlanToEdit ? 'Edit Rencana Kerja Lapangan' : 'Buat Rencana Kerja Lapangan Baru'}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Divisi ME
                </span>
              </h2>
              <p className="text-xs text-amber-100/90">
                Formulir perencanaan pekerjaan harian / mingguan, penugasan lokasi, PIC, mandor, dan rincian uraian pekerjaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Informasi Utama & Penjadwalan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>1. Identitas &amp; Jadwal Pelaksanaan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nomor Rencana */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Rencana Kerja <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomorRencana || ''}
                  onChange={(e) => setFormData({ ...formData, nomorRencana: e.target.value })}
                  placeholder="e.g. RK-SMK/2026/09/001"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.nomorRencana ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-amber-500`}
                />
                {errors.nomorRencana && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.nomorRencana}</p>
                )}
              </div>

              {/* Tanggal Pelaksanaan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal || ''}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.tanggal ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold`}
                />
                {errors.tanggal && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.tanggal}</p>
                )}
              </div>

              {/* Target Selesai / Jam Kerja */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Selesai / Jam Kerja
                </label>
                <input
                  type="text"
                  value={formData.targetSelesai || ''}
                  onChange={(e) => setFormData({ ...formData, targetSelesai: e.target.value })}
                  placeholder="e.g. 2026-09-20 (08:00 - 17:00 WIB)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Judul Rencana & Keterkaitan Proyek / SPBJ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Rencana Kerja
                </label>
                <input
                  type="text"
                  value={formData.judulRencana || ''}
                  onChange={(e) => setFormData({ ...formData, judulRencana: e.target.value })}
                  placeholder="e.g. Penarikan Kabel TM &amp; Ereksi Gardu Sisipan"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautkan ke Proyek / SPBJ (Otomatis Mengisi Data)
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Proyek Terdaftar (Opsional) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.kategori}] {p.namaPekerjaan} ({p.noSPBJ})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status & Prioritas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Rencana Kerja
                </label>
                <select
                  value={formData.status || 'TERJADWAL'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkPlanStatus })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                >
                  <option value="DRAFT">DRAFT (Penyusunan)</option>
                  <option value="TERJADWAL">TERJADWAL (Siap Eksekusi Lapangan)</option>
                  <option value="SEDANG_BERJALAN">SEDANG BERJALAN (On Progress)</option>
                  <option value="SELESAI">SELESAI (Pekerjaan Tuntas)</option>
                  <option value="TERTUNDA">TERTUNDA (Tertahan Cuaca/Izin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Prioritas
                </label>
                <select
                  value={formData.prioritas || 'NORMAL'}
                  onChange={(e) => setFormData({ ...formData, prioritas: e.target.value as 'NORMAL' | 'TINGGI' | 'URGENT' })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="TINGGI">Tinggi (High Priority)</option>
                  <option value="URGENT">Urgent / Manuver Padam Kritis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Lokasi, PIC & Mandor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>2. Lokasi, PIC Pengawas &amp; Mandor Lapangan</span>
            </div>

            {/* Lokasi Pekerjaan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Pekerjaan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.lokasi || ''}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="e.g. Jl. Raya Industri Blok C-4 s/d Titik T.08, Cikarang"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                    errors.lokasi ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-amber-500`}
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              {errors.lokasi && (
                <p className="text-[11px] text-red-500 mt-1">{errors.lokasi}</p>
              )}
            </div>

            {/* PIC & Mandor Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PIC */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>PIC / Pengawas Proyek <span className="text-red-500">*</span></span>
                </div>
                <input
                  type="text"
                  value={formData.pic || ''}
                  onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                  placeholder="Nama Pengawas (e.g. Ir. Bambang S.)"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.pic ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
                />
                {errors.pic && <p className="text-[11px] text-red-500">{errors.pic}</p>}
                <input
                  type="text"
                  value={formData.picKontak || ''}
                  onChange={(e) => setFormData({ ...formData, picKontak: e.target.value })}
                  placeholder="No HP / WhatsApp PIC"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mandor */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    <span>Mandor Pelaksana <span className="text-red-500">*</span></span>
                  </div>
                  {foremen.length > 0 && (
                    <span className="text-[10px] text-amber-700 font-semibold">
                      Tersedia {foremen.length} Mandor
                    </span>
                  )}
                </div>
                
                {foremen.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={formData.mandor || ''}
                      onChange={(e) => handleSelectForeman(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                    >
                      <option value="">-- Pilih dari Daftar Mandor atau Ketik Manual --</option>
                      {foremen.map((f) => (
                        <option key={f.id} value={f.namaMandor}>
                          {f.namaMandor} ({f.spesialisasi || 'Pelaksana'} - {f.jumlahAnggota || 0} Tenaga)
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.mandor || ''}
                      onChange={(e) => setFormData({ ...formData, mandor: e.target.value })}
                      placeholder="Atau masukkan nama mandor manual..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.mandor || ''}
                    onChange={(e) => setFormData({ ...formData, mandor: e.target.value })}
                    placeholder="Nama Mandor (e.g. Mandor Sutrisno)"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.mandor ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    } bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500`}
                  />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.mandorKontak || ''}
                    onChange={(e) => setFormData({ ...formData, mandorKontak: e.target.value })}
                    placeholder="No HP / WA Mandor"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <input
                      type="number"
                      min="1"
                      value={formData.manpowerCount || 1}
                      onChange={(e) => setFormData({ ...formData, manpowerCount: Number(e.target.value) })}
                      className="w-full text-xs font-bold text-slate-800 focus:outline-hidden"
                      title="Jumlah Tenaga Kerja"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold shrink-0">Org</span>
                  </div>
                </div>
                {errors.mandor && <p className="text-[11px] text-red-500">{errors.mandor}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Uraian Pekerjaan per Item (Bisa Pilih Template & Input Manual) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>3. Uraian Pekerjaan per Item ({items.length} Item) <span className="text-red-500">*</span></span>
              </div>
              
              {/* Action Buttons: Template Picker & Manual Add */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pilih dari Template Standar ME</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Manual</span>
                </button>
              </div>
            </div>

            {errors.items && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errors.items}</span>
              </div>
            )}

            {/* Quick Manual Add Form Box (Expandable) */}
            {showManualForm && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Input Uraian Pekerjaan Manual
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Uraian / Deskripsi Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={manualItem.uraianPekerjaan}
                      onChange={(e) => setManualItem({ ...manualItem, uraianPekerjaan: e.target.value })}
                      placeholder="e.g. Penarikan Kabel Twisted LVTC 4x70 mm²"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kategori
                    </label>
                    <select
                      value={manualItem.kategori}
                      onChange={(e) => setManualItem({ ...manualItem, kategori: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {WORK_ITEM_CATEGORIES.filter((c) => c !== 'Semua Kategori').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Target Volume &amp; Satuan
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={manualItem.volume}
                        onChange={(e) => setManualItem({ ...manualItem, volume: Number(e.target.value) })}
                        className="w-1/2 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-center"
                      />
                      <select
                        value={manualItem.satuan}
                        onChange={(e) => setManualItem({ ...manualItem, satuan: e.target.value })}
                        className="w-1/2 px-1 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={manualItem.targetWaktu}
                      onChange={(e) => setManualItem({ ...manualItem, targetWaktu: e.target.value })}
                      placeholder="Target Waktu (e.g. 08:00 - 12:00)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={manualItem.catatan}
                      onChange={(e) => setManualItem({ ...manualItem, catatan: e.target.value })}
                      placeholder="Catatan khusus / APD K3 / instruksi alat..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddManualItem}
                      className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Work Plan Items */}
            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  Belum ada uraian pekerjaan yang ditambahkan
                </p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol <strong>"Pilih dari Template Standar ME"</strong> atau <strong>"+ Tambah Manual"</strong> di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-2 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-200">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.uraianPekerjaan}
                          onChange={(e) => handleUpdateItem(index, 'uraianPekerjaan', e.target.value)}
                          placeholder="Uraian pekerjaan..."
                          className="w-full text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-hidden px-1 py-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Item Selector */}
                        <select
                          value={item.status || 'BELUM_MULAI'}
                          onChange={(e) => handleUpdateItem(index, 'status', e.target.value as WorkPlanItemStatus)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            item.status === 'SELESAI'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'SEDANG_DIKERJAKAN'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="BELUM_MULAI">Belum Mulai</option>
                          <option value="SEDANG_DIKERJAKAN">Dikerjakan</option>
                          <option value="SELESAI">Selesai</option>
                        </select>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus item pekerjaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs pt-1 border-t border-slate-100 items-center">
                      {/* Volume & Satuan */}
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-semibold shrink-0">Volume:</span>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.volume}
                          onChange={(e) => handleUpdateItem(index, 'volume', Number(e.target.value))}
                          className="w-20 px-2 py-0.5 text-xs font-black text-slate-900 border border-slate-300 rounded-md text-center bg-amber-50/50"
                        />
                        <select
                          value={item.satuan}
                          onChange={(e) => handleUpdateItem(index, 'satuan', e.target.value)}
                          className="px-1.5 py-0.5 text-xs border border-slate-300 rounded-md bg-white font-medium"
                        >
                          {COMMON_UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target Waktu */}
                      <div className="sm:col-span-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={item.targetWaktu || ''}
                          onChange={(e) => handleUpdateItem(index, 'targetWaktu', e.target.value)}
                          placeholder="Target Waktu"
                          className="w-full text-xs px-2 py-0.5 border border-slate-200 rounded-md focus:border-amber-500"
                        />
                      </div>

                      {/* Catatan K3 / Khusus */}
                      <div className="sm:col-span-5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.catatan || ''}
                          onChange={(e) => handleUpdateItem(index, 'catatan', e.target.value)}
                          placeholder="Catatan / instruksi APD..."
                          className="w-full text-xs px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: K3 Keselamatan & Peralatan Kerja */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>4. Keselamatan Kerja (K3) &amp; Kesiapan Alat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi K3 &amp; SIKA Ketenagalistrikan
                </label>
                <textarea
                  rows={2}
                  value={formData.catatanK3 || ''}
                  onChange={(e) => setFormData({ ...formData, catatanK3: e.target.value })}
                  placeholder="Instruksi K3, APD 20kV, izin manuver padam PLN..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peralatan Kerja &amp; Alat Ukur yang Disiapkan
                </label>
                <textarea
                  rows={2}
                  value={formData.alatKerja || ''}
                  onChange={(e) => setFormData({ ...formData, alatKerja: e.target.value })}
                  placeholder="Truk crane, megger 5kV, roll kabel, hydraulic crimper..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              <span>Pastikan seluruh uraian pekerjaan, PIC, dan mandor telah sesuai standar SPBJ &amp; K3 PLN.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Rencana Kerja</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Template Picker Dialog Popup */}
      {isTemplatePickerOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Template Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookmarkPlus className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Katalog Template Pekerjaan Standar ME PLN</h3>
                  <p className="text-[11px] text-slate-300">Pilih satu atau beberapa item untuk ditambahkan ke rencana kerja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Filters */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Cari uraian pekerjaan (misal: penarikan kabel, tiang beton, trafo, grounding)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
                {WORK_ITEM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      templateCategory === cat
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ditemukan template yang cocok dengan kata kunci.
                </div>
              ) : (
                filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateIds.has(tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => toggleTemplateSelection(tpl.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{tpl.uraianPekerjaan}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
                              {tpl.kategori}
                            </span>
                          </div>
                          {tpl.catatanDefault && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{tpl.catatanDefault}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
                          {tpl.volumeDefault} {tpl.satuanDefault}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Template Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">
                Terpilih: <strong>{selectedTemplateIds.size}</strong> item
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={selectedTemplateIds.size === 0}
                  onClick={handleAddSelectedTemplates}
                  className="px-4 py-1.5 text-xs font-black bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  + Tambahkan ({selectedTemplateIds.size}) Item ke Rencana
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
