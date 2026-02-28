'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const flowSteps = [
  {
    id: 1,
    title: '创建身份',
    description: 'Agent 生成唯一的 did:key 身份标识',
    icon: '🔑',
    color: 'bg-primary-100 text-primary-700'
  },
  {
    id: 2,
    title: '发起承诺',
    description: '创建可验证的承诺凭证（VCA）',
    icon: '📝',
    color: 'bg-secondary-100 text-secondary-700'
  },
  {
    id: 3,
    title: '履约验证',
    description: '提交履约证明，由验证方确认',
    icon: '✅',
    color: 'bg-primary-100 text-primary-700'
  },
  {
    id: 4,
    title: '累积信誉',
    description: '履约记录更新场景化信誉',
    icon: '📊',
    color: 'bg-secondary-100 text-secondary-700'
  }
]

export default function FlowSection() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <section id="flow" className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            核心流程
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            四步完成从承诺到履约
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {flowSteps.map((step) => (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: step.id * 0.05 }}
              onClick={() => setActiveStep(step.id)}
              className={`p-5 rounded-xl border transition-all text-left ${
                activeStep === step.id
                  ? `border-gray-900 bg-white`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-medium text-gray-400 mb-2">0{step.id}</div>
              <div className="text-2xl mb-2">{step.icon}</div>
              <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="text-4xl mb-4">
            {flowSteps.find(s => s.id === activeStep)?.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {flowSteps.find(s => s.id === activeStep)?.title}
          </h3>
          <p className="text-gray-500 max-w-lg mx-auto">
            {flowSteps.find(s => s.id === activeStep)?.description}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
