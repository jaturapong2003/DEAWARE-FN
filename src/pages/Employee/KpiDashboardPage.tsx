import { useState } from 'react';
import {
  Timer,
  AlertCircle,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

/**
 * KPI Dashboard Page - ปรับปรุงข้อมูลเปรียบเทียบย้อนหลังและภาพรวมบริษัท
 */
export default function KpiDashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState('1M');

  // --- DATA STATES ---
  const mockHistoricalTrend: {
    month: string;
    punctuality: number;
    lateRate: number;
  }[] = [];

  const currentData = {
    stats: {
      efficiency: 0,
      complete: 0,
      late: 0,
      companyRate: 0,
      improvement: 0,
    },
  };

  const top3ComparisonData: any[] = [];

  const companyStats = {
    punctualityRate: 0,
    improvement: 0,
    totalEmployees: 0,
    target: 90,
  };

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
            <h1 className="decoration-primary/30 text-3xl font-black tracking-tight underline decoration-4 underline-offset-8">
              รายงานวิเคราะห์ประสิทธิภาพ
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="text-primary h-4 w-4" />
              สรุปข้อมูลภาพรวมตามช่วงวันที่เลือก
            </p>
          </div>
        </div>

        {/* Range Filter Buttons */}
        <div className="bg-muted/50 flex items-center gap-1 rounded-2xl border p-1.5 shadow-inner">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                range === opt.value
                  ? 'text-primary ring-border bg-white shadow-sm ring-1 shadow-black/5'
                  : 'text-muted-foreground hover:bg-white/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section: Company Wide KPI Summary */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 text-white shadow-2xl ring-1 ring-white/10">
        <div className="bg-primary/20 absolute top-0 right-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-12 translate-y-24 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
                <Building2 className="text-primary h-7 w-7" />
              </div>
              <span className="text-xs font-black tracking-[0.2em] text-white/50 uppercase">
                Company Performance Index
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter lg:text-6xl">
              Company Wide <br />
              <span className="text-primary text-5xl lg:text-7xl">
                Punctuality Rate
              </span>
            </h2>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/20 px-4 py-2 text-sm font-bold text-green-400">
                <TrendingUp className="h-4 w-4" />
                พัฒนาขึ้น {companyStats.improvement}%
              </div>
              <p className="text-sm font-medium text-white/40 italic">
                เทียบรอบก่อนหน้า
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white/5 p-10 text-center ring-1 ring-white/10 backdrop-blur-md">
            <span className="text-7xl font-black text-white">
              {companyStats.punctualityRate}
              <span className="ml-1 text-2xl text-white/40">%</span>
            </span>
            <span className="mt-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
              Efficiency Index
            </span>
            <div className="mt-8 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-primary h-full shadow-[0_0_20px_#f05232] transition-all duration-1000"
                style={{ width: `${companyStats.punctualityRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition-colors hover:bg-white/10">
              <p className="text-primary mb-3 text-xs font-black tracking-widest uppercase">
                สูตรคำนวณ KPI ภาพรวม
              </p>
              <p className="text-[11px] leading-relaxed text-white/70">
                <span className="font-bold text-white">
                  (Σ วันที่พนักงานทำงานครบ 9 ชม.)
                </span>{' '}
                <br />
                <div className="my-1 h-px w-full bg-white/20" />
                <span className="text-white/40">
                  (จำนวนวันที่พนักงานต้องมาทำงานรวมทั้งองค์กร)
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 px-2">
              <div className="bg-primary/20 rounded-full p-2">
                <Trophy className="text-primary h-5 w-5" />
              </div>
              <p className="text-xs font-bold tracking-tight text-white/70">
                เป้าหมายประจำปี 2026: {companyStats.target}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Historical Trend Area Chart */}
        <div className="bg-card border-border/60 flex flex-col rounded-[2.5rem] border p-10 shadow-lg transition-all hover:shadow-xl lg:col-span-3">
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight italic">
                Capability Development Trend
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                วิเคราะห์แนวโน้ม: ระบบนี้ช่วยยกระดับความสม่ำเสมอได้อย่างไร?
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-black text-green-600 dark:bg-green-950/40">
              +10.4% Overall Growth
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockHistoricalTrend}
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
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#cbd5e1' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    padding: '16px',
                  }}
                  cursor={{
                    stroke: '#f05232',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="punctuality"
                  name="อัตราการเข้างานมาตรฐาน"
                  stroke="#f05232"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorPunctuality)"
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8 border-t pt-8">
            <div className="space-y-2">
              <p className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                Historical Insight
              </p>
              <p className="decoration-primary/20 text-sm leading-snug font-black text-slate-800 underline dark:text-slate-200">
                -
              </p>
            </div>
            <div className="space-y-2 border-l pl-8">
              <p className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                Seasonal Pattern
              </p>
              <p className="text-sm leading-snug font-bold text-orange-600 italic">
                ช่วงเดือน ธ.ค. (เทศกาล) มักพบปัญหาการรักษาเวลามากที่สุด
                ควรเพิ่มการกระตุ้นทีม
              </p>
            </div>
          </div>
        </div>

        {/* Mini Cards with Trends */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="bg-card border-border/60 hover:border-primary/50 group flex flex-1 flex-col justify-center rounded-[2.5rem] border p-10 shadow-md transition-all">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-primary/10 group-hover:bg-primary/20 rounded-2xl p-3 transition-colors">
                <Timer className="text-primary h-6 w-6" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-500 uppercase dark:bg-green-950/20">
                <TrendingUp className="h-3 w-3" />
                0% VS PREV
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">
              {range === '1W'
                ? 'วินัยรายสัปดาห์'
                : range === '1M'
                  ? 'ประสิทธิภาพรายเดือน'
                  : 'ภาพรวมผลงานสะสม'}
            </p>
            <h4 className="mt-1 text-5xl font-black tracking-tighter">
              {currentData.stats.efficiency}
              <span className="text-muted-foreground/30 ml-1 text-2xl">%</span>
            </h4>
          </div>

          <div className="bg-card border-border/60 group flex flex-1 flex-col justify-center rounded-[2.5rem] border p-10 shadow-md transition-all hover:border-green-500/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-green-50 p-3 transition-colors group-hover:bg-green-100 dark:bg-green-950/40">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-500 uppercase dark:bg-green-950/20">
                <TrendingUp className="h-3 w-3" />
                {range === '1W' ? 'Excellent' : 'On Track'}
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">
              มาตรฐานความสม่ำเสมอ
            </p>
            <h4 className="mt-1 text-5xl font-black tracking-tighter text-green-600">
              {currentData.stats.complete}
              <span className="ml-1 text-2xl text-green-600/30">d</span>
            </h4>
          </div>

          <div className="bg-card border-border/60 group flex flex-1 flex-col justify-center rounded-[2.5rem] border p-10 shadow-md transition-all hover:border-orange-500/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-orange-50 p-3 transition-colors group-hover:bg-orange-100 dark:bg-orange-950/40">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-500 uppercase dark:bg-red-950/20">
                <TrendingDown className="h-3 w-3" />
                {currentData.stats.late > 5 ? 'Need Focus' : 'Stable'}
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">
              การเข้างานล่าช้า
            </p>
            <h4 className="mt-1 text-5xl font-black tracking-tighter text-orange-600">
              {currentData.stats.late}
              <span className="ml-1 text-2xl text-orange-600/30">x</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Main Staff Comparison Chart */}
      <div className="bg-card border-border/60 overflow-hidden rounded-[3rem] border p-12 shadow-xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-primary/10 rounded-[1.5rem] p-5">
              <BarChart3 className="text-primary h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight italic">
                Staff Benchmarking
              </h2>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                การเปรียบเทียบมาตรฐานการรักษาเวลาเพื่อส่งเสริมวัฒนธรรมความรับผิดชอบร่วมกัน
              </p>
            </div>
          </div>
          <div className="bg-primary/5 ring-primary/20 rounded-2xl px-8 py-4 ring-1 backdrop-blur-sm">
            <p className="text-primary text-xs font-black tracking-[0.2em] uppercase">
              🏆 ผู้นำความรับผิดชอบ: -
            </p>
          </div>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top3ComparisonData}
              margin={{ top: 20, right: 10, left: -20, bottom: 40 }}
              barGap={15}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: '900' }}
                dy={15}
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: 'rgba(240, 82, 50, 0.03)', radius: 12 }}
                contentStyle={{
                  borderRadius: '28px',
                  border: 'none',
                  boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                  fontSize: '13px',
                  fontWeight: '900',
                  padding: '24px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '40px', fontWeight: 'bold' }}
              />
              <Bar
                dataKey="complete"
                name="ครบมาตรฐาน (9 ชม.)"
                fill="#22c55e"
                radius={[10, 10, 0, 0]}
                barSize={34}
              />
              <Bar
                dataKey="partial"
                name="ไม่ครบมาตรฐาน"
                fill="#f97316"
                radius={[10, 10, 0, 0]}
                barSize={34}
              />
              <Bar
                dataKey="absent"
                name="ไม่พบข้อมูล/ขาด"
                fill="#ef4444"
                radius={[10, 10, 0, 0]}
                barSize={34}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
