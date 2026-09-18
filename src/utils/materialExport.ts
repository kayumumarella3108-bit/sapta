import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MaterialRequest } from '../types';
import { formatDateIndo } from './formatters';

export const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'DIKELUARKAN':
      return { label: 'Dikeluarkan dari Gudang', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'DISETUJUI':
      return { label: 'Disetujui Direksi', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'DIAJUKAN':
      return { label: 'Diajukan / Menunggu', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'DRAFT':
    default:
      return { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
};

/**
 * Export single Material Request to PDF
 */
export const exportMaterialRequestToPDF = (req: MaterialRequest) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;

  // Header Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('PT PLN (PERSERO) • UNIT INDUK DISTRIBUSI / UP3', 14, 14);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('BON PERMINTAAN MATERIAL MDU & NON-MDU', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Formulir Pengeluaran Material Distribusi Utama & Peralatan Penunjang Lapangan', 14, 24);

  // Line Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 26, pageWidth - 14, 26);

  // Identity / Metadata block
  const metaData: any[] = [
    [
      { content: 'No. Permintaan / Bon:', styles: { fontStyle: 'bold', cellWidth: 38 } },
      { content: req.nomorPermintaan, styles: { fontStyle: 'bold', textColor: [180, 83, 9] as [number, number, number] } },
      { content: 'Tanggal Pengajuan:', styles: { fontStyle: 'bold', cellWidth: 35 } },
      { content: formatDateIndo(req.tanggalPermintaan), styles: {} },
    ],
    [
      { content: 'Nama Pekerjaan:', styles: { fontStyle: 'bold' } },
      { content: req.pekerjaan, styles: { fontStyle: 'bold' } },
      { content: 'No. SPBJ / Kontrak:', styles: { fontStyle: 'bold' } },
      { content: req.noSPBJ, styles: { fontStyle: 'bold', textColor: [15, 23, 42] as [number, number, number] } },
    ],
    [
      { content: 'Lokasi Pekerjaan:', styles: { fontStyle: 'bold' } },
      { content: req.lokasi, styles: {} },
      { content: 'Status Bon:', styles: { fontStyle: 'bold' } },
      { content: getStatusBadgeStyle(req.status).label, styles: { fontStyle: 'bold' } },
    ],
    [
      { content: 'Pemohon (Mandor):', styles: { fontStyle: 'bold' } },
      { content: `${req.pemohon}${req.kontakPemohon ? ` (${req.kontakPemohon})` : ''}`, styles: {} },
      { content: 'Direksi Pengawas:', styles: { fontStyle: 'bold' } },
      { content: req.direksiPengawas, styles: {} },
    ],
  ];

  autoTable(doc, {
    startY: 28,
    body: metaData,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
    },
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 4;

  // 1. SECTION MDU
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`I. RINCIAN KEBUTUHAN MDU - ${req.itemsMDU.length} Jenis`, 14, currentY);

  const mduTableData = req.itemsMDU.map((item, idx) => [
    (idx + 1).toString(),
    item.kodeMaterial || `MDU-${idx + 1}`,
    item.namaMaterial,
    item.spesifikasi || '-',
    item.volume.toString(),
    item.satuan,
    item.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [[
      'No',
      'Kode',
      'Nama Material MDU',
      'Spesifikasi / Standar',
      'Diminta',
      'Satuan',
      'Keterangan / Titik',
    ]],
    body: mduTableData.length > 0 ? mduTableData : [['-', '-', 'Tidak ada permintaan item MDU', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      valign: 'middle',
      textColor: [30, 41, 59] as [number, number, number],
      lineColor: [203, 213, 225] as [number, number, number],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [254, 243, 199] as [number, number, number], // amber-100
      textColor: [120, 53, 15] as [number, number, number], // amber-900
      fontStyle: 'bold',
      fontSize: 8,
      lineColor: [245, 158, 11] as [number, number, number],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 46 },
      4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 2. SECTION NON-MDU
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(`II. RINCIAN KEBUTUHAN NON-MDU - ${req.itemsNonMDU.length} Jenis`, 14, currentY);

  const nonMduTableData = req.itemsNonMDU.map((item, idx) => [
    (idx + 1).toString(),
    item.kodeMaterial || `NON-${idx + 1}`,
    item.namaMaterial,
    item.spesifikasi || '-',
    item.volume.toString(),
    item.satuan,
    item.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [[
      'No',
      'Kode',
      'Nama Material Non-MDU',
      'Spesifikasi / Standar',
      'Diminta',
      'Satuan',
      'Keterangan / Titik',
    ]],
    body: nonMduTableData.length > 0 ? nonMduTableData : [['-', '-', 'Tidak ada permintaan item Non-MDU', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      valign: 'middle',
      textColor: [30, 41, 59] as [number, number, number],
      lineColor: [203, 213, 225] as [number, number, number],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [224, 231, 255] as [number, number, number], // indigo-100
      textColor: [30, 27, 75] as [number, number, number], // indigo-950
      fontStyle: 'bold',
      fontSize: 8,
      lineColor: [99, 102, 241] as [number, number, number],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 46 },
      4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Catatan Khusus
  if (req.catatan) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Catatan Pengambilan Gudang:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(req.catatan, 14, currentY + 4, { maxWidth: pageWidth - 28 });
    currentY += 10;
  }

  // Signature Block (3 Parties: Pemohon, Pengawas/Direksi, Petugas Gudang)
  // Ensure we don't overflow the page
  if (currentY + 35 > doc.internal.pageSize.height - 15) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY, doc.internal.pageSize.height - 48);
  }

  const colW = (pageWidth - 28) / 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  // Column 1: Pemohon
  doc.text('Yang Meminta (Pelaksana Lapangan)', 14 + colW * 0 + colW / 2, currentY, { align: 'center' });
  doc.text('Mandor / Kontraktor SPBJ', 14 + colW * 0 + colW / 2, currentY + 4, { align: 'center' });

  // Column 2: Direksi Pengawas
  doc.text('Menyetujui (Pengawas Lapangan)', 14 + colW * 1 + colW / 2, currentY, { align: 'center' });
  doc.text('Direksi Pekerjaan PLN', 14 + colW * 1 + colW / 2, currentY + 4, { align: 'center' });

  // Column 3: Petugas Gudang
  doc.text('Menyerahkan (Petugas Gudang)', 14 + colW * 2 + colW / 2, currentY, { align: 'center' });
  doc.text('Bagian Logistik & Material UP3', 14 + colW * 2 + colW / 2, currentY + 4, { align: 'center' });

  // Sign lines
  const lineY = currentY + 20;
  doc.setDrawColor(148, 163, 184);
  doc.line(14 + 5, lineY, 14 + colW - 5, lineY);
  doc.line(14 + colW + 5, lineY, 14 + colW * 2 - 5, lineY);
  doc.line(14 + colW * 2 + 5, lineY, 14 + colW * 3 - 5, lineY);

  // Names below sign lines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  doc.text(req.pemohon, 14 + colW * 0 + colW / 2, lineY + 4, { align: 'center' });
  doc.text(req.direksiPengawas, 14 + colW * 1 + colW / 2, lineY + 4, { align: 'center' });
  doc.text(req.petugasGudang || 'Petugas Gudang PLN', 14 + colW * 2 + colW / 2, lineY + 4, { align: 'center' });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Halaman ${i} dari ${pageCount} • Bon Permintaan Material MDU & Non-MDU • SPBJ No: ${req.noSPBJ}`,
      14,
      doc.internal.pageSize.height - 7
    );
  }

  const cleanFilename = req.nomorPermintaan.replace(/[/\\?%*:|"<>]/g, '_');
  doc.save(`Permintaan_Material_MDU_${cleanFilename}.pdf`);
};

/**
 * Export single Material Request to genuine Excel (.xlsx) file
 */
export const exportMaterialRequestToExcel = (req: MaterialRequest) => {
  const wb = XLSX.utils.book_new();

  // Prepare sheet data rows
  const sheetData: (string | number)[][] = [];

  // Title
  sheetData.push(['PT PLN (PERSERO)']);
  sheetData.push(['BON PERMINTAAN PENGELUARAN MATERIAL (MDU & NON-MDU)']);
  sheetData.push([]);

  // Info Block
  sheetData.push(['Nomor Permintaan / Bon:', req.nomorPermintaan, '', 'Tanggal Pengajuan:', req.tanggalPermintaan]);
  sheetData.push(['Nama Pekerjaan:', req.pekerjaan, '', 'No. SPBJ:', req.noSPBJ]);
  sheetData.push(['Lokasi Pekerjaan:', req.lokasi, '', 'Status Permintaan:', req.status]);
  sheetData.push(['Pemohon (Mandor):', req.pemohon, '', 'Direksi Pengawas PLN:', req.direksiPengawas]);
  if (req.petugasGudang) {
    sheetData.push(['Petugas Gudang / Logistik:', req.petugasGudang]);
  }
  if (req.catatan) {
    sheetData.push(['Catatan Tambahan:', req.catatan]);
  }
  sheetData.push([]);

  // SECTION I: MDU
  sheetData.push(['I. RINCIAN KEBUTUHAN MDU']);
  sheetData.push([
    'No',
    'Kode Material',
    'Nama Material MDU',
    'Spesifikasi Teknis / Standar SPLN',
    'Jumlah Diminta',
    'Satuan',
    'Keterangan / Titik Pemasangan',
  ]);

  if (req.itemsMDU.length > 0) {
    req.itemsMDU.forEach((item, idx) => {
      sheetData.push([
        idx + 1,
        item.kodeMaterial || `MDU-${idx + 1}`,
        item.namaMaterial,
        item.spesifikasi,
        item.volume,
        item.satuan,
        item.keterangan || '',
      ]);
    });
  } else {
    sheetData.push(['-', '-', 'Tidak ada item material MDU yang diminta', '-', '-', '-', '-']);
  }

  sheetData.push([]);

  // SECTION II: NON-MDU
  sheetData.push(['II. RINCIAN KEBUTUHAN NON-MDU']);
  sheetData.push([
    'No',
    'Kode Material',
    'Nama Material Non-MDU',
    'Spesifikasi Teknis / Standar SPLN',
    'Jumlah Diminta',
    'Satuan',
    'Keterangan / Titik Pemasangan',
  ]);

  if (req.itemsNonMDU.length > 0) {
    req.itemsNonMDU.forEach((item, idx) => {
      sheetData.push([
        idx + 1,
        item.kodeMaterial || `NON-${idx + 1}`,
        item.namaMaterial,
        item.spesifikasi,
        item.volume,
        item.satuan,
        item.keterangan || '',
      ]);
    });
  } else {
    sheetData.push(['-', '-', 'Tidak ada item material Non-MDU yang diminta', '-', '-', '-', '-']);
  }

  sheetData.push([]);
  sheetData.push([]);

  // Signatures
  sheetData.push(['Yang Meminta (Pemohon)', '', 'Menyetujui (Direksi Pengawas)', '', 'Menyerahkan (Petugas Gudang)']);
  sheetData.push(['Mandor / Pelaksana SPBJ', '', 'Pengawas Lapangan PLN', '', 'Bagian Logistik & Pergudangan']);
  sheetData.push([]);
  sheetData.push([]);
  sheetData.push([req.pemohon, '', req.direksiPengawas, '', req.petugasGudang || 'Petugas Gudang PLN']);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Kode
    { wch: 42 }, // Nama Material
    { wch: 38 }, // Spesifikasi
    { wch: 16 }, // Jumlah Diminta
    { wch: 12 }, // Satuan
    { wch: 32 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Bon Permintaan Material');

  const cleanFilename = req.nomorPermintaan.replace(/[/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(wb, `Permintaan_Material_MDU_${cleanFilename}.xlsx`);
};

/**
 * Export all Material Requests summary to genuine Excel (.xlsx)
 */
export const exportAllMaterialRequestsToExcel = (requests: MaterialRequest[]) => {
  const wb = XLSX.utils.book_new();

  // Summary rows
  const summaryData: (string | number)[][] = [
    ['PT PLN (PERSERO)'],
    ['REKAPITULASI DAFTAR PERMINTAAN MATERIAL MDU & NON-MDU'],
    ['Tanggal Rekap:', new Date().toISOString().slice(0, 10), 'Total Dokumen:', requests.length],
    [],
    [
      'No',
      'No. Permintaan / Bon',
      'Tanggal',
      'Nama Pekerjaan',
      'Lokasi Pekerjaan',
      'No. SPBJ',
      'Pemohon (Mandor)',
      'Direksi Pengawas',
      'Petugas Gudang',
      'Jml Jenis MDU',
      'Jml Jenis Non-MDU',
      'Status Permintaan',
      'Catatan',
    ],
  ];

  requests.forEach((r, idx) => {
    summaryData.push([
      idx + 1,
      r.nomorPermintaan,
      r.tanggalPermintaan,
      r.pekerjaan,
      r.lokasi,
      r.noSPBJ,
      r.pemohon,
      r.direksiPengawas,
      r.petugasGudang || '-',
      r.itemsMDU.length,
      r.itemsNonMDU.length,
      getStatusBadgeStyle(r.status).label,
      r.catatan || '',
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 38 },
    { wch: 32 },
    { wch: 28 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekapitulasi Bon Material');

  // Detailed items list sheet
  const allItemsData: (string | number)[][] = [
    ['No', 'No. Bon', 'No. SPBJ', 'Tipe Material', 'Nama Material', 'Spesifikasi', 'Diminta', 'Satuan', 'Disetujui', 'Keterangan'],
  ];

  let itemCounter = 1;
  requests.forEach((r) => {
    r.itemsMDU.forEach((item) => {
      allItemsData.push([
        itemCounter++,
        r.nomorPermintaan,
        r.noSPBJ,
        'MDU',
        item.namaMaterial,
        item.spesifikasi,
        item.volume,
        item.satuan,
        item.volumeDisetujui !== undefined ? item.volumeDisetujui : item.volume,
        item.keterangan || '',
      ]);
    });
    r.itemsNonMDU.forEach((item) => {
      allItemsData.push([
        itemCounter++,
        r.nomorPermintaan,
        r.noSPBJ,
        'NON-MDU',
        item.namaMaterial,
        item.spesifikasi,
        item.volume,
        item.satuan,
        item.volumeDisetujui !== undefined ? item.volumeDisetujui : item.volume,
        item.keterangan || '',
      ]);
    });
  });

  const wsItems = XLSX.utils.aoa_to_sheet(allItemsData);
  wsItems['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 26 },
    { wch: 12 },
    { wch: 40 },
    { wch: 36 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsItems, 'Rincian Seluruh Item');

  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Rekap_Permintaan_Material_MDU_NonMDU_${todayStr}.xlsx`);
};
