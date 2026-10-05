export type InvoiceStatus = 'LUNAS' | 'MENUNGGU_PEMBAYARAN' | 'JATUH_TEMPO' | 'CICILAN';

export type PaymentMethod = 'TRANSFER_BCA' | 'TRANSFER_MANDIRI' | 'TRANSFER_BRI' | 'QRIS' | 'TUNAI';

export type ProgramLevel = 
  | 'SD_REGULER' 
  | 'SMP_REGULER' 
  | 'SMA_REGULER' 
  | 'INTENSIF_UTBK' 
  | 'KEDINASAN_POLRI' 
  | 'PRIVAT_KHUSUS';

export interface Student {
  id: string;
  name: string;
  nis: string; // Nomor Induk Siswa
  grade: string; // e.g. "Kelas 12 SMA", "Kelas 9 SMP"
  schoolOrigin: string; // e.g. "SMAN 1 Teladan"
  parentName: string;
  parentPhone: string; // WhatsApp
  email: string; // Parent or student email
  program: ProgramLevel;
  programName: string;
  enrolledDate: string;
  isActive: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string; // e.g. "SPP Bulan Oktober 2026 - Kelas Intensif UTBK"
  category: 'SPP' | 'REGISTRASI' | 'MODUL_BUKU' | 'TRYOUT' | 'BIAYA_LAIN';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV/2026/10/0104"
  studentId: string;
  studentName: string;
  studentEmail: string;
  parentName: string;
  parentPhone: string;
  programName: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // e.g. Beasiswa / Promo
  discountReason?: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string; // e.g. nomor transaksi bank
  notes?: string;
  lastEmailSentAt?: string;
}

export interface BimbelConfig {
  institutionName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  financeHeadName: string;
  financeHeadTitle: string;
  bankAccounts: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  }[];
  adminPin: string; // Default admin PIN for security
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  status?: InvoiceStatus | 'ALL';
  program?: string | 'ALL';
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoices: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  activeStudentsCount: number;
  collectionRate: number; // Percentage
}
