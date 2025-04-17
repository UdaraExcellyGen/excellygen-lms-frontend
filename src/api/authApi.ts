import apiClient from './apiClient';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  currentRole: string;
}

interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  token: TokenResponse;
}

interface SelectRoleRequest {
  userId: string;
  role: string;
  accessToken: string;
}

// Login with Firebase and then exchange Firebase token for JWT
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log("Starting login process");
    
    // First authenticate with Firebase
    const firebaseAuth = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    
    console.log("Firebase authentication successful");
    
    // Get Firebase ID token
    const firebaseToken = await firebaseAuth.user.getIdToken();
    console.log(`Firebase token (first 20 chars): ${firebaseToken.substring(0, 20)}...`);
    
    // Exchange Firebase token for our application JWT
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      firebaseToken: firebaseToken
    });
    
    console.log("JWT token received from backend");
    
    // Store auth data
    localStorage.setItem('access_token', response.data.token.accessToken);
    localStorage.setItem('refresh_token', response.data.token.refreshToken);
    localStorage.setItem('token_expiry', response.data.token.expiresAt);
    localStorage.setItem('current_role', response.data.token.currentRole);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.userId,
      name: response.data.name,
      email: response.data.email,
      roles: response.data.roles
    }));
    
    console.log("Login data stored in localStorage");
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout from both Firebase and backend
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      await apiClient.post('/auth/revoke-token', JSON.stringify(refreshToken));
    }
    
    // Sign out from Firebase
    await auth.signOut();
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('current_role');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear local storage even if API call fails
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('current_role');
    localStorage.removeItem('user');
    
    throw error;
  }
};

// Select role for users with multiple roles
export const selectRole = async (role: string): Promise<TokenResponse> => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = localStorage.getItem('access_token');
    
    if (!user.id || !accessToken) {
      throw new Error('User not authenticated');
    }
    
    const request: SelectRoleRequest = {
      userId: user.id,
      role,
      accessToken
    };
    
    const response = await apiClient.post<TokenResponse>('/auth/select-role', request);
    
    // Update stored tokens
    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    localStorage.setItem('token_expiry', response.data.expiresAt);
    localStorage.setItem('current_role', response.data.currentRole);
    
    return response.data;
  } catch (error) {
    console.error('Role selection error:', error);
    throw error;
  }
};

// Reset password using Firebase
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // Firebase password reset
    await sendPasswordResetEmail(auth, email);
    
    // Also notify our backend
    await apiClient.post('/auth/reset-password', { email });
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Refresh token
export const refreshToken = async (): Promise<TokenResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken || !refreshToken) {
      throw new Error('No tokens available');
    }
    
    const response = await apiClient.post<TokenResponse>('/auth/refresh-token', {
      accessToken,
      refreshToken
    });
    
    // Update stored tokens
    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    localStorage.setItem('token_expiry', response.data.expiresAt);
    localStorage.setItem('current_role', response.data.currentRole);
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Check if token is valid
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ isValid: boolean }>(`/auth/validate-token?token=${token}`);
    return response.data.isValid;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};