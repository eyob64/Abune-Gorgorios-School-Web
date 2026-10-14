import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  Printer,
  X,
  Filter,
  CheckCircle2,
  Award,
  GraduationCap,
  Building,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export interface StudentRecord {
  id: string;
  name: string;
  grade: string;
  email?: string;
  photo?: string;
  enrollmentDate?: string;
}

export interface GradeEntryItem {
  subject: string;
  grade: string;
  status?: string;
  attendance?: string;
  assignments?: any[];
  assignmentCount?: number;
}

interface GradebookPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'am';
  students: StudentRecord[];
  studentGrades: Record<string, GradeEntryItem[]>;
}

const GPA_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'F': 0.0,
  'N/A': 0.0,
};

export const GradebookPdfExportModal: React.FC<GradebookPdfExportModalProps> = ({
  isOpen,
  onClose,
  lang,
  students,
  studentGrades,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'gpa' | 'name' | 'id'>('gpa');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [academicTerm, setAcademicTerm] = useState<'Term 1' | 'Term 2' | 'Annual Ledger'>('Annual Ledger');
  const [searchFilter, setSearchFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Compute student stats
  const processedStudents = useMemo(() => {
    return students.map((student) => {
      const grades = studentGrades[student.id] || [];
      const gpaNum =
        grades.length > 0
          ? grades.reduce((sum, g) => sum + (GPA_POINTS[g.grade] ?? 0), 0) / grades.length
          : 0;
      const gpa = gpaNum.toFixed(2);
      const totalAssignments = grades.reduce(
        (sum, g) => sum + (g.assignmentCount || g.assignments?.length || 0),
        0
      );
      
      let standing = 'Good Standing';
      if (gpaNum >= 3.75) standing = 'High Distinction';
      else if (gpaNum >= 3.5) standing = 'Distinction';
      else if (gpaNum >= 2.5) standing = 'Satisfactory';
      else if (gpaNum > 0) standing = 'Needs Improvement';
      else standing = 'Pending Evaluation';

      const avgPercent = (gpaNum / 4.0) * 100;

      return {
        ...student,
        gpaNum,
        gpa,
        avgPercent: avgPercent > 0 ? `${avgPercent.toFixed(1)}%` : 'N/A',
        subjectsCount: grades.length,
        totalAssignments,
        standing,
      };
    });
  }, [students, studentGrades]);

  // Filter & sort
  const filteredStudents = useMemo(() => {
    let result = processedStudents.filter((s) => {
      const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
      const matchesSearch =
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.id.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesGrade && matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'gpa') {
        comparison = a.gpaNum - b.gpaNum;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id);
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [processedStudents, selectedGrade, searchFilter, sortBy, sortDirection]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) {
      return {
        total: 0,
        averageGpa: '0.00',
        highestGpa: '0.00',
        distinctionCount: 0,
        passRate: '100%',
      };
    }
    const sumGpa = filteredStudents.reduce((acc, s) => acc + s.gpaNum, 0);
    const avgGpa = (sumGpa / total).toFixed(2);
    const highestGpa = Math.max(...filteredStudents.map((s) => s.gpaNum)).toFixed(2);
    const distinctionCount = filteredStudents.filter((s) => s.gpaNum >= 3.5).length;
    return {
      total,
      averageGpa: avgGpa,
      highestGpa,
      distinctionCount,
      passRate: `${Math.round((filteredStudents.filter((s) => s.gpaNum >= 2.0).length / total) * 100)}%`,
    };
  }, [filteredStudents]);

  // Available grade options
  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.grade) set.add(s.grade);
    });
    return ['All', ...Array.from(set).sort()];
  }, [students]);

  // Generate Official PDF with jsPDF
  const generateOfficialPdf = () => {
    try {
      setIsGenerating(true);
      // Landscape A4 orientation for comprehensive tabular layout
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;

      let currentY = margin;

      // Helper function to draw the official header on each page
      const drawHeader = (pageNumber: number, totalPagesPlaceholder = '1') => {
        // Top dark navy banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(margin, currentY, contentWidth, 24, 'F');

        // Gold decorative accent line
        doc.setFillColor(217, 119, 6); // amber-600
        doc.rect(margin, currentY + 23, contentWidth, 1.5, 'F');

        // School Title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('ABUNE GORGORIOS SCHOOL (የአቡነ ጎርጎርዮስ ትምህርት ቤት)', margin + 6, currentY + 8);

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(
          'MINISTRY OF EDUCATION ACCREDITED • ADDIS ABABA, ETHIOPIA • OFFICIAL ACADEMIC LEDGER',
          margin + 6,
          currentY + 14
        );
        doc.text(
          `Document Ref: AGS-DIR-GB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}  •  Academic Year: 2026/2027 (2018 E.C.)`,
          margin + 6,
          currentY + 19.5
        );

        // Right side badge in header
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(pageWidth - margin - 58, currentY + 3.5, 52, 17, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(251, 191, 36); // amber-400
        doc.text('OFFICIAL RECORD', pageWidth - margin - 54, currentY + 9);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`Term: ${academicTerm}`, pageWidth - margin - 54, currentY + 14);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 54, currentY + 18);

        currentY += 30;
      };

      // Helper function to draw page footer
      const drawFooter = (pageNum: number) => {
        const footerY = pageHeight - 10;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(
          'Abune Gorgorios School • Shaping Minds, Building Futures • Confidential School Management Ledger',
          margin,
          footerY + 2
        );
        doc.text(
          `Page ${pageNum} • Issued by the Office of the School Director`,
          pageWidth - margin - 55,
          footerY + 2
        );
      };

      // Page 1 Header
      drawHeader(1);

      // Summary KPI Metric Cards
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

      const kpiWidth = contentWidth / 5;
      const kpis = [
        { label: 'TOTAL STUDENTS', value: `${summaryStats.total}` },
        { label: 'SELECTED GRADE', value: selectedGrade === 'All' ? 'All Classes' : selectedGrade },
        { label: 'AVERAGE GPA', value: `${summaryStats.averageGpa} / 4.00` },
        { label: 'HIGHEST GPA', value: `${summaryStats.highestGpa}` },
        { label: 'DISTINCTION COUNT', value: `${summaryStats.distinctionCount} Students` },
      ];

      kpis.forEach((kpi, idx) => {
        const x = margin + idx * kpiWidth + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x, currentY + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.value, x, currentY + 12.5);

        if (idx < 4) {
          doc.setDrawColor(226, 232, 240);
          doc.line(margin + (idx + 1) * kpiWidth, currentY + 2, margin + (idx + 1) * kpiWidth, currentY + 14);
        }
      });

      currentY += 21;

      // Table Column Definitions
      const columns = [
        { header: '#', width: 12, align: 'center' },
        { header: 'STUDENT ID', width: 34, align: 'left' },
        { header: 'STUDENT NAME', width: 68, align: 'left' },
        { header: 'GRADE', width: 22, align: 'center' },
        { header: 'GPA (4.0)', width: 24, align: 'center' },
        { header: 'EQUIV %', width: 22, align: 'center' },
        { header: 'SUBJECTS', width: 22, align: 'center' },
        { header: 'ASSIGNMENTS', width: 26, align: 'center' },
        { header: 'ACADEMIC STANDING', width: 39, align: 'left' },
      ];

      // Draw Table Header
      const drawTableHeader = () => {
        doc.setFillColor(30, 58, 138); // blue-900
        doc.rect(margin, currentY, contentWidth, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);

        let colX = margin;
        columns.forEach((col) => {
          if (col.align === 'center') {
            doc.text(col.header, colX + col.width / 2, currentY + 5.5, { align: 'center' });
          } else if (col.align === 'right') {
            doc.text(col.header, colX + col.width - 3, currentY + 5.5, { align: 'right' });
          } else {
            doc.text(col.header, colX + 3, currentY + 5.5);
          }
          colX += col.width;
        });

        currentY += 8;
      };

      drawTableHeader();

      let pageCount = 1;

      if (filteredStudents.length === 0) {
        // Empty state in table
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY, contentWidth, 20, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'No enrolled students found matching the selected grade criteria.',
          pageWidth / 2,
          currentY + 12,
          { align: 'center' }
        );
        currentY += 20;
      } else {
        // Render rows
        filteredStudents.forEach((student, index) => {
          // Check if we need a new page
          if (currentY > pageHeight - 32) {
            drawFooter(pageCount);
            doc.addPage();
            pageCount++;
            currentY = margin;
            drawHeader(pageCount);
            drawTableHeader();
          }

          const isEven = index % 2 === 0;
          doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
          doc.rect(margin, currentY, contentWidth, 7, 'F');

          // Subtle bottom border
          doc.setDrawColor(241, 245, 249);
          doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);

          let colX = margin;

          // 1. #
          doc.text(`${index + 1}`, colX + columns[0].width / 2, currentY + 5, { align: 'center' });
          colX += columns[0].width;

          // 2. Student ID (Bold)
          doc.setFont('helvetica', 'bold');
          doc.text(student.id, colX + 3, currentY + 5);
          colX += columns[1].width;

          // 3. Name
          doc.setFont('helvetica', 'bold');
          doc.text(student.name, colX + 3, currentY + 5);
          colX += columns[2].width;

          // 4. Grade
          doc.setFont('helvetica', 'normal');
          doc.text(student.grade, colX + columns[3].width / 2, currentY + 5, { align: 'center' });
          colX += columns[3].width;

          // 5. GPA
          doc.setFont('helvetica', 'bold');
          if (student.gpaNum >= 3.5) {
            doc.setTextColor(37, 99, 235); // blue-600
          } else if (student.gpaNum >= 2.0) {
            doc.setTextColor(16, 149, 193);
          } else {
            doc.setTextColor(220, 38, 38);
          }
          doc.text(`${student.gpa}`, colX + columns[4].width / 2, currentY + 5, { align: 'center' });
          doc.setTextColor(30, 41, 59);
          colX += columns[4].width;

          // 6. Equiv %
          doc.setFont('helvetica', 'normal');
          doc.text(student.avgPercent, colX + columns[5].width / 2, currentY + 5, { align: 'center' });
          colX += columns[5].width;

          // 7. Subjects
          doc.text(`${student.subjectsCount}`, colX + columns[6].width / 2, currentY + 5, { align: 'center' });
          colX += columns[6].width;

          // 8. Assignments
          doc.text(`${student.totalAssignments}`, colX + columns[7].width / 2, currentY + 5, { align: 'center' });
          colX += columns[7].width;

          // 9. Standing
          doc.setFont('helvetica', 'bold');
          if (student.standing.includes('Distinction')) {
            doc.setTextColor(16, 185, 129); // emerald-600
          } else if (student.standing.includes('Satisfactory') || student.standing.includes('Good')) {
            doc.setTextColor(30, 41, 59);
          } else {
            doc.setTextColor(217, 119, 6); // amber-600
          }
          doc.text(student.standing, colX + 3, currentY + 5);
          doc.setTextColor(30, 41, 59);

          currentY += 7;
        });
      }

      // Check space for Director Signature & Certification block
      if (currentY > pageHeight - 38) {
        drawFooter(pageCount);
        doc.addPage();
        pageCount++;
        currentY = margin;
        drawHeader(pageCount);
      }

      currentY += 4;

      // Official Director Certification Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

      // Left certification text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('OFFICIAL ATTESTATION & SEAL OF THE SCHOOL DIRECTOR', margin + 6, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'I hereby solemnly attest that this Gradebook Academic Ledger accurately reflects the verified evaluations,',
        margin + 6,
        currentY + 11
      );
      doc.text(
        'attendance, and academic performance for the listed students of Abune Gorgorios School.',
        margin + 6,
        currentY + 15
      );
      doc.text(
        `Generated electronically on ${new Date().toLocaleString()} by Office of the School Director.`,
        margin + 6,
        currentY + 20
      );

      // Right signature and stamp area
      const sigX = pageWidth - margin - 75;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('APPROVED & SIGNED:', sigX, currentY + 6);

      // Signature line
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.line(sigX, currentY + 16, sigX + 68, currentY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 58, 138);
      doc.text('Executive School Director', sigX, currentY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Official Seal / Signature', sigX + 38, currentY + 20);

      // Draw footer for the last page
      drawFooter(pageCount);

      // File name format
      const safeGrade = selectedGrade.replace(/\s+/g, '_');
      const filename = `Abune_Gorgorios_Official_Gradebook_${safeGrade}_${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
      setExportSuccessMessage(
        lang === 'en'
          ? `Successfully exported Gradebook PDF: ${filename}`
          : `የውጤት መዝገብ ፒዲኤፍ በተሳካ ሁኔታ ተዘጋጅቷል፡ ${filename}`
      );
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct print trigger
  const handlePrint = () => {
    window.print();
  };

  // CSV Export for Director records
  const handleExportCsv = () => {
    const headers = ['No', 'StudentID', 'Name', 'Grade', 'GPA', 'EquivPercent', 'SubjectsCount', 'AssignmentsCount', 'Standing'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.grade}"`,
      s.gpa,
      `"${s.avgPercent}"`,
      s.subjectsCount,
      s.totalAssignments,
      `"${s.standing}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Abune_Gorgorios_Gradebook_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {lang === 'en' ? 'DIRECTOR OFFICIAL EXPORT' : 'የዳይሬክተር ይፋዊ ሪፖርት'}
                </span>
                <span className="text-xs text-slate-400">• A4 Landscape Ledger</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {lang === 'en' ? 'Official Gradebook & Academic Ledger (PDF)' : 'ይፋዊ የተማሪዎች የውጤት መዝገብ ፒዲኤፍ (PDF)'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'en'
                  ? 'Generate, preview, and download official certified academic reports with director attestation.'
                  : 'የተማሪዎችን አጠቃላይ የውጤት መዝገብ በይፋዊ ፒዲኤፍ (PDF) ያውርዱ ወይም ያትሙ።'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{lang === 'en' ? 'Print Preview' : 'አትም'}</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              title="Export as CSV/Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={generateOfficialPdf}
              disabled={isGenerating || filteredStudents.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? (lang === 'en' ? 'Generating PDF...' : 'ፒዲኤፍ በመዘጋጀት ላይ...') : (lang === 'en' ? 'Download Official PDF' : 'ይፋዊ ፒዲኤፍ አውርድ')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {exportSuccessMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center gap-3 text-emerald-800 text-xs font-bold shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls & Filter Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Grade */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">{lang === 'en' ? 'Grade:' : 'ክፍል:'}</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
              >
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? (lang === 'en' ? 'All Grades' : 'ሁሉም ክፍሎች') : g}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Term */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">{lang === 'en' ? 'Term:' : 'መንፈቅ:'}</span>
              <select
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value as any)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
              >
                <option value="Term 1">Semester 1</option>
                <option value="Term 2">Semester 2</option>
                <option value="Annual Ledger">Full Academic Ledger</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">{lang === 'en' ? 'Sort:' : 'አደራጅ:'}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
              >
                <option value="gpa">GPA (Ranking)</option>
                <option value="name">Student Name</option>
                <option value="id">Student ID</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-1"
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>

          {/* Search within filtered students */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by name or ID...' : 'በስም ወይም በመለያ ፈልግ...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 grid grid-cols-2 sm:grid-cols-5 gap-4 shrink-0">
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'en' ? 'Enrolled Records' : 'የተመዘገቡ ተማሪዎች'}
            </span>
            <span className="text-lg font-black text-slate-900">{summaryStats.total}</span>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'en' ? 'Average GPA' : 'አማካይ ውጤት (GPA)'}
            </span>
            <span className="text-lg font-black text-blue-600">{summaryStats.averageGpa}</span>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'en' ? 'Top GPA' : 'ከፍተኛ ውጤት'}
            </span>
            <span className="text-lg font-black text-emerald-600">{summaryStats.highestGpa}</span>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'en' ? 'Distinctions (≥3.5)' : 'ከፍተኛ ማዕረግ'}
            </span>
            <span className="text-lg font-black text-amber-600">{summaryStats.distinctionCount}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'en' ? 'Passing Rate' : 'የማለፍ ምጣኔ'}
            </span>
            <span className="text-lg font-black text-slate-900">{summaryStats.passRate}</span>
          </div>
        </div>

        {/* Printable & Interactive Table View */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Building className="w-4 h-4 text-amber-400" />
                <span>ABUNE GORGORIOS SCHOOL • ACADEMIC LEDGER PREVIEW</span>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                {filteredStudents.length} {lang === 'en' ? 'students matching' : 'ተማሪዎች ተገኝተዋል'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 text-center w-10">#</th>
                    <th className="py-3 px-3">{lang === 'en' ? 'Student ID' : 'የተማሪ መለያ'}</th>
                    <th className="py-3 px-3">{lang === 'en' ? 'Full Name' : 'ሙሉ ስም'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'Grade' : 'ክፍል'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'GPA' : 'ውጤት (GPA)'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'Equiv %' : 'በመቶኛ'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'Subjects' : 'ትምህርቶች'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'Assignments' : 'ተግባራት'}</th>
                    <th className="py-3 px-3">{lang === 'en' ? 'Academic Standing' : 'ደረጃ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                        <p className="font-bold text-sm">
                          {lang === 'en' ? 'No students found in this selection' : 'ምንም የተማሪዎች መረጃ አልተገኘም'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {lang === 'en'
                            ? 'Adjust your grade or search filter, or approve applications in Admissions.'
                            : 'እባክዎ የተመረጠውን ክፍል ይቀይሩ ወይም በአድሚሽን በኩል ተማሪዎችን ይመዝግቡ።'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{student.id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{student.name}</td>
                        <td className="py-2.5 px-3 text-center font-medium text-slate-600">{student.grade}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`font-black ${
                              student.gpaNum >= 3.5
                                ? 'text-blue-600'
                                : student.gpaNum >= 2.0
                                ? 'text-emerald-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {student.gpa}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{student.avgPercent}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{student.subjectsCount}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{student.totalAssignments}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              student.standing.includes('Distinction')
                                ? 'bg-emerald-50 text-emerald-700'
                                : student.standing.includes('Satisfactory') || student.standing.includes('Good')
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {student.standing}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Attestation & Signature Footer in preview */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Certified Official Ledger for Abune Gorgorios School • Office of the School Director'
                    : 'የአቡነ ጎርጎርዮስ ትምህርት ቤት ይፋዊ የውጤት መዝገብ • የዳይሬክተር ቢሮ'}
                </span>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                Printed electronically • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              {lang === 'en'
                ? 'Exporting will compile high-resolution vector PDF document ready for archive and print.'
                : 'ፒዲኤፉን ማውረድ ለማህደር እና ለህትመት ዝግጁ የሆነ ጥራት ያለው ሰነድ ያዘጋጃል።'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'ዝጋ'}
            </button>
            <button
              onClick={generateOfficialPdf}
              disabled={isGenerating || filteredStudents.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? (lang === 'en' ? 'Exporting...' : 'በማውረድ ላይ...') : (lang === 'en' ? 'Export Gradebook (PDF)' : 'የውጤት መዝገብ አውርድ (PDF)')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
