import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useKeycloak } from '@react-keycloak/web';
import {
  LogIn,
  LogOut,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';
import type { EmployeesList } from '@/@types/Employees';
import type { AttendanceRecord } from '@/@types/Attendance';
import { formatTime } from '@/lib/date';
import { useAttendanceSocket, type LiveActivity } from '@/hooks/useAttendanceSocket';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AttendanceHistoryResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────
const timeAgo = (isoString: string | null): string => {
  if (!isoString) return '-';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชม. ที่แล้ว`;
  return `${Math.floor(hrs / 24)} วันที่แล้ว`;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ─── Hook: Fetch All Employees + Today's Attendance ──────────────────────────
const useLiveActivities = () => {
  return useQuery<LiveActivity[]>({
    queryKey: ['live-activity'],
    queryFn: async () => {
      // 1. Fetch all employees
      const empRes = await apiClient.get<EmployeesList[]>('/employee/list');
      const employees = empRes.data;
      if (!employees.length) return [];

      // 2. Fetch today's attendance for each employee in parallel
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];
      const endDate = startDate;

      const results = await Promise.allSettled(
        employees.map((emp) =>
          apiClient
            .get<AttendanceHistoryResponse>(
              `/attendance/history/${emp.user_id}?page=1&limit=5&start_date=${startDate}&end_date=${endDate}`
            )
            .then((res) => ({ emp, records: res.data.records ?? [] }))
        )
      );

      // 3. Flatten into activity events (1 record = 2 events max)
      const activities: LiveActivity[] = [];

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const { emp, records } = result.value;

        for (const rec of records) {
          // ไม่ต้องตรวจสอบรหัสกล้อง (cam-) แล้ว แสดงผลตามข้อมูลที่ได้รับมาโดยตรง
          if (rec.check_in) {
            activities.push({
              id: `${rec.id}-in`,
              employeeId: emp.user_id,
              displayName: emp.display_name,
              email: emp.email,
              avatarUrl: emp.url_image || undefined,
              action: 'check_in',
              time: rec.check_in,
              device: rec.check_in_device,
            });
          }
          if (rec.check_out) {
            activities.push({
              id: `${rec.id}-out`,
              employeeId: emp.user_id,
              displayName: emp.display_name,
              email: emp.email,
              avatarUrl: emp.url_image || undefined,
              action: 'check_out',
              time: rec.check_out,
              device: rec.check_out_device,
            });
          }
        }
      }

      // 4. Sort by time descending (latest first)
      const sorted = activities.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      // ── ข้อมูลจำลองสำหรับทดสอบ (5 คน) ──────────────────
      const now = new Date();
      const mockActivities: LiveActivity[] = [
        {
          id: 'mock-1',
          employeeId: 'm1',
          displayName: 'สมชาย รักงาน',
          email: 'somchai@deaware.com',
          action: 'check_in',
          time: new Date(now.getTime() - 2 * 60000).toISOString(),
          device: 'cam-01',
        },
        {
          id: 'mock-2',
          employeeId: 'm2',
          displayName: 'วิภาวี ตั้งใจ',
          email: 'wipawee@deaware.com',
          action: 'check_in',
          time: new Date(now.getTime() - 5 * 60000).toISOString(),
          device: 'cam-02',
        },
        {
          id: 'mock-3',
          employeeId: 'm3',
          displayName: 'ธนากร มาสาย',
          email: 'thanakorn@deaware.com',
          action: 'check_out',
          time: new Date(now.getTime() - 12 * 60000).toISOString(),
          device: 'cam-01',
        },
        {
          id: 'mock-4',
          employeeId: 'm4',
          displayName: 'กมล ขยันยิ่ง',
          email: 'kamol@deaware.com',
          action: 'check_in',
          time: new Date(now.getTime() - 25 * 60000).toISOString(),
          device: 'cam-01',
        },
        {
          id: 'mock-5',
          employeeId: 'm5',
          displayName: 'จิราภรณ์ พร้อมลุย',
          email: 'jiraporn@deaware.com',
          action: 'check_out',
          time: new Date(now.getTime() - 40 * 60000).toISOString(),
          device: 'cam-02',
        },
      ];

      return [...mockActivities, ...sorted];
    },
    refetchInterval: 30_000, // Poll every 30 seconds
    staleTime: 20_000,
    retry: 1,
  });
};

// ─── Activity Row ─────────────────────────────────────────────────────────────
const ActivityRow: React.FC<{ activity: LiveActivity; compact?: boolean }> = ({
  activity,
  compact = false,
}) => {
  const isIn = activity.action === 'check_in';

  return (
    <div className={`flex items-center gap-4 ${compact ? 'py-2' : 'py-3'}`}>
      <div className="relative shrink-0">
        <Avatar className={compact ? 'h-11 w-11' : 'h-12 w-12'}>
          {activity.avatarUrl ? (
            <AvatarImage src={activity.avatarUrl} alt={activity.displayName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
            {getInitials(activity.displayName)}
          </AvatarFallback>
        </Avatar>
        {/* Check-in / Check-out indicator dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-background ${
            compact ? 'h-5 w-5' : 'h-6 w-6'
          } ${
            isIn ? 'bg-green-500' : 'bg-orange-500'
          }`}
        >
          {isIn ? (
            <LogIn className={compact ? 'h-3 w-3 text-white' : 'h-3.5 w-3.5 text-white'} />
          ) : (
            <LogOut className={compact ? 'h-3 w-3 text-white' : 'h-3.5 w-3.5 text-white'} />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p
            className={`truncate font-bold ${compact ? 'text-base' : 'text-lg'}`}
          >
            {activity.displayName}
          </p>
          <span className={`text-muted-foreground shrink-0 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
            {compact ? formatTime(activity.time) : timeAgo(activity.time)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={`px-1.5 py-0 text-[10px] font-bold border-0 ${
              isIn
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}
          >
            {isIn ? 'เข้างาน' : 'ออกงาน'}
          </Badge>
          {/* ซ่อน Device Label ตามความต้องการ: ไม่จำเป็นระบุกล้อง */}
          {/* <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
            {getDeviceIcon(activity.device)}
            {getDeviceLabel(activity.device)}
          </span> */}
          {!compact && (
            <span className="text-muted-foreground text-xs font-medium opacity-70">
              • {formatTime(activity.time)} น.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const LiveActivityFeed: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [hovered, setHovered] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // เริ่มต้น WebSocket listener (เฉพาะ Admin)
  useAttendanceSocket();

  const isAdmin =
    keycloak.hasRealmRole('admin') ||
    keycloak.hasResourceRole('admin', import.meta.env.VITE_CLIENT_ID) ||
    keycloak.hasResourceRole('admin', 'DEAWARE') ||
    keycloak.hasResourceRole('admin', 'DFAWARF');

  const { data: activities = [], isLoading, dataUpdatedAt } = useLiveActivities();

  const preview = useMemo(() => activities.slice(0, 3), [activities]);
  const checkInsToday = useMemo(
    () => activities.filter((a) => a.action === 'check_in').length,
    [activities]
  );
  const showPopover = hovered && !drawerOpen && preview.length > 0;

  // Only visible for Admin
  if (!isAdmin) return null;

  return (
    <>
      {/* ── Floating Pill ───────────────────────────────────── */}
      <div
        className="relative flex items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* The pill button */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative flex h-12 cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-primary/15 hover:shadow-primary/25 hover:shadow-2xl dark:border-white/10 dark:bg-white/5 dark:hover:bg-primary/20"
          title="กิจกรรม Real-time (Admin)"
        >
          {/* Live pulse dot */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-emerald-500 relative inline-flex h-3 w-3 rounded-full" />
          </span>
          <Users className="text-foreground/90 h-5 w-5" />
          {/* Updated-at subtle indicator */}
          {dataUpdatedAt > 0 && (
            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1.5 text-[13px] font-black uppercase tracking-widest shadow-sm">
              LIVE AI
            </span>
          )}
        </button>

        {/* ── Hover Preview Popover ──────────────────────────── */}
          {showPopover && (
            <div
              className="absolute right-0 top-full z-50 mt-3 w-[360px] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl transition-all duration-200"
              style={{ pointerEvents: 'none' }}
            >
              <div className="bg-primary/5 border-border flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-emerald-500 relative inline-flex h-2.5 w-2.5 rounded-full" />
                  </span>
                  <span className="text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400">กิจกรรมล่าสุด</span>
                </div>
                <span className="text-muted-foreground text-xs font-semibold">
                  วันนี้ {checkInsToday} คน
                </span>
              </div>
              <div className="divide-border divide-y px-3">
                {preview.map((a) => (
                  <ActivityRow key={a.id} activity={a} compact />
                ))}
              </div>
              <div className="bg-muted/30 border-border flex items-center justify-center gap-1.5 border-t p-3">
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  คลิกเพื่อดูทั้งหมด
                </span>
                <ChevronRight className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />
              </div>
            </div>
          )}
      </div>

      {/* ── Full Activity Drawer ────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="bg-primary/5 border-border border-b px-4 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <span className="relative flex h-3 w-3">
                  <span className="bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-emerald-500 relative inline-flex h-3 w-3 rounded-full" />
                </span>
                กิจกรรมเข้า-ออกงาน (วันนี้)
              </SheetTitle>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="gap-1 text-xs">
                <LogIn className="h-3 w-3 text-green-500" />
                {activities.filter((a) => a.action === 'check_in').length} เข้างาน
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <LogOut className="h-3 w-3 text-orange-500" />
                {activities.filter((a) => a.action === 'check_out').length} ออกงาน
              </Badge>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] px-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-muted-foreground text-sm">กำลังโหลดข้อมูล...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <Users className="text-muted-foreground/30 h-12 w-12" />
                <p className="text-muted-foreground text-sm font-medium">
                  ยังไม่มีกิจกรรมวันนี้
                </p>
              </div>
            ) : (
              <div className="divide-border divide-y py-2">
                {activities.map((a) => (
                  <ActivityRow key={a.id} activity={a} />
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default LiveActivityFeed;
