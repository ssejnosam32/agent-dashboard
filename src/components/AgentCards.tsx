'use client'

type Agent = {
  id: string
  name: string
  emoji: string
  role: string
  status: string
  lastActivity: string | null
  sessionCount: number
  totalTokens: number
  totalCost: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AgentCards({ agents }: { agents: Agent[] }) {
  const colorMap: Record<string, { border: string; glow: string; gradient: string }> = {
    main: { border: 'border-purple-500/30', glow: 'glow-purple', gradient: 'from-purple-500/10 to-transparent' },
    hook: { border: 'border-yellow-500/30', glow: 'glow-yellow', gradient: 'from-yellow-500/10 to-transparent' },
    coder: { border: 'border-blue-500/30', glow: 'glow-blue', gradient: 'from-blue-500/10 to-transparent' },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const colors = colorMap[agent.id] || colorMap.main
        return (
          <div
            key={agent.id}
            className={`bg-dark-card border ${colors.border} rounded-xl p-5 card-hover relative overflow-hidden`}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none`} />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                    <p className="text-xs text-gray-500 leading-tight">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${agent.status}`}></span>
                  <span className={`text-xs font-medium ${
                    agent.status === 'active' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {agent.status === 'active' ? 'Active' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-dark-bg/50 rounded-lg p-2.5 text-center">
                  <div className="text-white font-bold text-sm">{agent.sessionCount}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Sessions</div>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-2.5 text-center">
                  <div className="text-white font-bold text-sm">{formatTokens(agent.totalTokens)}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Tokens</div>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-2.5 text-center">
                  <div className="text-white font-bold text-sm">${agent.totalCost}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Cost</div>
                </div>
              </div>

              {/* Last activity */}
              {agent.lastActivity && (
                <div className="mt-3 text-xs text-gray-600">
                  Last active: {timeAgo(agent.lastActivity)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
