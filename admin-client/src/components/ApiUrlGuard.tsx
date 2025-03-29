import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getApiUrl, isApiUrlManuallySet } from '@/lib/config';

/**
 * A guard component that ensures API URL is set before rendering children
 * Redirects to API URL input page if not set
 */
export default function ApiUrlGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip checking on API URL input page to avoid redirect loops
    if (pathname === '/api-url' || pathname === '/') {
      setIsLoading(false);
      return;
    }

    // Get the API URL and check if it was manually set by the user
    const apiUrl = getApiUrl();
    const hasUserSetApiUrl = isApiUrlManuallySet();
    
    // Only redirect if the API URL has not been manually set by the user
    if (!apiUrl || !hasUserSetApiUrl) {
      router.push('/api-url');
    } else {
      setIsLoading(false);
    }
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 