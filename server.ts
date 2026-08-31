import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Server-side State Persistence Directory
const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'football_state.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// In-memory cache of state
let cachedState: any = null;
let stateUpdatedAt = Date.now();
let stateVersion = 1;

function loadStateFromDisk() {
  ensureDataDir();
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        cachedState = parsed.state || parsed;
        stateUpdatedAt = parsed.updatedAt || Date.now();
        stateVersion = parsed.version || 1;
        console.log(`[Server] Loaded persistent football state (v${stateVersion}, updated: ${new Date(stateUpdatedAt).toLocaleTimeString()})`);
      }
    } catch (err) {
      console.error('[Server] Failed to read state from disk:', err);
    }
  }
}

function saveStateToDisk(state: any, author: string = 'coach') {
  ensureDataDir();
  try {
    cachedState = state;
    stateUpdatedAt = Date.now();
    stateVersion += 1;

    const payloadToSave = {
      version: stateVersion,
      updatedAt: stateUpdatedAt,
      lastAuthor: author,
      state: cachedState,
    };

    // Atomic write via temp file
    const tempFile = `${STATE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(payloadToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, STATE_FILE);
    return { success: true, version: stateVersion, updatedAt: stateUpdatedAt };
  } catch (err) {
    console.error('[Server] Failed to write state to disk:', err);
    return { success: false, error: String(err) };
  }
}

// Active Server-Sent Events clients for live multi-coach sync
const sseClients = new Set<express.Response>();

function broadcastStateUpdate(data: any, senderClientId?: string) {
  const message = `data: ${JSON.stringify({ type: 'sync', ...data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  loadStateFromDisk();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      stateVersion,
      stateUpdatedAt,
      hasCachedState: !!cachedState,
      connectedClients: sseClients.size,
    });
  });

  // State Persistence: Get current server-side state
  app.get('/api/state', (req, res) => {
    res.json({
      success: true,
      hasData: !!cachedState,
      version: stateVersion,
      updatedAt: stateUpdatedAt,
      state: cachedState,
    });
  });

  // State Persistence: Save full or scoped state from any coach
  app.post('/api/state', (req, res) => {
    try {
      const { state, author, clientId } = req.body;
      if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid state payload.' });
      }

      const saveResult = saveStateToDisk(state, author || 'coach');
      if (!saveResult.success) {
        return res.status(500).json({ error: 'Failed to save state to server disk.' });
      }

      // Broadcast to other open browser tabs / coaches
      broadcastStateUpdate({
        version: stateVersion,
        updatedAt: stateUpdatedAt,
        lastAuthor: author,
        state: cachedState,
        senderClientId: clientId,
      });

      return res.json({
        success: true,
        version: stateVersion,
        updatedAt: stateUpdatedAt,
      });
    } catch (err: any) {
      console.error('[Server] /api/state POST error:', err);
      return res.status(500).json({ error: err?.message || 'Server save error' });
    }
  });

  // Real-time SSE Endpoint for multi-coach live sync
  app.get('/api/state/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', version: stateVersion, updatedAt: stateUpdatedAt })}\n\n`);

    sseClients.add(res);

    // Heartbeat ping every 25 seconds to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // TeamSnap iCal proxy fetch to avoid CORS blocks
  app.all(['/api/teamsnap/fetch-ical'], async (req, res) => {
    try {
      let url = req.method === 'POST' ? req.body?.url : req.query?.url;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing calendar feed URL.' });
      }

      // Clean & normalize URL
      url = url.trim().replace(/^["']|["']$/g, '');
      
      let targetUrl = url;
      if (targetUrl.startsWith('webcal://')) {
        targetUrl = 'https://' + targetUrl.substring(9);
      }

      // Candidate URLs to try (in order of preference)
      const urlsToTry: string[] = [];
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        urlsToTry.push(targetUrl);
        if (targetUrl.startsWith('https://')) {
          urlsToTry.push('http://' + targetUrl.substring(8));
        } else if (targetUrl.startsWith('http://')) {
          urlsToTry.push('https://' + targetUrl.substring(7));
        }
      } else {
        urlsToTry.push('https://' + targetUrl);
        urlsToTry.push('http://' + targetUrl);
      }

      let icsContent = '';
      let lastError: any = null;

      for (const tryUrl of urlsToTry) {
        try {
          const response = await fetch(tryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/calendar, text/plain, */*',
            },
            redirect: 'follow',
          });

          if (response.ok) {
            const text = await response.text();
            if (text && text.includes('BEGIN:VCALENDAR')) {
              icsContent = text;
              break;
            }
          } else {
            lastError = new Error(`HTTP ${response.status} from ${tryUrl}`);
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
        return res.status(400).json({
          error: `Could not retrieve a valid iCal feed. ${lastError ? lastError.message : 'Please check URL.'}`,
        });
      }

      return res.json({ success: true, icsContent });
    } catch (err: any) {
      console.error('Error fetching TeamSnap calendar:', err);
      return res.status(500).json({ error: err?.message || 'Server failed to retrieve calendar feed.' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Football Operations Server running on port ${PORT}`);
  });
}

startServer();
