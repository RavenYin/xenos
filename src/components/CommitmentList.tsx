'use client'

import { useState, useEffect } from 'react'

interface Commitment {
  id: string
  context: string
  task: string
  status: 'PENDING_ACCEPT' | 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'
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
  PENDING_ACCEPT: { label: '待确认', color: 'bg-blue-100 text-blue-800' },
  ACCEPTED: { label: '已接受', color: 'bg-cyan-100 text-cyan-800' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
  PENDING: { label: '待验收', color: 'bg-yellow-100 text-yellow-800' },
  FULFILLED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  FAILED: { label: '失败', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-600' }
}

interface CommitmentListProps {
  view: 'promiser' | 'delegator'  // promiser: 我承诺的 | delegator: 委托我的
}

export default function CommitmentList({ view }: CommitmentListProps) {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchCommitments()
  }, [filter, view])

  const fetchCommitments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      params.set('view', view)
      
      const res = await fetch(`/api/commitment?${params.toString()}`)
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

  // 承诺方接受
  const handleAccept = async (commitmentId: string) => {
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/commitment/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId })
      })
      const result = await res.json()
      if (result.code === 0) {
        fetchCommitments()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  // 承诺方拒绝
  const handleReject = async (commitmentId: string) => {
    if (!confirm('确定要拒绝这个承诺吗？')) return
    
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/commitment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId })
      })
      const result = await res.json()
      if (result.code === 0) {
        fetchCommitments()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  // 承诺方提交履约
  const handleSubmit = async (commitmentId: string) => {
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/commitment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId })
      })
      const result = await res.json()
      if (result.code === 0) {
        fetchCommitments()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  // 委托方验收
  const handleVerify = async (commitmentId: string, fulfilled: boolean) => {
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commitmentId, 
          fulfilled,
          comment: fulfilled ? '验收通过' : '验收不通过'
        })
      })
      const result = await res.json()
      if (result.code === 0) {
        fetchCommitments()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('操作失败')
    } finally {
      setActionLoading(null)
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
        {view === 'promiser' ? '暂无承诺记录' : '暂无委托记录'}
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
                <span className={`px-2 py-0.5 text-xs rounded ${statusLabels[commitment.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[commitment.status]?.label || commitment.status}
                </span>
                <span className="text-xs text-gray-500">{commitment.context}</span>
              </div>
              <p className="text-gray-900">{commitment.task}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>承诺者: {commitment.promiser.name}</span>
                {commitment.receiver && <span>委托方: {commitment.receiver.name}</span>}
                {commitment.deadline && <span>截止: {formatDate(commitment.deadline)}</span>}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {commitment.attestations.length} 条证明
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {/* 承诺方视角 */}
            {view === 'promiser' && commitment.status === 'PENDING_ACCEPT' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAccept(commitment.id) }}
                  disabled={actionLoading === commitment.id}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {actionLoading === commitment.id ? '处理中...' : '接受承诺'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReject(commitment.id) }}
                  disabled={actionLoading === commitment.id}
                  className="btn-secondary text-sm px-3 py-1 text-red-600"
                >
                  拒绝
                </button>
              </>
            )}

            {view === 'promiser' && commitment.status === 'ACCEPTED' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSubmit(commitment.id) }}
                disabled={actionLoading === commitment.id}
                className="btn-primary text-sm px-3 py-1"
              >
                {actionLoading === commitment.id ? '提交中...' : '提交履约'}
              </button>
            )}

            {/* 委托方视角 */}
            {view === 'delegator' && commitment.status === 'PENDING' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleVerify(commitment.id, true) }}
                  disabled={actionLoading === commitment.id}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {actionLoading === commitment.id ? '处理中...' : '验收通过'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleVerify(commitment.id, false) }}
                  disabled={actionLoading === commitment.id}
                  className="btn-secondary text-sm px-3 py-1 text-red-600"
                >
                  验收不通过
                </button>
              </>
            )}
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
