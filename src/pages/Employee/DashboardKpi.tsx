import React from 'react';
import {
  TrendingUp,
  Timer,
  AlertCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/**
 * KPI Dashboard Component
 * สำหรับแสดงผลการรักษาวินัยและการเข้างาน (Self-Monitoring)
 */
export function DashboardKpi() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { profile } = useProfile();

  // ดึงประวัติการเข้างานเดือนปัจจุบัน (สูงสุด 31 รายการ)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { records, loading } = useEmployeeAttendanceHistory(
    profile?.user_id,
    1,
    31,
    startOfMonth,
    endOfMonth
  );

  // --- คำนวณ KPIs ---
  const TARGET_HOURS = 9;

  const { stats, chartData } = React.useMemo(() => {
    if (!records || records.length === 0) return { stats: null, chartData: [] };

    // เตรียมข้อมูลกราฟ
    const dataForChart = (records || [])
      .map((r) => {
        if (!r.check_in || !r.check_out) return null;
        const inTime = new Date(r.check_in).getTime();
        const outTime = new Date(r.check_out).getTime();
        if (isNaN(inTime) || isNaN(outTime)) return null;

        const hours = Number(
          ((outTime - inTime) / (1000 * 60 * 60)).toFixed(1)
        );
        const day = new Date(r.check_in).getDate();

        return {
          day: `${day}`,
          hours,
          status: hours >= TARGET_HOURS ? 'ผ่าน' : 'ไม่ผ่าน',
        };
      })
      .filter((d) => d !== null)
      .sort((a, b) => Number(a.day) - Number(b.day));

    const totalDays = records.length;
    let completeDays = 0;
    let incompleteDays = 0;

    records.forEach((r) => {
      if (!r.check_in || !r.check_out) {
        incompleteDays++;
        return;
      }
      const inTime = new Date(r.check_in).getTime();
      const outTime = new Date(r.check_out).getTime();
      const hours = (outTime - inTime) / (1000 * 60 * 60);
      if (hours >= TARGET_HOURS) completeDays++;
      else incompleteDays++;
    });

    const efficiency = Math.round((completeDays / totalDays) * 100);

    // ระดับสถานะ
    let statusColor = 'bg-green-500';
    let statusText = 'ยอดเยี่ยม';
    let textColor = 'text-green-600 dark:text-green-400';
    let bgColor = 'bg-green-50 dark:bg-green-950/20';
    let borderColor = 'border-green-200 dark:border-green-900/50';

    if (efficiency < 75) {
      statusColor = 'bg-red-500';
      statusText = 'ต้องปรับปรุง';
      textColor = 'text-red-600 dark:text-red-400';
      bgColor = 'bg-red-50 dark:bg-red-950/20';
      borderColor = 'border-red-200 dark:border-red-900/50';
    } else if (efficiency < 90) {
      statusColor = 'bg-yellow-500';
      statusText = 'ต่ำกว่ามาตรฐาน';
      textColor = 'text-yellow-600 dark:text-yellow-400';
      bgColor = 'bg-yellow-50 dark:bg-yellow-950/20';
      borderColor = 'border-yellow-200 dark:border-yellow-900/50';
    }

    return {
      stats: {
        efficiency,
        incompleteDays,
        totalDays,
        statusColor,
        statusText,
        textColor,
        bgColor,
        borderColor,
        completeDays,
      },
      chartData: dataForChart,
    };
  }, [records]);

  if (loading) return null;

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="border-primary/20 bg-primary/5 hover:bg-primary/10 flex w-full items-center justify-between px-4 py-8 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-lg p-2">
            <TrendingUp className="text-primary h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="block text-base font-bold">
              ตรวจสอบวินัยส่วนตัว (Self-Monitoring)
            </span>
            <span className="text-muted-foreground text-xs">
              สรุปความรับผิดชอบต่อเวลาประจำเดือนนี้
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {stats && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <p className={`text-sm font-bold ${stats.textColor}`}>
                  {stats.efficiency}% ทำงานครบถ้วน
                </p>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  ประสิทธิภาพปัจจุบัน
                </p>
              </div>
              <div className="bg-muted ring-border h-2 w-24 overflow-hidden rounded-full ring-1">
                <div
                  className={`h-full ${stats.statusColor} transition-all duration-1000`}
                  style={{ width: `${stats.efficiency}%` }}
                />
              </div>
            </div>
          )}
          <div className="bg-muted/50 rounded-full p-1.5">
            {isOpen ? (
              <ChevronUp className="text-muted-foreground h-5 w-5" />
            ) : (
              <ChevronDown className="text-muted-foreground h-5 w-5" />
            )}
          </div>
        </div>
      </Button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-4 duration-500">
          <div className="grid gap-4 md:grid-cols-3">
            {/* KPI #1: Efficiency */}
            <div
              className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all ${stats?.bgColor} ${stats?.borderColor}`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="text-primary h-5 w-5" />
                    <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      ชั่วโมงครบถ้วน
                    </span>
                  </div>
                  {stats && (
                    <div
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${stats.statusColor} text-white`}
                    >
                      {stats.statusText}
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">
                    {stats?.efficiency || 0}%
                  </span>
                  <span className="text-muted-foreground text-xs">
                    เป้าหมาย {'>'}90%
                  </span>
                </div>
                <div className="bg-muted/30 border-border/50 mt-2 h-2.5 w-full overflow-hidden rounded-full border">
                  <div
                    className={`h-full ${stats?.statusColor || 'bg-primary'} transition-all duration-1000`}
                    style={{ width: `${stats?.efficiency || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* KPI #2: Incomplete Days */}
            <div className="bg-card border-border/60 rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    ที่ทำงานไม่ครบ
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-orange-600">
                    {stats?.incompleteDays || 0}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ครั้ง/เดือน
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  รักษาความสม่ำเสมอเพื่อผลประเมินที่ดี
                </p>
              </div>
            </div>

            {/* KPI #3: Organizational Context */}
            <div className="bg-primary/5 border-primary/10 rounded-xl border p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    ภาพรวมองค์กร
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">
                      เป้าหมายบริษัท
                    </span>
                    <span className="text-sm font-bold">85%</span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full bg-blue-500 opacity-60"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New DAILY TREND CHART */}
          <div className="bg-card border-border/60 rounded-xl border p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">
                  Daily Hours Trend (เดือนนี้)
                </h4>
                <p className="text-muted-foreground text-xs">
                  แสดงชั่วโมงทำงานจริงในแต่ละวันที่มีการเช็คอิน
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{'>'}= 9 ชม.</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>{'<'} 9 ชม.</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    dx={-5}
                    domain={[0, 15]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    formatter={(value: number) => [`${value} ชม.`, 'เวลาทำงาน']}
                    labelFormatter={(label) => `วันที่ ${label}`}
                  />
                  <ReferenceLine
                    y={TARGET_HOURS}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{
                      position: 'right',
                      value: 'Goal',
                      fill: '#f97316',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#f05232"
                    strokeWidth={3}
                    dot={{
                      fill: '#f05232',
                      stroke: '#fff',
                      strokeWidth: 2,
                      r: 5,
                      fillOpacity: 1,
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#f05232',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
