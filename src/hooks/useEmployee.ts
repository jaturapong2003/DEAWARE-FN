import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AccountInfo, CreateAccount } from '@/@types/Account';
import apiClient from '@/lib/apiClient';

export type CreateEmployeePayload = {
  username: string;
  password: string;
  email?: string;
  fname: string;
  lname?: string;
  phone_number?: string;
  position?: string;
};

type ApiError = {
  response?: {
    data?: Record<string, unknown>;
  };
  message?: string;
};

export const extractApiErrorMessage = (err: unknown): string => {
  const e = err as ApiError;
  const resp = e.response?.data;

  if (resp && typeof resp === 'object') {
    const maybe = (resp.error ?? resp.message) as unknown;
    if (typeof maybe === 'string' && maybe.trim()) return maybe;
    if (maybe !== undefined) return String(maybe);
  }

  if (typeof e.message === 'string' && e.message.trim()) {
    const jsonStart = e.message.indexOf('{');
    if (jsonStart !== -1) {
      const jsonPart = e.message.slice(jsonStart);
      try {
        const parsed = JSON.parse(jsonPart) as Record<string, unknown>;
        if (typeof parsed.error === 'string' && parsed.error.trim()) {
          return parsed.error;
        }
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
          return parsed.message;
        }
        const values = Object.values(parsed).filter(
          (value) => typeof value === 'string'
        ) as string[];
        if (values.length > 0) return values.join(', ');
      } catch {
        // ignore parse error and fallback to raw message
      }
    }

    return e.message;
  }

  return 'เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์';
};

export const mapCreateAccountToPayload = (
  account: CreateAccount
): CreateEmployeePayload => ({
  username: account.username,
  password: account.password,
  email: account.email,
  fname: account.fname,
  lname: account.lname || '',
  phone_number: account.phone || '',
  position: account.position || '',
});

export const createEmployeeRequest = async (
  payload: CreateEmployeePayload
): Promise<Record<string, unknown>> => {
  const response = await apiClient.post<Record<string, unknown>>(
    '/employee/create',
    payload
  );
  return response.data;
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Record<string, unknown>,
    unknown,
    CreateEmployeePayload
  >({
    mutationFn: createEmployeeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    createEmployee: mutation.mutateAsync,
    creatingEmployee: mutation.isPending,
    createEmployeeError: mutation.error
      ? extractApiErrorMessage(mutation.error)
      : null,
  };
};

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
