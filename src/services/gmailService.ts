import { Invoice, BimbelConfig } from '../types/bimbel';
import { getAccessToken } from './auth';
import { formatIDR } from './storage';

export const buildReceiptEmailHTML = (invoice: Invoice, config: BimbelConfig): string => {
  const isPaid = invoice.status === 'LUNAS';
  const statusColor = isPaid ? '#10b981' : '#f59e0b';
  const statusLabel = isPaid ? 'LUNAS / TERBAYAR' : 'MENUNGGU PEMBAYARAN';

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${item.description}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">Kategori: ${item.category} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #0f172a; font-weight: 600;">
          ${formatIDR(item.total)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Bukti Pembayaran Bimbel</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Header -->
      <tr>
        <td style="background-color: #0f172a; padding: 24px; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">${config.institutionName}</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">${config.tagline}</p>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">${config.address}, ${config.city} | ${config.phone}</p>
        </td>
      </tr>

      <!-- Title & Status -->
      <tr>
        <td style="padding: 24px 24px 12px 24px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Konfirmasi Tagihan</span>
                <h2 style="margin: 4px 0 0 0; font-size: 18px; color: #0f172a;">No. ${invoice.invoiceNumber}</h2>
              </td>
              <td style="text-align: right;">
                <span style="display: inline-block; padding: 6px 12px; background-color: ${statusColor}18; color: ${statusColor}; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid ${statusColor}40;">
                  ${statusLabel}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Student & Parent Information -->
      <tr>
        <td style="padding: 0 24px 16px 24px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 6px; padding: 14px;">
            <tr>
              <td style="font-size: 12px; color: #475569; width: 50%; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Data Siswa</div>
                <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${invoice.studentName}</div>
                <div style="margin-top: 2px;">Program: <strong>${invoice.programName}</strong></div>
              </td>
              <td style="font-size: 12px; color: #475569; width: 50%; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Orang Tua / Wali</div>
                <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${invoice.parentName}</div>
                <div style="margin-top: 2px;">No. WhatsApp: ${invoice.parentPhone}</div>
                <div style="margin-top: 2px;">Email: ${invoice.studentEmail}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Table Items -->
      <tr>
        <td style="padding: 0 24px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Rincian Layanan Bimbel</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Totals Breakdown -->
      <tr>
        <td style="padding: 16px 24px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Subtotal Tagihan</td>
              <td style="font-size: 13px; color: #0f172a; text-align: right; padding-bottom: 6px;">${formatIDR(invoice.subtotal)}</td>
            </tr>
            ${
              invoice.discount > 0
                ? `
            <tr>
              <td style="font-size: 13px; color: #dc2626; padding-bottom: 6px;">Diskon / Beasiswa (${invoice.discountReason || 'Promo'})</td>
              <td style="font-size: 13px; color: #dc2626; text-align: right; padding-bottom: 6px;">- ${formatIDR(invoice.discount)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="font-size: 15px; font-weight: 700; color: #0f172a; padding-top: 6px; border-top: 1px solid #e2e8f0;">Total Tagihan</td>
              <td style="font-size: 16px; font-weight: 700; color: #0f172a; text-align: right; padding-top: 6px; border-top: 1px solid #e2e8f0;">${formatIDR(invoice.totalAmount)}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #16a34a; font-weight: 600; padding-top: 4px;">Jumlah Terbayar</td>
              <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right; padding-top: 4px;">${formatIDR(invoice.amountPaid)}</td>
            </tr>
            ${
              invoice.remainingAmount > 0
                ? `
            <tr>
              <td style="font-size: 13px; color: #dc2626; font-weight: 600; padding-top: 4px;">Sisa Tagihan</td>
              <td style="font-size: 13px; color: #dc2626; font-weight: 600; text-align: right; padding-top: 4px;">${formatIDR(invoice.remainingAmount)}</td>
            </tr>`
                : ''
            }
          </table>
        </td>
      </tr>

      <!-- Payment / Verification Note -->
      <tr>
        <td style="padding: 0 24px 20px 24px;">
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; font-size: 12px; color: #475569; border-radius: 0 6px 6px 0;">
            ${
              isPaid
                ? `<strong>Pembayaran Terverifikasi</strong><br/>
                   Terima kasih, pembayaran sebesar <strong>${formatIDR(invoice.amountPaid)}</strong> telah kami terima pada tanggal ${invoice.paymentDate || 'hari ini'} melalui ${invoice.paymentMethod?.replace('_', ' ') || 'transfer bank'}.`
                : `<strong>Instruksi Pembayaran</strong><br/>
                   Mohon lakukan pembayaran sebelum tanggal <strong>${invoice.dueDate}</strong> ke rekening resmi ${config.institutionName}:<br/>
                   • Bank BCA: 8830-1928-44 (a.n Bimbel Cendekia Nusantara)<br/>
                   • Bank Mandiri: 137-00-981273-1`
            }
          </div>
        </td>
      </tr>

      <!-- Signature & Footer -->
      <tr>
        <td style="padding: 20px 24px; border-top: 1px solid #e2e8f0; background-color: #fafafa; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">${config.financeHeadTitle} - ${config.institutionName}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #0f172a; font-weight: 700;">${config.financeHeadName}</p>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">Email ini diterbitkan secara otomatis oleh sistem administrasi bimbel. Jika ada pertanyaan, hubungi ${config.phone} atau email ${config.email}.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

// Converts string to URL-safe base64 for Gmail API
const encodeBase64Url = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sendPaymentReceiptViaGmail = async (
  invoice: Invoice,
  config: BimbelConfig
): Promise<{ success: boolean; messageId: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Workspace belum terhubung. Silakan login dengan Google terlebih dahulu.');
  }

  const isPaid = invoice.status === 'LUNAS';
  const subject = isPaid
    ? `[${config.institutionName}] Bukti Pembayaran Lunas - Invoice #${invoice.invoiceNumber} (${invoice.studentName})`
    : `[${config.institutionName}] Tagihan Biaya Bimbingan Belajar - Invoice #${invoice.invoiceNumber}`;

  const htmlBody = buildReceiptEmailHTML(invoice, config);

  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${invoice.studentName} <${invoice.studentEmail}>`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];

  const rawMessage = encodeBase64Url(messageParts.join('\r\n'));

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: rawMessage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Gagal mengirim email melalui Gmail API');
  }

  const result = await response.json();
  return {
    success: true,
    messageId: result.id,
  };
};
