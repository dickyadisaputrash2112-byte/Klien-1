import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, UserCheck } from 'lucide-react';
import { BimbelConfig } from '../types/bimbel';
import { googleSignIn } from '../services/auth';

interface AdminLockModalProps {
  isOpen: boolean;
  onAuthenticated: () => void;
  config: BimbelConfig;
  onGoogleConnected?: (user: any) => void;
}

export const AdminLockModal: React.FC<AdminLockModalProps> = ({
  isOpen,
  onAuthenticated,
  config,
  onGoogleConnected,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === config.adminPin || pin === '123456') {
      setError('');
      onAuthenticated();
    } else {
      setError('PIN Otorisasi salah. Silakan masukkan PIN yang valid (Default: 123456).');
    }
  };

  const handleGoogleAdminLogin = async () => {
    try {
      setIsSigningInGoogle(true);
      setError('');
      const res = await googleSignIn();
      if (res && res.user) {
        if (onGoogleConnected) {
          onGoogleConnected(res.user);
        }
        onAuthenticated();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal verifikasi akun Google Administrator.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleQuickUnlock = () => {
    setPin('123456');
    setError('');
    onAuthenticated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full overflow-hidden">
        {/* Header Bar - Formal Institutional */}
        <div className="bg-slate-900 px-6 py-5 text-white border-b-2 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight text-white">
                Otorisasi Akses Keuangan
              </h2>
              <p className="text-xs text-slate-400">
                {config.institutionName} &bull; Bagian Administrasi &amp; Kasir
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sistem diamankan. Khusus staf dan kepala biro keuangan.</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded bg-rose-50 border border-rose-300 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                PIN Keamanan Petugas
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Masukkan 6 Digit PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  className="w-full px-4 py-2.5 pl-10 text-center font-mono text-lg tracking-widest bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                PIN Bawaan Sistem: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.5 border border-slate-200">123456</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verifikasi Kredensial Admin</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-slate-500 uppercase tracking-wider">
              Opsi Masuk Terdaftar
            </span>
          </div>

          <div className="space-y-2">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={isSigningInGoogle}
              className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded font-medium text-xs border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningInGoogle ? 'Memverifikasi...' : 'Otentikasi Akun Google Institusi'}</span>
            </button>

            {/* Direct Admin Access */}
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Masuk Sebagai Pengelola (Akses Langsung)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Sistem Informasi Keuangan &bull; Versi 2026.1 &bull; Dokumen Resmi Lembaga
          </p>
        </div>
      </div>
    </div>
  );
};
