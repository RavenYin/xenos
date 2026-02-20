'use client'

import { useState, useEffect } from 'react'

interface ReputationData {
  overall: {
    totalCommitments: number
    totalFulfilled: number
    totalFailed: number
    overallRate: number
    score: number
  }
  byContext: Array<{
    context: string
    totalCommitments: number
    fulfilledCount: number
    failedCount: number
    pendingCount: number
    fulfillmentRate: number
    score: number
  }>
}

const levelInfo: Record<string, { label: string; color: string; bgColor: string }> = {
  legendary: { label: '传奇', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  master: { label: '大师', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  expert: { label: '专家', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  skilled: { label: '熟练', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  novice: { label: '入门', color: 'text-lime-600', bgColor: 'bg-lime-100' },
  newcomer: { label: '新人', color: 'text-gray-600', bgColor: 'bg-gray-100' }
}

function getLevel(score: number) {
  if (score >= 900) return 'legendary'
  if (score >= 750) return 'master'
  if (score >= 600) return 'expert'
  if (score >= 400) return 'skilled'
  if (score >= 200) return 'novice'
  return 'newcomer'
}

export default function ReputationDisplay() {
  const [data, setData] = useState<ReputationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReputation()
  }, [])

  const fetchReputation = async () => {
    try {
      const res = await fetch('/api/vca/stats')
      const result = await res.json()
      if (result.code === 0) {
        setData(result.data)
      } else {
        setError(result.error || '获取信誉数据失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">加载中...</div>
  }

  if (error || !data) {
    return <div className="py-8 text-center text-red-500">{error || '暂无数据'}</div>
  }

  const level = getLevel(data.overall.score)
  const info = levelInfo[level]

  return (
    <div className="space-y-6">
      {/* 总体信誉卡片 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">信誉评分</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.bgColor} ${info.color}`}>
            {info.label}
          </span>
        </div>

        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-bold text-gray-900">{data.overall.score}</span>
          <span className="text-gray-500 text-lg mb-2">/ 1000</span>
        </div>

        {/* 进度条 */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${(data.overall.score / 1000) * 100}%` }}
          />
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900">{data.overall.totalCommitments}</div>
            <div className="text-sm text-gray-500">总承诺</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-600">{data.overall.totalFulfilled}</div>
            <div className="text-sm text-gray-500">已完成</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-semibold text-red-600">{data.overall.totalFailed}</div>
            <div className="text-sm text-gray-500">已失败</div>
          </div>
          <div className="p-3 bg-primary-50 rounded-lg">
            <div className="text-2xl font-semibold text-primary-600">
              {data.overall.overallRate != null ? data.overall.overallRate.toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-gray-500">履约率</div>
          </div>
        </div>
      </div>

      {/* 按上下文统计 */}
      {data.byContext.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">按场景统计</h3>
          <div className="space-y-3">
            {data.byContext.map((ctx) => (
              <div key={ctx.context} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{ctx.context}</div>
                  <div className="text-sm text-gray-500">
                    {ctx.fulfilledCount}/{ctx.totalCommitments} 完成
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{ctx.score}</div>
                  <div className="text-sm text-gray-500">分数</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
