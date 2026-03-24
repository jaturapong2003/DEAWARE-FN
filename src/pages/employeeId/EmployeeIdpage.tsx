import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeById from '@/hooks/useEmployeeById';
import useEmployeeAnalysis from '@/hooks/useEmployeeAnalysis';
import { useKeycloak } from '@react-keycloak/web';

import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getInitials } from '@/lib/helper';
import LoadingPage from '@/components/common/LoadingPage';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { exportAttendanceRecordsCSV } from '@/components/common/ExportData';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  CalendarDays,
  AlertTriangle,
  UserRoundCog,
  BarChart3,
} from 'lucide-react';
import DashboardId from './Dashboard_Id';

/**
 * หน้ารายละเอียดพนักงาน - แสดงโปรไฟล์และประวัติการเข้างาน
 */
function EmployeeIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultDateRange = () => ({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange()
  );

  // รับข้อมูลพนักงานจาก route state
  const stateEmployee = (location.state as { employee?: EmployeesList })
    ?.employee;

  // fetch Employee
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

  //  ปุ่มกลับ
  const handleGoBack = () => {
    navigate('/employees');
  };

  const handleExportAttendanceCsv = () => {
    if (!dashboardRecords || dashboardRecords.length === 0) {
      toast.error('ไม่มีข้อมูลการเข้างานสำหรับส่งออก');
      return;
    }

    exportAttendanceRecordsCSV(
      employee?.display_name || 'ไม่มีชื่อ',
      employee?.user_id || 'export',
      dashboardRecords
    );
  };

  const { keycloak } = useKeycloak();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteEmployeeMutation = useMutation({
    mutationFn: async () => {
      return (await fetchWithAuth<{ message?: string }>(
        `/api/employee/${employee?.user_id}`,
        {
          method: 'DELETE',
        }
      )) as { message?: string };
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'ลบพนักงานสำเร็จ');
      navigate('/employees');
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : 'ลบพนักงานไม่สำเร็จ โปรดลองอีกครั้ง';
      toast.error(msg);
    },
  });

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
        <div className="bg-card border-border dark:border-border rounded-xl border p-12 text-center shadow-sm">
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
    <div className="space-y-2">
      {/*  ปุ่มกลับ */}
      <Button variant={'link'} onClick={handleGoBack}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">กลับไปหน้ารายชื่อ</span>
      </Button>

      {/* Profile Card */}
      <div className="bg-card border-border dark:border-border overflow-hidden rounded-xl border shadow-sm">
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
            <div className="flex w-full items-center justify-between">
              <div className="flex-1 text-center sm:pb-2 sm:text-left">
                <h1 className="text-xl font-bold sm:text-2xl">
                  {employee.display_name || 'ไม่มีชื่อ'}
                </h1>
                <Badge variant="secondary" className="mt-1 gap-1">
                  <UserRoundCog className="h-3.5 w-3.5" />
                  {employee.position || 'พนักงาน'}
                </Badge>
              </div>
              <div className="relative flex items-center gap-2">
                {deleteEmployeeMutation.status === 'pending' && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                    <LoadingPage
                      message="กำลังลบพนักงาน..."
                      fullScreen={false}
                    />
                  </div>
                )}

                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={deleteEmployeeMutation.status === 'pending'}
                    >
                      ลบพนักงาน
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      คุณแน่ใจหรือไม่ว่าจะลบพนักงานคนนี้?
                      การกระทำนี้ไม่สามารถย้อนกลับได้
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteEmployeeMutation.mutate();
                        }}
                        disabled={deleteEmployeeMutation.status === 'pending'}
                      >
                        ยืนยันลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* <EmaillDialog employeeId={employee.user_id} /> */}
              </div>
            </div>
          </div>

          {/* ข้อมูลรายละเอียด */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* User ID */}
            <div className="group bg-muted/40 hover:bg-muted/70 flex cursor-default items-center gap-3 rounded-xl p-3 transition-colors duration-200">
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
            <div className="group bg-muted/40 hover:bg-muted/70 flex cursor-default items-center gap-3 rounded-xl p-3 transition-colors duration-200">
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
            <div className="group bg-muted/40 hover:bg-muted/70 flex cursor-default items-center gap-3 rounded-xl p-3 transition-colors duration-200">
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
            <div className="group bg-muted/40 hover:bg-muted/70 flex cursor-default items-center gap-3 rounded-xl p-3 transition-colors duration-200">
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
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart3 className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">หน้าสรุปผล</h2>
              <p className="text-muted-foreground text-xs">
                ภาพรวมการเข้างานของ {employee.display_name}
              </p>
            </div>
          </div>

          {/* 📅 เลือกช่วงวันที่ */}
          <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border/60 bg-background/50 hover:border-border hover:bg-accent/50 flex h-9.5 w-full cursor-pointer items-center justify-between gap-3 rounded-md pr-4 pl-2 backdrop-blur-sm transition-all duration-600 hover:shadow-inner sm:w-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex rounded-md p-2">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">
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
                  </div>
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
            <div>
              <Button
                variant={'outline'}
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
                className="mr-2"
              >
                ล้าง
              </Button>
              <Button
                variant="default"
                onClick={handleExportAttendanceCsv}
                disabled={!dashboardRecords || dashboardRecords.length === 0}
              >
                ส่งออก CSV
              </Button>
            </div>
          </div>
        </div>

        {/* 📊 แดชบอร์ด */}
        <div className="pt-2">
          <DashboardId
            employee={employee}
            records={dashboardRecords}
            total={total}
            analysis={analysis}
            onRangeChange={(start, end) =>
              setDateRange({
                from: start ?? dateRange?.from,
                to: end ?? dateRange?.to,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default EmployeeIdPage;
