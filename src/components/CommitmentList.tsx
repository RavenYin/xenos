'use client'

import { useState, useEffect } from 'react'
import EvidenceForm from './EvidenceForm'

interface Commitment {
  id: string
  context: string
  task: string
  status: 'PENDING_ACCEPT' | 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'
  deadline: string | null
  createdAt: string
  evidence?: string | null
  promiser: { id: string; name: string; avatarUrl?: string }
  receiver: { id: string; name: string; avatarUrl?: string } | null
  attestations: Array<{
    id: string
    fulfilled: boolean
    comment?: string | null
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
  view: 'promiser' | 'delegator'
}

function parseEvidence(evidence: string | null | undefined): { type: string; content: string; description?: string } | null {
  if (!evidence) return null
  try {
    const parsed = JSON.parse(evidence)
    if (parsed.type && parsed.content) return parsed
  } catch {}
  return { type: 'text', content: evidence }
}

const evidenceIcons: Record<string, string> = {
  link: '🔗', github_pr: '🔄', github_commit: '📝', document: '📄', screenshot: '🖼️', text: '💬'
}

export default function CommitmentList({ view }: CommitmentListProps) {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showEvidenceForm, setShowEvidenceForm] = useState<string | null>(null)
  const [verifyComment, setVerifyComment] = useState<Record<string, string>>({})
  const [showVerifyModal, setShowVerifyModal] = useState<{ id: string; fulfilled: boolean } | null>(null)

  useEffect(() => { fetchCommitments() }, [filter, view])

  const fetchCommitments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      params.set('view', view)
      const res = await fetch(`/api/commitment?${params.toString()}`)
      const result = await res.json()
      if (result.code === 0) setCommitments(result.data.commitments)
    } catch (error) {
      console.error('获取承诺失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (commitmentId: string) => {
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/commitment/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId })
      })
      const result = await res.json()
      if (result.code === 0) fetchCommitments()
      else alert(result.error || '操作失败')
    } catch { alert('操作失败') }
    finally { setActionLoading(null) }
  }

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
      if (result.code === 0) fetchCommitments()
      else alert(result.error || '操作失败')
    } catch { alert('操作失败') }
    finally { setActionLoading(null) }
  }

  const handleVerify = async (commitmentId: string, fulfilled: boolean) => {
    const comment = verifyComment[commitmentId] || (fulfilled ? '验收通过' : '验收不通过')
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId, fulfilled, comment })
      })
      const result = await res.json()
      if (result.code === 0) {
        setShowVerifyModal(null)
        setVerifyComment(prev => ({ ...prev, [commitmentId]: '' }))
        fetchCommitments()
      } else alert(result.error || '操作失败')
    } catch { alert('操作失败') }
    finally { setActionLoading(null) }
  }

  const handleRequestMore = async (commitmentId: string) => {
    const comment = verifyComment[commitmentId] || '请补充更多履约证明'
    setActionLoading(commitmentId)
    try {
      const res = await fetch('/api/commitment/request-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId, comment })
      })
      const result = await res.json()
      if (result.code === 0) {
        setVerifyComment(prev => ({ ...prev, [commitmentId]: '' }))
        fetchCommitments()
      } else alert(result.error || '操作失败')
    } catch { alert('操作失败') }
    finally { setActionLoading(null) }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1 text-sm rounded-full ${!filter ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>全部</button>
        {Object.entries(statusLabels).map(([status, { label }]) => (
          <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-full ${filter === status ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
        ))}
      </div>

      {loading && <div className="py-8 text-center text-gray-500">加载中...</div>}
      {!loading && commitments.length === 0 && <div className="py-8 text-center text-gray-500">{view === 'promiser' ? '暂无承诺记录' : '暂无委托记录'}</div>}

      {!loading && commitments.length > 0 && commitments.map((commitment) => {
        const evidence = parseEvidence(commitment.evidence)
        return (
          <div key={commitment.id} className={`border rounded-lg p-4 transition-colors ${commitment.status === 'PENDING' && view === 'delegator' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === commitment.id ? null : commitment.id)}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${statusLabels[commitment.status]?.color}`}>{statusLabels[commitment.status]?.label}</span>
                  <span className="text-xs text-gray-500">{commitment.context}</span>
                  {commitment.status === 'PENDING' && view === 'delegator' && <span className="text-xs text-yellow-700 font-medium">需要验收</span>}
                </div>
                <p className="text-gray-900">{commitment.task}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>承诺者: {commitment.promiser.name}</span>
                  {commitment.receiver && <span>委托方: {commitment.receiver.name}</span>}
                  {commitment.deadline && <span>截止: {formatDate(commitment.deadline)}</span>}
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {evidence && <span title="有履约证明">📋</span>}
                <span>{commitment.attestations.length} 条证明</span>
              </div>
            </div>

            {/* 履约证明预览（委托方 + 待验收） */}
            {view === 'delegator' && commitment.status === 'PENDING' && evidence && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span>{evidenceIcons[evidence.type] || '📋'}</span>
                  <span>履约证明</span>
                </div>
                {evidence.type === 'text' ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{evidence.content}</p>
                ) : (
                  <div>
                    <a href={evidence.content} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all" onClick={(e) => e.stopPropagation()}>{evidence.content}</a>
                    {evidence.description && <p className="text-xs text-gray-500 mt-1">{evidence.description}</p>}
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {view === 'promiser' && commitment.status === 'PENDING_ACCEPT' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleAccept(commitment.id) }} disabled={actionLoading === commitment.id} className="btn-primary text-sm px-3 py-1">{actionLoading === commitment.id ? '处理中...' : '接受承诺'}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleReject(commitment.id) }} disabled={actionLoading === commitment.id} className="btn-secondary text-sm px-3 py-1 text-red-600">拒绝</button>
                </>
              )}
              {view === 'promiser' && commitment.status === 'ACCEPTED' && (
                <button onClick={(e) => { e.stopPropagation(); setShowEvidenceForm(commitment.id) }} className="btn-primary text-sm px-3 py-1">提交履约证明</button>
              )}
              {view === 'delegator' && commitment.status === 'PENDING' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setShowVerifyModal({ id: commitment.id, fulfilled: true }) }} disabled={actionLoading === commitment.id} className="btn-primary text-sm px-3 py-1">✅ 验收通过</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowVerifyModal({ id: commitment.id, fulfilled: false }) }} disabled={actionLoading === commitment.id} className="btn-secondary text-sm px-3 py-1 text-red-600">❌ 不通过</button>
                  <button onClick={(e) => { e.stopPropagation(); handleRequestMore(commitment.id) }} disabled={actionLoading === commitment.id} className="btn-secondary text-sm px-3 py-1">🔄 要求补充</button>
                </>
              )}
            </div>

            {/* 展开详情 */}
            {expandedId === commitment.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {evidence && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">履约证明</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span>{evidenceIcons[evidence.type] || '📋'}</span>
                        <span className="text-gray-600">{evidence.type}</span>
                      </div>
                      {evidence.type === 'text' ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{evidence.content}</p> : <a href={evidence.content} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all">{evidence.content}</a>}
                      {evidence.description && <p className="text-xs text-gray-500 mt-2">{evidence.description}</p>}
                    </div>
                  </div>
                )}
                <h4 className="text-sm font-medium text-gray-700 mb-2">验收记录</h4>
                {commitment.attestations.length === 0 ? <p className="text-sm text-gray-500">暂无验收记录</p> : (
                  <div className="space-y-2">
                    {commitment.attestations.map((att) => (
                      <div key={att.id} className="flex items-start gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded shrink-0 ${att.fulfilled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{att.fulfilled ? '✅ 通过' : '❌ 不通过'}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><span className="text-gray-600">by {att.attester.name}</span><span className="text-gray-400">{formatDate(att.createdAt)}</span></div>
                          {att.comment && <p className="text-gray-500 mt-0.5">{att.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 提交履约证明弹窗 */}
      {showEvidenceForm && (
        <EvidenceForm
          commitmentId={showEvidenceForm}
          commitmentTask={commitments.find(c => c.id === showEvidenceForm)?.task || ''}
          onSuccess={() => { setShowEvidenceForm(null); fetchCommitments() }}
          onCancel={() => setShowEvidenceForm(null)}
        />
      )}

      {/* 验收确认弹窗 */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4">
            <h3 className="text-lg font-semibold mb-2">{showVerifyModal.fulfilled ? '✅ 确认验收通过' : '❌ 确认验收不通过'}</h3>
            <p className="text-sm text-gray-500 mb-4">{showVerifyModal.fulfilled ? '确认后将把承诺标记为已完成' : '确认后将把承诺标记为失败'}</p>
            <textarea value={verifyComment[showVerifyModal.id] || ''} onChange={(e) => setVerifyComment(prev => ({ ...prev, [showVerifyModal.id]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" rows={3} placeholder={showVerifyModal.fulfilled ? '验收评语（可选）' : '请说明不通过的原因...'} />
            <div className="flex gap-3">
              <button onClick={() => setShowVerifyModal(null)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={() => handleVerify(showVerifyModal.id, showVerifyModal.fulfilled)} disabled={actionLoading === showVerifyModal.id} className={`flex-1 py-2 px-4 text-white rounded-lg ${showVerifyModal.fulfilled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>{actionLoading === showVerifyModal.id ? '处理中...' : '确认'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
