import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AttendanceSingleResponse } from '@/@types/Attendance';

// error response
interface ErrorResponse {
  disabled: boolean;
  error: string;
}

export type UseAttendanceHook = {
  checkIn: () => Promise<AttendanceSingleResponse>;
  checkOut: () => Promise<AttendanceSingleResponse>;
  loading: boolean;
  cooldownSeconds: number;
};

export const useAttendance = (): UseAttendanceHook => {
  const queryClient = useQueryClient();

  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const cooldownRef = useRef<number | null>(null);
  const COOLDOWN_AFTER_ACTION = 5; // seconds

  const checkInMutation = useMutation<AttendanceSingleResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<AttendanceSingleResponse>(
        '/attendance/check-in',
        { device: 'web_app', confidence: 1 }
      );
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
      const response = await apiClient.post<AttendanceSingleResponse>(
        '/attendance/check-out',
        { device: 'web_app', confidence: 1 }
      );
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