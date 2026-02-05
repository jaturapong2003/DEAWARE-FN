import { create } from 'zustand';
import keycloak from '../config/keycloak';

// Types
interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  // Actions
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  initKeycloak: () => Promise<void>;
}

// Create Zustand Store
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,

  // Initialize Keycloak
  initKeycloak: async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      set({ isAuthenticated: authenticated });

      if (authenticated) {
        set({ token: keycloak.token || null });
        
        // Load user profile
        try {
          const profile = await keycloak.loadUserProfile();
          set({
            user: {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
            },
          });
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      }

      // Setup event handlers
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            set({ token: keycloak.token || null });
            console.log('Token refreshed');
          }
        }).catch(() => {
          console.error('Failed to refresh token');
          set({ isAuthenticated: false, user: null, token: null });
        });
      };

      keycloak.onAuthSuccess = async () => {
        set({ isAuthenticated: true, token: keycloak.token || null });
        try {
          const profile = await keycloak.loadUserProfile();
          set({
            user: {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
            },
          });
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      };

      keycloak.onAuthLogout = () => {
        set({ isAuthenticated: false, user: null, token: null });
      };

    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // Login
  login: () => {
    keycloak.login();
  },

  // Logout
  logout: () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  },

  // Refresh token
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        set({ token: keycloak.token || null });
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  },
}));

// Export hook alias for easier migration
export const useAuth = useAuthStore;

export default useAuthStore;
