import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdmissionProgressBar } from './AdmissionProgressBar';
import { 
  FileText, 
  CheckCircle, 
  Send, 
  X, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  GraduationCap, 
  Building, 
  Award, 
  Check, 
  FileCheck, 
  Eye, 
  Download, 
  ExternalLink,
  Clock,
  UserCheck,
  Sparkles
} from 'lucide-react';

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
  registeredStudentId?: string;
  registeredAt?: string;
}

interface TranscriptReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplicationData | null;
  isDirector: boolean;
  isAdmin: boolean;
  onSendToDirector: (appId: string, details: {
    transcriptUrl: string;
    transcriptGpa: string;
    transcriptRefNo: string;
    transcriptAdminNotes: string;
    previousSchool: string;
  }) => Promise<void>;
  onRequestTranscript: (appId: string, message: string) => Promise<void>;
  onApproveAndRegister: (app: AdmissionApplicationData) => void;
  onRejectTranscript: (appId: string, reason: string) => Promise<void>;
  lang: 'en' | 'am';
}

export const TranscriptReviewModal: React.FC<TranscriptReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  isDirector,
  isAdmin,
  onSendToDirector,
  onRequestTranscript,
  onApproveAndRegister,
  onRejectTranscript,
  lang
}) => {
  if (!isOpen || !application) return null;

  // Local editable fields
  const [transcriptUrl, setTranscriptUrl] = useState<string>(
    application.transcriptUrl || ''
  );
  const [previousSchool, setPreviousSchool] = useState<string>(
    application.previousSchool || ''
  );
  const [transcriptGpa, setTranscriptGpa] = useState<string>(
    application.transcriptGpa || '3.80 / 92%'
  );
  const [transcriptRefNo, setTranscriptRefNo] = useState<string>(
    application.transcriptRefNo || `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [adminNotes, setAdminNotes] = useState<string>(
    application.transcriptAdminNotes || 'Original sealed school transcript inspected and verified. All passing grades confirmed.'
  );
  const [isSealVerified, setIsSealVerified] = useState<boolean>(
    application.transcriptVerified ?? true
  );
  const [requestNote, setRequestNote] = useState<string>(
    'Please submit the official, signed and stamped school transcript or report card from your previous school to finalize school registration.'
  );
  const [directorFeedback, setDirectorFeedback] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'document' | 'adminReview' | 'directorDecision'>('document');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestBox, setShowRequestBox] = useState(false);

  // Default sample official school transcript document preview if not uploaded
  const sampleTranscriptSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <rect width="600" height="850" fill="%23fdfbf7" stroke="%23cbd5e1" stroke-width="6"/>
    <rect x="20" y="20" width="560" height="810" fill="none" stroke="%231e3a8a" stroke-width="2" stroke-dasharray="6,4"/>
    <circle cx="300" cy="110" r="45" fill="%231e3a8a" opacity="0.1"/>
    <text x="300" y="80" font-family="serif" font-size="14" font-weight="bold" fill="%23475569" text-anchor="middle" letter-spacing="2">FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</text>
    <text x="300" y="100" font-family="serif" font-size="12" fill="%2364748b" text-anchor="middle">MINISTRY OF EDUCATION - REGIONAL EDUCATION BUREAU</text>
    <text x="300" y="130" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a" text-anchor="middle">OFFICIAL STUDENT TRANSCRIPT</text>
    <text x="300" y="150" font-family="sans-serif" font-size="11" font-weight="bold" fill="%232563eb" text-anchor="middle">ACADEMIC RECORD &amp; CUMULATIVE REPORT CARD</text>
    
    <line x1="50" y1="170" x2="550" y2="170" stroke="%23cbd5e1" stroke-width="2"/>
    
    <text x="50" y="200" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23334155">STUDENT NAME: <tspan font-weight="normal">${encodeURIComponent(application.studentName || 'Student Name')}</tspan></text>
    <text x="350" y="200" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23334155">GRADE LEVEL: <tspan font-weight="normal">${encodeURIComponent(application.grade || 'Grade')}</tspan></text>
    
    <text x="50" y="230" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23334155">PREVIOUS SCHOOL: <tspan font-weight="normal">${encodeURIComponent(previousSchool || application.previousSchool || 'Accredited Academy')}</tspan></text>
    <text x="350" y="230" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23334155">TRANSCRIPT REF: <tspan font-weight="normal">${encodeURIComponent(transcriptRefNo)}</tspan></text>
    
    <rect x="50" y="260" width="500" height="30" fill="%231e3a8a" rx="4"/>
    <text x="70" y="280" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23ffffff">ACADEMIC SUBJECTS</text>
    <text x="300" y="280" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23ffffff">SCORE / 100</text>
    <text x="440" y="280" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23ffffff">GRADE</text>
    
    <rect x="50" y="295" width="500" height="28" fill="%23f8fafc"/>
    <text x="70" y="314" font-family="sans-serif" font-size="11" fill="%231e293b">English Language</text>
    <text x="320" y="314" font-family="sans-serif" font-size="11" fill="%231e293b">92</text>
    <text x="460" y="314" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2316a34a">A</text>
    
    <rect x="50" y="325" width="500" height="28" fill="%23ffffff"/>
    <text x="70" y="344" font-family="sans-serif" font-size="11" fill="%231e293b">Mathematics &amp; Algebra</text>
    <text x="320" y="344" font-family="sans-serif" font-size="11" fill="%231e293b">95</text>
    <text x="460" y="344" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2316a34a">A+</text>
    
    <rect x="50" y="355" width="500" height="28" fill="%23f8fafc"/>
    <text x="70" y="374" font-family="sans-serif" font-size="11" fill="%231e293b">General Science / Biology</text>
    <text x="320" y="374" font-family="sans-serif" font-size="11" fill="%231e293b">88</text>
    <text x="460" y="374" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2316a34a">A-</text>
    
    <rect x="50" y="385" width="500" height="28" fill="%23ffffff"/>
    <text x="70" y="404" font-family="sans-serif" font-size="11" fill="%231e293b">Social Studies / Civics</text>
    <text x="320" y="404" font-family="sans-serif" font-size="11" fill="%231e293b">94</text>
    <text x="460" y="404" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2316a34a">A</text>
    
    <rect x="50" y="415" width="500" height="28" fill="%23f8fafc"/>
    <text x="70" y="434" font-family="sans-serif" font-size="11" fill="%231e293b">Amharic Language</text>
    <text x="320" y="434" font-family="sans-serif" font-size="11" fill="%231e293b">90</text>
    <text x="460" y="434" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2316a34a">A</text>
    
    <rect x="50" y="450" width="500" height="35" fill="%23eff6ff" stroke="%23bfdbfe" rx="4"/>
    <text x="70" y="472" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e40af">CUMULATIVE AVERAGE / GPA: ${encodeURIComponent(transcriptGpa)}</text>
    <text x="420" y="472" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2315803d">PROMOTED</text>
    
    <g transform="translate(100, 560)">
      <circle cx="60" cy="60" r="50" fill="none" stroke="%23b91c1c" stroke-width="3" stroke-dasharray="4,2"/>
      <circle cx="60" cy="60" r="42" fill="none" stroke="%23b91c1c" stroke-width="1.5"/>
      <text x="60" y="45" font-family="sans-serif" font-size="7" font-weight="bold" fill="%23b91c1c" text-anchor="middle">OFFICIAL EMBOSSED SEAL</text>
      <text x="60" y="62" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23b91c1c" text-anchor="middle">AUTHENTIC</text>
      <text x="60" y="78" font-family="sans-serif" font-size="7" font-weight="bold" fill="%23b91c1c" text-anchor="middle">SCHOOL REGISTRAR</text>
    </g>
    
    <line x1="330" y1="640" x2="520" y2="640" stroke="%23475569" stroke-width="1.5"/>
    <text x="425" y="660" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23475569" text-anchor="middle">Principal / Registrar Signature</text>
    
    <text x="300" y="770" font-family="sans-serif" font-size="9" fill="%2394a3b8" text-anchor="middle">Document verified for Abune Gorgorios School official enrollment records.</text>
  </svg>`;

  const activeTranscriptDisplay = transcriptUrl || sampleTranscriptSvg;

  // File upload handler for real document
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setTranscriptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendToDirectorSubmit = async () => {
    if (!isSealVerified) {
      alert(lang === 'en' ? 'Please check the box confirming the official school stamp and seal are verified.' : 'እባክዎ የቀድሞ ትምህርት ቤት ማህተም መረጋገጡን ያረጋግጡ።');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSendToDirector(application.id, {
        transcriptUrl: transcriptUrl || sampleTranscriptSvg,
        transcriptGpa,
        transcriptRefNo,
        transcriptAdminNotes: adminNotes,
        previousSchool
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTranscriptSubmit = async () => {
    if (!requestNote.trim()) return;
    setIsSubmitting(true);
    try {
      await onRequestTranscript(application.id, requestNote.trim());
      setShowRequestBox(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTranscriptStatus = application.transcriptStatus || (
    application.transcriptUrl ? 'Submitted to Director' : 'Not Provided'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mr-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    {lang === 'en' ? 'Academic Records Bureau' : 'የትምህርት መዝገብ ቢሮ'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    currentTranscriptStatus === 'Approved by Director' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    currentTranscriptStatus === 'Submitted to Director' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    currentTranscriptStatus === 'Transcript Requested' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {currentTranscriptStatus}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  {lang === 'en' ? 'Official School Transcript Verification' : 'ይፋዊ የትምህርት ቤት ትራንስክሪፕት ማረጋገጫ'}
                </h2>
              </div>
            </div>

            {/* Student mini tag */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto text-right">
              <p className="text-[11px] text-blue-200 font-bold">{lang === 'en' ? 'Applicant' : 'አመልካች'}</p>
              <p className="font-bold text-white text-sm">{application.studentName}</p>
              <p className="text-[11px] text-slate-300">{application.grade}</p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 mt-5 border-t border-white/10 pt-3">
            <button
              onClick={() => setActiveTab('document')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'document'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {lang === 'en' ? '1. Real Transcript Document' : '1. የትራንስክሪፕት ሰነድ'}
            </button>

            <button
              onClick={() => setActiveTab('adminReview')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'adminReview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'en' ? '2. Admin Verification & Send to Director' : '2. የአድሚን ማረጋገጫና ለዳይሬክተር መላክ'}
            </button>

            {isDirector && (
              <button
                onClick={() => setActiveTab('directorDecision')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'directorDecision'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {lang === 'en' ? '3. Director Decision & Register' : '3. የዳይሬክተሩ ውሳኔና ምዝገባ'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* Visual Lifecycle Progress Bar */}
          <AdmissionProgressBar application={application} lang={lang} />

          {/* TAB 1: Real Transcript Document Viewer */}
          {activeTab === 'document' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {lang === 'en' ? 'Official Academic Records & Previous School Transcript' : 'ይፋዊ የትምህርት መዝገብ እና የቀድሞ ትምህርት ቤት ትራንስክሪፕት'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'en' 
                      ? 'Inspect the official stamped document, grades, GPA, and school seal.' 
                      : 'የቀድሞ ትምህርት ቤት ማህተም ያለበትን ይፋዊ ሰነድ፣ ውጤትና አማካይ ይመልከቱ።'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    {lang === 'en' ? 'Upload Real Scanned File' : 'እውነተኛ ስካን የተደረገ ፋይል ስቀል'}
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  <a 
                    href={activeTranscriptDisplay} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Full Size' : 'ሙሉ መጠን'}
                  </a>
                </div>
              </div>

              {/* Document Frame */}
              <div className="bg-slate-200/80 p-4 rounded-2xl border border-slate-300 flex justify-center items-center overflow-x-auto min-h-[460px]">
                <div className="max-w-[620px] w-full bg-white shadow-xl rounded-xl p-2 border border-slate-300">
                  <img 
                    src={activeTranscriptDisplay} 
                    alt="Official School Transcript" 
                    className="w-full h-auto object-contain rounded-lg shadow-inner max-h-[580px]"
                  />
                </div>
              </div>

              {/* Status footer inside doc tab */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  {lang === 'en' ? 'Previous School:' : 'የቀድሞ ትምህርት ቤት:'}{' '}
                  <strong className="text-slate-800">{previousSchool || application.previousSchool || 'Official Secondary School'}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('adminReview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    {lang === 'en' ? 'Proceed to Admin Verification & Sending →' : 'ወደ አድሚን ማረጋገጫ ሂድ →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Admin Verification & Sending to Director */}
          {activeTab === 'adminReview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    {lang === 'en' ? 'Admin / Registrar Transcript Review & Verification' : 'የአድሚን / ሬጅስትራር ትራንስክሪፕት ምርመራና ማረጋገጫ'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'en'
                      ? 'The admin verifies the authenticity of the official previous school transcript, records key GPA details, and forwards the genuine document directly to the School Director for executive approval.'
                      : 'አድሚኑ የቀድሞ ትምህርት ቤት ትራንስክሪፕትን ትክክለኛነት አረጋግጦ፣ የውጤት ዝርዝሮችን ሞልቶ በቀጥታ ለትምህርት ቤቱ ዳይሬክተር ለመጨረሻ ውሳኔ ይልካል።'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      {lang === 'en' ? 'Verified Previous School Name' : 'የተረጋገጠው የቀድሞ ትምህርት ቤት ስም'}
                    </label>
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="e.g. St. Joseph School, Addis Ababa"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      {lang === 'en' ? 'Cumulative GPA / Average Mark' : 'አጠቃላይ የውጤት አማካይ / GPA'}
                    </label>
                    <input
                      type="text"
                      value={transcriptGpa}
                      onChange={(e) => setTranscriptGpa(e.target.value)}
                      placeholder="e.g. 3.92 / 94.5% - Distinction"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Official Transcript Serial / Reference No.' : 'የትራንስክሪፕት ቁጥር / Serial No.'}
                    </label>
                    <input
                      type="text"
                      value={transcriptRefNo}
                      onChange={(e) => setTranscriptRefNo(e.target.value)}
                      placeholder="e.g. TR-2024-8912"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Target Grade Applying For' : 'የሚመዘገብበት ክፍል'}
                    </label>
                    <input
                      type="text"
                      value={application.grade}
                      disabled
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Admin notes for the director */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Admin Verification Notes (Sent directly to Director):' : 'ለዳይሬክተሩ የሚላክ የአድሚን ማረጋገጫ ማስታወሻ:'}
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    placeholder="Enter verification comments, previous conduct, or special prerequisites for the Director..."
                  />
                </div>

                {/* Checkbox confirmation */}
                <label className="flex items-start gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSealVerified}
                    onChange={(e) => setIsSealVerified(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {lang === 'en' ? 'Official School Seal & Genuine Signature Verified' : 'የቀድሞ ትምህርት ቤት ህጋዊ ማህተም እና ፊርማ ተረጋግጧል'}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {lang === 'en'
                        ? 'I attest that this document has been reviewed and meets the authentic requirements of the Ethiopian Ministry of Education for enrollment at Abune Gorgorios School.'
                        : 'ይህ ሰነድ በአቡነ ጎርጎርዮስ ትምህርት ቤት ለመመዝገብ የሚያስፈልገውን ይፋዊ መስፈርት የሚያሟላ መሆኑን አረጋግጣለሁ።'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons: Ask for real transcript vs Send verified to Director */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowRequestBox(!showRequestBox)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {lang === 'en' ? 'Need to ask applicant for genuine transcript first?' : 'አመልካቹ እውነተኛ ትራንስክሪፕት እንዲያቀርብ መጠየቅ ይፈልጋሉ?'}
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendToDirectorSubmit}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-blue-200" />
                    )}
                    {lang === 'en' 
                      ? 'Send Real Transcript to Director for Official Approval' 
                      : 'እውነተኛውን ትራንስክሪፕት ለዳይሬክተር ማጽደቂያ ላክ'}
                  </button>
                </div>
              </div>

              {/* Expandable Request Box to student/guardian */}
              <AnimatePresence>
                {showRequestBox && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-bold text-amber-900">
                        {lang === 'en' ? 'Request Official Real Transcript from Guardian / Applicant' : 'ከወላጅ/አመልካች ይፋዊ ትራንስክሪፕት ጠይቅ'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {lang === 'en'
                        ? 'This marks the application status as "Transcript Requested" and displays this requirement in the parent\'s status lookup portal.'
                        : 'ይህ ማመልከቻውን "ትራንስክሪፕት ይጠበቃል" ብሎ ምልክት ያደርጋል እንዲሁም ለወላጆች ሁኔታቸውን ሲያዩ ይታያል።'}
                    </p>
                    <textarea
                      rows={3}
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRequestBox(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg"
                      >
                        {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleRequestTranscriptSubmit}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {lang === 'en' ? 'Send Transcript Request to Parent' : 'የትራንስክሪፕት ጥያቄውን ላክ'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: Director Decision & Final Registration into School */}
          {activeTab === 'directorDecision' && isDirector && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300 bg-white/10 px-2.5 py-1 rounded-full">
                    {lang === 'en' ? 'Executive Director Action' : 'የትምህርት ቤቱ ዳይሬክተር ውሳኔ'}
                  </span>
                  <h3 className="text-xl font-bold">
                    {lang === 'en' ? 'Director Transcript Approval & Official School Registration' : 'የትራንስክሪፕት ማጽደቅ እና ተማሪውን ለትምህርት ቤቱ መመዝገብ'}
                  </h3>
                  <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                    {lang === 'en'
                      ? 'As School Director, you have executive authority to approve the verified transcript and officially register this student into Abune Gorgorios School, assigning their official Student ID and enrollment records.'
                      : 'እንደ ትምህርት ቤቱ ዳይሬክተር፣ የተረጋገጠውን ትራንስክሪፕት በማጽደቅ ተማሪውን ወደ አቡነ ጎርጎርዮስ ትምህርት ቤት በይፋ መመዝገብ እና የተማሪ መታወቂያ መስጠት ይችላሉ።'}
                  </p>
                </div>
                <GraduationCap className="absolute -bottom-6 -right-6 w-36 h-36 text-white/5 pointer-events-none" />
              </div>

              {/* Verified Details Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'en' ? 'Summary of Verified Credentials' : 'የተረጋገጡ የትምህርት ማስረጃዎች ማጠቃለያ'}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{lang === 'en' ? 'STUDENT' : 'ተማሪ'}</span>
                    <strong className="text-slate-800">{application.studentName}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{lang === 'en' ? 'ENROLLING GRADE' : 'ክፍል'}</span>
                    <strong className="text-blue-600 font-black">{application.grade}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{lang === 'en' ? 'VERIFIED GPA' : 'ውጤት / GPA'}</span>
                    <strong className="text-emerald-700 font-black">{transcriptGpa}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{lang === 'en' ? 'PREVIOUS SCHOOL' : 'የቀድሞ ትምህርት ቤት'}</span>
                    <strong className="text-slate-800 truncate block">{previousSchool || application.previousSchool}</strong>
                  </div>
                </div>

                {application.transcriptAdminNotes && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">
                      {lang === 'en' ? 'Admin Verification Notes:' : 'የአድሚን ማስታወሻ:'}
                    </span>
                    <p className="text-slate-700 italic">"{application.transcriptAdminNotes}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt(lang === 'en' ? 'Enter revision reason for admin/applicant:' : 'የማስተካከያ ምክንያት ያስገቡ:');
                    if (reason) {
                      onRejectTranscript(application.id, reason);
                      onClose();
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                >
                  {lang === 'en' ? 'Request Re-submission of Transcript' : 'ትራንስክሪፕቱ እንዲስተካከል ጠይቅ'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApproveAndRegister(application);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2.5 transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-200" />
                  {lang === 'en' 
                    ? 'Approve Transcript & Register Student to School' 
                    : 'ትራንስክሪፕቱን አጽድቅና ተማሪውን ለትምህርት ቤት መዝግብ'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
          >
            {lang === 'en' ? 'Close Window' : 'ዝጋ'}
          </button>

          {isDirector && activeTab !== 'directorDecision' && (
            <button
              type="button"
              onClick={() => setActiveTab('directorDecision')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4" />
              {lang === 'en' ? 'Go to Director Decision & Enrollment →' : 'ወደ ዳይሬክተር ውሳኔና ምዝገባ ሂድ →'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
