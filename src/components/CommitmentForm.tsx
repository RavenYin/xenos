'use client'

import { useState } from 'react'

interface CommitmentFormProps {
  onSuccess?: () => void
}

export default function CommitmentForm({ onSuccess }: CommitmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    task: '',
    context: 'towow-agent',
    receiverId: '',
    deadline: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.task.trim()) {
      setError('请输入任务描述')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/commitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: formData.task,
          context: formData.context,
          receiverId: formData.receiverId || null,
          deadline: formData.deadline || null
        })
      })

      const result = await res.json()
      if (result.code === 0) {
        setFormData({ task: '', context: 'towow-agent', receiverId: '', deadline: '' })
        onSuccess?.()
      } else {
        setError(result.error || '创建失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          任务描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder="描述你的承诺..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          上下文
        </label>
        <input
          type="text"
          value={formData.context}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="例如: towow-agent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          接收者ID（可选）
        </label>
        <input
          type="text"
          value={formData.receiverId}
          onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="承诺接收者的用户ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          截止时间（可选）
        </label>
        <input
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '创建中...' : '创建承诺'}
      </button>
    </form>
  )
}
