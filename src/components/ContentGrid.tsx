'use client'

import { useState } from 'react'

type DriveItem = {
  name: string
  id: string
  type: string
  url: string
  path: string
}

type DriveGroup = {
  name: string
  items: DriveItem[]
}

type NotionItem = {
  name: string
  id: string
  url: string
}

const platformIcons: Record<string, string> = {
  YouTube: '🎬',
  LinkedIn: '💼',
  Instagram: '📸',
  Twitter: '🐦',
  TikTok: '🎵',
  Facebook: '📘',
  Threads: '🧵',
  Blog: '✏️',
}

function getPlatformIcon(name: string): string {
  for (const [platform, icon] of Object.entries(platformIcons)) {
    if (name.startsWith(platform)) return icon
  }
  return '📁'
}

export function ContentGrid({ driveContent, notionContent }: { driveContent: DriveGroup[]; notionContent: NotionItem[] }) {
  const [activeTab, setActiveTab] = useState<'drive' | 'notion'>('drive')

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-dark-border">
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'drive'
              ? 'text-white bg-dark-bg/50 border-b-2 border-accent-green'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📁 Google Drive ({driveContent.reduce((s, g) => s + g.items.length, 0)})
        </button>
        <button
          onClick={() => setActiveTab('notion')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'notion'
              ? 'text-white bg-dark-bg/50 border-b-2 border-accent-purple'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📝 Notion ({notionContent.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[450px] overflow-y-auto p-4">
        {activeTab === 'drive' ? (
          <div className="space-y-4">
            {driveContent.map((group) => (
              <div key={group.name}>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  {getPlatformIcon(group.name)} {group.name}
                </h4>
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <a
                      key={item.path}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg/30 hover:bg-dark-bg/60 transition-colors group"
                    >
                      <span className="text-sm">{item.type === 'doc' ? '📄' : '📂'}</span>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                        {item.name}
                      </span>
                      <span className="ml-auto text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {notionContent.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg/30 hover:bg-dark-bg/60 transition-colors group"
              >
                <span className="text-sm">📝</span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                  {item.name}
                </span>
                <span className="ml-auto text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
