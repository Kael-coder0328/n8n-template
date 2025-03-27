'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

/**
 * Component that initializes Prism.js when mounted
 * This ensures syntax highlighting works even with client-side navigation
 */
export default function PrismInit() {
  useEffect(() => {
    // Initialize Prism.js on component mount
    Prism.highlightAll();

    // Re-highlight when content changes - useful for client-side navigation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any of the added nodes contain code elements
          const hasCodeElements = Array.from(mutation.addedNodes).some((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              return (node as Element).querySelectorAll('pre code').length > 0;
            }
            return false;
          });

          if (hasCodeElements) {
            // Re-highlight all code blocks
            Prism.highlightAll();
          }
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
