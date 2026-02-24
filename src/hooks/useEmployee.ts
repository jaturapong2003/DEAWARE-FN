import { useQuery } from '@tanstack/react-query';
import type { AccountInfo } from '@/@types/Account';
import apiClient from '@/lib/apiClient';


/**
 * Hook สำหรับดึงข้อมูลพนักงานจาก API (ใช้ React Query)
 * - Auto caching
 * - Auto refetch เมื่อกลับมาที่หน้าเว็บ
 * - Retry ถ้า request ล้มเหลว
 */
export const useEmployee = () => {

  const query = useQuery<AccountInfo>({
    queryKey: ['employee', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<AccountInfo>('/employee/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 นาที
    retry: 2, // Retry 2 ครั้งถ้าล้มเหลว
    refetchOnWindowFocus: true, // Refetch เมื่อกลับมาที่หน้าต่าง
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

export default useEmployee;
