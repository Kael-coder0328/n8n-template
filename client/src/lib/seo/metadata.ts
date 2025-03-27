/**
 * SEO metadata utilities for Next.js applications
 * These utilities help generate consistent and SEO-friendly metadata
 * for use with Next.js metadata API and other SEO components
 */
import { Metadata } from 'next';

// Base site configuration - edit these values for your site
const baseSeoConfig = {
  siteName: 'YourSiteName',
  titleSeparator: ' | ',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  defaultLocale: 'en-US',
  // Default social image dimensions (1200x630 is recommended for social shares)
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  defaultDescription: 'Your default site description that appears when no custom description is provided.',
  twitterHandle: '@yourtwitterhandle',
};

// Default open graph image path - update this with your actual image path
const defaultOgImage = {
  url: `${baseSeoConfig.baseUrl}/images/social-share.jpg`,
  width: baseSeoConfig.defaultImageWidth,
  height: baseSeoConfig.defaultImageHeight,
  alt: baseSeoConfig.siteName,
};

// Define a specific type for structured data to replace 'any'
type StructuredData = Record<string, unknown>;

/**
 * Types for SEO metadata parameters
 */
export interface SeoProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  noIndex?: boolean;
  keywords?: string[];
  locale?: string;
  type?: 'website' | 'article' | 'product' | 'profile' | 'book';
  publishedTime?: string; // ISO date string for articles
  authors?: string[];
  structuredData?: StructuredData; // JSON-LD structured data
}

/**
 * Generates full title with site name
 * @param title Page-specific title
 * @returns Full title with site name
 */
export const getFullTitle = (title?: string): string => {
  if (!title) return baseSeoConfig.siteName;
  return `${title}${baseSeoConfig.titleSeparator}${baseSeoConfig.siteName}`;
};

/**
 * Generates canonical URL
 * @param path Relative path (without domain)
 * @returns Full canonical URL with domain
 */
export const getCanonicalUrl = (path?: string): string => {
  if (!path || path === '/') return baseSeoConfig.baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseSeoConfig.baseUrl}${cleanPath}`;
};

/**
 * Generates structured data (JSON-LD) for the page
 * @param data Structured data object
 * @returns Structured data as a string
 */
export const structuredDataString = (data: StructuredData): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  });
};

/**
 * Creates Next.js Metadata object with SEO best practices
 * @param props SEO properties
 * @returns Next.js Metadata object
 */
export const createMetadata = (props: SeoProps): Metadata => {
  const {
    title,
    description = baseSeoConfig.defaultDescription,
    canonicalUrl,
    ogImage = defaultOgImage,
    noIndex = false,
    keywords = [],
    locale = baseSeoConfig.defaultLocale,
    type = 'website',
    publishedTime,
    authors = [],
  } = props;

  const fullTitle = getFullTitle(title);
  const canonical = canonicalUrl || getCanonicalUrl();

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Canonical URL
    alternates: {
      canonical: canonical,
    },
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: baseSeoConfig.siteName,
      images: [
        {
          url: ogImage.url,
          width: ogImage.width || baseSeoConfig.defaultImageWidth,
          height: ogImage.height || baseSeoConfig.defaultImageHeight,
          alt: ogImage.alt || fullTitle,
        },
      ],
      locale,
      type: type === 'product' ? 'website' : type,
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: baseSeoConfig.twitterHandle,
      images: [ogImage.url],
    },
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };

  // Add article-specific metadata
  if (type === 'article') {
    const articleMetadata = metadata.openGraph as Record<string, unknown>;
    if (publishedTime) {
      articleMetadata.publishedTime = publishedTime;
    }
    if (authors.length > 0) {
      articleMetadata.authors = authors;
    }
  }

  return metadata;
};

/**
 * Generates JSON-LD structured data for articles
 * @param props Article properties
 * @returns Structured data object for an article
 */
export const createArticleStructuredData = ({
  title,
  description,
  url,
  imageUrl,
  publishedTime,
  modifiedTime,
  authorName,
  authorUrl,
  publisherName,
  publisherLogoUrl,
}: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName: string;
  authorUrl?: string;
  publisherName: string;
  publisherLogoUrl: string;
}) => {
  return {
    '@type': 'Article',
    headline: title,
    description,
    image: imageUrl,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
};

/**
 * Generates JSON-LD structured data for products
 * @param props Product properties
 * @returns Structured data object for a product
 */
export const createProductStructuredData = ({
  name,
  description,
  imageUrl,
  price,
  currency = 'USD',
  availability = 'InStock',
  url,
  sku,
  brand,
  reviewCount,
  ratingValue,
}: {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  sku?: string;
  brand?: string;
  reviewCount?: number;
  ratingValue?: number;
}) => {
  const productData: {
    '@type': 'Product';
    name: string;
    description: string;
    image: string;
    offers: {
      '@type': 'Offer';
      price: number;
      priceCurrency: string;
      availability: string;
      url: string;
    };
    sku?: string;
    brand?: {
      '@type': 'Brand';
      name: string;
    };
    aggregateRating?: {
      '@type': 'AggregateRating';
      ratingValue: number;
      reviewCount: number;
    };
  } = {
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
    },
  };

  if (sku) productData.sku = sku;
  if (brand) {
    productData.brand = {
      '@type': 'Brand',
      name: brand,
    };
  }

  if (reviewCount && ratingValue) {
    productData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return productData;
};

/**
 * Creates a breadcrumb structured data object
 * @param items Array of breadcrumb items with name and url
 * @returns Structured data for breadcrumbs
 */
export const createBreadcrumbStructuredData = (
  items: Array<{ name: string; url: string }>
) => {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// Create a named object for the default export
const seoMetadataUtils = {
  createMetadata,
  getFullTitle,
  getCanonicalUrl,
  createArticleStructuredData,
  createProductStructuredData,
  createBreadcrumbStructuredData,
  structuredDataString,
};

export default seoMetadataUtils; 