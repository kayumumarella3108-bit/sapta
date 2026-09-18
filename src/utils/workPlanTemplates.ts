export interface WorkItemTemplate {
  id: string;
  kategori: string;
  uraianPekerjaan: string;
  satuanDefault: string;
  volumeDefault: number;
  catatanDefault?: string;
}

export const WORK_ITEM_CATEGORIES = [
  'Semua Kategori',
  'Kabel & Jaringan TM/TR',
  'Tiang & Sipil Ketenagalistrikan',
  'Gardu Distribusi & Trafo',
  'Panel PHB-TR & LVMDP',
  'Sistem Proteksi Grounding & K3',
  'Pengujian, Testing & Energize',
] as const;

export const WORK_ITEM_TEMPLATES: WorkItemTemplate[] = [
  // 1. Kabel & Jaringan TM/TR
  {
    id: 'tpl-tm-01',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Penarikan Kabel TM N2XSEBY 3x150 mm² 20 kV',
    satuanDefault: 'Meter',
    volumeDefault: 250,
    catatanDefault: 'Gunakan roll kabel dan periksa radius tekukan aman',
  },
  {
    id: 'tpl-tm-02',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Penarikan Kabel TM N2XSEBY 3x300 mm² 20 kV (Express Feeder)',
    satuanDefault: 'Meter',
    volumeDefault: 150,
    catatanDefault: 'Perhatikan penarikan pada belokan pipa crossing',
  },
  {
    id: 'tpl-tm-03',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Penarikan Kabel TR LVTC 4x70 mm² Jaringan Distribusi Rendah',
    satuanDefault: 'Meter',
    volumeDefault: 300,
    catatanDefault: 'Pastikan andongan (sag) sesuai standar PLN',
  },
  {
    id: 'tpl-tm-04',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Penarikan Kabel TR LVTC 4x35 mm² Saluran Sambungan',
    satuanDefault: 'Meter',
    volumeDefault: 200,
    catatanDefault: 'Pemasangan suspension clamp dan tension clamp',
  },
  {
    id: 'tpl-tm-05',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Pekerjaan Jointing / Sambungan Lurus Kabel TM 20 kV (Raychem/3M)',
    satuanDefault: 'Titik',
    volumeDefault: 2,
    catatanDefault: 'Dikerjakan oleh jointer bersertifikat, area bersih & kering',
  },
  {
    id: 'tpl-tm-06',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Pemasangan Terminasi Outdoor / Indoor Kabel TM 20 kV',
    satuanDefault: 'Set',
    volumeDefault: 2,
    catatanDefault: 'Penyambungan ke kubikel / bushing trafo',
  },
  {
    id: 'tpl-tm-07',
    kategori: 'Kabel & Jaringan TM/TR',
    uraianPekerjaan: 'Pemasangan Konduktor AAAC 3x150 mm² Saluran Udara TM',
    satuanDefault: 'Gawang',
    volumeDefault: 5,
    catatanDefault: 'Tensioning dan pengikatan pada isolator tumpu',
  },

  // 2. Tiang & Sipil Ketenagalistrikan
  {
    id: 'tpl-tng-01',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Pemancangan & Penanaman Tiang Beton 11 Meter 200 daN',
    satuanDefault: 'Batang',
    volumeDefault: 4,
    catatanDefault: 'Kedalaman tanam 1/6 panjang tiang (1.8m) + backfill padat',
  },
  {
    id: 'tpl-tng-02',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Pemancangan & Penanaman Tiang Beton 12 Meter 350 daN',
    satuanDefault: 'Batang',
    volumeDefault: 2,
    catatanDefault: 'Tegakkan dengan waterpass dan kunci tiang sementara',
  },
  {
    id: 'tpl-tng-03',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Pemancangan & Penanaman Tiang Beton 13 Meter 500 daN (Portal/Sudut)',
    satuanDefault: 'Batang',
    volumeDefault: 2,
    catatanDefault: 'Struktur tiang sudut/portal gardu',
  },
  {
    id: 'tpl-tng-04',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Pemasangan Travers / Cross Arm Besi UNP UNP-10 & Beugel',
    satuanDefault: 'Batang',
    volumeDefault: 4,
    catatanDefault: 'Kencangkan baut galvanis dan pasang isolator pin/tarik',
  },
  {
    id: 'tpl-tng-05',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Pemasangan Guy Wire / Tarikan Treckschor Lengkap Anchor Rod',
    satuanDefault: 'Set',
    volumeDefault: 2,
    catatanDefault: 'Gunakan isolator guy dan seling baja galvanis 50mm²',
  },
  {
    id: 'tpl-tng-06',
    kategori: 'Tiang & Sipil Ketenagalistrikan',
    uraianPekerjaan: 'Penggalian Tanah & Pengecoran Pondasi Gardu / Tiang',
    satuanDefault: 'Titik',
    volumeDefault: 3,
    catatanDefault: 'Beton K-225 mutu tinggi, periksa elevasi kontur',
  },

  // 3. Gardu Distribusi & Trafo
  {
    id: 'tpl-grd-01',
    kategori: 'Gardu Distribusi & Trafo',
    uraianPekerjaan: 'Ereksi & Dudukan Trafo Distribusi 3 Fasa 160 kVA / 20 kV',
    satuanDefault: 'Unit',
    volumeDefault: 1,
    catatanDefault: 'Gunakan crane / tripod katrol aman, periksa level minyak',
  },
  {
    id: 'tpl-grd-02',
    kategori: 'Gardu Distribusi & Trafo',
    uraianPekerjaan: 'Ereksi & Dudukan Trafo Distribusi 3 Fasa 250 kVA / 20 kV',
    satuanDefault: 'Unit',
    volumeDefault: 1,
    catatanDefault: 'Pemasangan pada platform gardu tiang portal',
  },
  {
    id: 'tpl-grd-03',
    kategori: 'Gardu Distribusi & Trafo',
    uraianPekerjaan: 'Pemasangan Fuse Cut Out (FCO) 20 kV + Fuse Link',
    satuanDefault: 'Set',
    volumeDefault: 1,
    catatanDefault: '1 set isi 3 fasa, sesuaikan rating fuse link',
  },
  {
    id: 'tpl-grd-04',
    kategori: 'Gardu Distribusi & Trafo',
    uraianPekerjaan: 'Pemasangan Lightning Arrester (LA) 20 kV 10 kA Polymer',
    satuanDefault: 'Set',
    volumeDefault: 1,
    catatanDefault: 'Hubungkan ke kawat tembaga grounding bawah',
  },
  {
    id: 'tpl-grd-05',
    kategori: 'Gardu Distribusi & Trafo',
    uraianPekerjaan: 'Pemasangan Plat Dudukan Trafo, Klem & Perlengkapan Gardu Tiang',
    satuanDefault: 'Lot',
    volumeDefault: 1,
    catatanDefault: 'UNP 120 galvanis panas standar SPLN',
  },

  // 4. Panel PHB-TR & LVMDP
  {
    id: 'tpl-pnl-01',
    kategori: 'Panel PHB-TR & LVMDP',
    uraianPekerjaan: 'Pemasangan Panel PHB-TR Gardu 4 Jurusan Lengkap NH Fuse',
    satuanDefault: 'Unit',
    volumeDefault: 1,
    catatanDefault: 'Terminasi kabel NYY 1x240 mm² dari bushing trafo TR',
  },
  {
    id: 'tpl-pnl-02',
    kategori: 'Panel PHB-TR & LVMDP',
    uraianPekerjaan: 'Pemasangan Panel PHB-TR 2 Jurusan Outdoor Pole Mounted',
    satuanDefault: 'Unit',
    volumeDefault: 1,
    catatanDefault: 'Pemasangan pada tiang gardu cantol',
  },
  {
    id: 'tpl-pnl-03',
    kategori: 'Panel PHB-TR & LVMDP',
    uraianPekerjaan: 'Pemasangan Kabel Induk NYY 1x240 mm² Trafo ke PHB-TR',
    satuanDefault: 'Meter',
    volumeDefault: 24,
    catatanDefault: 'Pemasangan sepatu kabel AL/CU bimetal dan isolasi tahan cuaca',
  },
  {
    id: 'tpl-pnl-04',
    kategori: 'Panel PHB-TR & LVMDP',
    uraianPekerjaan: 'Pemasangan Kubikel 20 kV (Incomer / Outgoing / CB / PB)',
    satuanDefault: 'Cell',
    volumeDefault: 2,
    catatanDefault: 'Penempatan di gardu beton, periksa interlock mekanik',
  },

  // 5. Sistem Proteksi Grounding & K3
  {
    id: 'tpl-grd-01',
    kategori: 'Sistem Proteksi Grounding & K3',
    uraianPekerjaan: 'Pemasangan Grounding Rod Tembaga (Copper Rod) & Kawat BC 50 mm²',
    satuanDefault: 'Titik',
    volumeDefault: 3,
    catatanDefault: 'Penanaman rod min. 3-6 meter hingga nilai ohm standar PLN',
  },
  {
    id: 'tpl-grd-02',
    kategori: 'Sistem Proteksi Grounding & K3',
    uraianPekerjaan: 'Pengukuran Tahanan Pembumian / Grounding Resistance Test (< 5 Ohm)',
    satuanDefault: 'Titik',
    volumeDefault: 3,
    catatanDefault: 'Ukur menggunakan Earth Ground Tester terkalibrasi',
  },
  {
    id: 'tpl-grd-03',
    kategori: 'Sistem Proteksi Grounding & K3',
    uraianPekerjaan: 'Pemasangan Pipa Pelindung Baja / PVC Grounding & Klem Pipa',
    satuanDefault: 'Batang',
    volumeDefault: 3,
    catatanDefault: 'Melindungi kawat BC dari vandalisme dan korosi',
  },
  {
    id: 'tpl-grd-04',
    kategori: 'Sistem Proteksi Grounding & K3',
    uraianPekerjaan: 'Pemasangan Plat Tanda Bahaya Kilat & Penghalang Panjat K3',
    satuanDefault: 'Set',
    volumeDefault: 2,
    catatanDefault: 'Terpasang pada tinggi 2.5 meter di atas tanah',
  },
  {
    id: 'tpl-grd-05',
    kategori: 'Sistem Proteksi Grounding & K3',
    uraianPekerjaan: 'Safety Briefing Pagi / Tool Box Meeting (TBM) & Pemeriksaan APD 20 kV',
    satuanDefault: 'Sesi',
    volumeDefault: 1,
    catatanDefault: 'Wajib helm, rompi, sepatu safety, full body harness, sarung tangan 20kV',
  },

  // 6. Pengujian, Testing & Energize
  {
    id: 'tpl-tst-01',
    kategori: 'Pengujian, Testing & Energize',
    uraianPekerjaan: 'Insulation Resistance Test (Megger 5 kV kabel TM & Trafo)',
    satuanDefault: 'Titik',
    volumeDefault: 3,
    catatanDefault: 'Pencatatan R-S, S-T, T-R, Phase to Ground',
  },
  {
    id: 'tpl-tst-02',
    kategori: 'Pengujian, Testing & Energize',
    uraianPekerjaan: 'High Potential (Hi-Pot) DC Voltage Withstand Test Kabel 20 kV',
    satuanDefault: 'Sesi',
    volumeDefault: 1,
    catatanDefault: 'Uji tegangan tinggi selama 15 menit per fasa',
  },
  {
    id: 'tpl-tst-03',
    kategori: 'Pengujian, Testing & Energize',
    uraianPekerjaan: 'Manuver Pembebasan / Pengisian Tegangan (Energize Commisioning)',
    satuanDefault: 'Sesi',
    volumeDefault: 1,
    catatanDefault: 'Koordinasi dengan Pengatur Distribusi PLN (AP2D/DCC)',
  },
  {
    id: 'tpl-tst-04',
    kategori: 'Pengujian, Testing & Energize',
    uraianPekerjaan: 'Pembersihan Lokasi (Housekeeping), Perapian & Serah Terima Awal',
    satuanDefault: 'Lot',
    volumeDefault: 1,
    catatanDefault: 'Semua sisa potongan kabel dan isolasi dibersihkan dari ROW',
  },
];
