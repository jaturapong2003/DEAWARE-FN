import { useQuery } from '@tanstack/react-query';
import type { AttendanceRecord } from '@/@types/Attendance';
import apiClient from '@/lib/apiClient';

// Response type จาก API
interface EmployeeHistoryResponse {
  records: AttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Hook สำหรับดึงประวัติการเข้างานของพนักงานตาม ID
 * API: GET /attendance/history/{employeeId}?page=1&limit=10
 */
export const useEmployeeAttendanceHistory = (
  employeeId: string | undefined,
  page: number = 1,
  limit: number = 10
) => {
  const query = useQuery<EmployeeHistoryResponse>({
    queryKey: ['attendance', 'history', employeeId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<EmployeeHistoryResponse>(
        `/attendance/history/${employeeId}?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return {
    records: query.data?.records ?? [],
    page: query.data?.page ?? page,
    limit: query.data?.limit ?? limit,
    total: query.data?.total ?? 0,
    totalPages: query.data?.total_pages ?? 0,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

export default useEmployeeAttendanceHistory;
