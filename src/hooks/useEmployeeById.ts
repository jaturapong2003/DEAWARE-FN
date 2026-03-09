import { useQuery } from '@tanstack/react-query';
import type { EmployeesList } from '@/@types/Employees';
import apiClient from '@/lib/apiClient';

/**
 * Hook สำหรับดึงข้อมูลพนักงานตาม ID
 * ใช้ endpoint /employee/list แล้ว filter หา user ตาม id
 * จะไม่ fetch ถ้ามี initialData ส่งมาแล้ว (จาก location.state)
 */
export const useEmployeeById = (
  employeeId: string | undefined,
  initialData?: EmployeesList | null
) => {
  const query = useQuery<EmployeesList | null>({
    queryKey: ['employee', 'detail', employeeId],
    queryFn: async () => {
      const response = await apiClient.get<EmployeesList[]>('/employee/list');
      const found = response.data.find((emp) => emp.user_id === employeeId);
      return found ?? null;
    },
    // ถ้ามี initialData (จาก location.state) ใช้เลย ไม่ต้อง fetch
    initialData: initialData ?? undefined,
    enabled: !!employeeId && !initialData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    employee: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
};

export default useEmployeeById;
