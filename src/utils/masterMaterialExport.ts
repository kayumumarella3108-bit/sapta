import * as XLSX from 'xlsx';
import { MasterMaterialItem } from '../types';

export const exportMasterMaterialsToExcel = (materials: MasterMaterialItem[]) => {
  const wb = XLSX.utils.book_new();

  const sheetData: (string | number)[][] = [];

  // Header Info
  sheetData.push(['DIVISI MECHANICAL ELECTRICAL PT SAPTA MANUNGGAL KARYA']);
  sheetData.push(['MASTER DATA MATERIAL DISTRIBUSI UTAMA (MDU) & NON-MDU']);
  sheetData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`]);
  sheetData.push([`Total Item Terdaftar: ${materials.length} Material`]);
  sheetData.push([]);

  // Table Headers
  sheetData.push([
    'No',
    'Kode Material',
    'Kategori',
    'Kelompok / Sub-Kategori',
    'Nama Material',
    'Satuan',
    'Stok Referensi Gudang',
    'Keterangan / Catatan',
  ]);

  materials.forEach((item, index) => {
    sheetData.push([
      index + 1,
      item.kodeMaterial,
      item.kategori === 'MDU' ? 'MDU (Distribusi Utama)' : 'Non-MDU & Aksesoris',
      item.kelompok,
      item.namaMaterial,
      item.satuan,
      item.stokGudang !== undefined ? item.stokGudang : '-',
      item.keterangan || '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Kode
    { wch: 22 }, // Kategori
    { wch: 28 }, // Kelompok
    { wch: 42 }, // Nama Material
    { wch: 14 }, // Satuan
    { wch: 24 }, // Stok
    { wch: 35 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Master Data MDU & Non-MDU');

  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Master_Data_Material_SMK_${todayStr}.xlsx`);
};

export const exportMasterMaterialsToCSV = (materials: MasterMaterialItem[]) => {
  const headers = [
    'No',
    'Kode Material',
    'Kategori',
    'Kelompok',
    'Nama Material',
    'Satuan',
    'Stok Gudang',
    'Keterangan',
  ];

  const rows = materials.map((item, index) => [
    index + 1,
    `"${item.kodeMaterial.replace(/"/g, '""')}"`,
    `"${item.kategori}"`,
    `"${item.kelompok.replace(/"/g, '""')}"`,
    `"${item.namaMaterial.replace(/"/g, '""')}"`,
    `"${item.satuan.replace(/"/g, '""')}"`,
    item.stokGudang !== undefined ? item.stokGudang : 0,
    `"${(item.keterangan || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Master_Material_SMK_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
