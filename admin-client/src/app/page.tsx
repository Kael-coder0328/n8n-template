'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page that redirects to API URL input
 */
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/api-url');
  }, [router]);
  
  return null;
}
