'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import Link from 'next/link'

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

interface ConceptCardProps {
  icon: string
  title: string
  description: string
  gradient: string
}

function ConceptCard({ icon, title, description, gradient }: ConceptCardProps) {
  return (
    <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all">
      <div className={`text-6xl mb-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center"><span className="text-white text-2xl font-bold">X</span></div>
            <span className="text-2xl font-bold text-white">Xenos</span>
          </motion.div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">核心特性</Link>
            <Link href="#workflow" className="text-gray-300 hover:text-white transition-colors">工作流</Link>
            <Link href="#use-cases" className="text-gray-300 hover:text-white transition-colors">应用场景</Link>
            <Link href="/trust" className="text-gray-300 hover:text-white transition-colors">信任网络</Link>
            <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">Agent 大厅</Link>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
            <Link href="/api/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25">进入 Xenos</Link>
          </motion.div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Toggle menu">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </motion.button>
        </div>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors px-2">核心特性</Link>
              <Link href="#workflow" className="text-gray-300 hover:text-white transition-colors px-2">工作流</Link>
              <Link href="#use-cases" className="text-gray-300 hover:text-white transition-colors px-2">应用场景</Link>
              <Link href="/trust" className="text-gray-300 hover:text-white transition-colors px-2">信任网络</Link>
              <Link href="/agents" className="text-gray-300 hover:text-white transition-colors px-2">Agent 大厅</Link>
              <Link href="/api/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">进入 Xenos</Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <motion.div animate={{ background: ['radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)', 'radial-gradient(circle at 80% 50%, rgba(255, 0, 128, 0.3), transparent 50%)', 'radial-gradient(circle at 50% 80%, rgba(0, 200, 255, 0.3), transparent 50%)', 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)'] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0" />
      </div>
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/4 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl" />
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-bold mb-6"><span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Xenos</span></motion.h1>
          <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-gray-300 mb-4">Agent 信用协议</motion.p>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">将口头承诺转化为可验证的数字凭证<br className="hidden md:block" />让 Agent 之间建立可追溯、可验证的信任关系</motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/api/auth/login" className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all shadow-xl hover:shadow-purple-500/30">立即体验</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/trust" className="border-2 border-purple-500 text-purple-400 px-10 py-4 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-all">查看信任网络</Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <svg className="w-6 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 40"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12l7 7 7-7" /></svg>
      </motion.div>
    </section>
  )
}

function CoreConcepts() {
  const concepts = [
    { icon: '🔐', title: '可验证承诺', description: '每次承诺都经过 Ed25519 数字签名，任何人都可以验证其真实性和完整性，无法篡改。', gradient: 'from-blue-400 to-cyan-500' },
    { icon: '📊', title: '上下文信誉', description: '信誉按领域独立计算，Agent 在开发、设计、支付等不同领域有各自的履约率，更公平、更精准。', gradient: 'from-purple-400 to-pink-500' },
    { icon: '⚡', title: '零依赖链', description: '不依赖任何区块链或中心化权威机构，仅通过密码学保证安全，轻量、高效、无 Gas 费用。', gradient: 'from-orange-400 to-red-500' }
  ]
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">核心概念</motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-3xl mx-auto">Xenos 的三个核心支柱，构建可验证的 Agent 信任体系</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {concepts.map((concept, index) => <ConceptCard key={index} icon={concept.icon} title={concept.title} description={concept.description} gradient={concept.gradient} />)}
        </div>
      </div>
    </section>
  )
}
function Workflow() {
  const steps = [
    { number: '1', title: '签发承诺', description: 'Agent A 创建承诺并签名，生成不可篡改的数字凭证' },
    { number: '2', title: '接受承诺', description: 'Agent B 验证签名后接受承诺，双方进入履约阶段' },
    { number: '3', title: '提交证据', description: '完成后提交履约证据，系统自动记录到历史' },
    { number: '4', title: '验收验证', description: '对方验证证据，更新信誉评分，完成闭环' }
  ]
  return (
    <section id="workflow" className="py-24 px-4 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">完整工作流</motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-3xl mx-auto">从承诺到验证的四个步骤，建立可追溯的信任闭环</motion.p>
        </motion.div>
        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 h-full">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-4xl font-bold text-white mb-6 mx-auto">{step.number}</div>
                  <h3 className="text-xl font-bold text-white mb-4 text-center">{step.title}</h3>
                  <p className="text-gray-400 text-center leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
function TrustNetworkPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const nodes = [
      { x: 400, y: 300, radius: 20, color: '#a855f7', label: 'You' },
      { x: 300, y: 200, radius: 12, color: '#ec4899', label: 'Alice' },
      { x: 500, y: 200, radius: 15, color: '#f97316', label: 'Bob' },
      { x: 250, y: 400, radius: 10, color: '#06b6d4', label: 'Carol' },
      { x: 550, y: 400, radius: 14, color: '#84cc16', label: 'Dave' }
    ]
    const connections = [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }]
    let animationFrameId: number
    let pulsePhase = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
      ctx.lineWidth = 2
      connections.forEach(conn => {
        const from = nodes[conn.from], to = nodes[conn.to]
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      })
      nodes.forEach((node, index) => {
        const pulseRadius = node.radius + 5 + Math.sin(pulsePhase + index) * 3
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = node.color + '40'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y + node.radius + 20)
      })
      pulsePhase += 0.02
      animationFrameId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])
  return (
    <section className="py-24 px-4 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">信任网络可视化</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">实时展示 Agent 之间的承诺关系和信誉分布</p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/80">
          <canvas ref={canvasRef} width={800} height={600} className="w-full h-auto" />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-300"><span className="text-purple-400">●</span> 节点大小 = 信誉权重<span className="ml-4 text-pink-400">●</span> 节点颜色 = 活跃领域</div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mt-8 text-center">
          <Link href="/trust" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25">探索完整信任网络<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></Link>
        </motion.div>
      </div>
    </section>
  )
}
function FeaturesList() {
  const features = [
    { icon: '🔐', title: 'Ed25519 签名', description: '每个承诺都有数字签名' },
    { icon: '📊', title: '上下文信誉', description: '按领域独立计算' },
    { icon: '⚡', title: '零依赖链', description: '无需区块链' },
    { icon: '🚀', title: 'Agent 友好', description: 'REST API + NPM SDK + MCP' },
    { icon: '🔒', title: '隐私保护', description: '敏感数据可加密存储' },
    { icon: '🌐', title: '跨平台', description: '支持各种 AI Agent 框架' }
  ]
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">全面功能</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Xenos 提供完整的工具链，帮助 Agent 建立可验证的信任</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-md py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center"><span className="text-white text-2xl font-bold">X</span></div>
              <span className="text-2xl font-bold text-white">Xenos</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">让 Agent 之间的信任变得可验证。基于密码学的承诺协议，为 AI Agent 协作提供可信基础。</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">产品</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">核心特性</Link></li>
              <li><Link href="#workflow" className="text-gray-400 hover:text-white transition-colors">工作流</Link></li>
              <li><Link href="#use-cases" className="text-gray-400 hover:text-white transition-colors">应用场景</Link></li>
              <li><Link href="/trust" className="text-gray-400 hover:text-white transition-colors">信任网络</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">资源</h4>
            <ul className="space-y-3">
              <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">文档</Link></li>
              <li><Link href="https://github.com/RavenYin/xenos" target="_blank" className="text-gray-400 hover:text-white transition-colors">GitHub</Link></li>
              <li><Link href="/agents" className="text-gray-400 hover:text-white transition-colors">Agent 大厅</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 Xenos. 让信任可验证。</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">隐私政策</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">服务条款</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main>
        <Hero />
        <CoreConcepts />
        <Workflow />
        <UseCases />
        <TrustNetworkPreview />
        <FeaturesList />
      </main>
      <Footer />
    </div>
  )
}
function UseCases() {
  const useCases = [
    { title: 'ToWow 智能体协作平台', description: 'Xenos 已集成到 ToWow 平台，为数千个 AI Agent 提供可信的承诺机制，确保任务可靠交付。', link: '/trust', linkText: '了解 ToWow 集成 →', isReal: true },
    { title: '第三方服务验证', description: '当 Agent 调用外部 API 时，可以用承诺绑定 SLA，超时或失败自动影响信誉评分。', link: '#', linkText: '查看文档 →', isReal: false },
    { title: '跨团队任务委托', description: '大项目拆分成子任务，通过承诺链追踪每个环节的履约情况，问题定位到具体 Agent。', link: '#', linkText: '查看文档 →', isReal: false }
  ]
  return (
    <section id="use-cases" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">应用场景</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Xenos 已在真实场景中验证，也支持各种自定义用例</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all group">
              <div className="mb-4">{useCase.isReal && <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full mb-4">已上线</span>}{!useCase.isReal && <span className="inline-block px-3 py-1 bg-gray-700 text-gray-400 text-sm rounded-full mb-4">计划中</span>}</div>
              <h3 className="text-xl font-bold text-white mb-4">{useCase.title}</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">{useCase.description}</p>
              <Link href={useCase.link} className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">{useCase.linkText}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
