import { AgentCards } from '@/components/AgentCards'
import { PipelineTracker } from '@/components/PipelineTracker'
import { ContentGrid } from '@/components/ContentGrid'
import { ActivityFeed } from '@/components/ActivityFeed'
import { SystemStats } from '@/components/SystemStats'
import { Header } from '@/components/Header'
import snapshotData from '../../public/data/snapshot.json'

type SnapshotData = {
  agents: any[]
  pipeline: any
  driveContent: any[]
  notionContent: any[]
  recentActivity: any[]
  systemStats: any
  generatedAt: string
}

export default function Dashboard() {
  const data = snapshotData as SnapshotData

  return (
    <main className="min-h-screen bg-dark-bg">
      <Header generatedAt={data.generatedAt} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Agent Status Cards */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-accent-purple">●</span> Agent Status
          </h2>
          <AgentCards agents={data.agents} />
        </section>

        {/* System Stats */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-accent-blue">●</span> System Overview
          </h2>
          <SystemStats stats={data.systemStats} />
        </section>

        {/* YouTube Pipeline */}
        {data.pipeline && (
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="text-accent-yellow">●</span> YouTube Pipeline
            </h2>
            <PipelineTracker pipeline={data.pipeline} />
          </section>
        )}

        {/* Two-column layout for content and activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Created */}
          <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="text-accent-green">●</span> Content Created
            </h2>
            <ContentGrid driveContent={data.driveContent} notionContent={data.notionContent} />
          </section>

          {/* Recent Activity */}
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="text-accent-purple">●</span> Recent Activity
            </h2>
            <ActivityFeed activities={data.recentActivity} />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          OpenClaw Agent Dashboard &middot; Data refreshed {new Date(data.generatedAt).toLocaleString()}
        </div>
      </footer>
    </main>
  )
}
