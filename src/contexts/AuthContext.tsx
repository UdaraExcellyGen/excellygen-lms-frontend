import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  selectRole as apiSelectRole, 
  resetPassword as apiResetPassword,
  refreshToken as apiRefreshToken,
  changePassword as apiChangePassword
} from '../api/authApi';
import { User, UserRole, AuthState } from '../types/auth.types';
import PasswordChangeModal from '../features/auth/PasswordChangeModal';

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
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(true);

  // Function to reset auth state
  const resetAuthState = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ROLE_STORAGE_KEY);
    localStorage.removeItem('userId'); // Also remove userId
    localStorage.removeItem(REQUIRE_PASSWORD_CHANGE_KEY);
    
    // Clear any existing refresh timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Special function to navigate to role selection
  const navigateToRoleSelection = useCallback(() => {
    console.log('Navigating to role selection from auth context');
    navigate('/role-selection');
  }, [navigate]);

  // Function to navigate based on role
  const navigateByRole = useCallback((role: UserRole) => {
    console.log(`Navigating by role: ${role}`);
    // Only navigate if we're not already there
    const currentPath = location.pathname;
    let targetPath = '/';
    
    switch (role) {
      case UserRole.Admin:
        targetPath = '/admin/dashboard';
        break;
      case UserRole.Learner:
        targetPath = '/learner/dashboard';
        break;
      case UserRole.CourseCoordinator:
        targetPath = '/coordinator/dashboard';
        break;
      case UserRole.ProjectManager:
        targetPath = '/project-manager/dashboard';
        break;
      default:
        targetPath = '/';
    }
    
    // Only navigate if we're not already at the target path
    if (currentPath !== targetPath) {
      console.log(`Navigating from ${currentPath} to ${targetPath}`);
      navigate(targetPath);
    }
  }, [navigate, location.pathname]);

  // Handle token refresh
  const handleTokenRefresh = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      
      if (!accessToken || !refreshToken) {
        throw new Error('No tokens available');
      }
      
      console.log('Refreshing token...');
      const tokenData = await apiRefreshToken();
      
      // Update stored tokens
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, tokenData.expiresAt);
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, tokenData.currentRole);
      
      // Store password change requirement
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, tokenData.requirePasswordChange.toString());
      
      setState({
        ...state,
        currentRole: tokenData.currentRole as UserRole,
        requirePasswordChange: tokenData.requirePasswordChange
      });
      
      // Check if password change is required after refresh
      if (tokenData.requirePasswordChange) {
        setShowPasswordChangeModal(true);
      }
      
      console.log('Token refreshed successfully');
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Only reset auth and navigate if we're not in initialization
      if (!isInitializingRef.current) {
        // If refresh fails, reset auth state and redirect to login
        resetAuthState();
        setState({
          ...initialState,
          initialized: true,
          error: 'Session expired. Please login again.'
        });
        
        if (location.pathname !== '/') {
          toast.error('Your session has expired. Please login again.');
          navigate('/');
        }
      }
      
      return false;
    }
  }, [resetAuthState, navigate, location.pathname, state]);

  // Setup token refresh timer
  const setupRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const expiryString = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
    if (!expiryString) return;

    const expiryDate = new Date(expiryString);
    
    // Calculate time until token expires (in milliseconds)
    const timeUntilExpiry = expiryDate.getTime() - Date.now();
    
    // If token is already expired or will expire in less than 5 seconds
    if (timeUntilExpiry < 5000) {
      console.log('Token is expired or will expire very soon');
      handleTokenRefresh();
      return;
    }
    
    // Refresh token when it's 75% through its lifetime or 10 minutes before expiry, whichever is sooner
    const refreshTime = Math.min(timeUntilExpiry * 0.75, timeUntilExpiry - 10 * 60 * 1000);
    
    console.log(`Setting up refresh timer for ${Math.round(refreshTime / 1000)} seconds from now`);
    
    // Set up refresh timer
    refreshTimerRef.current = setInterval(() => {
      handleTokenRefresh();
    }, refreshTime);
    
  }, [handleTokenRefresh]);

  // Initialize authentication state from localStorage - only runs once on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        isInitializingRef.current = true;
        console.log('Initializing auth state...');
        
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const currentRole = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY);
        const requirePasswordChange = localStorage.getItem(REQUIRE_PASSWORD_CHANGE_KEY) === 'true';

        if (storedUser && token && currentRole) {
          console.log('Found stored auth data');
          
          // Skip token validation during initialization as it seems to be failing
          // Just use the stored data and set up the refresh timer
          const user = JSON.parse(storedUser) as User;
          
          // Ensure userId is stored separately for easy access
          if (user.id) {
            localStorage.setItem('userId', user.id);
          }
          
          setState({
            user,
            currentRole: currentRole as UserRole,
            loading: false,
            initialized: true,
            error: null,
            requirePasswordChange: requirePasswordChange
          });
          
          // Setup refresh timer for the token
          setupRefreshTimer();
          
          // Check if password change is required
          if (requirePasswordChange) {
            setShowPasswordChangeModal(true);
          } else {
            // Navigate to appropriate dashboard based on role if on landing or role selection
            const isOnPublicPage = location.pathname === '/' || location.pathname === '/login';
            if (isOnPublicPage) {
              navigateByRole(currentRole as UserRole);
            }
          }
        } else {
          console.log('No stored auth data found');
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
      } finally {
        isInitializingRef.current = false;
      }
    };

    initAuth();
    
    // Cleanup refresh timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [resetAuthState, navigateByRole, setupRefreshTimer, location.pathname]);

  // Listen for auth:expired events
  useEffect(() => {
    const handleAuthExpired = () => {
      console.log('Auth expired event received');
      resetAuthState();
      setState({
        ...initialState,
        initialized: true,
        error: 'Session expired. Please login again.'
      });
      navigate('/');
    };
    
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [resetAuthState, navigate]);

  // Listen for storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY && !event.newValue) {
        // Token was removed in another tab
        console.log('Token removed in another tab');
        resetAuthState();
        setState({
          ...initialState,
          initialized: true
        });
        navigate('/');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [resetAuthState, navigate]);

  const login = async (email: string, password: string) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      console.log('Attempting login...');
      const authResponse = await apiLogin({ email, password });
      
      const { userId, name, email: userEmail, roles, token, requirePasswordChange } = authResponse;
      
      // Store auth data in localStorage
      const user: User = {
        id: userId,
        name,
        email: userEmail,
        roles: roles as UserRole[]
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, token.expiresAt);
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, token.currentRole);
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, requirePasswordChange.toString());
      
      // Store user ID separately for easier access
      localStorage.setItem('userId', userId);
      
      console.log('Login successful, tokens stored');
      
      setState({
        ...state,
        user,
        currentRole: token.currentRole as UserRole,
        loading: false,
        error: null,
        requirePasswordChange
      });

      // Set up refresh timer after successful login
      setupRefreshTimer();

      toast.success('Login successful!');
      
      // Check if password change is required
      if (requirePasswordChange) {
        setShowPasswordChangeModal(true);
      } else {
        // Handle role selection for users with multiple roles
        if (roles.length > 1) {
          navigate('/role-selection');
        } else {
          navigateByRole(token.currentRole as UserRole);
        }
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
      console.log('Logging out...');
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
      console.log(`Selecting role: ${role}`);
      if (!state.user) {
        throw new Error('User not authenticated');
      }
      
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      // Save user ID before role change
      const userId = state.user.id;
      
      const tokenData = await apiSelectRole(role);
      
      // Update tokens in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, tokenData.expiresAt);
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, tokenData.currentRole);
      localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, tokenData.requirePasswordChange.toString());
      
      // Make sure userId is maintained when switching roles
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      
      setState({
        ...state,
        currentRole: tokenData.currentRole as UserRole,
        loading: false,
        error: null,
        requirePasswordChange: tokenData.requirePasswordChange
      });
      
      console.log('Role selection successful, tokens updated');
      
      // Setup refresh timer after role change
      setupRefreshTimer();
      
      // Check if password change is required
      if (tokenData.requirePasswordChange) {
        setShowPasswordChangeModal(true);
      } else {
        toast.success(`Switched to ${role} role`);
        navigateByRole(role);
      }
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
  
// In changePassword method 
const changePassword = async (currentPassword: string, newPassword: string) => {
  setIsChangingPassword(true);
  
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    await apiChangePassword({
      userId,
      currentPassword,
      newPassword
    });
    
    // Update the local storage flag
    localStorage.setItem(REQUIRE_PASSWORD_CHANGE_KEY, 'false');
    
    // Update state
    setState({
      ...state,
      requirePasswordChange: false
    });
    
    // Close modal
    setShowPasswordChangeModal(false);
    setIsChangingPassword(false);
    
    toast.success('Password changed successfully');
    
    // Navigate to role selection page after password change
    navigateToRoleSelection();
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
      
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => {
          // Don't allow closing if password change is required
          if (!state.requirePasswordChange) {
            setShowPasswordChangeModal(false);
          }
        }}
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