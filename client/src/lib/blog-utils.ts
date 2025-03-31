import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkEmoji from 'remark-emoji';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { BlogPost } from '@/app/blog/BlogList';

const postsDirectory = path.join(process.cwd(), 'public/blog/posts');
const metadataFilePath = path.join(process.cwd(), 'public/blog/metadata.md');

/**
 * Interface for blog metadata entry
 */
interface BlogMetadata {
  id: string;
  title: string;
  slug: string;
  description: string;
  imagePath: string;
  markdownFilePath: string;
  date?: string;
  tags?: string[];
}

/**
 * Parse blog metadata from the central metadata.md file
 */
export function parseBlogMetadata(): BlogMetadata[] {
  // Check if metadata file exists, create it if it doesn't
  if (!fs.existsSync(metadataFilePath)) {
    const defaultMetadata = `# Blog Posts Metadata
    
This file contains metadata for all blog posts.

## Posts

`;
    // Ensure the directory exists
    const metadataDir = path.dirname(metadataFilePath);
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    fs.writeFileSync(metadataFilePath, defaultMetadata, 'utf8');
    return [];
  }

  // Read and parse metadata file
  const fileContents = fs.readFileSync(metadataFilePath, 'utf8');
  const sections = fileContents.split('###').slice(1); // Skip the header

  return sections.map((section, index) => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    const metadata: Partial<BlogMetadata> = {
      id: `post-${index + 1}`,
      title: title,
      slug: title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
    };

    // Parse the metadata entries
    lines.slice(1).forEach(line => {
      if (line.includes('- Sl No-')) {
        metadata.id = `post-${line.split('-')[1].trim()}`;
      } else if (line.includes('- Title-')) {
        metadata.title = line.split('-')[1].trim();
      } else if (line.includes('- Description-')) {
        metadata.description = line.split('-')[1].trim();
      } else if (line.includes('- Image_path-')) {
        metadata.imagePath = line.split('-')[1].trim();
      } else if (line.includes('- Markdownfile_Path-')) {
        metadata.markdownFilePath = line.split('-')[1].trim();
      } else if (line.includes('- Date-')) {
        metadata.date = line.split('-')[1].trim();
      } else if (line.includes('- Tags-')) {
        const tagsString = line.split('-')[1].trim();
        metadata.tags = tagsString.split(',').map(tag => tag.trim());
      }
    });

    return metadata as BlogMetadata;
  });
}

/**
 * Get all blog posts metadata from the metadata file or markdown files as fallback
 */
export function getAllPosts(): BlogPost[] {
  // Try to get posts from metadata file first
  const metadataPosts = parseBlogMetadata();
  
  if (metadataPosts.length > 0) {
    // Process metadata posts
    return metadataPosts.map(meta => {
      // Ensure the markdown file exists
      let content = '';
      let readTime = 0;
      
      try {
        // Try to read the actual markdown file
        const mdPath = meta.markdownFilePath.startsWith('/') 
          ? path.join(process.cwd(), 'public', meta.markdownFilePath) 
          : path.join(process.cwd(), 'public', meta.markdownFilePath);
        
        if (fs.existsSync(mdPath)) {
          const mdContent = fs.readFileSync(mdPath, 'utf8');
          const parsedMd = matter(mdContent);
          content = parsedMd.content;
          
          // Calculate read time
          const wordCount = content.split(/\s+/).length;
          readTime = Math.ceil(wordCount / 200);
        }
      } catch (error) {
        console.warn(`Could not read markdown file for ${meta.title}:`, error);
      }
      
      return {
        id: meta.id,
        slug: meta.slug,
        title: meta.title,
        description: meta.description,
        imagePath: meta.imagePath,
        date: meta.date ? new Date(meta.date).toISOString() : undefined,
        readTime,
        tags: meta.tags || [],
      };
    }).sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  }
  
  // Fallback to the existing implementation when no metadata file
  // Get all markdown files in the posts directory
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      
      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parse markdown frontmatter
      const { data, content } = matter(fileContents);
      
      // Calculate read time (average reading speed: 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);
      
      // Format as BlogPost type
      return {
        id: slug,
        slug,
        title: data.title,
        description: data.description || '',
        date: data.date ? new Date(data.date).toISOString() : undefined,
        readTime,
        tags: data.tags || [],
        imagePath: data.imagePath || '',
      };
    })
    // Sort posts by date
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
    
  return allPostsData;
}

/**
 * Optimize image sizing based on available dimensions
 * @param imagePath Path to the image
 * @param maxWidth Maximum width for the image
 * @param maxHeight Maximum height for the image
 * @returns Optimized image URL or original path if optimization not possible
 */
export function optimizeImageSize(imagePath: string, maxWidth = 800, maxHeight = 600): string {
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
  
  // For local images, we just return the path - actual resizing would need to be done 
  // through a server-side image optimization library like Next.js Image or sharp
  return imagePath;
}

function fixImagePaths(content: string): string {
  // Fix markdown image syntax: ![alt](./images/file.png)
  content = content.replace(/!\[(.*?)\]\(\.\/images\/(.*?)\)/g, '![$1](/blog/posts/images/$2)');
  content = content.replace(/!\[(.*?)\]\(\.\.\/(images\/.*?)\)/g, '![$1](/blog/posts/$2)');
  
  // Fix HTML image tags: <img src="./images/file.png" />
  content = content.replace(/src=["']\.\/images\/([^"']+)["']/g, 'src="/blog/posts/images/$1"');
  content = content.replace(/src=["']\.\.\/(images\/[^"']+)["']/g, 'src="/blog/posts/$1"');
  
  return content;
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string) {
  try {
    // First check if we have this post in metadata
    const metadataPosts = parseBlogMetadata();
    const metaPost = metadataPosts.find(post => post.slug === slug);
    
    if (metaPost) {
      // Get content from the markdown file specified in metadata
      const mdPath = metaPost.markdownFilePath.startsWith('/') 
        ? path.join(process.cwd(), 'public', metaPost.markdownFilePath) 
        : path.join(process.cwd(), 'public', metaPost.markdownFilePath);
      
      let content, data;
      
      if (fs.existsSync(mdPath)) {
        const fileContents = fs.readFileSync(mdPath, 'utf8');
        const parsed = matter(fileContents);
        content = parsed.content;
        data = parsed.data;
      } else {
        // Fallback content if the markdown file doesn't exist
        content = `# ${metaPost.title}\n\n${metaPost.description || 'No content available for this blog post yet.'}`;
        data = {};
      }
      
      // Fix relative image paths
      const contentWithFixedPaths = fixImagePaths(content);
      
      // Enhanced markdown processing pipeline for GitHub-flavored markdown support
      const processedContent = await remark()
        .use(remarkParse)
        .use(remarkEmoji) // Support for emoji shortcodes
        .use(remarkGfm) // GitHub-flavored markdown (tables, strikethrough, etc.)
        .use(remarkRehype, { allowDangerousHtml: true }) // Convert markdown AST to HTML AST
        .use(rehypeRaw) // Parse HTML in markdown
        .use(rehypeSanitize) // Sanitize HTML
        .use(rehypeSlug) // Add IDs to headings
        .use(rehypeAutolinkHeadings) // Add links to headings
        .use(rehypeStringify) // Convert HTML AST to string
        .process(contentWithFixedPaths);
      
      const contentHtml = processedContent.toString();
      
      // Calculate read time
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);
      
      return {
        id: metaPost.id,
        slug,
        title: metaPost.title,
        description: metaPost.description,
        imagePath: metaPost.imagePath,
        date: metaPost.date ? new Date(metaPost.date).toISOString() : undefined,
        readTime,
        tags: metaPost.tags || [],
        content: contentHtml
      };
    }
    
    // Fallback to the original implementation
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Parse markdown frontmatter and content
    const { data, content } = matter(fileContents);
    
    // Fix relative image paths before processing
    const contentWithFixedPaths = fixImagePaths(content);
    
    // Enhanced markdown processing pipeline for GitHub-flavored markdown support
    const processedContent = await remark()
      .use(remarkParse)
      .use(remarkEmoji) // Support for emoji shortcodes
      .use(remarkGfm) // GitHub-flavored markdown (tables, strikethrough, etc.)
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert markdown AST to HTML AST
      .use(rehypeRaw) // Parse HTML in markdown
      .use(rehypeSanitize) // Sanitize HTML
      .use(rehypeSlug) // Add IDs to headings
      .use(rehypeAutolinkHeadings) // Add links to headings
      .use(rehypeStringify) // Convert HTML AST to string
      .process(contentWithFixedPaths);
    
    const contentHtml = processedContent.toString();
    
    // Calculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // Return blog post with content
    return {
      id: slug,
      slug,
      title: data.title,
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString() : undefined,
      readTime,
      tags: data.tags || [],
      imagePath: data.imagePath || '',
      content: contentHtml
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all blog post slugs for static path generation
 */
export function getAllPostSlugs() {
  // First check metadata posts
  const metadataPosts = parseBlogMetadata();
  if (metadataPosts.length > 0) {
    return metadataPosts.map(post => ({
      slug: post.slug
    }));
  }
  
  // Fallback to directory scan
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        slug: fileName.replace(/\.md$/, '')
      };
    });
} 