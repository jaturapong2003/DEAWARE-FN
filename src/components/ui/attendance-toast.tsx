import toast from 'react-hot-toast';

/**
 * ฟังก์ชันสำหรับแสดงการแจ้งเตือนเมื่อ AI ตรวจพบการเข้า-ออกงาน
 */
export const showAttendanceToast = (displayName: string, action: 'check_in' | 'check_out') => {
  const isCheckIn = action === 'check_in';
  
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 ${
        isCheckIn ? 'border-green-500' : 'border-orange-500'
      }`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="shrink-0 pt-0.5">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${
              isCheckIn ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {isCheckIn ? '✅' : '🚪'}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {isCheckIn ? 'ตรวจพบการเข้างาน (AI)' : 'ตรวจพบการออกงาน (AI)'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              พนักงาน <span className="font-semibold text-blue-600 dark:text-blue-400">{displayName}</span> กำลัง{isCheckIn ? 'เข้างาน' : 'ออกงาน'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-800">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          ปิด
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};


