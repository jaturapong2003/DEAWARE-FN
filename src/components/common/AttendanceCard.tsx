import type { AttendanceRecord } from '@/@types/Attendance';
import {
  Ban,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Monitor,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/date';

// ICON DEVICE
const DeviceIcon: React.FC<{ device: string | null }> = ({ device }) => {
  switch (device) {
    case 'web_app':
      return <Monitor className="h-4 w-4" />;
    case 'cam-01':
      return <Camera className="h-4 w-4" />;
    default:
      return <Ban className="h-4 w-4" />;
  }
};

// DEVICE NAME
const getDeviceName = (device: string | null): string => {
  switch (device) {
    case 'web_app':
      return 'เว็บแอพ';
    case 'cam-01':
      return 'กล้อง 1';
    default:
      return 'ไม่ระบุ';
  }
};

// CONFIDENCE BADGE COLOR
const getConfidenceColor = (confidence: number | null): string => {
  if (!confidence) {
    return 'text-muted-foreground';
  } else if (confidence >= 0.9) {
    return 'text-green-600';
  } else if (confidence >= 0.7) {
    return 'text-yellow-600';
  } else {
    return 'text-orange-600';
  }
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
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <LogIn className="h-4 w-4" />
              <span>เวลาเข้างาน</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <span className="text-lg font-semibold">
                {formatTime(record.check_in)}
              </span>
            </div>
            <div className="bg-muted/30 space-y-1.5 rounded-md p-2">
              <div className="flex items-center gap-2">
                <DeviceIcon device={record.check_in_device} />
                <span className="text-xs font-medium">
                  {getDeviceName(record.check_in_device)}
                </span>
              </div>
              {record.check_in_confidence !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    ความแม่นยำ:
                  </span>
                  <span
                    className={`text-xs font-bold ${getConfidenceColor(record.check_in_confidence)}`}
                  >
                    {(record.check_in_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* เวลาออกงาน */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <LogOut className="h-4 w-4" />
              <span>เวลาออกงาน</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-semibold">
                {record.check_out ? formatTime(record.check_out) : '-'}
              </span>
            </div>
            {record.check_out ? (
              <div className="bg-muted/30 space-y-1.5 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <DeviceIcon device={record.check_out_device} />
                  <span className="text-xs font-medium">
                    {getDeviceName(record.check_out_device)}
                  </span>
                </div>
                {record.check_out_confidence !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      ความแม่นยำ:
                    </span>
                    <span
                      className={`text-xs font-bold ${getConfidenceColor(record.check_out_confidence)}`}
                    >
                      {(record.check_out_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-md p-2">
                <span className="text-muted-foreground text-xs">
                  ยังไม่ได้ออกงาน
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ชั่วโมงทำงาน */}
        <div className="mt-4 border-t pt-4">
          <div className="from-primary/10 to-primary/5 border-primary/20 flex items-center justify-between rounded-lg border bg-linear-to-r px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <span className="text-sm font-medium">ชั่วโมงทำงานรวม</span>
            </div>
            <span className="text-primary text-xl font-bold">
              {record.work_hours || '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
