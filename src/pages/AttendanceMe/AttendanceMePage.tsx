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
    <div className="space-y-6">
      {/* 📊 Dashboard Section */}
      <div className="bg-card rounded-lg border">
        <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">ภาพรวมการทำงานของคุณ</h2>
            <p className="text-muted-foreground text-sm">
              แดชบอร์ดวิเคราะห์ประวัติการเข้า-ออกงาน
            </p>
          </div>

          {/* 📅 Date Picker */}
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
                        ? `${dateRange.from.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${dateRange.to.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
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
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <DashboardId
            employee={employeeDataForDashboard}
            records={dashboardRecords}
            total={total}
            analysis={analysis}
          />
        </div>
      </div>
    </div>
  );
}

export default AttendanceMePage;
