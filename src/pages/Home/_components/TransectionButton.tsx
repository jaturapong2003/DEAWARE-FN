import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Loader2, Clock } from 'lucide-react';
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

  const isCheckedIn = Boolean(checkInTime);
  const isCooldown = Boolean(cooldownSeconds && cooldownSeconds > 0);

  const handleClick = async () => {
    try {
      if (isCheckedIn) {
        await checkOut();
        toast.success('ออกงานสำเร็จ!');
      } else {
        await checkIn();
        toast.success('เข้างานสำเร็จ!');
      }
      // refresh employee data
      queryClient.invalidateQueries({ queryKey: ['employee', 'me'] });
    } catch (err: unknown) {
      const message: string =
        err instanceof Error ? err.message : 'ดำเนินการไม่สำเร็จ';
      toast.error(message);
    }
  };
  const actionLabel = loading
    ? 'กำลังบันทึก...'
    : isCooldown
      ? `รอ ${cooldownSeconds} วินาที`
      : isCheckedIn
        ? 'ออกงาน'
        : 'เข้างาน';

  const ActionIcon = loading
    ? Loader2
    : isCooldown
      ? Clock
      : isCheckedIn
        ? LogOut
        : LogIn;

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="from-primary/80 to-foreground bg-linear-to-r bg-clip-text text-lg font-semibold text-transparent">
            บันทึกเวลา
          </h3>
          <p className="text-muted-foreground text-xs">Time Attendance</p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 text-xs"
        >
          {isCheckedIn ? 'กำลังทำงาน' : 'ยังไม่เข้างาน'}
        </Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="from-chart-1/5 border-border/50 group hover:border-chart-1/30 rounded-md border bg-linear-to-br to-transparent p-3 text-center transition-colors">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm font-semibold">
            <LogIn className="h-3 w-3" />
            <span>เข้า</span>
          </div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums transition-colors ${
              checkInTime
                ? 'text-chart-1 group-hover:text-chart-1'
                : 'text-muted-foreground/30'
            }`}
          >
            {formatTime(checkInTime)}
          </div>
        </div>

        <div className="from-destructive/5 border-border/50 group hover:border-destructive/30 rounded-md border bg-linear-to-br to-transparent p-3 text-center transition-colors">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm font-semibold">
            <LogOut className="h-3 w-3" />
            <span>ออก</span>
          </div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums transition-colors ${
              checkOutTime
                ? 'text-destructive group-hover:text-destructive'
                : 'text-muted-foreground/30'
            }`}
          >
            {formatTime(checkOutTime)}
          </div>
        </div>
      </div>

      <Button
        onClick={handleClick}
        disabled={loading || isCooldown}
        variant={isCheckedIn ? 'destructive' : 'default'}
        size="lg"
        className={`w-full gap-2 font-medium transition-all ${
          loading
            ? 'cursor-wait'
            : isCooldown
              ? 'bg-muted hover:bg-muted text-muted-foreground cursor-wait'
              : isCheckedIn
                ? 'from-destructive to-destructive/90 hover:shadow-destructive/20 bg-linear-to-r hover:shadow-lg'
                : 'from-primary to-primary/90 hover:shadow-primary/20 bg-linear-to-r hover:shadow-lg'
        }`}
        aria-pressed={isCheckedIn}
        aria-label={actionLabel}
      >
        <ActionIcon className={`${loading ? 'animate-spin' : ''} h-5 w-5`} />
        <span className="text-base">{actionLabel}</span>
      </Button>
    </div>
  );
};

export default TransectionButton;
