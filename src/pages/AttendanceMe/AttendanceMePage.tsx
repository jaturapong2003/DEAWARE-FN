import { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeAnalysis from '@/hooks/useEmployeeAnalysis';
import DashboardId from '../employeeId/Dashboard_Id';
import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';

/**
 * หน้าประวัติส่วนตัว - ใช้รูปแบบ Dashboard เหมือนหน้า EmployeeIdPage
 */
function AttendanceMePage() {
  const { keycloak } = useKeycloak();
  const { profile, isLoading: profileLoading } = useProfile();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  // ดึงประวัติการเข้างาน (จำกัด 400 รายการสำหรับ Dashboard)
  const {
    records: dashboardRecords,
    total,
    loading: historyLoading,
  } = useEmployeeAttendanceHistory(
    profile?.id,
    1,
    400,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  // ดึงข้อมูลวิเคราะห์
  const { analysis, loading: analysisLoading } = useEmployeeAnalysis(
    profile?.id,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  // Loading state
  if (!keycloak.authenticated) {
    return null;
  }

  const isLoading =
    profileLoading ||
    (historyLoading && keycloak.authenticated) ||
    (analysisLoading && keycloak.authenticated);
  if (isLoading && keycloak.authenticated) {
    return <LoadingPage message="กำลังโหลดข้อมูลส่วนตัว..." />;
  }

  if (!profile) {
    return <ErrorPage message="ไม่พบข้อมูลโปรไฟล์" />;
  }

  // แปลง profile เป็น EmployeesList ชั่วคราวสำหรับ DashboardId
  const employeeDataForDashboard: EmployeesList = {
    user_id: profile.id || '',
    display_name: profile.display_name || profile.user_name || 'ไม่มีชื่อ',
    email: profile.email || '',
    phone_number: profile.phone_number || '',
    position: profile.position || 'พนักงาน',
    url_image: profile.url_image || '',
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-2">
          <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            <div className="h-8 w-1.5 rounded-full bg-primary/80" />
            ภาพรวมการทำงาน
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 pl-4 sm:pl-5">
            ติดตามประวัติและสถิติการเข้า-ออกงานของคุณอย่างละเอียดในแต่ละช่วงเวลา
          </p>
        </div>

        {/* 📅 Date Picker */}
        <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-border/60 bg-background/50 hover:border-border hover:bg-accent/50 flex h-12 w-full items-center justify-between gap-3 rounded-xl px-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md sm:w-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex rounded-xl p-2">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <span className="text-[15px] font-semibold tracking-wide">
                    {dateRange?.from
                      ? dateRange.to
                        ? `${dateRange.from.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${dateRange.to.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : dateRange.from.toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                      : 'เลือกช่วงเวลา'}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
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
              className="text-muted-foreground hover:text-foreground px-2 text-sm font-semibold transition-colors"
            >
              รีเซ็ตเวลา
            </button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <DashboardId
          employee={employeeDataForDashboard}
          records={dashboardRecords}
          total={total}
          analysis={analysis}
        />
      </div>
    </div>
  );
}

export default AttendanceMePage;
