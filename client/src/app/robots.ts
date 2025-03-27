/**
 * Robots.txt Generator
 * This file generates a robots.txt file for your Next.js application
 * to guide search engine crawlers on which pages to index
 */
import { MetadataRoute } from 'next';

// Base URL for your site
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

/**
 * Generate the robots.txt content for your website
 * @returns A robots.txt object compatible with Next.js
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // Define rules for all crawlers
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow crawling of admin and private routes
      disallow: [
        '/admin/', 
        '/private/', 
        '/api/',
        '/auth/reset-password',
        '/checkout',
      ],
    },
    // Add sitemap URL
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 