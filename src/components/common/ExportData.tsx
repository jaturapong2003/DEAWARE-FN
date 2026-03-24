import Papa from 'papaparse';
import type { AttendanceRecord } from '@/@types/Attendance';
import { calcHours, FULL_HOURS } from '@/lib/attendance';

export type CsvExportColumn<T extends object> = {
  key: keyof T;
  label: string;
};

export type AttendanceCsvRow = {
  วัน: string;
  ชื่อ: string;
  เวลาเข้า: string;
  เวลาออก: string;
  ชั่วโมงที่ทำ: string;
  ชั่วโมงโอที: string;
};

export const attendanceCsvColumns: CsvExportColumn<AttendanceCsvRow>[] = [
  { key: 'วัน', label: 'วัน' },
  { key: 'ชื่อ', label: 'ชื่อ' },
  { key: 'เวลาเข้า', label: 'เวลาเข้า' },
  { key: 'เวลาออก', label: 'เวลาออก' },
  { key: 'ชั่วโมงที่ทำ', label: 'ชั่วโมงที่ทำ' },
  { key: 'ชั่วโมงโอที', label: 'ชั่วโมงโอที' },
];

const formatThaiDate = (date: Date | null): string =>
  date
    ? date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

const formatThaiTime = (date: Date | null): string =>
  date
    ? date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const buildAttendanceCsvRows = (
  employeeName: string,
  records: AttendanceRecord[]
): AttendanceCsvRow[] =>
  records.map((record) => {
    const checkInDate = record.check_in ? new Date(record.check_in) : null;
    const checkOutDate = record.check_out ? new Date(record.check_out) : null;

    const workedHours = record.work_hours
      ? Number(record.work_hours)
      : calcHours(record);

    return {
      วัน: formatThaiDate(checkInDate),
      ชื่อ: employeeName,
      เวลาเข้า: formatThaiTime(checkInDate),
      เวลาออก: formatThaiTime(checkOutDate),
      ชั่วโมงที่ทำ: `${mentionedNumber(workedHours || 0, 2)}`,
      ชั่วโมงโอที: `${Math.max(workedHours - FULL_HOURS, 0).toFixed(2)}`,
    };
  });

const mentionedNumber = (value: number, decimals: number) =>
  Number.isFinite(value) ? value.toFixed(decimals) : '0.00';

export interface CsvExportOptions<T extends object> {
  data: T[];
  filename: string;
  columns?: CsvExportColumn<T>[];
  bom?: boolean;
  delimiter?: string;
}

const defaultOptions = {
  bom: true,
  delimiter: ',',
};

const serializeCsvRows = <T extends object>(
  data: T[],
  columns?: CsvExportColumn<T>[]
): object[] => {
  if (!columns || columns.length === 0) {
    return data.map((row) => {
      // ensure objects only (no methods or prototype fields)
      const plain: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        plain[key] = (row as Record<string, unknown>)[key];
      });
      return plain;
    });
  }

  return data.map((row) => {
    const mapped: Record<string, unknown> = {};
    columns.forEach((column) => {
      mapped[column.label] = row[column.key] ?? '';
    });
    return mapped;
  });
};

export const exportToCSV = <T extends object>(options: CsvExportOptions<T>) => {
  const { data, filename, columns, bom, delimiter } = {
    ...defaultOptions,
    ...options,
  };

  if (!data || !Array.isArray(data)) {
    throw new Error('Data must be an array of objects.');
  }

  if (!filename || typeof filename !== 'string') {
    throw new Error('filename is required and must be a string.');
  }

  if (data.length === 0) {
    // Export headers-only or do nothing; still generate empty CSV with header row
    const headerRow =
      columns && columns.length > 0 ? columns.map((col) => col.label) : [];
    const csv = `${bom ? '\uFEFF' : ''}${Papa.unparse({ fields: headerRow, data: [] })}`;
    const blob = new Blob([new TextEncoder().encode(csv)], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const rows = serializeCsvRows(data, columns);

  const csvString = Papa.unparse(rows, {
    delimiter,
    header: true,
  });

  const payload = `${bom ? '\uFEFF' : ''}${csvString}`;
  const blob = new Blob([new TextEncoder().encode(payload)], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAttendanceRecordsCSV = (
  employeeName: string,
  employeeId: string,
  records: AttendanceRecord[]
) => {
  const rows = buildAttendanceCsvRows(employeeName, records);
  exportToCSV({
    data: rows,
    filename: `attendance_${employeeId}`,
    columns: attendanceCsvColumns,
    bom: true,
    delimiter: ',',
  });
};

export const buildCsvColumnMap = <T extends object>(
  rawColumns: Array<keyof T>,
  labelMap: Partial<Record<keyof T, string>>
): CsvExportColumn<T>[] => {
  return rawColumns.map((key) => ({
    key,
    label: labelMap[key] ?? String(key),
  }));
};
