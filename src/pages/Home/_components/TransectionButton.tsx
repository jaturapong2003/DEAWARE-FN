import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/date';
import { useAttendance } from '@/hooks/useAttendance';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TransectionButtonProps {
  checkInTime: string | null;
  checkOutTime: string | null;
}

const TransectionButton: React.FC<TransectionButtonProps> = ({
  checkInTime,
  checkOutTime,
}) => {
  const { checkIn, checkOut, loading, cooldownSeconds } = useAttendance();
  const queryClient = useQueryClient();

  const isWorking = Boolean(checkInTime && !checkOutTime);
  const hasFinishedWork = Boolean(checkInTime && checkOutTime);
  const isCooldown = Boolean(cooldownSeconds && cooldownSeconds > 0);

  const handleAction = async (type: 'in' | 'out') => {
    try {
      if (type === 'in') {
        await checkIn();
        toast.success('เข้างานสำเร็จ!');
      } else {
        await checkOut();
        toast.success('ออกงานสำเร็จ!');
      }
      queryClient.invalidateQueries({ queryKey: ['employee', 'me'] });
    } catch (err: unknown) {
      const message: string =
        err instanceof Error ? err.message : 'ดำเนินการไม่สำเร็จ';
      toast.error(message);
    }
  };

  const getActionLabel = (type: 'in' | 'out') => {
    if (loading) return 'กำลังบันทึก...';
    if (isCooldown) return `รอ ${cooldownSeconds} วินาที`;
    if (type === 'in') return hasFinishedWork ? 'เข้างานใหม่' : 'เข้างาน';
    return isWorking ? 'ออกงาน' : 'ออกงานอีกครั้ง';
  };

  return (
    <div className="bg-card group rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="from-primary/80 to-foreground bg-linear-to-r bg-clip-text text-lg font-semibold text-transparent">
            บันทึกเวลา
          </h3>
          <p className="text-muted-foreground text-xs">Time Attendance</p>
        </div>
        <Badge
          variant="secondary"
          className={`${
            isWorking
              ? 'bg-primary/10 text-primary border-primary/20'
              : hasFinishedWork
                ? 'border-orange-200/50 bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400'
                : 'bg-muted text-muted-foreground border-border/50'
          } border text-xs`}
        >
          {isWorking
            ? 'กำลังทำงาน'
            : hasFinishedWork
              ? 'สิ้นสุดงานแล้ว'
              : 'ยังไม่เข้างาน'}
        </Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* Check In Card */}
        <div className="from-chart-1/5 border-border/50 group/item hover:border-chart-1/30 rounded-md border bg-linear-to-br to-transparent p-3 text-center transition-colors">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm font-semibold">
            <LogIn className="h-3 w-3" />
            <span>เข้า</span>
          </div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums transition-colors ${
              checkInTime ? 'text-chart-1' : 'text-muted-foreground/30'
            }`}
          >
            {formatTime(checkInTime)}
          </div>
        </div>

        {/* Check Out Card */}
        <div className="from-destructive/5 border-border/50 group/item hover:border-destructive/30 rounded-md border bg-linear-to-br to-transparent p-3 text-center transition-colors">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm font-semibold">
            <LogOut className="h-3 w-3" />
            <span>ออก</span>
          </div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums transition-colors ${
              checkOutTime ? 'text-destructive' : 'text-muted-foreground/30'
            }`}
          >
            {formatTime(checkOutTime)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() =>
            handleAction(isWorking || hasFinishedWork ? 'out' : 'in')
          }
          disabled={loading || isCooldown}
          variant={isWorking || hasFinishedWork ? 'destructive' : 'default'}
          size="lg"
          className={`w-full cursor-pointer gap-2 font-medium transition-all ${
            loading
              ? 'cursor-wait'
              : isCooldown
                ? 'bg-muted hover:bg-muted text-muted-foreground cursor-wait'
                : isWorking || hasFinishedWork
                  ? 'from-destructive to-destructive/90 hover:shadow-destructive/20 bg-linear-to-r hover:shadow-lg'
                  : 'from-primary to-primary/90 hover:shadow-primary/20 bg-linear-to-r hover:shadow-lg'
          }`}
          aria-label={
            isWorking || hasFinishedWork
              ? getActionLabel('out')
              : getActionLabel('in')
          }
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isWorking || hasFinishedWork ? (
            <LogOut className="h-5 w-5" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          <span className="text-base">
            {isWorking || hasFinishedWork
              ? getActionLabel('out')
              : getActionLabel('in')}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default TransectionButton;
