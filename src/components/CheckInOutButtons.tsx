import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface CheckInOutButtonsProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading: boolean;
  lastAction: 'check-in' | 'check-out' | null;
}

/**
 * คอมโพเนนต์ปุ่ม Check-in / Check-out
 */
const CheckInOutButtons: React.FC<CheckInOutButtonsProps> = ({
  onCheckIn,
  onCheckOut,
  loading,
  lastAction,
}) => {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-lg border p-6">
      <h3 className="text-center text-lg font-semibold">บันทึกเวลา</h3>

      <div className="flex gap-4">
        {/* ปุ่ม Check-in */}
        <Button
          onClick={onCheckIn}
          disabled={loading}
          className="h-16 flex-1 text-lg"
          variant="default"
        >
          {loading && lastAction === 'check-in' ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          เข้างาน
        </Button>

        {/* ปุ่ม Check-out */}
        <Button
          onClick={onCheckOut}
          disabled={loading}
          className="h-16 flex-1 text-lg"
          variant="destructive"
        >
          {loading && lastAction === 'check-out' ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-5 w-5" />
          )}
          ออกงาน
        </Button>
      </div>

      {/* แสดงสถานะล่าสุด */}
      {lastAction && !loading && (
        <p className="text-center text-sm text-green-600">
          ✅ {lastAction === 'check-in' ? 'เข้างานสำเร็จ' : 'ออกงานสำเร็จ'}
        </p>
      )}
    </div>
  );
};

export default CheckInOutButtons;
