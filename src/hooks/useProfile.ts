import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useKeycloak } from '@react-keycloak/web';
import apiClient from '@/lib/apiClient';
import useAuthStore from '@/stores/authStore';
import type { AccountInfo } from '@/@types/Account';
import type { KeycloakProfile } from 'keycloak-js';

/**
 * Hook สำหรับจัดการ profile ทั้งหมด
 * - โหลด Keycloak profile (รวม fallback tokenParsed)
 * - ดึงข้อมูล employee/me
 * - อัปเดต store โดยอัตโนมัติ
 */
export const useProfile = () => {
  const { keycloak } = useKeycloak();
  const { user: profile, setKeycloakProfile, setAccountInfo } = useAuthStore();
  const profileLoadedRef = useRef(false);

  // Load Keycloak profile once from tokenParsed
  useEffect(() => {
    if (
      !keycloak.authenticated ||
      profileLoadedRef.current ||
      profile?.username
    )
      return;

    const tp = keycloak.tokenParsed as Record<string, unknown> | undefined;
    if (tp) {
      const profileFromToken: KeycloakProfile = {
        id: typeof tp.sub === 'string' ? tp.sub : undefined,
        username:
          typeof tp.preferred_username === 'string'
            ? tp.preferred_username
            : undefined,
        email: typeof tp.email === 'string' ? tp.email : undefined,
        firstName:
          typeof tp.given_name === 'string' ? tp.given_name : undefined,
        lastName:
          typeof tp.family_name === 'string' ? tp.family_name : undefined,
      };
      setKeycloakProfile(profileFromToken);
      profileLoadedRef.current = true;
    }
  }, [keycloak, profile?.username, setKeycloakProfile]);

  // Query employee data with auto-update store
  const { data, isLoading, error, refetch } = useQuery<AccountInfo>({
    queryKey: ['employee', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<AccountInfo>('/employee/me');
      return response.data;
    },
    enabled: keycloak.authenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      // Auto-merge into store when data arrives
      setAccountInfo(data);
      return data;
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    checkInTime: data?.check_in ?? null,
    checkOutTime: data?.check_out ?? null,
  };
};
