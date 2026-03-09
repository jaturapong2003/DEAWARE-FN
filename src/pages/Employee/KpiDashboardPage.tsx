import { useState } from 'react';
import {
  Timer,
  AlertCircle,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

/**
 * KPI Dashboard Page - ปรับปรุงข้อมูลเปรียบเทียบย้อนหลังและภาพรวมบริษัท
 */
export default function KpiDashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState('1M');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 5 }, (_, i) =>
    (startYear + i).toString()
  );

  // --- MOCK DATA LOGIC ---
  const getMockData = (currentRange: string) => {
    const dataMap: Record<string, any> = {
      '1M': {
        summary: {
          overall_efficiency: 81,
          growth_rate: 10.4,
          is_growth_up: true,
          side_metrics: {
            monthly_efficiency: 78,
            consistency_days: 22,
            late_entry_count: 5,
          },
        },
        line_chart: [
          { label: '01 มี.ค.', value: 75 },
          { label: '05 มี.ค.', value: 78 },
          { label: '10 มี.ค.', value: 81 },
          { label: '15 มี.ค.', value: 80 },
          { label: '20 มี.ค.', value: 83 },
          { label: '25 มี.ค.', value: 81 },
          { label: '31 มี.ค.', value: 81 },
        ],
      },
      '3M': {
        summary: {
          overall_efficiency: 84,
          growth_rate: 15.2,
          is_growth_up: true,
          side_metrics: {
            monthly_efficiency: 82,
            consistency_days: 64,
            late_entry_count: 12,
          },
        },
        line_chart: [
          { label: 'ม.ค.', value: 75 },
          { label: 'ก.พ.', value: 84 },
          { label: 'มี.ค.', value: 85 },
        ],
      },
      '6M': {
        summary: {
          overall_efficiency: 82,
          growth_rate: 5.8,
          is_growth_up: true,
          side_metrics: {
            monthly_efficiency: 80,
            consistency_days: 120,
            late_entry_count: 24,
          },
        },
        line_chart: [
          { label: 'ต.ค.', value: 70 },
          { label: 'พ.ย.', value: 72 },
          { label: 'ธ.ค.', value: 68 },
          { label: 'ม.ค.', value: 75 },
          { label: 'ก.พ.', value: 82 },
          { label: 'มี.ค.', value: 84 },
        ],
      },
      '1Y': {
        summary: {
          overall_efficiency: 79,
          growth_rate: 2.1,
          is_growth_up: false,
          side_metrics: {
            monthly_efficiency: 75,
            consistency_days: 240,
            late_entry_count: 52,
          },
        },
        line_chart: [
          { label: 'ม.ค.', value: 75 },
          { label: 'เม.ย.', value: 80 },
          { label: 'ก.ค.', value: 82 },
          { label: 'ต.ค.', value: 70 },
          { label: 'ธ.ค.', value: 79 },
        ],
      },
    };
    return dataMap[currentRange] || dataMap['1M'];
  };

  const currentMockData = getMockData(range);

  const filterOptions = [
    { label: '1 ด', value: '1M' },
    { label: '3 ด', value: '3M' },
    { label: '6 ด', value: '6M' },
    { label: '1 ปี', value: '1Y' },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-10 p-6 pb-20">
      {/* Header section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employees')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              รายงานวิเคราะห์ประสิทธิภาพ
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <TrendingUp className="text-primary h-4 w-4" />
              สรุปข้อมูลภาพรวมตามช่วงวันที่เลือก
            </p>
          </div>
        </div>

        {/* Range & Year Filter */}
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] rounded-xl border p-2 font-semibold shadow-sm transition-all focus:ring-0">
              <SelectValue placeholder="เลือกปี" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  ปี {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-muted/50 flex items-center gap-1 rounded-xl border p-1 shadow-inner">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  range === opt.value
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-background/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section: Company Wide KPI Summary */}
      <div className="bg-card relative overflow-hidden rounded-2xl border p-8 shadow-sm sm:p-12">
        <div className="from-primary/5 to-accent/5 absolute inset-0 bg-linear-to-br" />

        <div className="relative z-10 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 rounded-xl p-3">
                <Building2 className="text-primary h-6 w-6" />
              </div>
              <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Company Performance Index
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Company Wide <br />
              <span className="text-primary">Punctuality Rate</span>
            </h2>
            <div className="mt-8 flex items-center gap-6">
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${
                  currentMockData.summary.is_growth_up
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }`}
              >
                {currentMockData.summary.is_growth_up ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {currentMockData.summary.is_growth_up ? 'พัฒนาขึ้น' : 'ลดลง'}{' '}
                {currentMockData.summary.growth_rate}%
              </div>
              <p className="text-muted-foreground text-sm font-medium italic">
                เทียบรอบก่อนหน้า
              </p>
            </div>
          </div>

          <div className="bg-background/60 flex flex-col items-center justify-center rounded-2xl border p-8 text-center backdrop-blur-sm">
            <span className="text-foreground text-6xl font-black">
              {currentMockData.summary.overall_efficiency}
              <span className="text-muted-foreground/40 ml-1 text-2xl">%</span>
            </span>
            <span className="text-muted-foreground mt-2 text-xs font-bold tracking-widest uppercase">
              Efficiency Index
            </span>
            <div className="bg-muted mt-8 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-1000"
                style={{
                  width: `${currentMockData.summary.overall_efficiency}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-background/40 rounded-2xl border p-5">
              <p className="text-primary mb-2 text-xs font-bold tracking-wider uppercase">
                สูตรคำนวณ KPI ภาพรวม
              </p>
              <div className="text-foreground/80 text-[11px] leading-relaxed">
                <p className="font-semibold">(Σ วันที่พนักงานทำงานครบ 9 ชม.)</p>
                <div className="bg-border my-1.5 h-px w-full" />
                <p className="text-muted-foreground">
                  (จำนวนวันที่พนักงานต้องมาทำงานรวมทั้งองค์กร)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Trophy className="text-primary h-5 w-5" />
              <p className="text-muted-foreground text-xs font-bold">
                เป้าหมายประจำปี {selectedYear}: 90%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Historical Trend Area Chart */}
        <div className="bg-card flex flex-col rounded-2xl border p-8 shadow-sm lg:col-span-3">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Capability Development Trend
              </h3>
              <p className="text-muted-foreground text-sm">
                วิเคราะห์แนวโน้ม: ระบบนี้ช่วยยกระดับความสม่ำเสมอได้อย่างไร?
              </p>
            </div>
            <div className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">
              +{currentMockData.summary.growth_rate}% Overall Growth
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentMockData.line_chart}
                margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorPunctuality"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f05232" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f05232" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: '500' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="ประสิทธิภาพ"
                  stroke="#f05232"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPunctuality)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8 border-t pt-8">
            <div className="space-y-2">
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Historical Insight
              </p>
              <p className="text-foreground text-sm font-semibold">
                ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์เชิงลึก
              </p>
            </div>
            <div className="space-y-2 border-l pl-8">
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Seasonal Pattern
              </p>
              <p className="text-sm font-medium text-orange-600 italic">
                ช่วงเดือน ธ.ค. (เทศกาล) มักพบปัญหาการรักษาเวลามากที่สุด
              </p>
            </div>
          </div>
        </div>

        {/* Mini Cards with Trends */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="bg-card group hover:border-primary/50 flex flex-1 flex-col justify-center rounded-2xl border p-8 shadow-sm transition-all">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-primary/10 rounded-xl p-3 transition-colors">
                <Timer className="text-primary h-6 w-6" />
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                  currentMockData.summary.is_growth_up
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }`}
              >
                {currentMockData.summary.is_growth_up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {currentMockData.summary.growth_rate}% VS PREV
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              ประสิทธิภาพรายเดือน
            </p>
            <h4 className="mt-1 text-4xl font-bold tracking-tight">
              {currentMockData.summary.side_metrics.monthly_efficiency}
              <span className="text-muted-foreground/30 ml-1 text-2xl">%</span>
            </h4>
          </div>

          <div className="bg-card group flex flex-1 flex-col justify-center rounded-2xl border p-8 shadow-sm transition-all hover:border-green-500/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950/40">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-700 uppercase dark:bg-green-950/40 dark:text-green-400">
                On Track
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              มาตรฐานความสม่ำเสมอ
            </p>
            <h4 className="mt-1 text-4xl font-bold tracking-tight text-green-600">
              {currentMockData.summary.side_metrics.consistency_days}
              <span className="ml-1 text-2xl text-green-600/30">d</span>
            </h4>
          </div>

          <div className="bg-card group flex flex-1 flex-col justify-center rounded-2xl border p-8 shadow-sm transition-all hover:border-orange-500/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-orange-50 p-3 dark:bg-orange-950/40">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold text-orange-700 uppercase dark:bg-orange-950/40 dark:text-orange-400">
                {currentMockData.summary.side_metrics.late_entry_count > 5
                  ? 'Need Focus'
                  : 'Stable'}
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              การเข้างานล่าช้า
            </p>
            <h4 className="mt-1 text-4xl font-bold tracking-tight text-orange-600">
              {currentMockData.summary.side_metrics.late_entry_count}
              <span className="ml-1 text-2xl text-orange-600/30">x</span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
