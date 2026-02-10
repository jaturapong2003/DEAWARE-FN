import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

// ประเภทข้อมูลการตอบกลับจาก check-in/check-out
interface AttendanceResponse {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string;
  work_hours: string;
  check_in_device: string;
  check_out_device: string;
  check_in_confidence: number;
  check_out_confidence: number;
}

// ประเภท error response
interface ErrorResponse {
  disabled: boolean;
  error: string;
}

// Key สำหรับเก็บใน localStorage
const STORAGE_KEY = 'attendance_today';

/**
 * Hook สำหรับจัดการ Check-in / Check-out (ใช้ React Query Mutations)
 */
export const useAttendance = () => {
  const { post } = useApi();
  const queryClient = useQueryClient();
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // แปลง ISO timestamp เป็นเวลา HH:mm
  const formatTimeFromISO = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // โหลดเวลาจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        if (data.date === today) {
          setCheckInTime(data.checkIn);
          setCheckOutTime(data.checkOut);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // บันทึกเวลาลง localStorage
  const saveToStorage = useCallback((checkIn: string | null, checkOut: string | null) => {
    const data = {
      date: new Date().toDateString(),
      checkIn,
      checkOut,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Mutation สำหรับ Check-in
  const checkInMutation = useMutation<AttendanceResponse, Error>({
    mutationFn: async () => {
      const response = await post<AttendanceResponse>('/attendance/check-in', {
        device: 'web_app',
        confidence: 0.95
      });
      return response.data;
    },
    onSuccess: (data) => {
      const time = formatTimeFromISO(data.check_in);
      setCheckInTime(time);
      setCheckOutTime(null);
      saveToStorage(time, null);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: ErrorResponse } };
      const errorMessage = axiosError.response?.data?.error || 'Check-in ไม่สำเร็จ';
      
      // ถ้า error บอกว่าเช็คอินไปแล้ว → ตั้งค่าว่าเช็คอินแล้ว
      if (errorMessage.includes('ลงชื่อเข้างานไปแล้ว') || axiosError.response?.data?.disabled) {
        setCheckInTime('เช็คอินแล้ว');
        saveToStorage('เช็คอินแล้ว', null);
      }
    },
  });

  // Mutation สำหรับ Check-out
  const checkOutMutation = useMutation<AttendanceResponse, Error>({
    mutationFn: async () => {
      const response = await post<AttendanceResponse>('/attendance/check-out', {
        device: 'web_app',
        confidence: 0.92
      });
      return response.data;
    },
    onSuccess: (data) => {
      const checkInFormatted = formatTimeFromISO(data.check_in);
      const checkOutFormatted = formatTimeFromISO(data.check_out);
      setCheckInTime(checkInFormatted);
      setCheckOutTime(checkOutFormatted);
      saveToStorage(checkInFormatted, checkOutFormatted);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  // Wrapper functions ที่ throw error สำหรับ try-catch
  const checkIn = async () => {
    try {
      const result = await checkInMutation.mutateAsync();
      return result;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ErrorResponse } };
      const errorMessage = axiosError.response?.data?.error || 'Check-in ไม่สำเร็จ';
      throw new Error(errorMessage);
    }
  };

  const checkOut = async () => {
    try {
      const result = await checkOutMutation.mutateAsync();
      return result;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ErrorResponse } };
      const errorMessage = axiosError.response?.data?.error || 'Check-out ไม่สำเร็จ';
      throw new Error(errorMessage);
    }
  };

  return { 
    checkIn, 
    checkOut, 
    loading: checkInMutation.isPending || checkOutMutation.isPending,
    error: checkInMutation.error?.message || checkOutMutation.error?.message || null,
    checkInTime,
    checkOutTime,
  };
};

export default useAttendance;
