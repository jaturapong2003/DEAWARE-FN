import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AccountInfo } from '@/@types/Account';
import type { KeycloakProfile } from 'keycloak-js';

// unified user type combining both data sources
type User = Partial<AccountInfo> & Partial<KeycloakProfile>;

interface AuthState {
  user: User | null;
  setKeycloakProfile: (profile: KeycloakProfile) => void;
  setAccountInfo: (info: AccountInfo) => void;
  clearUser: () => void;
}

// สร้าง Zustand Store พร้อม devtools, persist, และ immer
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,

        // ตั้งค่าข้อมูลจาก Keycloak profile
        setKeycloakProfile: (profile: KeycloakProfile) => {
          set((draft) => {
            if (!draft.user) draft.user = {};
            Object.assign(draft.user, {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              user_name: profile.username,
              display_name:
                `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
                profile.username,
            });
          });
        },

        // รวมข้อมูล AccountInfo เข้ากับ user ที่มีอยู่
        setAccountInfo: (info: AccountInfo) => {
          set((draft) => {
            if (!draft.user) draft.user = {};
            Object.assign(draft.user, info);
          });
        },

        // ล้างข้อมูลผู้ใช้
        clearUser: () => {
          set((draft) => {
            draft.user = null;
          });
        },
      })),
      {
        name: 'auth-storage', // ชื่อ key ใน localStorage
        partialize: (state) => ({ user: state.user }), // บันทึกเฉพาะ user
      }
    ),
    { name: 'AuthStore' } // ชื่อใน Redux DevTools
  )
);

export default useAuthStore;
