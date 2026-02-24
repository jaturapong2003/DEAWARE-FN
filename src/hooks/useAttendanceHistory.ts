import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ประเภทข้อมูลประวัติการเข้างาน (ตาม API จริง)
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  work_hours: string | null;
  check_in_device: string;
  check_in_confidence: number;
  check_out_device: string | null;
  check_out_confidence: number | null;
}

// ประเภท response จาก API
interface HistoryResponse {
  records: AttendanceRecord[];
  total: number;
}

/**
 * Hook สำหรับดึงประวัติการเข้างาน (ใช้ React Query)
 */
export const useAttendanceHistory = (limit: number = 10, offset: number = 0) => {


  const query = useQuery<HistoryResponse>({
    queryKey: ['attendance', 'history', limit, offset],
    queryFn: async () => {
      const response = await apiClient.get<HistoryResponse>(
        `/attendance/history?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return {
    records: query.data?.records ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

export default useAttendanceHistory;
