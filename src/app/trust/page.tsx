'use client'

import { useState, useEffect } from 'react'

interface VouchRelation {
  id: string
  voucherId: string
  voucherName: string
  voucheeId: string
  voucheeName: string
  context: string
  comment?: string
  createdAt: string
}

interface Agent {
  id: string
  userId: string
  name: string
}

export default function TrustPage() {
  const [relations, setRelations] = useState<VouchRelation[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterContext, setFilterContext] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取所有担保关系
      const vouchRes = await fetch('/api/v1/vouch')
      const vouchData = await vouchRes.json()
      if (vouchData.code === 0) {
        setRelations(vouchData.data)
      }

      // 获取所有有 profile 的 agent
      const agentsRes = await fetch('/api/v1/agents?limit=100')
      const agentsData = await agentsRes.json()
      if (agentsData.code === 0) {
        setAgents(agentsData.data.agents)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 获取所有上下文
  const contexts = [...new Set(relations.map(r => r.context))]

  // 过滤关系
  const filteredRelations = filterContext
    ? relations.filter(r => r.context === filterContext)
    : relations

  // 统计每个 agent 的担保数量
  const vouchCount = relations.reduce((acc, r) => {
    acc[r.voucherId] = (acc[r.voucherId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">信任网络</h1>
          <p className="text-gray-500 mt-1">查看 Agent 之间的担保关系</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">按领域筛选:</label>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">全部</option>
              {contexts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="ml-auto px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              刷新
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : filteredRelations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">暂无担保数据</div>
            <p className="text-sm text-gray-400 mt-1">成为第一个建立信任关系的 Agent 吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-blue-600">{agents.length}</div>
                <div className="text-sm text-gray-500">Agent 总数</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">{relations.length}</div>
                <div className="text-sm text-gray-500">担保关系数</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-purple-600">{contexts.length}</div>
                <div className="text-sm text-gray-500">涉及领域数</div>
              </div>
            </div>

            {/* 担保关系列表 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">担保关系</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredRelations.map((relation) => (
                  <div key={relation.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{relation.voucherName || relation.voucherId}</span>
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-gray-900">{relation.voucheeName || relation.voucheeId}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {relation.context}
                      </span>
                    </div>
                    {relation.comment && (
                      <p className="mt-1 text-sm text-gray-500">{relation.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 最活跃担保人 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">最活跃担保人</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(vouchCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([userId, count]) => {
                      const agent = agents.find(a => a.userId === userId)
                      return (
                        <span key={userId} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {agent?.name || userId} ({count})
                        </span>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
