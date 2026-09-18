import { ProjectItem, ProjectCategory, ProjectStatus, VoltageStatus, SafetyStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatShortRupiah = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, '')} Milyar`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} Juta`;
  }
  return formatRupiah(value);
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getCategoryBadge = (kategori: ProjectCategory) => {
  switch (kategori) {
    case 'TM':
      return {
        label: 'Tegangan Menengah 20kV',
        short: 'TM (20kV)',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'TR':
      return {
        label: 'Tegangan Rendah 380V/220V',
        short: 'TR (380V)',
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
      };
    case 'Gardu':
      return {
        label: 'Gardu & Trafo Distribusi',
        short: 'Gardu / Trafo',
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        dot: 'bg-purple-500',
      };
    case 'Panel':
      return {
        label: 'Panel LVMDP & Switchgear',
        short: 'Panel & Cubicle',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'Jaringan':
      return {
        label: 'Jaringan Distribusi (SUTM/SUTR)',
        short: 'Jaringan Distribusi',
        bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        dot: 'bg-indigo-500',
      };
    case 'Grounding':
      return {
        label: 'Grounding & Penangkal Petir',
        short: 'Grounding & Proteksi',
        bg: 'bg-teal-100 text-teal-800 border-teal-300',
        dot: 'bg-teal-500',
      };
    default:
      return {
        label: 'Kelistrikan',
        short: 'Elektrikal',
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
  }
};

export const getStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'ON_PROGRESS':
      return {
        label: 'Sedang Berjalan',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        iconColor: 'text-blue-600',
        dot: 'bg-blue-500 animate-pulse',
      };
    case 'COMPLETED':
      return {
        label: 'Selesai (BAST/PHO)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconColor: 'text-emerald-600',
        dot: 'bg-emerald-500',
      };
    case 'DELAYED':
      return {
        label: 'Terkendala / Deviasi',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        iconColor: 'text-rose-600',
        dot: 'bg-rose-500',
      };
    case 'PENDING':
      return {
        label: 'Persiapan / Pending',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        iconColor: 'text-amber-600',
        dot: 'bg-amber-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        iconColor: 'text-slate-600',
        dot: 'bg-slate-500',
      };
  }
};

export const getVoltageBadge = (voltage: VoltageStatus) => {
  switch (voltage) {
    case 'BEBAS_TEGANGAN':
      return {
        label: 'Bebas Tegangan (Aman)',
        short: 'Bebas Tegangan',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'PADAM_TERENCANA':
      return {
        label: 'Padam Manuver Terencana',
        short: 'Padam Terencana',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'BERTEGANGAN':
      return {
        label: 'PDKB (Bertegangan Tinggi)',
        short: 'PDKB / Bertegangan',
        bg: 'bg-red-100 text-red-800 border-red-300',
      };
    default:
      return {
        label: voltage,
        short: voltage,
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
      };
  }
};

export const getSafetyBadge = (safety: SafetyStatus) => {
  switch (safety) {
    case 'AMAN':
      return {
        label: 'K3 Aman (Zero Accident)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'TEMUAN_RINGAN':
      return {
        label: 'Temuan Ringan (Unsafe Condition)',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'TEMUAN_BERBAHAYA':
      return {
        label: 'Stop Work (Unsafe Act)',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: safety,
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

export const getMaterialConditionBadge = (status?: string) => {
  switch (status) {
    case 'TERPASANG_BAIK':
      return {
        label: 'Terpasang Baik',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'SUDAH_DITES':
      return {
        label: 'Uji/Megger OK',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'BELUM_ENERGIZE':
      return {
        label: 'Belum Energize',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'DEFECT':
      return {
        label: 'Perlu Perbaikan',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: 'Terpasang',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
};

export interface MaterialSummaryItem {
  namaMaterial: string;
  totalVolume: number;
  satuan: string;
  spesifikasi?: string;
  lokasiList: string[];
  statusList: string[];
  lastInstalledDate: string;
}

export const getCumulativeMaterials = (project: ProjectItem): MaterialSummaryItem[] => {
  if (!project.dailyLogs || project.dailyLogs.length === 0) return [];

  const map = new Map<string, MaterialSummaryItem>();

  project.dailyLogs.forEach((log) => {
    if (log.materialTerpasang && log.materialTerpasang.length > 0) {
      log.materialTerpasang.forEach((mat) => {
        const key = `${mat.namaMaterial.toLowerCase().trim()}__${(mat.satuan || '').toLowerCase().trim()}`;
        if (!map.has(key)) {
          map.set(key, {
            namaMaterial: mat.namaMaterial,
            totalVolume: Number(mat.volume) || 0,
            satuan: mat.satuan || 'unit',
            spesifikasi: mat.spesifikasi,
            lokasiList: mat.lokasiTitik ? [mat.lokasiTitik] : [],
            statusList: mat.kondisiStatus ? [mat.kondisiStatus] : [],
            lastInstalledDate: log.tanggal,
          });
        } else {
          const item = map.get(key)!;
          item.totalVolume += Number(mat.volume) || 0;
          if (mat.lokasiTitik && !item.lokasiList.includes(mat.lokasiTitik)) {
            item.lokasiList.push(mat.lokasiTitik);
          }
          if (mat.kondisiStatus && !item.statusList.includes(mat.kondisiStatus)) {
            item.statusList.push(mat.kondisiStatus);
          }
          if (new Date(log.tanggal) > new Date(item.lastInstalledDate)) {
            item.lastInstalledDate = log.tanggal;
          }
        }
      });
    }
  });

  return Array.from(map.values());
};

export const exportProjectsToCSV = (projects: ProjectItem[]) => {
  const headers = [
    'No',
    'Nama Pekerjaan',
    'Kategori',
    'Lokasi',
    'Nilai Kontrak (Rp)',
    'No. SPBJ',
    'PIC (Project Engineer)',
    'Mandor',
    'Total Manpower',
    'Teknisi Listrik',
    'Helper',
    'HSE Officer',
    'Operator Alat',
    'Progress Rencana (%)',
    'Progress Realisasi (%)',
    'Status Pekerjaan',
    'Kondisi Tegangan',
    'Target Selesai',
    'Catatan Harian Lapangan'
  ];

  const rows = projects.map(p => [
    p.no,
    `"${p.namaPekerjaan.replace(/"/g, '""')}"`,
    `"${p.kategori}"`,
    `"${p.lokasi.replace(/"/g, '""')}"`,
    p.nilaiKontrak,
    `"${p.noSPBJ}"`,
    `"${p.pic.replace(/"/g, '""')}"`,
    `"${p.mandor.replace(/"/g, '""')}"`,
    p.manpower.total,
    p.manpower.teknisiListrik,
    p.manpower.helper,
    p.manpower.hseOfficer,
    p.manpower.operatorAlat,
    p.progressRencana,
    p.progressRealisasi,
    `"${p.status}"`,
    `"${p.statusManuver}"`,
    `"${p.targetSelesai}"`,
    `"${(p.catatanHarian || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `monitoring_proyek_kelistrikan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadReportTableCSV = (projects: ProjectItem[]) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'No',
    'Nama Pekerjaan',
    'Kategori',
    'Status Manuver',
    'Lokasi',
    'Nilai Kontrak (Rp)',
    'No. SPBJ',
    'PIC (Direksi)',
    'Kontak PIC',
    'Mandor',
    'Jumlah Manpower (Orang)'
  ];

  const rows = projects.map(p => [
    p.no,
    `"${p.namaPekerjaan.replace(/"/g, '""')}"`,
    `"${p.kategori}"`,
    `"${p.statusManuver}"`,
    `"${p.lokasi.replace(/"/g, '""')}"`,
    p.nilaiKontrak,
    `"${p.noSPBJ}"`,
    `"${p.pic.replace(/"/g, '""')}"`,
    `"${p.picKontak || ''}"`,
    `"${p.mandor.replace(/"/g, '""')}"`,
    p.manpower?.total || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `laporan_rekap_spbj_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadReportHTML = (projects: ProjectItem[]) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalNilai = projects.reduce((sum, p) => sum + p.nilaiKontrak, 0);

  const rowsHtml = projects.map(item => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-weight: bold; vertical-align: middle;">${item.no}</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle;">
        <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${item.namaPekerjaan}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Kat: ${item.kategori} &bull; ${item.statusManuver}</div>
      </td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle; color: #334155;">${item.lokasi}</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle; font-weight: bold; white-space: nowrap; color: #0f172a;">${formatRupiah(item.nilaiKontrak)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle; font-family: monospace; font-size: 11px; color: #334155;">${item.noSPBJ}</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle;">
        <div style="font-weight: 600; color: #0f172a;">${item.pic}</div>
        ${item.picKontak ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.picKontak}</div>` : ''}
      </td>
      <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle;">
        <div style="font-weight: bold; color: #0f172a;">${item.mandor}</div>
        <div style="font-size: 11px; color: #475569; font-weight: 500; margin-top: 2px;">${item.manpower?.total || 0} Orang</div>
      </td>
    </tr>
  `).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekapitulasi Proyek SPBJ Kelistrikan - ${todayStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 32px; color: #0f172a; margin: 0; background: #ffffff; }
    .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title-tag { font-size: 11px; font-weight: 800; color: #d97706; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 4px 0 2px 0; color: #0f172a; letter-spacing: -0.3px; }
    .sub { font-size: 12px; color: #64748b; margin: 0; }
    .stats-bar { display: flex; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; font-size: 12px; }
    .stat-item { text-align: left; }
    .stat-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .stat-val { font-size: 13px; font-weight: bold; color: #0f172a; display: block; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; vertical-align: middle; font-weight: 700; color: #0f172a; }
    @media print {
      body { padding: 12px; }
      @page { size: landscape; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="title-tag">PT PLN (PERSERO) &bull; DOKUMEN REKAPITULASI PROYEK</div>
      <h1>Laporan Rekapitulasi Proyek Pekerjaan Kelistrikan (SPBJ)</h1>
      <p class="sub">Surat Perjanjian Pemborongan Pekerjaan &amp; Rekapitulasi Pelaksanaan Lapangan</p>
    </div>
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">Tanggal Cetak</span>
        <span class="stat-val">${formatDateIndo(todayStr)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Pekerjaan</span>
        <span class="stat-val">${projects.length} SPBJ</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Nilai Kontrak</span>
        <span class="stat-val" style="color: #b45309;">${formatRupiah(totalNilai)}</span>
      </div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align: center; width: 44px;">No</th>
        <th style="text-align: center; min-width: 200px;">Nama Pekerjaan</th>
        <th style="text-align: center; min-width: 140px;">Lokasi</th>
        <th style="text-align: center; min-width: 120px;">Nilai Kontrak</th>
        <th style="text-align: center; min-width: 140px;">No. SPBJ</th>
        <th style="text-align: center; min-width: 140px;">PIC (Direksi)</th>
        <th style="text-align: center; min-width: 130px;">Mandor &amp; Manpower</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan_rekap_spbj_${todayStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadReportPDF = (projects: ProjectItem[]) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalNilai = projects.reduce((sum, p) => sum + p.nilaiKontrak, 0);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('PT PLN (PERSERO) • DIVISI DISTRIBUSI & KONSTRUKSI ELEKTRIKAL', 14, 14);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('REKAPITULASI PROYEK PEKERJAAN KELISTRIKAN (SPBJ)', 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Surat Perjanjian Pemborongan Pekerjaan & Rekapitulasi Pelaksanaan Lapangan', 14, 26);

  // Metadata summary line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Tanggal: ${formatDateIndo(todayStr)}   |   Total: ${projects.length} SPBJ   |   Total Nilai Kontrak: ${formatRupiah(totalNilai)}`, 14, 32);

  // Table Data (All Centered)
  const tableData = projects.map((p) => [
    p.no.toString(),
    `${p.namaPekerjaan}\n[${p.kategori} - ${p.statusManuver}]`,
    p.lokasi,
    formatRupiah(p.nilaiKontrak),
    p.noSPBJ,
    p.picKontak ? `${p.pic}\n${p.picKontak}` : p.pic,
    `${p.mandor}\n${p.manpower?.total || 0} Orang`,
  ]);

  autoTable(doc, {
    startY: 36,
    head: [[
      'No',
      'Nama Pekerjaan',
      'Lokasi',
      'Nilai Kontrak',
      'No. SPBJ',
      'PIC (Direksi)',
      'Mandor & Manpower',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center', // All columns centered!
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center', // Header centered!
      lineColor: [148, 163, 184],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70, halign: 'center' },
      2: { cellWidth: 48, halign: 'center' },
      3: { cellWidth: 38, halign: 'center' },
      4: { cellWidth: 40, halign: 'center' },
      5: { cellWidth: 36, halign: 'center' },
      6: { cellWidth: 26, halign: 'center' },
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${pageCount} • Sistem Monitoring Proyek Kelistrikan SPBJ • K3 Zero Accident`,
        14,
        doc.internal.pageSize.height - 8
      );
    },
  });

  doc.save(`laporan_rekap_spbj_${todayStr}.pdf`);
};

