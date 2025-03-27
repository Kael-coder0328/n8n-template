# SEO Components for Next.js

This directory contains a comprehensive set of SEO utilities and components designed to optimize your Next.js application for search engines.

## Features

- **Metadata Generation**: Streamlined creation of metadata for Next.js pages
- **Structured Data (JSON-LD)**: Components for adding structured data to improve search engine understanding
- **Sitemap Generation**: Automatic sitemap creation for better indexing
- **Robots.txt Configuration**: Control how search engines crawl your site
- **TypeScript Support**: Fully typed for better developer experience

## Quick Start

### 1. Basic Page SEO

To add SEO metadata to any page in your Next.js app:

```tsx
// app/your-page/page.tsx
import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Your Page Title',
  description: 'Your page description (150-160 characters recommended)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
});

export default function YourPage() {
  return (
    <main>
      <h1>Your Page Title</h1>
      {/* Page content */}
    </main>
  );
}
```

### 2. Adding Structured Data (JSON-LD)

Structured data helps search engines understand the content of your page:

```tsx
// Client component with structured data
'use client';

import { ArticleJsonLd } from '@/components/seo/JsonLd';

export function YourClientComponent() {
  return (
    <>
      <ArticleJsonLd 
        title="Article Title"
        description="Article description"
        url="https://yourdomain.com/article"
        imageUrl="https://yourdomain.com/images/article.jpg"
        publishedTime="2023-01-01T00:00:00Z"
        authorName="Author Name"
        publisherName="Publisher Name"
        publisherLogoUrl="https://yourdomain.com/logo.png"
      />
      
      {/* Component content */}
    </>
  );
}
```

### 3. SEO Configuration

Update the base configuration in `metadata.ts` to match your site:

```ts
// lib/seo/metadata.ts
const baseSeoConfig = {
  siteName: 'Your Site Name',
  titleSeparator: ' | ',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  defaultLocale: 'en-US',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  defaultDescription: 'Your default site description.',
  twitterHandle: '@yourtwitterhandle',
};
```

## Components and Utilities

### Metadata Utilities

- `createMetadata(props)`: Creates a Next.js metadata object with SEO best practices
- `getFullTitle(title)`: Generates a full title with site name
- `getCanonicalUrl(path)`: Generates a canonical URL for a page

### JSON-LD Components

- `JsonLd`: Generic component for any structured data
- `ArticleJsonLd`: For article/blog post pages
- `ProductJsonLd`: For product pages
- `FaqJsonLd`: For FAQ pages
- `BreadcrumbJsonLd`: For adding breadcrumb navigation data

## SEO Best Practices

1. **Page Titles**: Create unique, descriptive titles (50-60 characters)
2. **Meta Descriptions**: Write compelling descriptions (150-160 characters)
3. **Structured Data**: Use appropriate JSON-LD for your content type
4. **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
5. **Mobile Optimization**: Ensure responsive design
6. **Page Speed**: Optimize images and minimize render-blocking resources
7. **Internal Linking**: Link related content naturally
8. **Image Optimization**: Use descriptive filenames and alt text
9. **URL Structure**: Create descriptive, keyword-rich URLs
10. **Content Quality**: Create valuable, comprehensive content

## SEO Template Page

Check out `app/template-page/page.tsx` for a complete example of a page with proper SEO implementation.

## Additional Resources

- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/) for structured data formats
- [Google Rich Results Test](https://search.google.com/test/rich-results) to validate your structured data 