import React from 'react';
import BlogPageClient from './BlogPageClient';
import { fetchAllBlogPosts } from './actions';

/**
 * Metadata for the blog page
 */
export const metadata = {
  title: 'Templates',
  description: 'n8n templates for Solopreneurs',
  openGraph: {
    title: 'Templates',
    description: 'n8n templates for Solopreneurs',
    type: 'website',
  },
};

/**
 * Server component for the blog page
 * Fetches blog posts from markdown files in the public directory
 */
export default async function BlogPage() {
  // Get all blog posts at build time using the server action
  const posts = await fetchAllBlogPosts();
  
  return <BlogPageClient posts={posts} />;
} 