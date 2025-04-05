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
        <h2 className="text-2xl font-semibold mb-4 text-light-foreground dark:text-dark-foreground">No templates found</h2>
        <p className="text-light-muted dark:text-dark-muted">Check back later for new templates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-light-foreground dark:text-dark-foreground">Search</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-light-accent dark:border-dark-accent rounded-md bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-light-muted dark:placeholder-dark-muted"
              />
              <span className="absolute right-3 top-2.5 text-light-muted dark:text-dark-muted">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Categories Section */}
          <div className="border-t border-light-accent dark:border-dark-accent pt-6">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4 text-light-foreground dark:text-dark-foreground"
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
                      className="h-4 w-4 text-[#FF4405] focus:ring-[#FF4405] border-light-accent dark:border-dark-accent rounded bg-white dark:bg-dark-background"
                    />
                    <span className="text-sm text-light-foreground dark:text-dark-foreground">{category}</span>
                  </label>
                ))}
              </div>
            )}
            {isCategoryOpen && categories.length <= 1 && (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
          </div>

          {/* Price Range Section */}
          <div className="border-t border-light-accent dark:border-dark-accent pt-6">
            <button
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4 text-light-foreground dark:text-dark-foreground"
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
              <p className="text-light-muted dark:text-dark-muted">All templates are free</p>
            )}
          </div>

          {/* Tags Section */}
          <div className="border-t border-light-accent dark:border-dark-accent pt-6">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex justify-between items-center w-full text-lg font-semibold mb-4 text-light-foreground dark:text-dark-foreground"
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
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-[#FF4405] text-white'
                        : 'bg-white dark:bg-dark-background border border-light-accent dark:border-dark-accent text-light-foreground dark:text-dark-foreground hover:bg-light-accent/5 dark:hover:bg-dark-accent/5'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedCategories([]);
              setSelectedTags([]);
              setSearchQuery('');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-[#FF4405] hover:bg-[#E43D04] rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4405]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Apply Filters</span>
          </button>
        </div>

        <div className="lg:col-span-3">
          {/* Sort dropdown */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-light-muted dark:text-dark-muted">
              Showing {currentPosts.length} of {sortedPosts.length} templates
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-light-accent dark:border-dark-accent rounded-md bg-white dark:bg-dark-background text-light-foreground dark:text-dark-foreground focus:ring-2 focus:ring-[#FF4405] focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/template/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-light-accent/10 dark:bg-dark-accent/10">
                  <Image
                    src={post.imagePath || DEFAULT_BLOG_IMAGE}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#0A0F1C] dark:bg-dark-background text-white">
                      {post.tags?.[0]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-light-foreground dark:text-dark-foreground group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-base text-light-muted dark:text-dark-muted">
                      {post.description}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags?.slice(1).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-accent/10 dark:bg-dark-accent/10 text-light-foreground dark:text-dark-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center mt-8">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Intersection observer target */}
          <div ref={loadMoreRef} className="h-4" />
        </div>
      </div>
    </div>
  );
} 