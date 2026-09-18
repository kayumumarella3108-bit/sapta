import React from 'react';
import { Zap, Plus, Download, Printer, RotateCcw, ShieldCheck, FileUp, PackagePlus, Database, Cloud, CloudCheck, LogIn, LogOut, User as UserIcon, Truck, HardHat, Calendar } from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';
import type { User } from 'firebase/auth';

interface HeaderProps {
  onAddProject: () => void;
  onImportSPBJ: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onResetData: () => void;
  onOpenMaterialRequests?: () => void;
  onOpenMasterMaterials?: () => void;
  onOpenMaterialShipments?: () => void;
  onOpenForemen?: () => void;
  onOpenWorkPlans?: () => void;
  totalProjects: number;
  totalMaterialRequests?: number;
  totalMasterMaterials?: number;
  totalMaterialShipments?: number;
  totalForemen?: number;
  totalWorkPlans?: number;
  currentUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onAddProject,
  onImportSPBJ,
  onExportCSV,
  onPrintReport,
  onResetData,
  onOpenMaterialRequests,
  onOpenMasterMaterials,
  onOpenMaterialShipments,
  onOpenForemen,
  onOpenWorkPlans,
  totalProjects,
  totalMaterialRequests = 0,
  totalMasterMaterials = 0,
  totalMaterialShipments = 0,
  totalForemen = 0,
  totalWorkPlans = 0,
  currentUser = null,
  onLogin,
  onLogout,
  isCloudConnected = true,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="sticky top-0 z-30 shadow-xs">
      {/* 1. Main Header Bar (Brand, Title, Status & Auth) */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-4 ring-amber-100 shrink-0">
                <Zap className="w-5 h-5 fill-white stroke-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                    Divisi Mechanical Electrical PT Sapta Manunggal Karya
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" />
                    K3 &amp; SPBJ System
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoring Harian Proyek, Progres Fisik, Nilai Kontrak SPBJ, PIC, Mandor &amp; Alokasi Manpower &bull; {formatDateIndo(today)}
                </p>
              </div>
            </div>

            {/* Top Right: Cloud Status & User Authentication */}
            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              {/* Firebase Cloud Status Indicator */}
              <span
                id="firebase-cloud-status"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isCloudConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={isCloudConnected ? 'Database Firestore Terhubung Real-Time' : 'Sedang Menghubungkan ke Cloud...'}
              >
                <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <Cloud className="w-3 h-3" />
                <span className="hidden sm:inline">{isCloudConnected ? 'Firebase Cloud Aktif' : 'Menghubungkan...'}</span>
              </span>

              {/* Google Authentication Pill */}
              {currentUser ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-5 h-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="font-medium max-w-[120px] truncate" title={currentUser.displayName || currentUser.email || 'User'}>
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  {onLogout && (
                    <button
                      id="btn-logout"
                      onClick={onLogout}
                      className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                      title="Keluar dari akun Google"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : onLogin ? (
                <button
                  id="btn-google-login"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Masuk dengan akun Google untuk sinkronisasi cloud Firebase"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-500" />
                  <span>Masuk Google</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Action Toolbar Strip (Berada di Bawah Header) */}
      <div id="header-action-toolbar" className="bg-slate-50/95 border-b border-slate-200/90 backdrop-blur-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Left Group: Material & Logistik */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Master Data MDU & Non-MDU Button */}
              {onOpenMasterMaterials && (
                <button
                  id="btn-master-material"
                  onClick={onOpenMasterMaterials}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Kelola Master Data Material MDU dan Non-MDU Standar PLN"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>Master MDU &amp; Non-MDU</span>
                  {totalMasterMaterials > 0 && (
                    <span className="text-[10px] bg-slate-800 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {totalMasterMaterials}
                    </span>
                  )}
                </button>
              )}

              {/* Permintaan MDU & Non-MDU Button */}
              {onOpenMaterialRequests && (
                <button
                  id="btn-permintaan-mdu"
                  onClick={onOpenMaterialRequests}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
                  title="Kelola Formulir Rincian Kebutuhan MDU dan Non-MDU"
                >
                  <PackagePlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kebutuhan Material</span>
                  {totalMaterialRequests > 0 && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                      {totalMaterialRequests}
                    </span>
                  )}
                </button>
              )}

              {/* Pengiriman Material (Ekspedisi & Surat Jalan) Button */}
              {onOpenMaterialShipments && (
                <button
                  id="btn-pengiriman-material"
                  onClick={onOpenMaterialShipments}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs transition-colors cursor-pointer"
                  title="Kelola Pengiriman Material, Ekspedisi, Armada & Surat Jalan"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pengiriman Material</span>
                  {totalMaterialShipments > 0 && (
                    <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {totalMaterialShipments}
                    </span>
                  )}
                </button>
              )}

              {/* Daftar Mandor (Multi-Lokasi & PIC) Button */}
              {onOpenForemen && (
                <button
                  id="btn-daftar-mandor"
                  onClick={onOpenForemen}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Kelola Daftar Mandor, Penugasan Multi-Lokasi & PIC Pengawas"
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Daftar Mandor</span>
                  {totalForemen > 0 && (
                    <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-1.5 py-0.5 rounded-full">
                      {totalForemen}
                    </span>
                  )}
                </button>
              )}

              {/* Rencana Kerja (Work Plan) Button */}
              {onOpenWorkPlans && (
                <button
                  id="btn-rencana-kerja"
                  onClick={onOpenWorkPlans}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border border-amber-600 shadow-2xs transition-colors cursor-pointer"
                  title="Kelola Rencana Kerja Lapangan, Tanggal, Lokasi, PIC, Mandor & Uraian Pekerjaan"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-950" />
                  <span>Rencana Kerja</span>
                  {totalWorkPlans > 0 && (
                    <span className="text-[10px] bg-slate-950 text-amber-300 font-black px-1.5 py-0.5 rounded-full">
                      {totalWorkPlans}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Right Group: Proyek Baru, Import, Export, Cetak, Reset */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Import SPBJ / RAB PDF Button */}
              <button
                id="btn-import-spbj"
                onClick={onImportSPBJ}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow-2xs transition-colors cursor-pointer"
                title="Import dan konversi berkas PDF dokumen SPBJ atau RAB menjadi data proyek"
              >
                <FileUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Import SPBJ / RAB (PDF)</span>
              </button>

              {/* Tambah Manual Button */}
              <button
                id="btn-tambah-pekerjaan"
                onClick={onAddProject}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Manual</span>
              </button>

              <div className="hidden sm:block h-5 w-px bg-slate-200" />

              {/* Excel Export Button */}
              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Download data tabel dalam format spreadsheet Excel (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Excel</span>
              </button>

              {/* Cetak / Laporan Button */}
              <button
                id="btn-cetak-laporan"
                onClick={onPrintReport}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Buka pratinjau, cetak atau unduh dokumen laporan SPBJ"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Laporan &amp; Cetak</span>
              </button>

              {/* Reset Data Button */}
              <button
                id="btn-reset-data"
                onClick={onResetData}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Muat Ulang Data Contoh Standar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
