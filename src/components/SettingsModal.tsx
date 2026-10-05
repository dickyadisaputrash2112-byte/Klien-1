import React, { useState } from 'react';
import { X, Save, Building2, UserCheck, CreditCard, Shield, RotateCcw } from 'lucide-react';
import { BimbelConfig } from '../types/bimbel';
import { DEFAULT_BIMBEL_CONFIG } from '../services/storage';

interface SettingsModalProps {
  config: BimbelConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: BimbelConfig) => void;
  onSuccessToast: (title: string, desc?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
  onSuccessToast,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<BimbelConfig>({ ...config });

  const handleChange = (field: keyof BimbelConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (idx: number, field: string, value: string) => {
    const updated = [...formData.bankAccounts];
    (updated[idx] as any)[field] = value;
    setFormData((prev) => ({ ...prev, bankAccounts: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onSuccessToast('Pengaturan Disimpan', 'Profil bimbel, rekening, dan data bendahara berhasil diperbarui.');
    onClose();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan semua profil dan rekening ke pengaturan bawaan Bimbel Cendekia Nusantara?')) {
      setFormData(DEFAULT_BIMBEL_CONFIG);
      onSave(DEFAULT_BIMBEL_CONFIG);
      onSuccessToast('Pengaturan Direset', 'Semua pengaturan telah dikembalikan ke default.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-2xl w-full my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-slate-700">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-200" />
            <div>
              <h2 className="text-base font-bold font-serif tracking-tight">Pengaturan Lembaga &amp; Keuangan Bimbel</h2>
              <p className="text-xs text-slate-400">
                Kelola profil lembaga, rekening pembayaran, identitas bendahara, dan otorisasi PIN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Section 1: Profil Lembaga */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-700" />
              <span>1. Identitas Resmi Bimbingan Belajar</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nama Lembaga Bimbel</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => handleChange('institutionName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Slogan / Tagline Lembaga</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor / Kampus</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota &amp; Kode Pos</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telepon / WhatsApp Layanan</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi Keuangan</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bendahara / Kepala Keuangan */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>2. Penanggung Jawab Keuangan (Untuk Tanda Tangan Dokumen)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.financeHeadName}
                  onChange={(e) => handleChange('financeHeadName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Resmi</label>
                <input
                  type="text"
                  required
                  value={formData.financeHeadTitle}
                  onChange={(e) => handleChange('financeHeadTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rekening Pembayaran */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-700" />
              <span>3. Rekening Resmi Pembayaran Bimbel</span>
            </h3>

            <div className="space-y-2">
              {formData.bankAccounts.map((acc, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-300">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nama Bank / Kanal</label>
                    <input
                      type="text"
                      value={acc.bank}
                      onChange={(e) => handleBankChange(idx, 'bank', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nomor Rekening / ID</label>
                    <input
                      type="text"
                      value={acc.accountNumber}
                      onChange={(e) => handleBankChange(idx, 'accountNumber', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={acc.accountHolder}
                      onChange={(e) => handleBankChange(idx, 'accountHolder', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: PIN Keamanan Admin */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>4. Keamanan Akses Portal Admin</span>
            </h3>

            <div className="max-w-xs">
              <label className="block font-semibold text-slate-700 mb-1">PIN Keamanan Admin (6 Digit)</label>
              <input
                type="password"
                maxLength={6}
                value={formData.adminPin}
                onChange={(e) => handleChange('adminPin', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-center tracking-widest text-base font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                PIN ini digunakan untuk membuka kunci sesi jika terkunci otomatis.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-medium text-xs text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
