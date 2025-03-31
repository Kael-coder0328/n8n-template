'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * Interface representing a blog post
 */
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    description: string;
    date?: string;
    readTime?: number;
    tags?: string[];
    imagePath?: string;
}

/**
 * Props for the BlogList component
 */
interface BlogListProps {
    posts: BlogPost[];
    className?: string;
}

/**
 * BlogList component displays a grid of blog post cards
 */
const BlogList: React.FC<BlogListProps> = ({ posts, className = '' }) => {
    return (
        <div className={`w-full py-8 ${className}`}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center space-y-6">
                    <h2 className="text-3xl font-bold text-primary-400">
                        Latest Blogs
                    </h2>
                    <p className="text-foreground text-center max-w-2xl">
                        Explore technical writings, insights, and updates about software development and DevOps
                    </p>
                </div>

                <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link 
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group relative flex flex-col p-6 bg-background border border-accent shadow-lg rounded-lg hover:shadow-xl transition-all duration-200"
                        >
                            <article className="flex flex-col flex-1">
                                {post.imagePath && (
                                    <div className="mb-4 overflow-hidden rounded-lg h-40 w-full">
                                        <img 
                                            src={post.imagePath} 
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-primary-400 group-hover:text-primary-500 transition-colors">
                                        {post.title}
                                    </h3>
                                    <ArrowUpRight className="w-5 h-5 text-primary-400 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                                
                                <p className="text-foreground flex-grow">
                                    {post.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {post.tags?.map((tag) => (
                                        <span 
                                            key={tag}
                                            className="px-3 py-1 text-sm rounded-full bg-accent text-primary-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex items-center mt-4 text-sm text-foreground">
                                    {post.date && (
                                        <time className="mr-4" dateTime={post.date}>
                                            {new Date(post.date).toLocaleDateString()}
                                        </time>
                                    )}
                                    {post.readTime && (
                                        <span className="flex items-center">
                                            <span className="mr-1">📚</span>
                                            {post.readTime} min read
                                        </span>
                                    )}
                                </div>
                            </article>
                            
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogList; 