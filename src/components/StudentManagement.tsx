import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  GraduationCap, 
  Receipt, 
  Phone, 
  Mail, 
  School,
  X 
} from 'lucide-react';
import { Student, ProgramLevel, BimbelConfig } from '../types/bimbel';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onCreateInvoiceForStudent: (studentId: string) => void;
  config: BimbelConfig;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onCreateInvoiceForStudent,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [name, setName] = useState('');
  const [nis, setNis] = useState(`CN-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [grade, setGrade] = useState('Kelas 12 SMA');
  const [schoolOrigin, setSchoolOrigin] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState<ProgramLevel>('INTENSIF_UTBK');
  const [programName, setProgramName] = useState('Intensif Supercamp UTBK-SNBT 2026');

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.schoolOrigin.toLowerCase().includes(q) ||
      s.programName.toLowerCase().includes(q)
    );
  });

  const handleProgramSelect = (progVal: ProgramLevel) => {
    setProgram(progVal);
    const mapName: Record<ProgramLevel, string> = {
      INTENSIF_UTBK: 'Intensif Supercamp UTBK-SNBT 2026',
      KEDINASAN_POLRI: 'Diklat Khusus Akademi Kepolisian & IPDN',
      SMA_REGULER: 'Reguler SMA Kelas 12 (Fokus Saintek/Soshum)',
      SMP_REGULER: 'Reguler SMP Kelas 9 (Persiapan SMA Unggulan)',
      SD_REGULER: 'Reguler SD Juara Kelas 6 (Bilingual & Calistung)',
      PRIVAT_KHUSUS: 'Privat Eksklusif 1-on-1 (Master Tutor)',
    };
    setProgramName(mapName[progVal]);
  };

  const handleSubmitNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name,
      nis,
      grade,
      schoolOrigin,
      parentName,
      parentPhone,
      email,
      program,
      programName,
      enrolledDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setSchoolOrigin('');
    setParentName('');
    setParentPhone('');
    setEmail('');
    setNis(`CN-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
            Buku Induk &amp; Registrasi Siswa Bimbel
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Pangkalan data peserta didik aktif, kontak wali murid, dan penerbitan faktur penagihan.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Registrasi Siswa Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-300 p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama, NIS, sekolah asal, atau nama wali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((std) => (
          <div
            key={std.id}
            className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs hover:border-slate-400 transition-colors flex flex-col justify-between"
          >
            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {std.nis}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{std.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    <span>{std.grade} &bull; {std.schoolOrigin}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-slate-700" />
                </div>
              </div>

              {/* Program Box */}
              <div className="mt-3 py-1 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Program Studi Terdaftar</span>
                <span className="font-semibold text-slate-800 text-[11px]">{std.programName}</span>
              </div>

              {/* Parent & Contact info */}
              <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                <div className="text-[11px]">
                  <span className="text-slate-400">Wali:</span> <strong className="text-slate-800">{std.parentName}</strong>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span className="font-mono">{std.parentPhone}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate font-mono">{std.email}</span>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200">
              <button
                onClick={() => onCreateInvoiceForStudent(std.id)}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-600" />
                <span>Terbitkan Faktur Siswa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-lg w-full my-6 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-slate-700">
              <h2 className="text-base font-bold font-serif tracking-tight flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-200" />
                <span>Pendaftaran Siswa Bimbel Baru</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ananda Bintang Pratama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat / Kelas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kelas 12 SMA"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Sekolah Asal</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMAN 8 Jakarta"
                    value={schoolOrigin}
                    onChange={(e) => setSchoolOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bapak Hendra"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812-3456-7890"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Email Notifikasi Tagihan</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: orangtua@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Program Bimbingan</label>
                  <select
                    value={program}
                    onChange={(e) => handleProgramSelect(e.target.value as ProgramLevel)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="INTENSIF_UTBK">Intensif Supercamp UTBK-SNBT 2026</option>
                    <option value="KEDINASAN_POLRI">Diklat Khusus Akademi Kepolisian &amp; IPDN</option>
                    <option value="SMA_REGULER">Reguler SMA Kelas 12 (Fokus Saintek/Soshum)</option>
                    <option value="SMP_REGULER">Reguler SMP Kelas 9 (Persiapan SMA Unggulan)</option>
                    <option value="SD_REGULER">Reguler SD Juara Kelas 6 (Bilingual &amp; Calistung)</option>
                    <option value="PRIVAT_KHUSUS">Privat Eksklusif 1-on-1 (Master Tutor)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-medium text-xs text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs shadow-xs transition-colors"
                >
                  Daftarkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
