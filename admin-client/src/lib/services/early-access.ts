import { API_URL } from '@/lib/config';
import { getAuthToken } from './auth';

/**
 * Represents an early access registration entry
 */
export interface EarlyAccess {
  id: number;
  email: string;
  referrer: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for the response from the early access API
 */
export interface GetEarlyAccessResponse {
  registrations: EarlyAccess[];
}

/**
 * Creates headers with authentication for API requests
 */
const headers = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

/**
 * Fetches all early access registrations from the API
 * @returns Promise containing the list of early access registrations
 */
export const getEarlyAccessRegistrations = async (): Promise<EarlyAccess[]> => {
  const response = await fetch(`${API_URL}/admin/early-access`, {
    headers: headers(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch early access registrations');
  }

  const data = await response.json();
  
  // Return the registrations with consistent structure
  return data || [];
}; 