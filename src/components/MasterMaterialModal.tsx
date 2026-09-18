import React, { useState, useEffect } from 'react';
import { X, Save, Database, Sparkles, Layers, Box, Tag, AlertCircle } from 'lucide-react';
import { MasterMaterialCategory, MasterMaterialItem } from '../types';

interface MasterMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MasterMaterialItem) => void;
  itemToEdit?: MasterMaterialItem | null;
  defaultCategory?: MasterMaterialCategory;
}

const COMMON_KELOMPOK_MDU = [
  'Transformator Distribusi',
  'Kabel Tegangan Menengah (TM)',
  'Kabel Tegangan Rendah (TR)',
  'Tiang Beton Pratekan',
  'Kubikel & Switchgear TM',
  'PHB Tegangan Rendah',
  'Peralatan Hubung & Proteksi TM',
  'Kabel Saluran Udara',
];

const COMMON_KELOMPOK_NON_MDU = [
  'Jointing & Terminasi Kabel',
  'Bastek, Travers & Penopang Tiang',
  'Konektor & Aksesoris Sambungan',
  'Grounding & Pentanahan',
  'Isolator & Fitting',
  'Perangkat Keras & Baut',
  'Perpipaan & Ducting',
  'Perlengkapan K3 & Rambu PLN',
  'Proteksi & Fuse Link',
];

const COMMON_UNITS = ['unit', 'meter', 'batang', 'set', 'buah', 'roll', 'pcs', 'kg', 'lembar'];

export const MasterMaterialModal: React.FC<MasterMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  defaultCategory = 'MDU',
}) => {
  const [kategori, setKategori] = useState<MasterMaterialCategory>(defaultCategory);
  const [kodeMaterial, setKodeMaterial] = useState('');
  const [namaMaterial, setNamaMaterial] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [satuan, setSatuan] = useState('unit');
  const [stokGudang, setStokGudang] = useState<number | ''>('');
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (itemToEdit) {
      setKategori(itemToEdit.kategori);
      setKodeMaterial(itemToEdit.kodeMaterial);
      setNamaMaterial(itemToEdit.namaMaterial);
      setKelompok(itemToEdit.kelompok);
      setSatuan(itemToEdit.satuan);
      setStokGudang(itemToEdit.stokGudang ?? '');
      setKeterangan(itemToEdit.keterangan || '');
    } else {
      setKategori(defaultCategory);
      const prefix = defaultCategory === 'MDU' ? 'MDU' : 'NON';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setKodeMaterial(`${prefix}-MAT-${randomNum}`);
      setNamaMaterial('');
      setKelompok(defaultCategory === 'MDU' ? COMMON_KELOMPOK_MDU[0] : COMMON_KELOMPOK_NON_MDU[0]);
      setSatuan(defaultCategory === 'MDU' ? 'unit' : 'buah');
      setStokGudang(0);
      setKeterangan('');
    }
    setErrorMsg(null);
  }, [isOpen, itemToEdit, defaultCategory]);

  // When changing category in create mode, suggest a new code prefix and default kelompok
  const handleCategoryChange = (newCat: MasterMaterialCategory) => {
    setKategori(newCat);
    if (!itemToEdit) {
      const prefix = newCat === 'MDU' ? 'MDU' : 'NON';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setKodeMaterial(`${prefix}-MAT-${randomNum}`);
      setKelompok(newCat === 'MDU' ? COMMON_KELOMPOK_MDU[0] : COMMON_KELOMPOK_NON_MDU[0]);
      setSatuan(newCat === 'MDU' ? 'unit' : 'buah');
    }
  };

  const handleAutoGenerateCode = () => {
    const prefix = kategori === 'MDU' ? 'MDU' : 'NON';
    let sub = 'GEN';
    if (kelompok.toLowerCase().includes('trafo')) sub = 'TRF';
    else if (kelompok.toLowerCase().includes('kabel')) sub = 'KBL';
    else if (kelompok.toLowerCase().includes('tiang')) sub = 'TNG';
    else if (kelompok.toLowerCase().includes('kubikel')) sub = 'KBK';
    else if (kelompok.toLowerCase().includes('phb')) sub = 'PHB';
    else if (kelompok.toLowerCase().includes('jointing')) sub = 'JNT';
    else if (kelompok.toLowerCase().includes('terminasi')) sub = 'TRM';
    else if (kelompok.toLowerCase().includes('bastek') || kelompok.toLowerCase().includes('cross')) sub = 'ARM';
    else if (kelompok.toLowerCase().includes('grounding')) sub = 'GND';
    else if (kelompok.toLowerCase().includes('konektor')) sub = 'KNT';
    else if (kelompok.toLowerCase().includes('isolator')) sub = 'ISL';
    else if (kelompok.toLowerCase().includes('baut')) sub = 'BAUT';

    const random = Math.floor(100 + Math.random() * 900);
    setKodeMaterial(`${prefix}-${sub}-${random}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!kodeMaterial.trim()) {
      setErrorMsg('Kode material wajib diisi.');
      return;
    }

    if (!namaMaterial.trim()) {
      setErrorMsg('Nama material wajib diisi.');
      return;
    }

    if (!kelompok.trim()) {
      setErrorMsg('Kelompok / sub-kategori material wajib dipilih atau diisi.');
      return;
    }

    const newItem: MasterMaterialItem = {
      id: itemToEdit ? itemToEdit.id : `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      kodeMaterial: kodeMaterial.trim().toUpperCase(),
      namaMaterial: namaMaterial.trim(),
      kategori,
      kelompok: kelompok.trim(),
      spesifikasi: itemToEdit?.spesifikasi || '',
      satuan: satuan.trim(),
      stokGudang: typeof stokGudang === 'number' ? stokGudang : Number(stokGudang) || 0,
      keterangan: keterangan.trim() || undefined,
      createdAt: itemToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newItem);
    onClose();
  };

  if (!isOpen) return null;

  const currentKelompokList = kategori === 'MDU' ? COMMON_KELOMPOK_MDU : COMMON_KELOMPOK_NON_MDU;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{itemToEdit ? 'Edit Master Data Material' : 'Tambah Master Data Material'}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    kategori === 'MDU'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {kategori === 'MDU' ? 'MDU' : 'Non-MDU'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Katalog resmi item material PLN standar SPLN untuk pengeluaran gudang dan RAB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kategori Material <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange('MDU')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  kategori === 'MDU'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">
                  M
                </div>
                <span>Material Distribusi Utama (MDU)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('NON_MDU')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  kategori === 'NON_MDU'
                    ? 'border-blue-600 bg-blue-500/10 text-blue-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">
                  N
                </div>
                <span>Material Non-MDU &amp; Aksesoris</span>
              </button>
            </div>
          </div>

          {/* Kode Material & Kelompok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Kode Material <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  title="Generate kode otomatis"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-code</span>
                </button>
              </div>
              <input
                type="text"
                value={kodeMaterial}
                onChange={(e) => setKodeMaterial(e.target.value.toUpperCase())}
                placeholder="Contoh: MDU-TRF-001"
                className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelompok / Klasifikasi <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5">
                <select
                  value={currentKelompokList.includes(kelompok) ? kelompok : 'CUSTOM'}
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM') {
                      setKelompok(e.target.value);
                    } else {
                      setKelompok('');
                    }
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {currentKelompokList.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Kelompok Kustom / Lainnya...</option>
                </select>

                {!currentKelompokList.includes(kelompok) && (
                  <input
                    type="text"
                    value={kelompok}
                    onChange={(e) => setKelompok(e.target.value)}
                    placeholder="Ketik nama kelompok kustom..."
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Nama Material */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Material <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaMaterial}
              onChange={(e) => setNamaMaterial(e.target.value)}
              placeholder="Contoh: Trafo Distribusi 20kV 400 kVA / Jointing Kit 20kV 3x300 mm²"
              className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Satuan & Stok Gudang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1">
                <select
                  value={COMMON_UNITS.includes(satuan) ? satuan : 'CUSTOM'}
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM') {
                      setSatuan(e.target.value);
                    } else {
                      setSatuan('');
                    }
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Lainnya</option>
                </select>
                {!COMMON_UNITS.includes(satuan) && (
                  <input
                    type="text"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    placeholder="Satuan manual..."
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stok Referensi Gudang
              </label>
              <input
                type="number"
                min="0"
                value={stokGudang}
                onChange={(e) => setStokGudang(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Estimasi stok tersedia di UP3</span>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Titik Pemasangan Standar (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Digunakan untuk gardu portal 2 tiang, tiang peregang, atau crossing jalan"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Master Material</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
