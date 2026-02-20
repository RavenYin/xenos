'use client'

import { useState } from 'react'

interface CommitmentFormProps {
  onSuccess?: () => void
}

// 发布渠道选项
const channels = [
  { value: 'manual', label: '手动创建', description: '直接创建任务委托' },
  { value: 'towow', label: 'ToWow', description: '从 ToWow 平台发布' },
  { value: 'api', label: 'API 调用', description: '外部系统调用' },
]

export default function CommitmentForm({ onSuccess }: CommitmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    task: '',
    channel: 'manual',
    promiserId: '',  // 承诺方 ID（接任务的人）
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
          context: formData.channel,
          receiverId: formData.promiserId || null,  // 暂时复用 receiverId 字段
          deadline: formData.deadline || null
        })
      })

      const result = await res.json()
      if (result.code === 0) {
        setFormData({ task: '', channel: 'manual', promiserId: '', deadline: '' })
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
      {/* 发布渠道 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          发布渠道
        </label>
        <div className="flex gap-3 flex-wrap">
          {channels.map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => setFormData({ ...formData, channel: ch.value })}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                formData.channel === ch.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {channels.find(c => c.value === formData.channel)?.description}
        </p>
      </div>

      {/* 任务描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          任务描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder="描述你要委托的任务..."
        />
      </div>

      {/* 指定承诺方（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          指定承诺方（可选）
        </label>
        <input
          type="text"
          value={formData.promiserId}
          onChange={(e) => setFormData({ ...formData, promiserId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="指定某人接任务（用户ID）"
        />
        <p className="text-xs text-gray-500 mt-1">留空则公开接受承诺</p>
      </div>

      {/* 截止时间 */}
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
        {loading ? '发布中...' : '发布委托'}
      </button>
    </form>
  )
}
