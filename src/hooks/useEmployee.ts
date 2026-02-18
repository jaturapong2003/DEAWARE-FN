import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { use } from 'react';
import { useAuthStore } from '@/stores/authStore';

// ประเภทข้อมูลพนักงาน (ตาม API Response จริง)
interface EmployeeProfile {
  auth_user_id: string;
  user_name: string;
  email: string;
  display_name: string;
  phone_number: string;
  position: string;
  url_image: string;
  face_embedding_count: number;
  has_face_embedding: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook สำหรับดึงข้อมูลพนักงานจาก API (ใช้ React Query)
 * - Auto caching
 * - Auto refetch เมื่อกลับมาที่หน้าเว็บ
 * - Retry ถ้า request ล้มเหลว
 */
export const useEmployee = () => {
  const { get } = useApi();
  const user = useAuthStore((state) => state.user);

  const query = useQuery<EmployeeProfile>({
    queryKey: ['employee', 'me'],
    queryFn: async () => {
      const response = await get<EmployeeProfile>('/employee/me');
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
