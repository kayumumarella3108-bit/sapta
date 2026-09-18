import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  UserCheck, 
  Phone, 
  Plus, 
  Trash2, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Clock,
  Sparkles,
  Building2,
  HardHat
} from 'lucide-react';
import { ForemanItem, ForemanAssignment, ForemanStatus, ProjectItem } from '../types';

interface ForemanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foreman: ForemanItem) => void;
  foremanToEdit?: ForemanItem | null;
  projects?: ProjectItem[];
}

const SPESIALISASI_OPTIONS = [
  'Penarikan Kabel TM 20kV, Jointing & Termination XLPE',
  'Pemasangan Gardu Distribusi, Trafo 20kV & Panel LVMDP',
  'Pembangunan SUTM 20kV, Tiang Beton & Konstruksi Portal',
  'Jaringan Tegangan Rendah (JTR), Kabel Twisted NFA2X-T & SR Pelanggan',
  'Sistem Pembumian (Grounding Grid & Rod), Proteksi Petir Arrester',
  'Pekerjaan Sipil Gardu, Pondasi Trafo & Bak Kontrol',
  'Instalasi Cubicle 20kV & Proteksi Relai',
  'Konstruksi Tiang Besi & Saluran Udara Kabel Pilin',
  'General Electrical & Maintenance Jaringan'
];

export const ForemanModal: React.FC<ForemanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  foremanToEdit,
  projects = []
}) => {
  const [namaMandor, setNamaMandor] = useState('');
  const [kontak, setKontak] = useState('');
  const [spesialisasi, setSpesialisasi] = useState(SPESIALISASI_OPTIONS[0]);
  const [customSpesialisasi, setCustomSpesialisasi] = useState('');
  const [jumlahAnggota, setJumlahAnggota] = useState<number>(8);
  const [status, setStatus] = useState<ForemanStatus>('AKTIF');
  const [catatan, setCatatan] = useState('');

  // Dynamic Multi-Lokasi & Multi-PIC assignments
  const [assignments, setAssignments] = useState<ForemanAssignment[]>([]);

  // Validation state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract unique locations and PICs from registered projects for convenient auto-suggestions
  const existingLocations = Array.from(new Set(projects.map((p) => p.lokasi).filter(Boolean)));
  const existingPics = Array.from(new Set(projects.map((p) => p.pic).filter(Boolean)));
  const existingProjects = projects.map((p) => ({
    id: p.id,
    nama: p.namaPekerjaan,
    noSPBJ: p.noSPBJ,
    lokasi: p.lokasi,
    pic: p.pic,
    picKontak: p.picKontak
  }));

  useEffect(() => {
    if (foremanToEdit) {
      setNamaMandor(foremanToEdit.namaMandor || '');
      setKontak(foremanToEdit.kontak || '');
      if (SPESIALISASI_OPTIONS.includes(foremanToEdit.spesialisasi || '')) {
        setSpesialisasi(foremanToEdit.spesialisasi || SPESIALISASI_OPTIONS[0]);
        setCustomSpesialisasi('');
      } else {
        setSpesialisasi('LAINNYA');
        setCustomSpesialisasi(foremanToEdit.spesialisasi || '');
      }
      setJumlahAnggota(foremanToEdit.jumlahAnggota || 8);
      setStatus(foremanToEdit.status || 'AKTIF');
      setCatatan(foremanToEdit.catatan || '');
      setAssignments(
        foremanToEdit.assignments && foremanToEdit.assignments.length > 0
          ? JSON.parse(JSON.stringify(foremanToEdit.assignments))
          : [
              {
                id: `asg-${Date.now()}-1`,
                lokasiPekerjaan: '',
                pic: '',
                picKontak: '',
                namaPekerjaan: '',
                noSPBJ: '',
                statusPenugasan: 'BERJALAN',
                keterangan: ''
              }
            ]
      );
    } else {
      // New Foreman Form Defaults
      setNamaMandor('');
      setKontak('');
      setSpesialisasi(SPESIALISASI_OPTIONS[0]);
      setCustomSpesialisasi('');
      setJumlahAnggota(8);
      setStatus('AKTIF');
      setCatatan('');
      setAssignments([
        {
          id: `asg-${Date.now()}-1`,
          lokasiPekerjaan: projects[0]?.lokasi || '',
          pic: projects[0]?.pic || '',
          picKontak: projects[0]?.picKontak || '',
          namaPekerjaan: projects[0]?.namaPekerjaan || '',
          noSPBJ: projects[0]?.noSPBJ || '',
          statusPenugasan: 'BERJALAN',
          keterangan: ''
        }
      ]);
    }
    setErrorMsg(null);
  }, [foremanToEdit, isOpen, projects]);

  if (!isOpen) return null;

  const handleAddAssignment = () => {
    const newAsg: ForemanAssignment = {
      id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lokasiPekerjaan: '',
      pic: '',
      picKontak: '',
      namaPekerjaan: '',
      noSPBJ: '',
      statusPenugasan: 'BERJALAN',
      keterangan: ''
    };
    setAssignments([...assignments, newAsg]);
  };

  const handleRemoveAssignment = (id: string) => {
    if (assignments.length <= 1) {
      setErrorMsg('Mandor harus memiliki minimal 1 baris lokasi penugasan.');
      return;
    }
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const handleUpdateAssignment = (id: string, field: keyof ForemanAssignment, value: any) => {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // If project was selected from list, auto-fill location and PIC if empty
          if (field === 'namaPekerjaan' && value) {
            const matchedProj = projects.find((p) => p.namaPekerjaan === value);
            if (matchedProj) {
              if (!updated.lokasiPekerjaan) updated.lokasiPekerjaan = matchedProj.lokasi;
              if (!updated.pic) updated.pic = matchedProj.pic;
              if (!updated.picKontak && matchedProj.picKontak) updated.picKontak = matchedProj.picKontak;
              if (!updated.noSPBJ) updated.noSPBJ = matchedProj.noSPBJ;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaMandor.trim()) {
      setErrorMsg('Nama Mandor wajib diisi.');
      return;
    }

    // Validate assignments: at least 1 non-empty assignment location and PIC
    const validAssignments = assignments.filter((a) => a.lokasiPekerjaan.trim() && a.pic.trim());
    if (validAssignments.length === 0) {
      setErrorMsg('Mohon lengkapi minimal 1 Lokasi Pekerjaan dan Nama PIC pengawas.');
      return;
    }

    const finalSpesialisasi = spesialisasi === 'LAINNYA' ? (customSpesialisasi.trim() || 'Spesialis Mekanikal Elektrikal') : spesialisasi;

    const foremanPayload: ForemanItem = {
      id: foremanToEdit ? foremanToEdit.id : `foreman-${Date.now()}`,
      namaMandor: namaMandor.trim(),
      kontak: kontak.trim() || '08xx-xxxx-xxxx',
      spesialisasi: finalSpesialisasi,
      jumlahAnggota: Math.max(1, Number(jumlahAnggota) || 1),
      status,
      assignments: validAssignments,
      catatan: catatan.trim(),
      createdAt: foremanToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(foremanPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        id="foreman-modal-container"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center ring-2 ring-white/30 shrink-0">
              <HardHat className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {foremanToEdit ? 'Edit Data Mandor & Lokasi Penugasan' : 'Tambah Mandor & Penugasan Multi-Lokasi'}
              </h2>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Kelola data mandor, keahlian tim, serta penugasan di beberapa lokasi proyek &amp; PIC pengawas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: PROFIL & INFORMASI DASAR MANDOR */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>1. Profil &amp; Informasi Mandor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nama Mandor */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Mandor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={namaMandor}
                    onChange={(e) => setNamaMandor(e.target.value)}
                    placeholder="Contoh: Mandor Ujang Sutisna / Mandor Supardi"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <HardHat className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Status Mandor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Ketersediaan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ForemanStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="AKTIF">🟢 AKTIF (Di Lapangan)</option>
                  <option value="STANDBY">🟡 STANDBY (Siap Tugas)</option>
                  <option value="CUTI">⚪ CUTI / ISTIRAHAT</option>
                  <option value="NON_AKTIF">🔴 NON-AKTIF</option>
                </select>
              </div>

              {/* No Kontak / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  No. Telepon / WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Jumlah Anggota Tim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estimasi Jumlah Pekerja (Orang)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={jumlahAnggota}
                    onChange={(e) => setJumlahAnggota(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Spesialisasi / Keahlian */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bidang Spesialisasi Tim
                </label>
                <select
                  value={spesialisasi}
                  onChange={(e) => setSpesialisasi(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer truncate"
                >
                  {SPESIALISASI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="LAINNYA">+ Spesialisasi Lainnya...</option>
                </select>
              </div>

              {spesialisasi === 'LAINNYA' && (
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={customSpesialisasi}
                    onChange={(e) => setCustomSpesialisasi(e.target.value)}
                    placeholder="Tuliskan spesialisasi keahlian khusus..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: MULTI-LOKASI PEKERJAAN & MULTI-PIC (USER CORE REQUEST) */}
          <div className="bg-amber-50/40 border border-amber-200/90 rounded-xl p-4.5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>2. Daftar Lokasi Penugasan &amp; PIC Pengawas</span>
                  <span className="text-[11px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {assignments.length} Lokasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Mandor dapat ditugaskan ke lebih dari 1 lokasi proyek dengan PIC pengawas masing-masing.
                </p>
              </div>

              <button
                type="button"
                id="btn-tambah-lokasi-pic"
                onClick={handleAddAssignment}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Lokasi &amp; PIC</span>
              </button>
            </div>

            {/* Datalist helpers for quick suggestions */}
            <datalist id="registered-locations">
              {existingLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>

            <datalist id="registered-pics">
              {existingPics.map((pic) => (
                <option key={pic} value={pic} />
              ))}
            </datalist>

            {/* Assignment Rows */}
            <div className="space-y-3.5">
              {assignments.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Penugasan Lokasi #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Penugasan di Titik ini */}
                      <select
                        value={item.statusPenugasan || 'BERJALAN'}
                        onChange={(e) => handleUpdateAssignment(item.id, 'statusPenugasan', e.target.value)}
                        className="text-[11px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                      >
                        <option value="BERJALAN">🟢 Berjalan</option>
                        <option value="PERSIAPAN">🟡 Persiapan</option>
                        <option value="SELESAI">⚪ Selesai</option>
                      </select>

                      {assignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus lokasi penugasan ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Lokasi Pekerjaan */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Lokasi Pekerjaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          list="registered-locations"
                          value={item.lokasiPekerjaan}
                          onChange={(e) => handleUpdateAssignment(item.id, 'lokasiPekerjaan', e.target.value)}
                          placeholder="Contoh: Gardu GD-042 Cikarang / Feeder Jatiluhur"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                        <MapPin className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2" />
                      </div>
                    </div>

                    {/* PIC Pengawas */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama PIC Pengawas <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          list="registered-pics"
                          value={item.pic}
                          onChange={(e) => handleUpdateAssignment(item.id, 'pic', e.target.value)}
                          placeholder="Contoh: Ir. Bambang / Dimas Pratama, S.T."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2" />
                      </div>
                    </div>

                    {/* Nama Pekerjaan / SPBJ Terkait (Pilihan) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Pekerjaan / Proyek Terkait
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.namaPekerjaan || ''}
                          onChange={(e) => handleUpdateAssignment(item.id, 'namaPekerjaan', e.target.value)}
                          placeholder="Pekerjaan penarikan kabel / pasang trafo..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      </div>
                    </div>

                    {/* Kontak PIC & Keterangan Titik */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          No. HP / WA PIC
                        </label>
                        <input
                          type="text"
                          value={item.picKontak || ''}
                          onChange={(e) => handleUpdateAssignment(item.id, 'picKontak', e.target.value)}
                          placeholder="0812-xxxx-xxxx"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Catatan / Titik
                        </label>
                        <input
                          type="text"
                          value={item.keterangan || ''}
                          onChange={(e) => handleUpdateAssignment(item.id, 'keterangan', e.target.value)}
                          placeholder="Tiang No 1-10 / Gardu"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CATATAN & EVALUASI MANDOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Khusus / Evaluasi Kinerja Mandor
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Sertifikasi K3 lengkap, memiliki armada truk crane & perlengkapan penarikan kabel mandiri..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            id="btn-simpan-mandor"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Data Mandor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
