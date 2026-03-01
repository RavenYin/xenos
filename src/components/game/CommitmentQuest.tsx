'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CommitmentStatus = 'PENDING_ACCEPT' | 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'

interface Commitment {
  id: string
  task: string
  status: CommitmentStatus
  deadline?: string
  context: string
  promiserId: string
  delegatorId: string
  createdAt: string
}

interface UserInfo {
  id: string
  name: string
  secondmeUserId: string
}

const statusConfig: Record<CommitmentStatus, { label: string; color: string; icon: string }> = {
  'PENDING_ACCEPT': { label: '待接受', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '📋' },
  'ACCEPTED': { label: '履约中', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🚀' },
  'REJECTED': { label: '已拒绝', color: 'bg-red-100 text-red-700 border-red-200', icon: '🚫' },
  'PENDING': { label: '待验收', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '👀' },
  'FULFILLED': { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
  'FAILED': { label: '失败', color: 'bg-red-100 text-red-700 border-red-200', icon: '❌' },
  'CANCELLED': { label: '已取消', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '📌' },
}

export default function CommitmentQuest() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
  const [newTask, setNewTask] = useState('')
  const [evidence, setEvidence] = useState('')
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/user/info').then(res => res.json()),
      fetch('/api/v1/promises?userId=me').then(res => res.json()),
    ])
      .then(([userResult, commitmentsResult]) => {
        if (userResult.code === 0) {
          setUser(userResult.data)
        }
        if (commitmentsResult.code === 0 && commitmentsResult.data) {
          setCommitments(commitmentsResult.data.commitments || [])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCreateCommitment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) {
      showMessage('error', '请输入承诺内容')
      return
    }

    try {
      const response = await fetch('/api/v1/commitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promiserId: user?.secondmeUserId,
          delegatorId: user?.secondmeUserId,
          task: newTask,
          deadline: deadline || undefined,
          context: 'game',
        }),
      })

      const result = await response.json()
      if (result.code === 0) {
        showMessage('success', '创建成功！')
        setShowCreateModal(false)
        setNewTask('')
        setDeadline('')
        // Reload commitments
        fetch('/api/v1/promises?userId=me')
          .then(res => res.json())
          .then(result => {
            if (result.code === 0 && result.data) {
              setCommitments(result.data.commitments || [])
            }
          })
      } else {
        showMessage('error', result.error || '创建失败')
      }
    } catch (error) {
      showMessage('error', '网络错误')
    }
  }

  const handleAcceptCommitment = async (commitmentId: string) => {
    try {
      const response = await fetch('/api/v1/commitment/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId }),
      })

      const result = await response.json()
      if (result.code === 0) {
        showMessage('success', '已接受承诺，开始履约！')
        setCommitments(prev =>
          prev.map(c =>
            c.id === commitmentId ? { ...c, status: 'ACCEPTED' } : c
          )
        )
      } else {
        showMessage('error', result.error || '操作失败')
      }
    } catch (error) {
      showMessage('error', '网络错误')
    }
  }

  const handleRejectCommitment = async (commitmentId: string) => {
    if (!confirm('确定要拒绝这个承诺吗？')) return

    try {
      const response = await fetch('/api/v1/commitment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId }),
      })

      const result = await response.json()
      if (result.code === 0) {
        showMessage('success', '已拒绝承诺')
        setCommitments(prev =>
          prev.map(c =>
            c.id === commitmentId ? { ...c, status: 'REJECTED' } : c
          )
        )
      } else {
        showMessage('error', result.error || '操作失败')
      }
    } catch (error) {
      showMessage('error', '网络错误')
    }
  }

  const handleSubmitFulfillment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCommitment) return

    try {
      const response = await fetch('/api/v1/commitment/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitmentId: selectedCommitment.id,
          evidence: evidence || undefined,
        }),
      })

      const result = await response.json()
      if (result.code === 0) {
        showMessage('success', '提交成功！等待验收')
        setShowSubmitModal(false)
        setEvidence('')
        setSelectedCommitment(null)
        setCommitments(prev =>
          prev.map(c =>
            c.id === selectedCommitment.id ? { ...c, status: 'PENDING' } : c
          )
        )
      } else {
        showMessage('error', result.error || '提交失败')
      }
    } catch (error) {
      showMessage('error', '网络错误')
    }
  }

  const handleVerifyCommitment = async (commitmentId: string) => {
    try {
      const response = await fetch('/api/v1/commitment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitmentId,
          fulfilled: true,
        }),
      })

      const result = await response.json()
      if (result.code === 0) {
        showMessage('success', '验收通过！信誉 +100')
        setCommitments(prev =>
          prev.map(c =>
            c.id === commitmentId ? { ...c, status: 'FULFILLED' } : c
          )
        )
      } else {
        showMessage('error', result.error || '验收失败')
      }
    } catch (error) {
      showMessage('error', '网络错误')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4 animate-spin">⏳</div>
        <div className="text-gray-500">加载任务中...</div>
      </div>
    )
  }

  return (
    <>
      {/* Message Banner */}
      {message && (
        <div className={`mb-4 px-6 py-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span className="text-2xl">➕</span>
          <span>创建承诺</span>
        </button>
      </div>

      {/* Commitment List */}
      {commitments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">还没有任务</h3>
          <p className="text-gray-500 mb-6">创建你的第一个承诺，开始建立信誉</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            创建承诺
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {commitments.map(commitment => {
            const config = statusConfig[commitment.status]
            return (
              <div
                key={commitment.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{config.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{commitment.task}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(commitment.createdAt).toLocaleDateString('zh-CN')}</span>
                      {commitment.deadline && (
                        <span>截止: {new Date(commitment.deadline).toLocaleDateString('zh-CN')}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {commitment.status === 'PENDING_ACCEPT' && (
                    <>
                      <button
                        onClick={() => handleAcceptCommitment(commitment.id)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleRejectCommitment(commitment.id)}
                        className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                  {commitment.status === 'ACCEPTED' && (
                    <button
                      onClick={() => {
                        setSelectedCommitment(commitment)
                        setShowSubmitModal(true)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      提交履约
                    </button>
                  )}
                  {/* 只有委托方才能验收承诺 - 防止承诺方自己验收自己的承诺 */}
                  {commitment.status === 'PENDING' && commitment.delegatorId === user?.secondmeUserId && (
                    <button
                      onClick={() => handleVerifyCommitment(commitment.id)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      验收通过
                    </button>
                  )}
                  {commitment.status === 'PENDING' && commitment.delegatorId !== user?.secondmeUserId && (
                    <div className="flex-1 text-center text-sm text-gray-500 py-2">
                      等待委托方验收
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">创建新承诺</h2>
            <form onSubmit={handleCreateCommitment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">承诺内容</label>
                <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="例如: 完成一份代码审查"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">截止时间（可选）</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedCommitment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">提交履约证明</h2>
            <p className="text-gray-600 mb-4">{selectedCommitment.task}</p>
            <form onSubmit={handleSubmitFulfillment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">履约证据（可选）</label>
                <textarea
                  value={evidence}
                  onChange={e => setEvidence(e.target.value)}
                  placeholder="描述你的履约情况或提供相关链接..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  提交
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false)
                    setEvidence('')
                    setSelectedCommitment(null)
                  }}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
