'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';

/**
 * PageView component tracks page views for analytics purposes.
 * It sends the current pathname and search parameters to the server
 * whenever the user navigates to a new page that hasn't been tracked yet.
 */
export default function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackedPaths = useRef(new Set());

  useEffect(() => {
    const fullPath = searchParams.size > 0 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Check if this exact path has already been tracked
    if (trackedPaths.current.has(fullPath)) {
      return;
    }

    /**
     * Tracks the page view by sending the full path and other relevant
     * information to the analytics server.
     */
    const trackPageView = async () => {
      try {
        // Add to tracked paths before making the request
        trackedPaths.current.add(fullPath);

        await authService.post('/api/analytics/pageview', {
          path: fullPath,
          referrer: document.referrer || '',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        });
        console.log('[Analytics] Page view tracked:', fullPath);
      } catch (error) {
        // Remove from tracked paths if request fails
        trackedPaths.current.delete(fullPath);
        console.error('[Analytics] Failed to track page view:', error);
      }
    };

    trackPageView();

    // Store the current trackedPaths in a variable for cleanup
    const currentTrackedPaths = trackedPaths.current;

    // Cleanup function to remove the path from tracked set when component unmounts
    // or when pathname/searchParams change
    return () => {
      currentTrackedPaths.delete(fullPath);
    };
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}