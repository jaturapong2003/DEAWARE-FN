import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { AttendanceRecord } from '@/@types/Attendance';
import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/helper';
import LoadingPage from '@/components/common/LoadingPage';
import PaginationControll from '@/components/filter/PaginationControll';
import DateRangeFilter from '@/components/filter/DateRangeFilter';
import AttendanceCard from '@/components/common/AttendanceCard';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  User,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';

// Response type สำหรับ /attendance/history/{employee_id}
interface HistoryResponse {
  records: AttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * หน้ารายละเอียดพนักงาน - แสดงโปรไฟล์และประวัติการเข้างาน
 */
function EmployeeIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // รับข้อมูลพนักงานจาก route state (ส่งมาจาก EmployeesPage)
  const employee = (location.state as { employee?: EmployeesList })?.employee;

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

  // ===== MOCK DATA (ลบออกเมื่อ backend พร้อม) =====
  const allMockRecords: AttendanceRecord[] = Array.from(
    { length: 15 },
    (_, i) => {
      const date = new Date(2026, 1, 22 - i); // 22 ก.พ. ย้อนกลับไป
      const checkInHour = 7 + (i % 2); // สลับ 07, 08
      const checkInMin = (i * 7 + 5) % 60; // 5, 12, 19, 26, ...
      const checkOutHour = 16 + (i % 2); // สลับ 16, 17
      const checkOutMin = (i * 11 + 10) % 60; // 10, 21, 32, 43, ...
      const hasCheckOut = i !== 0; // วันแรก (วันนี้) ยังไม่ออกงาน
      const workHrs = hasCheckOut
        ? (
            checkOutHour +
            checkOutMin / 60 -
            (checkInHour + checkInMin / 60)
          ).toFixed(2)
        : '0.00';
      const devices = ['web_app', 'camera'] as const;
      const inDevice = devices[i % 2];
      const outDevice = devices[(i + 1) % 2];
      const confidence = +(0.85 + ((i * 3) % 14) / 100).toFixed(2);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

      return {
        id: String(i + 1),
        employee_id: id || '',
        check_in: `${dateStr}T${pad(checkInHour)}:${pad(checkInMin)}:00Z`,
        check_out: hasCheckOut
          ? `${dateStr}T${pad(checkOutHour)}:${pad(checkOutMin)}:00Z`
          : null,
        work_hours: workHrs,
        check_in_device: inDevice,
        check_in_confidence: confidence,
        check_out_device: hasCheckOut ? outDevice : null,
        check_out_confidence: hasCheckOut ? confidence : null,
      };
    }
  );

  // กรองตามช่วงวันที่
  const filteredRecords = allMockRecords.filter((record) => {
    if (!dateRange?.from) return true;
    const recDate = new Date(record.check_in!);
    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);
    if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return recDate >= start && recDate <= end;
    }
    return recDate >= start;
  });

  // จำลอง pagination ฝั่ง client
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * limit,
    page * limit
  );

  const data: HistoryResponse = {
    records: paginatedRecords,
    page,
    limit,
    total: totalRecords,
    total_pages: totalPages,
  };
  const isLoading = false;
  const error = null;
  // ===== END MOCK DATA =====

  // 🔙 ปุ่มกลับ
  const handleGoBack = () => {
    navigate('/employees');
  };

  // ถ้าไม่มีข้อมูลพนักงาน (เข้า URL ตรงๆ ไม่ผ่านหน้า list)
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
              <Badge variant="secondary" className="mt-1">
                {employee.position || 'พนักงาน'}
              </Badge>
            </div>
          </div>

          {/* ข้อมูลรายละเอียด */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: User, label: 'User ID', value: employee.user_id },
              { icon: Mail, label: 'อีเมล', value: employee.email },
              {
                icon: Phone,
                label: 'เบอร์โทร',
                value: employee.phone_number || 'ไม่ระบุ',
              },
              {
                icon: Briefcase,
                label: 'ตำแหน่ง',
                value: employee.position || 'ไม่ระบุ',
              },
            ].map((field) => (
              <div
                key={field.label}
                className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
              >
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <field.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">{field.label}</p>
                  <p
                    className="truncate text-sm font-medium"
                    title={field.value}
                  >
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📋 ประวัติการเข้างาน */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ประวัติการเข้างาน</h2>
              <p className="text-muted-foreground text-sm">
                {data ? `ทั้งหมด ${data.total} รายการ` : 'กำลังโหลด...'}
              </p>
            </div>
          </div>
          {/* เลือกช่วงวันที่ */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              setDateRange(range);
              setPage(1);
            }}
          />
        </div>

        {/* Stats */}
        {data && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
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
                {data.records.filter((r) => !r.check_out).length} ครั้ง
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
              <div className="text-muted-foreground mb-1 text-sm">
                สิ้นสุดแล้ว
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.records.filter((r) => !!r.check_out).length} ครั้ง
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Records */}
      {isLoading ? (
        <LoadingPage
          message="กำลังโหลดประวัติการเข้างาน..."
          fullScreen={false}
        />
      ) : error ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-orange-500" />
          <h3 className="mt-4 text-lg font-semibold">
            ไม่สามารถโหลดประวัติการเข้างานได้
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            อาจยังไม่มีข้อมูลประวัติสำหรับพนักงานคนนี้
          </p>
        </div>
      ) : data && data.records.length > 0 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.records.map((record: AttendanceRecord) => (
              <AttendanceCard key={record.id} record={record} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center">
            <PaginationControll
              page={page}
              totalPages={data.total_pages}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        </>
      ) : (
        <div className="bg-card rounded-lg border p-8 text-center">
          <CalendarDays className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">ไม่มีประวัติการเข้างาน</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            ยังไม่มีข้อมูลการเข้า-ออกงานของพนักงานคนนี้
          </p>
        </div>
      )}
    </div>
  );
}

export default EmployeeIdPage;
