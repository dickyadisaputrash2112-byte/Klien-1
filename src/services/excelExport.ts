import * as XLSX from 'xlsx';
import { Invoice, BimbelConfig } from '../types/bimbel';

export const exportFinancialReportExcel = (
  invoices: Invoice[],
  periodTitle: string,
  config: BimbelConfig
) => {
  const wb = XLSX.utils.book_new();

  // Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivable = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);
  const paidCount = invoices.filter((i) => i.status === 'LUNAS').length;
  const overdueCount = invoices.filter((i) => i.status === 'JATUH_TEMPO').length;
  const pendingCount = invoices.filter((i) => i.status === 'MENUNGGU_PEMBAYARAN' || i.status === 'CICILAN').length;

  // 1. Sheet 1: Ringkasan Eksekutif
  const summaryData = [
    [config.institutionName.toUpperCase()],
    ['LAPORAN EKSEKUTIF KEUANGAN & PEMBAYARAN'],
    [`Periode: ${periodTitle}`],
    [`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`],
    [''],
    ['INDIKATOR KINERJA KEUANGAN (KPI)', 'NILAI / JUMLAH'],
    ['Total Tagihan Diterbitkan', totalBilled],
    ['Total Kas Masuk (Realisasi)', totalReceived],
    ['Total Piutang Belum Terbayar', totalReceivable],
    ['Tingkat Kolektibilitas (%)', totalBilled > 0 ? `${((totalReceived / totalBilled) * 100).toFixed(2)}%` : '0%'],
    [''],
    ['STATUS TAGIHAN', 'JUMLAH INVOICE'],
    ['Lunas', paidCount],
    ['Menunggu Pembayaran / Cicilan', pendingCount],
    ['Jatuh Tempo (Tunggakan)', overdueCount],
    ['Total Invoice Terbit', invoices.length],
    [''],
    ['Bagian Keuangan & Administrasi', config.financeHeadName],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // 2. Sheet 2: Data Invoice Lengkap
  const invoiceHeaders = [
    'No',
    'No. Invoice',
    'Tanggal Terbit',
    'Jatuh Tempo',
    'Nama Siswa',
    'Email Siswa/Ortu',
    'Nama Orang Tua',
    'WhatsApp Wali',
    'Program Bimbingan',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Total Tagihan (Rp)',
    'Jumlah Terbayar (Rp)',
    'Sisa Piutang (Rp)',
    'Status Pembayaran',
    'Metode Pembayaran',
    'Tanggal Pembayaran',
    'No. Referensi Bank',
  ];

  const invoiceRows = invoices.map((inv, idx) => [
    idx + 1,
    inv.invoiceNumber,
    inv.issueDate,
    inv.dueDate,
    inv.studentName,
    inv.studentEmail,
    inv.parentName,
    inv.parentPhone,
    inv.programName,
    inv.subtotal,
    inv.discount,
    inv.totalAmount,
    inv.amountPaid,
    inv.remainingAmount,
    inv.status,
    inv.paymentMethod || '-',
    inv.paymentDate || '-',
    inv.paymentReference || '-',
  ]);

  const wsInvoices = XLSX.utils.aoa_to_sheet([invoiceHeaders, ...invoiceRows]);
  wsInvoices['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 28 },
    { wch: 24 },
    { wch: 18 },
    { wch: 35 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInvoices, 'Buku Invoice & Penerimaan');

  // 3. Sheet 3: Laporan Piutang & Tunggakan
  const unpaidInvoices = invoices.filter((i) => i.remainingAmount > 0);
  const receivableHeaders = [
    'No',
    'No. Invoice',
    'Jatuh Tempo',
    'Nama Siswa',
    'Program Bimbel',
    'Kontak Wali',
    'Total Biaya (Rp)',
    'Sudah Dibayar (Rp)',
    'Tunggakan / Sisa (Rp)',
    'Status',
  ];

  const receivableRows = unpaidInvoices.map((inv, idx) => [
    idx + 1,
    inv.invoiceNumber,
    inv.dueDate,
    inv.studentName,
    inv.programName,
    `${inv.parentName} (${inv.parentPhone})`,
    inv.totalAmount,
    inv.amountPaid,
    inv.remainingAmount,
    inv.status,
  ]);

  const wsReceivables = XLSX.utils.aoa_to_sheet([receivableHeaders, ...receivableRows]);
  wsReceivables['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 28 },
    { wch: 35 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsReceivables, 'Piutang & Tunggakan');

  // Write file
  const fileName = `Laporan_Keuangan_Bimbel_${periodTitle.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
