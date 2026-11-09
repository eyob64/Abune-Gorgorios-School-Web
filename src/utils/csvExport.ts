/**
 * CSV Generation & Download Utilities
 * RFC 4180 compliant CSV generator with UTF-8 BOM support for Excel & Google Sheets compatibility.
 */

export interface CsvColumn<T> {
  header: string;
  getValue: (item: T, index: number) => unknown;
}

/**
 * Escapes a single CSV field value according to RFC 4180 standard.
 * Wraps values with double quotes and escapes any existing double quotes with two double quotes.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // Always wrap in quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates an RFC 4180 formatted CSV string from an array of records and column definitions.
 */
export function generateCsvString<T>(items: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map(col => escapeCsvCell(col.header)).join(',');
  const dataRows = items.map((item, index) => {
    return columns.map(col => escapeCsvCell(col.getValue(item, index))).join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Triggers a browser file download of the given CSV string.
 * Automatically adds UTF-8 Byte Order Mark (BOM) for accurate Unicode support in Microsoft Excel.
 */
export function triggerCsvDownload(csvString: string, filename: string): void {
  // \uFEFF Byte Order Mark ensures Excel parses UTF-8 properly
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface StudentRecord {
  id: string;
  name: string;
  grade: string;
  email: string;
  photo?: string;
  enrollmentDate?: string;
  hasIdCard?: boolean;
  studentId?: string;
  [key: string]: any;
}

export interface ExportStudentsOptions {
  filename?: string;
  allPayments?: any[];
  studentGrades?: Record<string, any[]>;
  lang?: 'en' | 'am';
}

/**
 * High-level utility to export a filtered list of students to a CSV file.
 */
export function exportStudentsToCsv(
  students: StudentRecord[],
  options: ExportStudentsOptions = {}
): void {
  const {
    filename,
    allPayments = [],
    studentGrades = {},
    lang = 'en'
  } = options;

  const isEn = lang === 'en';

  const columns: CsvColumn<StudentRecord>[] = [
    {
      header: isEn ? 'Student ID' : 'የተማሪ መታወቂያ',
      getValue: (s) => s.id || s.studentId || ''
    },
    {
      header: isEn ? 'Full Name' : 'ሙሉ ስም',
      getValue: (s) => s.name || ''
    },
    {
      header: isEn ? 'Grade Level' : 'ክፍል',
      getValue: (s) => s.grade || ''
    },
    {
      header: isEn ? 'Email Address' : 'ኢሜል አድራሻ',
      getValue: (s) => s.email || ''
    },
    {
      header: isEn ? 'Enrollment Date' : 'የተመዘገበበት ቀን',
      getValue: (s) => s.enrollmentDate || ''
    },
    {
      header: isEn ? 'ID Card Status' : 'የመታወቂያ ሁኔታ',
      getValue: (s) => (s.hasIdCard ? (isEn ? 'Issued' : 'ተሰጥቷል') : (isEn ? 'Pending Issue' : 'አልተሰጠም'))
    },
    {
      header: isEn ? 'Tuition Payment Status' : 'የትምህርት ክፍያ ሁኔታ',
      getValue: (s) => {
        const studentPayments = allPayments.filter(p => p.studentId === s.id || p.studentId === s.studentId);
        if (studentPayments.length === 0) return isEn ? 'No Payment Recorded' : 'ምንም ክፍያ የለም';
        const hasVerified = studentPayments.some(p => p.status === 'Verified');
        if (hasVerified) return isEn ? 'Verified' : 'የተረጋገጠ';
        const hasPending = studentPayments.some(p => p.status === 'Pending');
        if (hasPending) return isEn ? 'Pending Verification' : 'በመጠባበቅ ላይ';
        return isEn ? 'Payment Submitted' : 'ክፍያ ቀርቧል';
      }
    },
    {
      header: isEn ? 'Total Tuition Paid (ETB)' : 'ጠቅላላ የተከፈለ (ETB)',
      getValue: (s) => {
        const studentPayments = allPayments.filter(p => (p.studentId === s.id || p.studentId === s.studentId) && p.status === 'Verified');
        const total = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        return total > 0 ? total : 0;
      }
    },
    {
      header: isEn ? 'Academic Standing' : 'የትምህርት ሁኔታ',
      getValue: (s) => {
        const grades = studentGrades[s.id] || [];
        if (grades.length === 0) return isEn ? 'Active' : 'ገባሪ';
        return isEn ? `${grades.length} Subjects Enrolled` : `${grades.length} ትምህርቶች ተመዝግቧል`;
      }
    }
  ];

  const csvContent = generateCsvString(students, columns);
  const nowStr = new Date().toISOString().split('T')[0];
  const defaultFilename = `abune-gorgorios-students-${nowStr}.csv`;
  const exportFilename = filename || defaultFilename;

  triggerCsvDownload(csvContent, exportFilename);
}
