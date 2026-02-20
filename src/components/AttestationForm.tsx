'use client'

import { useState } from 'react'

interface AttestationFormProps {
  commitmentId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AttestationForm({ commitmentId, onSuccess, onCancel }: AttestationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fulfilled: true,
    evidence: '',
    comment: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitmentId,
          fulfilled: formData.fulfilled,
          evidence: formData.evidence || null,
          comment: formData.comment || null
        })
      })

      const result = await res.json()
      if (result.code === 0) {
        onSuccess?.()
      } else {
        setError(result.error || '提交失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-gray-900">添加履约证明</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          履约状态
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fulfilled"
              checked={formData.fulfilled === true}
              onChange={() => setFormData({ ...formData, fulfilled: true })}
              className="text-primary-600"
            />
            <span className="text-green-600 font-medium">已履约</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fulfilled"
              checked={formData.fulfilled === false}
              onChange={() => setFormData({ ...formData, fulfilled: false })}
              className="text-primary-600"
            />
            <span className="text-red-600 font-medium">未履约</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          证据链接（可选）
        </label>
        <input
          type="url"
          value={formData.evidence}
          onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          备注（可选）
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={2}
          placeholder="添加说明..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '提交中...' : '提交证明'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  )
}
