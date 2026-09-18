import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  PackagePlus, 
  Plus, 
  Trash2, 
  Layers, 
  Box, 
  Sparkles, 
  Calendar, 
  MapPin, 
  FileText, 
  Users, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { MaterialRequest, MaterialRequestItem, MaterialRequestStatus, ProjectItem, MasterMaterialItem } from '../types';
import { MDU_PRESETS, NON_MDU_PRESETS } from '../utils/materialCatalog';
import { MasterMaterialPickerModal } from './MasterMaterialPickerModal';

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: MaterialRequest) => void;
  requestToEdit?: MaterialRequest | null;
  projects: ProjectItem[];
  prefilledProjectId?: string | null;
  masterMaterials?: MasterMaterialItem[];
}

export const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  requestToEdit,
  projects,
  prefilledProjectId,
  masterMaterials = [],
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const [nomorPermintaan, setNomorPermintaan] = useState('');
  const [tanggalPermintaan, setTanggalPermintaan] = useState(today);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [noSPBJ, setNoSPBJ] = useState('');
  const [pemohon, setPemohon] = useState('');
  const [kontakPemohon, setKontakPemohon] = useState('');
  const [direksiPengawas, setDireksiPengawas] = useState('');
  const [petugasGudang, setPetugasGudang] = useState('');
  const [status, setStatus] = useState<MaterialRequestStatus>('DIAJUKAN');
  const [catatan, setCatatan] = useState('');

  const [itemsMDU, setItemsMDU] = useState<MaterialRequestItem[]>([]);
  const [itemsNonMDU, setItemsNonMDU] = useState<MaterialRequestItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTargetCategory, setPickerTargetCategory] = useState<'MDU' | 'NON_MDU'>('MDU');

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (requestToEdit) {
      setNomorPermintaan(requestToEdit.nomorPermintaan);
      setTanggalPermintaan(requestToEdit.tanggalPermintaan);
      setSelectedProjectId(requestToEdit.projectId || '');
      setPekerjaan(requestToEdit.pekerjaan);
      setLokasi(requestToEdit.lokasi);
      setNoSPBJ(requestToEdit.noSPBJ);
      setPemohon(requestToEdit.pemohon);
      setKontakPemohon(requestToEdit.kontakPemohon || '');
      setDireksiPengawas(requestToEdit.direksiPengawas);
      setPetugasGudang(requestToEdit.petugasGudang || '');
      setStatus(requestToEdit.status);
      setCatatan(requestToEdit.catatan || '');
      setItemsMDU(requestToEdit.itemsMDU || []);
      setItemsNonMDU(requestToEdit.itemsNonMDU || []);
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const yearMonth = today.slice(0, 7).replace('-', '/');
      setNomorPermintaan(`BON-MDU/${yearMonth}/${randomSuffix}`);
      setTanggalPermintaan(today);
      setStatus('DIAJUKAN');
      setPetugasGudang('Bagian Logistik UP3');
      setCatatan('');

      // If prefilled with a specific project or default to first project
      const targetProj = prefilledProjectId 
        ? projects.find(p => p.id === prefilledProjectId)
        : null;

      if (targetProj) {
        setSelectedProjectId(targetProj.id);
        setPekerjaan(targetProj.namaPekerjaan);
        setLokasi(targetProj.lokasi);
        setNoSPBJ(targetProj.noSPBJ);
        setPemohon(targetProj.mandor);
        setKontakPemohon(targetProj.mandorKontak || '');
        setDireksiPengawas(targetProj.pic);
      } else {
        setSelectedProjectId('');
        setPekerjaan('');
        setLokasi('');
        setNoSPBJ('');
        setPemohon('');
        setKontakPemohon('');
        setDireksiPengawas('');
      }

      // Default with 1 empty item each or pre-selected
      setItemsMDU([
        {
          id: `mdu-${Date.now()}-1`,
          kodeMaterial: 'MDU-01',
          namaMaterial: 'Kabel SKTM XLPE 20kV N2XSEBY 3x300 mm²',
          spesifikasi: 'SPLN 43-5 Cu/XLPE/PVC/DSTA/PVC 24kV',
          volume: 200,
          satuan: 'meter',
          volumeDisetujui: 200,
          keterangan: 'Kebutuhan primer penarikan',
        }
      ]);

      setItemsNonMDU([
        {
          id: `nonmdu-${Date.now()}-1`,
          kodeMaterial: 'NON-01',
          namaMaterial: 'Jointing Kit Kabel SKTM 20kV 3x300 mm²',
          spesifikasi: 'Raychem Heatshrinkable EPKJ 24kV',
          volume: 2,
          satuan: 'set',
          volumeDisetujui: 2,
          keterangan: 'Sambungan pit galian',
        }
      ]);
    }
    setErrorMsg(null);
  }, [isOpen, requestToEdit, prefilledProjectId, projects]);

  // Handler when user selects a project from the dropdown
  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const p = projects.find(item => item.id === projId);
    if (p) {
      setPekerjaan(p.namaPekerjaan);
      setLokasi(p.lokasi);
      setNoSPBJ(p.noSPBJ);
      setPemohon(p.mandor);
      setKontakPemohon(p.mandorKontak || '');
      setDireksiPengawas(p.pic);
    }
  };

  // MDU Item handlers
  const handleAddMDUItem = () => {
    const newItem: MaterialRequestItem = {
      id: `mdu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: `MDU-${itemsMDU.length + 1}`,
      namaMaterial: '',
      spesifikasi: '',
      volume: 1,
      satuan: 'unit',
      volumeDisetujui: 1,
      keterangan: '',
    };
    setItemsMDU([...itemsMDU, newItem]);
  };

  const handleUpdateMDUItem = (index: number, field: keyof MaterialRequestItem, value: any) => {
    const updated = [...itemsMDU];
    updated[index] = { ...updated[index], [field]: value };
    // sync volumeDisetujui if volume changes and volumeDisetujui equals old volume
    if (field === 'volume' && updated[index].volumeDisetujui === undefined) {
      updated[index].volumeDisetujui = Number(value);
    }
    setItemsMDU(updated);
  };

  const handleRemoveMDUItem = (index: number) => {
    setItemsMDU(itemsMDU.filter((_, i) => i !== index));
  };

  const handleAddMDUPreset = (preset: typeof MDU_PRESETS[0]) => {
    const newItem: MaterialRequestItem = {
      id: `mdu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: `${preset.kodePrefix || 'MDU'}-${itemsMDU.length + 1}`,
      namaMaterial: preset.namaMaterial,
      spesifikasi: preset.spesifikasi,
      volume: preset.defaultVolume || 1,
      satuan: preset.satuan,
      volumeDisetujui: preset.defaultVolume || 1,
      keterangan: '',
    };
    setItemsMDU([...itemsMDU, newItem]);
  };

  // Non-MDU Item handlers
  const handleAddNonMDUItem = () => {
    const newItem: MaterialRequestItem = {
      id: `nonmdu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: `NON-${itemsNonMDU.length + 1}`,
      namaMaterial: '',
      spesifikasi: '',
      volume: 1,
      satuan: 'set',
      volumeDisetujui: 1,
      keterangan: '',
    };
    setItemsNonMDU([...itemsNonMDU, newItem]);
  };

  const handleUpdateNonMDUItem = (index: number, field: keyof MaterialRequestItem, value: any) => {
    const updated = [...itemsNonMDU];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'volume' && updated[index].volumeDisetujui === undefined) {
      updated[index].volumeDisetujui = Number(value);
    }
    setItemsNonMDU(updated);
  };

  const handleRemoveNonMDUItem = (index: number) => {
    setItemsNonMDU(itemsNonMDU.filter((_, i) => i !== index));
  };

  const handleAddNonMDUPreset = (preset: typeof NON_MDU_PRESETS[0]) => {
    const newItem: MaterialRequestItem = {
      id: `nonmdu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: `${preset.kodePrefix || 'NON'}-${itemsNonMDU.length + 1}`,
      namaMaterial: preset.namaMaterial,
      spesifikasi: preset.spesifikasi,
      volume: preset.defaultVolume || 1,
      satuan: preset.satuan,
      volumeDisetujui: preset.defaultVolume || 1,
      keterangan: '',
    };
    setItemsNonMDU([...itemsNonMDU, newItem]);
  };

  const handleSelectFromMasterPicker = (item: MasterMaterialItem) => {
    const isMDU = pickerTargetCategory === 'MDU';
    const newItem: MaterialRequestItem = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: item.kodeMaterial,
      namaMaterial: item.namaMaterial,
      spesifikasi: item.spesifikasi,
      volume: 1,
      satuan: item.satuan,
      volumeDisetujui: 1,
      keterangan: item.keterangan || '',
    };

    if (isMDU) {
      setItemsMDU((prev) => [...prev, newItem]);
    } else {
      setItemsNonMDU((prev) => [...prev, newItem]);
    }
  };

  const handleSelectMultipleFromMasterPicker = (items: MasterMaterialItem[]) => {
    const isMDU = pickerTargetCategory === 'MDU';
    const newItems: MaterialRequestItem[] = items.map((item, idx) => ({
      id: `mat-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: item.kodeMaterial,
      namaMaterial: item.namaMaterial,
      spesifikasi: item.spesifikasi,
      volume: 1,
      satuan: item.satuan,
      volumeDisetujui: 1,
      keterangan: item.keterangan || '',
    }));

    if (isMDU) {
      setItemsMDU((prev) => [...prev, ...newItems]);
    } else {
      setItemsNonMDU((prev) => [...prev, ...newItems]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!pekerjaan.trim()) {
      setErrorMsg('Nama Pekerjaan wajib diisi');
      return;
    }
    if (!lokasi.trim()) {
      setErrorMsg('Lokasi Pekerjaan wajib diisi');
      return;
    }
    if (!noSPBJ.trim()) {
      setErrorMsg('Nomor SPBJ / Kontrak wajib diisi');
      return;
    }
    if (itemsMDU.length === 0 && itemsNonMDU.length === 0) {
      setErrorMsg('Minimal harus ada 1 item material (MDU atau Non-MDU) yang diminta');
      return;
    }

    // Filter out rows where namaMaterial is empty
    const validMDU = itemsMDU.filter(item => item.namaMaterial.trim() !== '');
    const validNonMDU = itemsNonMDU.filter(item => item.namaMaterial.trim() !== '');

    if (validMDU.length === 0 && validNonMDU.length === 0) {
      setErrorMsg('Isi nama material pada tabel MDU atau Non-MDU');
      return;
    }

    const payload: MaterialRequest = {
      id: requestToEdit ? requestToEdit.id : `req-mdu-${Date.now()}`,
      nomorPermintaan: nomorPermintaan.trim() || `BON-MDU/${today.slice(0, 7).replace('-', '/')}/001`,
      tanggalPermintaan: tanggalPermintaan || today,
      pekerjaan: pekerjaan.trim(),
      lokasi: lokasi.trim(),
      noSPBJ: noSPBJ.trim(),
      projectId: selectedProjectId || undefined,
      pemohon: pemohon.trim() || 'Mandor Lapangan',
      kontakPemohon: kontakPemohon.trim() || undefined,
      direksiPengawas: direksiPengawas.trim() || 'Direksi Pengawas PLN',
      petugasGudang: petugasGudang.trim() || 'Bagian Logistik UP3',
      status,
      itemsMDU: validMDU,
      itemsNonMDU: validNonMDU,
      catatan: catatan.trim() || undefined,
      createdAt: requestToEdit ? requestToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{requestToEdit ? 'Edit Rincian Kebutuhan MDU & Non-MDU' : 'Rincian Kebutuhan MDU dan Non MDU'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Bon Gudang PLN
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Input data pekerjaan, lokasi, nomor SPBJ, serta rincian item MDU &amp; Non-MDU untuk pengeluaran barang gudang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top Row: Quick Pick from Existing SPBJ Projects */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Pilih dari Proyek Terdaftar (Otomatis mengisi Pekerjaan, Lokasi &amp; SPBJ):</span>
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                Atau ketik manual di bawah ini jika proyek baru
              </span>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="w-full text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Pilih Proyek Terdaftar (Opsional) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  No. {p.no} - {p.namaPekerjaan} ({p.noSPBJ})
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Data Identitas Permintaan & Pekerjaan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Data Identitas Permintaan, SPBJ &amp; Lokasi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Pengajuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPermintaan}
                  onChange={(e) => setTanggalPermintaan(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. SPBJ / Kontrak <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noSPBJ}
                  onChange={(e) => setNoSPBJ(e.target.value)}
                  placeholder="Contoh: 0142.PJ/DAN.02.01/UP3-MENTENG/2026"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Permintaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaterialRequestStatus)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="DIAJUKAN">Diajukan ke Gudang</option>
                  <option value="DISETUJUI">Disetujui Pengawas</option>
                  <option value="DIKELUARKAN">Dikeluarkan dari Gudang</option>
                </select>
              </div>
            </div>

            {/* Nama Pekerjaan & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Contoh: Penarikan Kabel SKTM 20kV XLPE 3x300mm"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Gardu GT-04 Menteng s/d Simpang Gambir"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pemohon & Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pemohon (Mandor / Pelaksana) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pemohon}
                  onChange={(e) => setPemohon(e.target.value)}
                  placeholder="Nama Mandor / Kontraktor"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kontak Pemohon (HP/WA)
                </label>
                <input
                  type="text"
                  value={kontakPemohon}
                  onChange={(e) => setKontakPemohon(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rincian Kebutuhan MDU */}
          <div className="space-y-3 p-4 bg-amber-50/40 rounded-xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                  M
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                  2. Rincian Kebutuhan MDU ({itemsMDU.length} Item)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerTargetCategory('MDU');
                    setIsPickerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <Database className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ Pilih dari Master Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddMDUItem}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris MDU</span>
                </button>
              </div>
            </div>

            {/* Quick Presets for MDU */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Preset MDU Cepat:</span>
              </span>
              {MDU_PRESETS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddMDUPreset(preset)}
                  className="text-[11px] bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium"
                >
                  + {preset.namaMaterial.split(' ')[0]} {preset.namaMaterial.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* MDU Table */}
            <div className="overflow-x-auto border border-amber-200 rounded-lg bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-amber-100/70 text-amber-950 font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-2.5 py-2 w-10 text-center">No</th>
                    <th className="px-2.5 py-2 w-28">Kode MDU</th>
                    <th className="px-2.5 py-2 min-w-[200px]">Nama Material MDU</th>
                    <th className="px-2.5 py-2 min-w-[160px]">Spesifikasi / Standar</th>
                    <th className="px-2.5 py-2 w-20 text-center">Diminta</th>
                    <th className="px-2.5 py-2 w-20">Satuan</th>
                    <th className="px-2.5 py-2 min-w-[140px]">Keterangan</th>
                    <th className="px-2 py-2 w-10 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsMDU.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 text-center text-slate-400 italic">
                        Belum ada item MDU. Klik "Tambah Baris MDU" atau gunakan preset di atas.
                      </td>
                    </tr>
                  ) : (
                    itemsMDU.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-2.5 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.kodeMaterial || ''}
                            onChange={(e) => handleUpdateMDUItem(idx, 'kodeMaterial', e.target.value)}
                            placeholder={`MDU-${idx + 1}`}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            required
                            value={item.namaMaterial}
                            onChange={(e) => handleUpdateMDUItem(idx, 'namaMaterial', e.target.value)}
                            placeholder="Contoh: Kabel SKTM 20kV XLPE"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.spesifikasi}
                            onChange={(e) => handleUpdateMDUItem(idx, 'spesifikasi', e.target.value)}
                            placeholder="Contoh: SPLN 43-5 3x300mm"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            value={item.volume}
                            onChange={(e) => handleUpdateMDUItem(idx, 'volume', Number(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.satuan}
                            onChange={(e) => handleUpdateMDUItem(idx, 'satuan', e.target.value)}
                            placeholder="meter / unit / btg"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.keterangan || ''}
                            onChange={(e) => handleUpdateMDUItem(idx, 'keterangan', e.target.value)}
                            placeholder="Trase / Gardu / Keterangan"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMDUItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Rincian Kebutuhan Non-MDU */}
          <div className="space-y-3 p-4 bg-blue-50/40 rounded-xl border border-blue-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">
                  N
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950 uppercase tracking-wide">
                  3. Rincian Kebutuhan Non-MDU ({itemsNonMDU.length} Item)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerTargetCategory('NON_MDU');
                    setIsPickerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-blue-100 text-blue-950 border border-blue-300 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <Database className="w-3.5 h-3.5 text-blue-700" />
                  <span>+ Pilih dari Master Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNonMDUItem}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Non-MDU</span>
                </button>
              </div>
            </div>

            {/* Quick Presets for Non-MDU */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>Preset Non-MDU Cepat:</span>
              </span>
              {NON_MDU_PRESETS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddNonMDUPreset(preset)}
                  className="text-[11px] bg-white hover:bg-blue-100 text-slate-700 hover:text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium"
                >
                  + {preset.namaMaterial.split(' ')[0]} {preset.namaMaterial.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Non-MDU Table */}
            <div className="overflow-x-auto border border-blue-200 rounded-lg bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-100/70 text-blue-950 font-bold border-b border-blue-200">
                  <tr>
                    <th className="px-2.5 py-2 w-10 text-center">No</th>
                    <th className="px-2.5 py-2 w-28">Kode Non-MDU</th>
                    <th className="px-2.5 py-2 min-w-[200px]">Nama Material Non-MDU</th>
                    <th className="px-2.5 py-2 min-w-[160px]">Spesifikasi / Standar</th>
                    <th className="px-2.5 py-2 w-20 text-center">Diminta</th>
                    <th className="px-2.5 py-2 w-20">Satuan</th>
                    <th className="px-2.5 py-2 min-w-[140px]">Keterangan</th>
                    <th className="px-2 py-2 w-10 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsNonMDU.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 text-center text-slate-400 italic">
                        Belum ada item Non-MDU. Klik "Tambah Baris Non-MDU" atau gunakan preset di atas.
                      </td>
                    </tr>
                  ) : (
                    itemsNonMDU.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-2.5 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.kodeMaterial || ''}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'kodeMaterial', e.target.value)}
                            placeholder={`NON-${idx + 1}`}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            required
                            value={item.namaMaterial}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'namaMaterial', e.target.value)}
                            placeholder="Contoh: Jointing Kit SKTM 20kV"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.spesifikasi}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'spesifikasi', e.target.value)}
                            placeholder="Contoh: Raychem Heatshrink"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            value={item.volume}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'volume', Number(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.satuan}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'satuan', e.target.value)}
                            placeholder="set / buah / btg"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={item.keterangan || ''}
                            onChange={(e) => handleUpdateNonMDUItem(idx, 'keterangan', e.target.value)}
                            placeholder="Titik pasang / catatan"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveNonMDUItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Catatan Pengambilan & Petugas Gudang */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Pengambilan Gudang / Instruksi Khusus
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Material diambil menggunakan truk crane kontraktor pada hari Kamis, koordinasi dengan kepala gudang."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petugas Gudang / Bagian Logistik
              </label>
              <input
                type="text"
                value={petugasGudang}
                onChange={(e) => setPetugasGudang(e.target.value)}
                placeholder="Nama Petugas Gudang PLN"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total Material: <span className="font-bold text-amber-700">{itemsMDU.length} MDU</span> &bull; <span className="font-bold text-blue-700">{itemsNonMDU.length} Non-MDU</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Formulir Permintaan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master Material Picker Modal */}
      <MasterMaterialPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        materials={masterMaterials}
        targetCategory={pickerTargetCategory}
        onSelectItem={handleSelectFromMasterPicker}
        onSelectMultiple={handleSelectMultipleFromMasterPicker}
      />
    </div>
  );
};
