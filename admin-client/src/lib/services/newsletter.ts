import { API_URL } from '@/lib/config';
import { getAuthToken } from './auth';

/**
 * Represents a newsletter subscription entry
 */
export interface NewsletterSubscription {
  id: number;
  email: string;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Creates headers with authentication for API requests
 */
const headers = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

/**
 * Fetches all newsletter subscriptions from the API
 * @returns Promise containing the list of newsletter subscriptions
 */
export const getNewsletterSubscriptions = async (): Promise<NewsletterSubscription[]> => {
  const response = await fetch(`${API_URL}/admin/newsletter`, {
    headers: headers(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch newsletter subscriptions');
  }

  const data = await response.json();
  
  // Return the subscriptions with consistent structure
  return data || [];
}; 