import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Code,
  FileCode,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Printer,
  Columns,
  Search,
  UploadCloud,
  Shield,
  Zap,
  Tag,
  CheckCircle2,
  Flame,
  Clock,
  User,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ScoutingData, ScoutingAttachment, CoachScoutingNote, OpponentKeyPlayer } from '../../types';

interface HtmlScoutingReportViewerProps {
  scouting: ScoutingData;
  attachments?: ScoutingAttachment[];
  isPowerAdmin?: boolean;
  onUpdateAttachments: (updated: ScoutingAttachment[]) => void;
  opponentName: string;
  weekName: string;
  currentUserEmail?: string;
  onAddKeyToVictory?: (text: string) => void;
  onSyncToStaffNotes?: (note: CoachScoutingNote) => void;
}

/**
 * Generates an executive, NFL/Hudl-grade standalone HTML Scouting Dossier
 * compiled directly from the live ScoutingView data.
 */
export const generateComprehensiveScoutingHtml = (
  scouting: ScoutingData,
  opponent: string,
  week: string
): string => {
  const oppTitle = opponent || scouting.opponent || 'Upcoming Opponent';
  const weekTitle = week || scouting.week || 'Game Week';
  const gameDate = scouting.gameDate || 'Date TBD';
  const gameLocation = scouting.gameLocation || 'Location TBD';

  const keys: string[] =
    scouting.keysToVictory && scouting.keysToVictory.length > 0
      ? scouting.keysToVictory
      : [
          'Win the line of scrimmage with aggressive, disciplined pad level',
          'Eliminate pre-snap alignment mistakes and assignment bust penalties',
          'Pursue with gang-tackle swarm and maintain sound cutback contain',
        ];

  const players: OpponentKeyPlayer[] =
    (scouting.keyPlayers as OpponentKeyPlayer[]) || [];

  const notes: CoachScoutingNote[] = scouting.coachNotes || [];

  const defFront = scouting.defenseFront || scouting.defensiveFronts || '4-4 Base / 5-3 Under';
  const defCoverage = scouting.defenseCoverage || 'Cover 3 Sky / Cover 1 Man-Free';
  const defTendencies =
    scouting.defenseTendencies ||
    'Heavy A-gap blitz pressure on passing downs. Outside linebackers flow fast to perimeter flow; vulnerable to misdirection, counter trays, and backside cutbacks.';

  const offFormations = scouting.offenseFormations || 'Shotgun Spread 11 / Pistol Heavy 20';
  const runPass = scouting.runPassRatio || '65% Run / 35% Pass';
  const offTendencies =
    scouting.offenseTendencies ||
    scouting.offensiveTendencies ||
    'Run-heavy on 1st & 2nd downs. Heavy reliance on off-tackle sweep and jet motion. When behind the chains, sets up quick screens and shallow mesh crossers.';

  // Parse run/pass ratio for visual gauge
  let runPct = 65;
  let passPct = 35;
  const match = runPass.match(/(\d+)[^\d]+(\d+)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const p = parseInt(match[2], 10);
    if (!isNaN(r) && !isNaN(p) && r + p > 0) {
      runPct = Math.round((r / (r + p)) * 100);
      passPct = 100 - runPct;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${oppTitle} - Scouting Report Dossier (${weekTitle})</title>
  <style>
    :root {
      --bg: #0b1120;
      --card-bg: #ffffff;
      --header-bg: #0f172a;
      --primary: #1e3a8a;
      --accent: #f59e0b;
      --accent-hover: #d97706;
      --text-dark: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --danger-bg: #fef2f2;
      --danger-border: #ef4444;
      --danger-text: #991b1b;
      --warn-bg: #fffbeb;
      --warn-border: #f59e0b;
      --warn-text: #92400e;
      --success-bg: #ecfdf5;
      --success-border: #10b981;
      --success-text: #065f46;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
    }
    /* Executive Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 26px 30px;
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
      margin-bottom: 22px;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: "";
      position: absolute;
      top: -30px;
      right: -30px;
      width: 160px;
      height: 160px;
      background: rgba(245, 158, 11, 0.12);
      border-radius: 50%;
      pointer-events: none;
    }
    .header-tagline {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #fbbf24;
      margin-bottom: 6px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #ffffff;
    }
    .header-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

    /* Alert Banner */
    .alert-banner {
      background: #fef2f2;
      border-left: 5px solid #ef4444;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 22px;
      box-shadow: 0 2px 5px rgba(239, 68, 68, 0.08);
    }
    .alert-title {
      font-size: 12px;
      font-weight: 900;
      color: #991b1b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .alert-desc {
      font-size: 13px;
      color: #7f1d1d;
      margin: 0;
      font-weight: 500;
    }

    /* Grid Layout */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 22px;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .card-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      margin: 0 0 14px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Keys List */
    .keys-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .key-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    .key-num {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      font-size: 11px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Ratio Bar */
    .ratio-wrap {
      margin: 12px 0 16px 0;
    }
    .ratio-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .ratio-bar {
      height: 14px;
      border-radius: 9999px;
      display: flex;
      overflow: hidden;
      background: #e2e8f0;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    .ratio-run {
      background: #10b981;
      height: 100%;
      transition: width 0.3s;
    }
    .ratio-pass {
      background: #3b82f6;
      height: 100%;
      transition: width 0.3s;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10.5px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:last-child td { border-bottom: none; }

    /* Threat Pills */
    .threat-pill {
      font-weight: 800;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-block;
      text-transform: uppercase;
    }
    .threat-high { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .threat-med { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .threat-low { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* Scheme Specs */
    .spec-item {
      margin-bottom: 12px;
    }
    .spec-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 2px;
    }
    .spec-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .spec-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }

    /* Staff Notes Section */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }
    .note-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }
    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .note-cat {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #3b82f6;
    }
    .note-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .note-body {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }
    .note-footer {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 8px;
      font-style: italic;
    }

    /* Print Formatting */
    @media print {
      body {
        background: #ffffff;
        padding: 0;
        color: #000000;
      }
      .container { max-width: 100%; }
      .header {
        background: #1e293b !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        padding: 18px 20px;
      }
      .card {
        box-shadow: none;
        border: 1px solid #94a3b8;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-tagline">🏈 MAHOPAC 10U COACHING STAFF &bull; CONFIDENTIAL GAME DOSSIER</div>
      <h1>${oppTitle} &bull; FILM SCOUT &amp; GAME PLAN</h1>
      <div class="header-meta">
        <span>📅 ${gameDate}</span>
        <span>&bull;</span>
        <span>📍 ${gameLocation}</span>
        <span>&bull;</span>
        <span class="badge badge-amber">${weekTitle}</span>
        <span class="badge badge-blue">LIVE SCOUT MATRIX</span>
      </div>
    </div>

    <!-- Alert / Critical Key -->
    <div class="alert-banner">
      <div class="alert-title">🚨 PRIMARY GAME FOCUS &amp; KEYS TO VICTORY</div>
      <p class="alert-desc">${keys[0] || 'Execute base assignments cleanly and control the line of scrimmage.'}</p>
    </div>

    <!-- Grid 1: Keys to Victory + Defensive Scheme -->
    <div class="grid-2">
      <!-- Keys to Victory -->
      <div class="card">
        <div class="card-title">
          <span>🎯 Keys to Victory</span>
          <span class="badge badge-amber">${keys.length} Goals</span>
        </div>
        <ul class="keys-list">
          ${keys
            .map(
              (k, idx) => `
            <li class="key-item">
              <span class="key-num">${idx + 1}</span>
              <span>${k}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>

      <!-- Defensive Front & Coverage -->
      <div class="card">
        <div class="card-title">
          <span>🛡️ Opponent Defense Breakdown</span>
          <span class="badge badge-blue">SCHEME ANALYSIS</span>
        </div>
        <div class="spec-item">
          <div class="spec-label">Base Front Alignment</div>
          <div class="spec-val">${defFront}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Coverage Shell</div>
          <div class="spec-val">${defCoverage}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Tendencies &amp; Blitz Packages</div>
          <div class="spec-box">${defTendencies}</div>
        </div>
      </div>
    </div>

    <!-- Grid 2: Offensive Tendencies & Ratio + Key Personnel -->
    <div class="grid-2">
      <!-- Offensive Tendencies -->
      <div class="card">
        <div class="card-title">
          <span>⚡ Opponent Offense Breakdown</span>
          <span class="badge badge-blue">ATTACK TENDENCIES</span>
        </div>
        <div class="spec-item">
          <div class="spec-label">Primary Formations</div>
          <div class="spec-val">${offFormations}</div>
        </div>

        <div class="ratio-wrap">
          <div class="ratio-header">
            <span style="color:#059669;">Run ${runPct}%</span>
            <span style="color:#2563eb;">Pass ${passPct}%</span>
          </div>
          <div class="ratio-bar">
            <div class="ratio-run" style="width: ${runPct}%;"></div>
            <div class="ratio-pass" style="width: ${passPct}%;"></div>
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Playcalling Tendencies &amp; Tells</div>
          <div class="spec-box">${offTendencies}</div>
        </div>
      </div>

      <!-- Key Players to Watch -->
      <div class="card">
        <div class="card-title">
          <span>⭐ Key Opponent Players</span>
          <span class="badge badge-amber">${players.length} Impact Players</span>
        </div>
        ${
          players.length > 0
            ? `
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>Threat</th>
                <th>Matchup Notes</th>
              </tr>
            </thead>
            <tbody>
              ${players
                .map(
                  (p) => `
                <tr>
                  <td><strong>${p.jersey || p.num || '-'}</strong></td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.position || p.pos || '-'}</td>
                  <td>
                    <span class="threat-pill ${
                      p.threatLevel === 'High'
                        ? 'threat-high'
                        : p.threatLevel === 'Medium'
                        ? 'threat-med'
                        : 'threat-low'
                    }">
                      ${p.threatLevel}
                    </span>
                  </td>
                  <td>${p.notes || 'Monitor closely on all snaps.'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
            : `
          <div class="spec-box" style="text-align: center; color: #64748b;">
            No opponent key players entered yet. Add key players in the Scouting View or Report Notes tab.
          </div>
        `
        }
      </div>
    </div>

    <!-- Staff Film Notes -->
    ${
      notes.length > 0
        ? `
      <div class="card">
        <div class="card-title">
          <span>📝 Coaching Staff Film Observations</span>
          <span class="badge badge-blue">${notes.length} Notes Logged</span>
        </div>
        <div class="notes-grid">
          ${notes
            .map(
              (n) => `
            <div class="note-card">
              <div class="note-header">
                <span class="note-cat">${n.category}</span>
              </div>
              <div class="note-title">${n.title}</div>
              <div class="note-body">${n.content}</div>
              <div class="note-footer">Coach: ${n.author || 'Staff'} &bull; ${new Date(
                n.timestamp || n.createdAt || Date.now()
              ).toLocaleDateString()}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    <!-- Dossier Footer -->
    <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8;">
      Generated for Mahopac 10U Football Operations &bull; ${weekTitle} vs ${oppTitle} &bull; All Rights Reserved
    </div>
  </div>
</body>
</html>`;
};

/**
 * Isolated Shadow DOM HTML Container
 * Guarantees that CSS is encapsulated and NEVER crashes or is blocked by parent iframe sandbox!
 */
const ShadowHtmlView: React.FC<{
  html: string;
  zoomScale: number;
  canvasBg: 'paper' | 'dark' | 'slate';
  isFullscreen?: boolean;
}> = ({ html, zoomScale, canvasBg, isFullscreen }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    let shadow = hostRef.current.shadowRoot;
    if (!shadow) {
      shadow = hostRef.current.attachShadow({ mode: 'open' });
    }
    shadow.innerHTML =
      html ||
      '<div style="padding: 40px; text-align: center; color: #64748b; font-family: sans-serif;"><h3>No HTML report content available</h3><p>Click "Sync from Live View" to generate your dossier.</p></div>';
  }, [html]);

  const bgClass =
    canvasBg === 'paper' ? 'bg-slate-100' : canvasBg === 'dark' ? 'bg-slate-950' : 'bg-slate-900';

  return (
    <div
      className={`w-full overflow-auto flex justify-center p-3 sm:p-5 ${bgClass} transition-colors ${
        isFullscreen ? 'h-[calc(100vh-140px)]' : 'min-h-[620px] max-h-[760px]'
      }`}
    >
      <div
        style={{
          width: `${zoomScale}%`,
          maxWidth: zoomScale > 100 ? `${zoomScale}%` : '100%',
          transition: 'width 0.15s ease-out',
        }}
        className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-white"
      >
        <div ref={hostRef} className="w-full min-h-[580px]" />
      </div>
    </div>
  );
};

export const HtmlScoutingReportViewer: React.FC<HtmlScoutingReportViewerProps> = ({
  scouting,
  attachments = [],
  isPowerAdmin = true,
  onUpdateAttachments,
  opponentName,
  weekName,
  currentUserEmail = 'Coach',
  onAddKeyToVictory,
  onSyncToStaffNotes,
}) => {
  // Generate the live HTML report from the current working scouting view
  const liveGeneratedHtml = useMemo(() => {
    return generateComprehensiveScoutingHtml(scouting, opponentName, weekName);
  }, [scouting, opponentName, weekName]);

  // All HTML reports in attachments
  const customHtmlAttachments = useMemo(() => {
    return attachments.filter((a) => a.type === 'html');
  }, [attachments]);

  // Selected report ID: 'live_view_dossier' OR custom attachment id
  const [selectedReportId, setSelectedReportId] = useState<string>('live_view_dossier');

  // Currently active HTML report
  const currentAttachment = useMemo(() => {
    if (selectedReportId === 'live_view_dossier') return null;
    return customHtmlAttachments.find((a) => a.id === selectedReportId) || null;
  }, [customHtmlAttachments, selectedReportId]);

  // The active HTML code to display
  const activeHtmlCode = useMemo(() => {
    if (currentAttachment && currentAttachment.htmlCode) {
      return currentAttachment.htmlCode;
    }
    return liveGeneratedHtml;
  }, [currentAttachment, liveGeneratedHtml]);

  // Primary Viewer Tab: 'viewer' (Report Dossier) | 'notes' (Report Notes & Annotations)
  const [activeTab, setActiveTab] = useState<'viewer' | 'notes'>('viewer');

  // Viewer rendering mode: 'shadow' (clean native) | 'iframe' (raw frame)
  const [renderMode, setRenderMode] = useState<'shadow' | 'iframe'>('shadow');

  // Split-view mode: Show Viewer + Notes side-by-side
  const [isSplitView, setIsSplitView] = useState(false);

  // Fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom scale: 80% to 130%
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Canvas background
  const [canvasBg, setCanvasBg] = useState<'paper' | 'dark' | 'slate'>('paper');

  // Code editor modal state
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [editCodeTitle, setEditCodeTitle] = useState('');
  const [editCodeHtml, setEditCodeHtml] = useState('');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Notes state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Opponent Tendency');
  const [notePriority, setNotePriority] = useState<'High' | 'Important' | 'Normal'>('High');
  const [noteDownDistance, setNoteDownDistance] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesCategoryFilter, setNotesCategoryFilter] = useState('all');
  const [copiedNotes, setCopiedNotes] = useState(false);

  // File input ref for uploading HTML files
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  // Get notes for current report or master staff notes
  const reportNotes: CoachScoutingNote[] = useMemo(() => {
    if (currentAttachment && currentAttachment.notes) {
      return currentAttachment.notes;
    }
    return scouting.coachNotes || [];
  }, [currentAttachment, scouting.coachNotes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return reportNotes.filter((n) => {
      const matchesCat = notesCategoryFilter === 'all' || n.category === notesCategoryFilter;
      const searchLower = notesSearch.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        n.title.toLowerCase().includes(searchLower) ||
        n.content.toLowerCase().includes(searchLower) ||
        (n.author && n.author.toLowerCase().includes(searchLower));
      return matchesCat && matchesSearch;
    });
  }, [reportNotes, notesCategoryFilter, notesSearch]);

  // Sync / Save Live Dossier into attachments as a permanent HTML report
  const handleSaveLiveDossierToAttachments = () => {
    const opp = opponentName || scouting.opponent || 'Opponent';
    const wk = weekName || scouting.week || 'Game Week';
    const reportName = `${opp} Live Scouting Dossier (${wk})`;

    const existingIdx = attachments.findIndex(
      (a) => a.type === 'html' && a.id === 'live_scouting_dossier'
    );

    const dossierAttachment: ScoutingAttachment = {
      id: 'live_scouting_dossier',
      name: reportName,
      type: 'html',
      htmlCode: liveGeneratedHtml,
      fileSize: `${(new Blob([liveGeneratedHtml]).size / 1024).toFixed(1)} KB`,
      caption: `Auto-generated interactive scouting dossier from game plan view`,
      createdAt: Date.now(),
      notes: currentAttachment?.notes || [],
    };

    let updatedList: ScoutingAttachment[];
    if (existingIdx >= 0) {
      updatedList = attachments.map((a, idx) => (idx === existingIdx ? dossierAttachment : a));
    } else {
      updatedList = [dossierAttachment, ...attachments];
    }

    onUpdateAttachments(updatedList);
    setSelectedReportId('live_scouting_dossier');
    setSyncToast('Dossier successfully synced from current Scouting View!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Open HTML in standalone browser tab
  const handleOpenInNewTab = () => {
    const blob = new Blob([activeHtmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Download HTML file
  const handleDownloadHtml = () => {
    const blob = new Blob([activeHtmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (
      currentAttachment?.name || `${opponentName || 'opponent'}_scouting_report`
    ).replace(/\s+/g, '_');
    link.download = `${cleanName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Direct print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(activeHtmlCode);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  // Upload external .html file
  const handleUploadHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const newAttachment: ScoutingAttachment = {
        id: `html_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'html',
        htmlCode: content,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        caption: `Uploaded HTML scouting file on ${new Date().toLocaleDateString()}`,
        createdAt: Date.now(),
        notes: [],
      };

      onUpdateAttachments([newAttachment, ...attachments]);
      setSelectedReportId(newAttachment.id);
      setSyncToast(`Uploaded "${file.name}" successfully!`);
      setTimeout(() => setSyncToast(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Open HTML source code editor modal
  const handleOpenCodeEditor = () => {
    if (currentAttachment) {
      setEditCodeTitle(currentAttachment.name);
      setEditCodeHtml(currentAttachment.htmlCode || '');
    } else {
      setEditCodeTitle(`${opponentName || 'Opponent'} Custom HTML Report`);
      setEditCodeHtml(liveGeneratedHtml);
    }
    setIsCodeEditorOpen(true);
  };

  // Save changes from source editor
  const handleSaveCodeEditor = () => {
    if (!editCodeHtml.trim()) return;

    if (currentAttachment) {
      const updated = attachments.map((a) => {
        if (a.id === currentAttachment.id) {
          return {
            ...a,
            name: editCodeTitle.trim() || a.name,
            htmlCode: editCodeHtml,
            fileSize: `${(new Blob([editCodeHtml]).size / 1024).toFixed(1)} KB`,
          };
        }
        return a;
      });
      onUpdateAttachments(updated);
    } else {
      const newReport: ScoutingAttachment = {
        id: `html_${Date.now()}_custom`,
        name: editCodeTitle.trim() || `${opponentName} Custom HTML Report`,
        type: 'html',
        htmlCode: editCodeHtml,
        fileSize: `${(new Blob([editCodeHtml]).size / 1024).toFixed(1)} KB`,
        caption: `Custom modified HTML report for ${weekName}`,
        createdAt: Date.now(),
        notes: [],
      };
      onUpdateAttachments([newReport, ...attachments]);
      setSelectedReportId(newReport.id);
    }

    setIsCodeEditorOpen(false);
    setSyncToast('HTML report updated!');
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Add new note to current HTML report
  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: CoachScoutingNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `${notePriority === 'High' ? '🚨 ' : ''}${noteTitle.trim()}${
        noteDownDistance ? ` [${noteDownDistance}]` : ''
      }`,
      category: noteCategory,
      content: noteContent.trim(),
      author: currentUserEmail || 'Coach',
      authorRole: 'Scouting Staff',
      timestamp: Date.now(),
      createdAt: Date.now(),
    };

    if (currentAttachment) {
      const updated = attachments.map((a) => {
        if (a.id === currentAttachment.id) {
          return {
            ...a,
            notes: [newNote, ...(a.notes || [])],
          };
        }
        return a;
      });
      onUpdateAttachments(updated);
    }

    // Also sync to master staff notes if handler provided
    if (onSyncToStaffNotes) {
      onSyncToStaffNotes(newNote);
    }

    // Reset fields
    setNoteTitle('');
    setNoteContent('');
    setNoteDownDistance('');
    setIsAddingNote(false);
    setSyncToast('Note saved & synced to coaching observations!');
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (currentAttachment) {
      const updated = attachments.map((a) => {
        if (a.id === currentAttachment.id) {
          return {
            ...a,
            notes: (a.notes || []).filter((n) => n.id !== noteId),
          };
        }
        return a;
      });
      onUpdateAttachments(updated);
    }
  };

  // Copy notes to clipboard
  const handleCopyAllNotes = () => {
    if (reportNotes.length === 0) return;
    const text =
      `📋 REPORT NOTES: ${currentAttachment?.name || `${opponentName} Game Dossier`}\n` +
      `🏈 Opponent: ${opponentName} (${weekName})\n\n` +
      reportNotes
        .map(
          (n, idx) =>
            `${idx + 1}. [${n.category.toUpperCase()}] ${n.title}\n   ${n.content}\n   — By: ${
              n.author || 'Staff'
            }`
        )
        .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div
      className={`bg-slate-850/95 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-2 z-50 flex flex-col bg-slate-900 border-amber-500/80 shadow-2xl'
          : 'relative'
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={htmlFileInputRef}
        type="file"
        accept=".html,.htm,text/html"
        className="hidden"
        onChange={handleUploadHtmlFile}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-500/90 text-white text-xs font-black px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{syncToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            className="text-white hover:text-emerald-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Command Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Branding & Report Picker */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
            <FileCode className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Executive Film Dossier</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {opponentName ? `${opponentName} • ` : ''}
                {weekName}
              </span>
            </div>

            {/* Report Source Selector */}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 font-black text-xs sm:text-sm rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer max-w-[280px] sm:max-w-xs truncate"
              >
                <option value="live_view_dossier">
                  ⚡ Live Game Dossier (Synced from Scouting View)
                </option>
                {customHtmlAttachments.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    📄 {rep.name} {rep.fileSize ? `(${rep.fileSize})` : ''}
                  </option>
                ))}
              </select>

              {/* Sync from Scouting View Button */}
              <button
                type="button"
                onClick={handleSaveLiveDossierToAttachments}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Sync and update this HTML report with the latest live data from your Scouting View"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Sync from View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Primary Tabs (Report Dossier vs Notes Tab) */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold self-start lg:self-center shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('viewer')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'viewer'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-300" />
            <span>Report Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>Report Notes &amp; Tells</span>
            {reportNotes.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'notes'
                    ? 'bg-black/30 text-amber-200'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {reportNotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Split View Toggle */}
          <button
            type="button"
            onClick={() => setIsSplitView((s) => !s)}
            className={`hidden md:flex px-3 py-1.5 rounded-xl text-xs font-bold border items-center gap-1.5 transition-all cursor-pointer ${
              isSplitView
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="View Report and Notes Side-by-Side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          {/* Edit HTML Source Code */}
          {isPowerAdmin && (
            <button
              type="button"
              onClick={handleOpenCodeEditor}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Edit raw HTML code or insert custom templates"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Edit HTML</span>
            </button>
          )}

          {/* Open in Standalone Tab */}
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            title="Open standalone in new browser tab"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
          </button>

          {/* Print Dossier */}
          <button
            type="button"
            onClick={handlePrintReport}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            title="Print printable HTML scouting report"
          >
            <Printer className="w-4 h-4 text-amber-400" />
          </button>

          {/* Download .html file */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            title="Download self-contained .html file"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Upload new .html file */}
          <button
            type="button"
            onClick={() => htmlFileInputRef.current?.click()}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            title="Upload custom .html report"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Fullscreen Expansion Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${isFullscreen ? 'h-full overflow-hidden' : ''}`}>
        {/* Split View Mode */}
        {isSplitView ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[640px] border-b border-slate-800">
            {/* Left Column: Dossier Viewer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950">
              <ReportToolbar
                zoomScale={zoomScale}
                setZoomScale={setZoomScale}
                canvasBg={canvasBg}
                setCanvasBg={setCanvasBg}
                renderMode={renderMode}
                setRenderMode={setRenderMode}
              />
              {renderMode === 'shadow' ? (
                <ShadowHtmlView
                  html={activeHtmlCode}
                  zoomScale={zoomScale}
                  canvasBg={canvasBg}
                  isFullscreen={isFullscreen}
                />
              ) : (
                <div className="w-full h-[620px] bg-white">
                  <iframe
                    srcDoc={activeHtmlCode}
                    title="Scouting Report"
                    className="w-full h-full border-none"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Report Notes (5 cols) */}
            <div className="lg:col-span-5 flex flex-col bg-slate-900/95 overflow-y-auto max-h-[750px] p-4 sm:p-5">
              <ReportNotesWorkspace
                reportNotes={reportNotes}
                filteredNotes={filteredNotes}
                isAddingNote={isAddingNote}
                setIsAddingNote={setIsAddingNote}
                noteTitle={noteTitle}
                setNoteTitle={setNoteTitle}
                noteContent={noteContent}
                setNoteContent={setNoteContent}
                noteCategory={noteCategory}
                setNoteCategory={setNoteCategory}
                notePriority={notePriority}
                setNotePriority={setNotePriority}
                noteDownDistance={noteDownDistance}
                setNoteDownDistance={setNoteDownDistance}
                notesSearch={notesSearch}
                setNotesSearch={setNotesSearch}
                notesCategoryFilter={notesCategoryFilter}
                setNotesCategoryFilter={setNotesCategoryFilter}
                copiedNotes={copiedNotes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onCopyAllNotes={handleCopyAllNotes}
                onAddKeyToVictory={onAddKeyToVictory}
                currentUserEmail={currentUserEmail}
                isPowerAdmin={isPowerAdmin}
              />
            </div>
          </div>
        ) : activeTab === 'viewer' ? (
          /* Tab 1: Full Report Dossier */
          <div className="flex flex-col bg-slate-950">
            <ReportToolbar
              zoomScale={zoomScale}
              setZoomScale={setZoomScale}
              canvasBg={canvasBg}
              setCanvasBg={setCanvasBg}
              renderMode={renderMode}
              setRenderMode={setRenderMode}
              noteCount={reportNotes.length}
              onSwitchToNotes={() => setActiveTab('notes')}
            />

            {renderMode === 'shadow' ? (
              <ShadowHtmlView
                html={activeHtmlCode}
                zoomScale={zoomScale}
                canvasBg={canvasBg}
                isFullscreen={isFullscreen}
              />
            ) : (
              <div
                className={`w-full overflow-auto flex justify-center p-3 sm:p-5 ${
                  canvasBg === 'paper' ? 'bg-slate-100' : 'bg-slate-950'
                } min-h-[620px]`}
              >
                <div
                  style={{
                    width: `${zoomScale}%`,
                    maxWidth: zoomScale > 100 ? `${zoomScale}%` : '100%',
                    height: '620px',
                  }}
                  className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white"
                >
                  <iframe
                    srcDoc={activeHtmlCode}
                    title="Scouting Report"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Full Report Notes & Annotations */
          <div className="p-5 sm:p-6 bg-slate-900/95">
            <div className="max-w-5xl mx-auto">
              <ReportNotesWorkspace
                reportNotes={reportNotes}
                filteredNotes={filteredNotes}
                isAddingNote={isAddingNote}
                setIsAddingNote={setIsAddingNote}
                noteTitle={noteTitle}
                setNoteTitle={setNoteTitle}
                noteContent={noteContent}
                setNoteContent={setNoteContent}
                noteCategory={noteCategory}
                setNoteCategory={setNoteCategory}
                notePriority={notePriority}
                setNotePriority={setNotePriority}
                noteDownDistance={noteDownDistance}
                setNoteDownDistance={setNoteDownDistance}
                notesSearch={notesSearch}
                setNotesSearch={setNotesSearch}
                notesCategoryFilter={notesCategoryFilter}
                setNotesCategoryFilter={setNotesCategoryFilter}
                copiedNotes={copiedNotes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onCopyAllNotes={handleCopyAllNotes}
                onAddKeyToVictory={onAddKeyToVictory}
                currentUserEmail={currentUserEmail}
                isPowerAdmin={isPowerAdmin}
                isFullTab
              />
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {selectedReportId === 'live_view_dossier'
                  ? 'Live Dossier Engine Active (Auto-synced from Scouting View)'
                  : `Viewing: ${currentAttachment?.name || 'HTML Document'}`}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveLiveDossierToAttachments}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync with View</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={handleOpenCodeEditor}
              className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Code className="w-3 h-3" />
              <span>HTML Source</span>
            </button>
          </div>
        </div>
      </div>

      {/* HTML Source Code Editor Modal */}
      {isCodeEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <Code className="w-4 h-4" />
                <span>HTML Source Code &amp; Templates</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={editCodeTitle}
                  onChange={(e) => setEditCodeTitle(e.target.value)}
                  placeholder="e.g. Somers Week 4 Complete Dossier"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    HTML Markup &amp; Embedded Styles
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditCodeHtml(
                        generateComprehensiveScoutingHtml(scouting, opponentName, weekName)
                      )
                    }
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Reset to Live Game Plan Template</span>
                  </button>
                </div>
                <textarea
                  rows={16}
                  value={editCodeHtml}
                  onChange={(e) => setEditCodeHtml(e.target.value)}
                  placeholder="<!DOCTYPE html><html><body>...</body></html>"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed shadow-inner"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCodeEditorOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCodeEditor}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save HTML Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* SUB-COMPONENT: REPORT TOOLBAR */
/* ========================================================================= */
interface ReportToolbarProps {
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  canvasBg: 'paper' | 'dark' | 'slate';
  setCanvasBg: React.Dispatch<React.SetStateAction<'paper' | 'dark' | 'slate'>>;
  renderMode: 'shadow' | 'iframe';
  setRenderMode: React.Dispatch<React.SetStateAction<'shadow' | 'iframe'>>;
  noteCount?: number;
  onSwitchToNotes?: () => void;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
  zoomScale,
  setZoomScale,
  canvasBg,
  setCanvasBg,
  renderMode,
  setRenderMode,
  noteCount,
  onSwitchToNotes,
}) => {
  return (
    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
      <div className="flex items-center gap-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(70, z - 10))}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-amber-300 font-bold px-1 min-w-[40px] text-center">
            {zoomScale}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(130, z + 10))}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomScale !== 100 && (
            <button
              type="button"
              onClick={() => setZoomScale(100)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              100%
            </button>
          )}
        </div>

        {/* Canvas Background Options */}
        <div className="flex items-center gap-1 text-[11px] bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setCanvasBg('paper')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              canvasBg === 'paper'
                ? 'bg-slate-800 text-amber-300 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Clean Paper
          </button>
          <button
            type="button"
            onClick={() => setCanvasBg('dark')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              canvasBg === 'dark'
                ? 'bg-slate-800 text-slate-100 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Film
          </button>
        </div>

        {/* Rendering Engine Switcher */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRenderMode('shadow')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              renderMode === 'shadow'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Native Shadow DOM renderer (High performance, zero sandbox blocking)"
          >
            Native View
          </button>
          <button
            type="button"
            onClick={() => setRenderMode('iframe')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              renderMode === 'iframe'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Isolated Iframe mode"
          >
            Frame View
          </button>
        </div>
      </div>

      {/* Switch to Notes Shortcut */}
      {onSwitchToNotes && (
        <button
          type="button"
          onClick={onSwitchToNotes}
          className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Report Notes ({noteCount || 0}) &rarr;</span>
        </button>
      )}
    </div>
  );
};

/* ========================================================================= */
/* SUB-COMPONENT: REPORT NOTES & ANNOTATIONS WORKSPACE */
/* ========================================================================= */
interface ReportNotesWorkspaceProps {
  reportNotes: CoachScoutingNote[];
  filteredNotes: CoachScoutingNote[];
  isAddingNote: boolean;
  setIsAddingNote: React.Dispatch<React.SetStateAction<boolean>>;
  noteTitle: string;
  setNoteTitle: React.Dispatch<React.SetStateAction<string>>;
  noteContent: string;
  setNoteContent: React.Dispatch<React.SetStateAction<string>>;
  noteCategory: string;
  setNoteCategory: React.Dispatch<React.SetStateAction<string>>;
  notePriority: 'High' | 'Important' | 'Normal';
  setNotePriority: React.Dispatch<React.SetStateAction<'High' | 'Important' | 'Normal'>>;
  noteDownDistance: string;
  setNoteDownDistance: React.Dispatch<React.SetStateAction<string>>;
  notesSearch: string;
  setNotesSearch: React.Dispatch<React.SetStateAction<string>>;
  notesCategoryFilter: string;
  setNotesCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  copiedNotes: boolean;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onCopyAllNotes: () => void;
  onAddKeyToVictory?: (text: string) => void;
  currentUserEmail?: string;
  isPowerAdmin?: boolean;
  isFullTab?: boolean;
}

const REPORT_NOTE_CATEGORIES = [
  'Opponent Tendency',
  'Defense vs Offense',
  'Offense vs Defense',
  'Red Zone & Goal Line',
  '3rd Down & Blitz Tells',
  'Key Player Matchup',
  'Special Teams',
  'Game Plan Priority',
];

const ReportNotesWorkspace: React.FC<ReportNotesWorkspaceProps> = ({
  reportNotes,
  filteredNotes,
  isAddingNote,
  setIsAddingNote,
  noteTitle,
  setNoteTitle,
  noteContent,
  setNoteContent,
  noteCategory,
  setNoteCategory,
  notePriority,
  setNotePriority,
  noteDownDistance,
  setNoteDownDistance,
  notesSearch,
  setNotesSearch,
  notesCategoryFilter,
  setNotesCategoryFilter,
  copiedNotes,
  onAddNote,
  onDeleteNote,
  onCopyAllNotes,
  onAddKeyToVictory,
  currentUserEmail,
  isPowerAdmin,
  isFullTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Header bar for Notes */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <div>
            <h4 className="font-black text-sm text-slate-100">
              Report Notes, Film Tells &amp; Observations
            </h4>
            <p className="text-[11px] text-slate-400">
              Log critical formation cues, blitz alarms, and counters linked to this opponent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {reportNotes.length > 0 && (
            <button
              type="button"
              onClick={onCopyAllNotes}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted notes to clipboard"
            >
              {copiedNotes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNote ? 'Cancel' : 'Add Note'}</span>
          </button>
        </div>
      </div>

      {/* Note Composer Drawer */}
      {isAddingNote && (
        <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Film Tell / Observation</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">By: {currentUserEmail}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400"
              >
                {REPORT_NOTE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={notePriority}
                onChange={(e) =>
                  setNotePriority(e.target.value as 'High' | 'Important' | 'Normal')
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="High">🚨 High Alert</option>
                <option value="Important">⭐ Important</option>
                <option value="Normal">Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Situation / Down &amp; Dist
              </label>
              <input
                type="text"
                value={noteDownDistance}
                onChange={(e) => setNoteDownDistance(e.target.value)}
                placeholder="e.g. 3rd & Short / Red Zone"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Note Headline
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Mike LB creeping into A-gap before snap"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Observation &amp; Tactical Counter
            </label>
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Detail the tell, formation trigger, and exactly how our offense/defense should react..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAddNote}
              disabled={!noteTitle.trim() || !noteContent.trim()}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      {reportNotes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={notesSearch}
              onChange={(e) => setNotesSearch(e.target.value)}
              placeholder="Search notes by tell, player, or keyword..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={notesCategoryFilter}
            onChange={(e) => setNotesCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Categories ({reportNotes.length})</option>
            {REPORT_NOTE_CATEGORIES.map((cat) => {
              const count = reportNotes.filter((n) => n.category === cat).length;
              if (count === 0) return null;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className={`grid gap-3 ${isFullTab ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredNotes.map((note) => {
            const isHigh = note.title.includes('🚨');
            return (
              <div
                key={note.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2.5 transition-all shadow-sm group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {note.category}
                    </span>
                    {isHigh && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {/* Promote to Keys to Victory */}
                    {onAddKeyToVictory && (
                      <button
                        type="button"
                        onClick={() => onAddKeyToVictory(note.title.replace(/🚨\s*/, ''))}
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Add this insight to master Keys to Victory"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}

                    {/* Delete Note */}
                    {isPowerAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-black text-sm text-slate-100 leading-snug">{note.title}</h5>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  <span className="flex items-center gap-1 font-mono">
                    <User className="w-3 h-3 text-slate-600" />
                    <span>{note.author || 'Staff'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>
                      {new Date(note.timestamp || note.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : reportNotes.length > 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
          No notes match current search or filter criteria.
        </div>
      ) : (
        <div className="py-8 text-center space-y-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80 p-4">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300">No notes added for this report yet.</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Log formation cues, blitz alarms, or down-and-distance tells discovered in film.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingNote(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
