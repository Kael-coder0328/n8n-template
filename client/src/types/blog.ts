/**
 * Interface representing a blog post
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
  readTime?: number;
  tags?: string[];
  imagePath?: string;
} 