import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeById from '@/hooks/useEmployeeById';
import useEmployeeAnalysis from '@/hooks/useEmployeeAnalysis';
import { useKeycloak } from '@react-keycloak/web';

import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/helper';
import LoadingPage from '@/components/common/LoadingPage';

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
} from 'lucide-react';
import DashboardId from './Dashboard_Id';

/**
 * หน้ารายละเอียดพนักงาน - แสดงโปรไฟล์และประวัติการเข้างาน
 */
function EmployeeIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

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

  // ดึงประวัติการเข้างานทั้งหมดในรอบปีสำหรับ Dashboard (จำกัด 400 รายการ)
  const { records: dashboardRecords, total } = useEmployeeAttendanceHistory(
    id,
    1,
    400,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  // ดึงข้อมูลวิเคราะห์จากฝั่ง Server
  const { analysis } = useEmployeeAnalysis(
    id,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  // 🔙 ปุ่มกลับ
  const handleGoBack = () => {
    navigate('/employees');
  };

  const { keycloak } = useKeycloak();

  // กำลังโหลดข้อมูลพนักงาน
  if (employeeLoading && keycloak.authenticated) {
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

      {/* === เลือกช่วงวัน + แดชบอร์ด === */}
      <div className="bg-card rounded-lg border">
        <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">ภาพรวมและประวัติการเข้างาน</h2>
            <p className="text-muted-foreground text-sm">
              แดชบอร์ดและรายการบันทึกการเข้า-ออกงาน
            </p>
          </div>

          {/* 📅 เลือกช่วงวันที่ */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-10 items-center gap-3 px-4"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm">
                    {dateRange?.from
                      ? dateRange.to
                        ? `${dateRange.from.toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                          })} - ${dateRange.to.toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : dateRange.from.toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                      : 'เลือกช่วงวันที่'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            {dateRange && (
              <button
                onClick={() =>
                  setDateRange({
                    from: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                    to: new Date(),
                  })
                }
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* 📊 แดชบอร์ด */}
        <div className="p-4">
          <DashboardId
            employee={employee}
            records={dashboardRecords}
            total={total}
            analysis={analysis}
          />
        </div>
      </div>
    </div>
  );
}

export default EmployeeIdPage;
