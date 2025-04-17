import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  selectRole as apiSelectRole, 
  resetPassword as apiResetPassword,
  validateToken
} from '../api/authApi';
import { User, UserRole, AuthState, TokenData } from '../types/auth.types';

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AUTH_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'token_expiry';
const CURRENT_ROLE_STORAGE_KEY = 'current_role';

const initialState: AuthState = {
  user: null,
  currentRole: null,
  loading: false,
  initialized: false,
  error: null
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const currentRole = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY);

        if (storedUser && token && currentRole) {
          // Validate token
          const isValid = await validateToken(token);
          
          if (isValid) {
            const user = JSON.parse(storedUser) as User;
            setState({
              ...state,
              user,
              currentRole: currentRole as UserRole,
              initialized: true
            });
            
            // Navigate to appropriate dashboard based on role
            if (window.location.pathname === '/' || window.location.pathname === '/role-selection') {
              navigateByRole(currentRole as UserRole);
            }
          } else {
            // Token is invalid, clear everything
            resetAuthState();
            setState({
              ...initialState,
              initialized: true
            });
          }
        } else {
          setState({
            ...initialState,
            initialized: true
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        resetAuthState();
        setState({
          ...initialState,
          initialized: true,
          error: 'Failed to initialize authentication'
        });
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAuthState = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ROLE_STORAGE_KEY);
  };

  const navigateByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        navigate('/admin/dashboard');
        break;
      case UserRole.Learner:
        navigate('/learner/dashboard');
        break;
      case UserRole.CourseCoordinator:
        navigate('/coordinator/dashboard');
        break;
      case UserRole.ProjectManager:
        navigate('/project-manager/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const login = async (email: string, password: string) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      const authResponse = await apiLogin({ email, password });
      
      const { userId, name, email: userEmail, roles, token } = authResponse;
      
      const user: User = {
        id: userId,
        name,
        email: userEmail,
        roles: roles as UserRole[]
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      
      setState({
        ...state,
        user,
        currentRole: token.currentRole as UserRole,
        loading: false
      });

      toast.success('Login successful!');
      
      // Handle role selection for users with multiple roles
      if (roles.length > 1) {
        navigate('/role-selection');
      } else {
        navigateByRole(token.currentRole as UserRole);
      }
    } catch (error) {
      console.error('Login error:', error);
      setState({
        ...state,
        loading: false,
        error: 'Invalid email or password'
      });
      toast.error('Invalid email or password');
    }
  };

  const logout = async () => {
    setState({ ...state, loading: true });
    
    try {
      await apiLogout();
      resetAuthState();
      
      setState({
        ...initialState,
        initialized: true
      });
      
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
      
      // Still reset the state even if the API call fails
      resetAuthState();
      setState({
        ...initialState,
        initialized: true
      });
      
      navigate('/');
    }
  };

  const selectRole = async (role: UserRole) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      if (!state.user) {
        throw new Error('User not authenticated');
      }
      
      const tokenData = await apiSelectRole(role);
      
      setState({
        ...state,
        currentRole: tokenData.currentRole as UserRole,
        loading: false
      });
      
      toast.success(`Switched to ${role} role`);
      navigateByRole(role);
    } catch (error) {
      console.error('Role selection error:', error);
      setState({
        ...state,
        loading: false,
        error: 'Failed to select role'
      });
      toast.error('Failed to select role');
    }
  };

  const resetPassword = async (email: string) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      await apiResetPassword(email);
      setState({ ...state, loading: false });
    } catch (error) {
      console.error('Password reset error:', error);
      setState({
        ...state,
        loading: false,
        error: 'Failed to send password reset email'
      });
      toast.error('Failed to send password reset email');
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
        resetPassword
      }}
    >
      {children}
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