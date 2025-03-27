'use client';

import { useEffect, useState } from 'react';
import { getPageViewStats, type PageViewStats, type DailyStats, type ReferrerStats } from '@/lib/services/analytics';
import Loading from '@/components/ui/loading';
import Error from '@/components/ui/error';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatDate } from '@/lib/utils/format';

// Date range options
const DATE_RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
] as const;

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageStats, setPageStats] = useState<PageViewStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniquePaths, setUniquePaths] = useState(0);
  const [selectedRange, setSelectedRange] = useState<number>(7);

  const fetchStats = async (days: number) => {
    try {
      setLoading(true);
      setError('');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const data = await getPageViewStats(startDate.toISOString(), endDate.toISOString());
      
      // Validate and set data with defaults
      setPageStats(data?.pageStats || []);
      setDailyStats(data?.dailyStats || []);
      setReferrerStats(data?.referrerStats || []);
      setTotalViews(data?.totalViews || 0);
      setUniquePaths(data?.uniquePaths || 0);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedRange);
  }, [selectedRange]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  // Check if we have any data at all
  const hasData = totalViews > 0 || pageStats.length > 0 || dailyStats.length > 0;
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome to your admin dashboard.
          </p>
        </div>
        <EmptyState message="No analytics data available for the selected time period. Start tracking page views to see statistics here." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome to your admin dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="dateRange" className="text-sm font-medium text-gray-700">
            Time Period
          </label>
          <select
            id="dateRange"
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchStats(selectedRange)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Page Views</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalViews.toLocaleString()}</dd>
            <p className="mt-2 text-sm text-gray-500">Last {selectedRange} days</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Unique Pages</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{uniquePaths.toLocaleString()}</dd>
            <p className="mt-2 text-sm text-gray-500">Last {selectedRange} days</p>
          </div>
        </div>
      </div>

      {/* Daily Traffic Graph */}
      {dailyStats.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Daily Traffic (Last {selectedRange} Days)
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => formatDate(date)}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value: number) => [value.toLocaleString(), 'Views']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#4F46E5" 
                    fill="#4F46E5" 
                    fillOpacity={0.1} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="No daily traffic data available for the selected time period." />
      )}

      {/* Referrer Statistics */}
      {referrerStats.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Traffic Sources (Last {selectedRange} Days)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrerStats
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10) // Show top 10 referrers
                    .map((stat, index) => {
                      const totalViews = referrerStats.reduce((sum, item) => sum + item.count, 0);
                      const percentage = totalViews > 0 ? (stat.count / totalViews * 100).toFixed(1) : '0';
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {stat.referrer === 'direct' || !stat.referrer ? 'Direct / Unknown' : stat.referrer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">{percentage}%</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="No referrer data available for the selected time period." />
      )}

      {/* Popular Pages Graph */}
      {pageStats.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Popular Pages (Last {selectedRange} Days)
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pageStats.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="path" 
                    type="category" 
                    width={150}
                    tickFormatter={(path) => path || 'Unknown Page'}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Views']}
                  />
                  <Bar dataKey="view_count" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="No page statistics available for the selected time period." />
      )}

      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Links</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900">Users</h4>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage user accounts
                </p>
                <a
                  href="/users"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Users
                </a>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900">Analytics</h4>
                <p className="mt-1 text-sm text-gray-500">
                  View user and visitor journeys
                </p>
                <a
                  href="/analytics"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Analytics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 