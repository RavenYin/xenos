'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function CTASection() {
  return (
    <section className="py-16 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          让可信成为 Agent 网络的基础设施
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-gray-400 mb-8 max-w-lg mx-auto"
        >
          加入 Xenos，构建可信的 AI Agent 协作网络
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link
            href="/api/auth/login"
            className="bg-white text-gray-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            开始使用
          </Link>
          <Link
            href="https://github.com/RavenYin/xenos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 px-6 py-3 rounded-lg text-sm font-medium hover:text-white transition-colors"
          >
            查看文档
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
