import {
  WeekState,
  FormationBoard,
  PracticePlan,
  DrillFolder,
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
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      data,
      (_k, val) => {
        if (typeof val === 'object' && val !== null) {
          if (typeof window !== 'undefined' && (val === window || (val as any).window === window)) return undefined;
          if (typeof Node !== 'undefined' && val instanceof Node) return undefined;
          if (seen.has(val)) return undefined;
          seen.add(val);
        }
        return val;
      },
      space
    );
  } catch (e) {
    console.warn('safeJSONStringify error:', e);
    return '{}';
  }
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  try {
    const str = safeJSONStringify(obj);
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
