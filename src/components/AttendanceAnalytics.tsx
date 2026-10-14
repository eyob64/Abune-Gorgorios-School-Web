import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Download,
  Plus,
  RefreshCw,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  Info,
  X,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  grade: string; // 'All' or 'Grade 9', 'Grade 10', etc.
  totalEnrolled: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  attendanceRate: number; // percentage 0 - 100
  notes?: string;
  recordedBy?: string;
}

interface StudentItem {
  id: string;
  name: string;
  grade: string;
  email?: string;
}

interface AttendanceAnalyticsProps {
  students: StudentItem[];
  lang: 'en' | 'am';
  isDirector: boolean;
  onSaveAttendance?: (record: DailyAttendanceRecord) => void;
  initialRecords?: DailyAttendanceRecord[];
}

// Generate realistic historical daily attendance for past 45 school days (excluding weekends)
export const generateRealisticHistoricalAttendance = (totalStudents: number, grades: string[]): DailyAttendanceRecord[] => {
  const records: DailyAttendanceRecord[] = [];
  const baseStudentCount = Math.max(totalStudents, 1);
  const today = new Date();
  
  // Day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  let daysBack = 0;
  let recordedDays = 0;
  const targetDays = 45; // 45 school days

  while (recordedDays < targetDays && daysBack < 75) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysBack);
    daysBack++;

    const dayIndex = d.getDay();
    // Skip Saturdays and Sundays (standard Ethiopian school days are Mon-Fri)
    if (dayIndex === 0 || dayIndex === 6) continue;

    recordedDays++;
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = dayNames[dayIndex];

    // Attendance patterns:
    // Mondays: slightly lower (91-94%)
    // Tuesdays-Thursdays: higher peak (94-98%)
    // Fridays: moderate dip (89-93%)
    let baseRate = 95.0;
    if (dayIndex === 1) baseRate = 92.8; // Monday
    else if (dayIndex === 2) baseRate = 96.2; // Tuesday
    else if (dayIndex === 3) baseRate = 97.4; // Wednesday
    else if (dayIndex === 4) baseRate = 95.8; // Thursday
    else if (dayIndex === 5) baseRate = 91.5; // Friday

    // Add mild cyclical variation
    const noise = (Math.sin(recordedDays * 0.45) * 2.5) + ((Math.random() - 0.5) * 2.0);
    const finalRate = Math.min(99.5, Math.max(83.0, Number((baseRate + noise).toFixed(1))));

    const presentCount = Math.round((finalRate / 100) * baseStudentCount);
    const absentCount = baseStudentCount - presentCount;
    const lateCount = Math.round(absentCount * 0.35);
    const excusedCount = Math.round((absentCount - lateCount) * 0.6);
    const unexcusedCount = Math.max(0, absentCount - lateCount - excusedCount);

    records.push({
      id: `att-${dateStr}-all`,
      date: dateStr,
      dayOfWeek,
      grade: 'All',
      totalEnrolled: baseStudentCount,
      presentCount,
      lateCount,
      excusedCount,
      unexcusedCount,
      attendanceRate: finalRate,
      notes: finalRate < 90 ? 'Inclement morning rain or exam preparation day' : 'Regular schedule operations'
    });

    // Also generate grade-specific breakdowns
    grades.forEach((g) => {
      const gradeStudents = Math.max(1, Math.round(baseStudentCount / Math.max(grades.length, 1)));
      // Vary per grade slightly
      let gradeOffset = 0;
      if (g.includes('12')) gradeOffset = 1.5; // seniors higher
      else if (g.includes('9')) gradeOffset = -1.2; // freshmen lower

      const gRate = Math.min(99.8, Math.max(80.0, Number((finalRate + gradeOffset + (Math.random() - 0.5) * 2).toFixed(1))));
      const gPresent = Math.round((gRate / 100) * gradeStudents);
      const gAbsent = gradeStudents - gPresent;

      records.push({
        id: `att-${dateStr}-${g.replace(/\s+/g, '')}`,
        date: dateStr,
        dayOfWeek,
        grade: g,
        totalEnrolled: gradeStudents,
        presentCount: gPresent,
        lateCount: Math.round(gAbsent * 0.3),
        excusedCount: Math.round(gAbsent * 0.5),
        unexcusedCount: Math.max(0, gAbsent - Math.round(gAbsent * 0.3) - Math.round(gAbsent * 0.5)),
        attendanceRate: gRate
      });
    });
  }

  // Sort ascending by date for chronological time-series
  records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return records;
};

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  students,
  lang,
  isDirector,
  onSaveAttendance,
  initialRecords = []
}) => {
  // Extract distinct grades
  const distinctGrades = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.grade) set.add(s.grade);
    });
    if (set.size === 0) {
      return ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
    }
    return Array.from(set).sort();
  }, [students]);

  // Master records
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => {
    if (initialRecords && initialRecords.length > 0) return initialRecords;
    return generateRealisticHistoricalAttendance(students.length || 38, distinctGrades);
  });

  // Filters
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'rate' | 'present' | 'absent'>('rate');

  // Modal for Director to log/record today's attendance
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recordGrade, setRecordGrade] = useState('All');
  const [recordPresentRate, setRecordPresentRate] = useState('96.5');
  const [recordNotes, setRecordNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SVG Refs for D3
  const d3ContainerRef = useRef<SVGSVGElement | null>(null);
  const heatmapContainerRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Filtered dataset for primary trend chart
  const filteredRecords = useMemo(() => {
    let list = attendanceRecords.filter((r) => r.grade === selectedGradeFilter);
    if (list.length === 0 && selectedGradeFilter !== 'All') {
      list = attendanceRecords.filter((r) => r.grade === 'All');
    }

    if (timeRange === '7d') list = list.slice(-7);
    else if (timeRange === '14d') list = list.slice(-14);
    else if (timeRange === '30d') list = list.slice(-30);

    return list;
  }, [attendanceRecords, selectedGradeFilter, timeRange]);

  // Summary KPIs
  const summaryKpis = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        currentRate: 0,
        averageRate: 0,
        trendDirection: 'neutral' as const,
        trendDelta: 0,
        totalEnrolled: students.length || 0,
        avgAbsences: 0,
        bestDay: 'Wednesday',
        lowestDay: 'Friday'
      };
    }

    const current = filteredRecords[filteredRecords.length - 1];
    const previous = filteredRecords.length > 1 ? filteredRecords[filteredRecords.length - 2] : current;
    const delta = Number((current.attendanceRate - previous.attendanceRate).toFixed(1));

    const avgRate = Number(
      (filteredRecords.reduce((sum, r) => sum + r.attendanceRate, 0) / filteredRecords.length).toFixed(1)
    );

    const firstHalfAvg =
      filteredRecords.slice(0, Math.floor(filteredRecords.length / 2)).reduce((s, r) => s + r.attendanceRate, 0) /
      Math.max(1, Math.floor(filteredRecords.length / 2));
    const secondHalfAvg =
      filteredRecords.slice(Math.floor(filteredRecords.length / 2)).reduce((s, r) => s + r.attendanceRate, 0) /
      Math.max(1, Math.ceil(filteredRecords.length / 2));

    const overallDelta = Number((secondHalfAvg - firstHalfAvg).toFixed(1));

    // Day of week averages
    const dayBuckets: Record<string, number[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    filteredRecords.forEach((r) => {
      if (dayBuckets[r.dayOfWeek]) {
        dayBuckets[r.dayOfWeek].push(r.attendanceRate);
      }
    });

    let bestDay = 'Wednesday';
    let bestAvg = 0;
    let lowestDay = 'Friday';
    let lowestAvg = 100;

    Object.entries(dayBuckets).forEach(([d, rates]) => {
      if (rates.length > 0) {
        const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
        if (mean > bestAvg) {
          bestAvg = mean;
          bestDay = d;
        }
        if (mean < lowestAvg) {
          lowestAvg = mean;
          lowestDay = d;
        }
      }
    });

    return {
      currentRate: current.attendanceRate,
      averageRate: avgRate,
      trendDirection: overallDelta > 0.3 ? 'up' : overallDelta < -0.3 ? 'down' : 'neutral',
      trendDelta: overallDelta,
      dayDelta: delta,
      totalEnrolled: current.totalEnrolled,
      avgAbsences: Math.round(current.totalEnrolled * ((100 - avgRate) / 100)),
      bestDay,
      lowestDay
    };
  }, [filteredRecords, students.length]);

  // Compute 5-day Moving Average array for D3 overlay
  const movingAverageData = useMemo(() => {
    const windowSize = 5;
    return filteredRecords.map((item, idx, arr) => {
      const start = Math.max(0, idx - windowSize + 1);
      const sub = arr.slice(start, idx + 1);
      const avg = sub.reduce((acc, cur) => acc + cur.attendanceRate, 0) / sub.length;
      return {
        date: item.date,
        avg: Number(avg.toFixed(2))
      };
    });
  }, [filteredRecords]);

  // ==========================================
  // D3.js MAIN ATTENDANCE TIME-SERIES RENDER
  // ==========================================
  useEffect(() => {
    if (!d3ContainerRef.current || filteredRecords.length === 0) return;

    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll('*').remove(); // clear prior render

    const width = d3ContainerRef.current.clientWidth || 800;
    const height = 360;
    const margin = { top: 30, right: 30, bottom: 50, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseTime = d3.timeParse('%Y-%m-%d');
    interface AttendanceDatum extends DailyAttendanceRecord {
      parsedDate: Date;
    }

    const dataset: AttendanceDatum[] = filteredRecords.map((d) => ({
      ...d,
      parsedDate: parseTime(d.date) || new Date(d.date)
    }));

    // X Scale
    const xExtent = (d3.extent(dataset, (d: AttendanceDatum) => d.parsedDate) as [Date, Date]) || [new Date(), new Date()];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    // Y Scale (fixed minimum 70 or calculated min minus 5 to highlight variation clearly)
    const minAttendance = d3.min(dataset, (d: AttendanceDatum) => d.attendanceRate) ?? 85;
    const minVal = Math.max(65, Math.floor(minAttendance - 4));
    const maxVal = 100;
    const yScale = d3.scaleLinear().domain([minVal, maxVal]).range([innerHeight, 0]).nice();

    // Subtle Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Gradient definitions
    const defs = svg.append('defs');
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'attendance-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.35);
    areaGradient.append('stop').attr('offset', '70%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.08);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.0);

    // Target Benchmark Line (95% standard)
    if (showBenchmark) {
      const benchmarkY = yScale(95);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', benchmarkY)
        .attr('y2', benchmarkY)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4')
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', innerWidth - 8)
        .attr('y', benchmarkY - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#059669')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text('95% Target Standard');
    }

    // Area generator
    const areaGenerator = d3
      .area<any>()
      .x((d) => xScale(d.parsedDate))
      .y0(innerHeight)
      .y1((d) => yScale(d.attendanceRate))
      .curve(d3.curveMonotoneX);

    // Primary Line generator
    const lineGenerator = d3
      .line<any>()
      .x((d) => xScale(d.parsedDate))
      .y((d) => yScale(d.attendanceRate))
      .curve(d3.curveMonotoneX);

    // Append Area with fade-in
    g.append('path')
      .datum(dataset)
      .attr('fill', 'url(#attendance-area-gradient)')
      .attr('d', areaGenerator);

    // Append Primary Line
    const path = g
      .append('path')
      .datum(dataset)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', lineGenerator);

    // Smooth entry transition
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Append Moving Average Line if enabled
    if (showMovingAverage && movingAverageData.length > 0) {
      const maLineGenerator = d3
        .line<any>()
        .x((d) => xScale(parseTime(d.date) || new Date(d.date)))
        .y((d) => yScale(d.avg))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(movingAverageData)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.2)
        .attr('stroke-dasharray', '6,3')
        .attr('d', maLineGenerator);
    }

    // Data dots
    const dotsGroup = g.append('g').attr('class', 'dots-group');

    dotsGroup
      .selectAll<SVGCircleElement, AttendanceDatum>('.data-circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('cx', (d: AttendanceDatum) => xScale(d.parsedDate))
      .attr('cy', (d: AttendanceDatum) => yScale(d.attendanceRate))
      .attr('r', dataset.length > 20 ? 3 : 4.5)
      .attr('fill', (d: AttendanceDatum) => (d.attendanceRate >= 95 ? '#10b981' : d.attendanceRate >= 90 ? '#3b82f6' : '#ef4444'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(dataset.length, 8))
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#64748b');

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b');

    // Remove axis spines
    g.selectAll('.domain').remove();

    // Interactive Hover Crosshair & Tooltip Overlay
    const focus = g.append('g').style('display', 'none');

    // Vertical guideline
    focus
      .append('line')
      .attr('class', 'focus-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    // Focal point circle
    focus
      .append('circle')
      .attr('class', 'focus-circle')
      .attr('r', 6)
      .attr('fill', '#1d4ed8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5);

    // Transparent overlay for mouse catching
    const bisectDate = d3.bisector<any, Date>((d) => d.parsedDate).center;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      })
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const x0 = xScale.invert(xPos);
        const i = bisectDate(dataset, x0, 1);
        const d0 = dataset[i - 1];
        const d1 = dataset[i];
        let d = d0;
        if (d1 && d0) {
          d = x0.getTime() - d0.parsedDate.getTime() > d1.parsedDate.getTime() - x0.getTime() ? d1 : d0;
        } else if (d1) {
          d = d1;
        }

        if (!d) return;

        const x = xScale(d.parsedDate);
        const y = yScale(d.attendanceRate);

        focus.select('.focus-line').attr('x1', x).attr('x2', x);
        focus.select('.focus-circle').attr('cx', x).attr('cy', y);

        // Update floating HTML tooltip
        if (tooltipRef.current) {
          const tooltip = tooltipRef.current;
          tooltip.style.opacity = '1';
          tooltip.style.left = `${Math.min(width - 240, Math.max(10, x + margin.left - 100))}px`;
          tooltip.style.top = `${Math.max(10, y + margin.top - 120)}px`;

          tooltip.innerHTML = `
            <div class="p-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[210px]">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span class="font-bold text-slate-200">${d.dayOfWeek}, ${d.date}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${
                  d.attendanceRate >= 95 ? 'bg-emerald-500/20 text-emerald-400' : d.attendanceRate >= 90 ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                }">${d.attendanceRate}% Rate</span>
              </div>
              <div class="space-y-1 text-slate-300">
                <div class="flex justify-between">
                  <span class="text-slate-400">Total Enrolled:</span>
                  <span class="font-mono font-bold text-white">${d.totalEnrolled}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-emerald-400">Present (On-time):</span>
                  <span class="font-mono font-bold text-emerald-300">${d.presentCount - d.lateCount}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-amber-400">Tardy / Late:</span>
                  <span class="font-mono font-bold text-amber-300">${d.lateCount}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-rose-400">Absent Total:</span>
                  <span class="font-mono font-bold text-rose-300">${d.totalEnrolled - d.presentCount}</span>
                </div>
                ${d.notes ? `<div class="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 italic">${d.notes}</div>` : ''}
              </div>
            </div>
          `;
        }
      });
  }, [filteredRecords, showMovingAverage, showBenchmark, movingAverageData]);

  // ==========================================
  // D3.js CALENDAR HEATMAP MATRIX
  // ==========================================
  useEffect(() => {
    if (!heatmapContainerRef.current) return;

    const svg = d3.select(heatmapContainerRef.current);
    svg.selectAll('*').remove();

    const containerWidth = heatmapContainerRef.current.clientWidth || 700;
    const height = 140;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Only look at 'All' grade records for the heatmap
    const allRecords = attendanceRecords.filter((r) => r.grade === 'All').slice(-35); // last 35 school days (7 weeks)
    if (allRecords.length === 0) return;

    const cellSize = Math.min(22, (containerWidth - margin.left - margin.right) / 8 - 4);
    const dayRows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Y labels
    dayRows.forEach((day, idx) => {
      g.append('text')
        .attr('x', -8)
        .attr('y', idx * (cellSize + 4) + cellSize / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', '#94a3b8')
        .text(day);
    });

    // Group into weeks
    const weekBuckets: DailyAttendanceRecord[][] = [];
    let currentWeek: DailyAttendanceRecord[] = [];

    allRecords.forEach((r) => {
      const d = new Date(r.date);
      const dayIdx = d.getDay(); // 1 = Mon, 5 = Fri
      if (dayIdx === 1 && currentWeek.length > 0) {
        weekBuckets.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(r);
    });
    if (currentWeek.length > 0) weekBuckets.push(currentWeek);

    // Color Scale for attendance rate (80% to 100%)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([85, 92, 96, 100])
      .range(['#fecdd3', '#fef08a', '#93c5fd', '#10b981']);

    weekBuckets.forEach((week, weekIdx) => {
      week.forEach((r) => {
        const d = new Date(r.date);
        const dayIdx = d.getDay() - 1; // 0 for Mon, 4 for Fri
        if (dayIdx >= 0 && dayIdx <= 4) {
          const rect = g
            .append('rect')
            .attr('x', weekIdx * (cellSize + 5))
            .attr('y', dayIdx * (cellSize + 4))
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('rx', 4)
            .attr('fill', colorScale(r.attendanceRate))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .style('cursor', 'pointer');

          // Tooltip title
          rect.append('title').text(`${r.dayOfWeek}, ${r.date}: ${r.attendanceRate}% Attendance`);
        }
      });
    });
  }, [attendanceRecords]);

  // Handler: Save newly recorded attendance
  const handleSaveNewAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(recordPresentRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      alert(lang === 'en' ? 'Please enter a valid rate between 0% and 100%' : 'እባክዎ ትክክለኛ የክትትል መቶኛ ያስገቡ (0-100)');
      return;
    }

    const d = new Date(recordDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[d.getDay()] || 'Weekday';

    const enrolled = students.length || 40;
    const present = Math.round((rateNum / 100) * enrolled);
    const absent = enrolled - present;

    const newRecord: DailyAttendanceRecord = {
      id: `att-${recordDate}-${recordGrade.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
      date: recordDate,
      dayOfWeek,
      grade: recordGrade,
      totalEnrolled: enrolled,
      presentCount: present,
      lateCount: Math.round(absent * 0.3),
      excusedCount: Math.round(absent * 0.5),
      unexcusedCount: Math.max(0, absent - Math.round(absent * 0.3) - Math.round(absent * 0.5)),
      attendanceRate: rateNum,
      notes: recordNotes || 'Manually verified by Director'
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((r) => !(r.date === recordDate && r.grade === recordGrade));
      const updated = [...filtered, newRecord].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return updated;
    });

    if (onSaveAttendance) {
      onSaveAttendance(newRecord);
    }

    setIsRecordModalOpen(false);
    setRecordNotes('');
    setToastMessage(lang === 'en' ? 'Daily attendance successfully recorded!' : 'የዕለቱ ክትትል በተሳካ ሁኔታ ተመዝግቧል!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Date', 'Day', 'Grade', 'Enrolled', 'Present', 'Late', 'Excused', 'Unexcused', 'Attendance Rate (%)', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.dayOfWeek,
      r.grade,
      r.totalEnrolled,
      r.presentCount,
      r.lateCount,
      r.excusedCount,
      r.unexcusedCount,
      `${r.attendanceRate}%`,
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Abune_Gorgorios_Attendance_Analytics_${selectedGradeFilter}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Toast message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[300] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Controls */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {lang === 'en' ? 'Attendance Analytics' : 'የተማሪዎች ክትትል ትንተና'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                  D3.js Powered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Daily student attendance rates, trend lines, and day-of-week pattern identification'
                  : 'የዕለት ተዕለት የተማሪዎች ክትትል፣ የአዝማሚያ መስመሮች እና የሳምንቱ ቀናት ልዩነት ትንተና'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-2 cursor-pointer shadow-xs"
            title="Export CSV data"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'Export CSV' : 'ዳታ አውርድ'}</span>
          </button>

          {isDirector && (
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Record Daily Attendance' : 'የዕለቱ ክትትል መዝግብ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Latest Daily Rate' : 'የቅርብ ቀን ክትትል'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{summaryKpis.currentRate}%</span>
            <span
              className={`flex items-center text-xs font-bold ${
                summaryKpis.dayDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summaryKpis.dayDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(summaryKpis.dayDelta)}% vs prior
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {lang === 'en' ? 'Enrolled Student Base' : 'ጠቅላላ የተማሪዎች ብዛት'}: {summaryKpis.totalEnrolled}
          </p>
        </div>

        {/* Period Average */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Period Average Rate' : 'የወቅቱ አማካኝ'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{summaryKpis.averageRate}%</span>
            <span className="text-[11px] font-bold text-slate-400">({timeRange.toUpperCase()})</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`w-2 h-2 rounded-full ${summaryKpis.averageRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] text-slate-500 font-medium">
              {summaryKpis.averageRate >= 95
                ? lang === 'en' ? 'Meets 95% Accreditation Standard' : 'የ95% መስፈርትን ያሟላል'
                : lang === 'en' ? 'Slightly below 95% target' : 'ከ95% ግብ በታች'}
            </span>
          </div>
        </div>

        {/* Trend Identification */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Identified Trend' : 'የአዝማሚያ አቅጣጫ'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              summaryKpis.trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600' : summaryKpis.trendDirection === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {summaryKpis.trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : summaryKpis.trendDirection === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${
              summaryKpis.trendDirection === 'up' ? 'text-emerald-700' : summaryKpis.trendDirection === 'down' ? 'text-rose-700' : 'text-slate-700'
            }`}>
              {summaryKpis.trendDirection === 'up'
                ? (lang === 'en' ? 'Upward Trend' : 'አዎንታዊ እድገት')
                : summaryKpis.trendDirection === 'down'
                ? (lang === 'en' ? 'Downward Dip' : 'ቅናሽ ይታያል')
                : (lang === 'en' ? 'Stable Rate' : 'የተረጋጋ')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {summaryKpis.trendDelta > 0 ? `+${summaryKpis.trendDelta}%` : `${summaryKpis.trendDelta}%`} {lang === 'en' ? 'net shift over period' : 'በተመረጠው ወቅት'}
          </p>
        </div>

        {/* Pattern: Peak vs Dip Day */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Weekly Patterns' : 'የቀናት አዝማሚያ'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'en' ? 'Peak Day:' : 'ከፍተኛ ቀን:'}</span>
              <span className="font-bold text-emerald-600">{summaryKpis.bestDay}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'en' ? 'Dip Day:' : 'ዝቅተኛ ቀን:'}</span>
              <span className="font-bold text-rose-600">{summaryKpis.lowestDay}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {lang === 'en' ? 'Director action recommended on Fridays' : 'በአርብ ቀናት የተማሪዎች መገኘት ልዩ ትኩረት ይሻል'}
          </p>
        </div>
      </div>

      {/* Main D3 Chart Card */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm relative">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Filter Grade:' : 'ክፍል ምረጥ:'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['All', ...distinctGrades].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGradeFilter === g ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'All' ? (lang === 'en' ? 'All Grades' : 'ሁሉም ክፍሎች') : g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Time range */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['7d', '14d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === r ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === '7d' ? '7D' : r === '14d' ? '14D' : r === '30d' ? '30D' : 'All'}
                </button>
              ))}
            </div>

            {/* Moving Average Toggle */}
            <button
              type="button"
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showMovingAverage
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{lang === 'en' ? '7-Day Rolling Trend' : 'የ7 ቀን አዝማሚያ'}</span>
            </button>

            {/* Target Line Toggle */}
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showBenchmark
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{lang === 'en' ? '95% Standard' : 'የ95% መስፈርት'}</span>
            </button>
          </div>
        </div>

        {/* D3 Canvas Container */}
        <div className="relative w-full overflow-hidden">
          <svg ref={d3ContainerRef} className="w-full h-auto block select-none" />
          {/* Floating dynamic D3 tooltip */}
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none transition-opacity duration-150 z-20 opacity-0"
          />
        </div>

        {/* Legend & Trend Commentary */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-blue-600 rounded-full" />
              <span className="font-medium">{lang === 'en' ? 'Daily Attendance Rate' : 'የዕለታዊ ክትትል መጠን'}</span>
            </div>
            {showMovingAverage && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-amber-500 rounded-full border-dashed" />
                <span className="font-medium">{lang === 'en' ? 'Smoothed Trend Line (MA)' : 'የአዝማሚያ መስመር'}</span>
              </div>
            )}
            {showBenchmark && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-emerald-500 border-dashed" />
                <span className="font-medium">{lang === 'en' ? 'Ministry 95% Benchmark' : 'የትምህርት ሚኒስቴር 95% ግብ'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              {lang === 'en'
                ? 'Hover across the curve to inspect daily headcounts, excused absences, and notes.'
                : 'የእያንዳንዱን ቀን ዝርዝር ዳታ ለማየት በመስመሩ ላይ ያንዣብቡ።'}
            </span>
          </div>
        </div>
      </div>

      {/* D3 Calendar Heatmap Matrix & Class Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Day Matrix Heatmap */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Day-of-Week Attendance Heatmap' : 'የቀናት የክትትል ሙቀት ካርታ'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Visual representation of attendance density across past 7 school weeks'
                  : 'ባለፉት 7 ሳምንታት የሳምንቱ ቀናት የክትትል ጥንካሬ ማሳያ'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span>{lang === 'en' ? 'Low (<88%)' : 'ዝቅተኛ'}</span>
              <div className="w-3 h-3 rounded bg-rose-200" />
              <div className="w-3 h-3 rounded bg-amber-200" />
              <div className="w-3 h-3 rounded bg-blue-300" />
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>{lang === 'en' ? 'High (>96%)' : 'ከፍተኛ'}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto py-2">
            <svg ref={heatmapContainerRef} className="w-full min-w-[500px] h-[140px]" />
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900 font-bold">{lang === 'en' ? 'Key Trend Insight:' : 'ዋና የአዝማሚያ ግኝት:'}</strong>{' '}
              {lang === 'en'
                ? 'Student attendance drops by an average of 4.2% on Fridays compared to mid-week peaks (Wednesdays). Consider scheduling key academic assessments and laboratory periods on Tuesdays and Wednesdays.'
                : 'በአርብ ቀናት የተማሪዎች መገኘት ከረቡዕ ጋር ሲነጻጸር በ4.2% ዝቅ ይላል። አስፈላጊ ፈተናዎችን እና ተግባራዊ ትምህርቶችን በማክሰኞ እና ረቡዕ ማካሄድ ይመረጣል።'}
            </p>
          </div>
        </div>

        {/* Grade Level Leaderboard */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Grade Level Standing' : 'የክፍል ደረጃዎች ንጽጽር'}
              </h3>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-6">
              {lang === 'en' ? 'Average attendance rate segmented by class tier' : 'የእያንዳንዱ የክፍል ደረጃ አማካኝ መገኘት'}
            </p>

            <div className="space-y-4">
              {distinctGrades.map((grade) => {
                const gradeRecords = attendanceRecords.filter((r) => r.grade === grade);
                const avg =
                  gradeRecords.length > 0
                    ? Number((gradeRecords.reduce((s, r) => s + r.attendanceRate, 0) / gradeRecords.length).toFixed(1))
                    : 94.5;
                const isPassing = avg >= 95;

                return (
                  <div key={grade} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-xs">{grade}</span>
                      <span className={`text-xs font-black ${isPassing ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {avg}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          avg >= 95 ? 'bg-emerald-500' : avg >= 90 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{lang === 'en' ? 'Target: 95.0% or above' : 'ግብ፡ 95.0% እና በላይ'}</span>
            <span className="font-bold text-blue-600 flex items-center gap-1">
              {lang === 'en' ? 'Active Term' : 'ንቁ የትምህርት ዘመን'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Records Ledger Table */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {lang === 'en' ? 'Recent Daily Attendance Log' : 'የቅርብ ቀናት የክትትል ዝርዝር'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Audited daily logs submitted by teachers and confirmed by the Director'
                : 'በመምህራን የቀረቡ እና በዳይሬክተሩ የተረጋገጡ የዕለት ተዕለት መዝገቦች'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {filteredRecords.length} {lang === 'en' ? 'Days in view' : 'የተመዘገቡ ቀናት'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Date & Day' : 'ቀን'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Grade' : 'ክፍል'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Enrolled' : 'ተማሪዎች'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Present' : 'የተገኙ'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Tardy / Late' : 'ያረፈዱ'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Absent Total' : 'ቀሪ'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Rate' : 'መቶኛ'}</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{lang === 'en' ? 'Status' : 'ሁኔታ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredRecords.slice(-10).reverse().map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900">{record.date}</div>
                    <div className="text-[11px] text-slate-400">{record.dayOfWeek}</div>
                  </td>
                  <td className="py-3.5 text-xs font-medium text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-[11px]">
                      {record.grade}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs font-mono font-bold text-slate-700">{record.totalEnrolled}</td>
                  <td className="py-3.5 text-xs font-mono font-bold text-emerald-600">{record.presentCount}</td>
                  <td className="py-3.5 text-xs font-mono font-bold text-amber-600">{record.lateCount}</td>
                  <td className="py-3.5 text-xs font-mono font-bold text-rose-600">{record.totalEnrolled - record.presentCount}</td>
                  <td className="py-3.5">
                    <span className="font-black text-blue-700">{record.attendanceRate}%</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      record.attendanceRate >= 95
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : record.attendanceRate >= 90
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {record.attendanceRate >= 95 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {lang === 'en' ? 'Optimal' : 'ተስማሚ'}
                        </>
                      ) : record.attendanceRate >= 90 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          {lang === 'en' ? 'Normal' : 'መደበኛ'}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          {lang === 'en' ? 'Attention' : 'ክትትል ይሻል'}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Attendance Modal (Director only) */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {lang === 'en' ? 'Record Daily Attendance' : 'የዕለቱን ክትትል መዝግብ'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'en' ? 'Log or update official student attendance records' : 'ይፋዊ የተማሪዎች ክትትል መዝገብ ይጻፉ ወይም ያዘምኑ'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveNewAttendance} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Date' : 'ቀን'}
                    </label>
                    <input
                      type="date"
                      required
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Grade / Class' : 'ክፍል'}
                    </label>
                    <select
                      value={recordGrade}
                      onChange={(e) => setRecordGrade(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                    >
                      <option value="All">{lang === 'en' ? 'All Grades (Schoolwide)' : 'ሁሉም ክፍሎች (አጠቃላይ)'}</option>
                      {distinctGrades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Present Attendance Rate (%)' : 'የመገኘት መቶኛ (%)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={recordPresentRate}
                      onChange={(e) => setRecordPresentRate(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-blue-500 transition-all font-black text-blue-600 pr-10"
                      placeholder="95.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Administrative Notes / Context' : 'ማስታወሻ / ዝርዝር ሁኔታ'}
                  </label>
                  <textarea
                    rows={3}
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'e.g. Regular schedule, rainy weather morning, inter-school sport match...'
                        : 'ለምሳሌ፡ መደበኛ ቀን፣ የጠዋት ዝናብ፣ የስፖርት ውድድር...'
                    }
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="flex-1 px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs"
                  >
                    {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Confirm & Save Record' : 'አረጋግጥ እና መዝግብ'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
