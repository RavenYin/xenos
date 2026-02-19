'use client'

import { useState } from 'react'

export default function NoteEditor() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      const result = await response.json()

      if (result.code === 0) {
        setSuccess(true)
        setContent('')
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || '添加笔记失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">添加笔记</h3>
        <p className="text-gray-500 text-sm">将笔记同步到您的 SecondMe 账户</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="在这里输入您的笔记内容..."
          className="input min-h-[200px] resize-y"
          disabled={loading}
        />

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            笔记添加成功！
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {content.length} 字符
          </p>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存笔记'}
          </button>
        </div>
      </form>
    </div>
  )
}
