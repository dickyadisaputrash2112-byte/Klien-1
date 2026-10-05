import React from 'react';
import { 
  Landmark, 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  Lock, 
  LogOut, 
  Plus 
} from 'lucide-react';
import { BimbelConfig } from '../types/bimbel';

export type NavTab = 'dashboard' | 'invoices' | 'students' | 'reports';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  config: BimbelConfig;
  googleUser: any | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onOpenSettings: () => void;
  onLockAdmin: () => void;
  openCreateInvoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  googleUser,
  onConnectGoogle,
  onDisconnectGoogle,
  onOpenSettings,
  onLockAdmin,
  openCreateInvoice,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Landmark className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight text-white">
                  {config.institutionName}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                  Biro Keuangan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-sm">
                Sistem Penagihan, Administrasi SPP &amp; Pembukuan
              </p>
            </div>
          </div>

          {/* Action Tools & Integration Status */}
          <div className="flex items-center gap-2">
            {/* Google Workspace Connection Pill */}
            {googleUser ? (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[140px]">
                  {googleUser.email}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold border-l border-slate-700 pl-2">
                  Sheets &amp; Gmail Aktif
                </span>
                <button
                  onClick={onDisconnectGoogle}
                  title="Putuskan sambungan Google"
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectGoogle}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Hubungkan Google Sheets dan Gmail untuk ekspor langsung"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Integrasi Workspace</span>
              </button>
            )}

            {/* Buat Tagihan Baru Button */}
            <button
              onClick={openCreateInvoice}
              className="px-3 py-1.5 rounded bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Terbitkan Tagihan</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Pengaturan Lembaga &amp; Rekening"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Lock Admin Session */}
            <button
              onClick={onLockAdmin}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 transition-colors border border-slate-700"
              title="Kunci Akses Petugas"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 border-t border-slate-800 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Keuangan</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors shrink-0 ${
              activeTab === 'invoices'
                ? 'bg-slate-800 text-white font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Buku Faktur &amp; Invoice</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors shrink-0 ${
              activeTab === 'students'
                ? 'bg-slate-800 text-white font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Siswa &amp; Program</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors shrink-0 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Laporan Keuangan (PDF, Excel, Sheets)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
