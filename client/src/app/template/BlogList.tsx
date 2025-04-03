'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/blog';
import { DEFAULT_BLOG_IMAGE } from '@/lib/image-utils';

// Sort options
const SORT_OPTIONS = ['Newest', 'Alphabetical'] as const;
type SortOption = typeof SORT_OPTIONS[number];

const TEMPLATES_PER_PAGE = 10;

interface BlogListProps {
  posts: Post[];
}

/**
 * BlogList component to display a list of templates with search, filter, and lazy loading
 */
export default function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('Newest');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [visibleTemplates, setVisibleTemplates] = useState(TEMPLATES_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get unique categories from first tag of each post
  const categories = [
    'All Categories',
    ...Array.from(
      new Set(
        posts
          .map(post => post.tags?.[0])
          .filter((tag): tag is string => typeof tag === 'string')
      )
    ).sort()
  ];

  // Get unique tags from all posts (excluding the first tag which is used as category)
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => 
        (post.tags?.slice(1) ?? []).filter((tag): tag is string => typeof tag === 'string')
      )
    )
  ).sort();

  // Filter posts based on search query, categories, and tags
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                          selectedCategories.includes('All Categories') ||
                          (post.tags?.[0] && selectedCategories.includes(post.tags[0]));
    
    const matchesTags = selectedTags.length === 0 ||
                       (post.tags?.slice(1).some(tag => selectedTags.includes(tag)) ?? false);
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      case 'Alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Get current page of posts
  const currentPosts = sortedPosts.slice(0, visibleTemplates);
  const hasMore = visibleTemplates < sortedPosts.length;

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, visibleTemplates]);

  // Load more templates
  const loadMoreTemplates = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleTemplates(prev => prev + TEMPLATES_PER_PAGE);
      setIsLoading(false);
    }, 500);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleTemplates(TEMPLATES_PER_PAGE);
  }, [searchQuery, selectedCategories, selectedTags, sortBy]);

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
            {isCategoryOpen && categories.length > 1 && (
              <div className="space-y-2">
                {categories.map((category) => (
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
            {isCategoryOpen && categories.length <= 1 && (
              <p className="text-sm text-gray-500">No categories available</p>
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
              Showing {currentPosts.length} of {sortedPosts.length} templates
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
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

          {/* Loading indicator and intersection observer target */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-8"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Loading more templates...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 