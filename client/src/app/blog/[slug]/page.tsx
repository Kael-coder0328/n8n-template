import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllPostSlugs } from '@/lib/blog-utils';
import { fetchBlogPostBySlug } from '../actions';
import { DEFAULT_BLOG_IMAGE, formatDate, handleImageError } from '@/lib/image-utils';
import MarkdownContent from '@/components/MarkdownContent';
import Image from 'next/image';
import { Metadata } from 'next';

/**
 * Generate metadata for the blog post page
 */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const post = await fetchBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['n8n Team'],
    },
  };
}

/**
 * Generate static params for all blog posts
 * This enables static generation of all blog post pages at build time
 */
export function generateStaticParams() {
  // Fetch all blog post slugs from the file system
  const posts = getAllPostSlugs();
  return posts;
}

/**
 * Blog post page component
 */
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = await fetchBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <article className="bg-background border border-accent shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
        <div className="w-full h-64 md:h-96 overflow-hidden relative bg-accent/20">
          <img
            src={post.imagePath || DEFAULT_BLOG_IMAGE}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>{formatDate(post.date)}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime} min read</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownContent content={post.content} />
          </div>
        </div>
      </article>
    </main>
  );
} 