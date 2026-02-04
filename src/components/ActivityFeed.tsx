'use client'

type Activity = {
  timestamp: string
  agent: string
  agentId: string
  action: string
  type: string
}

const agentColors: Record<string, string> = {
  main: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  hook: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  coder: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const typeIcons: Record<string, string> = {
  tool: '🔧',
  input: '💬',
  response: '💭',
}

function formatTime(ts: string): string {
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
    ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">Latest Actions</span>
        <span className="text-xs text-gray-600">{activities.length} events</span>
      </div>
      
      <div className="activity-feed divide-y divide-dark-border/50">
        {activities.map((activity, i) => {
          const colors = agentColors[activity.agentId] || agentColors.main
          const icon = typeIcons[activity.type] || '📋'
          
          return (
            <div
              key={i}
              className="px-4 py-3 hover:bg-dark-bg/30 transition-colors"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                      {activity.agent}
                    </span>
                    <span className="text-[10px] text-gray-600">{formatTime(activity.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate leading-relaxed">
                    {activity.action}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
