import { notFound } from 'next/navigation';
import { getAllPostSlugs } from '@/lib/blog-utils';
import { fetchBlogPostBySlug } from '../actions';
import type { Metadata } from 'next';
import Image from 'next/image';
import { DEFAULT_BLOG_IMAGE, formatDate } from '@/lib/image-utils';
import MarkdownContent from '@/components/MarkdownContent';

// Define a proper interface for the page props
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static parameters for blog posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(slug => ({ slug: slug.slug }));
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const post = await fetchBlogPostBySlug(resolvedParams.slug);
  
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
 * BlogPost component to render the blog post based on the provided slug.
 * It fetches the post data and displays it along with structured data for SEO.
 */
export default async function BlogPost({ params }: PageProps) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const post = await fetchBlogPostBySlug(resolvedParams.slug);
  
  if (!post) {
    notFound();
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://n8n-template.example.com';
  const postUrl = `${baseUrl}/blog/${resolvedParams.slug}`;
  
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.imagePath || DEFAULT_BLOG_IMAGE,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'n8n Team',
      url: 'https://n8n.io'
    },
    publisher: {
      '@type': 'Organization',
      name: 'n8n',
      logo: {
        '@type': 'ImageObject',
        url: 'https://n8n.io/favicon.ico'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    }
  };
  
  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="bg-background border border-accent shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
          <div className="w-full h-64 md:h-96 overflow-hidden relative bg-accent/20">
            <Image
              src={post.imagePath || DEFAULT_BLOG_IMAGE}
              alt={post.title}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
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
    </>
  );
} 