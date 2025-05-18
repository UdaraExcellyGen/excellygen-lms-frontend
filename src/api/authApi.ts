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
  avatar?: string;
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

export interface SendTempPasswordEmailRequest {
  userId: string;
  email: string;
  tempPassword: string;
}

// Login
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  
  
  if (response.data) {
    const userData = {
      id: response.data.userId,
      name: response.data.name,
      email: response.data.email,
      roles: response.data.roles,
      avatar: response.data.avatar 
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Stored user data with avatar:', userData);
  }
  
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
  
  // Save current user data including avatar before role selection
  let avatarUrl = null;
  let userData = null;
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      userData = JSON.parse(userJson);
      avatarUrl = userData.avatar;
      console.log('Preserved avatar URL before role selection:', avatarUrl);
    }
  } catch (e) {
    console.error('Error retrieving avatar before role selection:', e);
  }
  
  const response = await apiClient.post('/auth/select-role', {
    userId,
    role,
    accessToken
  });
  
  // After role selection, restore avatar to user data
  try {
    if (userData && avatarUrl) {
      userData.avatar = avatarUrl;
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Restored avatar URL after role selection:', avatarUrl);
    }
  } catch (e) {
    console.error('Error preserving avatar after role selection:', e);
  }
  
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

// Send temporary password by email
export const sendTemporaryPasswordEmail = async (data: SendTempPasswordEmailRequest): Promise<void> => {
  await apiClient.post('/auth/send-temp-password', data);
};