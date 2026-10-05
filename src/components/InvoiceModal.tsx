import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Calendar, User, BookOpen, AlertCircle } from 'lucide-react';
import { Invoice, InvoiceItem, Student, InvoiceStatus, PaymentMethod, BimbelConfig } from '../types/bimbel';
import { formatIDR } from '../services/storage';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  students: Student[];
  config: BimbelConfig;
  editingInvoice?: Invoice | null;
  preselectedStudentId?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  config,
  editingInvoice,
  preselectedStudentId,
}) => {
  if (!isOpen) return null;

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    editingInvoice?.studentId || preselectedStudentId || (students[0]?.id ?? '')
  );

  const [studentName, setStudentName] = useState(editingInvoice?.studentName || '');
  const [studentEmail, setStudentEmail] = useState(editingInvoice?.studentEmail || '');
  const [parentName, setParentName] = useState(editingInvoice?.parentName || '');
  const [parentPhone, setParentPhone] = useState(editingInvoice?.parentPhone || '');
  const [programName, setProgramName] = useState(editingInvoice?.programName || '');

  const [invoiceNumber, setInvoiceNumber] = useState(
    editingInvoice?.invoiceNumber || `INV/2026/10/${Math.floor(1000 + Math.random() * 9000)}`
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDefault = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(editingInvoice?.issueDate || todayStr);
  const [dueDate, setDueDate] = useState(editingInvoice?.dueDate || dueDefault);

  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items || [
      {
        id: 'item-1',
        description: 'SPP Bimbingan Belajar Bulan Oktober 2026',
        category: 'SPP',
        quantity: 1,
        unitPrice: 1500000,
        total: 1500000,
      },
    ]
  );

  const [discount, setDiscount] = useState<number>(editingInvoice?.discount || 0);
  const [discountReason, setDiscountReason] = useState<string>(editingInvoice?.discountReason || '');
  const [status, setStatus] = useState<InvoiceStatus>(editingInvoice?.status || 'MENUNGGU_PEMBAYARAN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    editingInvoice?.paymentMethod || 'TRANSFER_BCA'
  );
  const [amountPaid, setAmountPaid] = useState<number>(editingInvoice?.amountPaid || 0);
  const [notes, setNotes] = useState<string>(
    editingInvoice?.notes || 'Mohon cantumkan nomor invoice saat transfer ke rekening bimbel.'
  );

  // Sync when student dropdown changes
  useEffect(() => {
    if (!editingInvoice && selectedStudentId) {
      const std = students.find((s) => s.id === selectedStudentId);
      if (std) {
        setStudentName(std.name);
        setStudentEmail(std.email);
        setParentName(std.parentName);
        setParentPhone(std.parentPhone);
        setProgramName(std.programName);
      }
    }
  }, [selectedStudentId, students, editingInvoice]);

  // Handle status quick amountPaid adjustment
  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const remainingAmount = Math.max(0, totalAmount - amountPaid);

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    setStatus(newStatus);
    if (newStatus === 'LUNAS') {
      setAmountPaid(totalAmount);
    } else if (newStatus === 'MENUNGGU_PEMBAYARAN' || newStatus === 'JATUH_TEMPO') {
      setAmountPaid(0);
    } else if (newStatus === 'CICILAN') {
      setAmountPaid(Math.round(totalAmount / 2));
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'Paket Modul Latihan & Bank Soal',
      category: 'MODUL_BUKU',
      quantity: 1,
      unitPrice: 350000,
      total: 350000,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const it = { ...updated[idx] };
    if (field === 'quantity') {
      it.quantity = Math.max(1, Number(value));
      it.total = it.quantity * it.unitPrice;
    } else if (field === 'unitPrice') {
      it.unitPrice = Math.max(0, Number(value));
      it.total = it.quantity * it.unitPrice;
    } else {
      (it as any)[field] = value;
    }
    updated[idx] = it;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData: Invoice = {
      id: editingInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber,
      studentId: selectedStudentId,
      studentName,
      studentEmail,
      parentName,
      parentPhone,
      programName,
      issueDate,
      dueDate,
      items,
      subtotal,
      discount,
      discountReason: discount > 0 ? discountReason : undefined,
      totalAmount,
      amountPaid,
      remainingAmount,
      status,
      paymentMethod: amountPaid > 0 ? paymentMethod : undefined,
      paymentDate: amountPaid > 0 ? todayStr : undefined,
      notes,
      lastEmailSentAt: editingInvoice?.lastEmailSentAt,
    };

    onSave(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-3xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif tracking-tight">
                {editingInvoice ? 'Perbarui Data Invoice Penagihan' : 'Penerbitan Invoice Tagihan Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Dokumen penagihan resmi bimbingan belajar dengan rekonsiliasi otomatis
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Data Siswa & Invoice Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <User className="w-4 h-4 text-slate-700" />
              <span>1. Identitas Siswa &amp; Nomor Registrasi Invoice</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Siswa Terdaftar (Otomatis Lengkap)
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 font-medium"
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.name} ({std.nis} - {std.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Invoice Resmi
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Nama Lengkap Siswa:</span>
                <span className="font-semibold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Wali / Kontak WhatsApp:</span>
                <span className="font-medium text-slate-800">{parentName} ({parentPhone})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Email Notifikasi:</span>
                <span className="font-medium font-mono text-slate-800 truncate block">{studentEmail}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Waktu (Jatuh Tempo)
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <span>2. Rincian Biaya &amp; Paket Layanan Bimbel</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors border border-slate-300"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Tambah Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded text-xs"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Deskripsi Layanan (misal: SPP Bulan Oktober)"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="w-28">
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="SPP">SPP</option>
                      <option value="REGISTRASI">Registrasi</option>
                      <option value="MODUL_BUKU">Modul Buku</option>
                      <option value="TRYOUT">Tryout</option>
                      <option value="BIAYA_LAIN">Lainnya</option>
                    </select>
                  </div>

                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-center font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      step="50000"
                      placeholder="Harga Satuan"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 text-right font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="w-28 text-right font-mono font-bold text-slate-900">
                    {formatIDR(item.total)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                    title="Hapus Baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Calculations and Discounts */}
            <div className="bg-slate-50 p-4 rounded border border-slate-300 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Rincian:</span>
                <span className="font-mono font-semibold text-slate-900">{formatIDR(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-slate-600 shrink-0">Diskon / Beasiswa (Rp):</span>
                  <input
                    type="number"
                    step="25000"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-32 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Alasan / Program Potongan (opsional)"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>
                <span className="font-mono text-rose-700 font-semibold">- {formatIDR(discount)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span className="font-serif">Total Tagihan Bersih:</span>
                <span className="font-mono text-base font-bold text-slate-900">{formatIDR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Status & Pembayaran */}
          <div className="space-y-4 pt-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5">
              3. Status Pembayaran &amp; Realisasi Kas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Tagihan Saat Ini
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="MENUNGGU_PEMBAYARAN">MENUNGGU PEMBAYARAN</option>
                  <option value="LUNAS">LUNAS</option>
                  <option value="CICILAN">CICILAN (Sebagian)</option>
                  <option value="JATUH_TEMPO">JATUH TEMPO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Kas Diterima (Rp)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  max={totalAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Math.min(totalAmount, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="TRANSFER_BCA">Transfer Bank BCA</option>
                  <option value="TRANSFER_MANDIRI">Transfer Bank Mandiri</option>
                  <option value="TRANSFER_BRI">Transfer Bank BRI</option>
                  <option value="QRIS">QRIS Dinamis</option>
                  <option value="TUNAI">Tunai di Kasir Bimbel</option>
                </select>
              </div>
            </div>

            {remainingAmount > 0 && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between">
                <span className="font-medium">Sisa Piutang yang Belum Terbayar:</span>
                <span className="font-mono font-bold text-amber-950">{formatIDR(remainingAmount)}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan untuk Kuitansi &amp; Email
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan rekening transfer, nomor referensi, atau instruksi..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              {editingInvoice ? 'Simpan Perubahan Invoice' : 'Terbitkan Invoice Resmi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
