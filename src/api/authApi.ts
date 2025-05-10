import apiClient from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
  firebaseToken?: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  currentRole: string;
  requirePasswordChange: boolean;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  token: TokenResponse;
  requirePasswordChange: boolean;
}

export interface SelectRoleRequest {
  userId: string;
  role: string;
  accessToken: string;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// Login
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    await apiClient.post('/auth/revoke-token', JSON.stringify(refreshToken), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Refresh token
export const refreshToken = async (): Promise<TokenResponse> => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!accessToken || !refreshToken) {
    throw new Error('No tokens available');
  }
  
  const response = await apiClient.post('/auth/refresh-token', {
    accessToken,
    refreshToken
  });
  
  return response.data;
};

// Select role
export const selectRole = async (role: string): Promise<TokenResponse> => {
  const userId = localStorage.getItem('userId');
  const accessToken = localStorage.getItem('access_token');
  
  if (!userId || !accessToken) {
    throw new Error('No user ID or access token available');
  }
  
  const response = await apiClient.post('/auth/select-role', {
    userId,
    role,
    accessToken
  });
  
  return response.data;
};

// Reset password (send reset link)
export const resetPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/reset-password', { email });
};

// Change password
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post('/auth/change-password', data);
};

// Validate token
export const validateToken = async (token: string): Promise<boolean> => {
  const response = await apiClient.get('/auth/validate-token', {
    params: { token }
  });
  return response.data.isValid;
};