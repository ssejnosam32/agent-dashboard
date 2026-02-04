'use client'

export function Header({ generatedAt }: { generatedAt: string }) {
  return (
    <header className="border-b border-dark-border bg-dark-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xl">
              🐾
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                OpenClaw Dashboard
              </h1>
              <p className="text-xs text-gray-500">Agent Activity Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-dark-bg/50 px-3 py-1.5 rounded-full border border-dark-border">
              <span className="status-dot active"></span>
              <span>System Online</span>
            </div>
            <div className="text-xs text-gray-600">
              Last snapshot: {new Date(generatedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
