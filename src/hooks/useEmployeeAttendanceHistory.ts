import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { formatDateToISO } from '@/lib/date';
import type { EmployeeAttendanceRecord } from '@/@types';

// Response type จาก API (re-using central types)
interface EmployeeHistoryResponse {
  records: EmployeeAttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Hook สำหรับดึงประวัติการเข้างานของพนักงานตาม ID
 * API: GET /attendance/history/{employeeId}?page=1&limit=10&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const useEmployeeAttendanceHistory = (
  employeeId: string | undefined,
  page: number = 1,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) => {
  const startStr = startDate ? formatDateToISO(startDate) : undefined;
  const endStr = endDate ? formatDateToISO(endDate) : undefined;

  const query = useQuery<EmployeeHistoryResponse>({
    queryKey: [
      'attendance',
      'history',
      employeeId,
      page,
      limit,
      startStr,
      endStr,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (startStr) params.append('start_date', startStr);
      if (endStr) params.append('end_date', endStr);

      const response = await apiClient.get<EmployeeHistoryResponse>(
        `/attendance/history/${employeeId}?${params.toString()}`
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
