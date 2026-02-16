import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
};

const ErrorPage: React.FC<Props> = ({
  title = 'เกิดข้อผิดพลาด',
  message = 'ขออภัย เกิดปัญหาในการโหลดข้อมูล',
  retryLabel = 'ลองอีกครั้ง',
  onRetry,
  fullScreen = true,
}) => {
  const wrapperClass = fullScreen
    ? 'flex h-screen items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={wrapperClass}>
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        {onRetry && (
          <div className="mt-4">
            <Button onClick={onRetry}>{retryLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
