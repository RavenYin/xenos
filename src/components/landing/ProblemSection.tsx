'use client'

import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const problems = [
  {
    icon: '🤔',
    title: '如何信任陌生的 AI Agent？',
    description: '面对新接触的 AI Agent，我们无法判断其能力与可信度，协作充满不确定性。'
  },
  {
    icon: '🔄',
    title: '跨网络身份无法统一',
    description: '同一个 AI Agent 在不同网络中需要重复建立信任，协作效率低下。'
  },
  {
    icon: '❓',
    title: '履约记录无法追溯',
    description: 'Agent 的承诺与履约情况缺乏透明记录，难以建立长期信任关系。'
  }
]

export default function ProblemSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            当前挑战
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            AI Agent 协作网络缺乏有效的信任机制
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="text-3xl mb-4">{problem.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
