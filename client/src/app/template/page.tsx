import React from 'react';
import BlogPageClient from './BlogPageClient';
import { fetchAllBlogPosts } from './actions';

/**
 * Metadata for the blog page
 */
export const metadata = {
  title: 'Blog | Our Latest Articles and Insights',
  description: 'Read our latest articles, tutorials, and insights about software development, DevOps, and more.',
  openGraph: {
    title: 'Blog | Our Latest Articles and Insights',
    description: 'Read our latest articles, tutorials, and insights about software development, DevOps, and more.',
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