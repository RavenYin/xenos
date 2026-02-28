'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Hero() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center pt-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight"
        >
          一契立信，万物可协
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto"
        >
          从陌生到可信，靠的不是预设身份，而是可验证的履约
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link
            href="/api/auth/login"
            className="bg-gray-900 text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            开始使用
          </Link>
          <Link
            href="#solution"
            className="text-gray-600 px-7 py-3 rounded-lg text-sm font-medium hover:text-gray-900 transition-colors"
          >
            了解更多
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
