'use client';

import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { processContentImages, DEFAULT_BLOG_IMAGE } from '@/lib/image-utils';

interface MarkdownContentProps {
  content: string;
}

/**
 * Custom MarkdownContent component with syntax highlighting and code copy buttons
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Process content to fix image paths
  const processedContent = processContentImages(content);

  // Add copy buttons to code blocks and apply syntax highlighting after content is rendered
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply Prism.js syntax highlighting
    Prism.highlightAllUnder(containerRef.current);
    
    // Find all pre elements (code blocks)
    const preElements = containerRef.current.querySelectorAll('pre');
    
    preElements.forEach((preElement) => {
      // Only add copy button if it doesn't already exist
      if (!preElement.querySelector('.copy-button')) {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.setAttribute('aria-label', 'Copy code');
        copyButton.setAttribute('title', 'Copy code');
        
        // Add click event to copy button
        copyButton.addEventListener('click', () => {
          // Find code element within pre
          const codeElement = preElement.querySelector('code');
          if (!codeElement) return;
          
          // Copy code to clipboard
          const textToCopy = codeElement.textContent || '';
          navigator.clipboard.writeText(textToCopy)
            .then(() => {
              // Indicate successful copy with checkmark icon
              copyButton.classList.add('copied');
              copyButton.setAttribute('title', 'Copied!');
              
              setTimeout(() => {
                copyButton.classList.remove('copied');
                copyButton.setAttribute('title', 'Copy code');
              }, 2000);
            })
            .catch(err => {
              console.error('Could not copy text: ', err);
              copyButton.setAttribute('title', 'Failed to copy');
              
              setTimeout(() => {
                copyButton.setAttribute('title', 'Copy code');
              }, 2000);
            });
        });
        
        // Add button to pre element
        preElement.appendChild(copyButton);
      }
    });
    
    // Process emojis
    processEmojis(containerRef.current);

    // Add error handling to all images
    const imageElements = containerRef.current.querySelectorAll('img');
    imageElements.forEach(img => {
      img.addEventListener('error', () => {
        if (img.src !== DEFAULT_BLOG_IMAGE) {
          img.src = DEFAULT_BLOG_IMAGE;
        }
      });
    });
  }, [processedContent]);
  
  /**
   * Process emoji shortcodes
   */
  const processEmojis = (element: HTMLElement) => {
    const emojiMap: Record<string, string> = {
      ":smile:": "😊",
      ":heart:": "❤️",
      ":rocket:": "🚀",
      // Add more emoji mappings as needed
    };
    
    // Find all text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Node[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // Replace emoji shortcodes with actual emojis
    textNodes.forEach(textNode => {
      if (!textNode.textContent) return;
      
      let newContent = textNode.textContent;
      Object.entries(emojiMap).forEach(([shortcode, emoji]) => {
        newContent = newContent.replace(new RegExp(shortcode, 'g'), emoji);
      });
      
      if (newContent !== textNode.textContent) {
        textNode.textContent = newContent;
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className="prose prose-blue dark:prose-invert prose-lg max-w-none
                 prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium
                 prose-p:text-base prose-p:leading-7 
                 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic
                 prose-ul:list-disc prose-ol:list-decimal
                 prose-li:my-1
                 prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-gray-800
                 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
                 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:text-sm prose-pre:font-mono prose-pre:rounded prose-pre:overflow-x-auto
                 prose-img:rounded-md prose-img:mx-auto prose-img:max-w-full prose-img:max-h-[500px]
                 prose-table:border-collapse prose-table:my-6
                 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
                 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 