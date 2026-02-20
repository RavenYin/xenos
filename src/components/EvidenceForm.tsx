'use client'

import { useState } from 'react'

interface EvidenceFormProps {
  commitmentId: string
  commitmentTask: string
  onSuccess?: () => void
  onCancel?: () => void
}

// 证据类型
const evidenceTypes = [
  { value: 'link', label: '链接', placeholder: 'https://...', icon: '🔗' },
  { value: 'github_pr', label: 'GitHub PR', placeholder: 'https://github.com/xxx/pull/1', icon: '🔄' },
  { value: 'github_commit', label: 'GitHub Commit', placeholder: 'https://github.com/xxx/commit/xxx', icon: '📝' },
  { value: 'document', label: '文档', placeholder: 'https://docs.xxx.com/...', icon: '📄' },
  { value: 'screenshot', label: '截图', placeholder: 'https://xxx.com/screenshot.png', icon: '🖼️' },
  { value: 'text', label: '文字描述', placeholder: '描述完成的工作...', icon: '💬' },
]

export default function EvidenceForm({ commitmentId, commitmentTask, onSuccess, onCancel }: EvidenceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [evidenceType, setEvidenceType] = useState('link')
  const [formData, setFormData] = useState({
    content: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.content.trim()) {
      setError('请填写履约证明')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/commitment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitmentId,
          evidence: {
            type: evidenceType,
            content: formData.content,
            description: formData.description
          }
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

  const currentType = evidenceTypes.find(t => t.value === evidenceType)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">提交履约证明</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{commitmentTask}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 证据类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              证明类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {evidenceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEvidenceType(type.value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors flex items-center gap-1.5 ${
                    evidenceType === type.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 证据内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentType?.label || '证明内容'} <span className="text-red-500">*</span>
            </label>
            {evidenceType === 'text' ? (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder={currentType?.placeholder}
              />
            ) : (
              <input
                type="url"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={currentType?.placeholder}
              />
            )}
          </div>

          {/* 补充描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              补充说明（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={2}
              placeholder="描述完成的工作内容、遇到的问题等..."
            />
          </div>

          {/* Agent 快捷模板 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Agent 快捷提交：</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('github_pr')
                  setFormData({
                    content: 'https://github.com/',
                    description: '代码已提交，请审核'
                  })
                }}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
              >
                🔄 GitHub PR
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('document')
                  setFormData({
                    content: 'https://docs.',
                    description: '文档已完成'
                  })
                }}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
              >
                📄 完成文档
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('text')
                  setFormData({
                    content: '任务已完成，具体如下：\n1. \n2. \n3. ',
                    description: ''
                  })
                }}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
              >
                💬 文字报告
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '提交中...' : '提交履约'}
            </button>
          </div>
        </form>

        {/* API 提示 */}
        <div className="px-4 pb-4">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">
              Agent API 调用方式
            </summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
{`POST /api/v1/commitment/evidence
{
  "commitmentId": "${commitmentId}",
  "promiserId": "agent_id",
  "evidence": {
    "type": "github_pr",
    "content": "https://github.com/...",
    "description": "完成说明"
  }
}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
