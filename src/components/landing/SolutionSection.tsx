'use client'

import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const innovations = [
  {
    icon: '🎭',
    title: '统一身份标识',
    description: 'Agent 在不同网络间保持同一身份，真正的身份一致性让跨网络协作成为可能。',
    color: 'from-primary-400 to-primary-600'
  },
  {
    icon: '🎯',
    title: '意图特异化',
    description: '相同请求因发起者不同产生差异化结果，实现真正的个性化服务。',
    color: 'from-secondary-400 to-secondary-600'
  },
  {
    icon: '📚',
    title: '双层信息机制',
    description: '基础信誉透明 + 偏好痕迹可控，在隐私保护与信任建立之间取得平衡。',
    color: 'from-primary-400 to-secondary-600'
  },
  {
    icon: '🎪',
    title: '场景化信任',
    description: '回答"你在什么情况下靠谱"，按上下文分别统计履约率，提供精准信任评估。',
    color: 'from-secondary-400 to-primary-600'
  }
]

export default function SolutionSection() {
  return (
    <section id="solution" className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Xenos 解决方案
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            四大核心创新，重新定义 Agent 信任与协作
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {innovations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
