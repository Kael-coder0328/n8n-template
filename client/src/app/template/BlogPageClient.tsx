'use client'

import React from 'react';
import BlogList from './BlogList';
import { Post } from '@/types/blog';
import Link from 'next/link';

/**
 * Props for the BlogPageClient component
 */
interface BlogPageClientProps {
  posts: Post[];
}

/**
 * BlogPageClient component renders the blog list with posts
 */
const BlogPageClient: React.FC<BlogPageClientProps> = ({ posts }) => {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background pt-16 pb-24">
      <div className="container mx-auto px-4">
        <header className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-sm font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground transition-colors">
              ← Back to Home
            </Link>
            <h1 className="ml-5 text-3xl font-bold text-light-foreground dark:text-dark-foreground">Browse Templates</h1>
          </div>
        </header>
        
        <BlogList posts={posts} />
      </div>
    </div>
  );
};

export default BlogPageClient; 