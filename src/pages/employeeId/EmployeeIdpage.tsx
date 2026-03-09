import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeById from '@/hooks/useEmployeeById';
import type { AttendanceRecord } from '@/@types/Attendance';
import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/helper';
import LoadingPage from '@/components/common/LoadingPage';
import PaginationControll from '@/components/filter/PaginationControll';
import AttendanceCard from '@/components/common/AttendanceCard';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  CalendarDays,
  AlertTriangle,
  UserRoundCog,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import DashboardId from './Dashboard_Id';

/**
 * หน้ารายละเอียดพนักงาน - แสดงโปรไฟล์และประวัติการเข้างาน
 */
function EmployeeIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'attendance' | 'dashboard'>(
    'attendance'
  );

  // รับข้อมูลพนักงานจาก route state (ส่งมาจาก EmployeesPage)
  const stateEmployee = (location.state as { employee?: EmployeesList })
    ?.employee;

  // ใช้ hook เพื่อ fetch ข้อมูลจาก API ถ้าไม่มี location.state (เช่น refresh หน้า)
  const { employee, loading: employeeLoading } = useEmployeeById(
    id,
    stateEmployee
  );

  // เช็คว่ารูปโปรไฟล์โหลดได้ไหม (ไม่ error ใน console)
  const [imgReady, setImgReady] = useState(false);
  useEffect(() => {
    if (!employee?.url_image) return;
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(false);
    img.src = employee.url_image;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [employee?.url_image]);

  // ดึงประวัติการเข้างานจาก API พร้อมส่ง start_date, end_date (สำหรับการแสดงในลิสต์แบบแบ่งหน้า)
  const {
    records,
    total,
    totalPages,
    loading: isLoading,
    error,
  } = useEmployeeAttendanceHistory(
    id,
    page,
    limit,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  // ดึงประวัติการเข้างานทั้งหมดในรอบปีสำหรับ Dashboard (จำกัด 400 รายการ)
  const { records: dashboardRecords } = useEmployeeAttendanceHistory(
    id,
    1,
    400,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  const data = {
    records,
    page,
    limit,
    total,
    total_pages: totalPages,
  };

  // 🔙 ปุ่มกลับ
  const handleGoBack = () => {
    navigate('/employees');
  };

  // กำลังโหลดข้อมูลพนักงาน
  if (employeeLoading) {
    return <LoadingPage message="กำลังโหลดข้อมูลพนักงาน..." />;
  }

  // ถ้าไม่มีข้อมูลพนักงาน (ไม่พบใน API)
  if (!employee) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleGoBack}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">กลับไปหน้ารายชื่อ</span>
        </button>
        <div className="bg-card rounded-lg border p-12 text-center">
          <AlertTriangle className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลพนักงาน</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            กรุณาเลือกพนักงานจากหน้ารายชื่อ
          </p>
          <button
            onClick={handleGoBack}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 rounded-md px-6 py-2 text-sm font-medium transition-colors"
          >
            ไปหน้ารายชื่อพนักงาน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔙 ปุ่มกลับ */}
      <button
        onClick={handleGoBack}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">กลับไปหน้ารายชื่อ</span>
      </button>

      {/* 👤 Profile Card */}
      <div className="bg-card overflow-hidden rounded-lg border">
        {/* Header gradient */}
        <div className="from-primary/20 to-primary/5 h-24 bg-linear-to-r sm:h-32" />

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <Avatar className="border-background h-24 w-24 border-4 shadow-lg sm:h-32 sm:w-32">
              {imgReady && employee.url_image && (
                <AvatarImage
                  src={employee.url_image}
                  alt={employee.display_name}
                />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                {getInitials(employee.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="text-xl font-bold sm:text-2xl">
                {employee.display_name || 'ไม่มีชื่อ'}
              </h1>
              <Badge variant="secondary" className="mt-1 gap-1">
                <UserRoundCog className="h-3.5 w-3.5" />
                {employee.position || 'พนักงาน'}
              </Badge>
            </div>
          </div>

          {/* ข้อมูลรายละเอียด */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* User ID */}
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
              <div className="bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110">
                <User className="text-primary/60 group-hover:text-primary h-5 w-5 transition-colors duration-200" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">User ID</p>
                <p
                  className="truncate text-sm font-medium"
                  title={employee.user_id}
                >
                  {employee.user_id}
                </p>
              </div>
            </div>

            {/* อีเมล */}
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
              <div className="bg-chart-2/10 group-hover:bg-chart-2/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110">
                <Mail className="text-chart-2/60 group-hover:text-chart-2 h-5 w-5 transition-colors duration-200" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">อีเมล</p>
                <p
                  className="truncate text-sm font-medium"
                  title={employee.email}
                >
                  {employee.email}
                </p>
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
              <div className="bg-chart-4/10 group-hover:bg-chart-4/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110">
                <Phone className="text-chart-4/60 group-hover:text-chart-4 h-5 w-5 transition-colors duration-200" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">เบอร์โทร</p>
                <p
                  className="truncate text-sm font-medium"
                  title={employee.phone_number || '-'}
                >
                  {employee.phone_number || '-'}
                </p>
              </div>
            </div>

            {/* ตำแหน่ง */}
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
              <div className="bg-chart-5/10 group-hover:bg-chart-5/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110">
                <UserRoundCog className="text-chart-5/60 group-hover:text-chart-5 h-5 w-5 transition-colors duration-200" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">ตำแหน่ง</p>
                <p
                  className="truncate text-sm font-medium"
                  title={employee.position || '-'}
                >
                  {employee.position || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Header: Tab สลับ + เลือกช่วงวัน === */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tab Buttons */}
          <div className="bg-muted flex rounded-lg p-1">
            <Button
              variant={activeTab === 'attendance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('attendance')}
              className={`gap-2 text-xs ${activeTab === 'attendance' ? '' : 'hover:bg-background'}`}
            >
              <ClipboardList className="h-4 w-4" />
              ประวัติการเข้างาน
            </Button>
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className={`gap-2 text-xs ${activeTab === 'dashboard' ? '' : 'hover:bg-background'}`}
            >
              <BarChart3 className="h-4 w-4" />
              แดชบอร์ด
            </Button>
          </div>

          {/* 📅 เลือกช่วงวันที่ */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span>
                        {dateRange.from.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {' - '}
                        {dateRange.to.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span>
                        {dateRange.from.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )
                  ) : (
                    <span>เลือกช่วงวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                {/* สร้าง modifiers สำหรับวันที่มีข้อมูล */}
                {(() => {
                  const datesWithData: Date[] = [];
                  const dateStrings = new Set<string>();

                  records.forEach((r) => {
                    if (r.check_in) {
                      const date = new Date(r.check_in);
                      datesWithData.push(date);
                      // เก็บ format YYYY-MM-DD เพื่อใช้ใน CSS
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        '0'
                      );
                      const day = String(date.getDate()).padStart(2, '0');
                      dateStrings.add(`${year}-${month}-${day}`);
                    }
                  });

                  return (
                    <>
                      <style>{`
                        [data-slot="popover-content"] [data-day] {
                          --day-date: attr(data-day);
                        }
                        ${Array.from(dateStrings)
                          .map(
                            (dateStr) =>
                              `[data-day="${dateStr}"] {
                                background-color: #dcfce7 !important;
                                border: 2px solid #22c55e !important;
                                border-radius: 6px !important;
                                font-weight: 600 !important;
                                color: #166534 !important;
                              }
                              @media (prefers-color-scheme: dark) {
                                [data-day="${dateStr}"] {
                                  background-color: #064e3b !important;
                                  border: 2px solid #10b981 !important;
                                  color: #86efac !important;
                                }
                              }`
                          )
                          .join('\n')}
                      `}</style>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          setPage(1);
                        }}
                        captionLayout="dropdown"
                      />
                    </>
                  );
                })()}
              </PopoverContent>
            </Popover>
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange(undefined);
                  setPage(1);
                }}
                className="text-muted-foreground h-8 px-2 text-xs"
              >
                ล้าง
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* === เนื้อหาสลับตาม Tab === */}

      {activeTab === 'dashboard' ? (
        /* 📊 แดชบอร์ด */
        <DashboardId
          employee={employee}
          records={dashboardRecords}
          total={total}
        />
      ) : (
        /* 📋 ประวัติการเข้างาน */
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-card bg-primary/5 rounded-lg border p-4">
              <div className="text-muted-foreground mb-1 text-sm">
                บันทึกทั้งหมด
              </div>
              <div className="text-2xl font-bold">{data.total} ครั้ง</div>
            </div>
            <div className="bg-card rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
              <div className="text-muted-foreground mb-1 text-sm">
                กำลังทำงาน
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.records.filter((r) => !r.check_out).length} ครั้ง
              </div>
            </div>
            <div className="bg-card rounded-lg border bg-orange-50 p-4 dark:bg-orange-950/20">
              <div className="text-muted-foreground mb-1 text-sm">
                สิ้นสุดแล้ว
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.records.filter((r) => !!r.check_out).length} ครั้ง
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          {isLoading ? (
            <LoadingPage
              message="กำลังโหลดประวัติการเข้างาน..."
              fullScreen={false}
            />
          ) : error ? (
            <div className="bg-card rounded-lg border p-8 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-orange-500" />
              <h3 className="mt-4 text-lg font-semibold">
                ไม่สามารถโหลดประวัติการเข้างานได้
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                อาจยังไม่มีข้อมูลประวัติสำหรับพนักงานคนนี้
              </p>
            </div>
          ) : data && data.records.length > 0 ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {data.records.map((record: AttendanceRecord) => (
                  <AttendanceCard key={record.id} record={record} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center">
                <PaginationControll
                  page={page}
                  totalPages={data.total_pages}
                  limit={limit}
                  onPageChange={(p) => setPage(p)}
                  onLimitChange={(l) => {
                    setLimit(l);
                    setPage(1);
                  }}
                />
              </div>
            </>
          ) : (
            <div className="bg-card rounded-lg border p-8 text-center">
              <CalendarDays className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">
                ไม่มีประวัติการเข้างาน
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                ยังไม่มีข้อมูลการเข้า-ออกงานของพนักงานคนนี้
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployeeIdPage;
