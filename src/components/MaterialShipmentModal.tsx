import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Calendar, 
  MapPin, 
  FileText, 
  UserCheck, 
  Plus, 
  Trash2, 
  Database, 
  Layers, 
  Box, 
  ShieldCheck, 
  AlertCircle, 
  Phone,
  Clock,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { 
  MaterialShipment, 
  ShipmentItem, 
  MaterialShipmentStatus, 
  ProjectItem, 
  MasterMaterialItem 
} from '../types';
import { MasterMaterialPickerModal } from './MasterMaterialPickerModal';

interface MaterialShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shipment: MaterialShipment) => void;
  shipmentToEdit?: MaterialShipment | null;
  projects: ProjectItem[];
  masterMaterials: MasterMaterialItem[];
}

const DEFAULT_EKSPEDISI_OPTIONS = [
  'Armada Internal PT SMK',
  'PT Dakota Buana Semesta',
  'JNE Trucking (JTR)',
  'Indah Logistik Cargo',
  'Sentral Cargo',
  'Wahana Express',
  'Truk Ekspedisi Rekanan',
];

const DEFAULT_ARMADA_OPTIONS = [
  'Truk Colt Diesel Double (CDD)',
  'Truk Colt Diesel Engkel (CDE)',
  'Truk Fuso Engkel (6 Roda)',
  'Truk Tronton (10 Roda)',
  'Pick Up Gran Max / L300',
  'Truk Crane / Boom Truck (Pemasangan Tiang/Trafo)',
  'Truk Box Tertutup',
];

export const MaterialShipmentModal: React.FC<MaterialShipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  shipmentToEdit,
  projects,
  masterMaterials,
}) => {
  const [formData, setFormData] = useState<Partial<MaterialShipment>>({
    nomorSuratJalan: '',
    tanggalKirim: new Date().toISOString().slice(0, 10),
    tanggalEstimasiTiba: new Date().toISOString().slice(0, 10),
    namaEkspedisi: 'Armada Internal PT SMK',
    jenisArmada: 'Truk Colt Diesel Double (CDD)',
    nomorPolisi: '',
    namaDriver: '',
    kontakDriver: '',
    noResi: '',
    asalGudang: 'Gudang Logistik Utama PT SMK - Cikarang',
    lokasiTujuan: '',
    pekerjaan: '',
    noSPBJ: '',
    projectId: '',
    pemberiPerintah: 'Logistik Divisi ME PT SMK',
    penerimaNama: '',
    penerimaKontak: '',
    status: 'PROSES_MUAT',
    items: [],
    catatanPengiriman: '',
  });

  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (shipmentToEdit) {
      setFormData({ ...shipmentToEdit });
      setItems([...shipmentToEdit.items]);
    } else {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const randomSeq = String(Math.floor(Math.random() * 900) + 100);
      setFormData({
        nomorSuratJalan: `SJ-SMK/${year}/${month}/${randomSeq}`,
        tanggalKirim: new Date().toISOString().slice(0, 10),
        tanggalEstimasiTiba: new Date().toISOString().slice(0, 10),
        namaEkspedisi: 'Armada Internal PT SMK',
        jenisArmada: 'Truk Colt Diesel Double (CDD)',
        nomorPolisi: '',
        namaDriver: '',
        kontakDriver: '',
        noResi: '',
        asalGudang: 'Gudang Logistik Utama PT SMK - Cikarang',
        lokasiTujuan: '',
        pekerjaan: '',
        noSPBJ: '',
        projectId: '',
        pemberiPerintah: 'Logistik Divisi ME PT SMK',
        penerimaNama: '',
        penerimaKontak: '',
        status: 'PROSES_MUAT',
        items: [],
        catatanPengiriman: '',
      });
      setItems([]);
    }
    setErrors({});
  }, [shipmentToEdit, isOpen]);

  // Project selector helper
  const handleSelectProject = (projectId: string) => {
    if (!projectId) {
      setFormData((prev) => ({
        ...prev,
        projectId: '',
      }));
      return;
    }
    const selected = projects.find((p) => p.id === projectId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        projectId: selected.id,
        pekerjaan: selected.namaPekerjaan,
        noSPBJ: selected.noSPBJ,
        lokasiTujuan: selected.lokasi,
        penerimaNama: selected.mandor || selected.pic || '',
      }));
    }
  };

  // Add material from master picker
  const handleAddFromMaster = (masterItem: MasterMaterialItem) => {
    const newItem: ShipmentItem = {
      id: `shp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      masterMaterialId: masterItem.id,
      kodeMaterial: masterItem.kodeMaterial,
      namaMaterial: masterItem.namaMaterial,
      kategori: masterItem.kategori,
      kelompok: masterItem.kelompok,
      spesifikasi: masterItem.spesifikasi || '',
      jumlah: 1,
      satuan: masterItem.satuan || 'Unit',
      kondisi: 'Baik / Segel Utuh',
      keterangan: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddMultipleFromMaster = (masterItems: MasterMaterialItem[]) => {
    const newItems: ShipmentItem[] = masterItems.map((masterItem) => ({
      id: `shp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      masterMaterialId: masterItem.id,
      kodeMaterial: masterItem.kodeMaterial,
      namaMaterial: masterItem.namaMaterial,
      kategori: masterItem.kategori,
      kelompok: masterItem.kelompok,
      spesifikasi: masterItem.spesifikasi || '',
      jumlah: 1,
      satuan: masterItem.satuan || 'Unit',
      kondisi: 'Baik / Segel Utuh',
      keterangan: '',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleAddManualItem = () => {
    const newItem: ShipmentItem = {
      id: `shp-item-${Date.now()}`,
      kodeMaterial: 'MDU-CUSTOM',
      namaMaterial: '',
      kategori: 'MDU',
      kelompok: 'Material Tambahan',
      spesifikasi: '',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      keterangan: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof ShipmentItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nomorSuratJalan?.trim()) {
      errs.nomorSuratJalan = 'Nomor Surat Jalan wajib diisi';
    }
    if (!formData.namaEkspedisi?.trim()) {
      errs.namaEkspedisi = 'Nama Ekspedisi / Armada wajib diisi';
    }
    if (!formData.nomorPolisi?.trim()) {
      errs.nomorPolisi = 'Nomor Polisi (Plat Kendaraan) wajib diisi';
    }
    if (!formData.namaDriver?.trim()) {
      errs.namaDriver = 'Nama Driver / Pengemudi wajib diisi';
    }
    if (!formData.pekerjaan?.trim()) {
      errs.pekerjaan = 'Nama Pekerjaan Proyek wajib diisi';
    }
    if (!formData.lokasiTujuan?.trim()) {
      errs.lokasiTujuan = 'Lokasi Tujuan Pengiriman wajib diisi';
    }
    if (items.length === 0) {
      errs.items = 'Minimal sertakan 1 item material dalam surat jalan pengiriman';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const shipment: MaterialShipment = {
      id: shipmentToEdit ? shipmentToEdit.id : `shipment-${Date.now()}`,
      nomorSuratJalan: formData.nomorSuratJalan!.trim(),
      tanggalKirim: formData.tanggalKirim || new Date().toISOString().slice(0, 10),
      tanggalEstimasiTiba: formData.tanggalEstimasiTiba || formData.tanggalKirim || '',
      namaEkspedisi: formData.namaEkspedisi!.trim(),
      jenisArmada: formData.jenisArmada || 'Truk Colt Diesel Double (CDD)',
      nomorPolisi: formData.nomorPolisi!.trim().toUpperCase(),
      namaDriver: formData.namaDriver!.trim(),
      kontakDriver: formData.kontakDriver?.trim() || '',
      noResi: formData.noResi?.trim() || '',
      asalGudang: formData.asalGudang || 'Gudang Logistik Utama PT SMK - Cikarang',
      lokasiTujuan: formData.lokasiTujuan!.trim(),
      pekerjaan: formData.pekerjaan!.trim(),
      noSPBJ: formData.noSPBJ?.trim() || '-',
      projectId: formData.projectId || '',
      pemberiPerintah: formData.pemberiPerintah || 'Logistik Divisi ME PT SMK',
      penerimaNama: formData.penerimaNama?.trim() || '',
      penerimaKontak: formData.penerimaKontak?.trim() || '',
      status: (formData.status as MaterialShipmentStatus) || 'PROSES_MUAT',
      items: items,
      catatanPengiriman: formData.catatanPengiriman?.trim() || '',
      createdAt: shipmentToEdit ? shipmentToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(shipment);
    onClose();
  };

  if (!isOpen) return null;

  const totalItemsCount = items.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
  const mduItemsCount = items.filter((i) => i.kategori === 'MDU').length;
  const nonMduItemsCount = items.filter((i) => i.kategori === 'NON_MDU').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {shipmentToEdit ? 'Edit Surat Jalan & Pengiriman Material' : 'Surat Jalan Pengiriman Material Baru'}
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                  Ekspedisi &amp; Logistik
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumentasi armada ekspedisi, rute pengiriman, dan rincian material MDU / Non-MDU
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Informasi Ekspedisi & Kendaraan */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Informasi Ekspedisi, Driver &amp; Kendaraan
              </h4>
              <span className="text-[11px] text-slate-500">Wajib diisi lengkap</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Nomor Surat Jalan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Surat Jalan *
                </label>
                <input
                  type="text"
                  value={formData.nomorSuratJalan}
                  onChange={(e) => setFormData({ ...formData, nomorSuratJalan: e.target.value })}
                  placeholder="e.g. SJ-SMK/2026/09/001"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono font-semibold ${
                    errors.nomorSuratJalan ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.nomorSuratJalan && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.nomorSuratJalan}</p>
                )}
              </div>

              {/* Tanggal Kirim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Pengiriman *
                </label>
                <input
                  type="date"
                  value={formData.tanggalKirim}
                  onChange={(e) => setFormData({ ...formData, tanggalKirim: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Estimasi Tiba */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimasi Tiba di Lokasi
                </label>
                <input
                  type="date"
                  value={formData.tanggalEstimasiTiba}
                  onChange={(e) => setFormData({ ...formData, tanggalEstimasiTiba: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Status Pengiriman */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pengiriman
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialShipmentStatus })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-bold text-slate-800"
                >
                  <option value="PROSES_MUAT">PROSES MUAT (Persiapan)</option>
                  <option value="DIKIRIM">DIKIRIM (Dalam Perjalanan)</option>
                  <option value="TERKIRIM">TERKIRIM (Tiba di Lokasi)</option>
                  <option value="TERTUNDA">TERTUNDA (Ada Kendala)</option>
                </select>
              </div>

              {/* Nama Ekspedisi / Vendor */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ekspedisi / Vendor Angkutan *
                </label>
                <input
                  type="text"
                  list="ekspedisi-list"
                  value={formData.namaEkspedisi}
                  onChange={(e) => setFormData({ ...formData, namaEkspedisi: e.target.value })}
                  placeholder="e.g. Armada Internal PT SMK / PT Dakota Buana Semesta"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white ${
                    errors.namaEkspedisi ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                <datalist id="ekspedisi-list">
                  {DEFAULT_EKSPEDISI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
                {errors.namaEkspedisi && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.namaEkspedisi}</p>
                )}
              </div>

              {/* Jenis Armada Kendaraan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Armada / Tipe Kendaraan
                </label>
                <input
                  type="text"
                  list="armada-list"
                  value={formData.jenisArmada}
                  onChange={(e) => setFormData({ ...formData, jenisArmada: e.target.value })}
                  placeholder="e.g. Truk Colt Diesel Double (CDD)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
                <datalist id="armada-list">
                  {DEFAULT_ARMADA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              {/* Nomor Polisi / Plat Nomor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Polisi (Plat Nomor) *
                </label>
                <input
                  type="text"
                  value={formData.nomorPolisi}
                  onChange={(e) => setFormData({ ...formData, nomorPolisi: e.target.value.toUpperCase() })}
                  placeholder="e.g. B 9821 TYN"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono font-bold uppercase ${
                    errors.nomorPolisi ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.nomorPolisi && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.nomorPolisi}</p>
                )}
              </div>

              {/* Nama Driver */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Driver / Pengemudi *
                </label>
                <input
                  type="text"
                  value={formData.namaDriver}
                  onChange={(e) => setFormData({ ...formData, namaDriver: e.target.value })}
                  placeholder="e.g. Budi Santoso"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white ${
                    errors.namaDriver ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.namaDriver && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.namaDriver}</p>
                )}
              </div>

              {/* Kontak Driver */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WA Driver
                </label>
                <input
                  type="text"
                  value={formData.kontakDriver}
                  onChange={(e) => setFormData({ ...formData, kontakDriver: e.target.value })}
                  placeholder="e.g. 0812-3456-7890"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Nomor Resi / No DO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Resi / DO Ekspedisi
                </label>
                <input
                  type="text"
                  value={formData.noResi}
                  onChange={(e) => setFormData({ ...formData, noResi: e.target.value })}
                  placeholder="e.g. DKT-8849102"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Rute, Proyek & Penerima */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                Rute Asal Gudang, Proyek SPBJ &amp; Lokasi Tujuan
              </h4>
              <span className="text-[11px] text-slate-500">Tujuan pengiriman lapangan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Tautkan dengan Proyek Terdaftar */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautkan dengan Proyek SPBJ (Otomatis Mengisi Data)
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  <option value="">-- Pilih Proyek Terdaftar (Opsional) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.noSPBJ} &bull; {p.namaPekerjaan} ({p.lokasi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Pekerjaan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pekerjaan Proyek *
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="e.g. Pemasangan Gardu Distribusi 630 kVA"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white ${
                    errors.pekerjaan ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.pekerjaan && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.pekerjaan}</p>
                )}
              </div>

              {/* Nomor SPBJ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor SPBJ
                </label>
                <input
                  type="text"
                  value={formData.noSPBJ}
                  onChange={(e) => setFormData({ ...formData, noSPBJ: e.target.value })}
                  placeholder="e.g. 0042.PJ/DAN.02.03/C18040000/2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono"
                />
              </div>

              {/* Asal Gudang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asal Gudang Pengiriman
                </label>
                <input
                  type="text"
                  value={formData.asalGudang}
                  onChange={(e) => setFormData({ ...formData, asalGudang: e.target.value })}
                  placeholder="e.g. Gudang Utama PT SMK - Cikarang"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Lokasi Tujuan Pengiriman */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Tujuan / Titik Bongkar Lapangan *
                </label>
                <input
                  type="text"
                  value={formData.lokasiTujuan}
                  onChange={(e) => setFormData({ ...formData, lokasiTujuan: e.target.value })}
                  placeholder="e.g. Gardu Distribusi GD-042 Kawasan Industri Delta Silicon 3"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white ${
                    errors.lokasiTujuan ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.lokasiTujuan && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.lokasiTujuan}</p>
                )}
              </div>

              {/* Penerima Lapangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penerima (Mandor / PIC)
                </label>
                <input
                  type="text"
                  value={formData.penerimaNama}
                  onChange={(e) => setFormData({ ...formData, penerimaNama: e.target.value })}
                  placeholder="e.g. Sugeng Riyadi (Mandor)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Kontak Penerima */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WA Penerima
                </label>
                <input
                  type="text"
                  value={formData.penerimaKontak}
                  onChange={(e) => setFormData({ ...formData, penerimaKontak: e.target.value })}
                  placeholder="e.g. 0813-8877-6655"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              {/* Pemberi Perintah Pengiriman */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petugas Logistik / Pemberi Perintah
                </label>
                <input
                  type="text"
                  value={formData.pemberiPerintah}
                  onChange={(e) => setFormData({ ...formData, pemberiPerintah: e.target.value })}
                  placeholder="e.g. Logistik ME PT SMK"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Daftar Material yang Dikirim (MDU & Non-MDU) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    Daftar Material yang Dikirim (MDU &amp; Non-MDU)
                  </h4>
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    {items.length} Item ({totalItemsCount} Volume)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tersambung langsung dengan Katalog Master Material MDU &amp; Non-MDU PLN
                </p>
              </div>

              {/* Action Buttons: Pick from Master or Manual */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs transition-colors cursor-pointer"
                  title="Buka katalog Master Data Material untuk memilih item MDU / Non-MDU secara cepat"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>+ Pilih dari Master Material</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Baris Manual</span>
                </button>
              </div>
            </div>

            {errors.items && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.items}</span>
              </div>
            )}

            {/* Table of items */}
            {items.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Belum ada material yang ditambahkan ke surat jalan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik tombol <strong className="text-amber-600">"+ Pilih dari Master Material"</strong> di atas untuk mengambil data spesifikasi MDU / Non-MDU standar PLN.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center">No</th>
                      <th className="px-3 py-2.5 w-24">Kategori</th>
                      <th className="px-3 py-2.5 w-32">Kode Material</th>
                      <th className="px-3 py-2.5 min-w-[200px]">Nama Material &amp; Spesifikasi</th>
                      <th className="px-3 py-2.5 w-28 text-center">Jumlah (Qty)</th>
                      <th className="px-3 py-2.5 w-24">Satuan</th>
                      <th className="px-3 py-2.5 min-w-[140px]">Kondisi Barang</th>
                      <th className="px-3 py-2.5 min-w-[140px]">Keterangan</th>
                      <th className="px-3 py-2.5 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2 text-center font-bold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.kategori}
                            onChange={(e) => handleUpdateItem(item.id, 'kategori', e.target.value)}
                            className={`px-2 py-1 rounded text-[11px] font-bold border ${
                              item.kategori === 'MDU'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="MDU">MDU</option>
                            <option value="NON_MDU">NON-MDU</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.kodeMaterial}
                            onChange={(e) => handleUpdateItem(item.id, 'kodeMaterial', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs font-semibold"
                            placeholder="MDU-..."
                          />
                        </td>
                        <td className="px-3 py-2 space-y-1">
                          <input
                            type="text"
                            value={item.namaMaterial}
                            onChange={(e) => handleUpdateItem(item.id, 'namaMaterial', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-xs"
                            placeholder="Nama Material..."
                          />
                          <input
                            type="text"
                            value={item.spesifikasi || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'spesifikasi', e.target.value)}
                            className="w-full px-2 py-0.5 border border-slate-200 rounded text-[11px] text-slate-600"
                            placeholder="Spesifikasi / Standar SPLN..."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={item.jumlah}
                            onChange={(e) => handleUpdateItem(item.id, 'jumlah', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-center font-bold text-amber-700 bg-amber-50/50"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.satuan}
                            onChange={(e) => handleUpdateItem(item.id, 'satuan', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs uppercase"
                            placeholder="Unit/Meter"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.kondisi || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'kondisi', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                            placeholder="e.g. Baik / Segel"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.keterangan || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'keterangan', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                            placeholder="Catatan item..."
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Catatan Pengiriman & Instruksi Khusus */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Pengiriman / Instruksi Khusus ke Driver / Mandor Lapangan
            </label>
            <textarea
              rows={2}
              value={formData.catatanPengiriman || ''}
              onChange={(e) => setFormData({ ...formData, catatanPengiriman: e.target.value })}
              placeholder="e.g. Harap periksa kondisi segel trafo sebelum diturunkan, pastikan surat jalan ditandatangani mandor dan difoto untuk bukti BAST."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-800">{items.length} item</span>
              <span>({mduItemsCount} MDU, {nonMduItemsCount} Non-MDU)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{shipmentToEdit ? 'Simpan Perubahan Surat Jalan' : 'Terbitkan Surat Jalan Pengiriman'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Connected Master Material Picker Modal */}
      <MasterMaterialPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        materials={masterMaterials}
        targetCategory="ALL"
        onSelectItem={handleAddFromMaster}
        onSelectMultiple={handleAddMultipleFromMaster}
      />
    </div>
  );
};
