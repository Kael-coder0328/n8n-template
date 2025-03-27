/**
 * JsonLd component for adding structured data to pages
 * This component renders JSON-LD structured data in the page head
 * to improve search engine understanding of the page content
 */
'use client';

import React from 'react';
import { structuredDataString } from '@/lib/seo/metadata';

// Create a specific type for structured data objects
type StructuredData = Record<string, unknown>;

interface JsonLdProps {
  data: StructuredData;
}

/**
 * JsonLd component for adding structured data to pages
 * @param data The structured data object to render as JSON-LD
 * @returns A script element with the JSON-LD structured data
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  // Convert the structured data to a JSON-LD string
  const jsonLdString = structuredDataString(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
};

/**
 * Convenience component for adding Article structured data
 */
export const ArticleJsonLd: React.FC<{
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
}> = (props) => {
  const articleData = {
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    image: props.imageUrl,
    datePublished: props.publishedTime,
    dateModified: props.modifiedTime || props.publishedTime,
    author: {
      '@type': 'Person',
      name: props.authorName,
      ...(props.authorUrl && { url: props.authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: props.publisherName,
      logo: {
        '@type': 'ImageObject',
        url: props.publisherLogoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
  };

  return <JsonLd data={articleData} />;
};

/**
 * Convenience component for adding Product structured data
 */
export const ProductJsonLd: React.FC<{
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
}> = (props) => {
  const productData: StructuredData = {
    '@type': 'Product',
    name: props.name,
    description: props.description,
    image: props.imageUrl,
    offers: {
      '@type': 'Offer',
      price: props.price,
      priceCurrency: props.currency || 'USD',
      availability: `https://schema.org/${props.availability || 'InStock'}`,
      url: props.url,
    },
  };

  if (props.sku) productData.sku = props.sku;
  if (props.brand) {
    productData.brand = {
      '@type': 'Brand',
      name: props.brand,
    };
  }

  if (props.reviewCount && props.ratingValue) {
    productData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: props.ratingValue,
      reviewCount: props.reviewCount,
    };
  }

  return <JsonLd data={productData} />;
};

/**
 * Convenience component for adding FAQ structured data
 */
export const FaqJsonLd: React.FC<{
  questions: Array<{ question: string; answer: string }>;
}> = ({ questions }) => {
  const faqData = {
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <JsonLd data={faqData} />;
};

/**
 * Convenience component for adding breadcrumb structured data
 */
export const BreadcrumbJsonLd: React.FC<{
  items: Array<{ name: string; url: string }>;
}> = ({ items }) => {
  const breadcrumbData = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={breadcrumbData} />;
};

export default JsonLd; 