import { useState } from 'react';
import type { AttendanceResponse } from '@/@types/Attendance';
import { Input } from '@/components/ui/input';
import { Calendar, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import keycloak from '@/config/keycloak';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import { formatDate } from '@/lib/date';
import { AttendanceCard } from '@/components/attendances';

async function fetchAttendanceMe(
  token: string | null
): Promise<AttendanceResponse> {
  if (!token) {
    throw Error('เกิดข้อผิดพลาดการยืนยันตัวตน');
  }

  const response = await fetch('/api/attendance/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json());

  return response;
}

// Main page
function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const token = keycloak.token;
  const { data, isPending, error } = useQuery({
    queryKey: ['history/me'],
    queryFn: () => fetchAttendanceMe(token || ''),
    enabled: keycloak.authenticated,
  });

  if (error) {
    return <ErrorPage />;
  }

  if (isPending) {
    return <LoadingPage />;
  }

  // analysis
  const activeRecords = data.records.filter((r) => !r.check_out).length;
  const completedRecords = data.records.filter((r) => r.check_out).length;

  // filter date
  const filteredRecords = (data?.records || []).filter((record) => {
    const dateStr = formatDate(record.check_in);
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">ประวัติการเข้า-ออกงาน</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                บันทึกการเข้า-ออกงานทั้งหมด
              </p>
            </div>

            {/* ช่องค้นหา */}
            <div className="relative w-full md:w-80">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="ค้นหาตามวันที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="text-muted-foreground mb-1 text-sm">
                บันทึกทั้งหมด
              </div>
              <div className="text-2xl font-bold">{data.total} ครั้ง</div>
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
      {filteredRecords.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredRecords.map((record) => (
            <AttendanceCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Calendar className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">ไม่พบบันทึก</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {searchTerm
              ? `ไม่พบบันทึกที่ตรงกับ "${searchTerm}"`
              : 'ยังไม่มีบันทึกการเข้า-ออกงาน'}
          </p>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
