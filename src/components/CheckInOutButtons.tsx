import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface CheckInOutButtonsProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

/**
 * คอมโพเนนต์ปุ่ม Check-in / Check-out - Responsive
 */
const CheckInOutButtons: React.FC<CheckInOutButtonsProps> = ({
  onCheckIn,
  onCheckOut,
  loading,
  checkInTime,
  checkOutTime,
}) => {
  // Format เวลาให้อ่านง่าย
  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    // ถ้าเป็น format HH:mm อยู่แล้ว
    if (time.length <= 5 && time.includes(':')) {
      return time;
    }
    // ถ้าเป็น format HH:mm:ss
    if (time.includes(':') && !time.includes('T')) {
      return time.substring(0, 5);
    }
    // ถ้าเป็น ISO string
    try {
      const date = new Date(time);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  };

  // ถ้าเช็คอินแล้ว (มี checkInTime) และยังไม่ได้เช็คเอาท์ → แสดงปุ่มออกงาน
  const hasCheckedIn = checkInTime !== null;

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:gap-4 sm:p-6">
      <h3 className="text-center text-base font-semibold sm:text-lg">
        บันทึกเวลา
      </h3>

      {/* แสดงเวลาเข้า-ออก - Responsive */}
      <div className="bg-muted/50 flex justify-center gap-4 rounded-lg border py-2 sm:gap-8 sm:py-3">
        <div className="text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">เข้างาน</p>
          <p className="text-xl font-bold text-green-600 sm:text-2xl">
            {checkInTime === 'เช็คอินแล้ว' ? '✓' : formatTime(checkInTime)}
          </p>
        </div>
        <div className="bg-border h-10 w-px sm:h-12" />
        <div className="text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">ออกงาน</p>
          <p className="text-xl font-bold text-red-600 sm:text-2xl">
            {formatTime(checkOutTime)}
          </p>
        </div>
      </div>

      {/* ปุ่มเดียว - สีเปลี่ยนตามสถานะ */}
      <Button
        onClick={hasCheckedIn ? onCheckOut : onCheckIn}
        disabled={loading}
        className={`h-12 text-base sm:h-16 sm:text-lg ${
          hasCheckedIn
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
        ) : hasCheckedIn ? (
          <LogOut className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        )}
        {hasCheckedIn ? 'ออกงาน' : 'เข้างาน'}
      </Button>
    </div>
  );
};

export default CheckInOutButtons;
