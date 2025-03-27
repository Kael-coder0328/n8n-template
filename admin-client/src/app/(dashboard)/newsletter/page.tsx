'use client';

import React, { useEffect, useState } from 'react';
import { NewsletterSubscription, getNewsletterSubscriptions } from '@/lib/services/newsletter';
import Error from '@/components/ui/error';
import ClientOnly from '@/components/client-only';
import { formatDate } from '@/lib/utils/format';

/**
 * Component displaying a loading skeleton while data is being fetched
 */
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  </div>
);

/**
 * Component for empty data placeholder
 */
const NoData = () => (
  <span className="text-gray-400 text-sm">No Data</span>
);

/**
 * Newsletter Subscriptions Page Component
 * Displays a list of all newsletter subscriptions
 */
export default function NewsletterPage() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof NewsletterSubscription;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' }); // Default sort by created_at desc
  
  // Available options for records per page
  const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

  /**
   * Fetches newsletter subscriptions from the API
   */
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getNewsletterSubscriptions();
      setSubscriptions(data);
      setFilteredSubscriptions(data);
    } catch (err) {
      console.error('Error fetching newsletter subscriptions:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as { message: string }).message 
        : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter subscriptions based on search term
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredSubscriptions(subscriptions);
    } else {
      const searchLower = search.toLowerCase();
      const filtered = subscriptions.filter(
        (subscription) => 
          subscription.email.toLowerCase().includes(searchLower)
      );
      setFilteredSubscriptions(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [search, subscriptions]);

  // Get current page subscriptions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle sort changes
  const handleSort = (key: keyof NewsletterSubscription) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        // Toggle direction if sorting by the same column
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // Default to ascending for new column
      return { key, direction: 'asc' };
    });

    // Apply sorting
    const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });

    setFilteredSubscriptions(sortedSubscriptions);
  };

  // Handle changing the number of items per page
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchSubscriptions();
  };

  // Helper function to render sort icons
  const renderSortIcon = (key: keyof NewsletterSubscription) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.12 2.12 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.12 2.12 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Z"/>
      </svg>
    ) : (
      <svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.426 12.024h-6.851a2.075 2.075 0 0 0-1.847 1.086 1.9 1.9 0 0 0 .11 1.986l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.847-1.087Z"/>
      </svg>
    );
  };

  // Export subscriptions to CSV
  const exportSubscriptions = () => {
    // Define headers for CSV
    const headers = ['ID', 'Email', 'Subscribed', 'Created At', 'Updated At'];
    
    // Map subscriptions to CSV rows
    const rows = filteredSubscriptions.map(subscription => [
      subscription.id.toString(),
      subscription.email,
      subscription.subscribed.toString(),
      new Date(subscription.created_at).toLocaleString(),
      new Date(subscription.updated_at).toLocaleString()
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ClientOnly>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Newsletter Subscriptions</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={exportSubscriptions}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10 pr-4 py-2"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">Show:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Subscribers</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {loading ? <span className="animate-pulse">...</span> : subscriptions.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Subscribers</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                subscriptions.filter(s => s.subscribed).length
              )}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Latest Subscription</h3>
            <p className="mt-2 text-xl font-semibold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : subscriptions.length > 0 ? (
                formatDate(subscriptions[0].created_at)
              ) : (
                'No subscriptions yet'
              )}
            </p>
          </div>
        </div>

        {/* Subscriptions table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : error ? (
            <div className="p-6">
              <Error message={error} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          {renderSortIcon('id')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {renderSortIcon('email')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('subscribed')}
                      >
                        <div className="flex items-center">
                          Subscribed
                          {renderSortIcon('subscribed')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Created At
                          {renderSortIcon('created_at')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('updated_at')}
                      >
                        <div className="flex items-center">
                          Updated At
                          {renderSortIcon('updated_at')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentSubscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <NoData />
                        </td>
                      </tr>
                    ) : (
                      currentSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subscription.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscription.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscription.subscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subscription.subscribed ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(subscription.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(subscription.updated_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredSubscriptions.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredSubscriptions.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          // Adjust page numbers to show around current page
                          let pageNum = i + 1;
                          if (totalPages > 5) {
                            if (currentPage > 3) {
                              pageNum = currentPage + i - 2;
                              if (pageNum > totalPages) {
                                pageNum = totalPages - (4 - i);
                              }
                            }
                            if (pageNum < 1) pageNum = 1;
                            if (pageNum > totalPages) pageNum = totalPages;
                          }
                          
                          return (
                            <button
                              key={i}
                              onClick={() => paginate(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClientOnly>
  );
} 