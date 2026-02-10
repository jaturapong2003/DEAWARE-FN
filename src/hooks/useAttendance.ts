import { useState } from 'react';
import { useApi } from '@/hooks/useApi';

// ประเภทข้อมูลการเข้างาน
interface AttendanceResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

/**
 * Hook สำหรับจัดการ Check-in / Check-out
 */
export const useAttendance = () => {
  const { post } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<'check-in' | 'check-out' | null>(null);

  // Check-in
  const checkIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await post<AttendanceResponse>('/attendance/check-in');
      setLastAction('check-in');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-in ไม่สำเร็จ';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check-out
  const checkOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await post<AttendanceResponse>('/attendance/check-out');
      setLastAction('check-out');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-out ไม่สำเร็จ';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkIn, checkOut, loading, error, lastAction };
};

export default useAttendance;
