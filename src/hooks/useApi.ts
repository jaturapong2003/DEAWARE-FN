import { useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import apiClient from '@/lib/apiClient';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

interface UseApiReturn {
  // HTTP methods
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  del: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  
  // เครื่องมือจัดการ Token
  getToken: () => string | undefined;
  getTokenParsed: () => unknown;
  isAuthenticated: boolean;
}

/**
 * Custom hook สำหรับเรียก API พร้อม authentication
 * Token จาก Keycloak จะถูกแนบไปกับ request อัตโนมัติ
 */
export const useApi = (): UseApiReturn => {
  const { keycloak } = useKeycloak();

  const get = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig) => 
      apiClient.get<T>(url, config),
    []
  );

  const post = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(url, data, config),
    []
  );

  const put = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(url, data, config),
    []
  );

  const patch = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.patch<T>(url, data, config),
    []
  );

  const del = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(url, config),
    []
  );

  const getToken = useCallback(() => keycloak.token, [keycloak]);
  
  const getTokenParsed = useCallback(() => keycloak.tokenParsed, [keycloak]);

  return {
    get,
    post,
    put,
    patch,
    del,
    getToken,
    getTokenParsed,
    isAuthenticated: !!keycloak.authenticated,
  };
};

export default useApi;
