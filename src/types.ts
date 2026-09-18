export type ProjectCategory = 'TM' | 'TR' | 'Gardu' | 'Panel' | 'Jaringan' | 'Grounding';

export type ProjectStatus = 'ON_PROGRESS' | 'COMPLETED' | 'PENDING' | 'DELAYED';

export type VoltageStatus = 'BEBAS_TEGANGAN' | 'BERTEGANGAN' | 'PADAM_TERENCANA';

export type SafetyStatus = 'AMAN' | 'TEMUAN_RINGAN' | 'TEMUAN_BERBAHAYA';

export interface ManpowerBreakdown {
  total: number;
  teknisiListrik: number;
  helper: number;
  hseOfficer: number;
  operatorAlat: number;
}

export type MaterialCondition = 'TERPASANG_BAIK' | 'SUDAH_DITES' | 'BELUM_ENERGIZE' | 'DEFECT';

export interface InstalledMaterial {
  id: string;
  namaMaterial: string;
  spesifikasi?: string;
  volume: number;
  satuan: string; // meter, unit, buah, set, batang, titik, roll, dll.
  lokasiTitik?: string; // Tiang No. 01-05, Gardu GT-04, Bay Trafo, dll.
  kondisiStatus?: MaterialCondition;
  keterangan?: string;
}

export interface DailyLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  pekerjaanHariIni: string;
  progressHariIni: number; // 0-100%
  manpowerHadir: number;
  kondisiCuaca: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat';
  kendala?: string;
  solusi?: string;
  catatanK3?: string;
  author: string;
  materialTerpasang?: InstalledMaterial[];
}

export interface ProjectItem {
  id: string;
  no: number;
  namaPekerjaan: string;
  kategori: ProjectCategory;
  lokasi: string;
  nilaiKontrak: number; // in IDR
  noSPBJ: string;
  pic: string;
  picKontak?: string;
  mandor: string;
  mandorKontak?: string;
  manpower: ManpowerBreakdown;
  tanggalMulai: string;
  targetSelesai: string;
  progressRencana: number; // %
  progressRealisasi: number; // %
  status: ProjectStatus;
  statusManuver: VoltageStatus;
  k3Status: SafetyStatus;
  catatanHarian: string;
  dailyLogs: DailyLog[];
  timelinePhases?: ProjectTimelinePhase[];
  koordinatLat?: number; // Latitude GPS (misal: -6.2146)
  koordinatLng?: number; // Longitude GPS (misal: 106.8451)
  koordinatGps?: string; // String koordinat (misal: "-6.214620, 106.845130")
  radiusAreaMeter?: number; // Radius jangkauan kerja proyek (meter)
  updatedAt: string;
}

export type PhaseCategory = 
  | 'PERSIAPAN' 
  | 'MOB_MANPOWER' 
  | 'MOB_MATERIAL' 
  | 'PEKERJAAN' 
  | 'TESTING_COMMISSIONING' 
  | 'FINISHING_BAST';

export type PhaseStatus = 'BELUM_MULAI' | 'SEDANG_BERJALAN' | 'SELESAI' | 'TERKENDALA';

export interface PhaseChecklistItem {
  id: string;
  label: string;
  selesai: boolean;
  keterangan?: string;
}

export interface ProjectTimelinePhase {
  id: string;
  kategoriFase: PhaseCategory;
  judulFase: string;
  subJudul: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  durasiHari: number;
  status: PhaseStatus;
  progress: number; // 0 - 100%
  penanggungJawab: string;
  catatan?: string;
  checklists: PhaseChecklistItem[];
}

export interface ProjectFilter {
  search: string;
  status: string;
  kategori: string;
  pic: string;
  mandor: string;
  lokasi: string;
  sortBy: 'no' | 'namaPekerjaan' | 'nilaiKontrak' | 'progressRealisasi' | 'targetSelesai';
  sortOrder: 'asc' | 'desc';
}

// ----------------------------------------------------
// Tipe Data Permintaan Material MDU dan Non-MDU
// ----------------------------------------------------
export interface MaterialRequestItem {
  id: string;
  kodeMaterial?: string;
  namaMaterial: string;
  spesifikasi: string;
  volume: number;
  satuan: string; // Unit, Meter, Batang, Set, Buah, Pcs, Roll, dll.
  volumeDisetujui?: number;
  keterangan?: string;
}

export type MaterialRequestStatus = 'DRAFT' | 'DIAJUKAN' | 'DISETUJUI' | 'DIKELUARKAN';

export interface MaterialRequest {
  id: string;
  nomorPermintaan: string; // Contoh: BON-MDU/2026/09/001
  tanggalPermintaan: string; // YYYY-MM-DD
  pekerjaan: string; // Nama Pekerjaan (Mandatory)
  lokasi: string; // Lokasi Pekerjaan (Mandatory)
  noSPBJ: string; // Nomor SPBJ (Mandatory)
  projectId?: string; // Tautan opsional ke proyek terdaftar
  pemohon: string; // Nama Mandor / Pelaksana Lapangan
  kontakPemohon?: string;
  direksiPengawas: string; // PIC / Pengawas Lapangan PLN
  petugasGudang?: string; // Kepala Gudang / Logistik PLN
  status: MaterialRequestStatus;
  itemsMDU: MaterialRequestItem[]; // Item Material Distribusi Utama
  itemsNonMDU: MaterialRequestItem[]; // Item Material Non-MDU
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Master Data Material MDU dan Non-MDU
// ----------------------------------------------------
export type MasterMaterialCategory = 'MDU' | 'NON_MDU';

export interface MasterMaterialItem {
  id: string;
  kodeMaterial: string; // Contoh: MDU-TRF-001, NON-JNT-001
  namaMaterial: string;
  kategori: MasterMaterialCategory; // 'MDU' | 'NON_MDU'
  kelompok: string; // Sub-kategori: e.g. "Trafo Distribusi", "Kabel TM", "Sambungan Kabel"
  spesifikasi?: string; // Standar SPLN / rating teknis (opsional)
  satuan: string; // unit, meter, batang, set, buah, roll, pcs, kg
  stokGudang?: number; // Referensi stok gudang PLN
  hargaSatuanEstimasi?: number; // Estimasi harga satuan Rp (opsional)
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// Pengiriman Material (Surat Jalan & Ekspedisi)
// ----------------------------------------------------
export type MaterialShipmentStatus = 'PROSES_MUAT' | 'DIKIRIM' | 'TERKIRIM' | 'TERTUNDA';

export interface ShipmentItem {
  id: string;
  masterMaterialId?: string;
  kodeMaterial: string;
  namaMaterial: string;
  kategori: MasterMaterialCategory; // 'MDU' | 'NON_MDU'
  kelompok?: string;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  kondisi?: string; // e.g. "Baik / Segel", "Baru", "Lengkap"
  keterangan?: string;
}

export interface MaterialShipment {
  id: string;
  nomorSuratJalan: string; // Contoh: SJ-SMK/2026/09/001
  tanggalKirim: string; // YYYY-MM-DD
  tanggalEstimasiTiba?: string;
  
  // Informasi Ekspedisi & Armada
  namaEkspedisi: string; // e.g. "Armada Internal PT SMK", "PT Dakota Buana Semesta", "JNE Trucking", dll.
  jenisArmada: string; // e.g. "Truk Colt Diesel Double (CDD)", "Truk Fuso", "Pick Up Gran Max", "Truk Crane"
  nomorPolisi: string; // e.g. "B 9821 TYN"
  namaDriver: string; // e.g. "Budi Santoso"
  kontakDriver?: string; // e.g. "0812-3456-7890"
  noResi?: string; // Nomor Resi / No DO Ekspedisi

  // Rute & Proyek
  asalGudang: string; // e.g. "Gudang Utama PT SMK - Cikarang" / "Gudang Logistik PLN"
  lokasiTujuan: string; // e.g. "Gardu Distribusi GD-042 Cikarang Pusat"
  pekerjaan: string; // Nama Proyek / Pekerjaan
  noSPBJ: string; // Nomor SPBJ
  projectId?: string;

  // Petugas & Penerima
  pemberiPerintah?: string; // Logistik / Manajer ME
  penerimaNama?: string; // Mandor / Pelaksana Lapangan
  penerimaKontak?: string;

  status: MaterialShipmentStatus;
  items: ShipmentItem[];
  catatanPengiriman?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Master & Data Penugasan Mandor (Multi-Lokasi & PIC)
// ----------------------------------------------------
export type ForemanStatus = 'AKTIF' | 'STANDBY' | 'CUTI' | 'NON_AKTIF';

export interface ForemanAssignment {
  id: string;
  lokasiPekerjaan: string; // Lokasi Pekerjaan (e.g. "Feeder Jatiluhur Segmen 3", "Gardu GD-012")
  pic: string;             // PIC / Pengawas Lapangan PLN / PT SMK (e.g. "Ir. Bambang S.", "Dimas Pratama")
  picKontak?: string;      // No HP / WhatsApp PIC
  namaPekerjaan?: string;  // Nama Pekerjaan / SPBJ terkait
  noSPBJ?: string;         // Nomor SPBJ terkait
  statusPenugasan?: 'BERJALAN' | 'PERSIAPAN' | 'SELESAI';
  keterangan?: string;     // Keterangan khusus / catatan titik
  koordinatLat?: number;   // Latitude GPS titik lokasi mandor (misal: -6.2845)
  koordinatLng?: number;   // Longitude GPS titik lokasi mandor (misal: 107.1425)
  koordinatGps?: string;   // String format GPS koordinat
  patokanLokasi?: string;  // Patokan tiang/gardu/akses (misal: "Dekat Gerbang Tol Karawang Barat")
}

export interface ForemanItem {
  id: string;
  namaMandor: string;      // Nama Mandor
  kontak: string;          // No HP / WhatsApp Mandor
  spesialisasi?: string;   // e.g. "Tarik Kabel TM / TR", "Pemasangan Gardu & Trafo", "Sipil & Tiang Beton", dll.
  jumlahAnggota?: number;  // Jumlah tenaga kerja / anggota tim
  status: ForemanStatus;   // 'AKTIF' | 'STANDBY' | 'CUTI' | 'NON_AKTIF'
  assignments: ForemanAssignment[]; // Multi-lokasi & Multi-PIC
  baseLocation?: string;   // Posko / Workshop / Basecamp mandor
  baseKoordinatLat?: number;
  baseKoordinatLng?: number;
  catatan?: string;        // Catatan umum / keahlian / evaluasi
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Rencana Kerja Lapangan (Work Plan / Schedule)
// ----------------------------------------------------
export type WorkPlanItemStatus = 'BELUM_MULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI';

export interface WorkPlanItem {
  id: string;
  uraianPekerjaan: string;  // Uraian per item (misal: "Penarikan Kabel TM 3x150 mm²", "Pemasangan Grounding", dll.)
  kategori?: string;        // Kategori pekerjaan (e.g. "Kabel TM/TR", "Tiang & Sipil", "Gardu & Trafo", "Proteksi K3", "Testing")
  volume: number;           // Jumlah / kuantitas target
  satuan: string;           // Meter, Titik, Batang, Unit, Set, Lot, Gawang, dll.
  targetWaktu?: string;     // Waktu / shift kerja (e.g. "08:00 - 12:00", "Sesi 1", "Pagi", "1 Hari")
  status: WorkPlanItemStatus; // Status item
  catatan?: string;         // Catatan khusus per item / APD K3 / instruksi alat
}

export type WorkPlanStatus = 'DRAFT' | 'TERJADWAL' | 'SEDANG_BERJALAN' | 'SELESAI' | 'TERTUNDA';

export interface WorkPlan {
  id: string;
  nomorRencana: string;     // Nomor Rencana Kerja (e.g. "RK-SMK/2026/09/001")
  judulRencana: string;     // Judul rencana kerja (e.g. "Pekerjaan Penarikan Kabel TM & Gardu Sisipan")
  tanggal: string;          // Tanggal Pelaksanaan (YYYY-MM-DD)
  targetSelesai?: string;   // Target selesai / jam / tanggal
  lokasi: string;           // Lokasi Pekerjaan (e.g. "Jl. Industri Cikarang - Gardu GT-04")
  pic: string;              // PIC / Pengawas Proyek (e.g. "Ir. Bambang S.", "Dimas Pratama")
  picKontak?: string;       // No HP / WA PIC
  mandor: string;           // Mandor Pelaksana Lapangan (e.g. "Mandor Sutrisno")
  mandorKontak?: string;    // No HP / WA Mandor
  manpowerCount: number;    // Jumlah personil / tenaga kerja lapangan
  namaPekerjaan?: string;   // Nama Proyek / Paket Pekerjaan Terkait
  noSPBJ?: string;          // No SPBJ terkait
  projectId?: string;       // Link ID proyek terdaftar (opsional)
  status: WorkPlanStatus;   // 'DRAFT' | 'TERJADWAL' | 'SEDANG_BERJALAN' | 'SELESAI' | 'TERTUNDA'
  prioritas?: 'NORMAL' | 'TINGGI' | 'URGENT';
  items: WorkPlanItem[];    // Uraian pekerjaan per item (bisa pilih dari template & input manual)
  catatanK3?: string;       // Instruksi Keselamatan K3 / K2 / APD wajib
  alatKerja?: string;       // Peralatan kerja yang disiapkan (Winch, Megger 5kV, Tang Press Hidrolik, dll.)
  createdAt: string;
  updatedAt: string;
}

