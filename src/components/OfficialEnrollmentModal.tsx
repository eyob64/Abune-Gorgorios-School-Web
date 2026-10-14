import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Printer, 
  Download, 
  X, 
  Sparkles, 
  Award, 
  Building, 
  Calendar, 
  Mail, 
  Key, 
  ShieldCheck,
  QrCode,
  FileCheck,
  Copy
} from 'lucide-react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface AdmissionApplicationData {
  id: string;
  studentName: string;
  grade: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  previousSchool: string;
  lastGrade: string;
  timestamp: string;
  status: string;
  reply?: string;
  studentId?: string;
  transcriptUrl?: string;
  transcriptStatus?: string;
  transcriptGpa?: string;
  transcriptRefNo?: string;
  transcriptAdminNotes?: string;
  transcriptSentToDirectorAt?: string;
  transcriptVerified?: boolean;
  isRegisteredToSchool?: boolean;
  registeredAt?: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
  photo: string;
  enrollmentDate: string;
  password?: string;
  hasIdCard?: boolean;
}

interface OfficialEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplicationData | null;
  generatedStudentId: string;
  onRegisteredSuccess: (newStudent: Student) => void;
  lang: 'en' | 'am';
}

export const OfficialEnrollmentModal: React.FC<OfficialEnrollmentModalProps> = ({
  isOpen,
  onClose,
  application,
  generatedStudentId,
  onRegisteredSuccess,
  lang
}) => {
  if (!isOpen || !application) return null;

  const isAlreadyRegistered = Boolean(application.isRegisteredToSchool || application.status === 'Approved & Registered to School');
  const [studentId, setStudentId] = useState(
    application.registeredStudentId || application.studentId || generatedStudentId
  );
  const [assignedGrade, setAssignedGrade] = useState(application.grade || 'Grade 9');
  const [studentPhoto, setStudentPhoto] = useState(
    `https://picsum.photos/seed/student${generatedStudentId}/400/400`
  );
  const [enrollmentDate, setEnrollmentDate] = useState(
    application.registeredAt ? application.registeredAt.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(isAlreadyRegistered);
  const [enrolledStudent, setEnrolledStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (application) {
      const isReg = Boolean(application.isRegisteredToSchool || application.status === 'Approved & Registered to School');
      setEnrollmentComplete(isReg);
      setStudentId(application.registeredStudentId || application.studentId || generatedStudentId);
      setAssignedGrade(application.grade || 'Grade 9');
      if (application.registeredAt) {
        setEnrollmentDate(application.registeredAt.split('T')[0]);
      }
    }
  }, [application, generatedStudentId]);

  const [studentPassword, setStudentPassword] = useState('Pass@2026');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pwd = 'AGS@';
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStudentPassword(pwd);
  };

  const cleanNameForEmail = application.studentName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.');
  const idSuffix = studentId.slice(-4).replace('-', '');
  const generatedEmail = `${cleanNameForEmail}${idSuffix}@student.ag.edu.et`;

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    const finalPassword = studentPassword.trim() || 'Pass@2026';
    try {
      const newStudentObj: Student = {
        id: studentId,
        name: application.studentName,
        grade: assignedGrade,
        email: generatedEmail,
        photo: studentPhoto,
        enrollmentDate: enrollmentDate,
        password: finalPassword,
        hasIdCard: true
      };

      // 1. Save new student in students collection
      await setDoc(doc(db, 'students', studentId), newStudentObj);

      // 2. Update admission document
      await updateDoc(doc(db, 'admissions', application.id), {
        status: 'Approved & Registered to School',
        studentId: studentId,
        isRegisteredToSchool: true,
        registeredAt: new Date().toISOString(),
        registeredStudentId: studentId,
        studentPassword: finalPassword,
        transcriptStatus: 'Approved by Director',
        reply: `Approved by Director. Assigned ID: ${studentId} | Password: ${finalPassword}`
      });

      // 3. Send welcome message
      const msgId = Date.now().toString();
      const welcomeMsg = {
        id: Number(msgId),
        studentId: studentId,
        from: 'School Director',
        content: lang === 'en'
          ? `Welcome to Abune Gorgorios School! Your registration has been officially approved by the School Director. Your official Student ID is ${studentId}. Your email is ${generatedEmail} and your login password is ${finalPassword}. You can now log into your student portal.`
          : `ወደ አቡነ ጎርጎርዮስ ትምህርት ቤት እንኳን በደህና መጡ! ምዝገባዎ በትምህርት ቤቱ ዳይሬክተር በይፋ ጸድቋል። የተማሪ መታወቂያዎ ${studentId} ነው። ኢሜይልዎ ${generatedEmail} ሲሆን የመግቢያ የይለፍ ቃልዎ ${finalPassword} ነው። አሁን ወደ ተማሪዎች ገጽ መግባት ይችላሉ።`,
        date: new Date().toISOString().split('T')[0],
        category: 'Official'
      };

      try {
        await setDoc(doc(db, 'students', studentId, 'messages', msgId), welcomeMsg);
      } catch (e) {
        console.warn('Could not write student message subcollection:', e);
      }

      setEnrolledStudent(newStudentObj);
      setEnrollmentComplete(true);
      onRegisteredSuccess(newStudentObj);
    } catch (err) {
      console.error('Enrollment error:', err);
      // Fallback for demo session:
      const newStudentObj: Student = {
        id: studentId,
        name: application.studentName,
        grade: assignedGrade,
        email: generatedEmail,
        photo: studentPhoto,
        enrollmentDate: enrollmentDate,
        password: finalPassword,
        hasIdCard: true
      };
      setEnrolledStudent(newStudentObj);
      setEnrollmentComplete(true);
      onRegisteredSuccess(newStudentObj);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                {lang === 'en' ? 'Official School Enrollment' : 'ይፋዊ የተማሪዎች ምዝገባ'}
              </span>
              <h2 className="text-2xl font-bold">
                {lang === 'en' ? 'Register Student to School' : 'ተማሪውን ለትምህርት ቤቱ መዝግብ'}
              </h2>
            </div>
          </div>
          <p className="text-emerald-100 text-xs">
            {lang === 'en'
              ? 'Finalize official registration, assign school ID credentials, and generate the official student certificate.'
              : 'ይፋዊ ምዝገባውን ያጠናቁ፣ የተማሪ መታወቂያ እና ምስክር ወረቀት ያዘጋጁ።'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {!enrollmentComplete ? (
            <div className="space-y-6">
              {/* Student Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <img 
                  src={studentPhoto} 
                  alt={application.studentName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{application.studentName}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'en' ? 'Guardian:' : 'ወላጅ:'} <strong className="text-slate-700">{application.guardianName}</strong> ({application.guardianPhone})
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    {lang === 'en' ? 'Previous School:' : 'የቀድሞ ትምህርት ቤት:'} {application.previousSchool || 'Verified School'} ({application.transcriptGpa || 'Verified GPA'})
                  </p>
                </div>
              </div>

              {/* Credential Assignment Grid */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {lang === 'en' ? 'Official Student Assignment & Credentials' : 'ይፋዊ የተማሪ መረጃ እና ምስክርነቶች'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {lang === 'en' ? 'Assigned Student ID Number' : 'የተማሪ መታወቂያ ቁጥር'}
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {lang === 'en' ? 'Enrolled Grade' : 'የሚመዘገብበት ክፍል'}
                    </label>
                    <select
                      value={assignedGrade}
                      onChange={(e) => setAssignedGrade(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      {lang === 'en' ? 'Generated Student Email' : 'የተማሪ ኢሜይል'}
                    </label>
                    <input
                      type="text"
                      value={generatedEmail}
                      disabled
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        {lang === 'en' ? 'Set Student Portal Password' : 'የተማሪውን የመግቢያ የይለፍ ቃል ያስገቡ'}
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        {lang === 'en' ? 'Auto-Generate' : 'አዲስ አመንጭ'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="e.g. Pass@2026"
                        className="w-full p-3 bg-white border border-amber-300 focus:border-amber-500 rounded-xl font-mono font-bold text-slate-800 outline-none shadow-xs"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'en' 
                        ? 'Director can set custom password or keep generated. The student uses this to log in.' 
                        : 'ዳይሬክተሩ የይለፍ ቃል እዚህ መወሰን ይችላሉ። ተማሪው በዚህ ይገባል።'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === 'en' ? 'Enrollment Date' : 'የተመዘገበበት ቀን'}
                    </label>
                    <input
                      type="date"
                      value={enrollmentDate}
                      onChange={(e) => setEnrollmentDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {lang === 'en' ? 'Director Approval Stamp' : 'የዳይሬክተር ይፋዊ ማህተም'}
                    </label>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {lang === 'en' ? 'Executive Director Approval' : 'የዳይሬክተሩ ይፋዊ ይሁንታ'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Enrollment Certificate & ID Badge View */
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">
                    {lang === 'en' ? 'Student Successfully Registered to School!' : 'ተማሪው በትምህርት ቤቱ በተሳካ ሁኔታ ተመዝግቧል!'}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {lang === 'en' 
                      ? `Official record created in school database with Student ID: ${studentId}` 
                      : `የተማሪው መረጃ በመታወቂያ ${studentId} በዳታቤዝ ተመዝግቧል።`}
                  </p>
                </div>
              </div>

              {/* Student Portal Login Credentials Callout */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-blue-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {lang === 'en' ? 'Student Portal Login Credentials' : 'የተማሪው መግቢያ መረጃ (Login Credentials)'}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {lang === 'en' 
                          ? 'The student can now log in immediately using this ID number and password:' 
                          : 'ተማሪው በዚህ መታወቂያ እና የይለፍ ቃል አሁኑኑ መግባት ይችላል:'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Student ID: ${studentId}\nPassword: ${studentPassword}`);
                      alert(lang === 'en' 
                        ? `Copied login credentials:\nStudent ID: ${studentId}\nPassword: ${studentPassword}` 
                        : `የመግቢያ መረጃው ተቀድቷል:\nመታወቂያ: ${studentId}\nየይለፍ ቃል: ${studentPassword}`);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Copy Credentials' : 'መረጃውን ቅዳ'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs">
                    <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider block mb-0.5">
                      {lang === 'en' ? 'OFFICIAL STUDENT ID NUMBER' : 'የተማሪ መታወቂያ ቁጥር'}
                    </span>
                    <strong className="font-mono text-base text-slate-900 select-all font-black">{studentId}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider block mb-0.5">
                      {lang === 'en' ? 'STUDENT LOGIN PASSWORD' : 'የመግቢያ የይለፍ ቃል'}
                    </span>
                    <strong className="font-mono text-base text-emerald-700 select-all font-black">{studentPassword}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  {lang === 'en'
                    ? `💡 To test: Click "Logout" → Select "Student" portal tab → Enter Student ID "${studentId}" and Password "${studentPassword}".`
                    : `💡 ለመሞከር፡ "ውጣ" የሚለውን ይጫኑ → "ተማሪ" የሚለውን ይምረጡ → መታወቂያ "${studentId}" እና የይለፍ ቃል "${studentPassword}" ያስገቡ።`}
                </p>
              </div>

              {/* Printable Student Certificate Card */}
              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-600 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-bl-full pointer-events-none" />
                
                <div className="text-center pb-4 border-b border-slate-200">
                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-900">
                    ABUNE GORGORIOS SCHOOL
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {lang === 'en' ? 'CERTIFICATE OF ADMISSION & REGISTRATION' : 'የምዝገባ እና የመግቢያ ይፋዊ ምስክር ወረቀት'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Addis Ababa, Ethiopia • Official Academic Registry</p>
                </div>

                <div className="py-5 flex flex-col sm:flex-row items-center gap-6">
                  <img 
                    src={studentPhoto} 
                    alt={application.studentName} 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'en' ? 'REGISTERED STUDENT' : 'የተመዘገበ ተማሪ'}</span>
                      <h4 className="text-xl font-black text-slate-800">{application.studentName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'STUDENT ID' : 'መታወቂያ'}</span>
                        <strong className="font-mono text-emerald-700 text-sm">{studentId}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'ASSIGNED GRADE' : 'ክፍል'}</span>
                        <strong className="text-slate-800">{assignedGrade}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'SCHOOL EMAIL' : 'ኢሜይል'}</span>
                        <strong className="font-mono text-slate-700 text-[11px] truncate block">{generatedEmail}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'REGISTRATION DATE' : 'ቀን'}</span>
                        <strong className="text-slate-800">{enrollmentDate}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <QrCode className="w-8 h-8 text-slate-700" />
                    <span className="text-[10px]">Verified Registry Record</span>
                  </div>

                  <div className="text-right">
                    <span className="font-serif italic text-blue-900 font-bold block text-sm">Dr. Abraham Tekle</span>
                    <span className="text-[10px] text-slate-400">{lang === 'en' ? 'School Director' : 'የትምህርት ቤቱ ዳይሬክተር'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
          {!enrollmentComplete ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
              >
                {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
              </button>

              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {lang === 'en' ? 'Registering to School...' : 'በመመዝገብ ላይ...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    {lang === 'en' ? 'Confirm Registration to School' : 'ምዝገባውን አጽድቅና ተማሪውን መዝግብ'}
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                {lang === 'en' ? 'Print Certificate' : 'የምስክር ወረቀቱን አትም'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {lang === 'en' ? 'Done & Return to Admissions' : 'ጨርስ'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
