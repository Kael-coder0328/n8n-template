import Script from 'next/script';

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Script id="handle-image-errors" strategy="afterInteractive">
        {`
          document.addEventListener('DOMContentLoaded', function() {
            const defaultImage = '/blog/posts/images/default-post.jpg';
            
            // Find all images in blog posts and add error handlers
            document.querySelectorAll('img').forEach(img => {
              img.addEventListener('error', function() {
                if (this.src !== defaultImage) {
                  this.src = defaultImage;
                }
              });
            });
          });
        `}
      </Script>
    </>
  );
} 