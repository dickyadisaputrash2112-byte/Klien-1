import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Info 
} from 'lucide-react';
import { Invoice, BimbelConfig } from '../types/bimbel';
import { sendPaymentReceiptViaGmail, buildReceiptEmailHTML } from '../services/gmailService';
import { googleSignIn, getAccessToken } from '../services/auth';
import { formatIDR } from '../services/storage';

interface EmailReceiptModalProps {
  invoice: Invoice | null;
  config: BimbelConfig;
  isOpen: boolean;
  onClose: () => void;
  onSuccessSent: (invoiceId: string) => void;
  googleUser: any | null;
  onGoogleConnected: (user: any) => void;
}

export const EmailReceiptModal: React.FC<EmailReceiptModalProps> = ({
  invoice,
  config,
  isOpen,
  onClose,
  onSuccessSent,
  googleUser,
  onGoogleConnected,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPreviewBody, setShowPreviewBody] = useState(false);

  // Initialize recipient when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setRecipientEmail(invoice.studentEmail);
      setStatusMessage(null);
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === 'LUNAS';
  const defaultSubject = isPaid
    ? `[${config.institutionName}] Bukti Pembayaran Lunas - Invoice #${invoice.invoiceNumber} (${invoice.studentName})`
    : `[${config.institutionName}] Tagihan Biaya Bimbingan Belajar - Invoice #${invoice.invoiceNumber}`;

  const handleSendViaGmail = async () => {
    setIsSending(true);
    setStatusMessage(null);

    try {
      // Check if access token is in memory
      let token = await getAccessToken();
      if (!token) {
        // Prompt Google Sign in
        const res = await googleSignIn();
        if (res && res.user) {
          onGoogleConnected(res.user);
          token = res.accessToken;
        } else {
          throw new Error('Autentikasi akun Google resmi institusi diperlukan untuk mengirimkan surel.');
        }
      }

      // Update invoice recipient email if changed
      const invoiceToSend: Invoice = {
        ...invoice,
        studentEmail: recipientEmail,
      };

      await sendPaymentReceiptViaGmail(invoiceToSend, config);

      setStatusMessage({
        type: 'success',
        text: `Email bukti penerimaan kas berhasil dikirim secara real-time ke ${recipientEmail} melalui Gmail API.`,
      });
      onSuccessSent(invoice.id);
    } catch (err: any) {
      console.error('Email send error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal mengirim email via Gmail API.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFallbackMailto = () => {
    const subject = encodeURIComponent(defaultSubject);
    const body = encodeURIComponent(
      `Yth. Orang Tua / Siswa ${invoice.studentName},\n\n` +
      `Berikut adalah rincian bukti tagihan dari ${config.institutionName}:\n\n` +
      `No. Invoice: ${invoice.invoiceNumber}\n` +
      `Program: ${invoice.programName}\n` +
      `Total Tagihan: ${formatIDR(invoice.totalAmount)}\n` +
      `Jumlah Terbayar: ${formatIDR(invoice.amountPaid)}\n` +
      `Sisa Tagihan: ${formatIDR(invoice.remainingAmount)}\n` +
      `Status: ${invoice.status}\n\n` +
      `Terima kasih atas kepercayaannya.\n` +
      `${config.institutionName}\n${config.phone}`
    );
    window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`, '_blank');
    onSuccessSent(invoice.id);
    onClose();
  };

  const handleSimulatedSuccess = () => {
    setStatusMessage({
      type: 'success',
      text: `[Tercatat] Konfirmasi pengiriman notifikasi pembayaran telah disimpan untuk alamat ${recipientEmail}.`,
    });
    onSuccessSent(invoice.id);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-xl w-full my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Mail className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Pengiriman Bukti Pembayaran Resmi</h2>
              <p className="text-xs text-slate-400">
                Layanan pengiriman surel tanda terima kas langsung ke wali siswa
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
        <div className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
              </span>
            </div>
            <div className="text-slate-800">
              Siswa: <strong>{invoice.studentName}</strong> ({invoice.programName})
            </div>
            <div className="text-slate-600">
              Orang Tua: {invoice.parentName} &bull; WA: <span className="font-mono">{invoice.parentPhone}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-mono">
              <span>Nilai Faktur: <strong>{formatIDR(invoice.totalAmount)}</strong></span>
              <span className="text-emerald-800 font-semibold">Kas Masuk: {formatIDR(invoice.amountPaid)}</span>
            </div>
          </div>

          {/* Input Recipient */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alamat Surel / Email Penerima
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Perihal (Subject)
              </label>
              <input
                type="text"
                readOnly
                value={defaultSubject}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded text-slate-700"
              />
            </div>
          </div>

          {/* Preview Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPreviewBody(!showPreviewBody)}
              className="text-xs text-slate-700 hover:text-slate-900 underline font-medium flex items-center gap-1"
            >
              <span>{showPreviewBody ? 'Sembunyikan Pratinjau Naskah Surel' : 'Tampilkan Pratinjau Format Dokumen Surel'}</span>
            </button>

            {showPreviewBody && (
              <div className="mt-2 border border-slate-300 rounded p-3 bg-white max-h-52 overflow-y-auto text-[11px] font-sans">
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildReceiptEmailHTML({ ...invoice, studentEmail: recipientEmail }, config),
                  }}
                />
              </div>
            )}
          </div>

          {/* User Confirmation Card (Mandatory Requirement) */}
          <div className="p-3 bg-slate-100 border border-slate-300 rounded flex items-start gap-2.5 text-xs text-slate-800">
            <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Konfirmasi Pengiriman Dokumen</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Surat bukti penerimaan kas resmi akan dikirimkan langsung ke alamat <strong>{recipientEmail}</strong> atas nama {config.institutionName}.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSendViaGmail}
              disabled={isSending || !recipientEmail}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sedang Mengirimkan Surel...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-slate-300" />
                  <span>Kirimkan Surel Resmi via Gmail Institusi</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFallbackMailto}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-300"
              >
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>Buka di Mail Client</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatedSuccess}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Tandai notifikasi terkirim"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Catat Terkirim</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
