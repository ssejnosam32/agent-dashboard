import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenClaw Agent Dashboard',
  description: 'Real-time monitoring dashboard for OpenClaw AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
