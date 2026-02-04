#!/usr/bin/env node
/**
 * snapshot.js - Reads all local agent data and creates a static JSON snapshot
 * Run before each deploy: node snapshot.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AGENTS_DIR = '/root/.clawdbot/agents';
const DATA_DIR = '/root/clawd/data';
const OUTPUT_DIR = path.join(__dirname, 'public', 'data');

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Could not read ${filePath}: ${e.message}`);
    return null;
  }
}

function getAgentInfo() {
  const agentDefs = {
    main: { name: 'TARS', emoji: '🧠', role: 'Main Agent - Orchestrator & Decision Maker' },
    hook: { name: 'Hook', emoji: '✍️', role: 'Content Writer - Scripts, Posts & Copy' },
    coder: { name: 'Stack', emoji: '⚡', role: 'Coder Agent - Development & Deployment' },
  };

  const agents = [];
  const agentDirs = fs.readdirSync(AGENTS_DIR).filter(d => {
    return fs.statSync(path.join(AGENTS_DIR, d)).isDirectory() && !d.startsWith('.');
  });

  for (const dir of agentDirs) {
    const def = agentDefs[dir] || { name: dir, emoji: '🤖', role: 'Unknown' };
    const sessionsDir = path.join(AGENTS_DIR, dir, 'sessions');
    let lastActivity = null;
    let sessionCount = 0;
    let totalTokens = 0;
    let totalCost = 0;

    if (fs.existsSync(sessionsDir)) {
      const sessionFiles = fs.readdirSync(sessionsDir)
        .filter(f => f.endsWith('.jsonl') && !f.startsWith('.'));
      sessionCount = sessionFiles.length;

      // Find last activity from most recent session
      const sorted = sessionFiles
        .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

      if (sorted.length > 0) {
        const latestFile = path.join(sessionsDir, sorted[0].name);
        const lines = fs.readFileSync(latestFile, 'utf-8').trim().split('\n');
        // Get last timestamp
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const entry = JSON.parse(lines[i]);
            if (entry.timestamp) {
              lastActivity = entry.timestamp;
              break;
            }
          } catch {}
        }

        // Count tokens from recent sessions (last 3)
        for (const sf of sorted.slice(0, 3)) {
          try {
            const content = fs.readFileSync(path.join(sessionsDir, sf.name), 'utf-8');
            const sessionLines = content.trim().split('\n');
            for (const line of sessionLines) {
              try {
                const entry = JSON.parse(line);
                if (entry.type === 'message' && entry.message?.usage) {
                  totalTokens += entry.message.usage.totalTokens || 0;
                  totalCost += entry.message.usage.cost?.total || 0;
                }
              } catch {}
            }
          } catch {}
        }
      }
    }

    agents.push({
      id: dir,
      ...def,
      status: lastActivity && (Date.now() - new Date(lastActivity).getTime()) < 300000 ? 'active' : 'idle',
      lastActivity,
      sessionCount,
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
    });
  }

  return agents;
}

function getPipelineState() {
  const pipeline = readJsonFile(path.join(DATA_DIR, 'pipeline-state.json'));
  if (!pipeline) return null;

  const stepLabels = {
    '1_idea_pitched': { label: 'Idea', agent: 'TARS' },
    '2_idea_approved': { label: 'Approved', agent: 'Jess' },
    '3_script_written': { label: 'Script', agent: 'Hook' },
    '4_script_approved': { label: 'Review', agent: 'Jess' },
    '5_broll_created': { label: 'B-Roll', agent: 'Hook' },
    '6_thumbnail_headlines_proposed': { label: 'Headlines', agent: 'Hook' },
    '7_thumbnail_headline_approved': { label: 'Headline OK', agent: 'Jess' },
    '8_thumbnail_generated': { label: 'Thumbnail', agent: 'Stack' },
    '9_synced_notion_drive': { label: 'Synced', agent: 'TARS' },
  };

  const steps = Object.entries(pipeline.steps).map(([key, val]) => ({
    id: key,
    ...stepLabels[key],
    status: val.status,
    completedAt: val.completedAt || null,
    note: val.note || null,
  }));

  return {
    activeVideo: pipeline.activeVideo,
    title: pipeline.title,
    startedAt: pipeline.startedAt,
    steps,
  };
}

function getDriveContent() {
  const drive = readJsonFile(path.join(DATA_DIR, 'drive-content-ids.json'));
  if (!drive) return [];

  // Group by video/category
  const groups = {};
  for (const [key, id] of Object.entries(drive)) {
    const parts = key.split('/');
    if (parts.length >= 2) {
      const category = parts[0];
      const group = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : category;
      if (!groups[group]) {
        groups[group] = { name: group, items: [] };
      }
      const itemName = parts[parts.length - 1];
      const isDoc = typeof id === 'string' && id.length > 30;
      groups[group].items.push({
        name: itemName,
        id: id,
        type: isDoc ? 'doc' : 'folder',
        url: isDoc 
          ? `https://docs.google.com/document/d/${id}/edit`
          : `https://drive.google.com/drive/folders/${id}`,
        path: key,
      });
    }
  }

  return Object.values(groups);
}

function getNotionContent() {
  const notion = readJsonFile(path.join(DATA_DIR, 'notion-content-ids.json'));
  if (!notion) return [];

  const items = [];
  
  function traverse(obj, prefix = '') {
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        items.push({
          name: prefix ? `${prefix} / ${key}` : key,
          id: val,
          url: `https://notion.so/${val.replace(/-/g, '')}`,
        });
      } else if (typeof val === 'object' && val !== null) {
        traverse(val, prefix ? `${prefix} / ${key}` : key);
      }
    }
  }

  traverse(notion);
  return items;
}

function getRecentActivity() {
  const agentNames = { main: 'TARS', hook: 'Hook', coder: 'Stack' };
  const activities = [];
  const agentDirs = fs.readdirSync(AGENTS_DIR).filter(d => {
    return fs.statSync(path.join(AGENTS_DIR, d)).isDirectory() && !d.startsWith('.');
  });

  for (const dir of agentDirs) {
    const sessionsDir = path.join(AGENTS_DIR, dir, 'sessions');
    if (!fs.existsSync(sessionsDir)) continue;

    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl') && !f.startsWith('.'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 2); // Last 2 sessions per agent

    for (const sf of sessionFiles) {
      try {
        const content = fs.readFileSync(path.join(sessionsDir, sf.name), 'utf-8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            
            // Capture tool calls as activities
            if (entry.type === 'toolCall' && entry.name) {
              activities.push({
                timestamp: entry.timestamp,
                agent: agentNames[dir] || dir,
                agentId: dir,
                action: `Used tool: ${entry.name}`,
                type: 'tool',
              });
            }
            
            // Capture user messages
            if (entry.type === 'message' && entry.message?.role === 'user') {
              const text = entry.message.content?.[0]?.text;
              if (text) {
                const summary = text.length > 100 ? text.substring(0, 100) + '...' : text;
                activities.push({
                  timestamp: entry.timestamp,
                  agent: agentNames[dir] || dir,
                  agentId: dir,
                  action: `Received: "${summary}"`,
                  type: 'input',
                });
              }
            }

            // Capture assistant messages (with tool usage)
            if (entry.type === 'message' && entry.message?.role === 'assistant') {
              const textContent = entry.message.content?.find(c => c.type === 'text');
              if (textContent?.text) {
                const summary = textContent.text.length > 100 
                  ? textContent.text.substring(0, 100) + '...'
                  : textContent.text;
                activities.push({
                  timestamp: entry.timestamp,
                  agent: agentNames[dir] || dir,
                  agentId: dir,
                  action: `Responded: "${summary}"`,
                  type: 'response',
                });
              }
            }
          } catch {}
        }
      } catch {}
    }
  }

  // Sort by timestamp descending and take last 30
  return activities
    .filter(a => a.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
}

function getSystemStats(agents) {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  
  // Count total videos in pipeline
  const drive = readJsonFile(path.join(DATA_DIR, 'drive-content-ids.json')) || {};
  const videoFolders = Object.keys(drive).filter(k => k.startsWith('YouTube/') && k.split('/').length === 2);
  
  const totalTokens = agents.reduce((sum, a) => sum + a.totalTokens, 0);
  const totalCost = agents.reduce((sum, a) => sum + a.totalCost, 0);
  const totalSessions = agents.reduce((sum, a) => sum + a.sessionCount, 0);

  return {
    uptime: `${days}d ${hours}h`,
    uptimeSeconds: uptime,
    vpsCost: '$15/mo',
    videosProduced: videoFolders.length,
    totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
    totalSessions,
    snapshotTime: new Date().toISOString(),
  };
}

// Main
console.log('📸 Creating dashboard snapshot...');

const agents = getAgentInfo();
const pipeline = getPipelineState();
const driveContent = getDriveContent();
const notionContent = getNotionContent();
const recentActivity = getRecentActivity();
const systemStats = getSystemStats(agents);

const snapshot = {
  agents,
  pipeline,
  driveContent,
  notionContent,
  recentActivity,
  systemStats,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'snapshot.json'), JSON.stringify(snapshot, null, 2));

console.log(`✅ Snapshot saved to public/data/snapshot.json`);
console.log(`   Agents: ${agents.length}`);
console.log(`   Activities: ${recentActivity.length}`);
console.log(`   Drive groups: ${driveContent.length}`);
console.log(`   Notion items: ${notionContent.length}`);
console.log(`   Pipeline: ${pipeline ? pipeline.title : 'none'}`);
