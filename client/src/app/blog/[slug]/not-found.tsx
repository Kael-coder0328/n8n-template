import Link from 'next/link';

/**
 * Not found page for blog posts
 * Displayed when a blog post with the specified slug doesn't exist
 */
export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
          Article Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Sorry, the blog post you are looking for does not exist or may have been moved.
        </p>
        <Link 
          href="/blog"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse All Articles
        </Link>
      </div>
    </div>
  );
} 