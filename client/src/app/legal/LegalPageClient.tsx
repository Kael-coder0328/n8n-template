'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'

// Define the sections content
const sections = {
  terms: [
    {
      title: '1. Terms of Use',
      content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily download one copy of the materials (information or software) on SaaS Platform\'s website for personal, non-commercial transitory viewing only.'
    },
    {
      title: '3. Disclaimer',
      content: 'The materials on SaaS Platform\'s website are provided on an \'as is\' basis. SaaS Platform makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      title: '4. Limitations',
      content: 'In no event shall SaaS Platform or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SaaS Platform\'s website.'
    }
  ],
  privacy: [
    {
      title: '1. Information Collection',
      content: 'We collect information that you provide directly to us, information we obtain automatically when you use our Services, and information from third party sources.'
    },
    {
      title: '2. Use of Information',
      content: 'We use the information we collect to provide, maintain, and improve our Services, to develop new ones, and to protect our Company and our users.'
    },
    {
      title: '3. Information Sharing',
      content: 'We do not share your personal information except in the limited circumstances described in this Privacy Policy.'
    },
    {
      title: '4. Data Security',
      content: 'We use reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction.'
    }
  ]
}

/**
 * Client component for the Legal page that handles interactive elements
 * This includes tab switching between Terms of Service and Privacy Policy
 */
export default function LegalPageClient() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  // Set the active tab based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab') as 'terms' | 'privacy'
    if (tab && (tab === 'terms' || tab === 'privacy')) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-light-foreground dark:text-dark-foreground">
            Legal Information
          </h1>
          <p className="mt-4 text-lg text-light-muted dark:text-dark-muted">
            Our terms of service and privacy policy
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'terms'
                ? 'bg-light-accent dark:bg-dark-accent text-white'
                : 'text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground'
            }`}
            aria-selected={activeTab === 'terms'}
            role="tab"
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-light-accent dark:bg-dark-accent text-white'
                : 'text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground'
            }`}
            aria-selected={activeTab === 'privacy'}
            role="tab"
          >
            Privacy Policy
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground mb-8">
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </h2>
          
          <div className="space-y-8">
            {sections[activeTab].map((section, index) => (
              <section key={index} className="space-y-4">
                <h3 className="text-xl font-semibold text-light-foreground dark:text-dark-foreground">
                  {section.title}
                </h3>
                <p className="text-light-muted dark:text-dark-muted leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
} 