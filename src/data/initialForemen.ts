import { ForemanItem } from '../types';

export const INITIAL_FOREMEN: ForemanItem[] = [
  {
    id: 'foreman-001',
    namaMandor: 'Mandor Ujang Sutisna',
    kontak: '0812-8877-6651',
    spesialisasi: 'Penarikan Kabel TM 20kV, Jointing & Termination XLPE',
    jumlahAnggota: 14,
    status: 'AKTIF',
    assignments: [
      {
        id: 'asg-001-1',
        lokasiPekerjaan: 'Penyulang Jatiluhur Segmen 3, Karawang Barat',
        pic: 'Ir. Bambang Sudarsono, M.T.',
        picKontak: '0812-3456-7890',
        namaPekerjaan: 'Penggelaran & Terminasi Kabel SKTM 20kV XLPE 3x300mm²',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/08/042',
        statusPenugasan: 'BERJALAN',
        keterangan: 'Fokus penarikan kabel bawah tanah & jointing kubikel Gardu Hubung'
      },
      {
        id: 'asg-001-2',
        lokasiPekerjaan: 'Gardu Hubung GH-04 KIIC Karawang',
        pic: 'Dimas Pratama, S.T.',
        picKontak: '0813-9876-5432',
        namaPekerjaan: 'Uprating Cubicle 20kV Outgoing Feeder Industri',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/015',
        statusPenugasan: 'PERSIAPAN',
        keterangan: 'Terminasi kabel masuk incoming dan pengujian tegangan tembus'
      }
    ],
    catatan: 'Tim spesialis bawah tanah, memiliki sertifikasi K3 Teknisi Listrik Tegangan Menengah dan alat roll kabel lengkap.',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-17T10:00:00.000Z'
  },
  {
    id: 'foreman-002',
    namaMandor: 'Mandor Supardi Wiryanto',
    kontak: '0857-1122-3344',
    spesialisasi: 'Pemasangan Gardu Distribusi, Trafo 20kV & Panel LVMDP',
    jumlahAnggota: 10,
    status: 'AKTIF',
    assignments: [
      {
        id: 'asg-002-1',
        lokasiPekerjaan: 'Gardu Distribusi GD-042 Kawasan Industri Cikarang',
        pic: 'Ir. Bambang Sudarsono, M.T.',
        picKontak: '0812-3456-7890',
        namaPekerjaan: 'Pemasangan Trafo Distribusi 630 kVA 20kV/400V & Panel LVMDP',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/012',
        statusPenugasan: 'BERJALAN',
        keterangan: 'Dudukan trafo selesai cor beton, setting grounding & koneksi busbar'
      },
      {
        id: 'asg-002-2',
        lokasiPekerjaan: 'Gardu Tiang Portal GT-11 Deltamas Cikarang Timur',
        pic: 'Hendra Gunawan, S.T.',
        picKontak: '0811-2233-4455',
        namaPekerjaan: 'Rehabilitasi Gardu Portal Trafo 250 kVA & Penggantian Cut Out',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/088',
        statusPenugasan: 'PERSIAPAN',
        keterangan: 'Penggantian Lightning Arrester dan Fused Cut Out Polymer 24kV'
      }
    ],
    catatan: 'Pengalaman 12 tahun pemasangan trafo distribusi minyak dan kering hermetically sealed.',
    createdAt: '2026-09-03T08:00:00.000Z',
    updatedAt: '2026-09-16T14:30:00.000Z'
  },
  {
    id: 'foreman-003',
    namaMandor: 'Mandor Bambang Irawan',
    kontak: '0813-4455-6677',
    spesialisasi: 'Pembangunan SUTM 20kV, Tiang Beton & Konstruksi Portal',
    jumlahAnggota: 16,
    status: 'AKTIF',
    assignments: [
      {
        id: 'asg-003-1',
        lokasiPekerjaan: 'Jl. Raya Industri Cibitung Km 32 - Km 37',
        pic: 'Hendra Gunawan, S.T.',
        picKontak: '0811-2233-4455',
        namaPekerjaan: 'Pembangunan Saluran Udara Tegangan Menengah (SUTM) 20kV',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/08/077',
        statusPenugasan: 'BERJALAN',
        keterangan: 'Ereksi tiang beton 12 meter 350 daN dan tarikan konduktor AAAC-S'
      },
      {
        id: 'asg-003-2',
        lokasiPekerjaan: 'Feeder Kawasan Jababeka 6',
        pic: 'Dimas Pratama, S.T.',
        picKontak: '0813-9876-5432',
        namaPekerjaan: 'Penggantian Travers Cross Arm & Isolator Pin Post 24kV',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/033',
        statusPenugasan: 'PERSIAPAN',
        keterangan: 'Penggantian 45 set travers UNP galvanis anti korosi'
      },
      {
        id: 'asg-003-3',
        lokasiPekerjaan: 'Desa Sukadanau Cikarang Barat',
        pic: 'Hendra Gunawan, S.T.',
        picKontak: '0811-2233-4455',
        namaPekerjaan: 'Pemasangan Guy Wire Guy Grip & Tiang Penopang',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/08/095',
        statusPenugasan: 'SELESAI',
        keterangan: 'Pekerjaan selesai 100%, siap verifikasi BAST lapangan'
      }
    ],
    catatan: 'Memiliki armada crane hiab tiang beton dan winch penarik konduktor hidrolik.',
    createdAt: '2026-09-02T08:00:00.000Z',
    updatedAt: '2026-09-17T09:00:00.000Z'
  },
  {
    id: 'foreman-004',
    namaMandor: 'Mandor Deni Kurniawan',
    kontak: '0878-9900-1122',
    spesialisasi: 'Jaringan Tegangan Rendah (JTR), Kabel Twisted NFA2X-T & SR Pelanggan',
    jumlahAnggota: 12,
    status: 'AKTIF',
    assignments: [
      {
        id: 'asg-004-1',
        lokasiPekerjaan: 'Perumahan Grand Cikarang City Blok E - H',
        pic: 'Dimas Pratama, S.T.',
        picKontak: '0813-9876-5432',
        namaPekerjaan: 'Peluasan Jaringan Tegangan Rendah (JTR) & Sambungan Rumah Baru',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/005',
        statusPenugasan: 'BERJALAN',
        keterangan: 'Pemasangan LV board 4 jurusan dan penarikan kabel twisted 3x70+1x50mm²'
      }
    ],
    catatan: 'Fokus pada kerapihan instalasi distribusi sekunder dan komisioning KWH Meter.',
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-15T11:00:00.000Z'
  },
  {
    id: 'foreman-005',
    namaMandor: 'Mandor Sugeng Riyadi',
    kontak: '0821-3344-5566',
    spesialisasi: 'Sistem Pembumian (Grounding Grid & Rod), Proteksi Petir Arrester',
    jumlahAnggota: 8,
    status: 'STANDBY',
    assignments: [
      {
        id: 'asg-005-1',
        lokasiPekerjaan: 'Gardu Induk Tambun & Sekitarnya',
        pic: 'Ir. Bambang Sudarsono, M.T.',
        picKontak: '0812-3456-7890',
        namaPekerjaan: 'Perbaikan Sistem Pentanahan Gardu Distribusi Nilai < 1 Ohm',
        noSPBJ: 'SPBJ/PLN-UID-JBB/2026/09/101',
        statusPenugasan: 'PERSIAPAN',
        keterangan: 'Pengeboran elektroda tembaga BC 50mm² dan chemical soil treatment'
      }
    ],
    catatan: 'Dilengkapi Earth Tester Digital terkalibrasi KAN dan sertifikasi pengukuran grounding.',
    createdAt: '2026-09-06T08:00:00.000Z',
    updatedAt: '2026-09-14T16:00:00.000Z'
  }
];
