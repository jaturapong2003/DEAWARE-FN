import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import useAuthStore from '@/stores/authStore';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

const LoadingPage: React.FC<Props> = ({
  message = 'กำลังโหลด...',
  fullScreen = true,
}) => {
  const { keycloak, initialized } = useKeycloak();
  const { loggingOut } = useAuthStore();

  // ป้องกันการกะพริบตอนกำลัง Logout
  // ถ้ากำลังออกระบบ ให้แสดงข้อความที่ชัดเจนขึ้น
  if (loggingOut) {
    return (
      <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent shadow-sm"></div>
          <h2 className="mt-4 text-xl font-medium">กำลังออกจากระบบ...</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            กรุณารอสักครู่ ระบบกำลังนำท่านกลับไปยังหน้าเข้าใช้งาน
          </p>
        </div>
      </div>
    );
  }

  // กรณีอื่นๆ ระหว่างกระบวนการเช็คสิทธิ์ (ถ้า initialized แล้วแต่ไม่ได้ auth แสดงว่ากำลังเปลี่ยนผ่าน)
  if (initialized && !keycloak.authenticated) {
    return null;
  }

  const wrapperClass = fullScreen
    ? 'flex h-screen items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={wrapperClass}>
      <div className="text-center">
        <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-muted-foreground mt-3">{message}</p>
      </div>
    </div>
  );
};

export default LoadingPage;
