import { Invoice, BimbelConfig } from '../types/bimbel';
import { getAccessToken } from './auth';

export interface GoogleSheetsSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export const syncReportToGoogleSheets = async (
  invoices: Invoice[],
  periodTitle: string,
  config: BimbelConfig
): Promise<GoogleSheetsSyncResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke akun Google Workspace. Silakan masuk terlebih dahulu.');
  }

  const title = `Laporan Keuangan Bimbel - ${periodTitle} (${new Date().toISOString().split('T')[0]})`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Ringkasan & KPI' } },
        { properties: { title: 'Buku Invoice Bimbel' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    throw new Error(errorData?.error?.message || 'Gagal membuat Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Calculate Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivable = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);
  const paidCount = invoices.filter((i) => i.status === 'LUNAS').length;
  const overdueCount = invoices.filter((i) => i.status === 'JATUH_TEMPO').length;
  const pendingCount = invoices.filter((i) => i.status === 'MENUNGGU_PEMBAYARAN' || i.status === 'CICILAN').length;

  // 2. Data for Sheet 1 (Ringkasan & KPI)
  const summaryValues = [
    [config.institutionName.toUpperCase()],
    ['LAPORAN KEUANGAN & PEMBAYARAN SISWA'],
    [`Periode: ${periodTitle}`],
    [`Dibuat pada: ${new Date().toLocaleString('id-ID')}`],
    [''],
    ['METRIK KEUANGAN', 'NILAI (IDR)'],
    ['Total Tagihan Diterbitkan', totalBilled],
    ['Total Kas Masuk (Lunas)', totalReceived],
    ['Total Piutang Belum Terbayar', totalReceivable],
    ['Tingkat Kolektibilitas', totalBilled > 0 ? `${((totalReceived / totalBilled) * 100).toFixed(2)}%` : '0%'],
    [''],
    ['STATUS INVOICE', 'JUMLAH'],
    ['Lunas', paidCount],
    ['Menunggu Pembayaran / Cicilan', pendingCount],
    ['Jatuh Tempo (Tunggakan)', overdueCount],
    ['Total Tagihan Terbit', invoices.length],
    [''],
    ['Penanggung Jawab Keuangan', config.financeHeadName],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Ringkasan & KPI'!A1:B${summaryValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: summaryValues,
      }),
    }
  );

  // 3. Data for Sheet 2 (Buku Invoice Bimbel)
  const invoiceHeaders = [
    'No',
    'No. Invoice',
    'Tgl Terbit',
    'Jatuh Tempo',
    'Nama Siswa',
    'Email Siswa/Wali',
    'Nama Orang Tua',
    'Kontak/WA',
    'Program Bimbingan',
    'Total Tagihan (Rp)',
    'Terbayar (Rp)',
    'Sisa Tagihan (Rp)',
    'Status',
    'Metode Bayar',
    'Tgl Bayar',
    'Ref Bank',
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
    inv.totalAmount,
    inv.amountPaid,
    inv.remainingAmount,
    inv.status,
    inv.paymentMethod || '-',
    inv.paymentDate || '-',
    inv.paymentReference || '-',
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Buku Invoice Bimbel'!A1:P${invoiceRows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [invoiceHeaders, ...invoiceRows],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};
