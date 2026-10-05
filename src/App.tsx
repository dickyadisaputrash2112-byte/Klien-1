import React, { useState, useEffect } from 'react';
import { 
  getStoredInvoices, 
  saveStoredInvoices, 
  getStoredStudents, 
  saveStoredStudents, 
  getStoredConfig, 
  saveStoredConfig, 
  isAdminAuthenticated, 
  setAdminAuthenticated 
} from './services/storage';
import { initAuth, googleSignIn, logoutGoogle } from './services/auth';
import { Invoice, Student, BimbelConfig } from './types/bimbel';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { StudentManagement } from './components/StudentManagement';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { EmailReceiptModal } from './components/EmailReceiptModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminLockModal } from './components/AdminLockModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { exportInvoicePDF, exportFinancialReportPDF } from './services/pdfExport';
import { exportFinancialReportExcel } from './services/excelExport';

export default function App() {
  // Persistence state
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [config, setConfig] = useState<BimbelConfig>(getStoredConfig);

  // Admin Access Security state (Admin Guard)
  const [adminAuth, setAdminAuth] = useState<boolean>(isAdminAuthenticated);

  // Google Workspace Integration State
  const [googleUser, setGoogleUser] = useState<any | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);

  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [emailModalInvoice, setEmailModalInvoice] = useState<Invoice | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toasts feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth state listener for Firebase / Google
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, _token) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync state to LocalStorage
  const updateInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    saveStoredInvoices(newInvoices);
  };

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  const updateConfig = (newConfig: BimbelConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
  };

  // Admin lock/unlock
  const handleAdminUnlock = () => {
    setAdminAuth(true);
    setAdminAuthenticated(true);
    addToast('success', 'Akses Admin Terverifikasi', 'Selamat datang di panel administrasi keuangan bimbel.');
  };

  const handleAdminLock = () => {
    setAdminAuth(false);
    setAdminAuthenticated(false);
    addToast('info', 'Sesi Terkunci', 'Panel keuangan telah dikunci demi keamanan.');
  };

  // Google Workspace actions
  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        setGoogleUser(res.user);
        addToast(
          'success',
          'Google Workspace Terhubung',
          `Akun ${res.user.email} siap digunakan untuk Google Sheets dan Gmail.`
        );
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Gagal Menghubungkan Google', err?.message || 'Terjadi kesalahan autentikasi.');
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    addToast('info', 'Google Workspace Terputus', 'Sesi integrasi Google telah dikeluarkan.');
  };

  // Invoice Handlers
  const handleSaveInvoice = (invoiceData: Invoice) => {
    const exists = invoices.some((i) => i.id === invoiceData.id);
    let updated: Invoice[];
    if (exists) {
      updated = invoices.map((i) => (i.id === invoiceData.id ? invoiceData : i));
      addToast('success', 'Invoice Diperbarui', `Perubahan pada invoice #${invoiceData.invoiceNumber} berhasil disimpan.`);
    } else {
      updated = [invoiceData, ...invoices];
      addToast('success', 'Invoice Diterbitkan', `Invoice baru #${invoiceData.invoiceNumber} untuk ${invoiceData.studentName} berhasil dibuat.`);
    }
    updateInvoices(updated);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;
    if (window.confirm(`Hapus invoice ${target.invoiceNumber} (${target.studentName})? Tindakan ini tidak dapat dibatalkan.`)) {
      const updated = invoices.filter((i) => i.id !== invoiceId);
      updateInvoices(updated);
      addToast('info', 'Invoice Dihapus', `Invoice #${target.invoiceNumber} telah dihapus.`);
    }
  };

  const handleMarkPaid = (invoiceId: string) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'LUNAS' as const,
          amountPaid: inv.totalAmount,
          remainingAmount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: inv.paymentMethod || 'TRANSFER_BCA',
        };
      }
      return inv;
    });
    updateInvoices(updated);

    const paidInv = updated.find((i) => i.id === invoiceId);
    if (detailInvoice && detailInvoice.id === invoiceId && paidInv) {
      setDetailInvoice(paidInv);
    }
    addToast('success', 'Pembayaran Dikonfirmasi', 'Status tagihan telah diubah menjadi LUNAS.');
  };

  const handleDownloadInvoicePDF = (invoice: Invoice) => {
    try {
      exportInvoicePDF(invoice, config);
      addToast('success', 'Invoice PDF Diunduh', `Dokumen kuitansi #${invoice.invoiceNumber} berhasil disimpan.`);
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Gagal Mengunduh PDF', err?.message);
    }
  };

  const handleEmailSentSuccess = (invoiceId: string) => {
    const nowISO = new Date().toISOString();
    const updated = invoices.map((i) => (i.id === invoiceId ? { ...i, lastEmailSentAt: nowISO } : i));
    updateInvoices(updated);
    addToast('success', 'Email Terkirim', 'Bukti pembayaran resmi telah terkirim ke email penerima secara real-time.');
  };

  const handleCreateForStudent = (studentId: string) => {
    setPreselectedStudentId(studentId);
    setEditingInvoice(null);
    setIsCreateModalOpen(true);
  };

  const handleNavigateToInvoices = (statusFilter?: string) => {
    if (statusFilter) {
      setInvoiceStatusFilter(statusFilter);
    }
    setActiveTab('invoices');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Admin Screen Lock Modal (Protects all financial & invoice records) */}
      <AdminLockModal
        isOpen={!adminAuth}
        onAuthenticated={handleAdminUnlock}
        config={config}
        onGoogleConnected={(u) => setGoogleUser(u)}
      />

      {/* Main App Layout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        googleUser={googleUser}
        onConnectGoogle={handleConnectGoogle}
        onDisconnectGoogle={handleDisconnectGoogle}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLockAdmin={handleAdminLock}
        openCreateInvoice={() => {
          setEditingInvoice(null);
          setPreselectedStudentId(undefined);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            invoices={invoices}
            config={config}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onViewInvoice={(inv) => setDetailInvoice(inv)}
            onSendEmail={(inv) => setEmailModalInvoice(inv)}
            onDownloadInvoicePDF={handleDownloadInvoicePDF}
            onNavigateToInvoices={handleNavigateToInvoices}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            config={config}
            initialFilter={invoiceStatusFilter}
            onOpenCreateModal={() => {
              setEditingInvoice(null);
              setPreselectedStudentId(undefined);
              setIsCreateModalOpen(true);
            }}
            onViewInvoice={(inv) => setDetailInvoice(inv)}
            onDownloadInvoicePDF={handleDownloadInvoicePDF}
            onSendEmail={(inv) => setEmailModalInvoice(inv)}
            onDeleteInvoice={handleDeleteInvoice}
            onExportExcel={() => exportFinancialReportExcel(invoices, 'Bulan Ini (Oktober 2026)', config)}
            onExportPDF={() => exportFinancialReportPDF(invoices, 'Bulan Ini (Oktober 2026)', config)}
          />
        )}

        {activeTab === 'students' && (
          <StudentManagement
            students={students}
            onAddStudent={(newStd) => {
              updateStudents([newStd, ...students]);
              addToast('success', 'Siswa Didaftarkan', `${newStd.name} berhasil ditambahkan ke database.`);
            }}
            onCreateInvoiceForStudent={handleCreateForStudent}
            config={config}
          />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                  Pusat Ekspor Laporan Keuangan Institusi
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Ekspor otomatis ke format dokumen PDF resmi, Microsoft Excel (.xlsx), atau sinkronisasi langsung ke Google Sheets.
                </p>
              </div>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                Buka Opsi Filter &amp; Ekspor Lengkap
              </button>
            </div>

            {/* Quick Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Excel */}
              <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-3">
                    <span className="font-mono font-bold text-emerald-800 text-xs">XLS</span>
                  </div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">Format Microsoft Excel (.xlsx)</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Menghasilkan file spreadsheet dengan lembar terpisah: Ringkasan Eksekutif, Buku Penjualan Detail, dan Buku Piutang Siswa.
                  </p>
                </div>
                <button
                  onClick={() => {
                    exportFinancialReportExcel(invoices, 'Oktober 2026', config);
                    addToast('success', 'Excel Berhasil Diekspor', 'File .xlsx telah diunduh ke perangkat Anda.');
                  }}
                  className="mt-5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Ekspor File Excel (.xlsx)</span>
                </button>
              </div>

              {/* Card 2: PDF */}
              <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-3">
                    <span className="font-mono font-bold text-slate-800 text-xs">PDF</span>
                  </div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">Dokumen PDF Laporan Resmi</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Format cetak standar audit dengan kop resmi bimbel, kartu ringkasan arus kas masuk vs target, serta lembar verifikasi bendahara.
                  </p>
                </div>
                <button
                  onClick={() => {
                    exportFinancialReportPDF(invoices, 'Oktober 2026', config);
                    addToast('success', 'PDF Berhasil Dibuat', 'Dokumen laporan keuangan resmi telah diunduh.');
                  }}
                  className="mt-5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Unduh Dokumen PDF Resmi</span>
                </button>
              </div>

              {/* Card 3: Google Sheets */}
              <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">Google Sheets Cloud Sync</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Sinkronkan data transaksi dan pembukuan bimbel langsung ke Google Drive / Google Sheets institusi secara real-time.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="mt-5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Buka Dialog Sinkronisasi Sheets</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Dialogs */}
      {isCreateModalOpen && (
        <InvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingInvoice(null);
            setPreselectedStudentId(undefined);
          }}
          onSave={handleSaveInvoice}
          students={students}
          config={config}
          editingInvoice={editingInvoice}
          preselectedStudentId={preselectedStudentId}
        />
      )}

      {detailInvoice && (
        <InvoiceDetailModal
          isOpen={!!detailInvoice}
          invoice={detailInvoice}
          config={config}
          onClose={() => setDetailInvoice(null)}
          onDownloadPDF={handleDownloadInvoicePDF}
          onSendEmail={(inv) => setEmailModalInvoice(inv)}
          onEditInvoice={(inv) => {
            setDetailInvoice(null);
            setEditingInvoice(inv);
            setIsCreateModalOpen(true);
          }}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {emailModalInvoice && (
        <EmailReceiptModal
          isOpen={!!emailModalInvoice}
          invoice={emailModalInvoice}
          config={config}
          onClose={() => setEmailModalInvoice(null)}
          onSuccessSent={handleEmailSentSuccess}
          googleUser={googleUser}
          onGoogleConnected={(u) => setGoogleUser(u)}
        />
      )}

      {isExportModalOpen && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          invoices={invoices}
          config={config}
          onClose={() => setIsExportModalOpen(false)}
          googleUser={googleUser}
          onGoogleConnected={(u) => setGoogleUser(u)}
          onSuccessToast={(title, desc) => addToast('success', title, desc)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onSave={updateConfig}
          onSuccessToast={(title, desc) => addToast('success', title, desc)}
        />
      )}

      {/* Feedback Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
