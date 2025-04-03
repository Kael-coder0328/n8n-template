/**
 * Sitemap Generator
 * This file generates a sitemap.xml file for your Next.js application
 * to help search engines discover and index your content
 */
import { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/blog-utils';

// Base URL for your site
const baseUrl = 'https://n8ntemplates.prosamik.com';

/**
 * Generate the sitemap for your website
 * @returns A sitemap object compatible with Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all template slugs
  const templates = await getAllPostSlugs();
  
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
      url: `${baseUrl}/template`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
  
  // Add template routes
  const templateRoutes = templates.map((template) => ({
    url: `${baseUrl}/template/${template.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Combine all routes
  return [...staticRoutes, ...templateRoutes];
} 