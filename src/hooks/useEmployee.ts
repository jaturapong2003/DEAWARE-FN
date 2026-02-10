import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';

// ประเภทข้อมูลพนักงาน (ตาม API Response จริง)
interface EmployeeProfile {
  auth_user_id: string;
  user_name: string;
  email: string;
  display_name: string;
  phone_number: string;
  position: string;
  url_image: string;  // ชื่อ field จาก API
  face_embedding_count: number;
  has_face_embedding: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook สำหรับดึงข้อมูลพนักงานจาก API
 */
export const useEmployee = () => {
  const { get } = useApi();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลพนักงาน
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<EmployeeProfile>('/employee/me');
      setProfile(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลได้';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
};

export default useEmployee;
