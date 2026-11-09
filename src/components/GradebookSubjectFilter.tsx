import React from 'react';
import {
  BookOpen,
  Filter,
  Check,
  ChevronDown,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Globe,
  Languages,
  Clock,
  Compass,
  TrendingUp,
  Laptop,
  Activity,
  Bookmark,
  ShieldCheck,
  Atom,
  Award,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export interface CurriculumSubject {
  id: string;
  nameEn: string;
  nameAm: string;
  code: string;
  category: 'STEM' | 'Languages' | 'Social Sciences' | 'Practical';
}

export const CURRICULUM_SUBJECTS: CurriculumSubject[] = [
  { id: 'All', nameEn: 'All Subjects', nameAm: 'ሁሉም የትምህርት ዓይነቶች', code: 'ALL', category: 'STEM' },
  { id: 'Mathematics', nameEn: 'Mathematics', nameAm: 'ሂሳብ', code: 'MATH', category: 'STEM' },
  { id: 'Physics', nameEn: 'Physics', nameAm: 'ፊዚክስ', code: 'PHYS', category: 'STEM' },
  { id: 'Chemistry', nameEn: 'Chemistry', nameAm: 'ኬሚስትሪ', code: 'CHEM', category: 'STEM' },
  { id: 'Biology', nameEn: 'Biology', nameAm: 'ባዮሎጂ', code: 'BIOL', category: 'STEM' },
  { id: 'English', nameEn: 'English', nameAm: 'እንግሊዝኛ', code: 'ENG', category: 'Languages' },
  { id: 'Amharic', nameEn: 'Amharic', nameAm: 'አማርኛ', code: 'AMH', category: 'Languages' },
  { id: 'History', nameEn: 'History', nameAm: 'ታሪክ', code: 'HIST', category: 'Social Sciences' },
  { id: 'Geography', nameEn: 'Geography', nameAm: 'ጂኦግራፊ', code: 'GEOG', category: 'Social Sciences' },
  { id: 'Economics', nameEn: 'Economics', nameAm: 'ኢኮኖሚክስ', code: 'ECON', category: 'Social Sciences' },
  { id: 'IT', nameEn: 'Information Technology (IT)', nameAm: 'የኢንፎርሜሽን ቴክኖሎጂ (IT)', code: 'IT', category: 'Practical' },
  { id: 'HPE', nameEn: 'Health & Physical Education (HPE)', nameAm: 'የጤና እና የሰውነት ማጎልመሻ (HPE)', code: 'HPE', category: 'Practical' },
  { id: 'Afan Oromo', nameEn: 'Afan Oromo', nameAm: 'አፋን ኦሮሞ', code: 'AFAN', category: 'Languages' },
  { id: 'Civics', nameEn: 'Civics & Ethics', nameAm: 'ስነ-ዜጋ እና ስነ-ምግባር', code: 'CIV', category: 'Social Sciences' },
  { id: 'General Science', nameEn: 'General Science', nameAm: 'ጠቅላላ ሳይንስ', code: 'GSCI', category: 'STEM' }
];

export const isSubjectMatch = (studentSubject: string, filterSubjectId: string): boolean => {
  if (!studentSubject || !filterSubjectId || filterSubjectId === 'All') return true;
  const s = studentSubject.toLowerCase().trim();
  const f = filterSubjectId.toLowerCase().trim();

  if (s === f) return true;

  // English & Emglish typo matching
  if ((f === 'english' || f === 'emglish') && (s === 'english' || s === 'emglish')) return true;

  // Information Technology / IT
  if (f === 'it' && (s === 'it' || s.includes('information technology') || s.includes('computer'))) return true;

  // Health and Physical Education / HPE
  if (f === 'hpe' && (s === 'hpe' || s.includes('physical education') || s.includes('health'))) return true;

  // Afan Oromo
  if (f === 'afan oromo' && (s.includes('afan') || s.includes('oromo'))) return true;

  // Civics
  if (f === 'civics' && (s.includes('civic') || s.includes('ethics'))) return true;

  // General Science
  if (f === 'general science' && (s.includes('general') || s.includes('science'))) return true;

  return s.includes(f) || f.includes(s);
};

export const getSubjectIcon = (subjectId: string) => {
  switch (subjectId) {
    case 'Mathematics': return <Calculator className="w-4 h-4 text-blue-600" />;
    case 'Physics': return <Zap className="w-4 h-4 text-amber-500" />;
    case 'Chemistry': return <FlaskConical className="w-4 h-4 text-purple-600" />;
    case 'Biology': return <Dna className="w-4 h-4 text-emerald-600" />;
    case 'English': return <Globe className="w-4 h-4 text-indigo-600" />;
    case 'Amharic': return <Languages className="w-4 h-4 text-red-500" />;
    case 'History': return <Clock className="w-4 h-4 text-amber-600" />;
    case 'Geography': return <Compass className="w-4 h-4 text-teal-600" />;
    case 'Economics': return <TrendingUp className="w-4 h-4 text-blue-500" />;
    case 'IT': return <Laptop className="w-4 h-4 text-cyan-600" />;
    case 'HPE': return <Activity className="w-4 h-4 text-emerald-500" />;
    case 'Afan Oromo': return <Bookmark className="w-4 h-4 text-orange-500" />;
    case 'Civics': return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    case 'General Science': return <Atom className="w-4 h-4 text-teal-500" />;
    default: return <BookOpen className="w-4 h-4 text-blue-600" />;
  }
};

interface GradebookSubjectFilterProps {
  selectedSubject: string;
  onSelectSubject: (subjectId: string) => void;
  lang: 'en' | 'am';
  studentsCountBySubject?: Record<string, number>;
  metrics?: {
    averageScore: number;
    passRate: number;
    topStudentName?: string;
    topStudentScore?: number;
    evaluatedCount: number;
  };
}

export const GradebookSubjectFilter: React.FC<GradebookSubjectFilterProps> = ({
  selectedSubject,
  onSelectSubject,
  lang,
  studentsCountBySubject = {},
  metrics
}) => {
  const currentSubjectObj = CURRICULUM_SUBJECTS.find(s => s.id === selectedSubject) || CURRICULUM_SUBJECTS[0];

  return (
    <div className="space-y-4 mb-6">
      {/* Dropdown Filter Bar */}
      <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                {lang === 'en' ? 'Subject Performance Filter' : 'የትምህርት ዓይነት ማጣሪያ'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                {CURRICULUM_SUBJECTS.length - 1} {lang === 'en' ? 'Subjects' : 'ትምህርቶች'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {lang === 'en'
                ? 'Filter gradebook and isolate student scores by curriculum subject'
                : 'የተማሪዎችን ውጤት በትምህርት ዓይነት ለይተው ይመልከቱ'}
            </p>
          </div>
        </div>

        {/* Dropdown Select element */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="subject-dropdown" className="text-xs font-bold text-slate-700 whitespace-nowrap hidden sm:inline">
            {lang === 'en' ? 'Filter by:' : 'አጣራ በ:'}
          </label>
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <select
              id="subject-dropdown"
              value={selectedSubject}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full appearance-none bg-white border-2 border-blue-500/30 hover:border-blue-500 text-slate-900 font-bold text-sm px-4 py-2.5 pr-10 rounded-xl shadow-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              {CURRICULUM_SUBJECTS.map((subj) => {
                const count = studentsCountBySubject[subj.id];
                return (
                  <option key={subj.id} value={subj.id}>
                    {lang === 'en' ? subj.nameEn : subj.nameAm}
                    {subj.id !== 'All' ? ` (${subj.nameAm})` : ''}
                    {count !== undefined && count > 0 ? ` • ${count} ${lang === 'en' ? 'students' : 'ተማሪዎች'}` : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-blue-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedSubject !== 'All' && (
            <button
              onClick={() => onSelectSubject('All')}
              className="px-3 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              title={lang === 'en' ? 'Reset to All Subjects' : 'ሁሉንም መልስ'}
            >
              {lang === 'en' ? 'Show All' : 'ሁሉንም'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Select Horizontal Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CURRICULUM_SUBJECTS.map((subj) => {
          const isSelected = selectedSubject === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => onSelectSubject(subj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              {getSubjectIcon(subj.id)}
              <span>{lang === 'en' ? subj.nameEn : subj.nameAm}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          );
        })}
      </div>

      {/* KPI Highlight Card when a specific subject is filtered */}
      {selectedSubject !== 'All' && metrics && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {currentSubjectObj.category}
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  CODE: {currentSubjectObj.code}
                </span>
              </div>
              <h4 className="text-xl font-black text-white flex items-center gap-2">
                {lang === 'en' ? currentSubjectObj.nameEn : currentSubjectObj.nameAm}
                <span className="text-sm font-normal text-blue-200">
                  ({lang === 'en' ? currentSubjectObj.nameAm : currentSubjectObj.nameEn})
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'en'
                  ? `Displaying student evaluations, scores, and attendance for ${currentSubjectObj.nameEn}`
                  : `የ${currentSubjectObj.nameAm} ትምህርት የተማሪዎች ውጤትና መገኘት ዝርዝር`}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                  {lang === 'en' ? 'Subject Avg' : 'አማካይ ውጤት'}
                </div>
                <div className="text-lg font-black text-white">
                  {metrics.averageScore > 0 ? `${metrics.averageScore.toFixed(1)}%` : 'N/A'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  {lang === 'en' ? 'Pass Rate' : 'የማለፍ ምጣኔ'}
                </div>
                <div className="text-lg font-black text-emerald-400">
                  {metrics.passRate}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                  {lang === 'en' ? 'Graded' : 'የተመዘገቡ'}
                </div>
                <div className="text-lg font-black text-amber-300">
                  {metrics.evaluatedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
