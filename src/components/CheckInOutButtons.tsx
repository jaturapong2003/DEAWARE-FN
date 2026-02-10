import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface CheckInOutButtonsProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading: boolean;
  isCheckedIn: boolean; // สถานะว่าเช็คอินแล้วหรือยัง
  checkInTime: string | null; // เวลาเข้างาน
  checkOutTime: string | null; // เวลาออกงาน
}

/**
 * คอมโพเนนต์ปุ่ม Check-in / Check-out แบบปุ่มเดียว
 */
const CheckInOutButtons: React.FC<CheckInOutButtonsProps> = ({
  onCheckIn,
  onCheckOut,
  loading,
  isCheckedIn,
  checkInTime,
  checkOutTime,
}) => {
  // Format เวลาให้อ่านง่าย
  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card flex flex-col gap-4 rounded-lg border p-6">
      <h3 className="text-center text-lg font-semibold">บันทึกเวลา</h3>

      {/* แสดงเวลาเข้า-ออก */}
      <div className="bg-muted/50 flex justify-center gap-8 rounded-lg border py-2">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">เข้างาน</p>
          <p className="text-2xl font-bold text-green-600">
            {formatTime(checkInTime)}
          </p>
        </div>
        <div className="bg-border h-12 w-px" />
        <div className="text-center">
          <p className="text-muted-foreground text-sm">ออกงาน</p>
          <p className="text-2xl font-bold text-red-600">
            {formatTime(checkOutTime)}
          </p>
        </div>
      </div>

      {/* ปุ่มเดียว - สลับระหว่าง Check-in / Check-out */}
      {!isCheckedIn ? (
        // ปุ่ม Check-in (สีเขียว)
        <Button
          onClick={onCheckIn}
          disabled={loading}
          className="h-16 bg-green-600 text-lg hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          เข้างาน
        </Button>
      ) : (
        // ปุ่ม Check-out (สีแดง)
        <Button
          onClick={onCheckOut}
          disabled={loading}
          className="h-16 bg-red-600 text-lg hover:bg-red-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-5 w-5" />
          )}
          ออกงาน
        </Button>
      )}
    </div>
  );
};

export default CheckInOutButtons;
