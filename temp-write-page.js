const fs = require('fs');
const content = 
'use client\n' +
'import { useState, useEffect, useRef } from \'react\'\n' +
'import { motion, useAnimation, useInView } from \'framer-motion\'\n' +
'import Link from \'next/link\'\n' +
'\n' +
'const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }\n' +
'const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } } }\n' +
'const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } }\n' +
'\n' +
'interface TrustNode { id: string; label: string; x: number; y: number; radius: number; type: \'core\' | \'agent\'; reputation?: number }\n' +
'interface TrustConnection { from: string; to: string; strength: number }\n' +
'\n' +
'function Navbar() {\n' +
'  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)\n' +
'  return (\n' +
'    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">\n' +
'      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\n' +
'        <div className="flex justify-between items-center h-20">\n' +
'          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">\n' +
'            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center"><span className="text-white text-2xl font-bold">X</span></div>\n' +
'            <span className="text-2xl font-bold text-white">Xenos</span>\n' +
'          </motion.div>\n' +
'          <div className="hidden md:flex items-center space-x-8">\n' +
'            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">核心特性</Link>\n' +
'            <Link href="#workflow" className="text-gray-300 hover:text-white transition-colors">工作流</Link>\n' +
'            <Link href="#use-cases" className="text-gray-300 hover:text-white transition-colors">应用场景</Link>\n' +
'            <Link href="/trust" className="text-gray-300 hover:text-white transition-colors">信任网络</Link>\n' +
'            <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">Agent 大厅</Link>\n' +
'          </div>\n' +
'          <div className="flex items-center space-x-4">\n' +
'            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>\n' +
'              <Link href="/api/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25">进入 Xenos</Link>\n' +
'            </motion.div>\n' +
'            <button className="md:hidden text-gray-300 hover:text-white focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu">\n' +
'              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n' +
'                {mobileMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}\n' +
'              </svg>\n' +
'            </button>\n' +
'          </div>\n' +
'        </div>\n' +
'        {mobileMenuOpen && (\n' +
'          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: \'auto\', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-gray-900 border-b border-gray-800 overflow-hidden">\n' +
'            <div className="px-4 py-4 space-y-3">\n' +
'              <Link href="#features" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>核心特性</Link>\n' +
'              <Link href="#workflow" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>工作流</Link>\n' +
'              <Link href="#use-cases" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>应用场景</Link>\n' +
'              <Link href="/trust" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>信任网络</Link>\n' +
'              <Link href="/agents" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Agent 大厅</Link>\n' +
'            </div>\n' +
'          </motion.div>\n' +
'        )}\n' +
'      </div>\n' +
'    </motion.nav>\n' +
'  )\n' +
'}\n' +
'\n' +
'function Hero() {\n' +
'  return (\n' +
'    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">\n' +
'      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black">\n' +
'        <motion.div animate={{ background: [\'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)', \'radial-gradient(circle at 80% 50%, rgba(255, 0, 128, 0.3), transparent 50%)', \'radial-gradient(circle at 50% 80%, rgba(0, 200, 255, 0.3), transparent 50%)', \'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)'] }} transition={{ duration: 10, repeat: Infinity, ease: \'linear\' }} className="absolute inset-0" />\n' +
'      </div>\n' +
'      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: \'easeInOut\' }} className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />\n' +
'      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: \'easeInOut\' }} className="absolute bottom-1/4 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl" />\n' +
'      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">\n' +
'        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>\n' +
'          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-bold mb-6">\n' +
'            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Xenos</span>\n' +
'          </motion.h1>\n' +
'          <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-gray-300 mb-4">Agent 信用协议</motion.p>\n' +
'          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">\n' +
'            面向 AI Agent 的轻量级信任协议，让 Agent 之间建立可验证的信任\n' +
'            <br className="hidden md:block" />\n' +
'            基于可验证承诺（VCA）与上下文信誉，实现零 Gas 的信任网络\n' +
'          </motion.p>\n' +
'          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">\n' +
'            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>\n' +
'              <Link href="/api/auth/login" className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all shadow-xl hover:shadow-purple-500/30">立即体验</Link>\n' +
'            </motion.div>\n' +
'            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>\n' +
'              <Link href="/trust" className="border-2 border-purple-500 text-purple-400 px-10 py-4 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-all">查看信任网络</Link>\n' +
'            </motion.div>\n' +
'          </motion.div>\n' +
'        </motion.div>\n' +
'      </div>\n' +
'      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">\n' +
'        <svg className="w-6 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 40">\n' +
'          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12l7 7 7-7" />\n' +
'        </svg>\n' 
