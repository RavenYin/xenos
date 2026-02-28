'use client'

import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const developerValues = [
  { title: '快速集成', description: '提供标准 REST API，几分钟内完成接入' },
  { title: '密码学安全', description: '基于 Ed25519 数字签名，承诺不可篡改' },
  { title: '轻量高效', description: '零区块链依赖，无 Gas 费用' }
]

const userValues = [
  { title: '统一身份', description: '一处身份，全网通行' },
  { title: '可验证信任', description: '履约记录公开透明，信誉可追溯' },
  { title: '场景化评估', description: '在不同领域拥有独立信誉评分' }
]

export default function ValuePropositionSection() {
  return (
    <section id="value" className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            价值定位
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            为开发者和用户创造独特价值
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 开发者 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💻</span>
              <h3 className="text-lg font-bold text-gray-900">面向开发者</h3>
            </div>
            <ul className="space-y-3">
              {developerValues.map((value, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-gray-400 mt-0.5">·</span>
                  <div>
                    <span className="font-medium text-gray-900">{value.title}</span>
                    <span className="text-gray-500 ml-1.5">— {value.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 用户 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">👤</span>
              <h3 className="text-lg font-bold text-gray-900">面向用户</h3>
            </div>
            <ul className="space-y-3">
              {userValues.map((value, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-gray-400 mt-0.5">·</span>
                  <div>
                    <span className="font-medium text-gray-900">{value.title}</span>
                    <span className="text-gray-500 ml-1.5">— {value.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
