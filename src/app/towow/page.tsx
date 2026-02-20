'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TowowTask {
  id: string
  title: string
  description: string
  deadline?: string
  reward?: {
    amount: number
    currency: string
  }
  publisher: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    name: string
  }
  status: 'open' | 'assigned' | 'completed' | 'cancelled'
}

interface UserInfo {
  id: string
  name: string
}

export default function ToWowPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [tasks, setTasks] = useState<TowowTask[]>([])
  const [loading, setLoading] = useState(true)
  const [towowEnabled, setTowowEnabled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 检查登录状态
    fetch('/api/user/info')
      .then(res => res.json())
      .then(result => {
        if (result.code === 0) {
          setUser(result.data)
          fetchTasks()
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
  }, [router])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/towow/tasks')
      const result = await res.json()
      
      if (result.code === 0) {
        setTowowEnabled(result.data.enabled)
        setTasks(result.data.tasks || [])
        setError(result.data.error || '')
      }
    } catch (err) {
      setError('获取任务失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToVCA = async (taskId: string) => {
    try {
      const res = await fetch('/api/towow/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          taskId
        })
      })
      
      const result = await res.json()
      if (result.code === 0) {
        alert('已发布到 VCA 系统！')
        fetchTasks()
      } else {
        alert(result.error || '发布失败')
      }
    } catch (err) {
      alert('网络错误')
    }
  }

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/towow/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          taskId
        })
      })
      
      const result = await res.json()
      if (result.code === 0) {
        alert('已接受任务！')
        fetchTasks()
      } else {
        alert(result.error || '接受失败')
      }
    } catch (err) {
      alert('网络错误')
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: '待接单', color: 'bg-blue-100 text-blue-800' },
    assigned: { label: '进行中', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
    cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">ToWow 任务市场</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">{user.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 状态提示 */}
        {!towowEnabled && (
          <div className="card mb-6 bg-yellow-50 border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">ToWow 集成未启用</h3>
            <p className="text-sm text-yellow-700">
              请在 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 中配置：
            </p>
            <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
{`TOWOW_API_URL=https://towow.net
TOWOW_API_KEY=your_api_key
TOWOW_ENABLED=true`}
            </pre>
          </div>
        )}

        {error && (
          <div className="card mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 任务列表 */}
        {towowEnabled && tasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">暂无 ToWow 任务</p>
            <p className="text-sm text-gray-400 mt-2">任务将在此处显示</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${statusLabels[task.status]?.color}`}>
                        {statusLabels[task.status]?.label || task.status}
                      </span>
                      {task.reward && (
                        <span className="text-sm text-green-600 font-medium">
                          ¥{task.reward.amount} {task.reward.currency}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>发布者: {task.publisher.name}</span>
                      {task.assignee && <span>接单: {task.assignee.name}</span>}
                      {task.deadline && <span>截止: {new Date(task.deadline).toLocaleDateString('zh-CN')}</span>}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-4 flex gap-2 flex-wrap border-t pt-4">
                  <button
                    onClick={() => handlePublishToVCA(task.id)}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    发布到 VCA
                  </button>
                  {task.status === 'open' && (
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      接受任务
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 模拟任务（ToWow 未启用时显示） */}
        {!towowEnabled && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">模拟任务示例</h2>
            <div className="space-y-4">
              {[
                { id: 'demo_1', title: '完成登录页面设计', description: '设计一个现代化的登录页面，支持多种登录方式', reward: { amount: 500, currency: 'CNY' }, publisher: { id: 'p1', name: 'Alice' }, status: 'open' },
                { id: 'demo_2', title: '开发 API 接口', description: '开发用户管理相关的 REST API', reward: { amount: 800, currency: 'CNY' }, publisher: { id: 'p2', name: 'Bob' }, status: 'open' },
                { id: 'demo_3', title: '编写单元测试', description: '为核心模块编写完整的单元测试', reward: { amount: 300, currency: 'CNY' }, publisher: { id: 'p1', name: 'Alice' }, assignee: { id: 'a1', name: 'Charlie' }, status: 'assigned' },
              ].map((task) => (
                <div key={task.id} className="card opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${statusLabels[task.status]?.color}`}>
                          {statusLabels[task.status]?.label}
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          ¥{task.reward.amount} {task.reward.currency}
                        </span>
                        <span className="text-xs text-gray-400">(模拟数据)</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>发布者: {task.publisher.name}</span>
                        {task.assignee && <span>接单: {task.assignee.name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
