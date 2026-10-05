import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Invoice, InvoiceStatus, BimbelConfig } from '../types/bimbel';
import { formatIDR } from '../services/storage';
import { StatusBadge } from './Dashboard';

interface InvoiceListProps {
  invoices: Invoice[];
  config: BimbelConfig;
  initialFilter?: string;
  onOpenCreateModal: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDownloadInvoicePDF: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  config,
  initialFilter,
  onOpenCreateModal,
  onViewInvoice,
  onDownloadInvoicePDF,
  onSendEmail,
  onDeleteInvoice,
  onExportExcel,
  onExportPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'ALL');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique programs for filter dropdown
  const uniquePrograms = Array.from(new Set(invoices.map((i) => i.programName)));

  // Filtered invoices
  const filtered = invoices.filter((inv) => {
    // Search match
    const query = searchTerm.toLowerCase();
    const matchSearch =
      inv.studentName.toLowerCase().includes(query) ||
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.parentName.toLowerCase().includes(query) ||
      inv.studentEmail.toLowerCase().includes(query) ||
      inv.programName.toLowerCase().includes(query);

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'LUNAS') matchStatus = inv.status === 'LUNAS';
    else if (statusFilter === 'UNPAID') matchStatus = inv.status === 'MENUNGGU_PEMBAYARAN' || inv.status === 'CICILAN';
    else if (statusFilter === 'JATUH_TEMPO') matchStatus = inv.status === 'JATUH_TEMPO';
    else if (statusFilter === 'CICILAN') matchStatus = inv.status === 'CICILAN';

    // Program filter
    let matchProgram = true;
    if (programFilter !== 'ALL') {
      matchProgram = inv.programName === programFilter;
    }

    return matchSearch && matchStatus && matchProgram;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
              Buku Register Faktur &amp; Tagihan Siswa
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Daftar rekapitulasi seluruh faktur SPP, modul bimbingan, ujian tryout, dan bukti verifikasi pembayaran.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition-colors"
              title="Unduh format Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition-colors"
              title="Unduh Dokumen Laporan PDF"
            >
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              <span>Laporan PDF</span>
            </button>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Terbitkan Faktur Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-3 border-t border-slate-200">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama siswa, nomor faktur, NIS, atau wali..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'ALL', label: 'Semua Faktur' },
              { id: 'LUNAS', label: 'Lunas' },
              { id: 'UNPAID', label: 'Belum Lunas' },
              { id: 'JATUH_TEMPO', label: 'Jatuh Tempo' },
              { id: 'CICILAN', label: 'Cicilan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Program dropdown */}
          <div className="shrink-0">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
            >
              <option value="ALL">Semua Program Bimbel</option>
              {uniquePrograms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                  />
                </th>
                <th className="py-2.5 px-3">No. Faktur &amp; Tanggal</th>
                <th className="py-2.5 px-3">Nama Siswa &amp; Program</th>
                <th className="py-2.5 px-3">Orang Tua / Kontak</th>
                <th className="py-2.5 px-3 text-right">Nilai Faktur</th>
                <th className="py-2.5 px-3 text-right">Terbayar</th>
                <th className="py-2.5 px-3 text-right">Sisa Piutang</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Notifikasi</th>
                <th className="py-2.5 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    <p className="text-xs font-semibold">Tidak ditemukan berkas faktur yang sesuai.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Silakan periksa kata kunci atau filter status.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const isChecked = selectedIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-slate-100/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(inv.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        <span className="font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                        <span className="text-[11px] text-slate-500">Terbit: {inv.issueDate}</span>
                        <span className="text-[10px] text-slate-400 block">Tempo: {inv.dueDate}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{inv.studentName}</div>
                        <div className="text-[11px] text-slate-600">{inv.programName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.studentEmail}</div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="font-medium text-slate-800">{inv.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inv.parentPhone}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatIDR(inv.totalAmount)}
                        {inv.discount > 0 && (
                          <span className="block text-[10px] text-emerald-800 font-normal">
                            Potongan {formatIDR(inv.discount)}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-800">
                        {formatIDR(inv.amountPaid)}
                        {inv.paymentMethod && (
                          <span className="block text-[10px] text-slate-500 uppercase font-sans">
                            {inv.paymentMethod.replace('TRANSFER_', '').replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={inv.remainingAmount > 0 ? 'text-rose-700' : 'text-slate-400'}>
                          {formatIDR(inv.remainingAmount)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {inv.lastEmailSentAt ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300"
                            title={`Terkirim: ${new Date(inv.lastEmailSentAt).toLocaleString('id-ID')}`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Terkirim</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Unduh PDF Individual */}
                          <button
                            onClick={() => onDownloadInvoicePDF(inv)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Unduh Kuitansi PDF Resmi"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Kirim Email Notifikasi Real-time */}
                          <button
                            onClick={() => onSendEmail(inv)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Kirimkan Bukti Pembayaran ke Email Siswa/Wali"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Modal */}
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Periksa Rincian Faktur"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus */}
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Hapus Faktur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Menampilkan <span className="font-semibold text-slate-900">{filtered.length}</span> dari{' '}
            <span className="font-semibold text-slate-900">{invoices.length}</span> total faktur
            {selectedIds.length > 0 && ` (${selectedIds.length} faktur ditandai)`}
          </div>

          <div className="flex items-center gap-3">
            <span>
              Total Nilai Register:{' '}
              <strong className="text-slate-900 font-mono">
                {formatIDR(filtered.reduce((acc, i) => acc + i.totalAmount, 0))}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
