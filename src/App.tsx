import { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import KeycloakLoading from './components/KeycloakLoading';
import { ToastProvider } from './components/Toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    // Debug: แสดงสถานะ Keycloak ใน console
    console.log('Keycloak เริ่มต้นแล้ว:', initialized);
    console.log('Keycloak ยืนยันตัวตน:', keycloak.authenticated);
    console.log('Keycloak token:', keycloak.token ? 'มี' : 'ไม่มี');

    // บังคับ login ถ้ายังไม่ได้ยืนยันตัวตน
    if (initialized && !keycloak.authenticated) {
      console.log('กำลังเปลี่ยนเส้นทางไปหน้า login...');
      keycloak.login();
    }
  }, [initialized, keycloak]);

  // แสดง Loading ขณะ Keycloak กำลังเริ่มต้น
  if (!initialized) {
    return <KeycloakLoading />;
  }

  // แสดง Loading ถ้ายังไม่ได้ยืนยันตัวตน (กำลัง redirect)
  if (!keycloak.authenticated) {
    return <KeycloakLoading />;
  }

  // ผู้ใช้ยืนยันตัวตนแล้ว แสดงแอปพลิเคชัน
  return (
     <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <div className="App">
        <AppRoutes />
      </div>

    </ToastProvider>
     <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
