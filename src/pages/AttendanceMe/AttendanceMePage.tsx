import { useState, useMemo, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import toast from 'react-hot-toast';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { exportAttendanceRecordsCSV } from '@/components/common/ExportData';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarDays } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeAnalysis from '@/hooks/useEmployeeAnalysis';
import DashboardId from '../employeeId/Dashboard_Id';
import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';

function AttendanceMePage() {
  const { keycloak } = useKeycloak();
  const { profile, isLoading: profileLoading } = useProfile();

  const getDefaultDateRange = () => ({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange()
  );

  const { records: dashboardRecords, total } = useEmployeeAttendanceHistory(
    profile?.id,
    1,
    400,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  const { analysis } = useEmployeeAnalysis(
    profile?.id,
    dateRange?.from,
    dateRange?.to ?? dateRange?.from
  );

  const employeeDataForDashboard: EmployeesList = useMemo(
    () => ({
      user_id: profile?.id || '',
      display_name: profile?.display_name || profile?.user_name || 'ไม่มีชื่อ',
      email: profile?.email || '',
      phone_number: profile?.phone_number || '',
      position: profile?.position || 'พนักงาน',
      url_image: profile?.url_image || '',
    }),
    [
      profile?.id,
      profile?.display_name,
      profile?.user_name,
      profile?.email,
      profile?.phone_number,
      profile?.position,
      profile?.url_image,
    ]
  );

  // Memoize formatted date label to avoid recomputing on every render
  const dateLabel = useMemo(() => {
    if (!dateRange?.from) return 'เลือกช่วงวันที่';
    if (dateRange.to) {
      return `${dateRange.from.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
      })} - ${dateRange.to.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    }
    return dateRange.from.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [dateRange]);

  const handleClearRange = useCallback(() => {
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    });
  }, []);

  // Stable onRangeChange to pass into DashboardId — set explicit start/end to avoid closure issues
  const handleRangeChange = useCallback((start?: Date, end?: Date) => {
    setDateRange({ from: start, to: end });
  }, []);

  const handleExportAttendanceCsv = () => {
    if (!dashboardRecords || dashboardRecords.length === 0) {
      toast.error('ไม่มีข้อมูลการเข้างานสำหรับส่งออก');
      return;
    }

    exportAttendanceRecordsCSV(
      employeeDataForDashboard.display_name,
      dashboardRecords,
      dateRange?.from,
      dateRange?.to
    );
  };

  // Loading state — แสดง loading เฉพาะครั้งแรก (profile) ไม่ block เมื่อเปลี่ยน range
  if (!keycloak.authenticated) {
    return null;
  }

  if (profileLoading) {
    return <LoadingPage message="กำลังโหลดข้อมูลส่วนตัว..." fullScreen />;
  }

  if (!profile) {
    return <ErrorPage message="ไม่พบข้อมูลโปรไฟล์" />;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Section */}
      <div className="bg-card rounded-lg border">
        <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart3 className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">หน้าสรุปผล</h2>
              <p className="text-muted-foreground text-sm">
                ภาพรวมการเข้างานของ {employeeDataForDashboard.display_name}
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border/60 bg-background/50 hover:border-border hover:bg-accent/50 flex h-9.5 cursor-pointer items-center justify-between gap-3 rounded-md pr-4 pl-2 backdrop-blur-sm transition-all duration-600 hover:shadow-inner sm:w-auto"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm">{dateLabel}</span>
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
            <>
              {dateRange && (
                <Button
                  variant={'outline'}
                  onClick={handleClearRange}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ล้าง
                </Button>
              )}
              <Button
                variant="default"
                onClick={handleExportAttendanceCsv}
                disabled={!dashboardRecords || dashboardRecords.length === 0}
                className="text-sm"
              >
                ส่งออก CSV
              </Button>
            </>
          </div>
        </div>

        <div className="pt-2">
          {/* ไม่ส่ง analysis prop — DashboardId fetch เองตาม range ที่เลือก (เหมือน EmployeeIdPage) */}
          <DashboardId
            employee={employeeDataForDashboard}
            records={dashboardRecords}
            total={total}
            analysis={analysis}
            onRangeChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
}

export default AttendanceMePage;
