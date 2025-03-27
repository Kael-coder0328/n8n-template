/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
}

export interface VerifyUserResponse {
  status: string;
  product_id: number;
  variant_id: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface GoogleAuthCredentials {
  accessToken: string;
  idToken: string;
  user: {
    email: string;
    name: string;
  };
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Track refresh attempts and retry status
let refreshAttempts = 0;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
const MAX_REFRESH_ATTEMPTS = 5;

// Subscribe to token refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Notify subscribers about new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Intercept responses to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('[Auth] API Error intercepted:', { status: error.response?.status, url: originalRequest.url });

    // Check if error is due to unauthorized access (401) and request hasn't been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      console.log('[Auth] Request failed - not an auth issue or already retried');
      return Promise.reject(error);
    }

    // Check refresh attempts
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.log('[Auth] Maximum refresh attempts reached');
      return Promise.reject(new Error('Maximum refresh attempts reached'));
    }

    // If already refreshing, wait for the token
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers['X-CSRF-Token'] = token;
          }
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    refreshAttempts++;

    try {
      // Get CSRF token from cookie
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
      
      if (!csrfToken) {
        console.log('[Auth] No CSRF token found');
        throw new Error('No CSRF token found');
      }
      
      // Attempt to refresh the token with CSRF token
      await api.post('/auth/refresh', {}, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      console.log('[Auth] Token refresh successful');
      
      // Reset refresh attempts on successful refresh
      refreshAttempts = 0;
      
      // Get updated CSRF token from cookies if present
      const newCsrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
      if (newCsrfToken && newCsrfToken !== csrfToken) {
        console.log('[Auth] Updated CSRF token from response cookies');
        onRefreshed(newCsrfToken);
      } else {
        onRefreshed(csrfToken);
      }
      
      // Retry original request
      console.log('[Auth] Retrying original request');
      isRefreshing = false;
      return api(originalRequest);
    } catch (refreshError) {
      console.log('[Auth] Token refresh failed, attempts:', refreshAttempts);
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log('[Auth] Maximum refresh attempts reached, redirecting to login');
      }
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);

// Create a closure for request deduplication
const createDedupedRequest = () => {
  const pendingRequests = new Map<string, Promise<any>>();
  let cleanupTimer: NodeJS.Timeout | null = null;

  const cleanup = () => {
    pendingRequests.clear();
    cleanupTimer = null;
  };

  return {
    async execute<T>(
      key: string,
      requestFn: () => Promise<T>,
      options: { timeout?: number } = {}
    ): Promise<T> {
      const existingRequest = pendingRequests.get(key) as Promise<T>;
      if (existingRequest) {
        return existingRequest;
      }

      const promise = requestFn()
        .finally(() => {
          pendingRequests.delete(key);
          // Set cleanup timer
          if (!cleanupTimer) {
            cleanupTimer = setTimeout(cleanup, options.timeout || 1000);
          }
        });

      pendingRequests.set(key, promise);
      return promise;
    }
  };
};

const requestDeduper = createDedupedRequest();

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const key = `login:${JSON.stringify(credentials)}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending login request...');
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        console.log('[Auth] Login response received');
        return response.data;
      }
    );
  },

  async googleLogin(code: string): Promise<AuthResponse> {
    const key = `google:${code}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        const response = await api.post<AuthResponse>('/auth/google', { code });
        return response.data;
      }
    );
  },

  async githubLogin(code: string): Promise<AuthResponse> {
    const key = `github:${code}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        const response = await api.post<AuthResponse>('/auth/github', { code });
        return response.data;
      }
    );
  },

  async register(credentials: LoginCredentials): Promise<AuthResponse> {
    const key = `register:${JSON.stringify(credentials)}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending registration request...');
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        console.log('[Auth] Registration response received');
        return response.data;
      }
    );
  },

  async logout(): Promise<void> {
    const key = 'logout';
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending logout request...');
        await api.post('/auth/logout');
        console.log('[Auth] Logout successful');
      }
    );
  },

  async forgotPassword(email: string): Promise<void> {
    const key = `forgotPassword:${email}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending forgot password request...');
        await api.post('/auth/reset-password/request', { email });
        console.log('[Auth] Forgot password request successful');
      }
    );
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const key = `resetPassword:${token}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending reset password request...');
        await api.post('/auth/reset-password', { token, password });
        console.log('[Auth] Password reset successful');
      }
    );
  },

  async AccountPasswordReset(currentPassword: string, newPassword: string): Promise<void> {
    const key = `accountPasswordReset:${currentPassword}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending reset password request...');
        await api.post('/auth/account-password/reset', { currentPassword, newPassword });
        console.log('[Auth] Password reset successful');
      }
    );
  },

  async checkRefreshToken(): Promise<any> {
    const key = 'checkRefreshToken';
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Checking refresh token status...');
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
        
        if (!csrfToken) {
          console.log('[Auth] No CSRF token found');
          throw new Error('No CSRF token found');
        }
        
        const response = await api.post('/auth/refresh', {}, {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        });
        return response;
      }
    );
  },

  async verifyUser(): Promise<VerifyUserResponse> {
    const key = 'verifyUser';
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Verifying user subscription status...');
        const response = await api.get<VerifyUserResponse>('/user/verify-user');
        console.log('[Auth] User verification response:', response.data);
        return response.data;
      }
    );
  },

  async verifyEmail(token: string): Promise<void> {
    const key = `verifyEmail:${token}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Verifying email with token:', token);
        try {
          const response = await api.post('/auth/verify', { token });
          console.log('[Auth] Email verification response:', response.data);
          console.log('[Auth] Email verification successful');
        } catch (error: any) {
          console.error('[Auth] Email verification failed:', {
            status: error.response?.status,
            data: error.response?.data,
            error: error.message
          });
          throw error;
        }
      }
    );
  },

  async sendVerificationEmail(): Promise<void> {
    const key = 'sendVerificationEmail';
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log('[Auth] Sending verification email...');
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
        
        if (!csrfToken) {
          console.log('[Auth] No CSRF token found');
          throw new Error('No CSRF token found');
        }
        
        await api.post('/auth/verify-email', {}, {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        });
        console.log('[Auth] Verification email sent successfully');
      }
    );
  },

  async get<T = any>(url: string): Promise<T> {
    const key = `get:${url}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log(`[Auth] Sending GET request to ${url}`);
        const response = await api.get<T>(url);
        console.log(`[Auth] GET response received from ${url}`);
        return response.data;
      }
    );
  },

  async post(url: string, data: any) {
    const key = `post:${url}:${JSON.stringify(data)}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log(`[Auth] Sending POST request to ${url}`);
        const response = await api.post(url, data);
        console.log(`[Auth] POST response received from ${url}`);
        return response;
      }
    );
  },

  async put(url: string, data: any) {
    const key = `put:${url}:${JSON.stringify(data)}`;
    
    return requestDeduper.execute(
      key,
      async () => {
        console.log(`[Auth] Sending PUT request to ${url}`);
        const response = await api.put(url, data);
        console.log(`[Auth] PUT response received from ${url}`);
        return response;
      }
    );
  }
};