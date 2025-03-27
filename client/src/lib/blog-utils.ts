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

/**
 * Get all blog posts metadata from markdown files
 */
export function getAllPosts(): BlogPost[] {
  // Get all markdown files in the posts directory
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
        // We don't include content here to keep the list lighter
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
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        slug: fileName.replace(/\.md$/, '')
      };
    });
} 