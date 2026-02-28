import type { AttendanceRecord } from '@/@types/Attendance';
import type { EmployeesList } from '@/@types/Employees';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import {
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';

interface DashboardIdProps {
  employee: EmployeesList;
  records: AttendanceRecord[];
  total: number;
}

/** ทำงานครบ 9 ชม. หรือไม่ (นับจาก check_in → check_out) */
const FULL_HOURS = 9;

/** คำนวณเกรด A/B/C จำนวนวันที่ทำครบ 9 ชม. (รายเดือน: ~20-22 วันทำงาน) */
const calcMonthlyGrade = (
  fullDaysCount: number,
  totalDaysCount: number
): 'A' | 'B' | 'C' => {
  if (totalDaysCount === 0) return 'C';
  const percentage = (fullDaysCount / totalDaysCount) * 100;
  if (percentage >= 90) return 'A'; // ≥90%
  if (percentage >= 75) return 'B'; // 75-89%
  return 'C'; // <75%
};

/** สีเกรด */
const gradeColor = (grade: 'A' | 'B' | 'C') => {
  switch (grade) {
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
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-400',
      };
  }
};

/** สร้างข้อมูลการให้เกรดรายเดือน */
const buildMonthlyGradeData = (records: AttendanceRecord[]) => {
  const monthlyData = new Map<
    string,
    { fullDays: number; totalDays: number; dates: string[] }
  >();

  records.forEach((r) => {
    if (!r.check_in) return;
    const date = new Date(r.check_in);
    if (isNaN(date.getTime())) return;

    // สร้าง key: YYYY-MM (ปีและเดือน)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const dateStr = date.toISOString().split('T')[0];

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { fullDays: 0, totalDays: 0, dates: [] });
    }

    const entry = monthlyData.get(monthKey)!;
    entry.totalDays += 1;
    entry.dates.push(dateStr);

    if (isFullHours(r)) {
      entry.fullDays += 1;
    }
  });

  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      return {
        monthKey,
        monthDate,
        fullDays: data.fullDays,
        totalDays: data.totalDays,
        grade: calcMonthlyGrade(data.fullDays, data.totalDays),
      };
    });
};

/** คำนวณชั่วโมงทำงานจาก check_in → check_out */
const calcHours = (record: AttendanceRecord): number => {
  if (!record.check_in || !record.check_out) return 0;
  const inTime = new Date(record.check_in).getTime();
  const outTime = new Date(record.check_out).getTime();
  if (isNaN(inTime) || isNaN(outTime)) return 0;
  return (outTime - inTime) / (1000 * 60 * 60); // แปลง ms → ชม.
};

const isFullHours = (record: AttendanceRecord): boolean => {
  return calcHours(record) >= FULL_HOURS;
};

/** แสดงเวลาเป็น "X ชม. Y นาที" (เช่น 1.17 hrs → "1 ชม. 10 นาที") */
const fmtHours = (decimalHours: number): string => {
  const totalMinutes = Math.round(Math.abs(decimalHours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
};

// ============ Data processors ============

/** สร้างข้อมูล Bar Chart รายวัน — แสดงชั่วโมงทำงาน */
const buildBarData = (records: AttendanceRecord[]) => {
  const grouped = new Map<string, number>();

  records.forEach((r) => {
    if (!r.check_in) return;
    const date = new Date(r.check_in);
    if (isNaN(date.getTime())) return;

    const key = date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });

    const hours = calcHours(r);
    grouped.set(key, (grouped.get(key) ?? 0) + hours);
  });

  return Array.from(grouped.entries()).map(([name, totalHrs]) => {
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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const recordMonthKey = `${year}-${month}`;

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
}> = ({ icon, label, value, subValue, color = 'text-primary' }) => (
  <div className="bg-card group hover:border-primary/30 rounded-lg border p-4 transition-all duration-200 hover:shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`bg-opacity-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} bg-current/10`}
      >
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {subValue && (
          <p className="text-muted-foreground text-[11px]">{subValue}</p>
        )}
      </div>
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

function DashboardId({ employee, records, total }: DashboardIdProps) {
  // ใช้ useMemo เพื่อประสิทธิภาพเมื่อข้อมูลมีปริมาณมาก (สูงสุด 400 รายการ)
  const barData = React.useMemo(() => buildBarData(records), [records]);
  const monthlyGrades = React.useMemo(
    () => buildMonthlyGradeData(records),
    [records]
  );

  // เลือกเดือนแรกที่มีข้อมูล
  const selectedMonth = monthlyGrades[0];

  const stats = React.useMemo(() => {
    const pieData = selectedMonth
      ? buildMonthlyDetailPieData(records, selectedMonth.monthKey)
      : [];
    const totalForPie = pieData.reduce((sum, d) => sum + d.value, 0);
    const pieDataWithTotal = pieData.map((d) => ({ ...d, total: totalForPie }));

    const fullCount = records.filter(isFullHours).length;
    const totalWorkHours = records.reduce((sum, r) => sum + calcHours(r), 0);
    const avgWorkHours =
      records.length > 0 ? totalWorkHours / records.length : 0;
    const expectedTotalHours =
      records.filter((r) => r.check_in).length * FULL_HOURS;
    const diffHours = totalWorkHours - expectedTotalHours;

    return {
      pieDataWithTotal,
      fullCount,
      totalWorkHours,
      avgWorkHours,
      diffHours,
    };
  }, [records, selectedMonth]);

  const notFullCount = records.filter(
    (r) => r.check_in && !isFullHours(r)
  ).length;
  const {
    pieDataWithTotal,
    fullCount,
    totalWorkHours,
    avgWorkHours,
    diffHours,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">แดชบอร์ด</h2>
            <p className="text-muted-foreground text-sm">
              ภาพรวมการเข้างานของ {employee.display_name}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="ชั่วโมงทำงานรวม"
          value={fmtHours(totalWorkHours)}
          subValue={`จาก ${total} ครั้งที่บันทึก`}
          color="text-primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="ครบ 9 ชม."
          value={`${fullCount} ครั้ง`}
          subValue={`${records.filter((r) => r.check_in).length > 0 ? ((fullCount / records.filter((r) => r.check_in).length) * 100).toFixed(0) : 0}% ของทั้งหมด`}
          color="text-green-600"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="ไม่ครบ 9 ชม."
          value={`${notFullCount} ครั้ง`}
          subValue={
            diffHours < 0
              ? `ขาดรวม ${fmtHours(Math.abs(diffHours))}`
              : `เกินรวม ${fmtHours(diffHours)}`
          }
          color="text-orange-500"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="ชม. ทำงานเฉลี่ย"
          value={fmtHours(avgWorkHours)}
          subValue={
            avgWorkHours >= FULL_HOURS
              ? '✅ เฉลี่ยครบ 9 ชม.'
              : `⚠️ ขาดอีก ${fmtHours(FULL_HOURS - avgWorkHours)}`
          }
          color="text-blue-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="bg-card rounded-lg border p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <h3 className="font-semibold">สถิติทำงานครบ 9 ชม.</h3>
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
                <Tooltip content={<CustomBarTooltip />} />
                {/* แท่งปกติ (max 9 ชม.) — เขียวครบ/ส้มไม่ครบ */}
                <Bar
                  dataKey="normal"
                  stackId="hours"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={40}
                  name="ชั่วโมงทำงาน"
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
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center">
              <BarChart3 className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">
                ไม่มีข้อมูลสำหรับแสดงกราฟ
              </p>
            </div>
          )}
        </div>

        {/* Pie / Donut Chart */}
        <div className="bg-card rounded-lg border p-5">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users className="text-primary h-5 w-5" />
              <h3 className="font-semibold">สถิติรายเดือน</h3>
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
                  className={`text-xs font-medium ${gradeColor(selectedMonth.grade).text}`}
                >
                  ทำงานครบ 9 ชม. {selectedMonth.fullDays} จาก{' '}
                  {selectedMonth.totalDays} วัน
                </p>
                <p
                  className={`text-base font-bold ${gradeColor(selectedMonth.grade).text}`}
                >
                  เกรด {selectedMonth.grade}
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
                >
                  {pieDataWithTotal.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
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
            <div className="flex h-[300px] flex-col items-center justify-center">
              <Users className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      </div>

      {/* Work Hours Breakdown — รายวัน */}
      {(() => {
        const activeRecords = records.filter((r) => {
          if (!r.check_in) return false;

          // เช็คว่า record นี้อยู่ในเดือนที่เลือกหรือไม่
          const date = new Date(r.check_in);
          if (isNaN(date.getTime())) return false;

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const recordMonthKey = `${year}-${month}`;

          return recordMonthKey === selectedMonth?.monthKey;
        });

        const grouped = new Map<
          string,
          { totalHours: number; count: number }
        >();

        activeRecords.forEach((r) => {
          const date = new Date(r.check_in!);
          if (isNaN(date.getTime())) return;
          const hours = calcHours(r);

          const key = formatDate(r.check_in);

          const entry = grouped.get(key) ?? { totalHours: 0, count: 0 };
          entry.totalHours += hours;
          entry.count += 1;
          grouped.set(key, entry);
        });

        const groupedList = Array.from(grouped.entries());

        return (
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
                groupedList.map(([label, data]) => {
                  const expectedForGroup = data.count * FULL_HOURS;
                  const diff = data.totalHours - expectedForGroup;
                  const isFull = data.totalHours >= expectedForGroup;
                  const percentage = Math.min(
                    (data.totalHours / expectedForGroup) * 100,
                    100
                  );

                  return (
                    <div
                      key={label}
                      className="hover:bg-muted/30 px-5 py-4 transition-colors"
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
                            className="min-w-[100px] justify-center text-xs"
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
                    </div>
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
          </div>
        );
      })()}
    </div>
  );
}

export default DashboardId;
