'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/blog';
import { DEFAULT_BLOG_IMAGE } from '@/lib/image-utils';

// Predefined categories
const CATEGORIES = [
  'All Categories',
  'Client Management',
  'Marketing',
  'Finance',
  'Sales',
  'Project Management'
];

interface BlogListProps {
  posts: Post[];
}

/**
 * BlogList component to display a list of templates with search and filter functionality
 */
export default function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);

  // Get unique tags from all posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags ?? []))).sort();

  // Filter posts based on search query, categories, and tags
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                          selectedCategories.includes('All Categories') ||
                          (post.tags?.[0] && selectedCategories.includes(post.tags[0]));
    
    const matchesTags = selectedTags.length === 0 ||
                       (post.tags?.some(tag => selectedTags.includes(tag)) ?? false);
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'Most Popular':
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      case 'Newest':
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      case 'Alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (category === 'All Categories') {
        return prev.includes('All Categories') ? [] : ['All Categories'];
      }
      const newCategories = prev.filter(c => c !== 'All Categories');
      if (prev.includes(category)) {
        return newCategories.filter(c => c !== category);
      }
      return [...newCategories, category];
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No templates found</h2>
        <p className="text-gray-500">Check back later for new templates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Browse Templates</h1>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Search</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Categories Section */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4"
            >
              <span>Categories</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCategoryOpen && (
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Section - Placeholder */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4"
            >
              <span>Price Range</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${isPriceOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isPriceOpen && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">All templates are free</p>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4"
            >
              <span>Tags</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${isTagsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isTagsOpen && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={() => {
              // Reset filters
              setSelectedCategories([]);
              setSelectedTags([]);
              setSearchQuery('');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Apply Filters</span>
          </button>
        </div>

        <div className="lg:col-span-3">
          {/* Sort dropdown */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Showing {sortedPosts.length} templates
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <div
                key={post.slug}
                className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={post.imagePath || DEFAULT_BLOG_IMAGE}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  {post.tags?.[0] && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white mb-3">
                      {post.tags[0]}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.slice(1, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 rounded-md px-2 py-1 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/template/${post.slug}`}
                    className="mt-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 