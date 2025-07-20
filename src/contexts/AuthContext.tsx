import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  selectRole as apiSelectRole, 
  resetPassword as apiResetPassword,
  changePassword as apiChangePassword,
  heartbeat
} from '../api/authApi';
import { User, UserRole, AuthState } from '../types/auth.types';
import PasswordChangeModal from '../features/auth/PasswordChangeModal';
import ActivityTracker from '../api/services/ActivityTracker';
import SessionService from '../api/services/SessionService';

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  navigateToRoleSelection: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AUTH_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'token_expiry';
const CURRENT_ROLE_STORAGE_KEY = 'current_role';
const REQUIRE_PASSWORD_CHANGE_KEY = 'require_password_change';

const initialState: AuthState = {
  user: null,
  currentRole: null,
  loading: false,
  initialized: false,
  error: null,
  requirePasswordChange: false
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<AuthState>(initialState);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const sessionService = useRef(SessionService.getInstance());

  const resetAuthState = useCallback(() => {
    sessionService.current.stopSessionManager();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ROLE_STORAGE_KEY);
    localStorage.removeItem('userId');
    localStorage.removeItem(REQUIRE_PASSWORD_CHANGE_KEY);
  }, []);

  const navigateToRoleSelection = useCallback(() => {
    navigate('/role-selection');
  }, [navigate]);

  const navigateByRole = useCallback((role: UserRole) => {
    const rolePaths: Record<string, string> = {
      Admin: '/admin/dashboard',
      Learner: '/learner/dashboard',
      CourseCoordinator: '/coordinator/dashboard',
      ProjectManager: '/project-manager/dashboard',
    };
    const targetPath = rolePaths[role] || '/';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const currentRole = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY);
        const requirePasswordChange = localStorage.getItem(REQUIRE_PASSWORD_CHANGE_KEY) === 'true';

        if (storedUser && token && currentRole) {
          const user = JSON.parse(storedUser) as User;
          setState({
            user,
            currentRole: currentRole as UserRole,
            loading: false,
            initialized: true,
            error: null,
            requirePasswordChange
          });
          
          sessionService.current.startSessionManager();
          
          if (requirePasswordChange) {
            setShowPasswordChangeModal(true);
          } else {
            const isOnPublicPage = location.pathname === '/' || location.pathname === '/login';
            if (isOnPublicPage) {
              navigateByRole(currentRole as UserRole);
            }
          }
        } else {
          setState({ ...initialState, initialized: true });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        resetAuthState();
        setState({ ...initialState, initialized: true, error: 'Failed to initialize authentication' });
      }
    };

    initAuth();
    
    return () => sessionService.current.stopSessionManager();
  }, [resetAuthState, navigateByRole]);

  useEffect(() => {
    const handleAuthExpired = () => {
      resetAuthState();
      setState({ ...initialState, initialized: true, error: 'Session expired. Please login again.' });
      toast.error('Your session has expired. Please login again.');
      navigate('/');
    };
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY && !event.newValue) {
        resetAuthState();
        setState({ ...initialState, initialized: true });
        navigate('/');
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('auth:expired', handleAuthExpired);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [resetAuthState, navigate]);

  const login = async (email: string, password: string) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    try {
      const authResponse = await apiLogin({ email, password });
      const { userId, name, email: userEmail, roles, token, requirePasswordChange } = authResponse;
      const user: User = { id: userId, name, email: userEmail, roles: roles as UserRole[] };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, token.expiresAt);
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, token.currentRole);
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, requirePasswordChange.toString());
      localStorage.setItem('userId', userId);

      setState({ user, currentRole: token.currentRole as UserRole, loading: false, error: null, requirePasswordChange, initialized: true });
      
      sessionService.current.startSessionManager();
      
      toast.success('Login successful!');
      if (requirePasswordChange) {
        setShowPasswordChangeModal(true);
      } else {
        if (roles.length === 1) {
          navigateByRole(roles[0] as UserRole);
        } else {
          navigate('/role-selection');
        }
      }
    } catch (error) {
      setState(prevState => ({ ...prevState, loading: false, error: 'Invalid email or password' }));
      toast.error('Invalid email or password');
    }
  };

  const logout = async () => {
    setState(prevState => ({ ...prevState, loading: true }));
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed, proceeding with client-side logout:', error);
    } finally {
      resetAuthState();
      setState({ ...initialState, initialized: true });
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  const selectRole = async (role: UserRole) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    try {
      const { user } = state;
      if (!user) throw new Error('User not authenticated');
      
      const tokenData = await apiSelectRole(role);
      
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, tokenData.expiresAt);
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, tokenData.currentRole);
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, tokenData.requirePasswordChange.toString());

      setState(prevState => ({
        ...prevState,
        currentRole: tokenData.currentRole as UserRole,
        loading: false,
        error: null,
        requirePasswordChange: tokenData.requirePasswordChange
      }));
      
      if (tokenData.requirePasswordChange) {
        setShowPasswordChangeModal(true);
      } else {
        toast.success(`Switched to ${role} role`);
        navigateByRole(role);
      }
    } catch (error) {
      setState(prevState => ({ ...prevState, loading: false, error: 'Failed to select role' }));
      toast.error('Failed to select role');
    }
  };

  const resetPassword = async (email: string) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    try {
      await apiResetPassword(email);
      setState(prevState => ({ ...prevState, loading: false }));
    } catch (error) {
      console.error('Password reset error:', error);
      setState(prevState => ({ ...prevState, loading: false, error: 'Failed to send password reset email' }));
      toast.error('Failed to send password reset email');
      throw error;
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsChangingPassword(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');
      
      await apiChangePassword({ userId, currentPassword, newPassword });
      
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, 'false');
      
      setState(prevState => ({ ...prevState, requirePasswordChange: false }));
      
      setShowPasswordChangeModal(false);
      setIsChangingPassword(false);
      
      toast.success('Password changed successfully');
      
      const { user } = state;
      if (user && user.roles.length === 1) {
        navigateByRole(user.roles[0]);
      } else {
        navigateToRoleSelection();
      }
    } catch (error) {
      console.error('Password change error:', error);
      setIsChangingPassword(false);
      toast.error('Failed to change password. Please check your current password and try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        selectRole,
        resetPassword,
        navigateToRoleSelection,
        changePassword
      }}
    >
      {children}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => !state.requirePasswordChange && setShowPasswordChangeModal(false)}
        onSubmit={changePassword}
        isSubmitting={isChangingPassword}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};