#!/usr/bin/env node
/**
 * Weave Dev Server with Hot Reload
 * Watches .weave files and auto-reloads browser
 */

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'

const PORT = 3000
const WATCH_DIR = process.cwd()

// Simple HTTP server
const server = http.createServer((req, res) => {
  // Serve the story player
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(getPlayerHTML())
    return
  }

  // Serve .weave file
  if (req.url?.endsWith('.weave')) {
    const filePath = path.join(WATCH_DIR, req.url)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(content)
      return
    }
  }

  // SSE endpoint for hot reload
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    // Watch for file changes
    const watcher = fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.weave')) {
        console.log(`📝 File changed: ${filename}`)
        res.write(`data: ${JSON.stringify({ type: 'reload', file: filename })}\n\n`)
      }
    })

    req.on('close', () => {
      watcher.close()
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`🔥 Weave Hot Reload Server running at http://localhost:${PORT}`)
  console.log(`📁 Watching: ${WATCH_DIR}`)
  console.log(`✨ Edit any .weave file and see changes instantly!`)
})

function getPlayerHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Weave Hot Reload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 2rem;
            background: #1e1e1e;
            color: #d4d4d4;
        }
        h1 { color: #4ec9b0; }
        .story { line-height: 1.8; margin: 2rem 0; }
        .choice {
            background: #2d2d30;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            cursor: pointer;
            border-left: 3px solid #4ec9b0;
        }
        .choice:hover { background: #3e3e42; }
        .status {
            background: #2d2d30;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        .hot-reload {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: #0e639c;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="hot-reload" id="hotReload">🔥 Hot Reload Active</div>
    <h1>Weave Dev Server</h1>
    <div class="status" id="status">Loading story...</div>
    <div class="story" id="output"></div>

    <script>
        // Connect to SSE for hot reload
        const eventSource = new EventSource('/events');
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                console.log('🔄 Reloading:', data.file);
                document.getElementById('hotReload').textContent = '🔄 Reloading...';
                setTimeout(() => {
                    location.reload();
                }, 300);
            }
        };

        // Simple story player
        async function loadStory() {
            // Try to load a .weave file from current directory
            const files = await fetch('/').then(r => r.text());
            // For now, just show placeholder
            document.getElementById('status').textContent = 'Create a story.weave file and edit it to see hot reload in action!';
            document.getElementById('output').innerHTML = \`
                <p>👋 Welcome to Weave Hot Reload!</p>
                <p>To use:</p>
                <ol>
                    <li>Create a <code>story.weave</code> file in this directory</li>
                    <li>Edit it in your favorite editor</li>
                    <li>Watch this page auto-refresh!</li>
                </ol>
            \`;
        }

        loadStory();
    </script>
</body>
</html>`
}
