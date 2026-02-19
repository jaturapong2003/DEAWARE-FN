import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useKeycloak } from '@react-keycloak/web';
import apiClient from '@/lib/apiClient';

// error response
interface ErrorResponse {
  disabled: boolean;
  error: string;
}

// Base key สำหรับเก็บใน localStorage (จะต่อด้วย user_id)
const STORAGE_KEY_PREFIX = 'attendance_today_';

/**
 * Hook สำหรับจัดการ Check-in / Check-out (ใช้ React Query Mutations)
 */
export const useAttendance = () => {

  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();
  const userId = keycloak.tokenParsed?.sub || 'unknown';
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;

  // อ่านค่าเริ่มต้นจาก localStorage (แยกตาม user)
  const getInitialTime = (field: 'checkIn' | 'checkOut'): string | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date === today) {
        return data[field] || null;
      }
      localStorage.removeItem(storageKey);
    } catch {
      localStorage.removeItem(storageKey);
    }
    return null;
  };

  const [checkInTime, setCheckInTime] = useState<string | null>(() => getInitialTime('checkIn'));
  const [checkOutTime, setCheckOutTime] = useState<string | null>(() => getInitialTime('checkOut'));

  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const cooldownRef = useRef<number | null>(null);
  const COOLDOWN_AFTER_ACTION = 5; // seconds

  // Invalidate cache เมื่อ user เปลี่ยน
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // บันทึกเวลาลง localStorage (แยกตาม user)
  const saveToStorage = useCallback((checkIn: string | null, checkOut: string | null) => {
    const data = {
      date: new Date().toDateString(),
      checkIn,
      checkOut,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey]);

  // Mutation สำหรับ Check-in
  const checkInMutation = useMutation<AttendanceResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<AttendanceResponse>('/attendance/check-in', {
        device: 'web_app',
        confidence: 0.95
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  // Mutation สำหรับ Check-out
  const checkOutMutation = useMutation<AttendanceSingleResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<AttendanceResponse>('/attendance/check-out', {
        device: 'web_app',
        confidence: 0.92
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });

      // start cooldown to prevent immediate repeated check-out
      setCooldownSeconds(COOLDOWN_AFTER_ACTION);
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      cooldownRef.current = window.setInterval(() => {
        setCooldownSeconds((s) => {
          if (s <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
              cooldownRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
  });

  // Helper to extract error message
  const getErrorMessage = (err: unknown, fallback: string): string => {
    const errorResponse = (err as { response?: { data?: ErrorResponse } })
      ?.response?.data;
    return errorResponse?.error || fallback;
  };

  // Wrapper functions with consistent error handling
  const checkIn = async (): Promise<AttendanceSingleResponse> => {
    try {
      return await checkInMutation.mutateAsync();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Check-in ไม่สำเร็จ'));
    }
  };

  const checkOut = async (): Promise<AttendanceSingleResponse> => {
    try {
      return await checkOutMutation.mutateAsync();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Check-out ไม่สำเร็จ'));
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, []);

  return {
    checkIn,
    checkOut,
    loading: checkInMutation.isPending || checkOutMutation.isPending,
    cooldownSeconds,
  };
};

export default useAttendance;
