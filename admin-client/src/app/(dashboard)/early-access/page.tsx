'use client';

import React, { useEffect, useState } from 'react';
import { EarlyAccess, getEarlyAccessRegistrations } from '@/lib/services/early-access';
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
 * Early Access Page Component
 * Displays a list of all early access registrations
 */
export default function EarlyAccessPage() {
  const [registrations, setRegistrations] = useState<EarlyAccess[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<EarlyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EarlyAccess;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' }); // Default sort by created_at desc
  
  // Available options for records per page
  const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

  /**
   * Fetches early access registrations from the API
   */
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getEarlyAccessRegistrations();
      setRegistrations(data);
      setFilteredRegistrations(data);
    } catch (err) {
      setError('Failed to fetch early access registrations');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter and sort data when search or sort configuration changes
  useEffect(() => {
    let result = [...registrations];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (registration) => 
          registration.email.toLowerCase().includes(searchLower) ||
          registration.referrer.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (!bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredRegistrations(result);
  }, [registrations, search, sortConfig]);

  /**
   * Handles sorting when a column header is clicked
   */
  const handleSort = (key: keyof EarlyAccess) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  /**
   * Handles changing the number of items per page
   */
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate total pages and paginate the data
  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * Renders sort icon based on current sort configuration
   */
  const renderSortIcon = (key: keyof EarlyAccess) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  /**
   * Export registrations to CSV file
   */
  const exportRegistrations = () => {
    // Create CSV content
    const csvContent = [
      // Header row
      ['ID', 'Email', 'Referrer', 'Created At', 'Updated At'].join(','),
      // Data rows
      ...filteredRegistrations.map(reg => [
        reg.id,
        `"${reg.email}"`, // Wrap in quotes to handle commas in emails
        `"${reg.referrer}"`, // Wrap in quotes to handle commas in referrers
        reg.created_at ? new Date(reg.created_at).toISOString() : '',
        reg.updated_at ? new Date(reg.updated_at).toISOString() : ''
      ].join(','))
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `early-access-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ClientOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Early Access Registrations
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={exportRegistrations}
              disabled={filteredRegistrations.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            
            <button
              onClick={fetchRegistrations}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Search and filter section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search by email or referrer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label htmlFor="per-page" className="mr-2 text-sm font-medium text-gray-700">
                  Show
                </label>
                <select
                  id="per-page"
                  className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton />
              </div>
            ) : error ? (
              <Error message={error} />
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No early access registrations found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ID</span>
                        {renderSortIcon('id')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        {renderSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('referrer')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Referrer</span>
                        {renderSortIcon('referrer')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Registered At</span>
                        {renderSortIcon('created_at')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.email || <NoData />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {registration.referrer || 'direct'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.created_at ? formatDate(registration.created_at) : <NoData />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {!loading && filteredRegistrations.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </ClientOnly>
  );
} 