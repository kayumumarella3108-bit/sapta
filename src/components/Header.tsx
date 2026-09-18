import React from 'react';
import {
  Zap,
  Plus,
  Download,
  Printer,
  ShieldCheck,
  FileUp,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';
import type { User } from 'firebase/auth';

interface HeaderProps {
  onAddProject: () => void;
  onImportSPBJ: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  currentUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  isCloudConnected?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddProject,
  onImportSPBJ,
  onExportCSV,
  onPrintReport,
  currentUser = null,
  onLogin,
  onLogout,
  isCloudConnected = true,
  onToggleMobileSidebar,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Left: Mobile Menu Trigger + Brand & Title */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
                title="Buka Menu Navigasi"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-4 ring-amber-100 shrink-0">
              <Zap className="w-5 h-5 fill-white stroke-white" />
            </div>

            {/* Title & Subtitle */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  Divisi Mechanical Electrical PT Sapta Manunggal Karya
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <ShieldCheck className="w-3 h-3" />
                  K3 &amp; SPBJ System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Monitoring SPBJ, Timeline, Rencana Kerja, Material &amp; Mandor &bull; {formatDateIndo(today)}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Authentication */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Action: Tambah Proyek Manual */}
            <button
              onClick={onAddProject}
              className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs transition-colors cursor-pointer"
              title="Tambah Pekerjaan SPBJ Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Proyek</span>
            </button>

            {/* Quick Action: Import SPBJ */}
            <button
              onClick={onImportSPBJ}
              className="hidden lg:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow-2xs transition-colors cursor-pointer"
              title="Import Berkas SPBJ / RAB (PDF)"
            >
              <FileUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Import SPBJ</span>
            </button>

            {/* Quick Action: Excel */}
            <button
              onClick={onExportCSV}
              className="hidden xl:inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Excel</span>
            </button>

            {/* Quick Action: Cetak Laporan */}
            <button
              onClick={onPrintReport}
              className="hidden xl:inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Cetak Dokumen Laporan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak</span>
            </button>

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

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
              <span className="hidden sm:inline">{isCloudConnected ? 'Cloud Aktif' : 'Sync...'}</span>
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
                <span className="font-medium max-w-[100px] sm:max-w-[120px] truncate" title={currentUser.displayName || currentUser.email || 'User'}>
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
                <span className="hidden sm:inline">Masuk Google</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
