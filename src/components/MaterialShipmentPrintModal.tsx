import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Zap, 
  Truck, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  FileText,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';
import { MaterialShipment } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface MaterialShipmentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: MaterialShipment | null;
}

export const MaterialShipmentPrintModal: React.FC<MaterialShipmentPrintModalProps> = ({
  isOpen,
  onClose,
  shipment,
}) => {
  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const mduItems = shipment.items.filter((i) => i.kategori === 'MDU');
  const nonMduItems = shipment.items.filter((i) => i.kategori === 'NON_MDU');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 print:border-none print:shadow-none print:max-h-none print:max-w-none">
        
        {/* Action Toolbar (Hidden during Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pratinjau Cetak Surat Jalan Pengiriman Material</h3>
              <p className="text-[11px] text-slate-400">Siap cetak ke printer / simpan PDF fisik Surat Jalan Ekspedisi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print Surat Jalan</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:p-0 text-slate-900 text-xs">
          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm print:border print:border-slate-400">
                  <Zap className="w-7 h-7 fill-white stroke-white" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                    PT SAPTA MANUNGGAL KARYA
                  </h1>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    DIVISI MECHANICAL ELECTRICAL &bull; INSTALASI &amp; DISTRIBUSI KELISTRIKAN
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Kawasan Industri Jababeka &bull; Cikarang &bull; Jawa Barat &bull; Email: logistik.me@saptamanunggalkarya.co.id
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase rounded tracking-wider">
                  SURAT JALAN PENGIRIMAN
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-700 mt-1">
                  NO: {shipment.nomorSuratJalan}
                </div>
              </div>
            </div>
          </div>

          {/* Info Metadata Box */}
          <div className="grid grid-cols-2 gap-4 mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:border-slate-300">
            {/* Left Info: Ekspedisi & Kendaraan */}
            <div className="space-y-1.5 border-r border-slate-200 pr-3 print:border-slate-300">
              <div className="text-[11px] font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>INFORMASI EKSPEDISI &amp; ARMADA</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Ekspedisi</span>
                <span className="col-span-2 font-bold text-slate-800">: {shipment.namaEkspedisi}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Jenis Armada</span>
                <span className="col-span-2 font-medium text-slate-800">: {shipment.jenisArmada}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">No. Polisi (Plat)</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {shipment.nomorPolisi}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Nama Driver</span>
                <span className="col-span-2 font-bold text-slate-800">: {shipment.namaDriver} {shipment.kontakDriver ? `(${shipment.kontakDriver})` : ''}</span>
              </div>
              {shipment.noResi && (
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <span className="text-slate-500">No. Resi / DO</span>
                  <span className="col-span-2 font-mono text-slate-700">: {shipment.noResi}</span>
                </div>
              )}
            </div>

            {/* Right Info: Rute & Lokasi Proyek */}
            <div className="space-y-1.5 pl-1">
              <div className="text-[11px] font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>RUTE &amp; TUJUAN PROYEK SPBJ</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Tanggal Kirim</span>
                <span className="col-span-2 font-bold text-slate-800">: {formatDateIndo(shipment.tanggalKirim)}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Asal Gudang</span>
                <span className="col-span-2 text-slate-800">: {shipment.asalGudang}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Lokasi Tujuan</span>
                <span className="col-span-2 font-bold text-slate-900">: {shipment.lokasiTujuan}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Pekerjaan</span>
                <span className="col-span-2 font-medium text-slate-800">: {shipment.pekerjaan}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">No. SPBJ</span>
                <span className="col-span-2 font-mono text-slate-700">: {shipment.noSPBJ}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className="text-slate-500">Penerima Lapangan</span>
                <span className="col-span-2 font-bold text-slate-800">: {shipment.penerimaNama || '-'} {shipment.penerimaKontak ? `(${shipment.penerimaKontak})` : ''}</span>
              </div>
            </div>
          </div>

          {/* Table 1: Material Distribusi Utama (MDU) */}
          {mduItems.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  A. MATERIAL DISTRIBUSI UTAMA (MDU) - STANDAR PLN
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  {mduItems.length} Item
                </span>
              </div>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-amber-50 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 px-2.5 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-28">Kode Material</th>
                    <th className="border border-slate-300 px-2.5 py-1.5">Nama &amp; Spesifikasi Material</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-16 text-center">Jumlah</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-16 text-center">Satuan</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-32">Kondisi Barang</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-36">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {mduItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[10px]">{item.kodeMaterial}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5">
                        <div className="font-bold text-slate-900">{item.namaMaterial}</div>
                        {item.spesifikasi && (
                          <div className="text-[10px] text-slate-500">{item.spesifikasi}</div>
                        )}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-black text-slate-900">{item.jumlah}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center uppercase">{item.satuan}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5">{item.kondisi || 'Baik'}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-[10px] text-slate-600">{item.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table 2: Material Non-MDU */}
          {nonMduItems.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  B. MATERIAL NON-MDU &amp; AKSESORIS KELISTRIKAN
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  {nonMduItems.length} Item
                </span>
              </div>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-blue-50 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 px-2.5 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-28">Kode Material</th>
                    <th className="border border-slate-300 px-2.5 py-1.5">Nama &amp; Spesifikasi Material</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-16 text-center">Jumlah</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-16 text-center">Satuan</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-32">Kondisi Barang</th>
                    <th className="border border-slate-300 px-2.5 py-1.5 w-36">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {nonMduItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[10px]">{item.kodeMaterial}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5">
                        <div className="font-bold text-slate-900">{item.namaMaterial}</div>
                        {item.spesifikasi && (
                          <div className="text-[10px] text-slate-500">{item.spesifikasi}</div>
                        )}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-black text-slate-900">{item.jumlah}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center uppercase">{item.satuan}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5">{item.kondisi || 'Baik'}</td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-[10px] text-slate-600">{item.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Catatan Khusus */}
          {shipment.catatanPengiriman && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-[11px]">
              <span className="font-bold text-slate-800">Catatan Pengiriman: </span>
              <span className="text-slate-600">{shipment.catatanPengiriman}</span>
            </div>
          )}

          {/* Signature / Tanda Tangan 4 Pihak */}
          <div className="mt-8 pt-4 border-t border-slate-300">
            <p className="text-[10px] text-slate-500 text-center mb-4">
              Barang-barang tersebut di atas telah diserahkan dalam keadaan lengkap dan baik sesuai spesifikasi yang dipersyaratkan.
            </p>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              {/* 1. Pengirim / Logistik */}
              <div className="space-y-12">
                <div>
                  <p className="font-bold text-slate-800">Yang Menyerahkan,</p>
                  <p className="text-slate-500">Bagian Logistik PT SMK</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">{shipment.pemberiPerintah || 'Handoko Prasetyo'}</p>
                  <p className="text-slate-500">Logistik ME</p>
                </div>
              </div>

              {/* 2. Driver / Ekspedisi */}
              <div className="space-y-12">
                <div>
                  <p className="font-bold text-slate-800">Pengemudi / Driver,</p>
                  <p className="text-slate-500">{shipment.namaEkspedisi}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">{shipment.namaDriver}</p>
                  <p className="text-slate-500">{shipment.nomorPolisi}</p>
                </div>
              </div>

              {/* 3. Penerima Lapangan */}
              <div className="space-y-12">
                <div>
                  <p className="font-bold text-slate-800">Yang Menerima,</p>
                  <p className="text-slate-500">Mandor / Pelaksana Lapangan</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">{shipment.penerimaNama || '............................'}</p>
                  <p className="text-slate-500">Pelaksana Pekerjaan</p>
                </div>
              </div>

              {/* 4. Pengawas Lapangan */}
              <div className="space-y-12">
                <div>
                  <p className="font-bold text-slate-800">Mengetahui,</p>
                  <p className="text-slate-500">Direksi Pengawas Lapangan PLN</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">............................</p>
                  <p className="text-slate-500">Pengawas K3 &amp; ME PLN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
