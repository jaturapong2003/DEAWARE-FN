import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  // If not authenticated, show fallback or redirect to login
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="auth-required">
        <h2>กรุณาเข้าสู่ระบบ</h2>
        <p>คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
        <button onClick={login} className="login-btn">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
