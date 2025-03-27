/**
 * SEO Template Page
 * This is a boilerplate template for creating SEO-optimized pages in Next.js
 */
import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo/metadata';
import { ArticleJsonLd } from '@/components/seo/JsonLd';

// Define the SEO metadata for this page
export const metadata: Metadata = createMetadata({
  title: 'Template Page Title',
  description: 'This is a comprehensive description of the template page that will appear in search results and when shared on social media. Keep it between 150-160 characters for optimal display in search engine results.',
  keywords: ['template', 'example', 'nextjs', 'seo'],
  type: 'article',
  publishedTime: new Date().toISOString(),
  authors: ['Your Name'],
  // Override the default OG image if needed
  ogImage: {
    url: '/images/template-page-social.jpg',
    width: 1200,
    height: 630,
    alt: 'Template Page Title',
  },
});

// Template Page Component
export default function TemplatePage() {
  // Page URL for structured data
  const pageUrl = 'https://yourdomain.com/template-page';
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Article JSON-LD (structured data) */}
      <ArticleJsonLd 
        title="Template Page Title"
        description="This is a comprehensive description of the template page."
        url={pageUrl}
        imageUrl="https://yourdomain.com/images/template-page-social.jpg"
        publishedTime={new Date().toISOString()}
        authorName="Your Name"
        publisherName="Your Site Name"
        publisherLogoUrl="https://yourdomain.com/logo.png"
      />
      
      {/* Page Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Template Page Title</h1>
        
        <div className="prose lg:prose-xl">
          <p className="lead">
            This is an example template page that demonstrates how to implement proper SEO
            in a Next.js application. The page includes metadata, structured data, and content
            optimized for search engines.
          </p>
          
          <h2>Why SEO Matters</h2>
          <p>
            Search Engine Optimization (SEO) helps your content rank higher in search results,
            making it more discoverable to users. Proper SEO includes technical aspects like
            metadata and structured data, as well as content quality and relevance.
          </p>
          
          <h2>Key SEO Elements in This Template</h2>
          <ul>
            <li><strong>Metadata</strong>: Title, description, and keywords that help search engines understand your content</li>
            <li><strong>Structured Data</strong>: JSON-LD that provides explicit information about the page content type</li>
            <li><strong>Semantic HTML</strong>: Proper use of HTML elements to create a hierarchical content structure</li>
            <li><strong>Responsive Design</strong>: Mobile-friendly layout that works across all devices</li>
            <li><strong>Social Media Optimization</strong>: Open Graph and Twitter card meta tags for better social sharing</li>
          </ul>
          
          <h2>How to Use This Template</h2>
          <p>
            Copy this page structure when creating new content pages in your application.
            Update the metadata and structured data to match your specific content. Use proper
            heading hierarchy (h1, h2, h3) and include relevant keywords naturally in your content.
          </p>
          
          <blockquote>
            <p>Remember that high-quality, valuable content is the foundation of good SEO.
            Technical optimizations enhance discoverability, but content quality drives engagement.</p>
          </blockquote>
          
          <h2>Additional SEO Best Practices</h2>
          <ol>
            <li>Ensure fast page load times</li>
            <li>Use descriptive URLs that include keywords</li>
            <li>Optimize images with alt text and appropriate file sizes</li>
            <li>Include internal links to other relevant content</li>
            <li>Regularly update content to keep it fresh and relevant</li>
          </ol>
        </div>
      </div>
    </main>
  );
} 