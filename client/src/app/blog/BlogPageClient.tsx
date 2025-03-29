'use client'

import React from 'react';
import BlogList, { BlogPost } from './BlogList';

/**
 * Props for the BlogPageClient component
 */
interface BlogPageClientProps {
  posts: BlogPost[];
}

/**
 * BlogPageClient component renders the blog list with posts
 */
const BlogPageClient: React.FC<BlogPageClientProps> = ({ posts }) => {
  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-400 mb-6">Our Blog</h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Insights, tutorials, and updates from our team to help you build better software
          </p>
        </header>
        
        <BlogList posts={posts} />
      </div>
    </div>
  );
};

export default BlogPageClient; 