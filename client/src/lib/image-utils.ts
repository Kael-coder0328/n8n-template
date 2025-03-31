/**
 * Default image to use when a blog post image is missing
 */
export const DEFAULT_BLOG_IMAGE = '/blog/posts/images/default-post.jpg';

/**
 * Optimize image sizing based on available dimensions for client-side usage
 * This is a client-safe version that doesn't rely on Node.js modules
 * 
 * @param imagePath Path to the image
 * @param maxWidth Maximum width for the image
 * @param maxHeight Maximum height for the image
 * @returns Optimized image URL or original path if optimization not possible
 */
export function optimizeImageSize(imagePath: string, maxWidth = 800, maxHeight = 600): string {
  if (!imagePath) return DEFAULT_BLOG_IMAGE;

  // If it's an external URL with optimization params, return as is
  if (imagePath.includes('://') && 
     (imagePath.includes('?w=') || 
      imagePath.includes('&w=') || 
      imagePath.includes('?width=') || 
      imagePath.includes('&width='))) {
    return imagePath;
  }
  
  // If it's an external URL without optimization, add params for common services
  if (imagePath.includes('://')) {
    // For Unsplash
    if (imagePath.includes('unsplash.com')) {
      return `${imagePath}${imagePath.includes('?') ? '&' : '?'}w=${maxWidth}&h=${maxHeight}&fit=crop`;
    }
    
    // For Cloudinary
    if (imagePath.includes('cloudinary.com')) {
      return imagePath.replace('/upload/', `/upload/c_fill,w_${maxWidth},h_${maxHeight}/`);
    }
    
    // Return original URL for other external images
    return imagePath;
  }
  
  // For local images, we just return the path
  return imagePath;
}

/**
 * Handle image loading errors by replacing with default image
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== DEFAULT_BLOG_IMAGE) {
    img.src = DEFAULT_BLOG_IMAGE;
  }
}

/**
 * Process image paths in blog content to ensure they're properly referenced
 * 
 * @param content HTML content from the blog post
 * @returns Processed HTML content with fixed image paths
 */
export function processContentImages(content: string): string {
  if (!content) return '';
  
  // Fix relative image paths in markdown-generated HTML
  let processedContent = content;
  
  // Replace image src attributes that don't start with http or /
  processedContent = processedContent.replace(
    /<img\s+([^>]*?)src=['"](?!https?:\/\/)(?!\/)(.*?)['"]([^>]*?)>/gi,
    '<img $1src="/blog/posts/images/$2"$3>'
  );
  
  // Fix paths that use /posts/images/ instead of /blog/posts/images/
  processedContent = processedContent.replace(
    /<img\s+([^>]*?)src=['"](\/posts\/images\/.*?)['"]([^>]*?)>/gi,
    '<img $1src="/blog/posts/images/$2"$3>'
  );
  
  return processedContent;
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string, options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return '';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = options || { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
  } catch  {
    console.warn(`Invalid date format: ${dateString}`);
    return '';
  }
} 