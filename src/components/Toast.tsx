import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

// ประเภทของ Toast
type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Hook สำหรับใช้งาน Toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider - ครอบ App เพื่อใช้งาน Toast ได้ทุกที่
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ลบ Toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // แสดง Toast สำเร็จ (สีเขียว)
  const success = useCallback(
    (message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type: 'success' }]);
      setTimeout(() => removeToast(id), 3000); // ซ่อนหลัง 3 วินาที
    },
    [removeToast]
  );

  // แสดง Toast ล้มเหลว (สีแดง)
  const error = useCallback(
    (message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type: 'error' }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}

      {/* Toast Container - แสดงตรงกลางด้านบน */}
      <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-in slide-in-from-top flex min-w-[300px] items-center gap-3 rounded-lg px-4 py-3 shadow-lg duration-300 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            } `}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
