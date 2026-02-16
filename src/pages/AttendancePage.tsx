import React, { useState } from 'react';
import type { AttendanceResponse, AttendanceRecord } from '@/@types/Attendance';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  Smartphone,
  Monitor,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import keycloak from '@/config/keycloak';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';

// format time
const formatTime = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ICON DEVICE
const DeviceIcon: React.FC<{ device: string | null }> = ({ device }) => {
  if (!device) return null;
  if (device === 'mobile_app') {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

// Card attendance
const AttendanceCard: React.FC<{ record: AttendanceRecord }> = ({ record }) => {
  const isActive = !record.check_out;

  return (
    <div className="bg-card group hover:border-primary/50 overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md">
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="font-semibold">{formatDate(record.check_in)}</span>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                กำลังทำงาน
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                สิ้นสุดแล้ว
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* เวลาเข้างาน */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <LogIn className="h-4 w-4" />
              <span>เวลาเข้างาน</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <span className="text-lg font-semibold">
                {formatTime(record.check_in)}
              </span>
            </div>
            {record.check_in_device && (
              <div className="flex items-center gap-2">
                <DeviceIcon device={record.check_in_device} />
                <span className="text-muted-foreground text-xs">
                  {record.check_in_device === 'mobile_app'
                    ? 'แอปมือถือ'
                    : 'กล้อง'}
                </span>
              </div>
            )}
          </div>

          {/* เวลาออกงาน */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <LogOut className="h-4 w-4" />
              <span>เวลาออกงาน</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-semibold">
                {formatTime(record.check_out)}
              </span>
            </div>
            {record.check_out_device && (
              <div className="flex items-center gap-2">
                <DeviceIcon device={record.check_out_device} />
                <span className="text-muted-foreground text-xs">
                  {record.check_out_device === 'mobile_app'
                    ? 'แอปมือถือ'
                    : 'กล้อง'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ชั่วโมงทำงาน */}
        <div className="mt-4 border-t pt-4">
          <div className="bg-primary/5 flex items-center justify-between rounded-md px-3 py-2">
            <span className="text-muted-foreground text-sm">ชั่วโมงทำงาน</span>
            <span className="text-primary text-lg font-bold">
              {record.work_hours}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

async function fetchAttendanceMe(
  token: string | null
): Promise<AttendanceResponse> {
  if (!token) {
    throw Error('เกิดข้อผิดพลาดการยืนยันตัวตน');
  }

  const response = await fetch('http://100.94.239.54:3001/api/attendance/me', {
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
