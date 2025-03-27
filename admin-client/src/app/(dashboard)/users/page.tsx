'use client';

import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsers } from '@/lib/services/users';
import type { User} from '@/lib/services/users';
import Loading from '@/components/ui/loading';
import Error from '@/components/ui/error';
import ClientOnly from '@/components/client-only';
import { formatDate } from '@/lib/utils/format';
import EmailModal from '@/components/EmailModal';

// Available options for records per page
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

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

const NoData = () => (
  <span className="text-gray-400 text-sm">No Data</span>
);

const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status || status === '') {
    return (
      <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800">
        Not Subscribed
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
      {status}
    </span>
  );
};

const VerificationBadge = ({ verified }: { verified: boolean }) => (
  <span
    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
      verified
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
    }`}
  >
    {verified ? 'Email Verified' : 'Email Unverified'}
  </span>
);

const UserDetails = ({ user }: { user: User }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100">
      <h4 className="font-semibold mb-2">User Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <span className="text-gray-600 text-sm">ID:</span>
          <span className="text-sm ml-2">{user.id || <NoData />}</span>
        </div>
        <div>
          <span className="text-gray-600 text-sm">Email:</span>
          <span className="text-sm ml-2">{user.email || <NoData />}</span>
        </div>
        <div>
          <span className="text-gray-600 text-sm">Name:</span>
          <span className="text-sm ml-2">
            {user.name ? user.name : <NoData />}
          </span>
        </div>
        <div>
          <span className="text-gray-600 text-sm">Created At:</span>
          <span className="text-sm ml-2">
            {user.created_at ? formatDate(user.created_at) : <NoData />}
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button 
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          onClick={() => setIsEmailModalOpen(true)}
        >
          Send Email
        </button>
        <Link
          href={`/users/${user.id}`}
          className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
        >
          View Details
        </Link>
      </div>
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        recipientEmail={user.email || ''} 
      />
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined
      });
      setUsers(response.users);
      setTotalItems(response.total);
      setFilteredUsers(response.users);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  const filterUsers = useCallback(() => {
    let result = [...users];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(
        (user) => user.email_verified === (filter === 'verified')
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

    setFilteredUsers(result);
  }, [users, filter, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleSort = (key: keyof User) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (key: keyof User) => {
    if (sortConfig?.key !== key) {
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === paginatedUsers.length);
  };

  const toggleUserDetails = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const exportUsers = () => {
    const usersToExport = filteredUsers.filter(user => 
      selectedUsers.size === 0 || selectedUsers.has(user.id)
    );

    const headers = ['Name', 'Email', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...usersToExport.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        user.email_verified ? 'Verified' : 'Unverified',
        formatDate(user.created_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} retry={fetchUsers} />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in your application including their name, email, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={exportUsers}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Export Selected
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="flex flex-row justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option} rows
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <ClientOnly fallback={<LoadingSkeleton />}>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="relative px-6 py-3">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {renderSortIcon('name')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-2">
                            Email
                            {renderSortIcon('email')}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Subscription
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-sm text-gray-500 text-center">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <React.Fragment key={user.id}>
                            <tr className={expandedUsers.has(user.id) ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={selectedUsers.has(user.id)}
                                  onChange={() => handleSelectUser(user.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name || <NoData />}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <StatusBadge status={user.latest_status} />
                                  <VerificationBadge verified={user.email_verified} />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => toggleUserDetails(user.id)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {expandedUsers.has(user.id) ? 'Hide Details' : 'Show Details'}
                                </button>
                              </td>
                            </tr>
                            {expandedUsers.has(user.id) && (
                              <tr>
                                <td colSpan={5} className="px-6 py-4">
                                  <UserDetails user={user} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 