import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';

// ประเภทข้อมูลการเข้างาน
interface AttendanceResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

// ประเภทข้อมูลสถานะการเข้างานวันนี้
interface TodayAttendance {
  check_in_time: string | null;
  check_out_time: string | null;
}

/**
 * Hook สำหรับจัดการ Check-in / Check-out
 */
export const useAttendance = () => {
  const { post, get } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // ดึงสถานะการเข้างานวันนี้
  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await get<TodayAttendance>('/attendance/today');
      setCheckInTime(response.data.check_in_time);
      setCheckOutTime(response.data.check_out_time);
    } catch (err) {
      console.log('ยังไม่มีข้อมูลการเข้างานวันนี้');
    }
  }, [get]);

  // โหลดสถานะเมื่อเริ่มต้น
  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Check-in
  const checkIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await post<AttendanceResponse>('/attendance/check-in');
      const now = new Date().toISOString();
      setCheckInTime(response.data.timestamp || now);
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
      const now = new Date().toISOString();
      setCheckOutTime(response.data.timestamp || now);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-out ไม่สำเร็จ';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // คำนวณสถานะ: เช็คอินแล้วหรือยัง
  const isCheckedIn = checkInTime !== null && checkOutTime === null;

  return { 
    checkIn, 
    checkOut, 
    loading, 
    error, 
    isCheckedIn,
    checkInTime,
    checkOutTime,
    refetch: fetchTodayStatus
  };
};

export default useAttendance;
