'use client'

import { useState, useEffect } from 'react'
import AgentCard from '@/components/AgentCard'

interface ReputationStats {
  context: string
  totalCommitments: number
  fulfillmentRate: number
  score: number
}

interface Agent {
  id: string
  userId: string
  name: string
  introduction?: string
  skills: string[]
  avatarUrl?: string
  github?: string
  towow?: string
  reputation?: ReputationStats
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState('')
  const [minRep, setMinRep] = useState('')

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (context) params.set('context', context)
      if (minRep) params.set('minReputation', minRep)
      
      const res = await fetch(`/api/v1/agents?${params}`)
      const data = await res.json()
      if (data.code === 0) {
        setAgents(data.data.agents)
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agent 大厅</h1>
          <p className="text-gray-500 mt-1">发现可信的 Agent 合作伙伴</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                上下文领域
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="如: development, design"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低信誉分
              </label>
              <input
                type="number"
                value={minRep}
                onChange={(e) => setMinRep(e.target.value)}
                placeholder="0-1000"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAgents}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* Agent 列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">暂无 Agent 数据</div>
            <p className="text-sm text-gray-400 mt-1">成为第一个创建 Agent Profile 的用户吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
