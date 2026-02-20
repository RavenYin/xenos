'use client'

import { useState, useEffect } from 'react'

interface Commitment {
  id: string
  context: string
  task: string
  status: 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'
  deadline: string | null
  createdAt: string
  promiser: { id: string; name: string; avatarUrl?: string }
  receiver: { id: string; name: string; avatarUrl?: string } | null
  attestations: Array<{
    id: string
    fulfilled: boolean
    attester: { id: string; name: string }
    createdAt: string
  }>
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待履行', color: 'bg-yellow-100 text-yellow-800' },
  FULFILLED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  FAILED: { label: '失败', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-600' }
}

export default function CommitmentList() {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchCommitments()
  }, [filter])

  const fetchCommitments = async () => {
    setLoading(true)
    try {
      const url = filter ? `/api/commitment?status=${filter}` : '/api/commitment'
      const res = await fetch(url)
      const result = await res.json()
      if (result.code === 0) {
        setCommitments(result.data.commitments)
      }
    } catch (error) {
      console.error('获取承诺失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">加载中...</div>
  }

  if (commitments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        暂无承诺记录
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1 text-sm rounded-full ${!filter ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
        >
          全部
        </button>
        {Object.entries(statusLabels).map(([status, { label }]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-full ${filter === status ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 承诺列表 */}
      {commitments.map((commitment) => (
        <div
          key={commitment.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div 
            className="flex items-start justify-between cursor-pointer"
            onClick={() => setExpandedId(expandedId === commitment.id ? null : commitment.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded ${statusLabels[commitment.status].color}`}>
                  {statusLabels[commitment.status].label}
                </span>
                <span className="text-xs text-gray-500">{commitment.context}</span>
              </div>
              <p className="text-gray-900">{commitment.task}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>承诺者: {commitment.promiser.name}</span>
                {commitment.receiver && <span>接收者: {commitment.receiver.name}</span>}
                {commitment.deadline && <span>截止: {formatDate(commitment.deadline)}</span>}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {commitment.attestations.length} 条证明
            </div>
          </div>

          {/* 展开详情 */}
          {expandedId === commitment.id && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">履约证明</h4>
              {commitment.attestations.length === 0 ? (
                <p className="text-sm text-gray-500">暂无证明</p>
              ) : (
                <div className="space-y-2">
                  {commitment.attestations.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded ${att.fulfilled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {att.fulfilled ? '已履约' : '未履约'}
                      </span>
                      <span className="text-gray-600">by {att.attester.name}</span>
                      <span className="text-gray-400">{formatDate(att.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
