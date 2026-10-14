import React from 'react';
import { 
  CheckCircle2, 
  FileText, 
  FileCheck, 
  Award, 
  GraduationCap, 
  Clock, 
  AlertCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

export interface AdmissionApplicationStatusData {
  id: string;
  studentName?: string;
  grade?: string;
  status?: string;
  transcriptStatus?: string;
  transcriptVerified?: boolean;
  transcriptUrl?: string;
  transcriptGpa?: string;
  transcriptRefNo?: string;
  isRegisteredToSchool?: boolean;
  registeredStudentId?: string;
  studentId?: string;
  timestamp?: string;
}

interface AdmissionProgressBarProps {
  application: AdmissionApplicationStatusData;
  lang?: 'en' | 'am';
  compact?: boolean;
}

export const AdmissionProgressBar: React.FC<AdmissionProgressBarProps> = ({
  application,
  lang = 'en',
  compact = false
}) => {
  const isRejected = application.status === 'Rejected' || application.transcriptStatus === 'Rejected';
  const isEnrolled = !!application.isRegisteredToSchool || application.status === 'Approved & Registered to School';
  const isDirectorApproved = application.transcriptStatus === 'Approved by Director' || (application.status === 'Approved' && !isEnrolled);
  const isSubmittedToDirector = application.transcriptStatus === 'Submitted to Director';
  const isTranscriptVerified = !!application.transcriptVerified || isSubmittedToDirector || isDirectorApproved || isEnrolled;

  // Determine current active step (1 to 4) and overall percentage
  let activeStepIndex = 1; // 0-based: 0 = Online Reg, 1 = Transcript, 2 = Director Review, 3 = Enrollment
  let progressPercent = 25;
  let currentStepTitleEn = 'Online Registration';
  let currentStepTitleAm = 'የመስመር ላይ ምዝገባ';
  let currentStatusDescEn = 'Application Submitted';
  let currentStatusDescAm = 'ማመልከቻው ቀርቧል';

  if (isEnrolled) {
    activeStepIndex = 3;
    progressPercent = 100;
    currentStepTitleEn = 'Enrollment Completed';
    currentStepTitleAm = 'ምዝገባው ተጠናቋል';
    currentStatusDescEn = `Enrolled to School (${application.studentId || application.registeredStudentId || 'Active'})`;
    currentStatusDescAm = `ለትምህርት ቤት ተመዝግቧል (${application.studentId || application.registeredStudentId || 'ገባሪ'})`;
  } else if (isDirectorApproved) {
    activeStepIndex = 3;
    progressPercent = 85;
    currentStepTitleEn = 'Enrollment';
    currentStepTitleAm = 'ይፋዊ ምዝገባ';
    currentStatusDescEn = 'Approved by Director - Ready for Registration';
    currentStatusDescAm = 'በዳይሬክተር ጸድቋል - ለምዝገባ ዝግጁ';
  } else if (isSubmittedToDirector) {
    activeStepIndex = 2;
    progressPercent = 65;
    currentStepTitleEn = 'Director Review';
    currentStepTitleAm = 'የዳይሬክተር ግምገማ';
    currentStatusDescEn = 'Verified Transcript Submitted to Director';
    currentStatusDescAm = 'የተረጋገጠ ትራንስክሪፕት ለዳይሬክተር ቀርቧል';
  } else if (isTranscriptVerified) {
    activeStepIndex = 2;
    progressPercent = 55;
    currentStepTitleEn = 'Director Review';
    currentStepTitleAm = 'የዳይሬክተር ግምገማ';
    currentStatusDescEn = 'Admin Attested - Awaiting Director Action';
    currentStatusDescAm = 'በአድሚን ተረጋግጧል - የዳይሬክተር ውሳኔ ይጠበቃል';
  } else if (application.transcriptStatus === 'Transcript Requested') {
    activeStepIndex = 1;
    progressPercent = 35;
    currentStepTitleEn = 'Transcript Verification';
    currentStepTitleAm = 'የትራንስክሪፕት ማረጋገጫ';
    currentStatusDescEn = 'Official Transcript Requested from Guardian';
    currentStatusDescAm = 'ይፋዊ ትራንስክሪፕት ከወላጅ/አመልካች ተጠይቋል';
  } else if (application.transcriptUrl) {
    activeStepIndex = 1;
    progressPercent = 40;
    currentStepTitleEn = 'Transcript Verification';
    currentStepTitleAm = 'የትራንስክሪፕት ማረጋገጫ';
    currentStatusDescEn = 'Document Uploaded - Awaiting Admin Verification';
    currentStatusDescAm = 'ሰነድ ተሰቅሏል - የአድሚን ማረጋገጫ በመጠባበቅ ላይ';
  } else {
    activeStepIndex = 1;
    progressPercent = 25;
    currentStepTitleEn = 'Transcript Verification';
    currentStepTitleAm = 'የትራንስክሪፕት ማረጋገጫ';
    currentStatusDescEn = 'Pending Previous School Official Transcript';
    currentStatusDescAm = 'የቀድሞ ትምህርት ቤት ትራንስክሪፕት ያስፈልጋል';
  }

  // Define the 4 steps
  const steps = [
    {
      id: 1,
      titleEn: 'Online Registration',
      titleAm: 'የመስመር ላይ ምዝገባ',
      shortEn: 'Registration',
      shortAm: 'ምዝገባ',
      icon: FileText,
      isCompleted: true, // Application is in the database
      isCurrent: activeStepIndex === 0 && !isEnrolled,
      statusNoteEn: application.timestamp ? new Date(application.timestamp).toLocaleDateString() : 'Submitted',
      statusNoteAm: 'ተልኳል'
    },
    {
      id: 2,
      titleEn: 'Transcript Verification',
      titleAm: 'የትራንስክሪፕት ማረጋገጫ',
      shortEn: 'Transcript',
      shortAm: 'ትራንስክሪፕት',
      icon: FileCheck,
      isCompleted: isTranscriptVerified,
      isCurrent: activeStepIndex === 1 && !isRejected,
      statusNoteEn: isTranscriptVerified 
        ? (application.transcriptGpa ? `GPA: ${application.transcriptGpa}` : 'Verified ✓')
        : application.transcriptStatus === 'Transcript Requested'
          ? 'Requested ⚠'
          : application.transcriptUrl
            ? 'Uploaded'
            : 'Pending',
      statusNoteAm: isTranscriptVerified ? 'ተረጋግጧል ✓' : 'በመጠባበቅ ላይ'
    },
    {
      id: 3,
      titleEn: 'Director Review',
      titleAm: 'የዳይሬክተር ግምገማ',
      shortEn: 'Director Review',
      shortAm: 'የዳይሬክተር ግምገማ',
      icon: Award,
      isCompleted: isDirectorApproved || isEnrolled,
      isCurrent: activeStepIndex === 2 && !isRejected,
      statusNoteEn: (isDirectorApproved || isEnrolled) 
        ? 'Approved ✓' 
        : isSubmittedToDirector 
          ? 'Awaiting Director' 
          : 'Pending',
      statusNoteAm: (isDirectorApproved || isEnrolled) ? 'ጸድቋል ✓' : 'በመጠባበቅ ላይ'
    },
    {
      id: 4,
      titleEn: 'Enrollment',
      titleAm: 'ይፋዊ ምዝገባ',
      shortEn: 'Enrollment',
      shortAm: 'ምዝገባ',
      icon: GraduationCap,
      isCompleted: isEnrolled,
      isCurrent: activeStepIndex === 3 && !isRejected && !isEnrolled,
      statusNoteEn: isEnrolled 
        ? (application.studentId ? `ID: ${application.studentId}` : 'Enrolled ✓') 
        : isDirectorApproved 
          ? 'Ready to Enroll' 
          : 'Final Step',
      statusNoteAm: isEnrolled ? 'ተመዝግቧል ✓' : 'የመጨረሻ ደረጃ'
    }
  ];

  return (
    <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      {/* Header with Title and Current Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {isEnrolled ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : isRejected ? (
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block leading-tight">
              {lang === 'en' ? 'Admissions Lifecycle Funnel' : 'የተማሪዎች ቅበላ ሂደት ደረጃ'}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {lang === 'en' ? 'Current Stage:' : 'የአሁኑ ደረጃ:'}{' '}
              <strong className={isEnrolled ? 'text-emerald-700 font-extrabold' : isRejected ? 'text-rose-700 font-extrabold' : 'text-blue-700 font-extrabold'}>
                {lang === 'en' ? currentStepTitleEn : currentStepTitleAm}
              </strong>
            </span>
          </div>
        </div>

        {/* Progress percent badge & status note */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold ${
            isEnrolled 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : isRejected 
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {isEnrolled ? '100% Completed' : isRejected ? 'Rejected' : `${progressPercent}% Progress`}
          </span>

          <span className="text-[11px] text-slate-500 font-medium hidden md:inline truncate max-w-[220px]">
            ({lang === 'en' ? currentStatusDescEn : currentStatusDescAm})
          </span>
        </div>
      </div>

      {/* Visual Progress Bar Track */}
      <div className="relative">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              isEnrolled 
                ? 'bg-emerald-500 shadow-xs shadow-emerald-200' 
                : isRejected 
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500'
            }`}
            style={{ width: `${isRejected ? 35 : progressPercent}%` }}
          />
        </div>
      </div>

      {/* Four Steps Grid / Stepper Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isNodeCompleted = step.isCompleted;
          const isNodeCurrent = step.isCurrent;
          const isUpcoming = !isNodeCompleted && !isNodeCurrent;

          return (
            <div 
              key={step.id} 
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                isNodeCompleted 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : isNodeCurrent 
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-100 shadow-xs text-blue-950'
                    : isRejected && idx === activeStepIndex
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-white/80 border-slate-200/80 text-slate-600 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-bold transition-transform ${
                  isNodeCompleted 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : isNodeCurrent 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 animate-pulse'
                      : isRejected && idx === activeStepIndex
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {isNodeCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block leading-tight">
                    {lang === 'en' ? `Step ${step.id}` : `ደረጃ ${step.id}`}
                  </span>
                  <h5 className="text-xs font-bold truncate text-slate-900">
                    {lang === 'en' ? step.titleEn : step.titleAm}
                  </h5>
                </div>
              </div>

              {/* Status Note under node */}
              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[10px]">
                <span className={`font-semibold truncate ${
                  isNodeCompleted 
                    ? 'text-emerald-700' 
                    : isNodeCurrent 
                      ? 'text-blue-700 font-bold' 
                      : 'text-slate-400'
                }`}>
                  {lang === 'en' ? step.statusNoteEn : step.statusNoteAm}
                </span>

                {isNodeCompleted && (
                  <span className="text-[9px] uppercase tracking-wide font-extrabold text-emerald-600">
                    ✓ Done
                  </span>
                )}
                {isNodeCurrent && (
                  <span className="text-[9px] uppercase tracking-wide font-extrabold text-blue-600 animate-pulse">
                    Active
                  </span>
                )}
                {isUpcoming && (
                  <span className="text-[9px] text-slate-400">
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
