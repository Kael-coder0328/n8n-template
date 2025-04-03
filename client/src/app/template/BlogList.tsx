'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/date-utils';
import { DEFAULT_BLOG_IMAGE } from '@/lib/image-utils';
import { Post } from '@/types/blog';

interface BlogListProps {
  posts: Post[];
}

/**
 * BlogList component to display a list of blog posts
 */
export default function BlogList({ posts }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No posts found</h2>
        <p className="text-gray-500">Check back later for new content.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="flex flex-col h-full bg-background border border-accent rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-48 w-full overflow-hidden bg-accent/10">
            <Image
              src={post.imagePath || DEFAULT_BLOG_IMAGE}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="p-5 flex-grow flex flex-col">
            <div className="mb-2">
              {post.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block bg-accent/10 text-accent-foreground rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm mb-4 line-clamp-3">
              {post.description}
            </p>
            <div className="mt-auto text-sm text-gray-500">
              {formatDate(post.date)}
              {post.readTime && (
                <span className="ml-3">{post.readTime} min read</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 