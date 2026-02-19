import type { AttendanceRecord } from '@/@types/Attendance';
import {
  Calendar,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Monitor,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/date';

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

export default AttendanceCard;
