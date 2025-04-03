import React from 'react';
import { Footer } from '@/components/Footer'; // Importing Footer component

/**
 * Layout for the blog section
 * This could be extended with blog-specific navigation, sidebar, etc.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main>
        {children}
      </main>
      <Footer /> {/* Adding Footer component */}
    </>
  );
} 