import React from 'react';
import { useAttendanceHistory } from '@/hooks/useAttendanceHistory';
import type { AttendanceRecord } from '@/hooks/useAttendanceHistory';
import {
  Loader2,
  RefreshCw,
  Clock,
  LogIn,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * หน้าแสดงประวัติการเข้างานทั้งหมด
 */
const HistoryPage: React.FC = () => {
  const { records, total, loading, error, refetch, isRefetching } =
    useAttendanceHistory();

  // แปลง ISO เป็นวันที่ภาษาไทย
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // แปลง ISO เป็นเวลา HH:mm
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // แสดง Loading
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin sm:h-8 sm:w-8" />
        <span className="ml-2 text-sm sm:text-base">กำลังโหลดประวัติ...</span>
      </div>
    );
  }

  // แสดง Error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 sm:p-6">
          <p className="text-sm sm:text-base">❌ {error}</p>
        </div>
        <div className="text-center">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            <div className="h-8 w-1.5 rounded-full bg-primary/80" />
            ประวัติการเข้างาน
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 pl-4 sm:pl-5">
            ทั้งหมด {total} รายการ
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-border/60 bg-background/50 px-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-accent/50 hover:shadow-md"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          <span className="font-semibold">รีเฟรช</span>
        </Button>
      </div>

      {/* รายการประวัติ */}
      {records.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm dark:border-border sm:p-12">
          <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm sm:text-base">
            ยังไม่มีประวัติการเข้างาน
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record: AttendanceRecord) => (
            <div
              key={record.id}
              className="bg-card rounded-xl border border-border p-4 shadow-sm transition-all hover:shadow-md dark:border-border sm:p-5"
            >
              {/* วันที่ */}
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-2 dark:border-border">
                <Clock className="text-primary h-4 w-4" />
                <span className="text-sm font-semibold sm:text-base">
                  {formatDate(record.check_in)}
                </span>
              </div>

              {/* เวลาเข้า-ออก */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {/* เข้างาน */}
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <LogIn className="h-3 w-3 text-green-600" />
                    <span>เข้างาน</span>
                  </div>
                  <p className="text-lg font-bold text-green-600 sm:text-xl">
                    {formatTime(record.check_in)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {record.check_in_device || '-'}
                  </p>
                </div>

                {/* ออกงาน */}
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <LogOut className="h-3 w-3 text-red-600" />
                    <span>ออกงาน</span>
                  </div>
                  <p className="text-lg font-bold text-red-600 sm:text-xl">
                    {formatTime(record.check_out)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {record.check_out_device || '-'}
                  </p>
                </div>

                {/* ชั่วโมงทำงาน */}
                <div className="col-span-2 space-y-1 sm:col-span-1">
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Briefcase className="h-3 w-3 text-blue-600" />
                    <span>ชั่วโมงทำงาน</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600 sm:text-xl">
                    {record.work_hours || '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
