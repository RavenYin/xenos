'use client'

import { useState, useEffect } from 'react'

interface SoftMemory {
  id: string
  content: string
  createdAt: string
}

export default function SoftMemoryList() {
  const [memories, setMemories] = useState<SoftMemory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/softmemory')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setMemories(result.data.list)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500 text-center py-8">加载中...</div>
  }

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">暂无软记忆</p>
        <p className="text-sm text-gray-400 mt-1">在 SecondMe 中添加软记忆后这里会显示</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">软记忆</h3>
        <p className="text-gray-500 text-sm">来自 SecondMe 的个人记忆存储</p>
      </div>
      
      <div className="space-y-4">
        {memories.map(memory => (
          <div 
            key={memory.id} 
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <p className="text-gray-900">{memory.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(memory.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
