import { API_URL } from '@/lib/config';
import { getAuthToken } from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  latest_status: string | null;
  latest_product_id: number | null;
  latest_variant_id: number | null;
  latest_subscription_id: number | null;
  latest_renewal_date: string | null;
  latest_end_date: string | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const headers = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  const { page = 1, limit = 20, search = '' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
  });

  const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
    headers: headers(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch users');
  }

  const data = await response.json();
  
  // Ensure consistent data structure
  return {
    users: (data.users || []).map((user: User) => ({
      ...user,
      latest_status: user.latest_status || null,
      latest_product_id: user.latest_product_id || null,
      latest_variant_id: user.latest_variant_id || null,
      latest_subscription_id: user.latest_subscription_id || null,
      latest_renewal_date: user.latest_renewal_date || null,
      latest_end_date: user.latest_end_date || null,
    })),
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 20,
  };
};