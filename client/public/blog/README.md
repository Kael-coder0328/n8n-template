# Blog Content Management

This directory contains all the blog content for the n8n template application. This README provides guidelines on how to maintain the blog content, including metadata, images, and individual blog posts.

## Directory Structure

```
/blog
├── metadata.md       # Central metadata for all blog posts
├── posts/            # Directory containing all blog post markdown files
│   ├── *.md          # Individual blog post files
│   └── images/       # Directory containing all blog post images
│       └── *.jpg     # Image files (jpg, png, etc.)
└── README.md         # This file
```

## Metadata.md

The `metadata.md` file serves as a central registry for all blog posts. It contains essential metadata for each post in YAML format within the markdown.

### Format

```markdown
---
posts:
  - slug: post-slug
    title: Post Title
    description: A brief description of the post
    date: 2023-11-30
    image: /blog/posts/images/image-name.jpg
    tags:
      - tag1
      - tag2
  - slug: another-post-slug
    # ... more entries
---
```

### Required Fields

For each post entry in metadata.md, include:

| Field | Description | Format |
|-------|-------------|--------|
| slug | URL-friendly identifier | lowercase-with-hyphens |
| title | Post title | Text |
| description | Brief summary | 1-2 sentences |
| date | Publication date | YYYY-MM-DD |
| image | Featured image path | /blog/posts/images/filename.jpg |
| tags | Category tags | Array of strings |

### Adding a New Entry

1. Add a new entry at the top of the posts array (most recent first)
2. Ensure the slug matches the filename of the blog post (without .md extension)
3. Make sure the image path points to a valid image in the images directory

## Managing Images

All blog post images should be stored in the `/blog/posts/images/` directory.

### Image Guidelines

- **Formats**: Use .jpg, .png, or .webp formats
- **Dimensions**: Recommended 1200×675px (16:9 ratio) for featured images
- **Size**: Keep file sizes under 300KB for optimal performance
- **Naming**: Use descriptive, kebab-case names (e.g., `nextjs-n8n-integration.jpg`)
- **Default**: Use `default-post.jpg` for posts without a specific image

### Image Paths

When referencing images:

- In metadata.md: use `/blog/posts/images/image-name.jpg`
- In blog post content: use relative paths like `![Alt text](image-name.jpg)` or absolute paths like `![Alt text](/blog/posts/images/image-name.jpg)`

## Blog Posts

Individual blog posts are stored as markdown files in the `/blog/posts/` directory.

### File Naming

- Use kebab-case for filenames (e.g., `getting-started-with-n8n.md`)
- The filename (without .md) should match the slug in metadata.md

### Frontmatter Format

Each blog post should begin with YAML frontmatter:

```markdown
---
title: Getting Started with Next.js and n8n
description: Learn how to integrate Next.js with n8n for powerful workflow automation
date: 2023-09-15
tags: ["Next.js", "n8n", "Automation", "Tutorial"]
image: /blog/posts/images/nextjs-n8n.jpg
---

Content starts here...
```

### Content Guidelines

- Use standard Markdown syntax
- Heading levels: Start with H2 (`##`) as H1 is used for the title
- Code blocks: Use triple backticks with language specification
- Images: Use markdown image syntax with alt text
- Links: Use meaningful link text for accessibility

### Example Code Block

````markdown
```javascript
function example() {
  console.log('This is an example code block');
}
```
````

## SEO Best Practices

- **Titles**: 50-60 characters, include keywords
- **Descriptions**: 150-160 characters, summarize content
- **Tags**: 3-5 relevant tags per post
- **Image Alt Text**: Descriptive, include keywords
- **Slugs**: Short, descriptive, include main keyword

## Important Notes

1. When adding a new blog post, update both:
   - The individual post file in `/posts/`
   - The metadata.md file with the new entry

2. Always maintain consistency between:
   - The frontmatter in the blog post
   - The corresponding entry in metadata.md

3. Always use the correct image paths to prevent broken images

4. The metadata.md file takes precedence over individual file frontmatter

This README is a living document. Update it as necessary to reflect changes in the blog content management process. 