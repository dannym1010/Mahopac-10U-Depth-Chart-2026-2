import React, { useState } from 'react';
import {
  Watch,
  Printer,
  Sparkles,
  RotateCcw,
  Scissors,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { WristbandData, UserRole } from '../types';

interface WristbandViewProps {
  wristbandData: WristbandData;
  userRole: UserRole;
  masterPlayLibrary?: string[];
  onUpdatePlay: (colIdx: number, rowIdx: number, text: string) => void;
  onUpdateTitle?: (title: string) => void;
  onClearPlays?: () => void;
  onBulkFillPlays?: (plays: string[]) => void;
}

export const WristbandView: React.FC<WristbandViewProps> = ({
  wristbandData,
  userRole,
  masterPlayLibrary = [],
  onUpdatePlay,
  onUpdateTitle,
  onClearPlays,
  onBulkFillPlays,
}) => {
  // Always 16 spots per column (32 total spots)
  const TOTAL_ROWS = 16;
  const [zoomScale, setZoomScale] = useState<'actual' | 'comfortable'>('comfortable');
  const [printMode, setPrintMode] = useState<'single' | 'multi'>('single');
  const [copied, setCopied] = useState(false);

  const title = wristbandData?.title || 'MAHOPAC 10U • PLAY CALLING INSERT';

  // Normalize column plays
  // Left Column (Yellow): index 0..15 -> numbers 1..16
  // Right Column (Blue): index 0..15 -> numbers 17..32
  const leftColPlays = wristbandData?.columns?.[0]?.plays || [];
  const rightColPlays = wristbandData?.columns?.[1]?.plays || [];

  // Fallback: If legacy single column had >16 items, split them
  const getPlayText = (colIdx: number, rowIdx: number): string => {
    if (colIdx === 0) {
      return leftColPlays[rowIdx]?.text || '';
    } else {
      if (rightColPlays[rowIdx]?.text) return rightColPlays[rowIdx].text;
      // check legacy overflow in col 0
      if (leftColPlays[rowIdx + 16]?.text) return leftColPlays[rowIdx + 16].text;
      return '';
    }
  };

  const handleDropPlay = (e: React.DragEvent, colIdx: number, rowIdx: number) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    const playText = e.dataTransfer.getData('text/plain');
    if (playText) {
      onUpdatePlay(colIdx, rowIdx, playText.trim());
    }
  };

  const handleAutoFill = () => {
    if (userRole !== 'admin') return;
    if (masterPlayLibrary.length === 0) {
      alert('Play library is currently empty. Add plays in the Master Play Library sidebar first.');
      return;
    }
    if (
      confirm(
        `Auto-fill the 32 wristband spots from your Master Play Library (${masterPlayLibrary.length} plays available)?`
      )
    ) {
      if (onBulkFillPlays) {
        onBulkFillPlays(masterPlayLibrary.slice(0, 32));
      } else {
        masterPlayLibrary.slice(0, 32).forEach((play, idx) => {
          if (idx < 16) {
            onUpdatePlay(0, idx, play);
          } else {
            onUpdatePlay(1, idx - 16, play);
          }
        });
      }
    }
  };

  const handleClearAll = () => {
    if (userRole !== 'admin') return;
    if (confirm('Clear all 32 wristband play spots?')) {
      if (onClearPlays) {
        onClearPlays();
      } else {
        for (let i = 0; i < 16; i++) {
          onUpdatePlay(0, i, '');
          onUpdatePlay(1, i, '');
        }
      }
    }
  };

  const handleCopyText = () => {
    const lines: string[] = [`=== ${title} (4.5" x 2.25") ===`];
    lines.push('\n[YELLOW (1 - 16)]');
    for (let i = 0; i < 16; i++) {
      lines.push(`${i + 1}. ${getPlayText(0, i) || '—'}`);
    }
    lines.push('\n[BLUE (17 - 32)]');
    for (let i = 0; i < 16; i++) {
      lines.push(`${i + 17}. ${getPlayText(1, i) || '—'}`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderSingleWristbandCard = (keyPrefix: string = 'card') => (
    <div
      key={keyPrefix}
      className="wristband-insert-print-box bg-white text-slate-900 border-2 border-black rounded-none shadow-md overflow-hidden flex flex-col select-none"
      style={{
        width: '4.5in',
        height: '2.25in',
        maxWidth: '4.5in',
        maxHeight: '2.25in',
        minWidth: '4.5in',
        minHeight: '2.25in',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner (0.22in) */}
      <div className="bg-black text-amber-300 font-black text-[9px] print:text-[8pt] text-center tracking-wider uppercase py-0.5 border-b-[1.5px] border-black flex items-center justify-between px-2 shrink-0 leading-tight">
        <span className="font-extrabold text-[8px] print:text-[7pt] text-slate-300">
          4.5" &times; 2.25"
        </span>
        <span className="truncate font-black">{title}</span>
        <span className="font-extrabold text-[8px] print:text-[7pt] text-amber-400">
          10U
        </span>
      </div>

      {/* Subheaders (Yellow & Blue Columns) (0.16in) */}
      <div className="grid grid-cols-2 border-b-[1.5px] border-black text-center font-black text-[8.5px] print:text-[7.5pt] uppercase shrink-0">
        <div className="bg-amber-300 text-black border-r-[1.5px] border-black py-0.5 tracking-wider flex items-center justify-center gap-1 font-black">
          <span>🟡 YELLOW (1 - 16)</span>
        </div>
        <div className="bg-blue-600 text-white py-0.5 tracking-wider flex items-center justify-center gap-1 font-black">
          <span>🔵 BLUE (17 - 32)</span>
        </div>
      </div>

      {/* 16 Side-by-Side Play Rows */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-black/80 bg-white">
        {Array.from({ length: TOTAL_ROWS }).map((_, rIdx) => {
          const leftNum = rIdx + 1;
          const rightNum = rIdx + 17;
          const leftPlay = getPlayText(0, rIdx);
          const rightPlay = getPlayText(1, rIdx);

          return (
            <div
              key={rIdx}
              className="grid grid-cols-2 flex-1 items-stretch divide-x divide-black min-h-0 leading-none"
            >
              {/* Left Spot (Yellow: 1 - 16) */}
              <div
                className="flex items-center min-w-0 bg-amber-50/40 hover:bg-amber-100/60 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropPlay(e, 0, rIdx)}
              >
                {/* Yellow Number Pill */}
                <div className="w-5 print:w-[0.24in] bg-amber-300 print:bg-[#fef08a] text-black font-black text-[8px] print:text-[7pt] text-center shrink-0 border-r border-black h-full flex items-center justify-center select-none font-mono">
                  {leftNum}
                </div>
                {/* Left Play Input / Print Text */}
                <div className="flex-1 px-1 min-w-0 flex items-center overflow-hidden">
                  <input
                    type="text"
                    value={leftPlay}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => onUpdatePlay(0, rIdx, e.target.value)}
                    placeholder={`Play #${leftNum}`}
                    className="w-full h-full text-[8.5px] font-black uppercase text-black bg-transparent focus:outline-none focus:bg-amber-200/50 print:hidden truncate leading-none placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal"
                  />
                  <span className="hidden print:inline-block font-black text-[7pt] uppercase text-black truncate leading-none">
                    {leftPlay || '—'}
                  </span>
                </div>
              </div>

              {/* Right Spot (Blue: 17 - 32) */}
              <div
                className="flex items-center min-w-0 bg-blue-50/40 hover:bg-blue-100/60 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropPlay(e, 1, rIdx)}
              >
                {/* Blue Number Pill */}
                <div className="w-5 print:w-[0.24in] bg-blue-600 print:bg-[#bfdbfe] text-white print:text-black font-black text-[8px] print:text-[7pt] text-center shrink-0 border-r border-black h-full flex items-center justify-center select-none font-mono">
                  {rightNum}
                </div>
                {/* Right Play Input / Print Text */}
                <div className="flex-1 px-1 min-w-0 flex items-center overflow-hidden">
                  <input
                    type="text"
                    value={rightPlay}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => onUpdatePlay(1, rIdx, e.target.value)}
                    placeholder={`Play #${rightNum}`}
                    className="w-full h-full text-[8.5px] font-black uppercase text-black bg-transparent focus:outline-none focus:bg-blue-200/50 print:hidden truncate leading-none placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal"
                  />
                  <span className="hidden print:inline-block font-black text-[7pt] uppercase text-black truncate leading-none">
                    {rightPlay || '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Toolbar */}
      <div className="bg-slate-800/95 backdrop-blur-md p-4 md:p-5 rounded-3xl border border-slate-700/80 shadow-xl print:hidden flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black shadow-inner">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                  Sideline Wristband Playbook Insert
                </h2>
                <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black rounded-lg">
                  4.5" &times; 2.25"
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black rounded-lg">
                  32 Spots (1-32)
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Exact standard 4.5&Prime; &times; 2.25&Prime; youth football wristband card &bull; Left (Yellow 1-16) &bull; Right (Blue 17-32)
              </p>
            </div>
          </div>

          {/* Quick Actions & Print */}
          <div className="flex items-center gap-2 flex-wrap">
            {userRole === 'admin' && (
              <>
                <button
                  onClick={handleAutoFill}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  title="Auto-fill from Master Play Library"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Fill Plays</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-rose-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  title="Clear all 32 spots"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear</span>
                </button>
              </>
            )}

            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              title="Copy wristband play text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-300" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-amber-500 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Print 4.5" &times; 2.25" Card</span>
            </button>
          </div>
        </div>

        {/* Sub-controls: Zoom, Title & Print Layout */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60 text-xs">
          {/* Title Editor */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-slate-400 font-bold whitespace-nowrap">Header Label:</span>
            {userRole === 'admin' ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onUpdateTitle?.(e.target.value)}
                placeholder="MAHOPAC 10U • PLAY CALLING INSERT"
                className="flex-1 bg-slate-900/90 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              />
            ) : (
              <span className="font-bold text-amber-300">{title}</span>
            )}
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-3">
            {/* Print Mode Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 px-1.5">Print Layout:</span>
              <button
                onClick={() => setPrintMode('single')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  printMode === 'single'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1 Insert (Cutout)
              </button>
              <button
                onClick={() => setPrintMode('multi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  printMode === 'multi'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Copies (Full Sheet)
              </button>
            </div>

            {/* Screen Zoom View Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setZoomScale('actual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  zoomScale === 'actual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Exact 100% 4.5in x 2.25in view"
              >
                <Maximize2 className="w-3 h-3" />
                <span>100% Size</span>
              </button>
              <button
                onClick={() => setZoomScale('comfortable')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  zoomScale === 'comfortable'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Comfortable zoomed view for desktop typing"
              >
                <ZoomIn className="w-3 h-3" />
                <span>Comfort Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Interactive Editor Canvas */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 md:p-8 flex flex-col items-center print:hidden">
        <div className="w-full flex items-center justify-between mb-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Interactive Wristband Preview (Drag plays from Play Library or type directly)</span>
          </div>
          <span className="font-mono text-slate-500">16 Spots Left (Yellow 1-16) &bull; 16 Spots Right (Blue 17-32)</span>
        </div>

        {/* Visual Wristband Container with Zoom wrapper */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-700 flex items-center justify-center overflow-auto max-w-full">
          <div
            style={{
              transform: zoomScale === 'comfortable' ? 'scale(1.35)' : 'scale(1)',
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              margin: zoomScale === 'comfortable' ? '2.5rem 1rem' : '1rem',
            }}
          >
            {/* Cut-guide dashed line */}
            <div className="p-2 border-2 border-dashed border-amber-400/50 rounded-xs bg-slate-900/50 shadow-2xl">
              <div className="flex items-center justify-between text-[9px] font-mono text-amber-300/80 mb-1 px-1">
                <span>&larr; 4.5 inches wide &rarr;</span>
                <span className="flex items-center gap-1">
                  <Scissors className="w-3 h-3" /> Cut line
                </span>
                <span>&uarr; 2.25 inches tall &darr;</span>
              </div>
              {renderSingleWristbandCard('screen-card')}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800">
          <span className="flex items-center gap-1 text-amber-300">
            🟡 <strong>Left Column:</strong> Spots #1 - #16 (Yellow Highlight)
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="flex items-center gap-1 text-blue-400">
            🔵 <strong>Right Column:</strong> Spots #17 - #32 (Blue Highlight)
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">
            💡 <em>Drag any play from Master Play Library directly onto a spot</em>
          </span>
        </div>
      </div>

      {/* PRINT ENGINE OUTPUT (Visible only in @media print) */}
      <div className="hidden print:block bg-white text-black p-0 m-0">
        {printMode === 'single' ? (
          /* Single Exact 4.5" x 2.25" Cutout Insert */
          <div className="wristband-print-container flex flex-col items-center justify-center pt-8">
            <div className="text-center text-[9pt] font-black uppercase mb-2 text-slate-700">
              Mahopac 10U &bull; Sideline Wristband Insert (Exact 4.5&Prime; &times; 2.25&Prime;)
            </div>

            {/* Cut Guide Dashed Container */}
            <div className="p-2 border-[1.5px] border-dashed border-black/80 inline-block bg-white">
              <div className="text-[7.5pt] font-mono text-slate-700 flex items-center justify-between mb-1 px-1">
                <span>✂️ CUT ALONG DASHED LINE</span>
                <span>4.5" Wide &times; 2.25" High</span>
              </div>
              {renderSingleWristbandCard('print-single')}
            </div>
          </div>
        ) : (
          /* 4-Up Multi-Sheet (4 Wristbands on 1 page for QB, Backup QB, RB, Coach) */
          <div className="wristband-print-container flex flex-col items-center justify-start pt-4">
            <div className="text-center text-[10pt] font-black uppercase mb-3 text-black">
              Mahopac 10U &bull; Sideline Wristband Play Sheet &bull; 4 Inserts (4.5&Prime; &times; 2.25&Prime;)
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((copyNum) => (
                <div
                  key={copyNum}
                  className="p-2 border-[1.5px] border-dashed border-black/80 inline-block bg-white"
                >
                  <div className="text-[7pt] font-mono text-slate-700 flex items-center justify-between mb-1 px-1">
                    <span>✂️ CUT INSERT #{copyNum}</span>
                    <span>4.5" &times; 2.25"</span>
                  </div>
                  {renderSingleWristbandCard(`print-multi-${copyNum}`)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
