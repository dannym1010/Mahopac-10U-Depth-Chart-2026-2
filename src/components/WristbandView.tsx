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
  Search,
  Highlighter,
  Palette,
  Eye,
  Sliders,
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

type HighlightColorTheme = 'gold-blue' | 'neon-volt' | 'black-gold' | 'red-blue';

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
  const [colorTheme, setColorTheme] = useState<HighlightColorTheme>('gold-blue');
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  const title = wristbandData?.title || 'MAHOPAC 10U • PLAY CALLING INSERT';

  // Normalize column plays
  // Left Column (Yellow/Group A): index 0..15 -> numbers 1..16
  // Right Column (Blue/Group B): index 0..15 -> numbers 17..32
  const leftColPlays = wristbandData?.columns?.[0]?.plays || [];
  const rightColPlays = wristbandData?.columns?.[1]?.plays || [];

  // Fallback helper
  const getPlayText = (colIdx: number, rowIdx: number): string => {
    if (colIdx === 0) {
      return leftColPlays[rowIdx]?.text || '';
    } else {
      if (rightColPlays[rowIdx]?.text) return rightColPlays[rowIdx].text;
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
    lines.push('\n[LEFT COLUMN (1 - 16)]');
    for (let i = 0; i < 16; i++) {
      lines.push(`${i + 1}. ${getPlayText(0, i) || '—'}`);
    }
    lines.push('\n[RIGHT COLUMN (17 - 32)]');
    for (let i = 0; i < 16; i++) {
      lines.push(`${i + 17}. ${getPlayText(1, i) || '—'}`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper for color styles based on theme
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'neon-volt':
        return {
          leftHeaderBg: 'bg-lime-400 text-black',
          rightHeaderBg: 'bg-purple-600 text-white',
          leftHeaderText: '🟢 VOLT (1 - 16)',
          rightHeaderText: '🟣 PURPLE (17 - 32)',
          leftNumClass: 'bg-lime-400 text-black font-black',
          rightNumClass: 'bg-purple-600 text-white font-black',
          leftPrintNumClass: 'wristband-num-pill-neon-cyan',
          rightPrintNumClass: 'wristband-num-pill-blue',
          leftRowBg: 'bg-lime-50/40',
          rightRowBg: 'bg-purple-50/40',
        };
      case 'black-gold':
        return {
          leftHeaderBg: 'bg-black text-amber-300 border-r-[1.5px] border-amber-400',
          rightHeaderBg: 'bg-amber-400 text-black',
          leftHeaderText: '⬛ GOLD ON BLACK (1 - 16)',
          rightHeaderText: '🟨 BLACK ON GOLD (17 - 32)',
          leftNumClass: 'bg-black text-amber-300 font-black border-r border-amber-400',
          rightNumClass: 'bg-amber-400 text-black font-black',
          leftPrintNumClass: 'wristband-num-pill-black',
          rightPrintNumClass: 'wristband-num-pill-yellow',
          leftRowBg: 'bg-slate-100/70',
          rightRowBg: 'bg-amber-50/50',
        };
      case 'red-blue':
        return {
          leftHeaderBg: 'bg-red-600 text-white',
          rightHeaderBg: 'bg-blue-600 text-white',
          leftHeaderText: '🔴 RED (1 - 16)',
          rightHeaderText: '🔵 BLUE (17 - 32)',
          leftNumClass: 'bg-red-600 text-white font-black',
          rightNumClass: 'bg-blue-600 text-white font-black',
          leftPrintNumClass: 'wristband-num-pill-yellow',
          rightPrintNumClass: 'wristband-num-pill-blue',
          leftRowBg: 'bg-red-50/40',
          rightRowBg: 'bg-blue-50/40',
        };
      case 'gold-blue':
      default:
        return {
          leftHeaderBg: 'bg-amber-300 text-black',
          rightHeaderBg: 'bg-blue-600 text-white',
          leftHeaderText: '🟡 YELLOW (1 - 16)',
          rightHeaderText: '🔵 BLUE (17 - 32)',
          leftNumClass: 'bg-amber-300 text-black font-black',
          rightNumClass: 'bg-blue-600 text-white font-black',
          leftPrintNumClass: 'wristband-num-pill-yellow',
          rightPrintNumClass: 'wristband-num-pill-blue',
          leftRowBg: 'bg-amber-50/40',
          rightRowBg: 'bg-blue-50/40',
        };
    }
  };

  const theme = getThemeStyles();

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

      {/* Subheaders (Left & Right Highlight Columns) */}
      <div className="grid grid-cols-2 border-b-[1.5px] border-black text-center font-black text-[8.5px] print:text-[7.5pt] uppercase shrink-0">
        <div className={`${theme.leftHeaderBg} border-r-[1.5px] border-black py-0.5 tracking-wider flex items-center justify-center gap-1 font-black`}>
          <span>{theme.leftHeaderText}</span>
        </div>
        <div className={`${theme.rightHeaderBg} py-0.5 tracking-wider flex items-center justify-center gap-1 font-black`}>
          <span>{theme.rightHeaderText}</span>
        </div>
      </div>

      {/* 16 Side-by-Side Play Rows */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-black/80 bg-white">
        {Array.from({ length: TOTAL_ROWS }).map((_, rIdx) => {
          const leftNum = rIdx + 1;
          const rightNum = rIdx + 17;
          const leftPlay = getPlayText(0, rIdx);
          const rightPlay = getPlayText(1, rIdx);

          const isLeftSpotlight = highlightedNumber === leftNum;
          const isRightSpotlight = highlightedNumber === rightNum;

          const matchesLeftSearch =
            filterSearch.trim() !== '' &&
            (leftPlay.toLowerCase().includes(filterSearch.toLowerCase()) ||
              leftNum.toString() === filterSearch.trim());
          const matchesRightSearch =
            filterSearch.trim() !== '' &&
            (rightPlay.toLowerCase().includes(filterSearch.toLowerCase()) ||
              rightNum.toString() === filterSearch.trim());

          return (
            <div
              key={rIdx}
              className="grid grid-cols-2 flex-1 items-stretch divide-x divide-black min-h-0 leading-none"
            >
              {/* Left Spot (1 - 16) */}
              <div
                className={`flex items-center min-w-0 transition-colors ${
                  isLeftSpotlight || matchesLeftSearch
                    ? 'bg-amber-300/90 ring-2 ring-inset ring-amber-500 font-black'
                    : `${theme.leftRowBg} hover:bg-amber-100/70`
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropPlay(e, 0, rIdx)}
                onClick={() => setHighlightedNumber(highlightedNumber === leftNum ? null : leftNum)}
              >
                {/* Highlighted Number Pill (Left) */}
                <div
                  className={`w-5 print:w-[0.24in] ${theme.leftNumClass} ${theme.leftPrintNumClass} text-[8.5px] print:text-[7.5pt] text-center shrink-0 border-r border-black h-full flex items-center justify-center select-none font-mono cursor-pointer transition-transform ${
                    isLeftSpotlight ? 'scale-110 font-black underline bg-yellow-400' : ''
                  }`}
                  title={`Play #${leftNum} (Click to highlight/spotlight)`}
                >
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

              {/* Right Spot (17 - 32) */}
              <div
                className={`flex items-center min-w-0 transition-colors ${
                  isRightSpotlight || matchesRightSearch
                    ? 'bg-blue-300/90 ring-2 ring-inset ring-blue-600 font-black'
                    : `${theme.rightRowBg} hover:bg-blue-100/70`
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropPlay(e, 1, rIdx)}
                onClick={() => setHighlightedNumber(highlightedNumber === rightNum ? null : rightNum)}
              >
                {/* Highlighted Number Pill (Right) */}
                <div
                  className={`w-5 print:w-[0.24in] ${theme.rightNumClass} ${theme.rightPrintNumClass} text-[8.5px] print:text-[7.5pt] text-center shrink-0 border-r border-black h-full flex items-center justify-center select-none font-mono cursor-pointer transition-transform ${
                    isRightSpotlight ? 'scale-110 font-black underline bg-blue-700' : ''
                  }`}
                  title={`Play #${rightNum} (Click to highlight/spotlight)`}
                >
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
                  32 Highlighted Spots
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Exact standard 4.5&Prime; &times; 2.25&Prime; youth football wristband card &bull; Left (1-16) &bull; Right (17-32)
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

        {/* Sub-controls: Play Number Highlighting, Theme, Search & Zoom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60 text-xs">
          {/* Header Title Editor */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Insert Title Header
            </label>
            {userRole === 'admin' ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onUpdateTitle?.(e.target.value)}
                placeholder="MAHOPAC 10U • PLAY CALLING INSERT"
                className="w-full bg-slate-900 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
              />
            ) : (
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 font-bold text-amber-300 truncate">
                {title}
              </div>
            )}
          </div>

          {/* Play Number Highlight Theme */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Highlight Scheme</span>
            </label>
            <select
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value as HighlightColorTheme)}
              className="w-full bg-slate-900 text-slate-100 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="gold-blue">🟡 Yellow (1-16) &amp; 🔵 Blue (17-32) [Team Standard]</option>
              <option value="neon-volt">🟢 Neon Volt (1-16) &amp; 🟣 Purple (17-32)</option>
              <option value="black-gold">⬛ Black &amp; Gold Badges (Max Sunlight Contrast)</option>
              <option value="red-blue">🔴 Red (1-16) &amp; 🔵 Blue (17-32)</option>
            </select>
          </div>

          {/* Quick Find / Highlight Play */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Highlighter className="w-3 h-3 text-amber-400" />
              <span>Highlight Number / Search</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Type play # (e.g. 7) or name..."
                className="w-full bg-slate-900 text-slate-100 font-bold text-xs pl-7 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              {filterSearch && (
                <button
                  onClick={() => setFilterSearch('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* View Mode & Print Options */}
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setPrintMode(printMode === 'single' ? 'multi' : 'single')}
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-amber-300"
                title="Toggle Single Cutout vs 4-Copy Sheet"
              >
                {printMode === 'single' ? '📄 1 Cutout' : '📑 4-Up Multi'}
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setZoomScale(zoomScale === 'actual' ? 'comfortable' : 'actual')}
                className="px-2 py-1 text-[11px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                title="Toggle Zoom"
              >
                <ZoomIn className="w-3 h-3" />
                <span>{zoomScale === 'comfortable' ? 'Zoomed' : '100%'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Play Number Scrubber Bar (Spots 1 - 32) */}
        <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-1 text-[10px]">
          <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Highlighter className="w-3 h-3 text-amber-400" />
            <span>Spotlight #:</span>
          </span>
          {Array.from({ length: 32 }).map((_, i) => {
            const num = i + 1;
            const isLeft = num <= 16;
            const isSelected = highlightedNumber === num;
            return (
              <button
                key={num}
                onClick={() => setHighlightedNumber(isSelected ? null : num)}
                className={`w-5 h-5 rounded-md font-mono font-black text-[9.5px] transition-all flex items-center justify-center ${
                  isSelected
                    ? 'ring-2 ring-white scale-125 z-10 shadow-lg ' +
                      (isLeft ? 'bg-amber-400 text-black font-extrabold' : 'bg-blue-600 text-white font-extrabold')
                    : isLeft
                    ? 'bg-amber-400/20 hover:bg-amber-400/40 text-amber-300 border border-amber-400/30'
                    : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30'
                }`}
                title={`Spotlight Play #${num}`}
              >
                {num}
              </button>
            );
          })}
          {highlightedNumber && (
            <button
              onClick={() => setHighlightedNumber(null)}
              className="ml-2 text-rose-400 hover:text-rose-300 text-[10px] font-bold underline"
            >
              Clear Spotlight
            </button>
          )}
        </div>
      </div>

      {/* Screen Interactive Editor Canvas */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 md:p-8 flex flex-col items-center print:hidden">
        <div className="w-full flex items-center justify-between mb-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Interactive Wristband Preview (Highlighted numbers 1-32)</span>
          </div>
          <span className="font-mono text-slate-500">16 Spots Left &bull; 16 Spots Right</span>
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

        {/* Quick Tips & Spotlight Info */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800">
          <span className="flex items-center gap-1 text-amber-300">
            🟡 <strong>Left Column:</strong> Highlighted Spots #1 - #16
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="flex items-center gap-1 text-blue-400">
            🔵 <strong>Right Column:</strong> Highlighted Spots #17 - #32
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">
            💡 <em>Click any play number to spotlight it during sideline calls</em>
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
