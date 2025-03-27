import { API_URL } from '@/lib/config';
import { getAuthToken } from './auth';

export interface PageView {
  id: string;
  user_id?: string;
  visitor_id?: string;
  path: string;
  referrer?: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
}

interface APIPageView {
  ID: string;
  UserID?: string;
  VisitorID?: string;
  Path: string;
  Referrer?: string;
  UserAgent: string;
  IPAddress: string;
  CreatedAt: string;
}

const mapPageView = (view: APIPageView): PageView => ({
  id: view.ID,
  user_id: view.UserID,
  visitor_id: view.VisitorID,
  path: view.Path,
  referrer: view.Referrer,
  user_agent: view.UserAgent,
  ip_address: view.IPAddress,
  created_at: view.CreatedAt,
});

export interface JourneyRequest {
  user_id?: string;
  start_time: string;
  end_time: string;
}

export interface AnalyticsStats {
  total_page_views: number;
  unique_visitors: number;
  popular_pages: Array<{
    path: string;
    view_count: number;
  }>;
  visitors_by_day: Array<{
    date: string;
    visitors: number;
  }>;
  referrer_stats: Array<{
    referrer: string;
    count: number;
  }>;
}

export interface PageViewStats {
  path: string;
  view_count: number;
}

export interface DailyStats {
  date: string;
  views: number;
}

export interface ReferrerStats {
  referrer: string;
  count: number;
}

export interface AnalyticsResponse {
  pageStats: PageViewStats[];
  dailyStats: DailyStats[];
  referrerStats: ReferrerStats[];
  totalViews: number;
  uniquePaths: number;
}

const headers = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

export const getUserJourney = async (userId: string, startTime: string, endTime: string): Promise<PageView[]> => {
  const response = await fetch(
    `${API_URL}/admin/analytics/user-journey`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ 
        user_id: userId, 
        start_time: startTime, 
        end_time: endTime 
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch user journey');
  }

  const data: APIPageView[] = await response.json();
  return data.map(mapPageView);
};

export const getVisitorJourney = async (startTime: string, endTime: string): Promise<PageView[]> => {
  const response = await fetch(
    `${API_URL}/admin/analytics/visitor-journey`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ 
        start_time: startTime, 
        end_time: endTime 
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch visitor journeys');
  }

  const data: APIPageView[] = await response.json();
  if (!data) return [];
  
  return data.map(mapPageView);
};

export const getPageViewStats = async (startTime: string, endTime: string): Promise<AnalyticsResponse> => {
  const response = await fetch(
    `${API_URL}/admin/analytics/page-stats`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ 
        start_time: startTime, 
        end_time: endTime 
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch page statistics');
  }

  const data = await response.json();
  return data;
}; 