import { useQuery } from '@tanstack/react-query';
import type { EmployeeAnalysisResponse } from '@/@types/Attendance';
import apiClient from '@/lib/apiClient';

// แปลง Date เป็น YYYY-MM-DD สำหรับส่ง API
const formatDateParam = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Hook สำหรับดึงข้อมูลวิเคราะห์ประวัติการเข้างานรายบุคคล
 * API: GET /attendance/analysis/employee?employee_id={id}&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const useEmployeeAnalysis = (
  employeeId: string | undefined,
  startDate?: Date,
  endDate?: Date
) => {
  const startStr = startDate ? formatDateParam(startDate) : undefined;
  const endStr = endDate ? formatDateParam(endDate) : undefined;

  const query = useQuery<EmployeeAnalysisResponse>({
    queryKey: ['attendance', 'analysis', 'employee', employeeId, startStr, endStr],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (employeeId) params.append('employee_id', employeeId);
      if (startStr) params.append('start_date', startStr);
      if (endStr) params.append('end_date', endStr);

      const response = await apiClient.get<EmployeeAnalysisResponse>(
        `/attendance/analysis/employee?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    analysis: query.data?.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

export default useEmployeeAnalysis;
