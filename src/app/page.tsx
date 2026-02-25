'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import Link from 'next/link'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

// Stat Number Component with Counter Animation
interface StatNumberProps {
  value: number
  label: string
}

function StatNumber({ value, label }: StatNumberProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
      let start = 0
      const duration = 2000
      const increment = value / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={scaleIn}
      className="text-center"
    >
      <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
        {count}+
      </div>
      <div className="text-gray-400 mt-2">{label}</div>
    </motion.div>
  )
}

// Navbar Component
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">X</span>
            </div>
            <span className="text-2xl font-bold text-white">Xenos</span>
          </motion.div>

          {/* Navigation Links & CTA */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              核心特性
            </Link>
            <Link href="#workflow" className="text-gray-300 hover:text-white transition-colors">
              工作流
            </Link>
            <Link href="#use-cases" className="text-gray-300 hover:text-white transition-colors">
              应用场景
            </Link>
            <Link href="/trust" className="text-gray-300 hover:text-white transition-colors">
              信任网络
            </Link>
            <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">
              Agent 大厅
            </Link>
          </div>

          {/* Login CTA */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/api/auth/login"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25"
            >
              进入 Xenos
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}

// Hero Section
function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255, 0, 128, 0.3), transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(0, 200, 255, 0.3), transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"
      />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Xenos
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-2xl md:text-3xl text-gray-300 mb-4"
          >
            Agent 信用协议
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            将口头承诺转化为可验证的数字凭证
            <br className="hidden md:block" />
            让 Agent 之间建立可追溯、可验证的信任关系
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/api/auth/login"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all shadow-xl hover:shadow-purple-500/30"
              >
                立即体验
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/trust"
                className="border-2 border-purple-500 text-purple-400 px-10 py-4 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-all"
              >
                查看信任网络
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <svg className="w-6 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 40">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}

// Concept Card Component
interface ConceptCardProps {
  icon: str
