import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Award,
  CheckCircle2,
  Printer,
  X,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Download,
  ShieldCheck,
  User,
  GraduationCap,
  Calendar,
  Building,
  TrendingUp
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SubjectScore {
  id: string;
  subjectName: string;
  score: number; // out of 100
  letterGrade: string;
  remarks?: string;
}

export interface OfficialReportCard {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  academicYear: string;
  term: string;
  dateIssued: string;
  subjects: SubjectScore[];
  averageScore: number; // out of 100
  totalMarks: number;
  totalPossibleMarks: number;
  overallLetterGrade: string;
  conduct: string;
  rank?: string;
  directorRemarks: string;
  issuedBy: string;
  status: 'Published' | 'Draft';
}

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'am';
  student: {
    id: string;
    name: string;
    grade: string;
    photo?: string;
    email?: string;
  } | null;
  existingReportCard?: OfficialReportCard | null;
  isDirector: boolean;
  onSuccessPublished?: (reportCard: OfficialReportCard) => void;
}

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Amharic Language',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Information Technology',
  'Civics & Ethical Education'
];

export const calculateLetterGrade = (score: number): string => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  lang,
  student,
  existingReportCard = null,
  isDirector,
  onSuccessPublished
}) => {
  if (!isOpen || !student) return null;

  const isViewOnly = !isDirector || Boolean(existingReportCard);

  const [term, setTerm] = useState(existingReportCard?.term || 'Semester 1');
  const [academicYear, setAcademicYear] = useState(existingReportCard?.academicYear || '2025/2026');
  const [conduct, setConduct] = useState(existingReportCard?.conduct || 'Excellent (A)');
  const [rank, setRank] = useState(existingReportCard?.rank || '1st / 40');
  const [directorRemarks, setDirectorRemarks] = useState(
    existingReportCard?.directorRemarks ||
    (lang === 'en'
      ? 'Outstanding academic performance and exemplary conduct throughout the academic semester. Highly commended.'
      : 'በዚህ የትምህርት ሴሚስተር ውስጥ የላቀ የትምህርት አፈጻጸም እና አርዓያ የሚሆን ስነ-ምግባር አሳይቷል።')
  );

  const [subjects, setSubjects] = useState<SubjectScore[]>(() => {
    if (existingReportCard?.subjects && existingReportCard.subjects.length > 0) {
      return existingReportCard.subjects;
    }
    return DEFAULT_SUBJECTS.map((name, index) => {
      const defaultScore = 85 + (index % 12);
      return {
        id: `subj-${index}`,
        subjectName: name,
        score: defaultScore,
        letterGrade: calculateLetterGrade(defaultScore),
        remarks: 'Satisfactory'
      };
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedSuccessCard, setPublishedSuccessCard] = useState<OfficialReportCard | null>(existingReportCard);

  // Dynamic calculations
  const stats = useMemo(() => {
    const validScores = subjects.map(s => Number(s.score) || 0);
    const totalMarks = validScores.reduce((sum, score) => sum + score, 0);
    const totalPossibleMarks = subjects.length * 100;
    const averageScore = subjects.length > 0 ? Number((totalMarks / subjects.length).toFixed(1)) : 0;
    const overallLetterGrade = calculateLetterGrade(averageScore);
    const isPassing = averageScore >= 50;

    return {
      totalMarks,
      totalPossibleMarks,
      averageScore,
      overallLetterGrade,
      isPassing
    };
  }, [subjects]);

  const handleScoreChange = (id: string, newScore: number) => {
    const clampedScore = Math.max(0, Math.min(100, newScore));
    setSubjects(prev =>
      prev.map(sub =>
        sub.id === id
          ? {
              ...sub,
              score: clampedScore,
              letterGrade: calculateLetterGrade(clampedScore)
            }
          : sub
      )
    );
  };

  const handleSubjectNameChange = (id: string, newName: string) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub: sub, subjectName: newName } : sub))
    );
  };

  const handleAddSubject = () => {
    const newId = `subj-${Date.now()}`;
    setSubjects(prev => [
      ...prev,
      {
        id: newId,
        subjectName: 'Elective Subject',
        score: 85,
        letterGrade: 'A-',
        remarks: 'Good'
      }
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handlePublishReportCard = async () => {
    setIsSubmitting(true);
    const reportCardId = existingReportCard?.id || `RC-${student.id}-${Date.now().toString().slice(-6)}`;
    const dateIssued = new Date().toISOString().split('T')[0];

    const reportCardData: OfficialReportCard = {
      id: reportCardId,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      academicYear,
      term,
      dateIssued,
      subjects,
      averageScore: stats.averageScore,
      totalMarks: stats.totalMarks,
      totalPossibleMarks: stats.totalPossibleMarks,
      overallLetterGrade: stats.overallLetterGrade,
      conduct,
      rank,
      directorRemarks,
      issuedBy: 'Office of the School Director',
      status: 'Published'
    };

    try {
      // 1. Save to students subcollection
      await setDoc(doc(db, 'students', student.id, 'report_cards', reportCardId), reportCardData);

      // 2. Save to global report_cards collection
      await setDoc(doc(db, 'report_cards', reportCardId), reportCardData);

      // 3. Post an official notification message to the student
      const msgId = Date.now().toString();
      const notificationMsg = {
        id: Number(msgId),
        studentId: student.id,
        from: 'School Director',
        content: lang === 'en'
          ? `Your Official Academic Report Card for ${term} (${academicYear}) has been released with an overall average of ${stats.averageScore}/100 (${stats.overallLetterGrade}). You can view and download it now.`
          : `የ${term} (${academicYear}) ይፋዊ የውጤት ካርድዎ በ${stats.averageScore}/100 (${stats.overallLetterGrade}) አማካይ ውጤት በዳይሬክተሩ ተለቋል። አሁኑኑ ማየት እና ማውረድ ይችላሉ።`,
        date: dateIssued,
        category: 'ReportCard'
      };

      try {
        await setDoc(doc(db, 'students', student.id, 'messages', msgId), notificationMsg);
      } catch (mErr) {
        console.warn('Could not write report card notification message:', mErr);
      }

      setPublishedSuccessCard(reportCardData);
      if (onSuccessPublished) {
        onSuccessPublished(reportCardData);
      }
    } catch (err) {
      console.error('Error publishing report card:', err);
      // Fallback local persistence
      setPublishedSuccessCard(reportCardData);
      if (onSuccessPublished) {
        onSuccessPublished(reportCardData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  {lang === 'en' ? 'Official Academic Credential' : 'ይፋዊ የትምህርት ማስረጃ'}
                </span>
                <span className="text-[10px] text-slate-300">
                  {academicYear} • {term}
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1">
                {lang === 'en' ? 'Official Student Report Card' : 'ይፋዊ የተማሪ የውጤት ካርድ'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(publishedSuccessCard || existingReportCard) && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'en' ? 'Print / PDF' : 'አትም'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* Student Profile Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{student.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-blue-700">ID: {student.id}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{student.grade}</span>
                </div>
              </div>
            </div>

            {/* Average Highlight Badge */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-2xl">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'en' ? 'Overall Average' : 'አጠቃላይ አማካይ'}
                </span>
                <span className="text-2xl font-black text-blue-700 font-mono">
                  {stats.averageScore}%
                </span>
                <span className="text-[11px] text-slate-500"> / 100</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-200">
                {stats.overallLetterGrade}
              </div>
            </div>
          </div>

          {/* If already published or view-only, show the certified Report Card Document */}
          {publishedSuccessCard ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">
                    {lang === 'en' ? 'Report Card Released to Student Portal' : 'የውጤት ካርዱ ወደ ተማሪዎች ገጽ ተልኳል!'}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {lang === 'en'
                      ? `Student can view their official report card anytime with an average score of ${stats.averageScore}/100.`
                      : `ተማሪው የ${stats.averageScore}/100 አማካይ ውጤት ካርዱን በተማሪ ፖርታል ማየት ይችላል።`}
                  </p>
                </div>
              </div>

              {/* Printable Official Card */}
              <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-xl space-y-6 print:m-0 print:border-none print:shadow-none">
                {/* School Header */}
                <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
                  <span className="text-xs font-black tracking-widest uppercase text-blue-900">
                    ETHIOPIAN MINISTRY OF EDUCATION CURRICULUM
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    ABUNE GORGORIOS SCHOOL
                  </h2>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Official Student Academic Performance Report Card
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Academic Year: {academicYear} • Term: {term} • Date Issued: {publishedSuccessCard.dateIssued}
                  </p>
                </div>

                {/* Student Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{lang === 'en' ? 'Student Name' : 'የተማሪ ስም'}</span>
                    <strong className="text-slate-900 text-sm">{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{lang === 'en' ? 'Student ID' : 'መታወቂያ'}</span>
                    <strong className="font-mono text-blue-800 text-sm">{student.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{lang === 'en' ? 'Grade / Level' : 'ክፍል'}</span>
                    <strong className="text-slate-900 text-sm">{student.grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{lang === 'en' ? 'Class Rank' : 'ደረጃ'}</span>
                    <strong className="text-emerald-700 text-sm">{rank}</strong>
                  </div>
                </div>

                {/* Subject Grades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-3 rounded-l-xl font-bold">{lang === 'en' ? 'Subject' : 'የትምህርት ዓይነት'}</th>
                        <th className="p-3 font-bold text-center">{lang === 'en' ? 'Max Marks' : 'ከፍተኛ'}</th>
                        <th className="p-3 font-bold text-center">{lang === 'en' ? 'Score' : 'ውጤት'}</th>
                        <th className="p-3 font-bold text-center">{lang === 'en' ? 'Letter Grade' : 'ደረጃ'}</th>
                        <th className="p-3 rounded-r-xl font-bold">{lang === 'en' ? 'Remark' : 'አስተያየት'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((sub, i) => (
                        <tr key={sub.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="p-3 font-bold text-slate-800">{sub.subjectName}</td>
                          <td className="p-3 text-center text-slate-500 font-mono">100</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">{sub.score}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              sub.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                              sub.score >= 60 ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.letterGrade}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">
                            {sub.score >= 90 ? 'Outstanding' : sub.score >= 80 ? 'Very Good' : sub.score >= 70 ? 'Good' : 'Satisfactory'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                        <td className="p-3">{lang === 'en' ? 'TOTAL & AVERAGE' : 'አጠቃላይ ድምር እና አማካይ'}</td>
                        <td className="p-3 text-center font-mono">{stats.totalPossibleMarks}</td>
                        <td className="p-3 text-center font-mono text-blue-800 font-extrabold">{stats.totalMarks}</td>
                        <td className="p-3 text-center text-emerald-700 font-black">{stats.overallLetterGrade}</td>
                        <td className="p-3 font-mono text-emerald-800 font-extrabold">{stats.averageScore} / 100</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Conduct & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                      {lang === 'en' ? 'Student Conduct & Discipline' : 'የስነ-ምግባር ደረጃ'}
                    </span>
                    <strong className="text-slate-900">{conduct}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                      {lang === 'en' ? "Director's Official Assessment" : 'የዳይሬክተሩ ይፋዊ አስተያየት'}
                    </span>
                    <p className="text-slate-700 leading-relaxed italic">"{directorRemarks}"</p>
                  </div>
                </div>

                {/* Stamp & Signatures */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-900 flex items-center justify-center text-blue-900 font-black text-[9px] uppercase tracking-tighter text-center leading-none p-1 shadow-inner">
                      AGS<br />SEAL
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{lang === 'en' ? 'Office of the School Director' : 'የትምህርት ቤት ዳይሬክተር ቢሮ'}</span>
                      <span className="text-slate-500 text-[11px]">{lang === 'en' ? 'Officially Certified & Verified' : 'በይፋ የተረጋገጠ'}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-400 pt-2 w-48 text-center">
                    <span className="font-serif italic font-bold text-slate-800 text-sm block">Abune Gorgorios Admin</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Director Signature' : 'የዳይሬክተር ፊርማ'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Director Creation & Editing Form */
            <div className="space-y-6">
              {/* Setup Configuration */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {lang === 'en' ? 'Academic Term & Report Parameters' : 'የሴሚስተር እና የሪፖርት መረጃ'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Academic Year' : 'የትምህርት ዘመን'}
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Term / Semester' : 'ሴሚስተር'}
                    </label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Midterm Examination">Midterm Examination</option>
                      <option value="Final Academic Year">Final Academic Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Conduct Grade' : 'የስነ-ምግባር ውጤት'}
                    </label>
                    <select
                      value={conduct}
                      onChange={(e) => setConduct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Excellent (A)">Excellent (A)</option>
                      <option value="Very Good (B)">Very Good (B)</option>
                      <option value="Good (C)">Good (C)</option>
                      <option value="Satisfactory (D)">Satisfactory (D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Class Rank' : 'የክፍል ደረጃ'}
                    </label>
                    <input
                      type="text"
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      placeholder="e.g. 1st / 40"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subjects & Scores Table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      {lang === 'en' ? 'Subject Scores & Grades (Out of 100)' : 'የትምህርት ዓይነቶች እና ውጤቶች (ከ100)'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'en'
                        ? 'Director can adjust individual scores; average and letter grades calculate automatically.'
                        : 'ውጤቶችን ያስገቡ፤ አጠቃላይ አማካይ እና ደረጃ በራሱ ይሰላል።'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Add Subject' : 'ትምህርት ጨምር'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    <span className="col-span-6">{lang === 'en' ? 'Subject Name' : 'የትምህርት ዓይነት'}</span>
                    <span className="col-span-3 text-center">{lang === 'en' ? 'Score (/100)' : 'ውጤት (/100)'}</span>
                    <span className="col-span-2 text-center">{lang === 'en' ? 'Grade' : 'ደረጃ'}</span>
                    <span className="col-span-1 text-center"></span>
                  </div>

                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={sub.subjectName}
                          onChange={(e) => handleSubjectNameChange(sub.id, e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.score}
                          onChange={(e) => handleScoreChange(sub.id, Number(e.target.value))}
                          className="w-full p-2 text-center bg-white border border-slate-200 rounded-lg font-mono font-black text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-black text-xs">
                          {sub.letterGrade}
                        </span>
                      </div>

                      <div className="col-span-1 text-center">
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Average Summary Bar */}
                <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-blue-200">
                      {lang === 'en' ? 'Computed Total Average' : 'የተሰላ አጠቃላይ አማካይ'}
                    </span>
                    <div className="text-xl font-black font-mono">
                      {stats.averageScore} / 100 ({stats.overallLetterGrade})
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-blue-200 block text-[10px]">{lang === 'en' ? 'Total Marks' : 'አጠቃላይ ነጥብ'}</span>
                    <strong className="font-mono text-base">{stats.totalMarks} / {stats.totalPossibleMarks}</strong>
                  </div>
                </div>
              </div>

              {/* Director's Remarks */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                <label className="font-bold text-slate-700 block">
                  {lang === 'en' ? "Director's Official Evaluation Remarks" : 'የዳይሬክተሩ ይፋዊ አስተያየት'}
                </label>
                <textarea
                  value={directorRemarks}
                  onChange={(e) => setDirectorRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Enter official director remarks..."
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                </button>

                <button
                  type="button"
                  onClick={handlePublishReportCard}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (lang === 'en' ? 'Publishing...' : 'በማተም ላይ...')
                      : (lang === 'en' ? 'Send Report Card to Student' : 'የውጤት ካርዱን ለተማሪው ላክ')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
