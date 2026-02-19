'use client'

import { useState, useEffect } from 'react'

interface Shade {
  id: string
  name: string
  description?: string
}

export default function ShadesList() {
  const [shades, setShades] = useState<Shade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/shades')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setShades(result.data.shades)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500 text-center py-8">加载中...</div>
  }

  if (shades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p className="text-gray-500">暂无兴趣标签</p>
        <p className="text-sm text-gray-400 mt-1">在 SecondMe 中添加兴趣标签后这里会显示</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">兴趣标签</h3>
        <p className="text-gray-500 text-sm">来自 SecondMe 的个人兴趣标签</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {shades.map(shade => (
          <span
            key={shade.id}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            {shade.name}
          </span>
        ))}
      </div>

      {shades.some(s => s.description) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">标签详情</h4>
          <div className="space-y-2">
            {shades.filter(s => s.description).map(shade => (
              <div key={shade.id} className="flex items-start gap-3">
                <span className="text-primary-600 font-medium">{shade.name}</span>
                <span className="text-gray-500 text-sm">{shade.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
