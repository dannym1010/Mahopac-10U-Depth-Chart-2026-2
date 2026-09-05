import {
  WeekState,
  FormationBoard,
  PracticePlan,
  DrillFolder,
  DrillItem,
  PlaybookGuideTree,
  PlaybookGuideOrder,
  StaffCoach,
  PracticePeriod,
} from '../types';
import {
  INITIAL_DEFAULT_FORMATIONS,
  DEFAULT_CASCADING_DRILLS,
  DEFAULT_PRACTICE_TEMPLATES,
  DEFAULT_GUIDES_TREE,
  DEFAULT_GUIDES_ORDER,
  DEFAULT_SAVED_COACHES,
  DEFAULT_TEAM_COACHES,
  MASTER_PLAY_LIBRARY,
} from '../data/initialData';

declare global {
  interface Window {
    firebase?: any;
  }
}

export function safeJSONParse<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}":`, e);
  }
  return fallback;
}

export function safeJSONStringify(data: any, space?: number): string {
  if (data === undefined) return '{}';
  try {
    const seen = new WeakSet();
    const result = JSON.stringify(
      data,
      (_k, val) => {
        if (typeof val === 'object' && val !== null) {
          try {
            // Guard against Window, iframe window, or global scope objects
            if (
              (typeof window !== 'undefined' && (val === window || val === window.top || val === window.parent || val === window.self)) ||
              val.constructor?.name === 'Window' ||
              val.constructor?.name === 'global' ||
              (typeof (val as any).setInterval === 'function' && typeof (val as any).document === 'object') ||
              ((val as any).window && (val as any).window === val)
            ) {
              return undefined;
            }
            // Guard against DOM nodes, documents, events
            if (
              (typeof Node !== 'undefined' && val instanceof Node) ||
              (typeof Event !== 'undefined' && val instanceof Event) ||
              (typeof EventTarget !== 'undefined' && val instanceof EventTarget) ||
              val.constructor?.name === 'HTMLDocument' ||
              val.constructor?.name === 'Document'
            ) {
              return undefined;
            }
            // Ignore React internal fiber or element references that may contain circular DOM nodes
            if ((val as any).$$typeof || (val as any)._owner || (val as any)._store) {
              return undefined;
            }
            if (seen.has(val)) {
              return undefined;
            }
            seen.add(val);
          } catch {
            return undefined;
          }
        }
        return val;
      },
      space
    );
    return typeof result === 'string' ? result : '{}';
  } catch (e) {
    console.warn('safeJSONStringify fallback caught error:', e);
    return '{}';
  }
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  try {
    const str = safeJSONStringify(obj);
    if (!str || str === 'undefined' || str === '{}') {
      if (Array.isArray(obj)) return [] as unknown as T;
    }
    return JSON.parse(str);
  } catch {
    return obj;
  }
}

export function safeJSONSet(key: string, data: any) {
  try {
    const cleanStr = safeJSONStringify(data);
    localStorage.setItem(key, cleanStr);
  } catch (e) {
    console.warn(`Error setting localStorage key "${key}":`, e);
  }
}

// Client session identification for sync loop prevention
export const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

function sanitizeTemplatePeriods(periods: any[]): PracticePeriod[] {
  if (!Array.isArray(periods)) return [];
  return periods
    .filter((p) => Boolean(p && typeof p === 'object'))
    .map((p) => {
      const rawStations = Array.isArray(p.stations) ? p.stations : [];
      const validStations = rawStations
        .filter((st: any) => Boolean(st && typeof st === 'object'))
        .map((st: any) => ({
          name: st?.name || '',
          desc: st?.desc || '',
          focus: st?.focus || '',
          coach: (st?.coach || '').trim(),
        }));
      return {
        time: Number(p.time) || 0,
        category: p.category || '',
        format: p.format || 'static',
        stations: validStations.length > 0 ? validStations : [{ name: '', desc: '', coach: '', focus: '' }],
      };
    });
}

/**
 * Normalizes practice templates into a clean Record<string, PracticePeriod[]> map,
 * handling legacy { name, plan } wrapper objects, arrays, and standard maps.
 */
export function normalizePracticeTemplates(raw: any): Record<string, PracticePeriod[]> {
  const result: Record<string, PracticePeriod[]> = {};
  
  // Seed defaults first
  Object.entries(DEFAULT_PRACTICE_TEMPLATES).forEach(([k, v]) => {
    result[k] = sanitizeTemplatePeriods(v);
  });

  if (!raw) return result;

  if (Array.isArray(raw)) {
    raw.forEach((item: any, idx: number) => {
      if (item && typeof item === 'object') {
        const name = item.name || `Template ${idx + 1}`;
        if (Array.isArray(item.plan)) {
          result[name] = sanitizeTemplatePeriods(item.plan);
        }
      }
    });
    return result;
  }

  if (typeof raw === 'object') {
    Object.entries(raw).forEach(([key, val]: [string, any]) => {
      if (Array.isArray(val)) {
        result[key] = sanitizeTemplatePeriods(val);
      } else if (val && typeof val === 'object' && Array.isArray(val.plan)) {
        const name = val.name || (key !== '0' && key !== 'default' ? key : 'Base Practice Plan');
        result[name] = sanitizeTemplatePeriods(val.plan);
      }
    });
  }

  return result;
}

/**
 * Normalizes cascading drill folders, ensuring all custom/saved folders and drills are preserved,
 * subfolders and drills arrays are valid, and stable IDs are assigned.
 */
export function normalizeCascadingDrills(raw: any): DrillFolder[] {
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return deepClone(DEFAULT_CASCADING_DRILLS);
  }

  return raw
    .filter((folder): folder is any => Boolean(folder && typeof folder === 'object' && typeof folder.name === 'string'))
    .map((folder, fIdx) => {
      const folderName = String(folder.name || '').trim() || `Folder ${fIdx + 1}`;
      const rawDrills = Array.isArray(folder.drills) ? folder.drills : [];
      const sanitizedDrills: DrillItem[] = rawDrills
        .filter((d: any) => Boolean(d && typeof d === 'object'))
        .map((d: any, dIdx: number) => ({
          id: typeof d.id === 'string' && d.id ? d.id : `drill_${fIdx}_${dIdx}_${Math.random().toString(36).substring(2, 7)}`,
          name: typeof d.name === 'string' ? d.name : '',
          desc: typeof d.desc === 'string' ? d.desc : '',
          key: typeof d.key === 'string' ? d.key : (typeof d.focus === 'string' ? d.focus : ''),
        }));

      const rawSubfolders = Array.isArray(folder.subfolders) ? folder.subfolders : [];
      const sanitizedSubfolders: DrillFolder[] = rawSubfolders.length > 0 ? normalizeCascadingDrills(rawSubfolders) : [];

      return {
        name: folderName,
        subfolders: sanitizedSubfolders,
        drills: sanitizedDrills,
      };
    });
}

// Track server state availability
let isServerApiAvailable: boolean | null = null;
let serverCheckFailedCount = 0;

export async function checkServerHealth(): Promise<{
  status: string;
  stateVersion: number;
  stateUpdatedAt: number;
  hasCachedState: boolean;
} | null> {
  if (isServerApiAvailable === false) return null;

  try {
    const res = await fetch('/api/health', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      isServerApiAvailable = true;
      serverCheckFailedCount = 0;
      return await res.json();
    } else if (res.status === 404) {
      isServerApiAvailable = false;
    }
  } catch {
    serverCheckFailedCount++;
    if (serverCheckFailedCount > 2) {
      isServerApiAvailable = false;
    }
  }
  return null;
}

// Server-side state sync methods
export async function fetchServerState(): Promise<{
  success: boolean;
  hasData: boolean;
  version: number;
  updatedAt: number;
  state: any;
} | null> {
  if (isServerApiAvailable === false) return null;

  try {
    const res = await fetch('/api/state', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      isServerApiAvailable = true;
      const data = await res.json();
      return data;
    } else if (res.status === 404) {
      isServerApiAvailable = false;
    }
  } catch (err) {
    serverCheckFailedCount++;
    if (serverCheckFailedCount > 2) {
      isServerApiAvailable = false;
    }
  }
  return null;
}

export async function saveServerState(
  state: any,
  author: string = 'coach',
  metadata?: any
): Promise<{ success: boolean; version?: number; updatedAt?: number } | null> {
  if (isServerApiAvailable === false) return null;

  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: safeJSONStringify({
        state,
        author,
        clientId: CLIENT_ID,
        metadata,
      }),
    });
    if (res.ok) {
      isServerApiAvailable = true;
      return await res.json();
    } else if (res.status === 404) {
      isServerApiAvailable = false;
    }
  } catch (err) {
    // Silently fail if server isn't available
  }
  return null;
}

export function subscribeServerEvents(onMessage: (eventData: any) => void): () => void {
  if (
    typeof window === 'undefined' ||
    typeof EventSource === 'undefined' ||
    isServerApiAvailable === false
  ) {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let reconnectTimer: any = null;
  let isClosed = false;
  let connectionErrors = 0;

  function connect() {
    if (isClosed || isServerApiAvailable === false) return;
    try {
      if (eventSource) {
        try {
          eventSource.close();
        } catch {}
        eventSource = null;
      }

      eventSource = new EventSource('/api/state/events');

      eventSource.onopen = () => {
        isServerApiAvailable = true;
        connectionErrors = 0;
      };

      eventSource.onmessage = (e) => {
        try {
          if (!e.data || e.data.startsWith(':')) return;
          const parsed = JSON.parse(e.data);
          onMessage(parsed);
        } catch (err) {
          console.warn('SSE message parse error:', err);
        }
      };

      eventSource.onerror = () => {
        connectionErrors++;
        if (eventSource) {
          try {
            eventSource.close();
          } catch {}
          eventSource = null;
        }

        // If the server returns continuous errors or 404s, stop reconnecting to avoid spam
        if (connectionErrors >= 2) {
          isServerApiAvailable = false;
          return;
        }

        if (!isClosed && isServerApiAvailable) {
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 6000);
        }
      };
    } catch {
      connectionErrors++;
      if (connectionErrors >= 2) {
        isServerApiAvailable = false;
        return;
      }
      if (!isClosed && isServerApiAvailable) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 6000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
      eventSource = null;
    }
  };
}

// Firebase configuration from original app
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyByWAe6BpeDboNzqsC_NxWw0pfnca0sfqE",
  authDomain: "u-football-manager.firebaseapp.com",
  projectId: "u-football-manager",
  storageBucket: "u-football-manager.firebasestorage.app",
  messagingSenderId: "707897728538",
  appId: "1:707897728538:web:5b35e49df4b81d85eb7ba3"
};

let db: any = null;
let auth: any = null;
let storage: any = null;
let isFirebaseInitialized = false;

export function getFirebaseServices() {
  if (!isFirebaseInitialized && typeof window !== 'undefined' && window.firebase) {
    try {
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }
      db = window.firebase.firestore();
      auth = window.firebase.auth();
      storage = window.firebase.storage();
      if (storage?.setMaxUploadRetryTime) {
        storage.setMaxUploadRetryTime(5000);
      }
      isFirebaseInitialized = true;
    } catch (err) {
      console.warn("Firebase initialization error (falling back to offline local storage):", err);
    }
  }
  return { db, auth, storage, isFirebaseInitialized };
}

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

export function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function formatTimeMinutes(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

export function parseTimeString(str: string): number {
  if (!str) return 0;
  const parts = str.trim().split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

// Multi-Coach Section Locks (Depth Chart / Units)
export async function fetchServerLocks(): Promise<any[]> {
  try {
    const res = await fetch('/api/locks', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.locks) ? data.locks : [];
    }
  } catch {}
  return [];
}

export async function acquireServerLock(params: {
  teamId: string;
  week: string;
  unit: string;
  holderEmail: string;
  holderName: string;
  force?: boolean;
}): Promise<{ success: boolean; lock?: any; lockedByOther?: boolean; existingLock?: any; message?: string }> {
  try {
    const res = await fetch('/api/locks/acquire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { success: false };
}

export async function releaseServerLock(params: {
  teamId: string;
  week: string;
  unit: string;
  holderEmail: string;
  force?: boolean;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/locks/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {}
  return false;
}

export async function heartbeatServerLock(params: {
  teamId: string;
  week: string;
  unit: string;
  holderEmail: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/locks/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {}
  return false;
}
