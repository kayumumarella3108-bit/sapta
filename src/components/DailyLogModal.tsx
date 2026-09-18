import React, { useState } from 'react';
import { ProjectItem, DailyLog, InstalledMaterial, MaterialCondition } from '../types';
import { 
  X, 
  CheckCircle2, 
  Sun, 
  CloudRain, 
  Users, 
  Shield, 
  AlertTriangle, 
  Package, 
  Plus, 
  Trash2, 
  Tag, 
  Layers, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface DailyLogModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  onClose: () => void;
  onSaveLog: (projectId: string, log: DailyLog, updatedProgress: number, updatedCatatan: string) => void;
}

const COMMON_ELECTRICAL_MATERIALS = [
  { nama: 'Kabel Tanah XLPE 20kV 3x300mm²', satuan: 'meter', spec: 'N2XSY 12/20 (24) kV' },
  { nama: 'Kabel Twisted LVTC 4x70mm²', satuan: 'meter', spec: 'SPLN 42-10 Aluminium XLPE' },
  { nama: 'Kabel Feeder NYY 4x1x300mm²', satuan: 'meter', spec: '0.6/1kV Cu/PVC/PVC' },
  { nama: 'Trafo Distribusi 3 Phasa 630 kVA', satuan: 'unit', spec: '20kV/400V Dyn5 Trafindo' },
  { nama: 'Trafo Distribusi 3 Phasa 400 kVA', satuan: 'unit', spec: '20kV/400V Dyn5 Schneider' },
  { nama: 'Tiang Beton Pratekan 12m 350 daN', satuan: 'batang', spec: 'SPLN D3.019-1 WIKA' },
  { nama: 'Tiang Beton Pratekan 9m 200 daN', satuan: 'batang', spec: 'Standar JTR Distribusi' },
  { nama: 'Isolator Tumpu Pin Post 24kV', satuan: 'unit', spec: 'Porcelain ANSI Class 57-2' },
  { nama: 'Lightning Arrester 24kV 10kA', satuan: 'unit', spec: 'Metal Oxide Gapless Polymer' },
  { nama: 'Fused Cut Out (FCO) 24kV 100A', satuan: 'set', spec: 'Polymer + Fuse Link 15A' },
  { nama: 'Travers UNP 100x50x2000mm', satuan: 'batang', spec: 'Hot Dip Galvanized HDG' },
  { nama: 'Air Circuit Breaker (ACB) 2500A 4P', satuan: 'unit', spec: '65kA Fixed Micrologic' },
  { nama: 'MCCB 400A 3P 50kA', satuan: 'unit', spec: 'Thermal Magnetic Compact' },
  { nama: 'Grounding Rod Copper 5/8" x 3m', satuan: 'batang', spec: 'Tembaga Murni 99.9%' },
  { nama: 'Kabel Bare Copper BC 50mm²', satuan: 'meter', spec: 'Pentanahan Sistem Grid' },
  { nama: 'Suspension / Dead-end Clamp Assembly', satuan: 'set', spec: 'Aksesoris JTR / SUTM' },
  { nama: 'Pipa Subduct Pelindung HDPE 160mm', satuan: 'meter', spec: 'SDR 11 PN 16 Crossing' },
  { nama: 'Box KWH Meter APP Terpadu 3 Phasa', satuan: 'unit', spec: 'Box Panel APP Prabayar' }
];

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  project,
  onClose,
  onSaveLog,
}) => {
  if (!isOpen || !project) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [pekerjaanHariIni, setPekerjaanHariIni] = useState('');
  const [progressHariIni, setProgressHariIni] = useState<number>(project.progressRealisasi);
  const [manpowerHadir, setManpowerHadir] = useState<number>(project.manpower.total);
  const [kondisiCuaca, setKondisiCuaca] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat'>('Cerah');
  const [kendala, setKendala] = useState('');
  const [solusi, setSolusi] = useState('');
  const [catatanK3, setCatatanK3] = useState('Toolbox meeting, APD lengkap & izin kerja K3');
  const [author, setAuthor] = useState(`${project.mandor} (Mandor)`);

  // Material yang terpasang hari ini
  const [materials, setMaterials] = useState<InstalledMaterial[]>([]);

  // Add empty material row
  const handleAddMaterialRow = () => {
    const newMat: InstalledMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      namaMaterial: '',
      spesifikasi: '',
      volume: 1,
      satuan: 'unit',
      lokasiTitik: '',
      kondisiStatus: 'TERPASANG_BAIK',
      keterangan: '',
    };
    setMaterials(prev => [...prev, newMat]);
  };

  // Add material from quick preset
  const handleAddPreset = (preset: { nama: string; satuan: string; spec: string }) => {
    const newMat: InstalledMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      namaMaterial: preset.nama,
      spesifikasi: preset.spec,
      volume: preset.satuan === 'meter' ? 50 : 1,
      satuan: preset.satuan,
      lokasiTitik: project.lokasi.split('-')[0].trim() || '',
      kondisiStatus: 'TERPASANG_BAIK',
      keterangan: 'Pemasangan sesuai spesifikasi teknis',
    };
    setMaterials(prev => [...prev, newMat]);
  };

  const handleUpdateMaterial = (index: number, field: keyof InstalledMaterial, value: any) => {
    setMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pekerjaanHariIni.trim()) return;

    // Filter valid materials that have a name and volume > 0
    const validMaterials = materials
      .filter(m => m.namaMaterial.trim().length > 0 && m.volume > 0)
      .map(m => ({
        ...m,
        namaMaterial: m.namaMaterial.trim(),
        spesifikasi: m.spesifikasi?.trim() || undefined,
        satuan: m.satuan.trim() || 'unit',
        lokasiTitik: m.lokasiTitik?.trim() || undefined,
        keterangan: m.keterangan?.trim() || undefined,
      }));

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      tanggal,
      pekerjaanHariIni,
      progressHariIni: Number(progressHariIni),
      manpowerHadir: Number(manpowerHadir),
      kondisiCuaca,
      kendala: kendala.trim() || undefined,
      solusi: solusi.trim() || undefined,
      catatanK3: catatanK3.trim() || undefined,
      author: author || 'Pengawas Lapangan',
      materialTerpasang: validMaterials.length > 0 ? validMaterials : undefined,
    };

    onSaveLog(project.id, newLog, Number(progressHariIni), pekerjaanHariIni);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-600/60 px-2 py-0.5 rounded text-amber-100">
              No. SPBJ: {project.noSPBJ} &bull; Proyek #{project.no}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Input Realisasi Harian & Material Terpasang
            </h3>
            <p className="text-xs text-amber-100 truncate max-w-xl mt-0.5">
              {project.namaPekerjaan} ({project.lokasi})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Tanggal & Cuaca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Realisasi Harian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kondisi Cuaca Lapangan
              </label>
              <select
                value={kondisiCuaca}
                onChange={(e) => setKondisiCuaca(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="Cerah">☀️ Cerah (Optimal Kerja Listrik)</option>
                <option value="Berawan">⛅ Berawan</option>
                <option value="Hujan Ringan">🌦️ Hujan Ringan (Perlu Ekstra APD K3)</option>
                <option value="Hujan Lebat">⛈️ Hujan Lebat (Stop Kerja Bertegangan/Ketinggian)</option>
              </select>
            </div>
          </div>

          {/* Aktivitas Realisasi Pekerjaan Hari Ini */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Uraian Realisasi Pekerjaan Hari Ini <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan progres detail hari ini (contoh: Penarikan kabel tanah segmen 2 sepanjang 300m, pemasangan mof sambungan, instalasi travers tiang no 10-14, pengujian tahanan isolasi / megger test...)"
              value={pekerjaanHariIni}
              onChange={(e) => setPekerjaanHariIni(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
              required
            />
          </div>

          {/* SECTION: INPUT MATERIAL YANG TERPASANG */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Material Yang Terpasang Hari Ini</span>
                    <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {materials.length} Material
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Catat spesifikasi, volume, satuan, dan lokasi titik pemasangan komponen kelistrikan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Material</span>
              </button>
            </div>

            {/* Quick Preset Buttons for Electrical Materials */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Pilihan Cepat Material Kelistrikan Populer:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ELECTRICAL_MATERIALS.slice(0, 7).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <span>+ {preset.nama.split(' ')[0]} {preset.nama.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials List / Rows */}
            {materials.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
                <Package className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">Belum ada material yang ditambahkan untuk hari ini</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik tombol &quot;Tambah Baris Material&quot; atau pilih material cepat di atas untuk mencatat komponen terpasang.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((mat, index) => (
                  <div
                    key={mat.id || index}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 animate-in fade-in duration-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>Item Material #{index + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus baris material ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Row 1: Nama Material & Spesifikasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Nama Material / Komponen <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="material-datalist"
                          placeholder="cth: Kabel XLPE 3x300mm², Trafo 630kVA..."
                          value={mat.namaMaterial}
                          onChange={(e) => handleUpdateMaterial(index, 'namaMaterial', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Spesifikasi Teknis / Merk / Tipe
                        </label>
                        <input
                          type="text"
                          placeholder="cth: N2XSY 20kV / Trafindo / SPLN D3.019..."
                          value={mat.spesifikasi || ''}
                          onChange={(e) => handleUpdateMaterial(index, 'spesifikasi', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 2: Volume, Satuan, Lokasi Titik, Status */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Volume Terpasang <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          placeholder="0"
                          value={mat.volume || ''}
                          onChange={(e) => handleUpdateMaterial(index, 'volume', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Satuan
                        </label>
                        <select
                          value={mat.satuan}
                          onChange={(e) => handleUpdateMaterial(index, 'satuan', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
                        >
                          <option value="meter">meter (m)</option>
                          <option value="unit">unit</option>
                          <option value="buah">buah (pcs)</option>
                          <option value="set">set</option>
                          <option value="batang">batang</option>
                          <option value="titik">titik</option>
                          <option value="roll">roll</option>
                          <option value="drum">drum</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Titik / Lokasi Pasang
                        </label>
                        <input
                          type="text"
                          placeholder="cth: Tiang 05-08, Gardu..."
                          value={mat.lokasiTitik || ''}
                          onChange={(e) => handleUpdateMaterial(index, 'lokasiTitik', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Status Material
                        </label>
                        <select
                          value={mat.kondisiStatus || 'TERPASANG_BAIK'}
                          onChange={(e) => handleUpdateMaterial(index, 'kondisiStatus', e.target.value as MaterialCondition)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
                        >
                          <option value="TERPASANG_BAIK">✅ Terpasang Baik</option>
                          <option value="SUDAH_DITES">⚡ Megger / Uji OK</option>
                          <option value="BELUM_ENERGIZE">⏳ Belum Energize</option>
                          <option value="DEFECT">⚠️ Perlu Perbaikan</option>
                        </select>
                      </div>
                    </div>

                    {/* Keterangan Pengujian / Catatan */}
                    <div>
                      <input
                        type="text"
                        placeholder="Catatan tambahan hasil uji / pengawasan (opsional: nilai tahanan isolasi, nomor seri...)"
                        value={mat.keterangan || ''}
                        onChange={(e) => handleUpdateMaterial(index, 'keterangan', e.target.value)}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600 focus:bg-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Datalist for autocomplete */}
            <datalist id="material-datalist">
              {COMMON_ELECTRICAL_MATERIALS.map((item, i) => (
                <option key={i} value={item.nama} />
              ))}
            </datalist>
          </div>

          {/* Manpower & Progres Update */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Manpower Hadir Hari Ini
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={manpowerHadir}
                  onChange={(e) => setManpowerHadir(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-sm font-bold text-slate-800 text-center focus:outline-none focus:border-amber-500"
                  required
                />
                <span className="text-xs text-slate-500">
                  Orang (Mandor: <strong className="text-slate-700">{project.mandor}</strong>)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Update Akumulasi Progres Fisik</span>
                <span className="text-amber-600 font-extrabold text-sm">{progressHariIni}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={progressHariIni}
                onChange={(e) => setProgressHariIni(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>Sebelumnya: {project.progressRealisasi}%</span>
                <span>Target: 100%</span>
              </div>
            </div>
          </div>

          {/* Kendala & Solusi */}
          <div className="space-y-3 p-3.5 bg-rose-50/40 rounded-xl border border-rose-200/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Kendala Lapangan & Tindak Lanjut Solusi (Opsional)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kendala (Material / Ijin / Cuaca / Lapangan)
                </label>
                <textarea
                  rows={2}
                  placeholder="Kendala yang dihadapi di lapangan..."
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-rose-200 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Solusi / Tindak Lanjut
                </label>
                <textarea
                  rows={2}
                  placeholder="Langkah penyelesaian kendala..."
                  value={solusi}
                  onChange={(e) => setSolusi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-rose-200 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Catatan K3 & Pelapor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                Catatan K3 / Keselamatan Listrik
              </label>
              <input
                type="text"
                placeholder="Contoh: APD lengkap, pengujian tegangan 0V, grounding terpasang"
                value={catatanK3}
                onChange={(e) => setCatatanK3(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Penanggung Jawab Laporan (Author)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {materials.length > 0 ? (
                <span className="text-amber-700 font-semibold">
                  📦 {materials.length} material terpasang siap disimpan
                </span>
              ) : (
                <span>Tanpa catatan material baru</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Realisasi Harian</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

