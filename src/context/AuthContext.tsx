import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import keycloak from '../config/keycloak';

// Types
interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await keycloak.loadUserProfile();
      setUser({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  // Initialize Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        setIsAuthenticated(authenticated);

        if (authenticated) {
          setToken(keycloak.token || null);
          await loadUserProfile();
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();

    // Token refresh handler
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token || null);
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      });
    };

    // Auth success handler
    keycloak.onAuthSuccess = () => {
      setIsAuthenticated(true);
      setToken(keycloak.token || null);
      loadUserProfile();
    };

    // Auth logout handler
    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    };
  }, [loadUserProfile]);

  // Login function
  const login = useCallback(() => {
    keycloak.login();
  }, []);

  // Logout function
  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        setToken(keycloak.token || null);
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
