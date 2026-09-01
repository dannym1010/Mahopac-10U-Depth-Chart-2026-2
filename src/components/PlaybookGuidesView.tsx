import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  Plus,
  Maximize,
  Upload,
  FileText,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
  Code,
  Eye,
  Check,
  Copy,
  Sparkles,
  FileCode,
  Globe,
} from 'lucide-react';
import { PlaybookGuideTree, PlaybookGuideOrder, UserRole } from '../types';

interface PlaybookGuidesViewProps {
  guideTree: PlaybookGuideTree;
  guideOrder: PlaybookGuideOrder;
  activeMain: string;
  activeSub: string;
  userRole: UserRole;
  onSelectMain: (main: string) => void;
  onSelectSub: (sub: string) => void;
  onUploadDocument: (main: string, sub: string, file: File) => void;
  onSaveHtmlContent: (main: string, sub: string, html: string) => void;
  onClearDocument: (main: string, sub: string) => void;
  onAddMainFolder: (name: string) => void;
  onAddSubTab: (main: string, name: string) => void;
  onRenameMainFolder: (oldName: string, newName: string) => void;
  onRenameSubTab: (main: string, oldName: string, newName: string) => void;
  onDeleteMainFolder: (name: string) => void;
  onDeleteSubTab: (main: string, name: string) => void;
  onMoveMainFolder: (name: string, direction: number) => void;
  onMoveSubTab: (main: string, name: string, direction: number) => void;
}

const HTML_STARTER_TEMPLATES = [
  {
    id: 'play_card',
    name: '🏈 Play Scheme & Assignment Card',
    description: 'Formatted play sheet with formation, diagram container, and player assignments',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .card { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 24px; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 24px; color: #facc15; }
    .badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
    .diagram-box { background: #022c22; border: 2px dashed #10b981; border-radius: 12px; height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 24px; text-align: center; color: #6ee7b7; position: relative; overflow: hidden; }
    .grid-lines { position: absolute; width: 100%; height: 100%; background-size: 20px 20px; background-image: linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px); }
    .diagram-title { z-index: 1; font-weight: 800; font-size: 16px; margin-bottom: 4px; }
    .diagram-sub { z-index: 1; font-size: 12px; color: #a7f3d0; }
    .assignments-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .assignments-table th { background: #0f172a; color: #94a3b8; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #334155; }
    .assignments-table td { padding: 12px 14px; border-bottom: 1px solid #334155; font-size: 13px; }
    .pos-tag { background: #334155; color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-family: monospace; }
    .notes-box { margin-top: 20px; background: #0f172a; border-left: 4px solid #facc15; padding: 14px; border-radius: 0 8px 8px 0; font-size: 13px; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>GUN TRIPS RIGHT - 62 SMASH</h1>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Personnel: 11 Personnel (1 RB, 1 TE, 3 WR)</div>
      </div>
      <span class="badge">Red Zone / Medium Pass</span>
    </div>

    <!-- Play Diagram Area -->
    <div class="diagram-box">
      <div class="grid-lines"></div>
      <div class="diagram-title">🏈 PLAY FIELD SCHEMATIC</div>
      <div class="diagram-sub">Read Progression: 1. Corner (Cornerback bite) &rarr; 2. Hitch (Underneath) &rarr; 3. Backside Dig</div>
    </div>

    <!-- Assignment Table -->
    <table class="assignments-table">
      <thead>
        <tr>
          <th style="width: 100px;">Position</th>
          <th style="width: 180px;">Alignment</th>
          <th>Assignment & Key Read</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="pos-tag">QB</span></td>
          <td>Gun (5 yds)</td>
          <td>3-step drop. Read boundary CB. If CB squats on hitch, throw corner route over top on rhythm.</td>
        </tr>
        <tr>
          <td><span class="pos-tag">X (WR1)</span></td>
          <td>Split Left (Numbers)</td>
          <td>12-yard Dig across hash. Settle in window between inside linebackers.</td>
        </tr>
        <tr>
          <td><span class="pos-tag">H (Slot)</span></td>
          <td>Inside Slot Right</td>
          <td>Corner route (10 yds stem, break at 45&deg; toward sideline pylon). High point the catch.</td>
        </tr>
        <tr>
          <td><span class="pos-tag">Z (WR2)</span></td>
          <td>Outside Slot Right</td>
          <td>5-yard Hitch. Sell vertical drive, plant outside foot, show numbers immediately to QB.</td>
        </tr>
        <tr>
          <td><span class="pos-tag">RB</span></td>
          <td>Weakside Offset</td>
          <td>Check-release to flat. Block weakside edge blitz first, otherwise release into open boundary.</td>
        </tr>
        <tr>
          <td><span class="pos-tag">OL</span></td>
          <td>Balanced Spacing</td>
          <td>Half-slide protection left. Center declares Mike LB. Firm interior pocket.</td>
        </tr>
      </tbody>
    </table>

    <div class="notes-box">
      <strong>Coaching Key:</strong> Against Cover 2, the Corner route is open behind the CB and under the safety. Against Cover 3, take the 5-yard hitch immediately.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'video_embed',
    name: '🎥 Video & HUDL Embed Frame',
    description: 'Responsive video container for HUDL cutups, YouTube film study, or online video',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #e2e8f0; margin: 0; padding: 24px; }
    .wrapper { max-width: 960px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 24px; }
    .title { font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 6px; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
    .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000; box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
    .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    .notes { margin-top: 20px; background: #0f172a; padding: 18px; border-radius: 12px; border: 1px solid #334155; }
    .notes h3 { margin-top: 0; font-size: 15px; color: #facc15; }
    .notes ul { margin: 8px 0 0 20px; padding: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="title">🎬 INSTALL FILM & CUTUP STUDY</div>
    <div class="meta">Paste your HUDL embed link, YouTube video ID, or video URL in the iframe below:</div>

    <div class="video-container">
      <!-- Replace the src URL below with your actual HUDL / YouTube embed link -->
      <iframe 
        src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" 
        title="Film Breakdown" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>

    <div class="notes">
      <h3>Key Film Teaching Points:</h3>
      <ul>
        <li><strong>0:15</strong> - Watch the safety rotation toward trips side at snap.</li>
        <li><strong>0:45</strong> - Slot receiver's stem depth creates 5 yards of separation against match coverage.</li>
        <li><strong>1:20</strong> - Backside offensive tackle hand placement during pass set.</li>
      </ul>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'wristband_insert',
    name: '📋 3-Column Wristband Grid Insert',
    description: 'Formatted sideline wristband sheet with color-coded play calls and wristband numbers',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Arial Black', Arial, sans-serif; background: #ffffff; color: #000000; margin: 0; padding: 16px; }
    .wristband-header { text-align: center; font-size: 18px; font-weight: 900; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .column { border: 2px solid #000; border-radius: 8px; overflow: hidden; }
    .col-title { background: #000; color: #fff; padding: 6px; text-align: center; font-size: 13px; font-weight: 900; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    td { padding: 4px 6px; border-bottom: 1px solid #ccc; }
    .num { width: 28px; font-weight: 900; background: #f0f0f0; text-align: center; border-right: 1px solid #000; }
    .play { font-weight: bold; }
    .tag-run { background: #e0f2fe; color: #0369a1; }
    .tag-pass { background: #fef3c7; color: #b45309; }
    .tag-screen { background: #dcfce7; color: #15803d; }
  </style>
</head>
<body>
  <div class="wristband-header">Sideline Wristband Play Insert - Card 1</div>
  <div class="grid-container">
    <!-- Column 1 -->
    <div class="column">
      <div class="col-title" style="background:#1e3a8a;">CARD 1: BASE RUNS</div>
      <table>
        <tr class="tag-run"><td class="num">1</td><td class="play">Gun Inside Zone Rt</td></tr>
        <tr class="tag-run"><td class="num">2</td><td class="play">Gun Outside Stretch Lt</td></tr>
        <tr class="tag-run"><td class="num">3</td><td class="play">Counter Tre Solid</td></tr>
        <tr class="tag-run"><td class="num">4</td><td class="play">Power G Weak</td></tr>
        <tr class="tag-run"><td class="num">5</td><td class="play">QB Draw Trap</td></tr>
        <tr class="tag-run"><td class="num">6</td><td class="play">Split Zone Slice</td></tr>
      </table>
    </div>

    <!-- Column 2 -->
    <div class="column">
      <div class="col-title" style="background:#991b1b;">CARD 2: QUICK PASS & RPO</div>
      <table>
        <tr class="tag-pass"><td class="num">7</td><td class="play">Trips Quick Slants</td></tr>
        <tr class="tag-pass"><td class="num">8</td><td class="play">Smash Out Concept</td></tr>
        <tr class="tag-pass"><td class="num">9</td><td class="play">Mesh Shallow Cross</td></tr>
        <tr class="tag-screen"><td class="num">10</td><td class="play">Tunnel Screen Right</td></tr>
        <tr class="tag-screen"><td class="num">11</td><td class="play">RB Middle Slip Screen</td></tr>
        <tr class="tag-pass"><td class="num">12</td><td class="play">Double Post Deep</td></tr>
      </table>
    </div>

    <!-- Column 3 -->
    <div class="column">
      <div class="col-title" style="background:#14532d;">CARD 3: SPECIALS & RED ZONE</div>
      <table>
        <tr class="tag-pass"><td class="num">13</td><td class="play">Philly Special Pass</td></tr>
        <tr class="tag-pass"><td class="num">14</td><td class="play">TE Pop Pass Seam</td></tr>
        <tr class="tag-run"><td class="num">15</td><td class="play">Heavy Goal-Line Wedge</td></tr>
        <tr class="tag-pass"><td class="num">16</td><td class="play">Fade / Out Red Zone</td></tr>
        <tr class="tag-run"><td class="num">17</td><td class="play">Jet Sweep Reverse</td></tr>
        <tr class="tag-run"><td class="num">18</td><td class="play">Victory Formation Knee</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'install_rules',
    name: '📊 Protection & Rule Assignments Table',
    description: 'Structured matrix for offensive line protections, blitz pick-ups, and route adjustments',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .box { background: #1e293b; border-radius: 14px; border: 1px solid #334155; padding: 20px; max-width: 900px; margin: 0 auto; }
    h2 { color: #38bdf8; margin-top: 0; font-size: 20px; border-bottom: 2px solid #334155; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    th { background: #0284c7; color: #fff; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #334155; }
    tr:nth-child(even) { background: rgba(255,255,255,0.02); }
    .badge-ol { background: #475569; color: #f8fafc; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🛡️ PASS PROTECTION RULES & BLITZ ALERTS</h2>
    <table>
      <thead>
        <tr>
          <th>Call</th>
          <th>Type</th>
          <th>OL Responsibility</th>
          <th>RB Responsibility</th>
          <th>Hot Route Answer</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>50 BASE</strong></td>
          <td>5-Man Slide</td>
          <td>Center slides to Call side; Tackles lock man-on-man</td>
          <td>Dual read Mike to Will LB</td>
          <td>Slot Sight Adjust Quick Out</td>
        </tr>
        <tr>
          <td><strong>60 BOB</strong></td>
          <td>Big On Big</td>
          <td>Guards and Tackles take 4 down linemen; Center on 0/1 Tech</td>
          <td>Check-release through A-gap</td>
          <td>RB checkdown in hook zone</td>
        </tr>
        <tr>
          <td><strong>MAX PROTECT</strong></td>
          <td>7-Man Heavy</td>
          <td>Full Slide strong; TE seals edge defensive end</td>
          <td>RB blocks weakside edge linebacker</td>
          <td>None (2-Man Deep route combination)</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`,
  },
  {
    id: 'blank_canvas',
    name: '✨ Blank Document / Custom HTML5',
    description: 'Clean boilerplate to write your own HTML, styles, tables, or embeds',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 24px;
      margin: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #1e293b;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #334155;
    }
    h1 { color: #facc15; margin-top: 0; }
    p { color: #cbd5e1; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Custom Playbook Section</h1>
    <p>Type or paste your HTML content, diagrams, or embed widgets here.</p>
  </div>
</body>
</html>`,
  },
];

export const PlaybookGuidesView: React.FC<PlaybookGuidesViewProps> = ({
  guideTree,
  guideOrder,
  activeMain,
  activeSub,
  userRole,
  onSelectMain,
  onSelectSub,
  onUploadDocument,
  onSaveHtmlContent,
  onClearDocument,
  onAddMainFolder,
  onAddSubTab,
  onRenameMainFolder,
  onRenameSubTab,
  onDeleteMainFolder,
  onDeleteSubTab,
  onMoveMainFolder,
  onMoveSubTab,
}) => {
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<'code' | 'preview'>('code');
  const [htmlEditorCode, setHtmlEditorCode] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const mainCategories =
    guideOrder.main && guideOrder.main.length > 0
      ? guideOrder.main
      : Object.keys(guideTree).length > 0
      ? Object.keys(guideTree)
      : ['Offense'];

  const currentSubTabs =
    (guideOrder.sub && guideOrder.sub[activeMain]) ||
    Object.keys(guideTree[activeMain] || {});

  const currentDocUrl = guideTree[activeMain]?.[activeSub] || '';

  const isHtml = (val: string): boolean => {
    if (!val) return false;
    const trimmed = val.trim();
    return (
      trimmed.startsWith('<') ||
      trimmed.includes('<html') ||
      trimmed.includes('<div') ||
      trimmed.includes('<style') ||
      trimmed.includes('<script') ||
      trimmed.includes('<svg') ||
      trimmed.includes('<table') ||
      trimmed.includes('<iframe') ||
      trimmed.includes('<!DOCTYPE') ||
      trimmed.startsWith('data:text/html')
    );
  };

  const isCurrentHtml = isHtml(currentDocUrl);

  const handleOpenHtmlEditor = () => {
    if (isCurrentHtml) {
      setHtmlEditorCode(currentDocUrl);
    } else {
      setHtmlEditorCode(HTML_STARTER_TEMPLATES[0].code);
    }
    setEditorTab('code');
    setIsHtmlEditorOpen(true);
  };

  const handleSaveHtmlEditor = () => {
    onSaveHtmlContent(activeMain, activeSub, htmlEditorCode);
    setIsHtmlEditorOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlEditorCode);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight flex items-center gap-2">
                <span>Playbooks &amp; Positional Install Guides</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Upload PDFs, write interactive HTML playbook sheets, organize folders, and embed video cutups
              </p>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsOrganizeModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>Organize Folders &amp; Tabs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const name = prompt('Enter New Playbook / Guide Category Name (e.g. Special Teams, 7v7 Tournament, Red Zone):');
                  if (name && name.trim()) onAddMainFolder(name.trim());
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Category Folder</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const name = prompt(`Enter Position or Sub-Tab Name for [${activeMain}] (e.g. Wide Receivers, Blitz Pickup):`);
                  if (name && name.trim()) onAddSubTab(activeMain, name.trim());
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Sub-Tab</span>
              </button>
            </div>
          )}
        </div>

        {/* Level 1: Main Category Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
          {mainCategories.map((mainCat) => {
            const isActive = mainCat === activeMain;
            return (
              <div key={mainCat} className="flex items-center group relative">
                <button
                  type="button"
                  onClick={() => {
                    onSelectMain(mainCat);
                    const firstSub =
                      guideOrder.sub[mainCat]?.[0] ||
                      Object.keys(guideTree[mainCat] || {})[0] ||
                      '';
                    if (firstSub) onSelectSub(firstSub);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all select-none border cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {mainCat}
                </button>
              </div>
            );
          })}
        </div>

        {/* Level 2: Sub-Tabs Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-slate-900/90 border border-slate-700 rounded-2xl no-scrollbar">
          {currentSubTabs.map((subTab) => {
            const isActive = subTab === activeSub;
            return (
              <button
                key={subTab}
                type="button"
                onClick={() => onSelectSub(subTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all select-none border cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                {subTab}
              </button>
            );
          })}
          {currentSubTabs.length === 0 && (
            <span className="text-xs text-slate-400 p-1">No sub-tabs found. Click &quot;+ Add Sub-Tab&quot; above to create one.</span>
          )}
        </div>
      </div>

      {/* Document Area */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
        {/* Document Action Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2.5 flex-wrap">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-black text-xs text-slate-200">
              Active Section: <span className="text-amber-300">{activeMain} &gt; {activeSub}</span>
            </span>

            {currentDocUrl ? (
              isCurrentHtml ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold border border-emerald-500/30">
                  <Code className="w-3 h-3" />
                  <span>HTML Code / Interactive</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 text-[10.5px] font-bold border border-sky-500/30">
                  <Globe className="w-3 h-3" />
                  <span>File / Cloud Document</span>
                </span>
              )
            ) : (
              <span className="text-[11px] text-slate-400">(Empty Section)</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {userRole === 'admin' && (
              <>
                {/* HTML Code Editor / Creator Button */}
                <button
                  type="button"
                  onClick={handleOpenHtmlEditor}
                  title="Write or paste custom HTML code, styled diagrams, or HUDL/video embeds"
                  className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-emerald-100 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
                >
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isCurrentHtml ? 'Edit HTML Code' : '+ Add HTML Code'}</span>
                </button>

                {/* Upload File Button */}
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors active:scale-95">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload PDF / HTML / Doc</span>
                  <input
                    type="file"
                    accept=".pdf,.html,.htm,.doc,.docx,.txt,.png,.jpg,.jpeg,.svg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUploadDocument(activeMain, activeSub, file);
                      e.target.value = '';
                    }}
                  />
                </label>

                {/* Clear Document Content */}
                {currentDocUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Clear / remove the uploaded document or HTML code from [${activeMain} > ${activeSub}]?`)) {
                        onClearDocument(activeMain, activeSub);
                      }
                    }}
                    title="Clear content from this sub-tab"
                    className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clear Document</span>
                  </button>
                )}

                {/* Delete Entire Sub-Tab */}
                {currentSubTabs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete sub-tab "${activeSub}" from [${activeMain}]?`)) {
                        onDeleteSubTab(activeMain, activeSub);
                      }
                    }}
                    title={`Delete sub-tab "${activeSub}"`}
                    className="p-2 hover:bg-rose-950/60 text-rose-400 hover:text-rose-200 border border-transparent hover:border-rose-800/50 rounded-xl cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {currentDocUrl && (
              <button
                type="button"
                onClick={() => setIsFullScreenModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Fullscreen View</span>
              </button>
            )}
          </div>
        </div>

        {/* Document Frame / Viewer */}
        <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl overflow-hidden min-h-[620px] flex flex-col">
          {currentDocUrl ? (
            isCurrentHtml ? (
              <iframe
                srcDoc={currentDocUrl}
                title={`${activeMain} - ${activeSub}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                className="w-full flex-1 min-h-[650px] border-0 bg-white"
              />
            ) : (
              <iframe
                src={currentDocUrl}
                title={`${activeMain} - ${activeSub}`}
                className="w-full flex-1 min-h-[650px] border-0 bg-white"
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-200">
                  No Document or HTML in [{activeMain} &gt; {activeSub}]
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload a PDF playbook, offensive install sheet, wristband card, or write / paste custom HTML code with interactive play diagrams and video embeds.
                </p>
              </div>

              {userRole === 'admin' && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenHtmlEditor}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Code className="w-4 h-4" />
                    <span>+ Create HTML Playbook</span>
                  </button>

                  <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload PDF / File</span>
                    <input
                      type="file"
                      accept=".pdf,.html,.htm,.doc,.docx,.txt,.png,.jpg,.jpeg,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadDocument(activeMain, activeSub, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HTML Code Editor & Starter Template Modal */}
      {isHtmlEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                    HTML Playbook &amp; Embed Editor
                  </h3>
                  <p className="text-xs text-slate-400">
                    Editing for section: <span className="text-amber-300 font-bold">{activeMain} &gt; {activeSub}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHtmlEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Selector Ribbon */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Starter HTML Templates:</span>
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {HTML_STARTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      if (
                        !htmlEditorCode ||
                        htmlEditorCode.trim() === '' ||
                        confirm(`Load "${tmpl.name}" template? This will replace current code in the editor.`)
                      ) {
                        setHtmlEditorCode(tmpl.code);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 whitespace-nowrap cursor-pointer transition-colors active:scale-95"
                    title={tmpl.description}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Switch Tabs (Editor / Live Preview) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorTab('code')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorTab === 'code'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>HTML Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorTab === 'preview'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor / Preview Body */}
            <div className="flex-1 min-h-[350px] max-h-[500px] overflow-hidden flex flex-col rounded-2xl border border-slate-800 bg-slate-950">
              {editorTab === 'code' ? (
                <textarea
                  value={htmlEditorCode}
                  onChange={(e) => setHtmlEditorCode(e.target.value)}
                  placeholder="Paste or write your HTML, CSS, SVG diagrams, table tags, or <iframe> embeds here..."
                  className="w-full h-full min-h-[350px] p-4 bg-slate-950 font-mono text-xs text-slate-200 border-0 focus:outline-none resize-none selection:bg-indigo-500 selection:text-white"
                  spellCheck={false}
                />
              ) : (
                <iframe
                  srcDoc={htmlEditorCode}
                  title="HTML Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  className="w-full h-full min-h-[350px] bg-white border-0"
                />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                {htmlEditorCode.length.toLocaleString()} characters
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHtmlEditorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHtmlEditor}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Publish HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Document Modal */}
      {isFullScreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-black text-sm md:text-base">
                {activeMain} &gt; {activeSub} - Fullscreen View
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullScreenModalOpen(false)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <div className="flex-1 bg-white rounded-2xl overflow-hidden mt-3 shadow-2xl">
            {isCurrentHtml ? (
              <iframe
                srcDoc={currentDocUrl}
                title="Fullscreen Playbook Guide"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                className="w-full h-full border-0"
              />
            ) : (
              <iframe
                src={currentDocUrl}
                title="Fullscreen Playbook Guide"
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      )}

      {/* Organize Tabs & Folders Modal */}
      {isOrganizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Organize Playbook Folders &amp; Tabs</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsOrganizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Main Folders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-[11px] text-indigo-300 uppercase tracking-wider">
                  1. Playbook &amp; Category Folders ({mainCategories.length}):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Enter new Category / Playbook Folder Name (e.g. Special Teams, Pass Concepts):');
                    if (name && name.trim()) onAddMainFolder(name.trim());
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 p-2 rounded-2xl bg-slate-950/80">
                {mainCategories.map((mainCat) => {
                  const subCount =
                    (guideOrder.sub && guideOrder.sub[mainCat]?.length) ||
                    Object.keys(guideTree[mainCat] || {}).length;
                  return (
                    <div
                      key={mainCat}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${
                        mainCat === activeMain
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        onClick={() => {
                          onSelectMain(mainCat);
                          const firstSub =
                            guideOrder.sub[mainCat]?.[0] ||
                            Object.keys(guideTree[mainCat] || {})[0] ||
                            '';
                          if (firstSub) onSelectSub(firstSub);
                        }}
                        className="cursor-pointer hover:underline truncate max-w-[200px]"
                        title={`Select ${mainCat}`}
                      >
                        {mainCat} <span className="text-[10px] text-slate-400 font-normal">({subCount} tabs)</span>
                        {mainCat === activeMain ? ' 👈 (Active)' : ''}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMoveMainFolder(mainCat, -1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveMainFolder(mainCat, 1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newName = prompt('Rename Category:', mainCat);
                            if (newName && newName.trim() && newName !== mainCat)
                              onRenameMainFolder(mainCat, newName.trim());
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Delete Category Folder "${mainCat}" and all its ${subCount} sub-tabs?`
                              )
                            ) {
                              onDeleteMainFolder(mainCat);
                            }
                          }}
                          className="p-1 hover:bg-rose-950/50 text-rose-400 rounded cursor-pointer"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Sub-Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-[11px] text-indigo-300 uppercase tracking-wider">
                  2. Sub-Tabs in [{activeMain}] ({currentSubTabs.length}):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt(`Enter new Sub-Tab for [${activeMain}] (e.g. Quarterbacks, Red Zone):`);
                    if (name && name.trim()) onAddSubTab(activeMain, name.trim());
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Sub-Tab
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 p-2 rounded-2xl bg-slate-950/80">
                {currentSubTabs.map((subTab) => {
                  const hasDoc = Boolean(guideTree[activeMain]?.[subTab]);
                  return (
                    <div
                      key={subTab}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${
                        subTab === activeSub
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        onClick={() => onSelectSub(subTab)}
                        className="truncate cursor-pointer hover:underline max-w-[200px]"
                      >
                        {subTab} {hasDoc ? '📄' : ''}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMoveSubTab(activeMain, subTab, -1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveSubTab(activeMain, subTab, 1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newName = prompt('Rename Sub-Tab:', subTab);
                            if (newName && newName.trim() && newName !== subTab)
                              onRenameSubTab(activeMain, subTab, newName.trim());
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete sub-tab "${subTab}" from [${activeMain}]?`))
                              onDeleteSubTab(activeMain, subTab);
                          }}
                          className="p-1 hover:bg-rose-950/50 text-rose-400 rounded cursor-pointer"
                          title="Delete Sub-Tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {currentSubTabs.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No sub-tabs found for [{activeMain}]. Click &quot;Add Sub-Tab&quot; above to add one.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOrganizeModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
