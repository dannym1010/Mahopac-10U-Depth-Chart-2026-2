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

function getFormationUnitPosIds(formations: any[], unit: string): Set<string> {
  const ids = new Set<string>();
  if (Array.isArray(formations)) {
    formations.forEach((f) => {
      if (f && f.unit === unit && Array.isArray(f.rows)) {
        f.rows.forEach((r: any) => {
          if (r && Array.isArray(r.positions)) {
            r.positions.forEach((p: any) => {
              if (p && p.id) ids.add(p.id);
            });
          }
        });
      }
    });
  }
  return ids;
}

function mergeServerState(current: any, incoming: any, metadata?: any): any {
  if (!current || typeof current !== 'object') return incoming;
  if (!incoming || typeof incoming !== 'object') return current;

  const merged: any = { ...current };

  // 1. Merge weeklyData deeply per week and per unit
  if (incoming.weeklyData && typeof incoming.weeklyData === 'object') {
    merged.weeklyData = { ...(current.weeklyData || {}) };

    for (const [weekKey, incWeekState] of Object.entries<any>(incoming.weeklyData)) {
      const curWeekState = merged.weeklyData[weekKey];
      if (!curWeekState) {
        merged.weeklyData[weekKey] = incWeekState;
        continue;
      }

      // Merge formations array preserving the incoming requested order
      let mergedFormations = curWeekState.formations || [];
      if (Array.isArray(incWeekState.formations) && incWeekState.formations.length > 0) {
        const seenIds = new Set<string>();
        const result: any[] = [];

        // 1. Keep incoming formations in their exact received order
        incWeekState.formations.forEach((f: any) => {
          if (f && f.id) {
            seenIds.add(f.id);
            result.push(f);
          }
        });

        // 2. Append any existing formations from other units not present in incoming
        (curWeekState.formations || []).forEach((f: any) => {
          if (f && f.id && !seenIds.has(f.id)) {
            result.push(f);
          }
        });

        mergedFormations = result;
      }

      // Merge Depth Chart per position ID (Offense & Defense positions coexist safely without ghost retention)
      const curDC = curWeekState.depthChart || {};
      const incDC = incWeekState.depthChart || {};
      let mergedDC: Record<string, any> = {};

      if (metadata?.activeUnit && metadata.activeUnit !== 'all') {
        const activeUnitPosIds = getFormationUnitPosIds(mergedFormations, metadata.activeUnit);
        
        // Retain positions from other units
        for (const [posId, players] of Object.entries(curDC)) {
          if (!activeUnitPosIds.has(posId)) {
            mergedDC[posId] = players;
          }
        }
        
        // Take incoming positions for active unit (or any extra position in incDC)
        for (const [posId, players] of Object.entries(incDC)) {
          if (activeUnitPosIds.has(posId) || !mergedDC[posId]) {
            mergedDC[posId] = players;
          }
        }
      } else {
        // Full snapshot save or scope='all': incoming depthChart is authoritative
        mergedDC = { ...incDC };
      }

      // Merge Scrimmage Chart per position ID
      const curSC = curWeekState.scrimmageChart || {};
      const incSC = incWeekState.scrimmageChart || {};
      let mergedSC: Record<string, any> = {};
      if (metadata?.activeUnit === 'scrimmage') {
        mergedSC = { ...curSC, ...incSC };
      } else if (metadata?.scope === 'all' || !metadata?.activeUnit) {
        mergedSC = { ...incSC };
      } else {
        mergedSC = { ...curSC, ...incSC };
      }

      merged.weeklyData[weekKey] = {
        ...curWeekState,
        ...incWeekState,
        formations: mergedFormations,
        depthChart: mergedDC,
        scrimmageChart: mergedSC,
        opponent: incWeekState.opponent || curWeekState.opponent || '',
        wristbandData: incWeekState.wristbandData || curWeekState.wristbandData,
        scouting: incWeekState.scouting || curWeekState.scouting,
      };
    }
  }

  // 2. Merge Default Formations preserving incoming order
  if (Array.isArray(incoming.defaultFormations) && incoming.defaultFormations.length > 0) {
    const seenIds = new Set<string>();
    const result: any[] = [];

    incoming.defaultFormations.forEach((f: any) => {
      if (f && f.id) {
        seenIds.add(f.id);
        result.push(f);
      }
    });

    (current.defaultFormations || []).forEach((f: any) => {
      if (f && f.id && !seenIds.has(f.id)) {
        result.push(f);
      }
    });

    merged.defaultFormations = result;
  }

  // 3. Merge Roster preserving incoming order
  if (Array.isArray(incoming.roster) && incoming.roster.length > 0) {
    const rosterMap = new Map<string, any>();
    (current.roster || []).forEach((p: any) => {
      const key = String(p.id || p.num || p.rosterName || p.name);
      if (key) rosterMap.set(key, p);
    });

    const seenKeys = new Set<string>();
    const result: any[] = [];

    incoming.roster.forEach((p: any) => {
      const key = String(p.id || p.num || p.rosterName || p.name);
      if (key) {
        seenKeys.add(key);
        const existing = rosterMap.get(key);
        result.push(existing ? { ...existing, ...p } : p);
      }
    });

    (current.roster || []).forEach((p: any) => {
      const key = String(p.id || p.num || p.rosterName || p.name);
      if (key && !seenKeys.has(key)) {
        result.push(p);
      }
    });

    merged.roster = result;
  }

  // 4. Merge TeamSavedCoaches & SavedCoaches
  if (incoming.teamSavedCoaches && typeof incoming.teamSavedCoaches === 'object') {
    merged.teamSavedCoaches = {
      ...(current.teamSavedCoaches || {}),
      ...incoming.teamSavedCoaches,
    };
  }
  if (Array.isArray(incoming.savedCoaches)) {
    merged.savedCoaches = Array.from(
      new Set([...(current.savedCoaches || []), ...incoming.savedCoaches])
    );
  }
  if (Array.isArray(incoming.staffList)) {
    const staffMap = new Map<string, any>();
    (current.staffList || []).forEach((s: any) => {
      const key = s.email || s.id;
      if (key) staffMap.set(key, s);
    });
    incoming.staffList.forEach((s: any) => {
      const key = s.email || s.id;
      if (key) staffMap.set(key, s);
    });
    merged.staffList = Array.from(staffMap.values());
  }

  // 5. Merge Practice Plans, Templates, Drills
  if (Array.isArray(incoming.practiceData)) {
    const practiceMap = new Map<string, any>();
    (current.practiceData || []).forEach((p: any) => {
      if (p && p.id) practiceMap.set(p.id, p);
    });
    incoming.practiceData.forEach((p: any) => {
      if (p && p.id) {
        const existing = practiceMap.get(p.id);
        if (!existing || (p.lastEdited || 0) >= (existing.lastEdited || 0)) {
          practiceMap.set(p.id, p);
        }
      }
    });
    merged.practiceData = Array.from(practiceMap.values());
  }
  if (incoming.practiceTemplates && typeof incoming.practiceTemplates === 'object') {
    merged.practiceTemplates = {
      ...(current.practiceTemplates || {}),
      ...incoming.practiceTemplates,
    };
  }
  if (incoming.cascadingDrills && Array.isArray(incoming.cascadingDrills)) {
    merged.cascadingDrills = incoming.cascadingDrills;
  }

  // 6. Merge Schedule & Attendance
  if (Array.isArray(incoming.scheduleEvents)) {
    const seenIds = new Set<string>();
    const result: any[] = [];
    incoming.scheduleEvents.forEach((e: any) => {
      if (e.id) {
        seenIds.add(e.id);
        result.push(e);
      }
    });
    (current.scheduleEvents || []).forEach((e: any) => {
      if (e.id && !seenIds.has(e.id)) {
        result.push(e);
      }
    });
    merged.scheduleEvents = result;
  }
  if (Array.isArray(incoming.attendanceLogs)) {
    const logMap = new Map<string, any>();
    (current.attendanceLogs || []).forEach((l: any) => {
      const key = l.id || `${l.date}_${l.teamId}_${l.type}`;
      logMap.set(key, l);
    });
    incoming.attendanceLogs.forEach((l: any) => {
      const key = l.id || `${l.date}_${l.teamId}_${l.type}`;
      logMap.set(key, l);
    });
    merged.attendanceLogs = Array.from(logMap.values());
  }

  if (Array.isArray(incoming.teams) && incoming.teams.length > 0) {
    const seenIds = new Set<string>();
    const result: any[] = [];
    incoming.teams.forEach((t: any) => {
      if (t.id) {
        seenIds.add(t.id);
        result.push(t);
      }
    });
    (current.teams || []).forEach((t: any) => {
      if (t.id && !seenIds.has(t.id)) {
        result.push(t);
      }
    });
    merged.teams = result;
  }

  if (incoming.seasonConfig) {
    merged.seasonConfig = { ...(current.seasonConfig || {}), ...incoming.seasonConfig };
  }
  if (incoming.guideTree) merged.guideTree = incoming.guideTree;
  if (incoming.guideOrder) merged.guideOrder = incoming.guideOrder;
  if (incoming.masterPlayLibrary) merged.masterPlayLibrary = incoming.masterPlayLibrary;
  if (incoming.collapsedFolders) merged.collapsedFolders = incoming.collapsedFolders;

  return merged;
}

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

function saveStateToDisk(state: any, author: string = 'coach', metadata?: any) {
  ensureDataDir();
  try {
    // Smart granular merge with existing cached state to prevent multi-coach race conditions
    cachedState = mergeServerState(cachedState, state, metadata);
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
      const { state, author, clientId, metadata } = req.body;
      if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid state payload.' });
      }

      const saveResult = saveStateToDisk(state, author || 'coach', metadata);
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
        metadata,
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
