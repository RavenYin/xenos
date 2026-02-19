'use client'

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    createdAt?: string
  }
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-3xl font-semibold text-primary-600">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          {user.createdAt && (
            <p className="text-sm text-gray-400 mt-1">
              加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">用户名</p>
            <p className="text-gray-900 font-medium">{user.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">邮箱</p>
            <p className="text-gray-900 font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SecondMe 集成</h3>
        <div className="flex items-center gap-3 bg-primary-50 rounded-lg p-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">已连接 SecondMe</p>
            <p className="text-sm text-gray-500">您可以使用 SecondMe 账户管理个人信息</p>
          </div>
        </div>
      </div>
    </div>
  )
}
