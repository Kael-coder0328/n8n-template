'use client';

import { useState, useMemo } from 'react';
import { getUserJourney, getVisitorJourney, getPageViewStats, type PageView } from '@/lib/services/analytics';
import Error from '@/components/ui/error';
import { formatDate, formatDuration } from '@/lib/utils/format';

interface JourneyEvent extends PageView {
  isSeparator?: boolean;
  timeSpent?: number;  // in milliseconds
}

interface GroupedJourneys {
  [key: string]: JourneyEvent[];
}

interface JourneyStats {
  totalPages: number;
  uniqueIPs: number;
  averageTimeSpent: number;
  uniquePaths: number;
}

export default function AnalyticsPage() {
  const [searchType, setSearchType] = useState<'user' | 'visitor'>('user');
  const [searchId, setSearchId] = useState('');
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [journeyData, setJourneyData] = useState<JourneyEvent[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'pages'>('time');
  const [filterIP, setFilterIP] = useState('');
  const [filterVisitorId, setFilterVisitorId] = useState('');
  const [referrerStats, setReferrerStats] = useState<{referrer: string, count: number}[]>([]);

  // Calculate journey statistics
  const journeyStats = useMemo((): JourneyStats => {
    if (!journeyData.length) return { totalPages: 0, uniqueIPs: 0, averageTimeSpent: 0, uniquePaths: 0 };

    const nonSeparatorEvents = journeyData.filter(event => !event.isSeparator);
    const uniqueIPs = new Set(nonSeparatorEvents.map(event => event.ip_address)).size;
    const uniquePaths = new Set(nonSeparatorEvents.map(event => event.path)).size;
    const totalTimeSpent = nonSeparatorEvents.reduce((sum, event) => sum + (event.timeSpent || 0), 0);

    return {
      totalPages: nonSeparatorEvents.length,
      uniqueIPs,
      averageTimeSpent: totalTimeSpent / nonSeparatorEvents.length,
      uniquePaths
    };
  }, [journeyData]);

  const calculateTimeSpent = (events: PageView[]): JourneyEvent[] => {
    return events.map((event, index, array) => {
      const nextEvent = array[index + 1];
      const timeSpent = nextEvent 
        ? new Date(nextEvent.created_at).getTime() - new Date(event.created_at).getTime()
        : 0;
      return { ...event, timeSpent };
    });
  };

  const processJourneyData = (data: PageView[] | null) => {
    if (!data || data.length === 0) {
      setJourneyData([]);
      return;
    }

    if (searchType === 'visitor') {
      // Group by visitor_id or IP if visitor_id is not available
      const groupedData = data.reduce<GroupedJourneys>((acc, event) => {
        const key = event.visitor_id || event.ip_address;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(event);
        return acc;
      }, {});

      // Sort and filter groups
      let processedData: JourneyEvent[] = [];
      Object.entries(groupedData).forEach(([key, events]) => {
        if (
          (!filterIP || events.some(e => e.ip_address.includes(filterIP))) &&
          (!filterVisitorId || events.some(e => e.visitor_id?.includes(filterVisitorId)))
        ) {
          // Sort events within each group
          events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const eventsWithTime = calculateTimeSpent(events);
          processedData.push(...eventsWithTime);
          processedData.push({ ...events[0], id: `separator-${key}`, isSeparator: true });
        }
      });

      // Sort groups if needed
      if (sortBy === 'pages') {
        const groups = processedData.reduce<GroupedJourneys>((acc, event) => {
          if (!event.isSeparator) {
            const key = event.visitor_id || event.ip_address;
            if (!acc[key]) acc[key] = [];
            acc[key].push(event);
          }
          return acc;
        }, {});

        processedData = Object.entries(groups)
          .sort((a, b) => b[1].length - a[1].length)
          .flatMap(([key, events]) => [...events, { ...events[0], id: `separator-${key}`, isSeparator: true }]);
      }

      setJourneyData(processedData);
    } else {
      // For user journey, just calculate time spent
      const processedData = calculateTimeSpent(data);
      setJourneyData(processedData);
    }
  };

  const fetchJourney = async () => {
    if (searchType === 'user' && !searchId) {
      setError('Please enter a User ID to search');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const startTime = new Date(dateRange.start).toISOString();
      const endTime = new Date(dateRange.end).toISOString();

      const data = searchType === 'user'
        ? await getUserJourney(searchId, startTime, endTime)
        : await getVisitorJourney(startTime, endTime);

      // Also fetch page view stats for referrer data
      try {
        const stats = await getPageViewStats(startTime, endTime);
        if (stats.referrerStats) {
          setReferrerStats(stats.referrerStats);
        }
      } catch (statsErr) {
        console.error('Error fetching page stats:', statsErr);
      }

      processJourneyData(data);
    } catch (err) {
      console.error('Error fetching journey:', err);
      setJourneyData([]);
      setError(`No data available for the selected ${searchType} and time range`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">
          View detailed journey of users and visitors.
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Type</label>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value as 'user' | 'visitor');
                  setSearchId('');
                  setFilterIP('');
                  setFilterVisitorId('');
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="user">User Journey</option>
                <option value="visitor">All Visitor Journeys</option>
              </select>
            </div>

            {searchType === 'user' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter User ID"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filter by IP</label>
                  <input
                    type="text"
                    value={filterIP}
                    onChange={(e) => setFilterIP(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Filter by IP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filter by Visitor ID</label>
                  <input
                    type="text"
                    value={filterVisitorId}
                    onChange={(e) => setFilterVisitorId(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Filter by Visitor ID"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {searchType === 'visitor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'time' | 'pages')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="time">Time (Latest First)</option>
                  <option value="pages">Number of Pages</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={fetchJourney}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4">
              <Error message={error} retry={fetchJourney} />
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {journeyData.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Pages Visited</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{journeyStats.totalPages}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unique IPs</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{journeyStats.uniqueIPs}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Average Time Spent</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatDuration(journeyStats.averageTimeSpent)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unique Pages</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{journeyStats.uniquePaths}</dd>
            </div>
          </div>
        </div>
      )}

      {/* Referrer Statistics */}
      {referrerStats.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Referrer Statistics
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrerStats.sort((a, b) => b.count - a.count).map((stat, index) => {
                    const totalViews = referrerStats.reduce((sum, item) => sum + item.count, 0);
                    const percentage = totalViews > 0 ? (stat.count / totalViews * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.referrer === 'direct' || !stat.referrer ? 'Direct / Unknown' : stat.referrer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">{percentage}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
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
      )}

      {/* Journey Timeline */}
      {journeyData.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {searchType === 'user' ? 'User Journey Timeline' : 'Visitor Journeys Timeline'}
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {journeyData.map((event, index) => {
                  if (event.isSeparator) {
                    return (
                      <li key={`separator-${event.visitor_id || event.ip_address}-${index}`} className="py-4">
                        <div className="relative">
                          <div className="h-0.5 w-full bg-gray-200" />
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={`${event.id}-${index}`}>
                      <div className="relative pb-8">
                        {index < journeyData.length - 1 && !journeyData[index + 1]?.isSeparator && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true">
                            <div className="absolute w-4 h-4 -right-1.5 top-1/2 transform -translate-y-1/2">
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 10l5 5 5-5H7z" />
                              </svg>
                            </div>
                          </span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Visited <span className="font-medium text-gray-900">{event.path}</span>
                                {typeof event.timeSpent === 'number' && event.timeSpent > 0 && (
                                  <span className="ml-2 text-indigo-600">
                                    (Spent {formatDuration(event.timeSpent)})
                                  </span>
                                )}
                              </p>
                              {event.referrer && (
                                <p className="text-sm text-gray-500">
                                  From: <span className="text-gray-700">{event.referrer === 'direct' ? 'Direct / Unknown' : event.referrer}</span>
                                </p>
                              )}
                              {searchType === 'visitor' && (
                                <>
                                  {event.visitor_id && (
                                    <p className="text-sm text-gray-500">
                                      Visitor ID: <span className="text-gray-700">{event.visitor_id}</span>
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    IP: <span className="text-gray-700">{event.ip_address}</span>
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={event.created_at}>{formatDate(event.created_at)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No data to show
        </div>
      )}
    </div>
  );
} 