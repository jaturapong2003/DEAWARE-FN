import { useState } from 'react';
import type { AttendanceResponse, AttendanceRecord } from '@/@types/Attendance';
import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import keycloak from '@/config/keycloak';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import PaginationControll from '@/components/filter/PaginationControll';
import AttendanceCard from '../../components/common/AttendanceCard';
import { formatDateToISO } from '@/lib/date';

// Main AttendanceMePage
function AttendanceMePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const { data, isLoading, error } = useQuery<AttendanceResponse>({
    queryKey: ['history/me', page, limit, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (dateRange?.from) {
        params.append('start_date', formatDateToISO(dateRange.from));
      }
      if (dateRange?.to) {
        params.append('end_date', formatDateToISO(dateRange.to));
      }

      return fetchWithAuth<AttendanceResponse>(
        `/api/attendance/me?${params.toString()}`
      );
    },
    enabled: keycloak.authenticated,
  });

  if (error) return <ErrorPage />;
  if (isLoading) return <LoadingPage message="กำลังโหลดประวัติของคุณ..." />;

  // stats
  const totalRecords = data?.total ?? 0;
  const activeRecords = (data?.records || []).filter(
    (r: { check_out: string | null }) => !r.check_out
  ).length;
  const completedRecords = (data?.records || []).filter(
    (r: { check_out: string | null }) => !!r.check_out
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">ประวัติการเข้า-ออกงาน</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                รายการบันทึกของคุณทั้งหมด
              </p>
            </div>

            {/* ช่องเลือกช่วงวันที่ (popover) */}
            <div className="relative w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-center">
                    <span>
                      {dateRange?.from
                        ? dateRange.to
                          ? `${dateRange.from.toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })} - ${dateRange.to.toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}`
                          : `${dateRange.from.toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}`
                        : 'เลือกช่วงวันที่'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1">
                  <DatePicker
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    // disabled={(date: Date) =>
                    //   date > new Date() || date < new Date('1900-01-01')
                    // }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="text-muted-foreground mb-1 text-sm">
                บันทึกทั้งหมด
              </div>
              <div className="text-2xl font-bold">{totalRecords} ครั้ง</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
              <div className="text-muted-foreground mb-1 text-sm">
                กำลังทำงาน
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeRecords} ครั้ง
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
              <div className="text-muted-foreground mb-1 text-sm">
                สิ้นสุดแล้ว
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {completedRecords} ครั้ง
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      {(data?.records || []).length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data?.records || []).map((record: AttendanceRecord) => (
            <AttendanceCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center">
          <CalendarIcon className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">ไม่พบบันทึก</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {dateRange
              ? `ไม่พบบันทึกสำหรับวันที่ที่เลือก`
              : 'ยังไม่มีบันทึกการเข้า-ออกงาน'}
          </p>
        </div>
      )}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center">
          <PaginationControll
            page={data.page}
            totalPages={data.total_pages}
            limit={data.limit}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceMePage;
