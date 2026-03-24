import type { AttendanceRecord } from '@/@types/Attendance';
import type { EmployeesList } from '@/@types/Employees';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/date';
import type { EmployeeAnalysisResponse } from '@/@types/Attendance';
import {
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Users,
  LogIn,
  LogOut,
  ImageIcon,
} from 'lucide-react';
import { useEmployeeAnalysis } from '@/hooks/useEmployeeAnalysis';
import {
  getAttendanceImageUrls,
  FULL_HOURS,
  calcHours,
  isFullHours,
  fmtHours,
} from '@/lib/attendance';
import AttendanceDeviceCard from '@/components/common/AttendanceDeviceCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import PaginationControll from '@/components/filter/PaginationControll';

interface DashboardIdProps {
  employee: EmployeesList;
  records: AttendanceRecord[];
  total: number;
  analysis?: EmployeeAnalysisResponse['data'] | null;
  onRangeChange?: (start?: Date, end?: Date) => void;
}

// ============ Device Helpers ============

const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/** คำนวณเกรด A/B/C จำนวนวันที่ทำครบ 9 ชม. (รายเดือน: ~20-22 วันทำงาน) */
const calcMonthlyGrade = (
  fullDaysCount: number,
  totalDaysCount: number,
  avgHours: number
): 'A' | 'B' | 'C' | 'F' => {
  if (totalDaysCount === 0) return 'F';
  const successRatio = (fullDaysCount / totalDaysCount) * 100;
  // A: successRatio >= 90% AND avgHours >= 9.0
  if (successRatio >= 90 && avgHours >= FULL_HOURS) return 'A';
  // B: successRatio >= 75%
  if (successRatio >= 75) return 'B';
  // C: successRatio >= 50%
  if (successRatio >= 50) return 'C';
  // F: otherwise
  return 'F';
};

/** สีเกรด */
const gradeColor = (grade: string | null | undefined) => {
  switch ((grade || '').toUpperCase()) {
    case 'A':
      return {
        bg: 'bg-green-100 dark:bg-green-950/20',
        text: 'text-green-700 dark:text-green-400',
      };
    case 'B':
      return {
        bg: 'bg-blue-100 dark:bg-blue-950/20',
        text: 'text-blue-700 dark:text-blue-400',
      };
    case 'C':
    case 'F':
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-400',
      };
    default:
      return {
        bg: 'bg-muted/50',
        text: 'text-muted-foreground',
      };
  }
};

/** ข้อความกำกับระดับผลงาน */
const getGradeLabel = (grade: string | null | undefined): string => {
  const g = (grade || '').toUpperCase();
  if (g === 'A') return 'ดีเยี่ยม';
  if (g === 'B') return 'ดี';
  return 'ควรปรับปรุง';
};

/** สร้างข้อมูลการให้เกรดรายเดือน */
const buildMonthlyGradeData = (records: AttendanceRecord[]) => {
  const monthlyData = new Map<
    string,
    { fullDays: number; totalDays: number; totalHours: number }
  >();

  records.forEach((r) => {
    if (!r.check_in) return;
    const date = new Date(r.check_in);
    if (isNaN(date.getTime())) return;

    const monthKey = getMonthKey(date);

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { fullDays: 0, totalDays: 0, totalHours: 0 });
    }

    const entry = monthlyData.get(monthKey)!;
    entry.totalDays += 1;

    const hrs = calcHours(r);
    entry.totalHours += hrs;
    if (isFullHours(r)) {
      entry.fullDays += 1;
    }
  });

  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      const avgHours =
        data.totalDays > 0 ? data.totalHours / data.totalDays : 0;
      return {
        monthKey,
        monthDate,
        fullDays: data.fullDays,
        totalDays: data.totalDays,
        avgHours,
        grade: calcMonthlyGrade(data.fullDays, data.totalDays, avgHours),
      };
    });
};

// ============ Data processors ============
const getXAxisMonthLabel = (date: Date) =>
  date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
const getXAxisDayLabel = (date: Date) =>
  date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

const buildBarData = (records: AttendanceRecord[], range: string = '1m') => {
  const grouped = new Map<string, { name: string; total: number }>();

  records.forEach((r) => {
    if (!r.check_in) return;
    const date = new Date(r.check_in);
    if (isNaN(date.getTime())) return;

    // สำหรับช่วง 1 ปี ให้ group ตามเดือน มิฉะนั้น group ตามวัน
    const key =
      range === '1y' ? getMonthKey(date) : date.toISOString().slice(0, 10); // YYYY-MM-DD

    const label =
      range === '1y' ? getXAxisMonthLabel(date) : getXAxisDayLabel(date);

    const entry = grouped.get(key) ?? { name: label, total: 0 };
    entry.total += calcHours(r);
    grouped.set(key, entry);
  });

  return Array.from(grouped.values()).map(({ name, total: totalHrs }) => {
    const normal = Math.min(totalHrs, FULL_HOURS); // สีเขียว — max 9 ชม.
    const overtime = totalHrs > FULL_HOURS ? totalHrs - FULL_HOURS : 0; // สีเหลือง — เกิน 9
    return {
      name,
      normal: Math.floor(normal * 100) / 100,
      overtime: Math.floor(overtime * 100) / 100,
      total: totalHrs,
      isFull: totalHrs >= FULL_HOURS,
    };
  });
};

/** สร้างข้อมูล Pie Chart สำหรับเดือนที่เลือก (ครบ 9 ชม., ไม่ครบ, ไม่มีข้อมูล) */
const buildMonthlyDetailPieData = (
  records: AttendanceRecord[],
  monthKey: string
) => {
  let full = 0;
  let notFull = 0;

  records.forEach((r) => {
    if (!r.check_in) return;

    // เช็คว่า record นี้อยู่ในเดือนที่เลือกไหม
    const date = new Date(r.check_in);
    if (isNaN(date.getTime())) return;

    const recordMonthKey = getMonthKey(date);

    if (recordMonthKey !== monthKey) return;

    if (isFullHours(r)) {
      full += 1;
    } else {
      notFull += 1;
    }
  });

  return [
    { name: 'ครบ 9 ชม.', value: full, color: '#22c55e' },
    { name: 'ไม่ครบ 9 ชม.', value: notFull, color: '#f97316' },
  ].filter((d) => d.value > 0);
};

// ============ Sub Components ============

/** Stat Card */
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  className?: string;
}> = ({
  icon,
  label,
  value,
  subValue,
  color = 'text-primary',
  className = '',
}) => (
  <div
    className={`border-border bg-card hover:bg-muted/30 dark:border-border dark:bg-card flex flex-col gap-3 rounded-2xl border px-4 py-5 shadow-sm transition-all duration-300 hover:shadow-md md:px-5 ${className}`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`bg-opacity-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-current/10 ${color}`}
      >
        {icon}
      </div>
      <p className="text-muted-foreground/80 text-xs font-bold tracking-wider uppercase">
        {label}
      </p>
    </div>
    <div className="mt-1 space-y-1">
      <p
        className={`truncate text-xl font-bold tracking-tight lg:text-2xl ${color}`}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-muted-foreground max-w-[140px] text-xs font-medium text-pretty">
          {subValue}
        </p>
      )}
    </div>
  </div>
);

/** Custom Tooltip สำหรับ Bar Chart */
const CustomBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { total: number };
  }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const totalHrs = payload[0]?.payload?.total ?? 0;
  const diff = totalHrs - FULL_HOURS;
  return (
    <div className="bg-popover border-border rounded-lg border p-3 shadow-lg">
      <p className="text-foreground mb-1 text-sm font-semibold">{label}</p>
      <div className="text-xs">
        <span className="text-muted-foreground">ทำงาน: </span>
        <span className="text-foreground font-medium">
          {fmtHours(totalHrs)}
        </span>
      </div>
      {diff >= 0 ? (
        <div className="text-xs text-yellow-500">เกิน +{fmtHours(diff)}</div>
      ) : (
        <div className="text-xs text-orange-500">
          ขาด {fmtHours(Math.abs(diff))}
        </div>
      )}
    </div>
  );
};

/** Custom Tooltip สำหรับ Pie Chart */
const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string; total: number };
  }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-popover border-border rounded-lg border p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: d.payload.color }}
        />
        <span className="text-foreground text-sm font-medium">
          {d.name}: {d.value} ครั้ง (
          {((d.value / d.payload.total) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

// ============ Main Component ============

function DashboardId({
  employee,
  records,
  total,
  analysis,
  onRangeChange,
}: DashboardIdProps) {
  // Pagination สำหรับชั่วโมงทำงานรายวัน
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyLimit, setDailyLimit] = useState(10);

  // ฟิลเตอร์ช่วงเวลา (1 เดือน / 3 เดือน / 6 เดือน / 1 ปี)
  const [range, setRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  // pendingRange ถูก set ก่อน (sync) เพื่อให้ hook ใช้ค่าล่าสุดทันที ไม่ติด stale state
  const [pendingRange, setPendingRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');

  const getStartDateForRange = (r: string) => {
    const now = new Date();
    switch (r) {
      case '1m':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case '3m':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case '6m':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(0);
    }
  };

  // records ที่ถูกกรองตามช่วงเวลา (ใช้ pendingRange เพื่อให้ตอบสนองทันที)
  const effectiveRecords = React.useMemo(() => {
    const start = getStartDateForRange(pendingRange);
    return records.filter((r) => {
      if (!r.check_in) return false;
      const d = new Date(r.check_in);
      if (isNaN(d.getTime())) return false;
      return d >= start;
    });
  }, [records, pendingRange]);

  // ดึงข้อมูล analysis จาก API ตามช่วงเวลา (ถ้ามี employee)
  // ใช้ pendingRange เพื่อให้ hook fetch ด้วยค่า range ล่าสุดทันที ไม่รอ setRange async
  const { analysis: rangedAnalysis } = useEmployeeAnalysis(
    onRangeChange ? undefined : employee?.user_id,
    getStartDateForRange(pendingRange),
    new Date()
  );

  const usedAnalysis = onRangeChange ? (analysis ?? rangedAnalysis) : (rangedAnalysis ?? analysis);

  // กรอง chart_data จาก analysis ที่ใช้ (ถ้ามี)
  const filteredChartData = React.useMemo(() => {
    if (!Array.isArray(usedAnalysis?.chart_data)) return null;
    const start = getStartDateForRange(pendingRange);
    return usedAnalysis!.chart_data.filter((d) => new Date(d.date) >= start);
  }, [usedAnalysis, pendingRange]);

  // เมื่อผู้ใช้เลือกช่วงเวลา ให้ส่ง callback เพื่ออัพเดต calendar ที่หน้า parent
  const handleRangeChange = (r: '1m' | '3m' | '6m' | '1y') => {
    // set pendingRange ก่อน (sync) เพื่อให้ useMemo และ hook render ด้วยค่าใหม่ทันที
    setPendingRange(r);
    setRange(r);
    const start = getStartDateForRange(r);
    const end = new Date();
    if (typeof onRangeChange === 'function') {
      onRangeChange(start, end);
    }
  };

  // รีเซ็ตหน้าเมื่อข้อมูลหลักเปลี่ยน (เช่น เปลี่ยนฟิลเตอร์วันที่)
  React.useEffect(() => {
    setDailyPage(1);
  }, [records, usedAnalysis]);

  // ใช้ useMemo เพื่อประสิทธิภาพเมื่อข้อมูลมีปริมาณมาก (สูงสุด 400 รายการ)
  const barData = React.useMemo(() => {
    if (Array.isArray(filteredChartData)) {
      // Aggregate based on range: month buckets for 1y, else day buckets
      const grouped = new Map<string, { name: string; total: number }>();
      filteredChartData.forEach((d) => {
        const dateObj = new Date(d.date);
        if (isNaN(dateObj.getTime())) return;
        const key =
          range === '1y'
            ? getMonthKey(dateObj)
            : dateObj.toISOString().slice(0, 10);
        const name =
          range === '1y'
            ? getXAxisMonthLabel(dateObj)
            : getXAxisDayLabel(dateObj);
        const entry = grouped.get(key) ?? { name, total: 0 };
        entry.total += d.hours;
        grouped.set(key, entry);
      });

      return Array.from(grouped.values()).map(({ name, total: totalHrs }) => {
        const normal = Math.min(totalHrs, FULL_HOURS);
        const overtime = totalHrs > FULL_HOURS ? totalHrs - FULL_HOURS : 0;
        return {
          name,
          normal: Math.floor(normal * 100) / 100,
          overtime: Math.floor(overtime * 100) / 100,
          total: totalHrs,
          isFull: totalHrs >= FULL_HOURS,
        };
      });
    }

    return buildBarData(effectiveRecords, range);
  }, [filteredChartData, effectiveRecords, range]);

  const monthlyGrades = React.useMemo(
    () => buildMonthlyGradeData(effectiveRecords),
    [effectiveRecords]
  );
  const checkedInCount = React.useMemo(
    () => effectiveRecords.filter((r) => !!r.check_in).length,
    [effectiveRecords]
  );

  // เลือกเดือนแรกที่มีข้อมูล
  const selectedMonth = monthlyGrades[0];
  const selectedMonthGrade =
    usedAnalysis?.summary?.performance_grade || selectedMonth?.grade;
  const selectedMonthGradeStyle = gradeColor(selectedMonthGrade);

  const {
    pieDataWithTotal,
    fullCount,
    notFullCount,
    totalWorkHours,
    avgWorkHours,
    diffHours,
  } = React.useMemo(() => {
    // คำนวณทั้งหมดจาก records ที่ถูกกรองตามช่วงเวลา (effectiveRecords)
    const pieD = selectedMonth
      ? buildMonthlyDetailPieData(effectiveRecords, selectedMonth.monthKey)
      : [];
    const totalP = pieD.reduce((sum, d) => sum + d.value, 0);
    const pieWithTotal = pieD.map((d) => ({ ...d, total: totalP }));

    // Group records by date to compute per-day totals (prevents double-counting when multiple records exist per day)
    const dayTotals = new Map<string, number>();
    effectiveRecords.forEach((r) => {
      if (!r.check_in) return;
      const key = formatDate(r.check_in);
      const hrs = calcHours(r);
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + hrs);
    });

    const dayEntries = Array.from(dayTotals.values());
    const f = dayEntries.filter((hrs) => hrs >= FULL_HOURS).length;
    const nf = dayEntries.filter((hrs) => hrs > 0 && hrs < FULL_HOURS).length;
    const tHrs = dayEntries.reduce((sum, h) => sum + h, 0);
    const avgHrs = dayEntries.length > 0 ? tHrs / dayEntries.length : 0;
    const expectedT = dayEntries.length * FULL_HOURS;
    const dHrs = tHrs - expectedT;

    return {
      pieDataWithTotal: pieWithTotal,
      fullCount: f,
      notFullCount: nf,
      totalWorkHours: tHrs,
      avgWorkHours: avgHrs,
      diffHours: dHrs,
    };
  }, [effectiveRecords, selectedMonth]);

  const successRateLabel = usedAnalysis?.summary
    ? `${((fullCount / (fullCount + notFullCount || 1)) * 100).toFixed(0)}% ของวันที่มีบันทึก`
    : `${checkedInCount > 0 ? ((fullCount / checkedInCount) * 100).toFixed(0) : 0}% ของทั้งหมด`;

  const groupedList = React.useMemo(() => {
    if (!selectedMonth?.monthKey) return [];

    const activeRecords = effectiveRecords.filter((r) => {
      if (!r.check_in) return false;
      const date = new Date(r.check_in);
      if (isNaN(date.getTime())) return false;
      return getMonthKey(date) === selectedMonth.monthKey;
    });

    const grouped = new Map<
      string,
      { totalHours: number; count: number; records: AttendanceRecord[] }
    >();

    activeRecords.forEach((r) => {
      const date = new Date(r.check_in!);
      if (isNaN(date.getTime())) return;

      const key = formatDate(r.check_in);
      const entry = grouped.get(key) ?? {
        totalHours: 0,
        count: 0,
        records: [],
      };

      entry.totalHours += calcHours(r);
      entry.count += 1;
      entry.records.push(r);
      grouped.set(key, entry);
    });

    return Array.from(grouped.entries());
  }, [effectiveRecords, selectedMonth]);

  const totalDailyPages = Math.ceil(groupedList.length / dailyLimit);
  const paginatedList = React.useMemo(
    () =>
      groupedList.slice((dailyPage - 1) * dailyLimit, dailyPage * dailyLimit),
    [groupedList, dailyLimit, dailyPage]
  );

  return (
    <div className="space-y-6 px-4">
      {/* Time range filter buttons */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-muted-foreground text-sm">ช่วงเวลา:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRangeChange('1m')}
            className={`rounded-md border px-3 py-1 text-sm transition-colors ${
              range === '1m'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/10 text-muted-foreground hover:bg-muted/20 border-transparent'
            }`}
          >
            1 เดือน
          </button>
          <button
            type="button"
            onClick={() => handleRangeChange('3m')}
            className={`rounded-md border px-3 py-1 text-sm transition-colors ${
              range === '3m'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/10 text-muted-foreground hover:bg-muted/20 border-transparent'
            }`}
          >
            3 เดือน
          </button>
          <button
            type="button"
            onClick={() => handleRangeChange('6m')}
            className={`rounded-md border px-3 py-1 text-sm transition-colors ${
              range === '6m'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/10 text-muted-foreground hover:bg-muted/20 border-transparent'
            }`}
          >
            6 เดือน
          </button>
          <button
            type="button"
            onClick={() => handleRangeChange('1y')}
            className={`rounded-md border px-3 py-1 text-sm transition-colors ${
              range === '1y'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/10 text-muted-foreground hover:bg-muted/20 border-transparent'
            }`}
          >
            1 ปี
          </button>
        </div>
      </div>

      {/* 📊 Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<LogIn className="h-5 w-5" />}
          label="บันทึกทั้งหมด"
          value={`${fullCount + notFullCount} วัน`}
          subValue={
            usedAnalysis?.summary ? `ในเดือนปัจจุบัน` : `จากรายการทั้งหมด`
          }
          color="text-indigo-600"
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="ชั่วโมงทำงานรวม"
          value={fmtHours(totalWorkHours)}
          subValue={
            usedAnalysis?.summary
              ? `รวมเวลาทั้งหมดในระบบ`
              : `จาก ${total} ครั้งที่บันทึก`
          }
          color="text-primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="ทำครบ 9 ชม. (Success)"
          value={`${fullCount} วัน`}
          subValue={successRateLabel}
          color="text-green-600"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="ไม่ครบ (Partial)"
          value={`${notFullCount} วัน`}
          subValue={
            diffHours < 0
              ? `ขาดรวม ${fmtHours(Math.abs(diffHours))}`
              : `เกินแผน ${fmtHours(diffHours)}`
          }
          color="text-orange-500"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="เฉลี่ยชั่วโมง/วัน"
          value={fmtHours(avgWorkHours)}
          subValue={
            avgWorkHours >= FULL_HOURS
              ? 'สูงกว่าเกณฑ์มาตรฐาน'
              : `ต่ำกว่าเกณฑ์ ${fmtHours(FULL_HOURS - avgWorkHours)}`
          }
          color="text-blue-600"
        />
      </div>

      {/* 📊 Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="border-border bg-card dark:border-border space-y-6 rounded-2xl border p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                สถิติทำงานครบ 9 ชม.
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
                ชั่วโมงการทำงานรายวัน
              </p>
            </div>
          </div>

          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  fill="transparent"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 14]}
                  ticks={[0, 3, 6, 9, 12]}
                  interval={0}
                  unit=" ชม."
                />
                {/* เส้นเกณฑ์ 9 ชม. */}
                <ReferenceLine
                  y={FULL_HOURS}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{
                    value: '9 ชม.',
                    position: 'right',
                    fontSize: 11,
                    fill: '#ef4444',
                  }}
                />
                <RechartsTooltip content={<CustomBarTooltip />} />
                {/* แท่งปกติ (max 9 ชม.) — เขียวครบ/ส้มไม่ครบ */}
                <Bar
                  dataKey="normal"
                  stackId="hours"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={40}
                  name="ชั่วโมงทำงาน"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {barData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.isFull ? '#22c55e' : '#f97316'}
                    />
                  ))}
                </Bar>
                {/* แท่ง OT (เกิน 9 ชม.) — สีเหลือง */}
                <Bar
                  dataKey="overtime"
                  stackId="hours"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="เกิน (>9 ชม.)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-75 flex-col items-center justify-center">
              <BarChart3 className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">
                ไม่มีข้อมูลสำหรับแสดงกราฟ
              </p>
            </div>
          )}
        </div>

        {/* Pie / Donut Chart */}
        <div className="border-border bg-card dark:border-border space-y-6 rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  สถิติรายเดือน
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
                  ภาพรวมตลอดเดือน
                </p>
              </div>
            </div>

            {/* Month Statistics */}
            {selectedMonth && (
              <div
                className={`space-y-1 rounded-lg p-3 ${gradeColor(selectedMonth.grade).bg}`}
              >
                <p
                  className={`text-sm font-semibold ${gradeColor(selectedMonth.grade).text}`}
                >
                  {new Date(selectedMonth.monthDate).toLocaleDateString(
                    'th-TH',
                    {
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </p>
                <p
                  className={`text-base font-bold ${selectedMonthGradeStyle.text}`}
                >
                  เกรด {selectedMonthGrade}{' '}
                  <span className="text-sm font-medium opacity-80">
                    ({getGradeLabel(selectedMonthGrade)})
                  </span>
                  {/* Info tooltip explaining calculation (prefer backend summary when available) */}
                  <TooltipProvider delayDuration={0}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground ml-2 inline-flex items-center rounded-full p-1"
                          aria-label="คำอธิบายการคำนวณเกรด"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        sideOffset={6}
                        className="bg-background text-foreground max-w-sm border shadow-inner"
                      >
                        <div className="space-y-2 text-xs">
                          {usedAnalysis?.summary ? (
                            <>
                              <div className="font-semibold">สรุปการคำนวณ</div>
                              <div>
                                วันทั้งหมด:{' '}
                                {(
                                  (usedAnalysis.summary.success_days_count ??
                                    0) +
                                  (usedAnalysis.summary.partial_days_count ?? 0)
                                ).toString()}{' '}
                                วัน
                              </div>
                              <div>
                                ชั่วโมงรวม:{' '}
                                {(
                                  (usedAnalysis.summary.total_work_minutes ??
                                    0) / 60
                                ).toFixed(2)}
                                ชม. (
                                {(
                                  usedAnalysis.summary.total_work_minutes ?? 0
                                ).toLocaleString()}{' '}
                                นาที)
                              </div>
                              <div>
                                วันครบ ≥9 ชม.:{' '}
                                {usedAnalysis.summary.success_days_count ?? 0}{' '}
                                วัน
                              </div>
                              <div>
                                วันไม่ครบ:{' '}
                                {usedAnalysis.summary.partial_days_count ?? 0}{' '}
                                วัน
                              </div>
                              <div>
                                ชั่วโมงเฉลี่ย/วัน:{' '}
                                {Number(
                                  usedAnalysis.summary.avg_hours_per_day ?? 0
                                ).toFixed(2)}{' '}
                                ชม.
                              </div>
                              {(() => {
                                const success =
                                  usedAnalysis.summary.success_days_count ?? 0;
                                const partial =
                                  usedAnalysis.summary.partial_days_count ?? 0;
                                const total = success + partial;
                                const avgHours = Number(
                                  usedAnalysis.summary.avg_hours_per_day ?? 0
                                );
                                const ratio = total > 0 ? (success / total) * 100 : 0;
                                let computedGrade = 'F';
                                if (ratio >= 90 && avgHours >= FULL_HOURS) {
                                  computedGrade = 'A';
                                } else if (ratio >= 75) {
                                  computedGrade = 'B';
                                } else if (ratio >= 50) {
                                  computedGrade = 'C';
                                }
                                const reason =
                                  computedGrade === 'A'
                                    ? `สัดส่วน ≥ 90% และ ชั่วโมงเฉลี่ย ≥ ${FULL_HOURS}`
                                    : computedGrade === 'B'
                                    ? `สัดส่วน ≥ 75%`
                                    : computedGrade === 'C'
                                    ? `สัดส่วน ≥ 50%`
                                    : `สัดส่วน < 50%`;

                                return (
                                  <div>
                                    สัดส่วนสำเร็จ = {success} / {total} ={' '}
                                    {ratio.toFixed(0)}% → เกรด {computedGrade}{' '}
                                    ({reason})
                                  </div>
                                );
                              })()}
                              <div className="font-medium">
                                เกรดปัจจุบัน:{' '}
                                {usedAnalysis.summary.performance_grade}
                              </div>
                              <div className="font-medium">
                                เกณฑ์: A ถ้า สัดส่วนสำเร็จ ≥ 90%
                                และชั่วโมงเฉลี่ย ≥ 9.0
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold">
                                ตัวอย่างกระชับ
                              </div>
                              <div>จำนวนวันทั้งหมด = 20 วัน</div>
                              <div>ชั่วโมงรวม = 10,950 นาที (≈ 182.50 ชม.)</div>
                              <div>
                                วันครบ (≥9 ชม.) = 18 วัน, วันไม่ครบ = 2 วัน
                              </div>
                              <div>
                                ชั่วโมงเฉลี่ย/วัน = 182.5 / 20 = 9.13 ชม.
                              </div>
                              <div>
                                สัดส่วนสำเร็จ = 18 / 20 = 90% → เกรด A (เพราะ
                                สัดส่วน ≥ 90% และ ชั่วโมงเฉลี่ย ≥ 9.0)
                              </div>
                            </>
                          )}
                        </div>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </p>
              </div>
            )}
          </div>

          {pieDataWithTotal.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieDataWithTotal}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {pieDataWithTotal.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-foreground text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-75 flex-col items-center justify-center">
              <Users className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      </div>

      {/* Work Hours Breakdown — รายวัน */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <Clock className="text-primary h-5 w-5" />
            <h3 className="font-semibold">ชั่วโมงทำงานรายวัน</h3>
            <Badge variant="outline" className="ml-auto">
              เกณฑ์ {FULL_HOURS} ชม.
            </Badge>
          </div>
        </div>

        <div className="divide-y">
          {groupedList.length > 0 ? (
            paginatedList.map(([label, data]) => {
              const expectedForGroup = data.count * FULL_HOURS;
              const diff = data.totalHours - expectedForGroup;
              const isFull = data.totalHours >= expectedForGroup;
              const percentage = Math.min(
                (data.totalHours / expectedForGroup) * 100,
                100
              );

              const dayRecords = data.records;

              return (
                <Dialog key={label}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-muted/30 w-full cursor-pointer px-5 py-4 text-left transition-colors"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        {/* วันที่ */}
                        <div className="flex items-center gap-2 sm:w-48">
                          <CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex-1">
                          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull ? 'bg-green-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* ชั่วโมง + ขาด/เกิน */}
                        <div className="flex items-center gap-3 sm:w-56 sm:justify-end">
                          <span className="text-sm font-bold">
                            {fmtHours(data.totalHours)}
                          </span>
                          <Badge
                            variant={isFull ? 'default' : 'destructive'}
                            className="min-w-25 justify-center text-xs"
                          >
                            {isFull ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                เกิน +{fmtHours(diff)}
                              </>
                            ) : (
                              <>
                                <AlertCircle className="mr-1 h-3 w-3" />
                                ขาด {fmtHours(Math.abs(diff))}
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  </DialogTrigger>

                  {/* === Dialog Content === */}
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="text-primary h-5 w-5" />
                        รายละเอียดวันที่ {label}
                      </DialogTitle>
                      <DialogDescription>
                        สรุปการเข้า-ออกงาน • ทำงานรวม{' '}
                        {fmtHours(data.totalHours)}
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea
                      className="max-h-[80vh] w-full pr-4"
                      style={{ maxHeight: 'calc(85vh - 120px)' }}
                    >
                      <div className="space-y-4 pt-2 pb-8">
                        {dayRecords.map((rec, idx) => {
                          const checkInTime = formatTime(rec.check_in);
                          const checkOutTime = formatTime(rec.check_out);
                          const hours = calcHours(rec);
                          const recIsFull = hours >= FULL_HOURS;
                          const { checkInImageUrl, checkOutImageUrl } =
                            getAttendanceImageUrls(rec);

                          return (
                            <div
                              key={rec.id || idx}
                              className="bg-muted/30 rounded-lg border p-4"
                            >
                              {/* Check-in / Check-out Row */}
                              <div className="flex gap-4">
                                <div className="grid flex-1 grid-cols-2 gap-4">
                                  {/* Check-in */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/30">
                                        <LogIn className="h-4 w-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                          เข้างาน
                                        </p>
                                        <p className="text-lg font-black text-green-600">
                                          {checkInTime}
                                        </p>
                                      </div>
                                    </div>
                                    <AttendanceDeviceCard
                                      device={rec.check_in_device}
                                      confidence={rec.check_in_confidence}
                                    />
                                  </div>

                                  {/* Check-out */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">
                                        <LogOut className="h-4 w-4 text-orange-600" />
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                          ออกงาน
                                        </p>
                                        <p className="text-lg font-black text-orange-600">
                                          {checkOutTime}
                                        </p>
                                      </div>
                                    </div>
                                    <AttendanceDeviceCard
                                      device={rec.check_out_device}
                                      confidence={rec.check_out_confidence}
                                    />
                                  </div>
                                </div>

                                {/* ปุ่มดูรูปภาพ — อยู่ขวาสุด */}
                                <div className="flex items-start">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button
                                        type="button"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-500 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-600 hover:shadow-sm dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/50"
                                        title="ดูรูปภาพเข้า-ออกงาน"
                                      >
                                        <ImageIcon className="h-4 w-4" />
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <ImageIcon className="text-primary h-5 w-5" />
                                          รูปภาพเข้า-ออกงาน • {label}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea
                                        className="mt-4 w-full pr-4"
                                        style={{
                                          maxHeight: 'calc(80vh - 80px)',
                                        }}
                                      >
                                        <div className="grid gap-4 pt-2 pb-8 sm:grid-cols-2">
                                          {/* รูปเข้างาน */}
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 dark:bg-green-950/30">
                                                <LogIn className="h-3.5 w-3.5 text-green-600" />
                                              </div>
                                              <span className="text-sm font-semibold text-green-600">
                                                รูปเข้างาน
                                              </span>
                                              <span className="text-muted-foreground text-xs font-medium">
                                                {checkInTime} น.
                                              </span>
                                            </div>
                                            <div className="bg-muted overflow-hidden rounded-xl border">
                                              <div className="flex aspect-square w-full items-center justify-center">
                                                {checkInImageUrl ? (
                                                  <img
                                                    src={checkInImageUrl}
                                                    alt="รูปเข้างาน"
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="text-muted-foreground/40 h-12 w-12" />
                                                    <span className="text-muted-foreground text-sm font-medium">
                                                      ยังไม่มีรูปภาพ
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          {/* รูปออกงาน */}
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-950/30">
                                                <LogOut className="h-3.5 w-3.5 text-orange-600" />
                                              </div>
                                              <span className="text-sm font-semibold text-orange-600">
                                                รูปออกงาน
                                              </span>
                                              <span className="text-muted-foreground text-xs font-medium">
                                                {checkOutTime} น.
                                              </span>
                                            </div>
                                            <div className="bg-muted overflow-hidden rounded-xl border">
                                              <div className="flex aspect-square w-full items-center justify-center">
                                                {checkOutImageUrl ? (
                                                  <img
                                                    src={checkOutImageUrl}
                                                    alt="รูปออกงาน"
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="text-muted-foreground/40 h-12 w-12" />
                                                    <span className="text-muted-foreground text-sm font-medium">
                                                      ยังไม่มีรูปภาพ
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>

                              {/* Summary */}
                              <div className="mt-3 flex items-center justify-between border-t pt-3">
                                <span className="text-muted-foreground text-xs">
                                  ชั่วโมงทำงาน
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">
                                    {fmtHours(hours)}
                                  </span>
                                  <Badge
                                    variant={
                                      recIsFull ? 'default' : 'destructive'
                                    }
                                    className="text-[10px]"
                                  >
                                    {recIsFull ? ' ครบ' : 'ไม่ครบ'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              );
            })
          ) : (
            <div className="px-5 py-12 text-center">
              <Clock className="text-muted-foreground mx-auto h-10 w-10" />
              <p className="text-muted-foreground mt-2 text-sm">
                ยังไม่มีข้อมูลการทำงาน
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {groupedList.length > 0 && totalDailyPages > 0 && (
          <div className="flex items-center justify-center border-t p-4">
            <PaginationControll
              page={dailyPage}
              totalPages={totalDailyPages}
              limit={dailyLimit}
              onPageChange={(p) => setDailyPage(p)}
              onLimitChange={(l) => {
                setDailyLimit(l);
                setDailyPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardId;
