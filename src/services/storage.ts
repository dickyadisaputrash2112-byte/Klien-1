import { Invoice, Student, BimbelConfig } from '../types/bimbel';

const STORAGE_KEYS = {
  INVOICES: 'bimbel_invoices_v1',
  STUDENTS: 'bimbel_students_v1',
  CONFIG: 'bimbel_config_v1',
  ADMIN_AUTH: 'bimbel_admin_session_v1',
};

export const DEFAULT_BIMBEL_CONFIG: BimbelConfig = {
  institutionName: 'Bimbel Cendekia Nusantara',
  tagline: 'Pusat Bimbingan Intensif UTBK-SNBT, Kedinasan & Sukses Akademik',
  address: 'Jl. Margonda Raya No. 188, Beji',
  city: 'Kota Depok, Jawa Barat 16424',
  phone: '0812-9845-6677 / (021) 7788-9900',
  email: 'keuangan@cendekianusantara.sch.id',
  website: 'www.cendekianusantara.sch.id',
  financeHeadName: 'Dra. Sri Wahyuni, M.Ak.',
  financeHeadTitle: 'Kepala Bagian Keuangan & Administrasi',
  bankAccounts: [
    { bank: 'Bank BCA', accountNumber: '8830-1928-44', accountHolder: 'Bimbel Cendekia Nusantara' },
    { bank: 'Bank Mandiri', accountNumber: '137-00-981273-1', accountHolder: 'Bimbel Cendekia Nusantara' },
    { bank: 'Bank BRI', accountNumber: '0341-01-002934-50-8', accountHolder: 'Bimbel Cendekia Nusantara' },
    { bank: 'QRIS Dinamis', accountNumber: 'NMID: ID1020039281726', accountHolder: 'Bimbel Cendekia Nusantara' },
  ],
  adminPin: '123456',
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    name: 'Muhammad Farhan Pratama',
    nis: 'CN-2026-081',
    grade: 'Kelas 12 SMA',
    schoolOrigin: 'SMAN 1 Depok',
    parentName: 'H. Bambang Pratama, S.E.',
    parentPhone: '0812-8877-1122',
    email: 'farhan.pratama26@gmail.com',
    program: 'INTENSIF_UTBK',
    programName: 'Intensif Supercamp UTBK-SNBT 2026',
    enrolledDate: '2026-07-15',
    isActive: true,
  },
  {
    id: 'std-002',
    name: 'Alya Putri Maharani',
    nis: 'CN-2026-082',
    grade: 'Kelas 12 SMA',
    schoolOrigin: 'SMAN 28 Jakarta',
    parentName: 'Dra. Endang Sulastri',
    parentPhone: '0813-1122-3344',
    email: 'alya.maharani.edu@gmail.com',
    program: 'INTENSIF_UTBK',
    programName: 'Intensif Supercamp UTBK-SNBT 2026',
    enrolledDate: '2026-07-18',
    isActive: true,
  },
  {
    id: 'std-003',
    name: 'Rizky Aditya Kusuma',
    nis: 'CN-2026-083',
    grade: 'Alumni / Gap Year',
    schoolOrigin: 'SMAN 3 Bogor',
    parentName: 'Kol. (Purn) Hendra Kusuma',
    parentPhone: '0811-9988-7766',
    email: 'rizky.kusuma.polri@gmail.com',
    program: 'KEDINASAN_POLRI',
    programName: 'Diklat Khusus Akademi Kepolisian & IPDN',
    enrolledDate: '2026-08-01',
    isActive: true,
  },
  {
    id: 'std-004',
    name: 'Nadia Salsabila Azzahra',
    nis: 'CN-2026-084',
    grade: 'Kelas 9 SMP',
    schoolOrigin: 'SMP Islam Al-Azhar 12',
    parentName: 'dr. Ahmad Fauzi, Sp.A',
    parentPhone: '0815-5544-3322',
    email: 'nadia.azzahra2026@gmail.com',
    program: 'SMP_REGULER',
    programName: 'Reguler SMP Kelas 9 (Persiapan SMA Unggulan)',
    enrolledDate: '2026-08-10',
    isActive: true,
  },
  {
    id: 'std-005',
    name: 'Jonathan Kevin Wijaya',
    nis: 'CN-2026-085',
    grade: 'Kelas 11 SMA',
    schoolOrigin: 'SMA Kanisius Jakarta',
    parentName: 'Ir. Kevin Wijaya',
    parentPhone: '0818-7766-5544',
    email: 'jonathan.kevin.w@gmail.com',
    program: 'PRIVAT_KHUSUS',
    programName: 'Privat Eksklusif 1-on-1 (Olimpiade Matematika & Fisika)',
    enrolledDate: '2026-08-20',
    isActive: true,
  },
  {
    id: 'std-006',
    name: 'Zahra Anindya Putri',
    nis: 'CN-2026-086',
    grade: 'Kelas 6 SD',
    schoolOrigin: 'SDIT Darul Quran',
    parentName: 'Rini Safitri, M.Pd.',
    parentPhone: '0812-3344-9988',
    email: 'zahra.anindya06@gmail.com',
    program: 'SD_REGULER',
    programName: 'Reguler SD Juara Kelas 6 (Bilingual & Calistung)',
    enrolledDate: '2026-09-01',
    isActive: true,
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV/2026/10/0101',
    studentId: 'std-001',
    studentName: 'Muhammad Farhan Pratama',
    studentEmail: 'farhan.pratama26@gmail.com',
    parentName: 'H. Bambang Pratama, S.E.',
    parentPhone: '0812-8877-1122',
    programName: 'Intensif Supercamp UTBK-SNBT 2026',
    issueDate: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      {
        id: 'item-101-1',
        description: 'SPP Bimbel Bulan Oktober 2026 - Program UTBK Intensif',
        category: 'SPP',
        quantity: 1,
        unitPrice: 1850000,
        total: 1850000,
      },
      {
        id: 'item-101-2',
        description: 'Paket 10x Tryout CBT Nasional & Analisis Peluang Masuk PTN',
        category: 'TRYOUT',
        quantity: 1,
        unitPrice: 350000,
        total: 350000,
      },
    ],
    subtotal: 2200000,
    discount: 200000,
    discountReason: 'Diskon Prestasi Rapor 5 Besar',
    totalAmount: 2000000,
    amountPaid: 2000000,
    remainingAmount: 0,
    status: 'LUNAS',
    paymentMethod: 'TRANSFER_BCA',
    paymentDate: '2026-10-02',
    paymentReference: 'BCA-TRX-982173491',
    notes: 'Terima kasih telah melakukan pembayaran tepat waktu. Modul tryout dapat diakses langsung di portal siswa.',
    lastEmailSentAt: '2026-10-02T10:15:00',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV/2026/10/0102',
    studentId: 'std-002',
    studentName: 'Alya Putri Maharani',
    studentEmail: 'alya.maharani.edu@gmail.com',
    parentName: 'Dra. Endang Sulastri',
    parentPhone: '0813-1122-3344',
    programName: 'Intensif Supercamp UTBK-SNBT 2026',
    issueDate: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      {
        id: 'item-102-1',
        description: 'SPP Bimbel Bulan Oktober 2026 - Program UTBK Intensif',
        category: 'SPP',
        quantity: 1,
        unitPrice: 1850000,
        total: 1850000,
      },
      {
        id: 'item-102-2',
        description: 'Buku Paket Modul Prediksi UTBK SNBT 2026 (TPS, Literasi & Penalaran)',
        category: 'MODUL_BUKU',
        quantity: 1,
        unitPrice: 450000,
        total: 450000,
      },
    ],
    subtotal: 2300000,
    discount: 0,
    totalAmount: 2300000,
    amountPaid: 0,
    remainingAmount: 2300000,
    status: 'MENUNGGU_PEMBAYARAN',
    notes: 'Mohon cantumkan kode unik invoice saat melakukan transfer perbankan.',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV/2026/10/0103',
    studentId: 'std-003',
    studentName: 'Rizky Aditya Kusuma',
    studentEmail: 'rizky.kusuma.polri@gmail.com',
    parentName: 'Kol. (Purn) Hendra Kusuma',
    parentPhone: '0811-9988-7766',
    programName: 'Diklat Khusus Akademi Kepolisian & IPDN',
    issueDate: '2026-09-20',
    dueDate: '2026-09-30',
    items: [
      {
        id: 'item-103-1',
        description: 'Biaya Diklat Kedinasan Tahap II (Akademik + Kesamaptaan)',
        category: 'SPP',
        quantity: 1,
        unitPrice: 3200000,
        total: 3200000,
      },
      {
        id: 'item-103-2',
        description: 'Medical Check-Up Awal & Simulasi Tes Psikotes Kedinasan',
        category: 'BIAYA_LAIN',
        quantity: 1,
        unitPrice: 600000,
        total: 600000,
      },
    ],
    subtotal: 3800000,
    discount: 300000,
    discountReason: 'Voucher Beasiswa Putra Purnawirawan',
    totalAmount: 3500000,
    amountPaid: 1500000,
    remainingAmount: 2000000,
    status: 'JATUH_TEMPO',
    paymentMethod: 'TRANSFER_MANDIRI',
    paymentDate: '2026-09-22',
    paymentReference: 'MDR-DP-09281',
    notes: 'Jatuh tempo pelunasan sisa cicilan telah melewati tanggal 30 September 2026. Harap segera diselesaikan.',
    lastEmailSentAt: '2026-10-01T08:00:00',
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV/2026/10/0104',
    studentId: 'std-004',
    studentName: 'Nadia Salsabila Azzahra',
    studentEmail: 'nadia.azzahra2026@gmail.com',
    parentName: 'dr. Ahmad Fauzi, Sp.A',
    parentPhone: '0815-5544-3322',
    programName: 'Reguler SMP Kelas 9 (Persiapan SMA Unggulan)',
    issueDate: '2026-10-02',
    dueDate: '2026-10-12',
    items: [
      {
        id: 'item-104-1',
        description: 'SPP Bimbel Bulan Oktober 2026 - Reguler SMP Kelas 9',
        category: 'SPP',
        quantity: 1,
        unitPrice: 950000,
        total: 950000,
      },
      {
        id: 'item-104-2',
        description: 'Bank Soal Asesmen Standar Pendidikan & Buku Rumus Cepat',
        category: 'MODUL_BUKU',
        quantity: 1,
        unitPrice: 200000,
        total: 200000,
      },
    ],
    subtotal: 1150000,
    discount: 100000,
    discountReason: 'Potongan Pendaftaran Awal Semester',
    totalAmount: 1050000,
    amountPaid: 1050000,
    remainingAmount: 0,
    status: 'LUNAS',
    paymentMethod: 'QRIS',
    paymentDate: '2026-10-03',
    paymentReference: 'QRIS-BMB-983192',
    notes: 'Pembayaran telah tervalidasi via QRIS Nasional.',
    lastEmailSentAt: '2026-10-03T14:20:00',
  },
  {
    id: 'inv-105',
    invoiceNumber: 'INV/2026/10/0105',
    studentId: 'std-005',
    studentName: 'Jonathan Kevin Wijaya',
    studentEmail: 'jonathan.kevin.w@gmail.com',
    parentName: 'Ir. Kevin Wijaya',
    parentPhone: '0818-7766-5544',
    programName: 'Privat Eksklusif 1-on-1 (Olimpiade Matematika & Fisika)',
    issueDate: '2026-10-03',
    dueDate: '2026-10-15',
    items: [
      {
        id: 'item-105-1',
        description: 'Paket Privat 8 Sesi Tatap Muka Eksklusif Master Tutor',
        category: 'SPP',
        quantity: 8,
        unitPrice: 350000,
        total: 2800000,
      },
    ],
    subtotal: 2800000,
    discount: 0,
    totalAmount: 2800000,
    amountPaid: 1400000,
    remainingAmount: 1400000,
    status: 'CICILAN',
    paymentMethod: 'TRANSFER_BCA',
    paymentDate: '2026-10-04',
    paymentReference: 'BCA-DP1-20261004',
    notes: 'Termin pembayaran 50% di awal (Rp 1.400.000 terbayar) dan pelunasan di sesi ke-5.',
  },
  {
    id: 'inv-106',
    invoiceNumber: 'INV/2026/10/0106',
    studentId: 'std-006',
    studentName: 'Zahra Anindya Putri',
    studentEmail: 'zahra.anindya06@gmail.com',
    parentName: 'Rini Safitri, M.Pd.',
    parentPhone: '0812-3344-9988',
    programName: 'Reguler SD Juara Kelas 6 (Bilingual & Calistung)',
    issueDate: '2026-10-04',
    dueDate: '2026-10-14',
    items: [
      {
        id: 'item-106-1',
        description: 'SPP Bimbel Bulan Oktober 2026 - Reguler SD Kelas 6',
        category: 'SPP',
        quantity: 1,
        unitPrice: 750000,
        total: 750000,
      },
      {
        id: 'item-106-2',
        description: 'Biaya Pendaftaran Siswa Baru & Goodie Bag Bimbel',
        category: 'REGISTRASI',
        quantity: 1,
        unitPrice: 150000,
        total: 150000,
      },
    ],
    subtotal: 900000,
    discount: 50000,
    discountReason: 'Early Bird Promo',
    totalAmount: 850000,
    amountPaid: 0,
    remainingAmount: 850000,
    status: 'MENUNGGU_PEMBAYARAN',
    notes: 'Jadwal bimbingan dimulai hari Senin, 6 Oktober 2026.',
  },
];

// Helper functions for storage
export const getStoredInvoices = (): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!data) {
    saveStoredInvoices(INITIAL_INVOICES);
    return INITIAL_INVOICES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse invoices from storage', e);
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getStoredStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) {
    saveStoredStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredConfig = (): BimbelConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!data) {
    saveStoredConfig(DEFAULT_BIMBEL_CONFIG);
    return DEFAULT_BIMBEL_CONFIG;
  }
  try {
    return { ...DEFAULT_BIMBEL_CONFIG, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_BIMBEL_CONFIG;
  }
};

export const saveStoredConfig = (config: BimbelConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
};

export const setAdminAuthenticated = (val: boolean) => {
  if (val) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
};

export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};
