import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useEmployeeAttendanceHistory from '@/hooks/useEmployeeAttendanceHistory';
import useEmployeeById from '@/hooks/useEmployeeById';
import { fetchWithAuth } from '@/config/fetctWithAuth';

import type { DateRange } from 'react-day-picker';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/helper';
import LoadingPage from '@/components/common/LoadingPage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  CalendarDays,
  AlertTriangle,
  UserRoundCog,
} from 'lucide-react';
import DashboardId from './Dashboard_Id';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

// Types for email
interface SendEmailRequest {
  subject: string;
  details: string;
  type: 'normal' | 'warning';
}

interface SendEmailResponse {
  success: boolean;
  message: string;
}

// Email Dialog
function EmaillDialog({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [emailType, setEmailType] = useState<'normal' | 'warning'>('normal');

  // Mutation for sending email
  const sendEmailMutation = useMutation<
    SendEmailResponse,
    Error,
    SendEmailRequest
  >({
    mutationFn: async (emailData) => {
      return await fetchWithAuth<SendEmailResponse>(
        `/api/employee/${employeeId}/send-email`,
        {
          method: 'POST',
          body: JSON.stringify(emailData),
        }
      );
    },
    onSuccess: (data) => {
      alert(data.message || 'ส่งอีเมลสำเร็จ');
      // รีเซ็ตฟอร์มและปิด dialog
      setSubject('');
      setDetails('');
      setEmailType('normal');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('subject: ', subject);
    console.log('details: ', details);
    console.log('type: ', emailType);

    // ตรวจสอบข้อมูล
    if (!subject.trim() || !details.trim()) {
      toast.error('กรุณากรอกหัวข้อและรายละเอียด');
      return;
    }

    // ส่งข้อมูลผ่าน mutation
    sendEmailMutation.mutate({
      subject: subject.trim(),
      details: details.trim(),
      type: emailType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>
          <Mail />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmitEmail}>
          <DialogHeader>
            <DialogTitle>ฟอร์มส่งอีเมลให้พนักงาน</DialogTitle>
          </DialogHeader>
          <FieldGroup className='mt-5'>
            <Field>
              <Label>หัวข้อ</Label>
              <Input
                placeholder="กรอกหัวข้อที่นี่"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Field>
            <Field>
              <Label>รายละเอียด</Label>
              <Input
                placeholder="กรอกรายละเอียดที่นี่"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </Field>
            <Field>
              <Label>ประเภทจดหมาย</Label>
              <RadioGroup
                value={emailType}
                onValueChange={(value) =>
                  setEmailType(value as 'normal' | 'warning')
                }
              >
                <Field orientation={'horizontal'}>
                  <RadioGroupItem id="normal" value="normal" />
                  <Label htmlFor="normal">จดหมายทั่วไป</Label>
                </Field>
                <Field orientation={'horizontal'}>
                  <RadioGroupItem id="warning" value="warning" />
                  <Label htmlFor="warning">จดหมายแจ้งเตือน</Label>
                </Field>
              </RadioGroup>
            </Field>
          </FieldGroup>
          <DialogFooter className='mt-6'>
            <DialogClose asChild>
              <Button
                variant={'outline'}
                type="button"
                disabled={sendEmailMutation.isPending}
              >
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit" disabled={sendEmailMutation.isPending}>
              {sendEmailMutation.isPending ? 'กำลังส่ง...' : 'ส่งอีเมล'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * หน้ารายละเอียดพนักงาน - แสดงโปรไฟล์และประวัติการเข้างาน
 */
function EmployeeIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  // 🔙 ปุ่มกลับ
  const handleGoBack = () => {
    navigate('/employees');
  };

  // กำลังโหลดข้อมูลพนักงาน
  if (employeeLoading) {
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
    <div className="space-y-2">
      {/* 🔙 ปุ่มกลับ */}
      <Button variant={'link'} onClick={handleGoBack}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">กลับไปหน้ารายชื่อ</span>
      </Button>

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
              <EmaillDialog employeeId={employee.user_id} />
            </div>
          </div>

          {/* ข้อมูลรายละเอียด */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* User ID */}
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
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
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
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
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
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
            <div className="group bg-muted/50 hover:bg-muted/80 flex cursor-default items-center gap-3 rounded-lg p-3 transition-colors duration-200">
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
          <div>
            <h2 className="text-lg font-bold">ภาพรวมและประวัติการเข้างาน</h2>
            <p className="text-muted-foreground text-sm">
              แดชบอร์ดและรายการบันทึกการเข้า-ออกงาน
            </p>
          </div>

          {/* 📅 เลือกช่วงวันที่ */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span>
                        {dateRange.from.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {' - '}
                        {dateRange.to.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span>
                        {dateRange.from.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )
                  ) : (
                    <span>เลือกช่วงวันที่</span>
                  )}
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
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange(undefined);
                }}
                className="text-muted-foreground h-8 px-2 text-xs"
              >
                ล้าง
              </Button>
            )}
          </div>
        </div>

        {/* 📊 แดชบอร์ด */}
        <div className="p-4">
          <DashboardId
            employee={employee}
            records={dashboardRecords}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}

export default EmployeeIdPage;
