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

const data: AttendanceResponse = {
  records: [
    {
      id: 'f0bf1196-59a2-444d-8767-3c819c0b6a5a',
      employee_id: '79c95bc9-7f3d-45d5-a618-2fed3821a17c',
      check_in: '2026-02-10T07:05:54Z',
      check_out: null,
      work_hours: '0 นาที',
      check_in_device: 'mobile_app',
      check_in_confidence: 0.95,
      check_out_device: '',
      check_out_confidence: 0,
    },
    {
      id: '3df160df-2c12-464c-a85e-0a8502104d67',
      employee_id: '79c95bc9-7f3d-45d5-a618-2fed3821a17c',
      check_in: '2026-02-09T10:41:58Z',
      check_out: '2026-02-09T16:16:56Z',
      work_hours: '5 ชม. 33 นาที',
      check_in_device: 'mobile_app',
      check_in_confidence: 0.95,
      check_out_device: 'web_app',
      check_out_confidence: 0.92,
    },
    {
      id: 'd56ff97f-3d57-47a4-bc44-f0bf6f799b7d',
      employee_id: '79c95bc9-7f3d-45d5-a618-2fed3821a17c',
      check_in: '2026-02-08T13:59:35Z',
      check_out: '2026-02-08T13:59:38Z',
      work_hours: '0 นาที',
      check_in_device: 'mobile_app',
      check_in_confidence: 0.95,
      check_out_device: 'mobile_app',
      check_out_confidence: 0.92,
    },
    {
      id: '09927543-844b-4fb6-9ab5-d29fcdb5d645',
      employee_id: '79c95bc9-7f3d-45d5-a618-2fed3821a17c',
      check_in: '2026-02-06T10:48:19Z',
      check_out: '2026-02-06T12:09:38Z',
      work_hours: '1 ชม. 21 นาที',
      check_in_device: 'mobile_app',
      check_in_confidence: 0.95,
      check_out_device: 'mobile_app',
      check_out_confidence: 0.92,
    },
  ],
  total: 4,
};

/**
 * Format เฉพาะเวลา
 */
const formatTime = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format วันที่เป็นภาษาไทย
 */
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * แสดง icon ตามประเภทอุปกรณ์
 */
const DeviceIcon: React.FC<{ device: string | null }> = ({ device }) => {
  if (!device) return null;
  if (device === 'mobile_app') {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

/**
 * คอมโพเนนต์การ์ดแสดงข้อมูลการเข้างานแต่ละครั้ง
 */
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

/**
 * หน้าประวัติการเข้า-ออกงานของพนักงาน
 */
function EmployeeAttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');

  // กรองข้อมูลตามวันที่
  const filteredRecords = data.records.filter((record) => {
    const dateStr = formatDate(record.check_in);
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // คำนวณสถิติ
  const activeRecords = data.records.filter((r) => !r.check_out).length;
  const completedRecords = data.records.filter((r) => r.check_out).length;

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

export default EmployeeAttendancePage;
