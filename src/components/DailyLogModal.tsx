import React, { useState, useRef } from 'react';
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
  MapPin,
  Camera,
  Printer,
  Upload
} from 'lucide-react';

interface DailyLogModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  onClose: () => void;
  onSaveLog: (projectId: string, log: DailyLog, updatedProgress: number, updatedCatatan: string) => void;
  onSaveAndPrint?: (projectId: string, log: DailyLog, updatedProgress: number, updatedCatatan: string) => void;
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
  onSaveAndPrint,
}) => {
  if (!isOpen || !project) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [jamKerjaMulai, setJamKerjaMulai] = useState('08:00');
  const [jamKerjaSelesai, setJamKerjaSelesai] = useState('17:00');
  const [pekerjaanHariIni, setPekerjaanHariIni] = useState('');
  const [progressHariIni, setProgressHariIni] = useState<number>(project.progressRealisasi);
  const [manpowerHadir, setManpowerHadir] = useState<number>(project.manpower.total);
  const [kondisiCuaca, setKondisiCuaca] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat'>('Cerah');
  const [kendala, setKendala] = useState('');
  const [solusi, setSolusi] = useState('');
  const [catatanK3, setCatatanK3] = useState('Toolbox meeting, APD lengkap & izin kerja K3');
  const [author, setAuthor] = useState(`${project.mandor} (Mandor)`);

  // Geolocation & Titik Lokasi
  const [titikLokasi, setTitikLokasi] = useState(project.lokasi || '');
  const [koordinatGps, setKoordinatGps] = useState(
    project.koordinatGps || 
    (project.koordinatLat && project.koordinatLng ? `${project.koordinatLat.toFixed(6)}, ${project.koordinatLng.toFixed(6)}` : '-6.176820, 106.830610')
  );

  // Foto Dokumentasi
  const [fotoDokumentasi, setFotoDokumentasi] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readers: Promise<string>[] = Array.from(files).map((file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        setFotoDokumentasi(prev => [...prev, ...results]);
      });
    }
  };

  const handleAddUrlPhoto = () => {
    if (newPhotoUrl.trim()) {
      setFotoDokumentasi(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFotoDokumentasi(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setKoordinatGps(coords);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          if (project.koordinatGps) {
            setKoordinatGps(project.koordinatGps);
          }
        }
      );
    }
  };

  const createLogObject = (): DailyLog => {
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

    return {
      id: `log-${Date.now()}`,
      tanggal,
      jamKerjaMulai,
      jamKerjaSelesai,
      titikLokasi: titikLokasi.trim() || project.lokasi,
      koordinatGps: koordinatGps.trim(),
      pekerjaanHariIni,
      progressHariIni: Number(progressHariIni),
      manpowerHadir: Number(manpowerHadir),
      kondisiCuaca,
      kendala: kendala.trim() || undefined,
      solusi: solusi.trim() || undefined,
      catatanK3: catatanK3.trim() || undefined,
      author: author || 'Pengawas Lapangan',
      fotoDokumentasi: fotoDokumentasi.length > 0 ? fotoDokumentasi : undefined,
      fotoKoordinatUrl: fotoDokumentasi[0] || undefined,
      materialTerpasang: validMaterials.length > 0 ? validMaterials : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pekerjaanHariIni.trim()) return;

    const newLog = createLogObject();
    onSaveLog(project.id, newLog, Number(progressHariIni), pekerjaanHariIni);
    onClose();
  };

  const handleSaveAndPrintClick = () => {
    if (!pekerjaanHariIni.trim()) return;
    const newLog = createLogObject();
    if (onSaveAndPrint) {
      onSaveAndPrint(project.id, newLog, Number(progressHariIni), pekerjaanHariIni);
    } else {
      onSaveLog(project.id, newLog, Number(progressHariIni), pekerjaanHariIni);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
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
          {/* Tanggal, Jam Kerja & Cuaca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Realisasi Harian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jam Kerja Lapangan
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={jamKerjaMulai}
                  onChange={(e) => setJamKerjaMulai(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="time"
                  value={jamKerjaSelesai}
                  onChange={(e) => setJamKerjaSelesai(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kondisi Cuaca Lapangan
              </label>
              <select
                value={kondisiCuaca}
                onChange={(e) => setKondisiCuaca(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="Cerah">☀️ Cerah (Normal / Optimal)</option>
                <option value="Berawan">⛅ Berawan</option>
                <option value="Hujan Ringan">🌧️ Hujan Ringan (Perlu Ekstra APD K3)</option>
                <option value="Hujan Lebat">⛈️ Hujan Lebat / Petir (Stop Pekerjaan TM)</option>
              </select>
            </div>
          </div>

          {/* Lokasi & Koordinat GPS */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Lokasi &amp; Koordinat GPS Lapangan
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                📍 Deteksi GPS Lokasi Saya
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Titik Lokasi / Segmen Trase
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Medan Merdeka, Tiang TM #05 s/d #12"
                  value={titikLokasi}
                  onChange={(e) => setTitikLokasi(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Koordinat Geotag (Lat, Lng)
                </label>
                <input
                  type="text"
                  placeholder="-6.176820, 106.830610"
                  value={koordinatGps}
                  onChange={(e) => setKoordinatGps(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi Realisasi Pekerjaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Uraian Realisasi Pekerjaan Hari Ini <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan detail aktivitas pekerjaan yang diselesaikan hari ini (cth: Galian trase segmen 3 sepanjang 350m, penarikan kabel XLPE 20kV, pengujian megger test tahanan isolasi sebelum jointing)..."
              value={pekerjaanHariIni}
              onChange={(e) => setPekerjaanHariIni(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Foto Dokumentasi Lapangan & Geotag */}
          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-950 uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                Foto Dokumentasi &amp; Geotag Lapangan ({fotoDokumentasi.length} Foto)
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Foto Lapangan</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fotoDokumentasi.map((photoUrl, pIdx) => (
                <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-4/3">
                  <img
                    src={photoUrl}
                    alt={`Dokumentasi ${pIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(pIdx)}
                      className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 cursor-pointer shadow-xs"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-[9px] font-mono text-white px-1.5 py-0.5 rounded">
                    Foto #{pIdx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick URL Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Atau tempel link URL foto langsung..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddUrlPhoto}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Tambah URL
              </button>
            </div>
          </div>

          {/* Section: Material Fisik Terpasang Hari Ini */}
          <div className="space-y-3 p-4 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Catatan Komponen / Material Terpasang Hari Ini</span>
                </h4>
                <p className="text-[11px] text-amber-800">
                  Input kuantitas material yang selesai terpasang, ditarik, atau dites di lokasi hari ini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris Material</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Pilihan Cepat:</span>
              {COMMON_ELECTRICAL_MATERIALS.slice(0, 5).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="text-[10.5px] px-2 py-0.5 bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md transition-colors cursor-pointer truncate max-w-[200px]"
                  title={`${preset.nama} (${preset.spec})`}
                >
                  + {preset.nama.split(' ')[0]} {preset.nama.split(' ')[1] || ''}
                </button>
              ))}
            </div>

            {/* Material Rows */}
            {materials.length === 0 ? (
              <div className="text-center py-5 bg-white/70 rounded-lg border border-dashed border-amber-200 text-xs text-slate-500">
                Belum ada material yang ditambahkan untuk hari ini. Klik &quot;+ Tambah Baris Material&quot; atau pilih cepat di atas jika ada pemasangan material.
              </div>
            ) : (
              <div className="space-y-2.5">
                {materials.map((mat, index) => (
                  <div
                    key={mat.id || index}
                    className="p-3 bg-white rounded-lg border border-amber-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.2 rounded">
                        Material #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {/* Nama Material */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Nama Material / Komponen <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="material-datalist"
                          placeholder="cth: Kabel XLPE 20kV 3x300mm², Trafo 630kVA..."
                          value={mat.namaMaterial}
                          onChange={(e) => handleUpdateMaterial(index, 'namaMaterial', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Spesifikasi Teknis */}
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Spesifikasi / Merk / Tipe
                        </label>
                        <input
                          type="text"
                          placeholder="cth: N2XSY SPLN, Trafindo Dyn5..."
                          value={mat.spesifikasi || ''}
                          onChange={(e) => handleUpdateMaterial(index, 'spesifikasi', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                          Volume Terpasang <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={mat.volume}
                          onChange={(e) => handleUpdateMaterial(index, 'volume', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-amber-700 focus:bg-white focus:border-amber-500 focus:outline-none"
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
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              {materials.length > 0 ? (
                <span className="text-amber-700 font-semibold">
                  📦 {materials.length} material terpasang siap dicatat
                </span>
              ) : (
                <span>Tanpa catatan material baru</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveAndPrintClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Simpan &amp; Cetak PDF</span>
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
