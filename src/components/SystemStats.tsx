'use client'

type Stats = {
  uptime: string
  uptimeSeconds: number
  vpsCost: string
  videosProduced: number
  totalTokens: number
  totalCost: number
  totalSessions: number
  snapshotTime: string
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

const statCards = [
  { key: 'uptime', label: 'Server Uptime', icon: '🖥️', format: (s: Stats) => s.uptime },
  { key: 'vpsCost', label: 'VPS Cost', icon: '💰', format: (s: Stats) => s.vpsCost },
  { key: 'videos', label: 'Videos in Pipeline', icon: '🎬', format: (s: Stats) => `${s.videosProduced}` },
  { key: 'sessions', label: 'Total Sessions', icon: '🔄', format: (s: Stats) => `${s.totalSessions}` },
  { key: 'tokens', label: 'Total Tokens', icon: '🧮', format: (s: Stats) => formatTokens(s.totalTokens) },
  { key: 'cost', label: 'API Cost', icon: '📊', format: (s: Stats) => `$${s.totalCost.toFixed(2)}` },
]

export function SystemStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="bg-dark-card border border-dark-border rounded-xl p-4 text-center card-hover"
        >
          <div className="text-xl mb-2">{card.icon}</div>
          <div className="text-white font-bold text-lg">{card.format(stats)}</div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
