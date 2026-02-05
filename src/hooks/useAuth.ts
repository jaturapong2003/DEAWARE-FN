import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

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

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
