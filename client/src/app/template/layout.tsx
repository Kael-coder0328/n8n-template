import React from 'react';

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
    <main>
      {children}
    </main>
  );
} 