import { ProjectItem, ProjectTimelinePhase, PhaseCategory, PhaseStatus } from '../types';

export const PHASE_CONFIG: Record<
  PhaseCategory,
  {
    step: number;
    title: string;
    shortTitle: string;
    color: string;
    border: string;
    bgLight: string;
    text: string;
    badgeBg: string;
  }
> = {
  PERSIAPAN: {
    step: 1,
    title: 'Awal Persiapan & Administrasi K3',
    shortTitle: 'Persiapan',
    color: 'from-amber-500 to-amber-600',
    border: 'border-amber-300',
    bgLight: 'bg-amber-50',
    text: 'text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  MOB_MANPOWER: {
    step: 2,
    title: 'Mobilisasi Manpower & Alat Kerja',
    shortTitle: 'Mob. Manpower',
    color: 'from-blue-500 to-blue-600',
    border: 'border-blue-300',
    bgLight: 'bg-blue-50',
    text: 'text-blue-800',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  MOB_MATERIAL: {
    step: 3,
    title: 'Mobilisasi & Dropping Material',
    shortTitle: 'Mob. Material',
    color: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  PEKERJAAN: {
    step: 4,
    title: 'Pelaksanaan Pekerjaan Fisik',
    shortTitle: 'Pekerjaan',
    color: 'from-purple-500 to-purple-600',
    border: 'border-purple-300',
    bgLight: 'bg-purple-50',
    text: 'text-purple-800',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  TESTING_COMMISSIONING: {
    step: 5,
    title: 'Testing, Megger Test & Energize',
    shortTitle: 'Testing & Uji',
    color: 'from-cyan-500 to-cyan-600',
    border: 'border-cyan-300',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-800',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  FINISHING_BAST: {
    step: 6,
    title: 'Finishing & BAST (Serah Terima)',
    shortTitle: 'Finishing/BAST',
    color: 'from-teal-500 to-teal-600',
    border: 'border-teal-300',
    bgLight: 'bg-teal-50',
    text: 'text-teal-800',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
  },
};

export const getPhaseStatusBadge = (status: PhaseStatus) => {
  switch (status) {
    case 'SELESAI':
      return {
        label: 'Selesai 100%',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'SEDANG_BERJALAN':
      return {
        label: 'Sedang Berjalan',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'TERKENDALA':
      return {
        label: 'Terkendala',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
      };
    case 'BELUM_MULAI':
    default:
      return {
        label: 'Belum Dimulai',
        bg: 'bg-slate-100 text-slate-600 border-slate-300',
        dot: 'bg-slate-400',
      };
  }
};

/**
 * Add days to YYYY-MM-DD string
 */
export const addDaysToDate = (dateStr: string, daysToAdd: number): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
};

/**
 * Calculate total days between two YYYY-MM-DD strings
 */
export const getDaysDiff = (startStr: string, endStr: string): number => {
  try {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    if (isNaN(s) || isNaN(e)) return 1;
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
};

/**
 * Generate standard 6 chronological project phases:
 * Persiapan -> Mobilisasi Manpower -> Mobilisasi Material -> Pekerjaan Fisik -> Testing -> BAST
 */
export const generateDefaultPhases = (project: ProjectItem): ProjectTimelinePhase[] => {
  const startDate = project.tanggalMulai || new Date().toISOString().slice(0, 10);
  const endDate = project.targetSelesai || addDaysToDate(startDate, 20);
  const totalDays = getDaysDiff(startDate, endDate);

  // Distribute days across 6 phases proportionally
  // 1. Persiapan: Day 0 to Day round(totalDays * 0.18)
  // 2. Mobilisasi Manpower: Day round(totalDays * 0.10) to round(totalDays * 0.30)
  // 3. Mobilisasi Material: Day round(totalDays * 0.20) to round(totalDays * 0.45)
  // 4. Pelaksanaan Pekerjaan: Day round(totalDays * 0.30) to round(totalDays * 0.85)
  // 5. Testing & Energize: Day round(totalDays * 0.80) to round(totalDays * 0.94)
  // 6. Finishing & BAST: Day round(totalDays * 0.90) to totalDays

  const p1Start = startDate;
  const p1End = addDaysToDate(startDate, Math.max(2, Math.round(totalDays * 0.18)));

  const p2Start = addDaysToDate(startDate, Math.max(1, Math.round(totalDays * 0.10)));
  const p2End = addDaysToDate(startDate, Math.max(3, Math.round(totalDays * 0.30)));

  const p3Start = addDaysToDate(startDate, Math.max(2, Math.round(totalDays * 0.20)));
  const p3End = addDaysToDate(startDate, Math.max(4, Math.round(totalDays * 0.45)));

  const p4Start = addDaysToDate(startDate, Math.max(3, Math.round(totalDays * 0.30)));
  const p4End = addDaysToDate(startDate, Math.max(5, Math.round(totalDays * 0.85)));

  const p5Start = addDaysToDate(startDate, Math.max(4, Math.round(totalDays * 0.80)));
  const p5End = addDaysToDate(startDate, Math.max(6, Math.round(totalDays * 0.94)));

  const p6Start = addDaysToDate(startDate, Math.max(5, Math.round(totalDays * 0.90)));
  const p6End = endDate;

  // Compute status according to project.progressRealisasi
  const prog = project.progressRealisasi || 0;

  const determinePhaseStatus = (phaseStep: number): { status: PhaseStatus; progress: number } => {
    if (project.status === 'COMPLETED' || prog >= 100) {
      return { status: 'SELESAI', progress: 100 };
    }
    if (prog === 0) {
      if (phaseStep === 1) return { status: 'SEDANG_BERJALAN', progress: 30 };
      return { status: 'BELUM_MULAI', progress: 0 };
    }

    if (prog < 25) {
      if (phaseStep === 1) return { status: 'SELESAI', progress: 100 };
      if (phaseStep === 2) return { status: 'SEDANG_BERJALAN', progress: 80 };
      if (phaseStep === 3) return { status: 'SEDANG_BERJALAN', progress: 40 };
      return { status: 'BELUM_MULAI', progress: 0 };
    }

    if (prog < 60) {
      if (phaseStep === 1) return { status: 'SELESAI', progress: 100 };
      if (phaseStep === 2) return { status: 'SELESAI', progress: 100 };
      if (phaseStep === 3) return { status: 'SELESAI', progress: 100 };
      if (phaseStep === 4) return { status: 'SEDANG_BERJALAN', progress: Math.round(prog * 1.2) };
      return { status: 'BELUM_MULAI', progress: 0 };
    }

    if (prog < 90) {
      if (phaseStep <= 3) return { status: 'SELESAI', progress: 100 };
      if (phaseStep === 4) return { status: 'SEDANG_BERJALAN', progress: 90 };
      if (phaseStep === 5) return { status: 'SEDANG_BERJALAN', progress: 40 };
      return { status: 'BELUM_MULAI', progress: 0 };
    }

    // 90-99%
    if (phaseStep <= 4) return { status: 'SELESAI', progress: 100 };
    if (phaseStep === 5) return { status: 'SELESAI', progress: 100 };
    return { status: 'SEDANG_BERJALAN', progress: 60 };
  };

  const st1 = determinePhaseStatus(1);
  const st2 = determinePhaseStatus(2);
  const st3 = determinePhaseStatus(3);
  const st4 = determinePhaseStatus(4);
  const st5 = determinePhaseStatus(5);
  const st6 = determinePhaseStatus(6);

  return [
    {
      id: `${project.id}-phase-1`,
      kategoriFase: 'PERSIAPAN',
      judulFase: 'Awal Persiapan & Administrasi K3',
      subJudul: 'Survei trase lapangan, koordinasi perizinan PLN/instansi, Working Permit & Safety Induction K3',
      tanggalMulai: p1Start,
      tanggalSelesai: p1End,
      durasiHari: getDaysDiff(p1Start, p1End),
      status: st1.status,
      progress: st1.progress,
      penanggungJawab: `${project.pic} (PIC / Project Engineer)`,
      catatan: 'Pengurusan izin kerja listrik & persiapan APD sebelum mobilisasi personil ke lapangan.',
      checklists: [
        { id: 'c1', label: 'Survei awal lokasi & pemetaan trase kabel / tiang / gardu', selesai: st1.progress >= 50 },
        { id: 'c2', label: 'Pengurusan Working Permit (Surat Ijin Kerja Listrik) & SOP Manuver PLN', selesai: st1.progress >= 70 },
        { id: 'c3', label: 'Penyusunan Job Safety Analysis (JSA) & identifikasi bahaya induksi/tegangan', selesai: st1.progress >= 90 },
        { id: 'c4', label: 'Koordinasi lingkungan, kepolisian, Dishub & izin galian utilitas eksisting', selesai: st1.progress === 100 },
      ],
    },
    {
      id: `${project.id}-phase-2`,
      kategoriFase: 'MOB_MANPOWER',
      judulFase: 'Mobilisasi Manpower & Alat Kerja',
      subJudul: `Kedatangan Mandor (${project.mandor}) & ${project.manpower.total} tenaga kerja, inspeksi APD & safety briefing`,
      tanggalMulai: p2Start,
      tanggalSelesai: p2End,
      durasiHari: getDaysDiff(p2Start, p2End),
      status: st2.status,
      progress: st2.progress,
      penanggungJawab: `${project.mandor} (Mandor) & Tim HSE`,
      catatan: `Total ${project.manpower.total} personil siap: ${project.manpower.teknisiListrik} Teknisi, ${project.manpower.helper} Helper, ${project.manpower.hseOfficer} HSE, ${project.manpower.operatorAlat} Operator.`,
      checklists: [
        { id: 'c5', label: `Mobilisasi mandor & ${project.manpower.total} pekerja ke lokasi basecamp proyek`, selesai: st2.progress >= 50 },
        { id: 'c6', label: 'Pemeriksaan kelayakan APD: helm, rompi reflektif, sepatu isolasi 20kV, sarung tangan uji & harness', selesai: st2.progress >= 70 },
        { id: 'c7', label: 'Mobilisasi toolkit kelistrikan, crane/truk hidrolik, puller winch, genset kerja & tangga isolasi', selesai: st2.progress >= 85 },
        { id: 'c8', label: 'Pelaksanaan Toolbox Meeting K3 & deklarasi Zero Accident sebelum pekerjaan dimulai', selesai: st2.progress === 100 },
      ],
    },
    {
      id: `${project.id}-phase-3`,
      kategoriFase: 'MOB_MATERIAL',
      judulFase: 'Mobilisasi & Dropping Material',
      subJudul: 'Pengiriman material utama kelistrikan ke titik lokasi, inspeksi fisik kedatangan (FAT/DO) & storage',
      tanggalMulai: p3Start,
      tanggalSelesai: p3End,
      durasiHari: getDaysDiff(p3Start, p3End),
      status: st3.status,
      progress: st3.progress,
      penanggungJawab: `${project.mandor} & Logistik Lapangan`,
      catatan: 'Material utama disortir dan diperiksa integritas fisik serta segel pabrik sebelum dipasang.',
      checklists: [
        { id: 'c9', label: 'Penerimaan Delivery Order (DO) & pengecekan sertifikat SPLN / pabrikasi', selesai: st3.progress >= 50 },
        { id: 'c10', label: 'Unloading dan penempatan material di gudang / pit galian lapangan aman dari cuaca', selesai: st3.progress >= 70 },
        { id: 'c11', label: 'Pemeriksaan fisik insulasi kabel, body trafo, tiang beton, isolator & terminasi kit', selesai: st3.progress >= 90 },
        { id: 'c12', label: 'Pencatatan berita acara penerimaan material bersama Direksi Pengawas PLN', selesai: st3.progress === 100 },
      ],
    },
    {
      id: `${project.id}-phase-4`,
      kategoriFase: 'PEKERJAAN',
      judulFase: 'Pelaksanaan Pekerjaan Fisik / Konstruksi',
      subJudul: `Eksekusi pekerjaan utama lapangan: ${project.namaPekerjaan}`,
      tanggalMulai: p4Start,
      tanggalSelesai: p4End,
      durasiHari: getDaysDiff(p4Start, p4End),
      status: st4.status,
      progress: st4.progress,
      penanggungJawab: `${project.mandor} & Pengawas Proyek`,
      catatan: 'Pekerjaan konstruksi utama sesuai standar SPLN dan gambar bestek SPBJ.',
      checklists: [
        { id: 'c13', label: 'Pekerjaan sipil pendukung: galian tanah, pondasi gardu / tiang, dan subduct pipa HDPE', selesai: st4.progress >= 30 },
        { id: 'c14', label: 'Penarikan kabel (stringing/pulling) / pendirian tiang beton pratekan', selesai: st4.progress >= 60 },
        { id: 'c15', label: 'Pemasangan travers, isolator pin post, arrester, FCO dan perlengkapan aksesoris', selesai: st4.progress >= 80 },
        { id: 'c16', label: 'Penyambungan jointing kabel, mof indoor/outdoor, dan terminasi konektor busbar', selesai: st4.progress >= 95 },
        { id: 'c17', label: 'Instalasi sistem pentanahan (grounding grid/rod) trafo dan arrester', selesai: st4.progress === 100 },
      ],
    },
    {
      id: `${project.id}-phase-5`,
      kategoriFase: 'TESTING_COMMISSIONING',
      judulFase: 'Testing, Megger Test & Energize',
      subJudul: 'Uji tahanan isolasi (Megger), resistansi pembumian, uji fungsi proteksi & pemberian tegangan PLN',
      tanggalMulai: p5Start,
      tanggalSelesai: p5End,
      durasiHari: getDaysDiff(p5Start, p5End),
      status: st5.status,
      progress: st5.progress,
      penanggungJawab: 'Tim Quality & Direksi Lapangan PLN',
      catatan: 'Pengujian teknis wajib memenuhi standar keselamatan isolasi tegangan tinggi sebelum dinyatakan layak energize.',
      checklists: [
        { id: 'c18', label: 'Pengujian tahanan isolasi (Megger Test 5000V) kabel phasa-phasa & phasa-ground (>1000 MΩ)', selesai: st5.progress >= 50 },
        { id: 'c19', label: 'Pengukuran nilai tahanan pembumian (Earth Grounding Tester < 5 Ohm)', selesai: st5.progress >= 70 },
        { id: 'c20', label: 'Pengecekan urutan phasa (phase sequence) & kontinuitas rangkaian', selesai: st5.progress >= 90 },
        { id: 'c21', label: 'Manuver pemberian tegangan (energizing) bertahap dengan pengawasan PLN UP3', selesai: st5.progress === 100 },
      ],
    },
    {
      id: `${project.id}-phase-6`,
      kategoriFase: 'FINISHING_BAST',
      judulFase: 'Finishing & BAST (Serah Terima)',
      subJudul: 'Pembersihan area kerja (housekeeping), penyusunan As-Built Drawing & penerbitan Berita Acara BAST',
      tanggalMulai: p6Start,
      tanggalSelesai: p6End,
      durasiHari: getDaysDiff(p6Start, p6End),
      status: st6.status,
      progress: st6.progress,
      penanggungJawab: `${project.pic} & Direksi Pengawas PLN`,
      catatan: 'Penyelesaian administrasi akhir proyek dan serah terima pekerjaan pertama (PHO/BAST).',
      checklists: [
        { id: 'c22', label: 'Pembersihan lokasi kerja (housekeeping) & penutupan bekas galian / perapihan aspal', selesai: st6.progress >= 50 },
        { id: 'c23', label: 'Penyusunan gambar terlaksana (As-Built Drawing) & dokumentasi progres 0%, 50%, 100%', selesai: st6.progress >= 75 },
        { id: 'c24', label: 'Penyusunan laporan komisioning & uji kelayakan teknis', selesai: st6.progress >= 90 },
        { id: 'c25', label: 'Penandatanganan Berita Acara Serah Terima Pertama Pekerjaan (BAST / PHO)', selesai: st6.progress === 100 },
      ],
    },
  ];
};

/**
 * Ensures a project always has valid timelinePhases.
 */
export const getProjectPhases = (project: ProjectItem): ProjectTimelinePhase[] => {
  if (project.timelinePhases && project.timelinePhases.length === 6) {
    return project.timelinePhases;
  }
  return generateDefaultPhases(project);
};
