import toast from 'react-hot-toast';
import { LogIn, LogOut, X } from 'lucide-react';

const toastConfig = {
  check_in: {
    title: 'AI ตรวจพบการเข้างาน',
    actionText: 'กำลังเข้างาน',
    Icon: LogIn,
    colors: {
      bg: 'bg-emerald-100/80 dark:bg-emerald-500/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      highlight: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  check_out: {
    title: 'AI ตรวจพบการออกงาน',
    actionText: 'กำลังออกงาน',
    Icon: LogOut,
    colors: {
      bg: 'bg-rose-100/80 dark:bg-rose-500/20',
      icon: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      highlight: 'text-rose-600 dark:text-rose-400',
    },
  },
};

export const showAttendanceToast = (
  displayName: string,
  action: 'check_in' | 'check_out'
) => {
  // ดึง Config ตาม action ที่ส่งเข้ามา
  const config = toastConfig[action];
  const { Icon, colors } = config;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border ${
          colors.border
        } bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 dark:bg-slate-900/95`}
      >
        {/* --- 1. Icon Section --- */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors.bg}`}
        >
          {/* ปรับ strokeWidth ให้ไอคอนดูคมชัดและโมเดิร์นขึ้น */}
          <Icon
            className={`h-5 w-5 ${colors.icon}`}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        {/* --- 2. Content Section --- */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {config.title}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            <span className={`font-medium ${colors.highlight}`}>
              {displayName}
            </span>{' '}
            {config.actionText}
          </p>
        </div>

        {/* --- 3. Close Button Section --- */}
        {/* เปลี่ยนจากข้อความ "ปิด" เป็นไอคอน X เพื่อลด Visual Noise */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};
