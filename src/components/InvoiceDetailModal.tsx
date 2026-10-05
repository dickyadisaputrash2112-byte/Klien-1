import React from 'react';
import { 
  X, 
  Download, 
  Mail, 
  Printer, 
  CheckCircle2, 
  Building2, 
  Edit3, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { Invoice, BimbelConfig } from '../types/bimbel';
import { formatIDR } from '../services/storage';
import { StatusBadge } from './Dashboard';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  config: BimbelConfig;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  config,
  isOpen,
  onClose,
  onDownloadPDF,
  onSendEmail,
  onEditInvoice,
  onMarkPaid,
}) => {
  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === 'LUNAS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-3xl w-full my-6 overflow-hidden">
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-slate-200">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && (
              <button
                onClick={() => onMarkPaid(invoice.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Konfirmasi Lunas</span>
              </button>
            )}

            <button
              onClick={() => onDownloadPDF(invoice)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors border border-slate-700"
              title="Unduh format PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={() => onSendEmail(invoice)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors border border-slate-700"
              title="Kirim Bukti Pembayaran ke Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Email</span>
            </button>

            <button
              onClick={() => onEditInvoice(invoice)}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
              title="Edit Data Faktur"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
              title="Cetak Berkas"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Layout */}
        <div className="p-6 sm:p-8 bg-slate-100/60 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded border border-slate-300 shadow-xs space-y-6 text-slate-900">
            {/* Header Bimbel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b-2 border-slate-800 gap-4">
              <div>
                <h1 className="text-xl font-bold font-serif tracking-tight text-slate-900 uppercase">
                  {config.institutionName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">{config.tagline}</p>
                <p className="text-[11px] text-slate-500">{config.address}, {config.city} &bull; Telp: {config.phone}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  {isPaid ? 'Kuitansi & Tanda Bukti Kas' : 'Faktur Tagihan Siswa'}
                </span>
                <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-[11px] text-slate-500 block">Tanggal: {invoice.issueDate}</span>
              </div>
            </div>

            {/* Two Column Grid: Detail Tagihan & Data Siswa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Data Siswa &amp; Program
                </span>
                <div className="text-sm font-bold text-slate-900">{invoice.studentName}</div>
                <div className="text-slate-700 font-medium">Program: {invoice.programName}</div>
                <div className="text-slate-600">Wali: {invoice.parentName} ({invoice.parentPhone})</div>
                <div className="text-slate-500 font-mono">{invoice.studentEmail}</div>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Status Pembayaran
                </span>
                <div className="flex sm:justify-end">
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="text-slate-600">Jatuh Tempo: <strong>{invoice.dueDate}</strong></div>
                {invoice.paymentDate && (
                  <div className="text-emerald-800">Tanggal Bayar: <strong>{invoice.paymentDate}</strong></div>
                )}
                {invoice.paymentMethod && (
                  <div className="text-slate-600">Metode: {invoice.paymentMethod.replace('_', ' ')}</div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Rincian Biaya / Layanan</th>
                    <th className="py-2.5 px-3 text-center">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatIDR(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatIDR(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Box */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
              {/* Payment Instructions */}
              <div className="text-xs space-y-1 text-slate-600 max-w-sm">
                <span className="font-bold text-slate-800 block">Rekening Resmi Pembayaran Bimbel:</span>
                {config.bankAccounts.slice(0, 3).map((acc) => (
                  <p key={acc.bank} className="text-[11px]">
                    &bull; {acc.bank}: <strong>{acc.accountNumber}</strong> (a.n {acc.accountHolder})
                  </p>
                ))}
                {invoice.notes && (
                  <p className="italic text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                    Catatan: {invoice.notes}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon ({invoice.discountReason || 'Promo'}):</span>
                    <span className="font-mono font-semibold">- {formatIDR(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-base">{formatIDR(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Kas Diterima:</span>
                  <span className="font-mono">{formatIDR(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600 pt-1 border-t border-slate-100">
                  <span>Sisa Tagihan:</span>
                  <span className="font-mono">{formatIDR(invoice.remainingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Official Signature Section */}
            <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                {isPaid && (
                  <div className="inline-block p-2 border-2 border-emerald-600 rounded-lg text-emerald-700 font-bold text-center tracking-wider text-xs">
                    TERVERIFIKASI LUNAS
                    <div className="text-[9px] font-normal text-slate-500">{invoice.paymentDate}</div>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-slate-500">{config.city.split(',')[0]}, {invoice.issueDate}</p>
                <p className="text-slate-600 font-semibold">{config.financeHeadTitle}</p>
                <div className="h-12 flex items-center justify-end">
                  <span className="font-mono text-slate-400 text-[10px] italic">[Tanda Tangan Digital Terotorisasi]</span>
                </div>
                <p className="font-bold text-slate-900">{config.financeHeadName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>
            {invoice.lastEmailSentAt
              ? `Email notifikasi terakhir dikirim: ${new Date(invoice.lastEmailSentAt).toLocaleString('id-ID')}`
              : 'Belum ada notifikasi email yang dikirim untuk invoice ini.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
