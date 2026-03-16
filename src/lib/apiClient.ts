import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import keycloak from '@/config/keycloak';

// URL ของ API จาก environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// สร้าง Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - แนบ Keycloak token อัตโนมัติ
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // ตรวจสอบว่ามี token หรือไม่
    if (keycloak.token) {
      // ตรวจสอบว่า token หมดอายุหรือจะหมดอายุใน 30 วินาที
      const isTokenExpired = keycloak.isTokenExpired(30);
      
      if (isTokenExpired) {
        try {
          // พยายาม refresh token ใหม่
          await keycloak.updateToken(30);
          console.log('รีเฟรช Token สำเร็จ');
        } catch (error) {
          console.error('ไม่สามารถรีเฟรช Token ได้ กำลังเปลี่ยนเส้นทางไปหน้า login...');
          keycloak.login();
          return Promise.reject(error);
        }
      }
      
      // แนบ token ไปกับ request header
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - จัดการ error ที่เกี่ยวกับ authentication
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // ถ้าได้รับ 401 Unauthorized ให้ลอง refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await keycloak.updateToken(30);
        originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token ไม่สำเร็จ เปลี่ยนเส้นทางไปหน้า login
        console.error('รีเฟรช Token ไม่สำเร็จ กำลังเปลี่ยนเส้นทางไปหน้า login...');
        keycloak.login();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// ฟังก์ชันช่วยสำหรับดึง token (ใช้สำหรับ debug หรือใช้งานภายนอก)
export const getAccessToken = (): string | undefined => keycloak.token;
export const getRefreshToken = (): string | undefined => keycloak.refreshToken;
export const getIdToken = (): string | undefined => keycloak.idToken;
