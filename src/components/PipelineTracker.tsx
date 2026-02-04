'use client'

type Step = {
  id: string
  label: string
  agent: string
  status: string
  completedAt: string | null
  note: string | null
}

type Pipeline = {
  activeVideo: string
  title: string
  startedAt: string
  steps: Step[]
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  done: { color: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30', label: '✓ Done' },
  'in-progress': { color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30', label: '⟳ In Progress' },
  waiting: { color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30', label: '⏳ Waiting' },
  pending: { color: 'text-gray-500', bg: 'bg-gray-600', border: 'border-gray-600/30', label: '○ Pending' },
}

export function PipelineTracker({ pipeline }: { pipeline: Pipeline }) {
  const doneCount = pipeline.steps.filter(s => s.status === 'done').length
  const progress = (doneCount / pipeline.steps.length) * 100

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-white font-bold text-base">{pipeline.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Started {new Date(pipeline.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <span className="text-white font-bold text-lg">{doneCount}/{pipeline.steps.length}</span>
          <p className="text-xs text-gray-500">steps complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-dark-bg rounded-full mt-3 mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps - horizontal flow on desktop, vertical on mobile */}
      <div className="hidden md:flex items-start gap-0 overflow-x-auto pb-2">
        {pipeline.steps.map((step, i) => {
          const config = statusConfig[step.status] || statusConfig.pending
          return (
            <div key={step.id} className="flex items-start flex-shrink-0">
              <div className="flex flex-col items-center w-[100px]">
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center text-white text-xs font-bold ${
                  step.status === 'done' ? 'bg-opacity-100' : 'bg-opacity-30'
                }`}>
                  {step.status === 'done' ? '✓' : i + 1}
                </div>
                {/* Label */}
                <span className={`text-[11px] font-medium mt-2 text-center ${config.color}`}>
                  {step.label}
                </span>
                <span className="text-[9px] text-gray-600 mt-0.5">{step.agent}</span>
                {step.note && (
                  <span className="text-[9px] text-blue-400/70 mt-0.5 text-center">{step.note}</span>
                )}
                {step.completedAt && (
                  <span className="text-[9px] text-gray-600 mt-0.5">
                    {new Date(step.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {i < pipeline.steps.length - 1 && (
                <div className="flex items-center h-8 mx-0">
                  <div className={`w-4 h-0.5 ${step.status === 'done' ? 'bg-green-500/50' : 'bg-gray-700'}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile view - vertical */}
      <div className="md:hidden space-y-3">
        {pipeline.steps.map((step, i) => {
          const config = statusConfig[step.status] || statusConfig.pending
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                step.status === 'done' ? 'bg-opacity-100' : 'bg-opacity-30'
              }`}>
                {step.status === 'done' ? '✓' : i + 1}
              </div>
              {/* Vertical connector */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${config.color}`}>{step.label}</span>
                  <span className="text-[10px] text-gray-600">{step.agent}</span>
                </div>
                {step.note && (
                  <p className="text-[10px] text-blue-400/70 mt-0.5">{step.note}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
