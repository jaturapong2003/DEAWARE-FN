import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AttendanceResponse } from '@/@types/Attendance';

export const useAttendanceHistory = (limit: number = 10, offset: number = 0) => {
  const query = useQuery<AttendanceResponse>({
    queryKey: ['attendance', 'history', limit, offset],
    queryFn: async () => {
      const response = await apiClient.get<AttendanceResponse>(
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
