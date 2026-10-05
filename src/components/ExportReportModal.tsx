import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Filter,
  Layers
} from 'lucide-react';
import { Invoice, BimbelConfig } from '../types/bimbel';
import { exportFinancialReportExcel } from '../services/excelExport';
import { exportFinancialReportPDF } from '../services/pdfExport';
import { syncReportToGoogleSheets, GoogleSheetsSyncResult } from '../services/sheetsService';
import { googleSignIn, getAccessToken } from '../services/auth';
import { formatIDR } from '../services/storage';

interface ExportReportModalProps {
  invoices: Invoice[];
  config: BimbelConfig;
  isOpen: boolean;
  onClose: () => void;
  googleUser: any | null;
  onGoogleConnected: (user: any) => void;
  onSuccessToast: (title: string, desc?: string) => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  invoices,
  config,
  isOpen,
  onClose,
  googleUser,
  onGoogleConnected,
  onSuccessToast,
}) => {
  const [periodPreset, setPeriodPreset] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'ALL'>('THIS_MONTH');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LUNAS' | 'UNPAID'>('ALL');
  const [programFilter, setProgramFilter] = useState<string>('ALL');

  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetResult, setSheetResult] = useState<GoogleSheetsSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const uniquePrograms = Array.from(new Set(invoices.map((i) => i.programName)));

  // Filter invoices based on options
  const filteredInvoices = invoices.filter((inv) => {
    let matchStatus = true;
    if (statusFilter === 'LUNAS') matchStatus = inv.status === 'LUNAS';
    if (statusFilter === 'UNPAID') matchStatus = inv.status !== 'LUNAS';

    let matchProgram = true;
    if (programFilter !== 'ALL') matchProgram = inv.programName === programFilter;

    return matchStatus && matchProgram;
  });

  const periodTitle = {
    THIS_MONTH: 'Bulan Oktober 2026',
    LAST_MONTH: 'Bulan September 2026',
    THIS_QUARTER: 'Kuartal IV 2026',
    ALL: 'Semua Periode Tahun Ajaran 2026-2027',
  }[periodPreset];

  const totalBilled = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceived = filteredInvoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivable = filteredInvoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);

  // 1. Export Excel
  const handleExportExcel = () => {
    try {
      exportFinancialReportExcel(filteredInvoices, periodTitle, config);
      onSuccessToast('Ekspor Excel Berhasil', `File laporan .xlsx (${periodTitle}) telah tersimpan di komputer Anda.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengekspor file Excel');
    }
  };

  // 2. Export PDF
  const handleExportPDF = () => {
    try {
      exportFinancialReportPDF(filteredInvoices, periodTitle, config);
      onSuccessToast('Ekspor PDF Berhasil', `Dokumen laporan keuangan resmi (${periodTitle}) telah diunduh.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengekspor file PDF');
    }
  };

  // 3. Sync to Google Sheets
  const handleSyncGoogleSheets = async () => {
    setIsExportingSheets(true);
    setErrorMessage('');
    setSheetResult(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (res && res.user) {
          onGoogleConnected(res.user);
          token = res.accessToken;
        } else {
          throw new Error('Autentikasi akun Google diperlukan untuk sinkronisasi Google Sheets.');
        }
      }

      const result = await syncReportToGoogleSheets(filteredInvoices, periodTitle, config);
      setSheetResult(result);
      onSuccessToast('Google Sheets Tersinkronisasi', `Spreadsheet baru "${result.title}" berhasil dibuat!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Gagal menyinkronkan data ke Google Sheets');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-2xl w-full my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Download className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Penerbitan &amp; Ekspor Laporan Keuangan</h2>
              <p className="text-xs text-slate-400">
                Pilih format keluaran PDF, Microsoft Excel (.xlsx), atau sinkronisasi Google Sheets
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Google Sheets Card */}
          {sheetResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Dokumen Google Sheets Berhasil Dibuat!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Data keuangan telah disinkronkan ke akun Google Workspace Anda dengan nama:
                <br />
                <strong className="font-mono text-emerald-950">{sheetResult.title}</strong>
              </p>
              <a
                href={sheetResult.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium shadow-xs transition-colors"
              >
                <span>Buka Lembar Kerja Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-300 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-700" />
              <span>Parameter &amp; Batasan Data yang Diekspor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Periode Pembukuan:</label>
                <select
                  value={periodPreset}
                  onChange={(e) => setPeriodPreset(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800"
                >
                  <option value="THIS_MONTH">Bulan Berjalan (Oktober 2026)</option>
                  <option value="LAST_MONTH">Bulan Sebelumnya (September 2026)</option>
                  <option value="THIS_QUARTER">Kuartal IV 2026</option>
                  <option value="ALL">Seluruh Periode 2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status Pembayaran:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
                >
                  <option value="ALL">Semua Faktur (Lunas &amp; Piutang)</option>
                  <option value="LUNAS">Khusus Realisasi Lunas</option>
                  <option value="UNPAID">Khusus Piutang Belum Tertagih</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Program Studi:</label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
                >
                  <option value="ALL">Semua Program Bimbingan</option>
                  {uniquePrograms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics of selection */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 block">Berkas Faktur:</span>
                <span className="font-bold text-slate-900 font-mono">{filteredInvoices.length} Faktur</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Omset:</span>
                <span className="font-bold font-mono text-slate-900">{formatIDR(totalBilled)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Kas Masuk:</span>
                <span className="font-bold font-mono text-emerald-800">{formatIDR(totalReceived)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Sisa Piutang:</span>
                <span className="font-bold font-mono text-rose-700">{formatIDR(totalReceivable)}</span>
              </div>
            </div>
          </div>

          {/* Export Options Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pilihan Format Keluaran Dokumen:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Excel */}
              <div className="p-4 rounded border border-slate-300 bg-white flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                  </div>
                  <h4 className="text-xs font-bold font-serif text-slate-900">
                    Microsoft Excel (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Format multi-sheet: Ringkasan Eksekutif, Buku Invoice Detail, &amp; Rekapitulasi Piutang.
                  </p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="mt-4 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Unduh File Excel</span>
                </button>
              </div>

              {/* Option 2: PDF */}
              <div className="p-4 rounded border border-slate-300 bg-white flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-2.5">
                    <FileText className="w-4 h-4 text-slate-800" />
                  </div>
                  <h4 className="text-xs font-bold font-serif text-slate-900">
                    Dokumen PDF Resmi
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Laporan keuangan lanskap standar audit dengan tabel arus kas dan lembar pengesahan bendahara.
                  </p>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="mt-4 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Unduh Dokumen PDF</span>
                </button>
              </div>

              {/* Option 3: Google Sheets */}
              <div className="p-4 rounded border border-slate-300 bg-white flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-2.5">
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold font-serif text-slate-900">
                    Google Sheets Cloud
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Sinkronisasi berkala ke akun spreadsheet Google Drive biro keuangan institusi.
                  </p>
                </div>
                <button
                  onClick={handleSyncGoogleSheets}
                  disabled={isExportingSheets}
                  className="mt-4 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isExportingSheets ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                      <span>Sinkronkan ke Cloud</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-medium transition-colors"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
