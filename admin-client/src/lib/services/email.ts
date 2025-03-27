/**
 * Email service for admin client
 * Provides functionality to send emails to users
 */

import { getAuthToken } from './auth';
import { API_URL } from '@/lib/config';

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends an email to a user from the admin interface
 * @param data - Email data including recipient, subject, and body
 * @returns A promise that resolves to the API response
 */
export const sendEmail = async (data: EmailRequest) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/admin/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to send email');
  }
  
  return response.json();
}; 