import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog-utils';
import MarkdownContent from '@/components/MarkdownContent';

/**
 * Generate metadata for the blog post page
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }
  
  return {
    title: `${post.title} | Blog`,
    description: post.description || post.content?.substring(0, 160).replace(/<[^>]*>/g, ''),
    openGraph: {
      title: post.title,
      description: post.description || post.content?.substring(0, 160).replace(/<[^>]*>/g, ''),
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
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
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 pb-24">
      <div className="container mx-auto px-4">
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to all articles
        </Link>
        
        <article className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              {post.date && (
                <time className="mr-6" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
              
              {post.readTime && (
                <span className="flex items-center">
                  <span className="mr-1">📚</span>
                  {post.readTime} min read
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag: string) => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>
          
          <MarkdownContent content={post.content} />
        </article>
      </div>
    </div>
  );
} 