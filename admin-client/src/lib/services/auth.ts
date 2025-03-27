import { API_URL } from '@/lib/config';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
}

let isLoggingIn = false;

export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  if (isLoggingIn) {
    throw new Error('Login request already in progress');
  }

  try {
    isLoggingIn = true;
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  } finally {
    isLoggingIn = false;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('admin_token');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Basic JWT expiration check
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}; 