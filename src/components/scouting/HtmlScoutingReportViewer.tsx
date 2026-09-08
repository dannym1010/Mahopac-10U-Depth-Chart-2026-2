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
  AlertTriangle,
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
} from 'lucide-react';
import { ScoutingAttachment, CoachScoutingNote } from '../../types';

interface HtmlScoutingReportViewerProps {
  attachments: ScoutingAttachment[];
  isPowerAdmin?: boolean;
  onUpdateAttachments: (updated: ScoutingAttachment[]) => void;
  opponentName: string;
  weekName: string;
  currentUserEmail?: string;
  onAddKeyToVictory?: (text: string) => void;
  onSyncToStaffNotes?: (note: CoachScoutingNote) => void;
}

export const RICH_SAMPLE_SCOUTING_HTML = (opponent: string, week: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-light: #3b82f6;
      --secondary: #d97706;
      --dark: #0f172a;
      --light: #f8fafc;
      --border: #cbd5e1;
      --alert-bg: #fef2f2;
      --alert-border: #ef4444;
      --success-bg: #ecfdf5;
      --success-border: #10b981;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      background: #f8fafc;
      line-height: 1.5;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #ffffff;
    }
    .header-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      font-size: 12px;
      color: #93c5fd;
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
    .badge-gold { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .card-title {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .callout {
      border-left: 4px solid var(--alert-border);
      background: var(--alert-bg);
      padding: 14px 16px;
      border-radius: 8px;
      margin: 16px 0;
      font-size: 13px;
      color: #991b1b;
    }
    .callout-title { font-weight: 800; margin-bottom: 4px; display: block; }

    .callout-success {
      border-left: 4px solid var(--success-border);
      background: var(--success-bg);
      color: #065f46;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 14px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 11px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:hover td { background: #f1f5f9; }

    .stat-pill {
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }
    .run-heavy { background: #dcfce7; color: #166534; }
    .pass-heavy { background: #e0e7ff; color: #3730a3; }

    .keys-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #334155;
    }
    .keys-list li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏈 ${opponent.toUpperCase()} &bull; FILM SCOUT &amp; TENDENCY REPORT</h1>
    <div class="header-meta">
      <span>Matchup: ${week} Prep</span>
      <span>&bull;</span>
      <span class="badge badge-gold">CATAPULT / HUDL DATA</span>
      <span class="badge badge-blue">OFFENSIVE &amp; DEFENSIVE MATRIX</span>
      <span class="badge badge-red">CONFIDENTIAL STAFF SCOUT</span>
    </div>
  </div>

  <div class="callout">
    <span class="callout-title">🚨 CRITICAL GAME ALERT: 3RD DOWN &amp; SHORT TELL</span>
    Opponent shifts to <strong>Heavy Pistol 20 Personnel</strong> on 3rd & short (under 3 yds). When TE aligns strong-side off the tackle, they run off-tackle power <strong>86% of the time</strong>. Fill the C-gap immediately.
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">
        <span>⚡ Offense: Down &amp; Distance Tendencies</span>
        <span class="badge badge-blue">142 SNAPS ANALYZED</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Primary Formation</th>
            <th>Run %</th>
            <th>Pass %</th>
            <th>Favored Concept</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1st &amp; 10</strong></td>
            <td>Shotgun 11 Pro</td>
            <td><span class="stat-pill run-heavy">58% Run</span></td>
            <td><span class="stat-pill pass-heavy">42% Pass</span></td>
            <td>Inside Zone Split / Bubble RPO</td>
          </tr>
          <tr>
            <td><strong>2nd &amp; Short (1-3)</strong></td>
            <td>Pistol 20 Heavy</td>
            <td><span class="stat-pill run-heavy">84% Run</span></td>
            <td><span class="stat-pill pass-heavy">16% Pass</span></td>
            <td>Power O / Guard Counter</td>
          </tr>
          <tr>
            <td><strong>2nd &amp; Long (7+)</strong></td>
            <td>Shotgun Trips 10</td>
            <td><span class="stat-pill run-heavy">22% Run</span></td>
            <td><span class="stat-pill pass-heavy">78% Pass</span></td>
            <td>Mesh Cross / Stick Route</td>
          </tr>
          <tr>
            <td><strong>3rd &amp; Long (6+)</strong></td>
            <td>Empty 00 Spread</td>
            <td><span class="stat-pill run-heavy">7% Run</span></td>
            <td><span class="stat-pill pass-heavy">93% Pass</span></td>
            <td>Sprint-out Right / Dagger Dig</td>
          </tr>
          <tr>
            <td><strong>Red Zone (&lt; 20)</strong></td>
            <td>I-Form Tight Twins</td>
            <td><span class="stat-pill run-heavy">71% Run</span></td>
            <td><span class="stat-pill pass-heavy">29% Pass</span></td>
            <td>Toss Sweep / PA Boot to TE</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">
        <span>🛡️ Defense: Fronts &amp; Blitz Packages</span>
        <span class="badge badge-blue">BASE: 4-4 STACK</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Down / Field Zone</th>
            <th>Front</th>
            <th>Secondary Shell</th>
            <th>Pressure Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Normal Down (1st / 2nd)</td>
            <td>4-4 Stack</td>
            <td>Cover 3 Sky (SS in box)</td>
            <td>18% Blitz (Mike LB A-Gap)</td>
          </tr>
          <tr>
            <td>Passing Downs (3rd &amp; 5+)</td>
            <td>3-3-5 Penny</td>
            <td>Cover 1 Man-Free</td>
            <td>64% Blitz (Overload Boundary)</td>
          </tr>
          <tr>
            <td>Red Zone (Inside 10)</td>
            <td>Goal Line 5-3</td>
            <td>Cover 0 Man (No Safety)</td>
            <td>85% Run Pinch</td>
          </tr>
        </tbody>
      </table>

      <div class="callout callout-success" style="margin-top: 14px;">
        <span class="callout-title">🎯 EXPLOITABLE WEAKNESS IN COVERAGE:</span>
        Their boundary corner gives an 8-yard cushion in Cover 3 on 1st down. Fast quick slants and outside hitches are open all day until they adjust.
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">
      <span>🔑 Game Plan Must-Wins vs. ${opponent}</span>
      <span class="badge badge-gold">STAFF FOCUS</span>
    </div>
    <ol class="keys-list">
      <li><strong>Win Edge Containment:</strong> #22 will bounce outside if C-gap is sealed. Defensive ends must keep outside shoulder free and set a firm anchor.</li>
      <li><strong>Reroute Slot Receiver in Mesh:</strong> Mike and Will linebackers must jam crossing routes at 4 yards to disrupt timing for their QB.</li>
      <li><strong>Protect the A-Gap on 3rd Down:</strong> Center and Guards must slide protect inside against their delayed double-A gap blitz package.</li>
      <li><strong>Capitalize on Soft Boundary Corner:</strong> Throw hitches and quick bubble screens early to force their secondary to press up.</li>
    </ol>
  </div>
</body>
</html>`;

export const HtmlScoutingReportViewer: React.FC<HtmlScoutingReportViewerProps> = ({
  attachments = [],
  isPowerAdmin = true,
  onUpdateAttachments,
  opponentName,
  weekName,
  currentUserEmail = 'Coach',
  onAddKeyToVictory,
  onSyncToStaffNotes,
}) => {
  // All HTML reports
  const htmlAttachments = useMemo(() => {
    return attachments.filter((a) => a.type === 'html');
  }, [attachments]);

  // Selected HTML report ID
  const [selectedReportId, setSelectedReportId] = useState<string>(() => {
    return htmlAttachments.length > 0 ? htmlAttachments[0].id : '';
  });

  // Keep selectedReportId updated if list changes
  useEffect(() => {
    if (htmlAttachments.length > 0) {
      const exists = htmlAttachments.some((a) => a.id === selectedReportId);
      if (!exists) {
        setSelectedReportId(htmlAttachments[0].id);
      }
    } else {
      setSelectedReportId('');
    }
  }, [htmlAttachments, selectedReportId]);

  const currentReport = useMemo(() => {
    return htmlAttachments.find((a) => a.id === selectedReportId) || htmlAttachments[0] || null;
  }, [htmlAttachments, selectedReportId]);

  // Primary Viewer Tab: 'viewer' (Report Viewer) | 'notes' (Report Notes & Annotations)
  const [activeTab, setActiveTab] = useState<'viewer' | 'notes'>('viewer');

  // Split-view mode: Show Viewer + Notes side-by-side
  const [isSplitView, setIsSplitView] = useState(false);

  // Fullscreen expanded mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom scale: 80% to 125%
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Iframe refresh key
  const [iframeKey, setIframeKey] = useState(0);

  // Background appearance for iframe canvas
  const [canvasBg, setCanvasBg] = useState<'paper' | 'dark' | 'slate'>('paper');

  // HTML Source Code Editor Modal
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [editCodeTitle, setEditCodeTitle] = useState('');
  const [editCodeHtml, setEditCodeHtml] = useState('');
  const [editorCopied, setEditorCopied] = useState(false);

  // Note-taking form state on the "notes" tab
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

  // Extract notes for currently selected report
  const reportNotes: CoachScoutingNote[] = useMemo(() => {
    if (!currentReport || !currentReport.notes) return [];
    return currentReport.notes;
  }, [currentReport]);

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

  // Handle Load Sample Hudl Report
  const handleLoadSampleReport = () => {
    const sampleHtml = RICH_SAMPLE_SCOUTING_HTML(opponentName || 'Upcoming Opponent', weekName || 'Week 1');
    const newReport: ScoutingAttachment = {
      id: `html_${Date.now()}_sample`,
      name: `${opponentName || 'Opponent'} Hudl Film Breakdown`,
      type: 'html',
      htmlCode: sampleHtml,
      fileSize: '14.2 KB',
      caption: `Interactive opponent film & tendency report for ${weekName}`,
      createdAt: Date.now(),
      notes: [
        {
          id: `note_${Date.now()}_1`,
          title: 'Exploit Soft Cushion on Boundary Corner',
          category: 'Offense vs Defense',
          content: 'Boundary CB is giving an 8-yard cushion in Cover 3 on 1st down. Run quick hitches, outs, and RPO bubble screens until they bring safeties down.',
          author: currentUserEmail || 'Coach',
          authorRole: 'Offensive Staff',
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
        {
          id: `note_${Date.now()}_2`,
          title: '3rd & Short: Alert Heavy Pistol Run',
          category: 'Defense vs Offense',
          content: '84% run rate in Pistol 20. When TE is off-tackle, force them back into inside traffic with edge anchor.',
          author: currentUserEmail || 'Coach',
          authorRole: 'Defensive Staff',
          timestamp: Date.now() - 3600000,
          createdAt: Date.now() - 3600000,
        },
      ],
    };

    const updated = [newReport, ...attachments];
    onUpdateAttachments(updated);
    setSelectedReportId(newReport.id);
  };

  // Upload custom .html file
  const handleUploadHtmlFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const newReport: ScoutingAttachment = {
        id: `html_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name.replace(/\.html?$/i, ''),
        type: 'html',
        htmlCode: text,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        caption: `Uploaded HTML scouting report: ${file.name}`,
        createdAt: Date.now(),
        notes: [],
      };

      const updated = [newReport, ...attachments];
      onUpdateAttachments(updated);
      setSelectedReportId(newReport.id);
    } catch (err) {
      console.error('Failed to read HTML file:', err);
    }
    e.target.value = '';
  };

  // Open HTML code editor for editing or new report
  const handleOpenCodeEditor = (report?: ScoutingAttachment) => {
    if (report) {
      setEditCodeTitle(report.name);
      setEditCodeHtml(report.htmlCode || '');
    } else {
      setEditCodeTitle(`${opponentName || 'Opponent'} New HTML Report`);
      setEditCodeHtml(RICH_SAMPLE_SCOUTING_HTML(opponentName || 'Opponent', weekName || 'Week 1'));
    }
    setIsCodeEditorOpen(true);
  };

  // Save changes from code editor
  const handleSaveCodeEditor = () => {
    if (!editCodeHtml.trim()) return;

    if (currentReport && isCodeEditorOpen) {
      // Update existing report
      const updated = attachments.map((a) => {
        if (a.id === currentReport.id) {
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
      // Create new report
      const newReport: ScoutingAttachment = {
        id: `html_${Date.now()}_new`,
        name: editCodeTitle.trim() || `${opponentName} Scouting Code Report`,
        type: 'html',
        htmlCode: editCodeHtml,
        fileSize: `${(new Blob([editCodeHtml]).size / 1024).toFixed(1)} KB`,
        caption: `Custom HTML scouting report for ${weekName}`,
        createdAt: Date.now(),
        notes: [],
      };
      onUpdateAttachments([newReport, ...attachments]);
      setSelectedReportId(newReport.id);
    }

    setIsCodeEditorOpen(false);
  };

  // Delete current HTML report
  const handleDeleteCurrentReport = () => {
    if (!currentReport) return;
    const ok = window.confirm(`Delete HTML report "${currentReport.name}"?`);
    if (!ok) return;

    const updated = attachments.filter((a) => a.id !== currentReport.id);
    onUpdateAttachments(updated);
  };

  // Open HTML in new browser window
  const handleOpenInNewTab = () => {
    if (!currentReport?.htmlCode) return;
    const blob = new Blob([currentReport.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Download HTML file
  const handleDownloadHtml = () => {
    if (!currentReport?.htmlCode) return;
    const blob = new Blob([currentReport.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(currentReport.name || 'scouting-report').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print HTML Report directly
  const handlePrintReport = () => {
    if (!currentReport?.htmlCode) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(currentReport.htmlCode);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  };

  // Add new note to current HTML report
  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim() || !currentReport) return;

    const newNote: CoachScoutingNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `${notePriority === 'High' ? '🚨 ' : ''}${noteTitle.trim()}${noteDownDistance ? ` [${noteDownDistance}]` : ''}`,
      category: noteCategory,
      content: noteContent.trim(),
      author: currentUserEmail || 'Coach',
      authorRole: 'Scouting Staff',
      timestamp: Date.now(),
      createdAt: Date.now(),
    };

    // Update current attachment's notes
    const updated = attachments.map((a) => {
      if (a.id === currentReport.id) {
        return {
          ...a,
          notes: [newNote, ...(a.notes || [])],
        };
      }
      return a;
    });

    onUpdateAttachments(updated);

    // Optionally sync to staff notes
    if (onSyncToStaffNotes) {
      onSyncToStaffNotes(newNote);
    }

    // Reset form
    setNoteTitle('');
    setNoteContent('');
    setNoteDownDistance('');
    setIsAddingNote(false);
  };

  // Delete note from report
  const handleDeleteNote = (noteId: string) => {
    if (!currentReport) return;
    const updated = attachments.map((a) => {
      if (a.id === currentReport.id) {
        return {
          ...a,
          notes: (a.notes || []).filter((n) => n.id !== noteId),
        };
      }
      return a;
    });
    onUpdateAttachments(updated);
  };

  // Copy all notes to clipboard
  const handleCopyAllNotes = () => {
    if (reportNotes.length === 0) return;
    const text =
      `📋 REPORT NOTES: ${currentReport?.name || 'Scouting Report'}\n` +
      `🏈 Opponent: ${opponentName} (${weekName})\n\n` +
      reportNotes
        .map(
          (n, idx) =>
            `${idx + 1}. [${n.category.toUpperCase()}] ${n.title}\n   ${n.content}\n   — By: ${n.author || 'Staff'} (${new Date(n.timestamp || Date.now()).toLocaleDateString()})`
        )
        .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div
      className={`bg-slate-850/95 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-3 z-50 flex flex-col bg-slate-900 border-indigo-500/80 shadow-2xl' : 'relative'
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

      {/* Top Main Command Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Branding & Report Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
            <FileCode className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Primary Film Scout
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {opponentName ? `${opponentName} &bull; ` : ''}{weekName}
              </span>
            </div>

            {/* Title / Report Dropdown */}
            {htmlAttachments.length > 1 ? (
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={currentReport?.id || ''}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 font-black text-sm sm:text-base rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {htmlAttachments.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} {rep.fileSize ? `(${rep.fileSize})` : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  ({htmlAttachments.length} Reports)
                </span>
              </div>
            ) : currentReport ? (
              <h3 className="font-black text-sm sm:text-base text-slate-100 truncate mt-0.5">
                {currentReport.name}
              </h3>
            ) : (
              <h3 className="font-black text-sm sm:text-base text-slate-200 mt-0.5">
                Interactive HTML Scouting Report Viewer
              </h3>
            )}
          </div>
        </div>

        {/* Center: Primary View Tabs (Viewer vs Notes Tab) */}
        {currentReport && (
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
              <span>Report Viewer</span>
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
                    activeTab === 'notes' ? 'bg-black/30 text-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {reportNotes.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {currentReport ? (
            <>
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

              {/* Edit Source Code (Power Admin) */}
              {isPowerAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenCodeEditor(currentReport)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Edit HTML source code or update stats"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Edit Source</span>
                </button>
              )}

              {/* Open in New Tab */}
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title="Open in full browser window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrintReport}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title="Print report"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title="Download .html file"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen((f) => !f)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Delete */}
              {isPowerAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentReport}
                  className="p-2 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700/60 rounded-xl transition-all cursor-pointer"
                  title="Delete this HTML report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLoadSampleReport}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>⚡ Load Sample Hudl Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCodeEditor()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <Code className="w-4 h-4" />
                <span>Paste HTML</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {currentReport ? (
        <div className={`flex-1 ${isFullscreen ? 'h-full overflow-hidden' : ''}`}>
          {/* Split Mode on Desktop */}
          {isSplitView ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[640px] border-b border-slate-800">
              {/* Left Column: Report Viewer (7 cols) */}
              <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950">
                <ReportViewerControls
                  zoomScale={zoomScale}
                  setZoomScale={setZoomScale}
                  canvasBg={canvasBg}
                  setCanvasBg={setCanvasBg}
                  onRefresh={() => setIframeKey((k) => k + 1)}
                />
                <ReportIframe
                  htmlCode={currentReport.htmlCode || ''}
                  title={currentReport.name}
                  zoomScale={zoomScale}
                  canvasBg={canvasBg}
                  iframeKey={iframeKey}
                  isFullscreen={isFullscreen}
                />
              </div>

              {/* Right Column: Report Notes & Annotations (5 cols) */}
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
            /* Tab 1: Full-Width Report Viewer */
            <div className="flex flex-col bg-slate-950">
              <ReportViewerControls
                zoomScale={zoomScale}
                setZoomScale={setZoomScale}
                canvasBg={canvasBg}
                setCanvasBg={setCanvasBg}
                onRefresh={() => setIframeKey((k) => k + 1)}
                noteCount={reportNotes.length}
                onSwitchToNotes={() => setActiveTab('notes')}
              />
              <ReportIframe
                htmlCode={currentReport.htmlCode || ''}
                title={currentReport.name}
                zoomScale={zoomScale}
                canvasBg={canvasBg}
                iframeKey={iframeKey}
                isFullscreen={isFullscreen}
              />
            </div>
          ) : (
            /* Tab 2: Full-Width Report Notes & Annotations Workspace */
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

          {/* Sub-Footer Meta Bar */}
          <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ready for staff review &bull; Saved to {weekName}</span>
              </span>
              {currentReport.fileSize && (
                <span className="font-mono text-[11px] text-slate-500">
                  Size: {currentReport.fileSize}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => htmlFileInputRef.current?.click()}
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Another .html</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => handleOpenCodeEditor()}
                className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New HTML Report</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Prompt to create or load */
        <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-900/60">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Code className="w-8 h-8 text-amber-400" />
          </div>

          <div className="max-w-md space-y-1">
            <h4 className="text-base font-black text-slate-100">
              No HTML Scouting Report Added Yet
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Import opponent tendencies, Catapult/Hudl HTML exports, or generate our rich sample opponent breakdown to review formations, run/pass tendencies, and take annotated notes.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
            <button
              type="button"
              onClick={handleLoadSampleReport}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ Load Sample Hudl Tendency Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCodeEditor()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Paste Custom HTML Code</span>
            </button>

            <button
              type="button"
              onClick={() => htmlFileInputRef.current?.click()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Upload .html File</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HTML SOURCE CODE EDITOR */}
      {/* ========================================================================= */}
      {isCodeEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">
                    HTML Scouting Report Source Editor
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Paste export code from Hudl, Catapult, or custom HTML game breakdown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(editCodeHtml);
                    setEditorCopied(true);
                    setTimeout(() => setEditorCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {editorCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{editorCopied ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCodeEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={editCodeTitle}
                  onChange={(e) => setEditCodeTitle(e.target.value)}
                  placeholder="e.g. Opponent Tendencies & Film Scout"
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
                    onClick={() => setEditCodeHtml(RICH_SAMPLE_SCOUTING_HTML(opponentName || 'Opponent', weekName || 'Week 1'))}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Insert Rich Sample Template</span>
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

            {/* Footer */}
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
/* SUB-COMPONENT: REPORT VIEWER CONTROLS */
/* ========================================================================= */
interface ReportViewerControlsProps {
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  canvasBg: 'paper' | 'dark' | 'slate';
  setCanvasBg: React.Dispatch<React.SetStateAction<'paper' | 'dark' | 'slate'>>;
  onRefresh: () => void;
  noteCount?: number;
  onSwitchToNotes?: () => void;
}

const ReportViewerControls: React.FC<ReportViewerControlsProps> = ({
  zoomScale,
  setZoomScale,
  canvasBg,
  setCanvasBg,
  onRefresh,
  noteCount,
  onSwitchToNotes,
}) => {
  return (
    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-slate-950 rounded-xl p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => setZoomScale((z) => Math.max(70, z - 10))}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] font-bold text-slate-300 px-1.5">
          {zoomScale}%
        </span>
        <button
          type="button"
          onClick={() => setZoomScale((z) => Math.min(150, z + 10))}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        {zoomScale !== 100 && (
          <button
            type="button"
            onClick={() => setZoomScale(100)}
            className="text-[10px] text-indigo-400 hover:underline px-1 font-bold cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Canvas Paper Contrast */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-black text-slate-500 hidden sm:inline">
          Frame:
        </span>
        <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setCanvasBg('paper')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              canvasBg === 'paper' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clean Paper
          </button>
          <button
            type="button"
            onClick={() => setCanvasBg('dark')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              canvasBg === 'dark' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Film
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer border border-slate-800"
          title="Refresh iframe content"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
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
/* SUB-COMPONENT: REPORT IFRAME CONTAINER */
/* ========================================================================= */
interface ReportIframeProps {
  htmlCode: string;
  title: string;
  zoomScale: number;
  canvasBg: 'paper' | 'dark' | 'slate';
  iframeKey: number;
  isFullscreen?: boolean;
}

const ReportIframe: React.FC<ReportIframeProps> = ({
  htmlCode,
  title,
  zoomScale,
  canvasBg,
  iframeKey,
  isFullscreen,
}) => {
  const bgClass =
    canvasBg === 'paper' ? 'bg-white' : canvasBg === 'dark' ? 'bg-slate-950' : 'bg-slate-900';

  return (
    <div
      className={`w-full overflow-auto flex items-start justify-center p-2 sm:p-4 ${bgClass} ${
        isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[620px]'
      }`}
    >
      <div
        style={{
          width: `${zoomScale}%`,
          maxWidth: zoomScale > 100 ? `${zoomScale}%` : '100%',
          height: '100%',
          transition: 'width 0.15s ease-out',
        }}
        className="h-full rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 bg-white"
      >
        <iframe
          key={iframeKey}
          srcDoc={htmlCode}
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-modals"
          className="w-full h-full border-none block"
        />
      </div>
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
  onDeleteNote: (noteId: string) => void;
  onCopyAllNotes: () => void;
  onAddKeyToVictory?: (text: string) => void;
  currentUserEmail?: string;
  isPowerAdmin?: boolean;
  isFullTab?: boolean;
}

const NOTE_CATEGORIES = [
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
      {/* Header Bar with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h4 className="font-black text-sm text-slate-100">
              Scouting Report Notes &amp; Coach Observations
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
              {reportNotes.length} Saved
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Record specific film cues, down-and-distance tells, and game plan priorities from this report
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {reportNotes.length > 0 && (
            <button
              type="button"
              onClick={onCopyAllNotes}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Copy formatted notes for coaching staff"
            >
              {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotes ? 'Copied All' : 'Copy Notes'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddingNote((v) => !v)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingNote ? 'Close Form' : 'Add Note'}</span>
          </button>
        </div>
      </div>

      {/* Note Composer Card */}
      {isAddingNote && (
        <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Record New Report Observation</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              By: {currentUserEmail || 'Staff'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Note Headline / Tell Summary
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. 3rd & Short Heavy Pistol Tell / Soft Corner Cushion"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {NOTE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Priority Level
              </label>
              <div className="flex items-center gap-2">
                {(['High', 'Important', 'Normal'] as const).map((pri) => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => setNotePriority(pri)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      notePriority === pri
                        ? pri === 'High'
                          ? 'bg-rose-600 text-white'
                          : pri === 'Important'
                          ? 'bg-amber-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {pri === 'High' ? '🚨 Red Alert' : pri === 'Important' ? '⭐ Important' : 'Standard'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Down &amp; Distance / Situation (Optional)
              </label>
              <input
                type="text"
                value={noteDownDistance}
                onChange={(e) => setNoteDownDistance(e.target.value)}
                placeholder="e.g. 1st & 10, 3rd & 2-4, Red Zone"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Observation Details &amp; Game Plan Counter
            </label>
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="What does film show? What is our coaching response? e.g. Pinch defensive tackle inside, shift linebackers boundary..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAddNote}
              disabled={!noteTitle.trim() || !noteContent.trim()}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Note to Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      {reportNotes.length > 2 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={notesSearch}
              onChange={(e) => setNotesSearch(e.target.value)}
              placeholder="Search notes, personnel, or blitz cues..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={notesCategoryFilter}
            onChange={(e) => setNotesCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Categories ({reportNotes.length})</option>
            {NOTE_CATEGORIES.map((cat) => {
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

      {/* Notes List Cards */}
      {filteredNotes.length > 0 ? (
        <div className={`space-y-2.5 ${isFullTab ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
          {filteredNotes.map((note) => {
            const isHighAlert = note.title.includes('🚨') || note.title.toLowerCase().includes('alert');

            return (
              <div
                key={note.id}
                className={`bg-slate-950/80 border rounded-2xl p-3.5 transition-all shadow-md group ${
                  isHighAlert
                    ? 'border-rose-500/40 hover:border-rose-400/80'
                    : 'border-slate-800 hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[9px] font-black uppercase">
                        {note.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(note.timestamp || Date.now()).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h5 className="font-black text-xs text-slate-100 leading-snug">
                      {note.title}
                    </h5>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                    {onAddKeyToVictory && (
                      <button
                        type="button"
                        onClick={() => onAddKeyToVictory(note.title.replace(/^🚨\s*/, ''))}
                        className="p-1 text-slate-500 hover:text-amber-300 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Add to Game Keys to Victory"
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isPowerAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  {note.content}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Logged by: {note.author || 'Staff'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${note.title}\n${note.content}`);
                    }}
                    className="text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : reportNotes.length > 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
          No notes match current filter criteria.
        </div>
      ) : (
        <div className="py-8 text-center space-y-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80 p-4">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300">
            No notes added for this report yet.
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Click &ldquo;Add Note&rdquo; above to log defensive front cues, offensive tells, or down-and-distance tendencies.
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
