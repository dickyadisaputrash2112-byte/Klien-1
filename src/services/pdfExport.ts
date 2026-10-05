import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, BimbelConfig } from '../types/bimbel';
import { formatIDR } from './storage';

export const exportInvoicePDF = (invoice: Invoice, config: BimbelConfig) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryNavy = [15, 23, 42]; // #0f172a
  const secondaryIndigo = [59, 130, 246]; // #3b82f6
  const slate600 = [71, 85, 105];
  const slate200 = [226, 232, 240];

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Institution Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(config.institutionName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(config.tagline, 14, 18);
  doc.text(`${config.address}, ${config.city} | Telp: ${config.phone}`, 14, 23);

  // Document Title & Number
  const isPaid = invoice.status === 'LUNAS';
  const titleText = isPaid ? 'KUITANSI & BUKTI PEMBAYARAN' : 'INVOICE TAGIHAN BIMBEL';
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(titleText, 14, 38);

  // Status Badge
  doc.setFontSize(10);
  if (invoice.status === 'LUNAS') {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(pageWidth - 45, 31, 31, 9, 2, 2, 'F');
    doc.text('LUNAS', pageWidth - 37, 37);
  } else if (invoice.status === 'JATUH_TEMPO') {
    doc.setFillColor(239, 68, 68); // red-500
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(pageWidth - 55, 31, 41, 9, 2, 2, 'F');
    doc.text('JATUH TEMPO', pageWidth - 51, 37);
  } else if (invoice.status === 'CICILAN') {
    doc.setFillColor(14, 165, 233); // sky-500
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(pageWidth - 48, 31, 34, 9, 2, 2, 'F');
    doc.text('CICILAN', pageWidth - 42, 37);
  } else {
    doc.setFillColor(245, 158, 11); // amber-500
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(pageWidth - 62, 31, 48, 9, 2, 2, 'F');
    doc.text('BELUM DIBAYAR', pageWidth - 58, 37);
  }

  // Invoice Meta Grid
  doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
  doc.setLineWidth(0.3);
  doc.line(14, 42, pageWidth - 14, 42);

  // Two columns: Left: Invoice Details, Right: Student Details
  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(slate600[0], slate600[1], slate600[2]);
  doc.text('INFORMASI TAGIHAN', 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`No. Invoice : ${invoice.invoiceNumber}`, 14, 54);
  doc.text(`Tgl Terbit  : ${invoice.issueDate}`, 14, 60);
  doc.text(`Jatuh Tempo : ${invoice.dueDate}`, 14, 66);
  if (invoice.paymentDate) {
    doc.text(`Tgl Bayar   : ${invoice.paymentDate}`, 14, 72);
  }
  if (invoice.paymentMethod) {
    doc.text(`Metode Bayar: ${invoice.paymentMethod.replace('_', ' ')}`, 14, 78);
  }

  // Right Column (Student Details)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(slate600[0], slate600[1], slate600[2]);
  doc.text('DATA SISWA & WALI', 110, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nama Siswa   : ${invoice.studentName}`, 110, 54);
  doc.text(`Program      : ${invoice.programName}`, 110, 60);
  doc.text(`Orang Tua/Wali: ${invoice.parentName}`, 110, 66);
  doc.text(`Kontak / WA  : ${invoice.parentPhone}`, 110, 72);
  doc.text(`Email        : ${invoice.studentEmail}`, 110, 78);

  // Line Items Table
  const tableStartY = 85;
  const tableRows = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.category,
    item.quantity.toString(),
    formatIDR(item.unitPrice),
    formatIDR(item.total),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['No', 'Rincian Biaya / Layanan', 'Kategori', 'Qty', 'Harga Satuan', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Totals Breakdown Box (Right aligned)
  const calcX = pageWidth - 85;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', calcX, finalY);
  doc.text(formatIDR(invoice.subtotal), pageWidth - 14, finalY, { align: 'right' });

  if (invoice.discount > 0) {
    doc.text(`Diskon/Potongan:`, calcX, finalY + 6);
    doc.setTextColor(220, 38, 38);
    doc.text(`- ${formatIDR(invoice.discount)}`, pageWidth - 14, finalY + 6, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  const offsetTot = invoice.discount > 0 ? 12 : 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(calcX, finalY + offsetTot, pageWidth - 14, finalY + offsetTot);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Tagihan:', calcX, finalY + offsetTot + 7);
  doc.text(formatIDR(invoice.totalAmount), pageWidth - 14, finalY + offsetTot + 7, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('Jumlah Terbayar:', calcX, finalY + offsetTot + 13);
  doc.text(formatIDR(invoice.amountPaid), pageWidth - 14, finalY + offsetTot + 13, { align: 'right' });

  if (invoice.remainingAmount > 0) {
    doc.setTextColor(220, 38, 38);
  } else {
    doc.setTextColor(100, 116, 139);
  }
  doc.text('Sisa Tagihan:', calcX, finalY + offsetTot + 19);
  doc.text(formatIDR(invoice.remainingAmount), pageWidth - 14, finalY + offsetTot + 19, { align: 'right' });

  // Payment Instructions (Left aligned, bottom box)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('REKENING RESMI PEMBAYARAN BIMBEL:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let bankY = finalY + 5;
  config.bankAccounts.slice(0, 3).forEach((acc) => {
    doc.text(`• ${acc.bank}: ${acc.accountNumber} (a.n ${acc.accountHolder})`, 14, bankY);
    bankY += 5;
  });

  if (invoice.notes) {
    bankY += 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(`Catatan: ${invoice.notes}`, 14, bankY, { maxWidth: 90 });
  }

  // Stamp & Verification Signature Block
  const sigY = pageHeight - 48;

  // Stempel Validasi
  if (isPaid) {
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.8);
    doc.roundedRect(20, sigY + 5, 45, 18, 3, 3, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text('LUNAS / TERBAYAR', 24, sigY + 13);
    doc.setFontSize(7);
    doc.text(`Verified: ${invoice.paymentDate || invoice.issueDate}`, 24, sigY + 18);
  }

  // Tanda Tangan Bagian Keuangan
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${config.city.split(',')[0]}, ${invoice.issueDate}`, pageWidth - 60, sigY);
  doc.text(config.financeHeadTitle, pageWidth - 60, sigY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`[ Tanda Tangan Digital ]`, pageWidth - 60, sigY + 16);
  doc.text(config.financeHeadName, pageWidth - 60, sigY + 24);

  // Footer bar
  doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dokumen ini diterbitkan resmi oleh sistem keuangan ${config.institutionName}. Valid tanpa tanda tangan basah.`, 14, pageHeight - 9);
  doc.text(`Invoice ID: ${invoice.id}`, pageWidth - 14, pageHeight - 9, { align: 'right' });

  // Save PDF
  doc.save(`Invoice_${invoice.invoiceNumber.replace(/\//g, '-')}_${invoice.studentName.replace(/\s+/g, '_')}.pdf`);
};

export const exportFinancialReportPDF = (
  invoices: Invoice[],
  periodTitle: string,
  config: BimbelConfig
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${config.institutionName.toUpperCase()} - LAPORAN KEUANGAN & ARUS KAS`, 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Periode: ${periodTitle} | Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 14, 18);

  // Financial Metrics Calculation
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivable = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);
  const paidCount = invoices.filter((i) => i.status === 'LUNAS').length;
  const overdueCount = invoices.filter((i) => i.status === 'JATUH_TEMPO').length;
  const pendingCount = invoices.filter((i) => i.status === 'MENUNGGU_PEMBAYARAN' || i.status === 'CICILAN').length;

  // KPI Summary Cards
  const cardW = 58;
  const cardH = 18;
  const cardY = 28;

  // Card 1: Total Omset Penerbitan
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL TAGIHAN DITERBITKAN', 18, cardY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatIDR(totalBilled), 18, cardY + 12);

  // Card 2: Kas Masuk / Diterima
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14 + cardW + 6, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL KAS MASUK (REALISASI)', 18 + cardW + 6, cardY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70);
  doc.text(formatIDR(totalReceived), 18 + cardW + 6, cardY + 12);

  // Card 3: Piutang Tertunda
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14 + (cardW + 6) * 2, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 38, 38);
  doc.text('PIUTANG BELUM TERBAYAR', 18 + (cardW + 6) * 2, cardY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(153, 27, 27);
  doc.text(formatIDR(totalReceivable), 18 + (cardW + 6) * 2, cardY + 12);

  // Card 4: Kolektibilitas
  const rate = totalBilled > 0 ? ((totalReceived / totalBilled) * 100).toFixed(1) : '0';
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14 + (cardW + 6) * 3, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('TINGKAT KOLEKTIBILITAS', 18 + (cardW + 6) * 3, cardY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(55, 48, 163);
  doc.text(`${rate}% (${paidCount} Lunas / ${invoices.length} Inv)`, 18 + (cardW + 6) * 3, cardY + 12);

  // Table of Invoices
  const rows = invoices.map((inv, idx) => [
    (idx + 1).toString(),
    inv.invoiceNumber,
    inv.issueDate,
    inv.studentName,
    inv.programName,
    formatIDR(inv.totalAmount),
    formatIDR(inv.amountPaid),
    formatIDR(inv.remainingAmount),
    inv.status.replace('_', ' '),
    inv.paymentMethod ? inv.paymentMethod.replace('TRANSFER_', '').replace('_', ' ') : '-',
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 6,
    head: [[
      'No', 
      'No. Invoice', 
      'Tgl Terbit', 
      'Nama Siswa', 
      'Program Bimbingan', 
      'Total Biaya', 
      'Terbayar', 
      'Sisa Piutang', 
      'Status', 
      'Metode'
    ]],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 42 },
      4: { cellWidth: 50 },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' },
      7: { cellWidth: 26, halign: 'right' },
      8: { cellWidth: 25, halign: 'center' },
      9: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer / Signatures
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  if (tableEndY < pageHeight - 35) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Mengetahui,`, pageWidth - 60, tableEndY);
    doc.text(config.financeHeadTitle, pageWidth - 60, tableEndY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(config.financeHeadName, pageWidth - 60, tableEndY + 20);
  }

  doc.save(`Laporan_Keuangan_Bimbel_${periodTitle.replace(/\s+/g, '_')}.pdf`);
};
