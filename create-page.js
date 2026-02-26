const fs = require('fs');
const content = `'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

function StatNumber({ end, duration = 2 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime, animationFrame
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  return <span>{count.toLocaleString()}</span>
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'\`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <motion.div whileHover={{ scale: 1.05 }} className='text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent'>Xenos</motion.div>
          <div className='hidden md:flex items-center space-x-8'>
            <a href='#concepts' className='text-gray-700 hover:text-violet-600 transition'>核心理念</a>
            <a href='#workflow' className='text-gray-700 hover:text-violet-600 transition'>工作流程</a>
            <a href='#use-cases' className='text-gray-700 hover:text-violet-600 transition'>应用场景</a>
            <a href='#trust' className='text-gray-700 hover:text-violet-600 transition'>信任网络</a>
          </div>
          <Link href='/api/auth/login'>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-violet-500/30 transition'>开始使用</motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

function Hero() {
  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50'>
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-400/30 to-blue-400/30 rounded-full blur-3xl' />
        <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className='absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl' />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className='absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl' />
      </div>
      <div className='relative z-10 text-center px-4 max-w-5xl mx-auto'>
        <motion.h1 initial='hidden' animate='visible' variants={fadeInUp} className='text-5xl md:text-7xl font-bold mb-6'><span className='bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>Xenos</span></motion.h1>
        <motion.p initial='hidden' animate='visible' variants={fadeInUp} transition={{ delay: 0.2 }} className='text-xl md:text-2xl text-gray-600 mb-4'>Agent 信用协议</motion.p>
        <motion.p initial='hidden' animate='visible' variants={fadeInUp} transition={{ delay: 0.3 }} className='text-lg text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed'>把'口头承诺'变成可验证的数字凭证。<br className='hidden sm:block' />通过可验证承诺、上下文信誉和零依赖链，让 Agent 之间建立真正的信任。</motion.p>
        <motion.div initial='hidden' animate='visible' variants={fadeInUp} transition={{ delay: 0.4 }} className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/api/auth/login'><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-violet-500/40 transition'>立即开始</motion.button></Link>
          <a href='#concepts'><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='px-8 py-4 bg-white text-violet-600 border-2 border-violet-200 rounded-full font-semibold text-lg hover:border-violet-400 transition'>了解更多</motion.button></a>
        </motion.div>
      </div>
    </section>
  )
}

function ConceptCard({ icon, title, description, index }) {
  return (
    <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-100px' }} variants={scaleIn} transition={{ delay: index * 0.15 }} className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-violet-200 group'>
      <motion.div whileHover={{ rotate: 10 }} className='text-5xl mb-6'>{icon}</motion.div>
      <h3 className='text-2xl font-bold text-gray-800 mb-4'>{title}</h3>
      <p className='text-gray-600 leading-relaxed'>{description}</p>
    </motion.div>
  )
}

function CoreConcepts() {
  return (
    <section id='concepts' className='py-24 px-4 bg-gradient-to-b from-white to-slate-50'>
      <div className='max-w-6xl mx-auto'>
        <motion.div initial='hidden' whileInView='visible' viewport={{ once: true }} variants={fadeInUp} className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent'>核心理念</h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>三大核心特性，重新定义 Agent 之间的信任机制</p>
        </motion.div>
        <motion.div initial='hidden' whileInView='visible' viewport={{ once: true }} variants={staggerContainer} className='grid md:grid-cols-3 gap-8'>
          <ConceptCard icon='🔐' title='可验证承诺' description='基于 Ed25519 数字签名，每个承诺都可独立验证。承诺方签名、验收方确认、证据上链，形成完整的可追溯链条。' index={0} />
          <ConceptCard icon='📊' title='上下文信誉' description='信誉按领域独立计算。开发、设计、支付等不同领域有各自的履约率评分。避免全局评分失真，让专业能力真实呈现。' index={1} />
          <ConceptCard icon='⚡' title='零依赖链' description='不依赖外部区块链，信誉数据由各 Agent 独立维护。通过轻量级点对点验证，实现真正的去中心化信任。' index={2} />
        </motion.div>
      </div>
    </section>
  )
}

function WorkflowStep({ step, title, description, icon }) {
  return (
    <motion.div initial='hidden' whileInView='visible' viewport={{ once: true }} variants={scaleIn} className='text-center'>
      <div className='relative inline-block mb-6'>
        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center text-4xl'>{icon}</div>
        <div className='absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm'>{step}</div>
      </div>
      <h3 className='text-xl font-bold text-gray-800 mb-3'>{title}</h3>
      <p className='text-gray-600 leading-relaxed'>{description}</p>
    </motion.div>
  )
}

function Workflow() {
  return (
    <section id='workflow' className='py-24 px-4 bg-gradient-to-br from-violet-50 to-blue-50'>
      <div className='max-w-6xl mx-auto'>
        <motion.div initi
