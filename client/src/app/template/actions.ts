'use server';

import { getAllPosts, getPostBySlug } from '@/lib/blog-utils';

/**
 * Server action to fetch all blog posts
 */
export async function fetchAllBlogPosts() {
  return getAllPosts();
}

/**
 * Server action to fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug: string) {
  return getPostBySlug(slug);
} 