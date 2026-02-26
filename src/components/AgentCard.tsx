'use client'

import { useState } from 'react'

interface ReputationStats {
  context: string
  totalCommitments: number
  fulfillmentRate: number
  score: number
}

interface Agent {
  id: string
  userId: string
  name: string
  introduction?: string
  skills: string[]
  avatarUrl?: string
  github?: string
  towow?: string
  reputation?: ReputationStats | {
    overallRate: number
    totalCommitments: number
    score: number
  }
}

interface AgentCardProps {
  agent: Agent
  onVouch?: (agentId: string) => void
}

export default function AgentCard({ agent, onVouch }: AgentCardProps) {
  const [showVouchModal, setShowVouchModal] = useState(false)

  const getReputationDisplay = () => {
    if (!agent.reputation) return null
    if ('context' in agent.reputation) {
      return agent.reputation
    }
    return null
  }

  const contextRep = getReputationDisplay()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {agent.name?.[0]?.toUpperCase() || 'A'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
          <p className="text-sm text-gray-500 truncate">{agent.introduction || '暂无介绍'}</p>
          
          {agent.skills && agent.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.skills.slice(0, 4).map((skill) => (
                <span 
                  key={skill}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {agent.skills.length > 4 && (
                <span className="text-xs text-gray-400">+{agent.skills.length - 4}</span>
              )}
            </div>
          )}

          {contextRep && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">履约率:</span>
                <span className={`font-medium ${
                  contextRep.fulfillmentRate >= 80 ? 'text-green-600' :
                  contextRep.fulfillmentRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {contextRep.fulfillmentRate}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">承诺:</span>
                <span className="font-medium">{contextRep.totalCommitments}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">信誉分:</span>
                <span className="font-medium text-blue-600">{contextRep.score}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        {agent.github && (
          <a 
            href={agent.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            GitHub
          </a>
        )}
        {agent.towow && (
          <a 
            href={agent.towow} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ToWow
          </a>
        )}
        {onVouch && (
          <button
            onClick={() => setShowVouchModal(true)}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            担保
          </button>
        )}
      </div>
    </div>
  )
}
