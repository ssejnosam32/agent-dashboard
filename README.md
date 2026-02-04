# OpenClaw Agent Dashboard

Real-time monitoring dashboard for OpenClaw AI agents (TARS, Hook, Stack).

## Features

- **Agent Status Cards** - Live status, session counts, token usage, and costs for each agent
- **YouTube Pipeline Tracker** - Visual step-by-step progress for video production pipeline
- **Content Created** - Google Drive files and Notion pages organized by category
- **Recent Activity Feed** - Last 30 agent actions across all agents
- **System Stats** - Server uptime, VPS cost, total tokens, API costs

## Architecture

Static export dashboard that reads from a JSON snapshot. No database needed.

### Data Flow
1. `snapshot.js` reads local agent data files and creates `public/data/snapshot.json`
2. Next.js builds a static export using this snapshot data
3. Deploy to Vercel as static files

### Refreshing Data
```bash
# Run before each deploy to get fresh data
node snapshot.js
git add -A && git commit -m "Update snapshot"
vercel --prod --yes
```

## Tech Stack
- Next.js 14 (App Router, Static Export)
- React 18
- Tailwind CSS 3
- TypeScript

## Local Development
```bash
npm install
node snapshot.js  # Generate data snapshot
npm run dev       # Start dev server
```

## Data Sources
- Agent configs: `/root/.clawdbot/agents/`
- Session transcripts: `/root/.clawdbot/agents/*/sessions/*.jsonl`
- Pipeline state: `/root/clawd/data/pipeline-state.json`
- Drive content: `/root/clawd/data/drive-content-ids.json`
- Notion content: `/root/clawd/data/notion-content-ids.json`
