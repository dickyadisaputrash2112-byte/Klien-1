import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Mail, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Invoice, BimbelConfig } from '../types/bimbel';
import { formatIDR } from '../services/storage';

interface DashboardProps {
  invoices: Invoice[];
  config: BimbelConfig;
  onOpenExportModal: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onDownloadInvoicePDF: (invoice: Invoice) => void;
  onNavigateToInvoices: (statusFilter?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  config,
  onOpenExportModal,
  onViewInvoice,
  onSendEmail,
  onDownloadInvoicePDF,
  onNavigateToInvoices,
}) => {
  // Metrics calculation
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivable = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);

  const paidInvoices = invoices.filter((i) => i.status === 'LUNAS');
  const pendingInvoices = invoices.filter((i) => i.status === 'MENUNGGU_PEMBAYARAN' || i.status === 'CICILAN');
  const overdueInvoices = invoices.filter((i) => i.status === 'JATUH_TEMPO');

  const collectionRate = totalBilled > 0 ? Math.round((totalReceived / totalBilled) * 100) : 0;

  // Revenue by program
  const programMap: { [key: string]: { billed: number; received: number } } = {};
  invoices.forEach((inv) => {
    const pName = inv.programName.split('(')[0].trim();
    if (!programMap[pName]) {
      programMap[pName] = { billed: 0, received: 0 };
    }
    programMap[pName].billed += inv.totalAmount;
    programMap[pName].received += inv.amountPaid;
  });

  const programList = Object.entries(programMap).sort((a, b) => b[1].billed - a[1].billed);

  // Monthly trends simulation (May - Oct 2026)
  const monthlyData = [
    { month: 'Mei', target: 8000000, actual: 7800000 },
    { month: 'Jun', target: 9000000, actual: 9200000 },
    { month: 'Jul', target: 12000000, actual: 12800000 }, // Tahun ajaran baru
    { month: 'Agu', target: 11000000, actual: 10900000 },
    { month: 'Sep', target: 10000000, actual: 9500000 },
    { month: 'Okt (Berjalan)', target: 12000000, actual: totalReceived },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.target, d.actual)));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Buku Kas &amp; Dashboard Finansial
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase">
              Tahun Ajaran 2026/2027
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Laporan rekapitulasi penerimaan uang les/SPP, pemantauan piutang siswa, dan rekonsiliasi bank harian.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenExportModal}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Ekspor Pembukuan Resmi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Realisasi Kas Masuk */}
        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Penerimaan Kas (Realisasi)
            </span>
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatIDR(totalReceived)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{paidInvoices.length} Faktur Lunas Tervalidasi</span>
            </div>
          </div>
        </div>

        {/* Card 2: Piutang Tertunda */}
        <div 
          onClick={() => onNavigateToInvoices('UNPAID')}
          className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs hover:border-slate-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Piutang Belum Tertagih
            </span>
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatIDR(totalReceivable)}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-800 font-medium">
              <span>{pendingInvoices.length} Faktur Belum Lunas</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 3: Jatuh Tempo */}
        <div 
          onClick={() => onNavigateToInvoices('JATUH_TEMPO')}
          className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs hover:border-rose-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Tunggakan Melewati Tempo
            </span>
            <div className="w-8 h-8 rounded bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold font-mono text-rose-800">
              {overdueInvoices.length} Tagihan
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-rose-700 font-medium">
              <span>Perlu surat penagihan / reminder</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-rose-400" />
            </div>
          </div>
        </div>

        {/* Card 4: Kolektibilitas */}
        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Rasio Efisiensi Penagihan
            </span>
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-900">
                {collectionRate}%
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Total {formatIDR(totalBilled)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-xs h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-slate-800 h-1.5 rounded-xs"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Monthly Revenue Chart + Program Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-300 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                Realisasi Penerimaan SPP &amp; Biaya Pendidikan
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan target rencana anggaran kas (RKA) vs kas masuk riil per bulan
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-900 rounded-xs"></span>
                <span className="text-slate-700 font-medium">Realisasi Kas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-300 rounded-xs"></span>
                <span className="text-slate-500 font-medium">Target RKA</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 pb-3">
              {monthlyData.map((item, idx) => {
                const actualPct = Math.round((item.actual / maxVal) * 100);
                const targetPct = Math.round((item.target / maxVal) * 100);
                const isCurrent = idx === monthlyData.length - 1;

                return (
                  <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-600 mb-1 group-hover:text-slate-900 font-medium">
                      {(item.actual / 1000000).toFixed(1)}M
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
                      {/* Target bar */}
                      <div
                        className="w-1/3 bg-slate-300 rounded-xs"
                        style={{ height: `${targetPct}%` }}
                        title={`Target ${item.month}: ${formatIDR(item.target)}`}
                      ></div>
                      {/* Actual bar */}
                      <div
                        className={`w-1/2 rounded-xs transition-colors ${
                          isCurrent ? 'bg-slate-900' : 'bg-slate-700 hover:bg-slate-800'
                        }`}
                        style={{ height: `${actualPct}%` }}
                        title={`Realisasi ${item.month}: ${formatIDR(item.actual)}`}
                      ></div>
                    </div>
                    <span className={`text-[11px] mt-2 font-medium truncate max-w-full ${isCurrent ? 'text-slate-900 font-bold border-b border-slate-900' : 'text-slate-600'}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>*Rekapitulasi per {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
              <span className="font-semibold text-slate-800 font-mono">Target Anggaran: Rp 62.000.000</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Program Breakdown */}
        <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-slate-900 mb-1">
              Komposisi per Program
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Rekap omset bruto berdasarkan program studi
            </p>

            <div className="space-y-3.5">
              {programList.map(([programName, data]) => {
                const percent = totalBilled > 0 ? Math.round((data.billed / totalBilled) * 100) : 0;
                return (
                  <div key={programName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate max-w-[170px]" title={programName}>
                        {programName}
                      </span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {formatIDR(data.billed)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-xs h-1.5 overflow-hidden">
                        <div
                          className="bg-slate-800 h-1.5 rounded-xs"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 w-8 text-right font-medium">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200">
            <button
              onClick={() => onNavigateToInvoices()}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <span>Buka Buku Besar Faktur</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Actionable Overdue Invoices Alert Section */}
      {overdueInvoices.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-300 rounded-lg p-5 shadow-xs">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-serif text-rose-950">
                  Daftar Tunggakan Melewati Batas Jatuh Tempo ({overdueInvoices.length} Faktur)
                </h3>
                <p className="text-xs text-rose-800">
                  Kirimkan surat tagihan resmi ke kontak wali siswa untuk kelancaran arus kas bimbingan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded border border-rose-300 p-3.5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{inv.invoiceNumber}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                      Tempo: {inv.dueDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{inv.studentName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{inv.programName}</p>
                  <div className="mt-2.5 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Sisa Tagihan:</span>
                    <span className="font-mono font-bold text-rose-700">{formatIDR(inv.remainingAmount)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSendEmail(inv)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3 h-3 text-slate-300" />
                    <span>Kirim Email</span>
                  </button>
                  <button
                    onClick={() => onDownloadInvoicePDF(inv)}
                    className="p-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                    title="Unduh PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="p-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                    title="Lihat Detail"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invoices Table Preview */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-serif text-slate-900">Catatan Penerbitan Faktur Terakhir</h2>
            <p className="text-xs text-slate-500">Daftar transaksi dan status verifikasi pembayaran siswa</p>
          </div>
          <button
            onClick={() => onNavigateToInvoices()}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Seluruh Faktur</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">No. Faktur</th>
                <th className="py-2.5 px-4">Nama Siswa &amp; Program</th>
                <th className="py-2.5 px-4">Wali Siswa</th>
                <th className="py-2.5 px-4 text-right">Nilai Tagihan</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-900">{inv.studentName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{inv.programName}</div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div>{inv.parentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{inv.parentPhone}</div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatIDR(inv.totalAmount)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onDownloadInvoicePDF(inv)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Unduh PDF Kuitansi"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSendEmail(inv)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Kirim Bukti Pembayaran ke Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
                      >
                        Periksa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
  if (status === 'LUNAS') {
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded">
        LUNAS
      </span>
    );
  }
  if (status === 'JATUH_TEMPO') {
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 rounded">
        JATUH TEMPO
      </span>
    );
  }
  if (status === 'CICILAN') {
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-400 rounded">
        CICILAN
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded">
      TERTUNDA
    </span>
  );
};
