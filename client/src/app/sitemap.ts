/**
 * Sitemap Generator
 * This file generates a sitemap.xml file for your Next.js application
 * to help search engines discover and index your content
 */
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-utils';

// Base URL for your site
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

/**
 * Define dynamic routes that should be included in the sitemap
 * This can be expanded to fetch from a CMS, database, or API
 */
const getDynamicRoutes = async () => {
  // Fetch real blog posts using our utility function
  const blogPosts = getAllPosts().map(post => ({
    slug: post.slug,
    lastModified: post.date ? new Date(post.date) : new Date()
  }));
  
  // Example: Product pages
  // In a real app, you would fetch these from your product database
  const products = [
    { slug: 'product-1', lastModified: new Date() },
    { slug: 'product-2', lastModified: new Date('2023-12-10') },
  ];
  
  return {
    blogPosts,
    products,
  };
};

/**
 * Generate the sitemap for your website
 * @returns A sitemap object compatible with Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get dynamic routes
  const { blogPosts, products } = await getDynamicRoutes();
  
  // Define static routes with their last modified date and change frequency
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/template-page`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
  
  // Add blog post routes
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Add product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Combine all routes
  return [...staticRoutes, ...blogRoutes, ...productRoutes];
} 