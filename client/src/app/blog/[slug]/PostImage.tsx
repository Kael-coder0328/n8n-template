'use client';

import React from 'react';
import Image from 'next/image';
import { handleImageError } from '@/lib/image-utils';

interface PostImageProps {
  src: string;
  alt: string;
}

export function PostImage({ src, alt }: PostImageProps) {
  return (
    <div className="w-full h-64 md:h-96 overflow-hidden relative bg-accent/20">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => handleImageError(e)}
      />
    </div>
  );
}

// Add default export
export default { PostImage }; 