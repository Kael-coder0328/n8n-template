// import { Metadata } from 'next'
// import JsonLd from '@/components/seo/JsonLd'

// // Import the waiting list client component
// import WaitingListPageClient from './WaitingListPageClient'

// // Generate metadata for waiting list landing page
// export const generateMetadata = (): Metadata => {
//   return {
//     title: 'Join the Waitlist | Exclusive Early Access to Our SaaS Platform',
//     description: 'Be the first to experience our revolutionary SaaS platform. Join our waiting list for early access and exclusive updates on our launch.',
//     keywords: ['waitlist', 'early access', 'saas', 'beta access', 'upcoming launch', 'new platform'],
//     openGraph: {
//       type: 'website',
//       url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
//       images: [
//         {
//           url: '/images/waitlist-og-image.jpg',
//           width: 1200,
//           height: 630,
//           alt: 'Join our SaaS Platform Waitlist'
//         }
//       ]
//     },
//     alternates: {
//       canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
//     }
//   }
// }

// // Waitlist page structured data
// const waitlistPageData = {
//   '@context': 'https://schema.org',
//   '@type': 'WebPage',
//   name: 'SaaS Platform Waitlist',
//   description: 'Join our waiting list for early access to our revolutionary SaaS platform.',
//   url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
//   publisher: {
//     '@type': 'Organization',
//     name: 'SaaS Company',
//     logo: {
//       '@type': 'ImageObject',
//       url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/images/logo.png`
//     }
//   }
// }

// /**
//  * Landing page that renders the waiting list component
//  * and includes SEO metadata
//  */
// export default function Home() {
//   return (
//     <>
//       {/* Add structured data */}
//       <JsonLd data={waitlistPageData} />
      
//       {/* Client component for interactivity */}
//       <WaitingListPageClient />
//     </>
//   )
// }


import { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'

// Import the client component with a properly resolved path
// Now using direct relative import since it's in the same directory
import HomePageClient from './HomePageClient'

// Generate metadata for homepage
export const generateMetadata = (): Metadata => {
  return {
    title: 'n8n Templates for Solopreneurs and small teams',
    description: 'Explore our collection of free n8n templates designed for solopreneurs and small teams to enhance productivity and streamline workflows.',
    keywords: ['n8n', 'templates', 'solopreneurs', 'productivity', 'workflow automation', 'free resources'],
    openGraph: {
      type: 'website',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://n8ntemplates.prosamik.com',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'SaaS Platform'
        }
      ]
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://n8ntemplates.prosamik.com'
    }
  }
}

// Homepage structured data
const homePageData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'n8n Free Templates',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://n8ntemplates.prosamik.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://n8ntemplates.prosamik.com'}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
}

/**
 * Homepage server component that renders the client component
 * and includes SEO metadata
 */
export default function Home() {
  return (
    <>
      {/* Add structured data */}
      <JsonLd data={homePageData} />
      
      {/* Client component for interactivity */}
      <HomePageClient />
    </>
  )
}