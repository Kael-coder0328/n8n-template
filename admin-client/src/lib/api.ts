import { getApiUrl } from './config';

/**
 * Interface for API request options
 */
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

/**
 * Make an API request with the current API URL
 * This ensures we always use the latest API URL from localStorage
 */
export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const apiUrl = getApiUrl();
  
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Prepare request options
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: options.credentials || 'include',
  };
  
  // Add body for non-GET requests
  if (options.body && options.method !== 'GET') {
    requestOptions.body = JSON.stringify(options.body);
  }
  
  // Make the request
  const response = await fetch(`${apiUrl}${path}`, requestOptions);
  
  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  // Parse and return the response
  return response.json();
} 