'use client';

import React from 'react';
import ApiUrlGuard from '@/components/ApiUrlGuard';

/**
 * Client-side providers wrapper
 * Includes the ApiUrlGuard to ensure API URL is set
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiUrlGuard>
      {children}
    </ApiUrlGuard>
  );
} 