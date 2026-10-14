import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Info
} from 'lucide-react';

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: string | number;
  currency?: string;
  date: string;
  reference?: string;
  status: 'Verified' | 'Pending' | string;
  month?: string;
  receipt?: string | null;
}

export interface StudentOption {
  id: string;
  name: string;
  grade?: string;
  email?: string;
}

interface TuitionFeeTrendChartProps {
  payments: PaymentRecord[];
  students: StudentOption[];
  currentStudentId?: string;
  currentStudentName?: string;
  isDirector?: boolean;
  lang: 'en' | 'am';
  onPayNow?: () => void;
}

// 10 Months of the Ethiopian Academic Year (September to June)
const ACADEMIC_MONTHS = [
  { key: 'Sep', num: '09', en: 'September', am: 'መስከረም (Sep)', shortEn: 'Sep', shortAm: 'መስከ' },
  { key: 'Oct', num: '10', en: 'October', am: 'ጥቅምት (Oct)', shortEn: 'Oct', shortAm: 'ጥቅም' },
  { key: 'Nov', num: '11', en: 'November', am: 'ኅዳር (Nov)', shortEn: 'Nov', shortAm: 'ኅዳር' },
  { key: 'Dec', num: '12', en: 'December', am: 'ታኅሣሥ (Dec)', shortEn: 'Dec', shortAm: 'ታኅሣ' },
  { key: 'Jan', num: '01', en: 'January', am: 'ጥር (Jan)', shortEn: 'Jan', shortAm: 'ጥር' },
  { key: 'Feb', num: '02', en: 'February', am: 'የካቲት (Feb)', shortEn: 'Feb', shortAm: 'የካቲ' },
  { key: 'Mar', num: '03', en: 'March', am: 'መጋቢት (Mar)', shortEn: 'Mar', shortAm: 'መጋቢ' },
  { key: 'Apr', num: '04', en: 'April', am: 'ሚያዝያ (Apr)', shortEn: 'Apr', shortAm: 'ሚያዝ' },
  { key: 'May', num: '05', en: 'May', am: 'ግንቦት (May)', shortEn: 'May', shortAm: 'ግንቦ' },
  { key: 'Jun', num: '06', en: 'June', am: 'ሰኔ (Jun)', shortEn: 'Jun', shortAm: 'ሰኔ' },
];

const STANDARD_MONTHLY_FEE = 15000; // 15,000 ETB standard monthly tuition

export const TuitionFeeTrendChart: React.FC<TuitionFeeTrendChartProps> = ({
  payments,
  students,
  currentStudentId,
  currentStudentName,
  isDirector = false,
  lang,
  onPayNow
}) => {
  // If Director, allow choosing which student to inspect (or "all" for aggregate trend)
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(() => {
    if (currentStudentId) return currentStudentId;
    if (students.length > 0) return students[0].id;
    return 'all';
  });

  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly');

  // Date Range Picker State
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'sem1' | 'sem2' | 'last3' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('2025-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-06-30');

  // Active student being visualized
  const activeStudent = useMemo(() => {
    if (!isDirector && currentStudentId) {
      return {
        id: currentStudentId,
        name: currentStudentName || 'Student',
        grade: 'Grade 9'
      };
    }
    if (selectedStudentFilter === 'all') {
      return { id: 'all', name: lang === 'en' ? 'School Total Payments' : 'የትምህርት ቤቱ አጠቃላይ ክፍያዎች', grade: 'All Enrolled' };
    }
    const found = students.find(s => s.id === selectedStudentFilter);
    return found || { id: selectedStudentFilter, name: currentStudentName || selectedStudentFilter, grade: 'Enrolled' };
  }, [isDirector, currentStudentId, currentStudentName, selectedStudentFilter, students, lang]);

  // Build academic month data series for the chart (starts from ZERO real data)
  const chartData = useMemo(() => {
    // Filter academic months by date range preset
    let targetMonths = ACADEMIC_MONTHS;
    if (dateRangePreset === 'sem1') {
      targetMonths = ACADEMIC_MONTHS.slice(0, 5); // Sep - Jan
    } else if (dateRangePreset === 'sem2') {
      targetMonths = ACADEMIC_MONTHS.slice(5, 10); // Feb - Jun
    } else if (dateRangePreset === 'last3') {
      targetMonths = ACADEMIC_MONTHS.slice(4, 7); // Jan - Mar
    } else if (dateRangePreset === 'custom' && customStartDate && customEndDate) {
      const startMonth = new Date(customStartDate).getMonth() + 1;
      const endMonth = new Date(customEndDate).getMonth() + 1;
      targetMonths = ACADEMIC_MONTHS.filter(m => {
        const mNum = parseInt(m.num, 10);
        if (startMonth <= endMonth) {
          return mNum >= startMonth && mNum <= endMonth;
        }
        return mNum >= startMonth || mNum <= endMonth;
      });
      if (targetMonths.length === 0) targetMonths = ACADEMIC_MONTHS;
    }

    // Relevant payments for the chosen student or all
    const relevantPayments = payments.filter(p => {
      if (activeStudent.id === 'all') return true;
      return p.studentId === activeStudent.id;
    });

    let cumulativePaid = 0;
    let cumulativeExpected = 0;

    return targetMonths.map((m, index) => {
      cumulativeExpected += STANDARD_MONTHLY_FEE;

      // Find real matching payments for this month
      const monthPayments = relevantPayments.filter(p => {
        const d = (p.date || '').toLowerCase();
        const ref = (p.reference || '').toLowerCase();
        const monthKey = m.key.toLowerCase();
        const monthEn = m.en.toLowerCase();
        return d.includes(monthKey) || d.includes(monthEn) || ref.includes(monthKey) || ref.includes(monthEn) || (d.includes(`-${m.num}-`));
      });

      let paidAmount = 0;
      let status: 'Paid' | 'Pending' | 'Upcoming' = 'Upcoming';
      let refId = '';

      if (monthPayments.length > 0) {
        paidAmount = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const hasVerified = monthPayments.some(p => p.status === 'Verified');
        status = hasVerified ? 'Paid' : 'Pending';
        refId = monthPayments[0].reference || monthPayments[0].id;
      } else {
        // Starts genuinely from zero! No artificial mock amounts.
        paidAmount = 0;
        status = 'Upcoming';
        refId = '-';
      }

      cumulativePaid += paidAmount;

      return {
        month: lang === 'en' ? m.shortEn : m.shortAm,
        monthFull: lang === 'en' ? m.en : m.am,
        feePaid: paidAmount,
        expectedFee: STANDARD_MONTHLY_FEE,
        cumulativePaid,
        cumulativeExpected,
        status,
        refId,
        isCurrentMonth: index === 6,
      };
    });
  }, [payments, activeStudent, lang, dateRangePreset, customStartDate, customEndDate]);

  // Key performance indicators
  const kpis = useMemo(() => {
    const totalPaid = chartData.reduce((sum, d) => sum + d.feePaid, 0);
    const totalExpected = chartData.length * STANDARD_MONTHLY_FEE;
    const paidMonthsCount = chartData.filter(d => d.status === 'Paid').length;
    const pendingMonthsCount = chartData.filter(d => d.status === 'Pending').length;
    const percentComplete = Math.min(100, Math.round((totalPaid / totalExpected) * 100));

    return {
      totalPaid,
      totalExpected,
      remaining: Math.max(0, totalExpected - totalPaid),
      paidMonthsCount,
      pendingMonthsCount,
      percentComplete
    };
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs min-w-[220px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="font-black text-sm text-amber-300">{data.monthFull}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              data.status === 'Paid' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : data.status === 'Pending' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-700 text-slate-300'
            }`}>
              {data.status === 'Paid' 
                ? (lang === 'en' ? 'Paid' : 'ተከፍሏል') 
                : data.status === 'Pending' 
                  ? (lang === 'en' ? 'Pending' : 'በመጠባበቅ ላይ') 
                  : (lang === 'en' ? 'Upcoming' : 'የሚመጣ')}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{lang === 'en' ? 'Tuition Paid:' : 'የተከፈለ መጠን:'}</span>
              <span className="font-extrabold text-emerald-400">
                {Number(data.feePaid).toLocaleString()} ETB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{lang === 'en' ? 'Scheduled Standard Fee:' : 'መደበኛ ክፍያ:'}</span>
              <span className="font-medium text-slate-300">
                {Number(data.expectedFee).toLocaleString()} ETB
              </span>
            </div>
            {viewMode === 'cumulative' && (
              <div className="flex justify-between items-center pt-1 border-t border-white/10">
                <span className="text-slate-400">{lang === 'en' ? 'Cumulative Total:' : 'አጠቃላይ ድምር:'}</span>
                <span className="font-black text-blue-300">
                  {Number(data.cumulativePaid).toLocaleString()} ETB
                </span>
              </div>
            )}
            {data.refId && data.refId !== '-' && (
              <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-mono">
                <span>{lang === 'en' ? 'Reference:' : 'ማጣቀሻ:'}</span>
                <span>{data.refId}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Top Header & Student Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              {lang === 'en' ? 'Tuition Analytics' : 'የትምህርት ክፍያ ትንታኔ'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {lang === 'en' ? 'Monthly Tuition Fee Trends' : 'የወርሃዊ ትምህርት ክፍያ አዝማሚያ'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {lang === 'en' 
              ? `Visual breakdown of academic year fee contributions, payment consistency, and remaining balance for ${activeStudent.name}.`
              : `የአካዳሚክ ዓመቱን የትምህርት ክፍያ አከፋፈል፣ ወርሃዊ አዝማሚያና ቀሪ ሂሳብ የሚያሳይ ግራፍ ለ ${activeStudent.name}።`}
          </p>
        </div>

        {/* Student Selector & View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Director Student Picker */}
          {isDirector && students.length > 0 && (
            <div className="relative">
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-xs"
              >
                <option value="all">
                  {lang === 'en' ? '👥 All Students (Average Trend)' : '👥 ሁሉም ተማሪዎች (አማካኝ)'}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.grade || student.id})
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Toggle View: Monthly vs Cumulative */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'Monthly' : 'ወርሃዊ'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'Cumulative' : 'ድምር'}
            </button>
          </div>

          {/* Pay Button for Student */}
          {onPayNow && (
            <button
              type="button"
              onClick={onPayNow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Pay Tuition' : 'ክፍያ ፈጽም'}
            </button>
          )}
        </div>
      </div>

      {/* Date Range Picker Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
            {lang === 'en' ? 'Time Period Filter:' : 'የጊዜ ገደብ ማጣሪያ:'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: lang === 'en' ? 'Full Academic Year' : 'ሙሉ ዓመት (Sep-Jun)' },
            { id: 'sem1', label: lang === 'en' ? 'Semester 1 (Sep - Jan)' : 'ሴሚስተር 1' },
            { id: 'sem2', label: lang === 'en' ? 'Semester 2 (Feb - Jun)' : 'ሴሚስተር 2' },
            { id: 'last3', label: lang === 'en' ? 'Midterm Q3 (Jan - Mar)' : '3 ወራት' },
            { id: 'custom', label: lang === 'en' ? 'Custom Range' : 'ብጁ የጊዜ ገደብ' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setDateRangePreset(preset.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                dateRangePreset === preset.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {dateRangePreset === 'custom' && (
          <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold outline-none"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold outline-none"
            />
          </div>
        )}
      </div>

      {/* Start from Zero Notice if no tuition has been logged */}
      {kpis.totalPaid === 0 && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <strong className="block font-bold">
              {lang === 'en' ? 'Tuition ledger starts from 0 ETB' : 'የትምህርት ክፍያ መዝገብ ከ 0 ብር ይጀምራል'}
            </strong>
            <span className="text-blue-700">
              {lang === 'en'
                ? 'No tuition fee deposits have been verified for this period yet. Newly confirmed bank transfer receipts will display on the trendline automatically.'
                : 'ለዚህ ጊዜ የተረጋገጠ ክፍያ እስካሁን አልተመዘገበም። የተማሪዎች ክፍያ ሲረጋገጥ በግራፉ ላይ ወዲያውኑ ይታያል።'}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Paid */}
        <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl border border-blue-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              {lang === 'en' ? 'Tuition Paid to Date' : 'እስካሁን የተከፈለ'}
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              ETB
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.totalPaid.toLocaleString()} <span className="text-xs text-slate-500 font-bold">ETB</span>
          </div>
          {/* Progress bar towards 150k annual tuition */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>{kpis.percentComplete}% {lang === 'en' ? 'Completed' : 'ተጠናቋል'}</span>
              <span>{kpis.totalExpected.toLocaleString()} ETB {lang === 'en' ? 'Goal' : 'ግምት'}</span>
            </div>
            <div className="w-full h-2 bg-blue-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-700" 
                style={{ width: `${kpis.percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Standard Fee */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {lang === 'en' ? 'Standard Monthly Rate' : 'መደበኛ ወርሃዊ ክፍያ'}
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {STANDARD_MONTHLY_FEE.toLocaleString()} <span className="text-xs text-slate-500 font-bold">ETB</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {lang === 'en' ? 'Approved by Board of Trustees' : 'በትምህርት ቤቱ ቦርድ የጸደቀ'}
          </p>
        </div>

        {/* Paid Months Count */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {lang === 'en' ? 'Payment Milestones' : 'የክፍያ ደረጃዎች'}
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {kpis.paidMonthsCount} <span className="text-slate-400 text-sm font-bold">/ 10</span>{' '}
            <span className="text-xs text-slate-500 font-bold">{lang === 'en' ? 'Months' : 'ወራት'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            {kpis.pendingMonthsCount > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-amber-700 font-bold">
                  {kpis.pendingMonthsCount} {lang === 'en' ? 'Month currently pending' : 'ወር በመጠባበቅ ላይ'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 font-bold">
                  {lang === 'en' ? 'All dues up to date' : 'ክፍያዎች የተስተካከሉ'}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Payment Consistency & Status */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {lang === 'en' ? 'Account Standing' : 'የአካውንቱ ሁኔታ'}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{lang === 'en' ? 'Good Standing' : 'ጥሩ ሁኔታ'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '100% On-Time Record' : '100% በሰዓቱ የተከፈለ'}</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="bg-slate-50/70 p-5 sm:p-6 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-xs font-bold text-slate-700">
              {viewMode === 'monthly'
                ? (lang === 'en' ? 'Monthly Tuition Paid (ETB)' : 'ወርሃዊ የተከፈለ ክፍያ (ብር)')
                : (lang === 'en' ? 'Cumulative Tuition Paid (ETB)' : 'አጠቃላይ የተከፈለ ድምር (ብር)')}
            </span>
            <div className="w-3 h-3 rounded-full bg-slate-300 ml-4" />
            <span className="text-xs font-medium text-slate-500">
              {viewMode === 'monthly'
                ? (lang === 'en' ? 'Scheduled Standard (15,000 ETB)' : 'መደበኛ ክፍያ (15,000 ብር)')
                : (lang === 'en' ? 'Scheduled Target (ETB)' : 'የታለመ ድምር (ብር)')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Academic Year 2024/2025
          </span>
        </div>

        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="paidLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

              {/* Reference line for monthly standard */}
              {viewMode === 'monthly' && (
                <ReferenceLine 
                  y={STANDARD_MONTHLY_FEE} 
                  stroke="#94a3b8" 
                  strokeDasharray="4 4"
                  label={{ 
                    value: `Std ${STANDARD_MONTHLY_FEE / 1000}k ETB`, 
                    fill: '#64748b', 
                    fontSize: 10, 
                    position: 'insideTopRight' 
                  }} 
                />
              )}

              {/* Scheduled / Expected Line */}
              <Line
                type="monotone"
                dataKey={viewMode === 'monthly' ? 'expectedFee' : 'cumulativeExpected'}
                name={viewMode === 'monthly' ? (lang === 'en' ? 'Scheduled Standard' : 'መደበኛ ክፍያ') : (lang === 'en' ? 'Scheduled Target' : 'የታለመ ድምር')}
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#94a3b8' }}
              />

              {/* Actual Paid Tuition Line */}
              <Line
                type="monotone"
                dataKey={viewMode === 'monthly' ? 'feePaid' : 'cumulativePaid'}
                name={viewMode === 'monthly' ? (lang === 'en' ? 'Tuition Paid (ETB)' : 'የተከፈለ ክፍያ (ብር)') : (lang === 'en' ? 'Cumulative Paid' : 'አጠቃላይ ድምር')}
                stroke="url(#paidLineGradient)"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#1d4ed8', stroke: '#93c5fd', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Timeline Pill Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            {lang === 'en' ? '10-Month Fee Schedule & Receipts' : 'የ10 ወራት ክፍያ መርሃ-ግብር እና ደረሰኞች'}
          </h4>
          <span className="text-xs text-slate-400">
            {lang === 'en' ? 'Click month to inspect status' : 'ዝርዝር ለማየት ወሩን ይጫኑ'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {chartData.map((m) => (
            <div
              key={m.month}
              className={`p-3 rounded-2xl border text-center transition-all ${
                m.status === 'Paid'
                  ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300'
                  : m.status === 'Pending'
                    ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300 ring-2 ring-amber-200/50'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                {m.month}
              </span>

              <div className="flex items-center justify-center mb-1.5">
                {m.status === 'Paid' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {m.status === 'Pending' && (
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                )}
                {m.status === 'Upcoming' && (
                  <Calendar className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <span className={`text-[11px] font-black block ${
                m.status === 'Paid'
                  ? 'text-emerald-900'
                  : m.status === 'Pending'
                    ? 'text-amber-900'
                    : 'text-slate-400'
              }`}>
                {m.status === 'Paid' ? `${(m.feePaid / 1000)}k` : m.status === 'Pending' ? (lang === 'en' ? 'Due' : 'ያልተከፈለ') : '-'}
              </span>

              <span className="text-[9px] text-slate-400 font-mono block truncate mt-0.5">
                {m.status === 'Paid' ? 'Receipt' : m.status === 'Pending' ? 'Pending' : 'Upcoming'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Notice Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            {lang === 'en'
              ? 'Tuition payments can be verified electronically by the School Director or Finance Bureau. Official stamps are affixed automatically upon approval.'
              : 'የትምህርት ክፍያዎች በትምህርት ቤቱ ዳይሬክተር ወይም በፋይናንስ ቢሮ በኤሌክትሮኒክስ ማረጋገጫ ያገኛሉ። ይፋዊ ማህተም በራስ-ሰር ይደረጋል።'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 shrink-0">
          Abune Gorgorios Finance Registry
        </span>
      </div>
    </div>
  );
};
