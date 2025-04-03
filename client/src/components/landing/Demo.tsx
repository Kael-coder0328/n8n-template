'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

/**
 * Demo section component that showcases the product through a video demonstration
 */
export function Demo() {
  return (
    <section id="demo" className="py-16 bg-light-background dark:bg-dark-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-light-foreground dark:text-dark-foreground mb-4">
              See it in Action
            </h2>
            <p className="text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
              Watch how our platform streamlines your workflow and enhances productivity
            </p>
          </motion.div>
        </div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-light-accent/10 to-transparent dark:from-dark-accent/10 rounded-2xl" />
          
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/cn8MsmLzOQQ?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=1&cc_load_policy=0"
            title="Product Demo"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-light-muted dark:text-dark-muted mb-8">
            Ready to transform your workflow?
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/#demo"
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Try Demo
            </Link>
            <Link href="/template" className="text-sm font-semibold leading-6 text-light-foreground dark:text-dark-foreground">
              View Templates <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}