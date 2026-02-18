import { create } from 'zustand';
import keycloak from '../config/keycloak';
import type { KeycloakProfile } from 'keycloak-js';
import type { AccountInfo } from '@/@types/Account';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: KeycloakProfile | AccountInfo | null;
  token: string | null;
  // Actions - ฟังก์ชัน
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  initKeycloak: () => Promise<void>;
}

// สร้าง Zustand Store สำหรับจัดการ Authentication
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,

  // เริ่มต้น Keycloak
  initKeycloak: async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      set({ isAuthenticated: authenticated });

      if (authenticated) {
        set({ token: keycloak.token || null });

        // โหลดข้อมูลผู้ใช้
        try {
          const profile = await keycloak.loadUserProfile();
          set({
            user: {
              id: profile.id || '',
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
    
            },
          });
        } catch (error) {
          console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', error);
        }
      }

      // ตั้งค่า event handlers
      keycloak.onTokenExpired = () => {
        keycloak
          .updateToken(30)
          .then((refreshed) => {
            if (refreshed) {
              set({ token: keycloak.token || null });
              console.log('รีเฟรช Token สำเร็จ');
            }
          })
          .catch(() => {
            console.error('รีเฟรช Token ไม่สำเร็จ');
            set({ isAuthenticated: false, user: null, token: null });
          });
      };

      keycloak.onAuthSuccess = async () => {
        set({ isAuthenticated: true, token: keycloak.token || null });
        try {
          const profile = await keycloak.loadUserProfile();
          set({
            user: {
              id: profile.id || '',
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
            },
          });
        } catch (error) {
          console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', error);
        }
      };

      keycloak.onAuthLogout = () => {
        set({ isAuthenticated: false, user: null, token: null });
      };
    } catch (error) {
      console.error('เริ่มต้น Keycloak ไม่สำเร็จ:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // เข้าสู่ระบบ
  login: () => {
    keycloak.login();
  },

  // ออกจากระบบ
  logout: () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  },

  // รีเฟรช Token
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        set({ token: keycloak.token || null });
      }
      return refreshed;
    } catch (error) {
      console.error('รีเฟรช Token ไม่สำเร็จ:', error);
      return false;
    }
  },
}));

// Export hook alias สำหรับใช้งานง่ายขึ้น
export const useAuth = useAuthStore;

export default useAuthStore;
