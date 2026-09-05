import React, { useState, useMemo, useRef } from 'react';
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
  Plus,
  Trash2,
  Edit3,
  Layers,
  BookOpen,
  ArrowRight,
  Hash,
  Type,
  ChevronDown,
  ChevronRight,
  Tag,
  Share2,
  RefreshCw,
  FolderSync,
  AlertTriangle,
} from 'lucide-react';
import { SingleWristband, WristbandColumn, WristbandData, WristbandPlay, UserRole } from '../types';
import { PlayDatabaseEntry } from '../types/callSheet';
import { deepClone, safeJSONStringify } from '../services/storageService';
import { triggerPrint } from '../utils/printUtils';
import { extractPersonnel, getPersonnelSubTabs } from '../utils/wristbandLinking';
import {
  DEFAULT_WRISTBAND_1,
  DEFAULT_WRISTBAND_2,
  INITIAL_TWO_WRISTBANDS_DATA,
  USER_IMPORTED_GAME_DAY_PLAYS,
} from '../data/userGameDayPlays';

interface WristbandViewProps {
  wristbandData?: WristbandData;
  userRole: UserRole;
  masterPlayLibrary?: string[];
  playDatabase?: PlayDatabaseEntry[];
  onUpdatePlayDatabase?: (plays: PlayDatabaseEntry[]) => void;
  onUpdateWristbandData?: (data: WristbandData) => void;
  // Legacy props
  onUpdatePlay?: (colIdx: number, rowIdx: number, text: string) => void;
  onUpdateTitle?: (title: string) => void;
  onClearPlays?: () => void;
  onBulkFillPlays?: (plays: string[]) => void;
}

export const HIGHLIGHT_PALETTE = [
  { name: 'Yellow / Gold', bg: '#facc15', text: '#000000', tint: '#fef08a' },
  { name: 'Electric Volt / Lime', bg: '#a3e635', text: '#000000', tint: '#ecfccb' },
  { name: 'Royal Blue', bg: '#3b82f6', text: '#ffffff', tint: '#dbeafe' },
  { name: 'Crimson Red', bg: '#ef4444', text: '#ffffff', tint: '#fee2e2' },
  { name: 'Emerald Green', bg: '#10b981', text: '#ffffff', tint: '#d1fae5' },
  { name: 'Royal Purple', bg: '#a855f7', text: '#ffffff', tint: '#f3e8ff' },
  { name: 'Sunset Orange', bg: '#f97316', text: '#ffffff', tint: '#ffedd5' },
  { name: 'Sky Cyan', bg: '#06b6d4', text: '#ffffff', tint: '#cffafe' },
  { name: 'Dark Slate', bg: '#334155', text: '#ffffff', tint: '#f1f5f9' },
  { name: 'Hot Pink', bg: '#ec4899', text: '#ffffff', tint: '#fce7f3' },
];

export const WristbandView: React.FC<WristbandViewProps> = ({
  wristbandData: propWristbandData,
  userRole,
  masterPlayLibrary = [],
  playDatabase = USER_IMPORTED_GAME_DAY_PLAYS,
  onUpdatePlayDatabase,
  onUpdateWristbandData,
  onUpdatePlay,
  onUpdateTitle,
  onClearPlays,
  onBulkFillPlays,
}) => {
  // Normalize wristband data
  const normalizedData: WristbandData = useMemo(() => {
    if (propWristbandData?.wristbands && propWristbandData.wristbands.length > 0) {
      return propWristbandData;
    }
    // Convert legacy format if present
    if (propWristbandData?.columns && propWristbandData.columns.length > 0) {
      const legacyWb: SingleWristband = {
        id: 'wb_legacy',
        title: propWristbandData.title || 'MAHOPAC 10U • PLAY CALLING INSERT',
        subtitle: 'WRISTBAND 1',
        labelingMode: 'same_per_card',
        rowsCount: propWristbandData.rows || 16,
        columns: propWristbandData.columns,
      };
      return {
        ...propWristbandData,
        wristbands: [legacyWb],
        activeWristbandId: 'wb_legacy',
      };
    }
    // Default initial 2 wristbands with imported plays
    return INITIAL_TWO_WRISTBANDS_DATA;
  }, [propWristbandData]);

  // Local state
  const wristbands = normalizedData.wristbands || [DEFAULT_WRISTBAND_1, DEFAULT_WRISTBAND_2];
  const activeWbId = normalizedData.activeWristbandId || wristbands[0]?.id || 'wb_1';

  const [activeWristbandId, setActiveWristbandId] = useState<string>(activeWbId);
  const [zoomScale, setZoomScale] = useState<'actual' | 'comfortable'>('comfortable');
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');
  const [copied, setCopied] = useState(false);
  const [viewAllSideBySide, setViewAllSideBySide] = useState(false);

  // Play Bank Sidebar state
  const [isPlayBankOpen, setIsPlayBankOpen] = useState(false);
  const [playBankFilterUnit, setPlayBankFilterUnit] = useState<'all' | 'offense' | 'defense'>('offense');
  const [playBankSearch, setPlayBankSearch] = useState('');
  const [playBankPersonnelFilter, setPlayBankPersonnelFilter] = useState<string>('all');

  // Deletion state
  const [confirmDeleteWbId, setConfirmDeleteWbId] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Selected cell for editing & autocomplete
  const [selectedCell, setSelectedCell] = useState<{ wbId: string; colIdx: number; rowIdx: number } | null>(null);
  const [cellSearchQuery, setCellSearchQuery] = useState('');

  // Current active wristband
  const currentWristband = useMemo(() => {
    return wristbands.find((w) => w.id === activeWristbandId) || wristbands[0] || DEFAULT_WRISTBAND_1;
  }, [wristbands, activeWristbandId]);

  // Helper to commit wristband changes
  const commitWristbandData = (updated: WristbandData) => {
    if (onUpdateWristbandData) {
      onUpdateWristbandData(updated);
    }
  };

  const updateCurrentWristband = (updater: (wb: SingleWristband) => SingleWristband) => {
    const nextWbs = wristbands.map((wb) => {
      if (wb.id === currentWristband.id) {
        return updater(wb);
      }
      return wb;
    });
    const nextData: WristbandData = {
      ...normalizedData,
      wristbands: nextWbs,
      activeWristbandId: currentWristband.id,
      columns: nextWbs.find((w) => w.id === currentWristband.id)?.columns,
    };
    commitWristbandData(nextData);
  };

  // --- Wristband Management (Add, Remove, Duplicate, Choose Count) ---
  const handleAddWristband = () => {
    if (userRole !== 'admin') return;
    const newIdx = wristbands.length + 1;
    const newWb: SingleWristband = {
      id: `wb_${Date.now()}`,
      title: `WRISTBAND ${newIdx} • NEW INSERT`,
      subtitle: `CARDS 1 - 26`,
      labelingMode: 'same_per_card',
      startNumber: 1,
      rowsCount: currentWristband.rowsCount || 13,
      highlightTheme: 'gold-blue',
      highlightTarget: 'number_only',
      columns: [
        {
          name: `LEFT COLUMN (1 - ${currentWristband.rowsCount || 13})`,
          color: '#facc15',
          plays: Array.from({ length: currentWristband.rowsCount || 13 }, (_, i) => ({
            text: '',
            customLabel: `${i + 1}`,
          })),
        },
        {
          name: `RIGHT COLUMN (${(currentWristband.rowsCount || 13) + 1} - ${(currentWristband.rowsCount || 13) * 2})`,
          color: '#3b82f6',
          plays: Array.from({ length: currentWristband.rowsCount || 13 }, (_, i) => ({
            text: '',
            customLabel: `${(currentWristband.rowsCount || 13) + i + 1}`,
          })),
        },
      ],
    };
    const nextWbs = [...wristbands, newWb];
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
      activeWristbandId: newWb.id,
    });
    setActiveWristbandId(newWb.id);
  };

  const handleDuplicateWristband = (wb: SingleWristband) => {
    if (userRole !== 'admin') return;
    const dup: SingleWristband = {
      ...deepClone(wb),
      id: `wb_${Date.now()}`,
      title: `${wb.title} (COPY)`,
    };
    const nextWbs = [...wristbands, dup];
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
      activeWristbandId: dup.id,
    });
    setActiveWristbandId(dup.id);
  };

  const handleDeleteWristband = (id: string) => {
    if (wristbands.length <= 1) {
      setDeleteNotice('You must keep at least one wristband insert.');
      setTimeout(() => setDeleteNotice(null), 3500);
      return;
    }
    const nextWbs = wristbands.filter((w) => w.id !== id);
    const nextActive = nextWbs[0].id;
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
      activeWristbandId: nextActive,
    });
    setActiveWristbandId(nextActive);
    setConfirmDeleteWbId(null);
    setDeleteNotice(`Deleted wristband. ${nextWbs.length} wristband(s) remaining.`);
    setTimeout(() => setDeleteNotice(null), 3500);
  };

  const handleSetWristbandCount = (count: number) => {
    if (count < 1) return;
    if (count === wristbands.length) return;

    if (count > wristbands.length) {
      const nextWbs = [...wristbands];
      const rows = currentWristband.rowsCount || 13;
      while (nextWbs.length < count) {
        const num = nextWbs.length + 1;
        nextWbs.push({
          id: `wb_${Date.now()}_${num}`,
          title: `WRISTBAND ${num} • GAME INSERT`,
          subtitle: `CARDS 1 - ${rows * 2}`,
          labelingMode: 'same_per_card',
          rowsCount: rows,
          highlightTarget: 'number_only',
          columns: [
            {
              name: `LEFT COLUMN (1 - ${rows})`,
              color: num % 2 === 1 ? '#facc15' : '#a3e635',
              plays: Array.from({ length: rows }, (_, i) => ({ text: '', customLabel: `${i + 1}` })),
            },
            {
              name: `RIGHT COLUMN (${rows + 1} - ${rows * 2})`,
              color: num % 2 === 1 ? '#3b82f6' : '#a855f7',
              plays: Array.from({ length: rows }, (_, i) => ({ text: '', customLabel: `${rows + i + 1}` })),
            },
          ],
        });
      }
      commitWristbandData({ ...normalizedData, wristbands: nextWbs });
    } else {
      const nextWbs = wristbands.slice(0, count);
      const nextActive = nextWbs.some((w) => w.id === activeWristbandId) ? activeWristbandId : nextWbs[0].id;
      commitWristbandData({ ...normalizedData, wristbands: nextWbs, activeWristbandId: nextActive });
      setActiveWristbandId(nextActive);
      setDeleteNotice(`Reduced to ${count} wristbands.`);
      setTimeout(() => setDeleteNotice(null), 3000);
    }
  };

  // --- Rows Count & Labeling Mode ---
  const handleSetRowsCount = (rows: number) => {
    if (userRole !== 'admin') return;
    updateCurrentWristband((wb) => {
      const updatedCols = (wb.columns || []).map((col) => {
        const currentPlays = [...(col.plays || [])];
        if (currentPlays.length < rows) {
          while (currentPlays.length < rows) {
            currentPlays.push({ text: '' });
          }
        } else if (currentPlays.length > rows) {
          currentPlays.splice(rows);
        }
        return { ...col, plays: currentPlays };
      });
      return { ...wb, rowsCount: rows, columns: updatedCols };
    });
  };

  const handleSetLabelingMode = (mode: 'same_per_card' | 'continuous' | 'letter_num' | 'custom') => {
    if (userRole !== 'admin') return;
    updateCurrentWristband((wb) => ({
      ...wb,
      labelingMode: mode,
    }));
  };

  // Helper to compute slot display label
  const getSlotLabel = (wb: SingleWristband, colIdx: number, rowIdx: number, play: WristbandPlay): string => {
    if (wb.labelingMode === 'custom' && play.customLabel) {
      return play.customLabel;
    }
    const rows = wb.rowsCount || 13;
    if (wb.labelingMode === 'letter_num') {
      const colLetter = colIdx === 0 ? 'A' : colIdx === 1 ? 'B' : String.fromCharCode(65 + colIdx);
      return `${colLetter}${rowIdx + 1}`;
    }
    if (wb.labelingMode === 'continuous') {
      // Find index of wristband
      const wbIdx = wristbands.findIndex((w) => w.id === wb.id);
      const offset = (wbIdx >= 0 ? wbIdx : 0) * (rows * 2);
      const slotNum = offset + (colIdx * rows) + rowIdx + 1;
      return `${slotNum}`;
    }
    // Default: 'same_per_card' (1 - rows on Col 1, rows+1 - rows*2 on Col 2)
    const num = (colIdx * rows) + rowIdx + 1;
    return `${num}`;
  };

  // Update a single play text
  const handleUpdatePlayText = (wbId: string, colIdx: number, rowIdx: number, text: string) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = [...col.plays];
      nextPlays[rowIdx] = {
        ...nextPlays[rowIdx],
        text: text.trim(),
      };
      return { ...col, plays: nextPlays };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });

    if (onUpdatePlay) {
      onUpdatePlay(colIdx, rowIdx, text);
    }
  };

  // Update play custom highlight
  const handleUpdatePlayHighlight = (wbId: string, colIdx: number, rowIdx: number, color: string | undefined) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = [...col.plays];
      nextPlays[rowIdx] = {
        ...nextPlays[rowIdx],
        highlightColor: color,
      };
      return { ...col, plays: nextPlays };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Helper for text contrast and legibility
  const getContrastTextColor = (bgColor?: string, preferredColor?: string): string => {
    if (preferredColor && preferredColor !== '#000000' && preferredColor !== '#ffffff') {
      return preferredColor;
    }
    if (!bgColor) return preferredColor || '#000000';
    const clean = bgColor.trim().toLowerCase();
    if (clean === '#fff' || clean === '#ffffff' || clean === 'white') return preferredColor || '#000000';
    if (clean === '#000' || clean === '#000000' || clean === 'black') return preferredColor || '#ffffff';

    const hex = clean.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      if (preferredColor) {
        return preferredColor;
      }
      return yiq >= 135 ? '#000000' : '#ffffff';
    }
    return preferredColor || '#000000';
  };

  // Update Column Highlight Color: updates play numbers highlight AND header background so they match per column!
  const handleUpdateColumnHighlight = (wbId: string, colIdx: number, color: string) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      // Header color and numberBgColor match exactly.
      // Also clear individual number overrides so all rows in this column match cleanly.
      const nextPlays = (col.plays || []).map((p) => ({
        ...p,
        numberHighlightColor: undefined,
      }));
      return {
        ...col,
        color: color,
        numberBgColor: color,
        plays: nextPlays,
      };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Update Column Number Text / Font Color (e.g. black, white, red, etc.)
  const handleUpdateColumnNumberTextColor = (wbId: string, colIdx: number, color: string) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = (col.plays || []).map((p) => ({
        ...p,
        numberTextColor: undefined,
      }));
      return {
        ...col,
        numberTextColor: color,
        plays: nextPlays,
      };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Reset any individual number overrides in a column so all numbers match the column settings
  const handleResetColumnNumberOverrides = (wbId: string, colIdx: number) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = (col.plays || []).map((p) => ({
        ...p,
        numberHighlightColor: undefined,
        numberTextColor: undefined,
      }));
      return {
        ...col,
        plays: nextPlays,
      };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Update play number highlight specifically (highlight just the play number badge)
  const handleUpdateNumberHighlight = (wbId: string, colIdx: number, rowIdx: number, color: string | undefined) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = [...col.plays];
      nextPlays[rowIdx] = {
        ...nextPlays[rowIdx],
        numberHighlightColor: color,
      };
      return { ...col, plays: nextPlays };
    });

    const nextWbs = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Update slot custom label directly
  const handleUpdateCustomLabel = (wbId: string, colIdx: number, rowIdx: number, label: string) => {
    if (userRole !== 'admin') return;
    const targetWb = wristbands.find((w) => w.id === wbId);
    if (!targetWb) return;

    const nextCols = targetWb.columns.map((col, cIdx) => {
      if (cIdx !== colIdx) return col;
      const nextPlays = [...col.plays];
      nextPlays[rowIdx] = {
        ...nextPlays[rowIdx],
        customLabel: label,
      };
      return { ...col, plays: nextPlays };
    });

    const nextWbs: SingleWristband[] = wristbands.map((w) => (w.id === wbId ? { ...w, columns: nextCols, labelingMode: 'custom' as const } : w));
    commitWristbandData({
      ...normalizedData,
      wristbands: nextWbs,
    });
  };

  // Drag and drop from Play Bank or external
  const handleDropOnSlot = (e: React.DragEvent, wbId: string, colIdx: number, rowIdx: number) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    let playName = '';
    const transferData = e.dataTransfer.getData('callSheetPlayTransfer');
    if (transferData) {
      try {
        const parsed = JSON.parse(transferData);
        playName = parsed.name || parsed.text || '';
      } catch {
        playName = '';
      }
    }
    if (!playName) {
      playName = e.dataTransfer.getData('text/plain') || '';
    }
    if (playName) {
      handleUpdatePlayText(wbId, colIdx, rowIdx, playName.trim());
    }
  };

  // Autocomplete matching from playDatabase
  const filteredSuggestions = useMemo(() => {
    if (!cellSearchQuery.trim()) {
      return playDatabase.slice(0, 10);
    }
    const q = cellSearchQuery.toLowerCase();
    return playDatabase.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.formation?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [cellSearchQuery, playDatabase]);

  // Bulk fill from Play Bank
  const handleAutoFillFromPlayBank = () => {
    if (userRole !== 'admin') return;
    const rows = currentWristband.rowsCount || 13;
    const totalSlots = rows * 2;
    if (confirm(`Populate Wristband "${currentWristband.title}" from Play Bank (${playDatabase.length} plays available)?`)) {
      const col1Plays: WristbandPlay[] = [];
      const col2Plays: WristbandPlay[] = [];

      for (let i = 0; i < rows; i++) {
        const p = playDatabase[i];
        col1Plays.push({
          text: p ? p.name : '',
          wristbandNum: p?.wristbandNum || (i + 1),
        });
      }
      for (let i = 0; i < rows; i++) {
        const p = playDatabase[rows + i];
        col2Plays.push({
          text: p ? p.name : '',
          wristbandNum: p?.wristbandNum || (rows + i + 1),
        });
      }

      updateCurrentWristband((wb) => ({
        ...wb,
        columns: [
          { ...wb.columns[0], plays: col1Plays },
          { ...wb.columns[1], plays: col2Plays },
        ],
      }));
    }
  };

  // Quick reset to user's 2 wristbands
  const handleResetToUserTwoWristbands = () => {
    if (userRole !== 'admin') return;
    if (confirm('Load the 2 standard Game Day Wristbands (21 Series and 32/11 Series) with same labeling (1-26)?')) {
      commitWristbandData(INITIAL_TWO_WRISTBANDS_DATA);
      setActiveWristbandId('wb_1');
    }
  };

  const handleCopyText = (wb: SingleWristband) => {
    const lines: string[] = [`=== ${wb.title} (4.5" x 2.25") ===`];
    const rows = wb.rowsCount || 13;
    (wb.columns || []).forEach((col, cIdx) => {
      lines.push(`\n[${col.name || `COLUMN ${cIdx + 1}`}]`);
      (col.plays || []).forEach((p, rIdx) => {
        const label = getSlotLabel(wb, cIdx, rIdx, p);
        lines.push(`${label}. ${p.text || '—'}`);
      });
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Render a Single Wristband Card (Print & Preview ready)
  const renderSingleWristbandCard = (wb: SingleWristband, keyPrefix: string = 'card') => {
    const rows = wb.rowsCount || 13;
    const cols = wb.columns || [];

    return (
      <div
        key={`${keyPrefix}_${wb.id}`}
        className="wristband-insert-print-box bg-white text-slate-900 border-2 border-black rounded-none shadow-md overflow-hidden flex flex-col select-none"
        style={{
          width: zoomScale === 'comfortable' ? '460px' : '432px',
          minWidth: zoomScale === 'comfortable' ? '460px' : '432px',
          maxWidth: zoomScale === 'comfortable' ? '460px' : '432px',
          height: zoomScale === 'comfortable' ? '250px' : '216px',
        }}
      >
        {/* Top Header Strip */}
        <div className="bg-black text-white text-center font-black py-0.5 px-2 flex items-center justify-between border-b-[1.5px] border-black">
          <span className="text-[10px] tracking-wider truncate uppercase">{wb.title}</span>
          <span className="text-[8px] bg-yellow-400 text-black px-1 rounded font-mono font-bold tracking-tight">
            4.5&quot; &times; 2.25&quot;
          </span>
        </div>

        {/* Column Headers - Header matches the number highlight per column */}
        <div className="grid grid-cols-2 text-center text-[10px] font-black tracking-wider border-b-[1.5px] border-black">
          {cols.map((col, cIdx) => {
            const colHighlightColor = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#3b82f6');
            const colHeaderTextColor = col.headerTextColor || getContrastTextColor(colHighlightColor, col.numberTextColor);

            return (
              <div
                key={cIdx}
                className="py-0.5 px-2 truncate flex items-center justify-between border-r last:border-r-0 border-black transition-colors"
                style={{
                  backgroundColor: colHighlightColor,
                  color: colHeaderTextColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <span className="truncate uppercase font-bold text-[9px]">
                  {col.name || (cIdx === 0 ? `COL 1 (1 - ${rows})` : `COL 2 (${rows + 1} - ${rows * 2})`)}
                </span>
                {userRole === 'admin' && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <label
                      className="flex items-center gap-0.5 cursor-pointer opacity-85 hover:opacity-100"
                      title={`${cIdx === 0 ? 'Left' : 'Right'} Column: Change Number Highlight & Header Color`}
                    >
                      <span className="text-[7.5px] font-bold">HL:</span>
                      <input
                        type="color"
                        value={colHighlightColor}
                        onChange={(e) => handleUpdateColumnHighlight(wb.id, cIdx, e.target.value)}
                        className="w-3.5 h-3.5 rounded cursor-pointer border border-black/40 p-0"
                      />
                    </label>
                    <label
                      className="flex items-center gap-0.5 cursor-pointer opacity-85 hover:opacity-100"
                      title={`${cIdx === 0 ? 'Left' : 'Right'} Column: Change Number Font Color`}
                    >
                      <span className="text-[7.5px] font-bold">TXT:</span>
                      <input
                        type="color"
                        value={col.numberTextColor || '#000000'}
                        onChange={(e) => handleUpdateColumnNumberTextColor(wb.id, cIdx, e.target.value)}
                        className="w-3.5 h-3.5 rounded cursor-pointer border border-black/40 p-0"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Grid: 2 Columns of Slots */}
        <div className="grid grid-cols-2 flex-1 divide-x-[1.5px] divide-black overflow-hidden">
          {cols.map((col, cIdx) => {
            const plays = col.plays || [];
            const isNumberOnly = wb.highlightTarget !== 'full_row';
            const colHighlightColor = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#3b82f6');

            return (
              <div key={cIdx} className="flex flex-col h-full divide-y divide-black/30">
                {Array.from({ length: rows }).map((_, rIdx) => {
                  const play = plays[rIdx] || { text: '' };
                  const slotLabel = getSlotLabel(wb, cIdx, rIdx, play);
                  const isSelected =
                    selectedCell?.wbId === wb.id &&
                    selectedCell?.colIdx === cIdx &&
                    selectedCell?.rowIdx === rIdx;

                  // Number badge background color:
                  // The header matches the number highlight per column:
                  const numberBg =
                    play.numberHighlightColor ||
                    (isNumberOnly
                      ? colHighlightColor
                      : (play.numberHighlightColor || 'transparent'));

                  // Number badge text/font color:
                  // Configurable per column, with individual play override, or auto-contrast
                  const numberTextColor =
                    play.numberTextColor ||
                    col.numberTextColor ||
                    getContrastTextColor(numberBg);

                  // Row background:
                  // If number_only mode: clean crisp white
                  // If full_row mode: uses play.highlightColor
                  const rowBg = isNumberOnly
                    ? (isSelected ? '#e0e7ff' : '#ffffff')
                    : (play.highlightColor || (isSelected ? '#e0e7ff' : '#ffffff'));

                  return (
                    <div
                      key={rIdx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnSlot(e, wb.id, cIdx, rIdx)}
                      onClick={() => {
                        setSelectedCell({ wbId: wb.id, colIdx: cIdx, rowIdx: rIdx });
                        setCellSearchQuery(play.text || '');
                      }}
                      className={`flex items-stretch text-[10px] h-[calc(100%/${rows})] leading-none group transition-colors cursor-pointer relative ${
                        isSelected ? 'ring-2 ring-indigo-500 z-10' : ''
                      }`}
                      style={{
                        backgroundColor: rowBg,
                      }}
                    >
                      {/* Number/Letter Label Badge - Highlighting per column with independent number color */}
                      <span
                        className="font-mono font-black text-[9px] w-5 min-w-[20px] flex items-center justify-center border-r border-black/40 pr-0.5 select-none shrink-0"
                        style={{
                          backgroundColor: numberBg,
                          color: numberTextColor,
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        }}
                        title={`Play Number (${cIdx === 0 ? 'Left' : 'Right'} Column)`}
                      >
                        {slotLabel}
                      </span>

                      {/* Play Text Input / Display */}
                      <input
                        type="text"
                        disabled={userRole !== 'admin'}
                        value={play.text || ''}
                        onChange={(e) => handleUpdatePlayText(wb.id, cIdx, rIdx, e.target.value)}
                        placeholder="—"
                        className="w-full bg-transparent border-none text-[9.5px] font-bold text-slate-900 tracking-tight focus:ring-1 focus:ring-indigo-500 focus:bg-amber-50 focus:outline-none px-1.5 uppercase truncate font-mono self-center"
                      />

                      {/* Hover Highlight Quick Actions */}
                      {userRole === 'admin' && (
                        <div className="absolute right-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-white/95 shadow px-1 py-0.5 rounded text-[8px] z-20 border border-slate-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isNumberOnly) {
                                handleUpdateNumberHighlight(
                                  wb.id,
                                  cIdx,
                                  rIdx,
                                  play.numberHighlightColor ? undefined : '#facc15'
                                );
                              } else {
                                handleUpdatePlayHighlight(
                                  wb.id,
                                  cIdx,
                                  rIdx,
                                  play.highlightColor ? undefined : col.color
                                );
                              }
                            }}
                            title={isNumberOnly ? "Toggle Number Column Highlight" : "Toggle Row Highlight"}
                            className="p-0.5 hover:text-indigo-600"
                          >
                            <Highlighter className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Delete Notice / Toast */}
      {deleteNotice && (
        <div className="p-3 bg-rose-950/90 border border-rose-700 text-rose-200 text-xs font-bold rounded-xl flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteNotice(null)}
            className="text-rose-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & Wristband Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Watch className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                  Wristband Insert Generator
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    4.5&quot; &times; 2.25&quot; Sizing
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {wristbands.length} Wristband{wristbands.length > 1 ? 's' : ''}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Custom highlights &bull; Linked Play Bank &bull; Same or continuous numbering &bull; Multi-wristband coach cards
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Play Bank Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlayBankOpen(!isPlayBankOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isPlayBankOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <span>Play Bank ({playDatabase.length})</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => {
                const printContainer = document.getElementById('wristband-print-section');
                if (printContainer) {
                  triggerPrint({ targetElementSelector: '#wristband-print-section', documentTitle: 'Wristband_Inserts' });
                } else {
                  window.print();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Inserts</span>
            </button>

            {/* Copy Text Button */}
            <button
              type="button"
              onClick={() => handleCopyText(currentWristband)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {/* Side-by-Side View Toggle */}
            <button
              type="button"
              onClick={() => setViewAllSideBySide(!viewAllSideBySide)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewAllSideBySide
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{viewAllSideBySide ? 'Single View' : 'Side-by-Side'}</span>
            </button>

            {/* Reset to user 2 wristbands */}
            {userRole === 'admin' && (
              <button
                type="button"
                onClick={handleResetToUserTwoWristbands}
                title="Reset to 2 Wristbands (21 Series & 32/11 Series) with same labeling"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Reload User Wristbands</span>
              </button>
            )}
          </div>
        </div>

        {/* Wristband Selector Tabs & Count Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Wristband Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {wristbands.map((wb, idx) => {
              const isActive = wb.id === activeWristbandId;
              const isConfirming = confirmDeleteWbId === wb.id;

              return (
                <div key={wb.id} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWristbandId(wb.id);
                      setConfirmDeleteWbId(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-750 hover:bg-slate-750 hover:text-white'
                    }`}
                  >
                    <Watch className="w-3.5 h-3.5" />
                    <span>{wb.title || `Wristband ${idx + 1}`}</span>
                  </button>

                  {wristbands.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteWbId(isConfirming ? null : wb.id);
                      }}
                      className="ml-1 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete this wristband insert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Inline Confirm Delete Popover */}
                  {isConfirming && (
                    <div className="absolute left-0 -bottom-9 z-40 bg-rose-950 border border-rose-600 px-2 py-1 rounded-xl shadow-2xl flex items-center gap-1.5 text-[11px] text-white animate-in fade-in">
                      <span className="font-bold text-rose-200">Delete?</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWristband(wb.id);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 font-bold text-white text-[10px] cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteWbId(null);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Wristband Button */}
            <button
              type="button"
              onClick={handleAddWristband}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Wristband</span>
            </button>
          </div>

          {/* Quick Count Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold">Total Wristbands:</span>
            <select
              value={wristbands.length}
              onChange={(e) => handleSetWristbandCount(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Wristband{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Wristband Customization Settings Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Title & Subtitle Editor */}
        <div className="flex-1 min-w-[260px] flex items-center gap-2">
          <span className="text-slate-400 font-bold whitespace-nowrap">Title:</span>
          <input
            type="text"
            disabled={userRole !== 'admin'}
            value={currentWristband.title || ''}
            onChange={(e) => updateCurrentWristband((wb) => ({ ...wb, title: e.target.value }))}
            className="flex-1 bg-slate-800 border border-slate-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none uppercase"
          />
        </div>

        {/* Labeling Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            <span>Labeling:</span>
          </span>
          <select
            disabled={userRole !== 'admin'}
            value={currentWristband.labelingMode || 'same_per_card'}
            onChange={(e) => handleSetLabelingMode(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-white font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="same_per_card">Same Labeling on Both (1 - 26)</option>
            <option value="continuous">Continuous Numbers (1 - 52+)</option>
            <option value="letter_num">Letters + Numbers (A1, B1...)</option>
            <option value="custom">Custom / In-Place Labels</option>
          </select>
        </div>

        {/* Rows Count Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold whitespace-nowrap">Rows / Col:</span>
          <select
            disabled={userRole !== 'admin'}
            value={currentWristband.rowsCount || 13}
            onChange={(e) => handleSetRowsCount(parseInt(e.target.value, 10))}
            className="bg-slate-800 border border-slate-700 text-white font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={10}>10 Rows (20 Plays)</option>
            <option value={12}>12 Rows (24 Plays)</option>
            <option value={13}>13 Rows (26 Plays - Standard)</option>
            <option value={14}>14 Rows (28 Plays)</option>
            <option value={15}>15 Rows (30 Plays)</option>
            <option value={16}>16 Rows (32 Plays)</option>
            <option value={20}>20 Rows (40 Plays)</option>
          </select>
        </div>

        {/* Highlight Target Selector: Highlight Just Number Column vs Full Row */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span>Highlight:</span>
          </span>
          <select
            disabled={userRole !== 'admin'}
            value={currentWristband.highlightTarget || 'number_only'}
            onChange={(e) => {
              const val = e.target.value as 'number_only' | 'full_row';
              updateCurrentWristband((wb) => ({ ...wb, highlightTarget: val }));
            }}
            className="bg-slate-800 border border-slate-700 text-white font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="number_only">Play Number Column Only</option>
            <option value="full_row">Entire Row (Full)</option>
          </select>
        </div>

        {/* Number Column Highlight Color Swatches */}
        {currentWristband.highlightTarget !== 'full_row' && userRole === 'admin' && (
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-300 font-semibold text-[11px] whitespace-nowrap">Number Color:</span>
            <div className="flex items-center gap-1">
              {[
                { name: 'Yellow', hex: '#facc15' },
                { name: 'Volt Lime', hex: '#a3e635' },
                { name: 'Sky Cyan', hex: '#38bdf8' },
                { name: 'Royal Blue', hex: '#93c5fd' },
                { name: 'Orange', hex: '#fb923c' },
                { name: 'Red', hex: '#f87171' },
                { name: 'Purple', hex: '#c084fc' },
              ].map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => {
                    updateCurrentWristband((wb) => ({
                      ...wb,
                      highlightTarget: 'number_only',
                      columns: wb.columns.map((col) => ({
                        ...col,
                        numberBgColor: swatch.hex,
                      })),
                    }));
                  }}
                  style={{ backgroundColor: swatch.hex }}
                  className="w-4 h-4 rounded-md border border-black/40 hover:scale-125 transition-transform cursor-pointer shadow-xs"
                  title={`Set Number Column to ${swatch.name}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Auto Fill from Play Bank */}
        <button
          type="button"
          onClick={handleAutoFillFromPlayBank}
          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <FolderSync className="w-3.5 h-3.5" />
          <span>Fill from Play Bank</span>
        </button>

        {/* Prominent Delete Wristband Action Button */}
        <div className="flex items-center">
          {confirmDeleteWbId === currentWristband.id ? (
            <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-600 px-2.5 py-1 rounded-xl shadow-md animate-in fade-in">
              <span className="text-[11px] font-bold text-rose-200">Delete this wristband?</span>
              <button
                type="button"
                onClick={() => handleDeleteWristband(currentWristband.id)}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteWbId(null)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={wristbands.length <= 1}
              onClick={() => {
                if (wristbands.length <= 1) {
                  setDeleteNotice('At least one wristband insert is required.');
                  setTimeout(() => setDeleteNotice(null), 3000);
                  return;
                }
                setConfirmDeleteWbId(currentWristband.id);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
              title={
                wristbands.length <= 1
                  ? 'At least 1 wristband is required'
                  : `Delete ${currentWristband.title || 'this wristband'}`
              }
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Wristband</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout (Wristband Cards + Play Bank Drawer) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left: Active Wristband Cards Display */}
        <div className="flex-1 w-full space-y-4">
          {/* Per-Column Number Highlight and Color Controls */}
          {userRole === 'admin' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Column Number Highlighting &amp; Colors
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                        Left &amp; Right Column Controls
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Highlight numbers and set number text color per column independently. The column header automatically matches the number highlight.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                    <Check className="w-3.5 h-3.5" /> Header Matches Highlight
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    colIdx: 0,
                    title: 'Left Column (Plays 1 – 13)',
                    sub: 'Column 1',
                    defaultBg: '#facc15',
                    defaultText: '#000000',
                    sampleNum: '1',
                  },
                  {
                    colIdx: 1,
                    title: `Right Column (Plays ${(currentWristband.rowsCount || 13) + 1} – ${(currentWristband.rowsCount || 13) * 2})`,
                    sub: 'Column 2',
                    defaultBg: '#3b82f6',
                    defaultText: '#ffffff',
                    sampleNum: `${(currentWristband.rowsCount || 13) + 1}`,
                  },
                ].map(({ colIdx, title, sub, defaultBg, defaultText, sampleNum }) => {
                  const col = currentWristband.columns[colIdx] || { color: defaultBg, plays: [] };
                  const currentBg = col.numberBgColor || col.color || defaultBg;
                  const currentText = col.numberTextColor || getContrastTextColor(currentBg, defaultText);

                  return (
                    <div
                      key={colIdx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-inner"
                    >
                      {/* Header bar of Column card */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/30"
                            style={{ backgroundColor: currentBg }}
                          />
                          <div>
                            <span className="text-xs font-black text-slate-100 uppercase tracking-wide block">
                              {col.name || title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {sub} &bull; {currentWristband.rowsCount || 13} Rows
                            </span>
                          </div>
                        </div>

                        {/* Live Badge Preview */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-lg">
                          <span className="text-[10px] text-slate-400 font-medium">Preview:</span>
                          <span
                            className="font-mono font-black text-xs px-2 py-0.5 rounded border border-black/40 shadow-xs"
                            style={{
                              backgroundColor: currentBg,
                              color: currentText,
                            }}
                          >
                            {sampleNum}
                          </span>
                        </div>
                      </div>

                      {/* Side by side: Highlight Color & Number Font Color */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. Highlight (Background) & Header Color */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                              <Highlighter className="w-3 h-3 text-amber-400" />
                              <span>Highlight &amp; Header:</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={currentBg}
                                onChange={(e) => handleUpdateColumnHighlight(currentWristband.id, colIdx, e.target.value)}
                                className="w-5 h-5 rounded cursor-pointer border border-slate-600 p-0"
                                title="Pick custom highlight color"
                              />
                            </div>
                          </div>

                          {/* Quick Swatches */}
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {[
                              { name: 'Yellow', hex: '#facc15' },
                              { name: 'Volt Lime', hex: '#a3e635' },
                              { name: 'Sky Cyan', hex: '#38bdf8' },
                              { name: 'Royal Blue', hex: '#3b82f6' },
                              { name: 'Orange', hex: '#fb923c' },
                              { name: 'Red', hex: '#ef4444' },
                              { name: 'Purple', hex: '#a855f7' },
                              { name: 'Pink', hex: '#ec4899' },
                              { name: 'White', hex: '#ffffff' },
                              { name: 'Dark Slate', hex: '#334155' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                onClick={() => handleUpdateColumnHighlight(currentWristband.id, colIdx, swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-4 h-4 rounded border transition-transform hover:scale-125 cursor-pointer ${
                                  currentBg.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-white border-transparent scale-110'
                                    : 'border-black/40'
                                }`}
                                title={`Set to ${swatch.name} (${swatch.hex})`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 2. Number Font / Text Color */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                              <Type className="w-3 h-3 text-indigo-400" />
                              <span>Number Font Color:</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={currentText}
                                onChange={(e) => handleUpdateColumnNumberTextColor(currentWristband.id, colIdx, e.target.value)}
                                className="w-5 h-5 rounded cursor-pointer border border-slate-600 p-0"
                                title="Pick custom number text color"
                              />
                            </div>
                          </div>

                          {/* Quick Text Buttons */}
                          <div className="flex items-center gap-1 pt-0.5">
                            {[
                              { label: 'Black', hex: '#000000', bg: 'bg-black text-white' },
                              { label: 'White', hex: '#ffffff', bg: 'bg-white text-black' },
                              { label: 'Navy', hex: '#1e3a8a', bg: 'bg-blue-950 text-white' },
                              { label: 'Red', hex: '#b91c1c', bg: 'bg-red-900 text-white' },
                            ].map((opt) => (
                              <button
                                key={opt.hex}
                                type="button"
                                onClick={() => handleUpdateColumnNumberTextColor(currentWristband.id, colIdx, opt.hex)}
                                className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold border transition-all cursor-pointer ${opt.bg} ${
                                  currentText.toLowerCase() === opt.hex.toLowerCase()
                                    ? 'ring-2 ring-indigo-400 border-white'
                                    : 'border-slate-700 opacity-80 hover:opacity-100'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const autoColor = getContrastTextColor(currentBg);
                                handleUpdateColumnNumberTextColor(currentWristband.id, colIdx, autoColor);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer ml-auto"
                              title="Auto-calculate high contrast text color"
                            >
                              Auto
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                        <span className="text-slate-500 font-medium">
                          Applies to header and all {currentWristband.rowsCount || 13} numbers
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetColumnNumberOverrides(currentWristband.id, colIdx)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                          title="Ensure every number in this column uses these exact colors"
                        >
                          Apply to All Rows
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[350px]">
            {viewAllSideBySide ? (
              <div className="flex flex-wrap items-center justify-center gap-6 w-full">
                {wristbands.map((wb) => (
                  <div key={wb.id} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {wb.title}
                    </span>
                    {renderSingleWristbandCard(wb, 'side')}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {renderSingleWristbandCard(currentWristband, 'active')}
                <p className="text-[11px] text-slate-500">
                  Tip: Click any slot to edit play or drag directly from the Play Bank. Exact 4.5&quot; &times; 2.25&quot; insert size.
                </p>
              </div>
            )}
          </div>

          {/* Cell Quick Editor & Autocomplete Drawer (Active when a cell is clicked) */}
          {selectedCell && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-xl text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Editing Slot (Col {selectedCell.colIdx + 1}, Row {selectedCell.rowIdx + 1})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search & Assign Play */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 font-semibold block">Play Name (or search Play Bank):</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cellSearchQuery}
                      onChange={(e) => {
                        setCellSearchQuery(e.target.value);
                        handleUpdatePlayText(
                          selectedCell.wbId,
                          selectedCell.colIdx,
                          selectedCell.rowIdx,
                          e.target.value
                        );
                      }}
                      placeholder="Type play name or choose below..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Autocomplete suggestions */}
                  {filteredSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 max-h-24 overflow-y-auto">
                      {filteredSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => {
                            setCellSearchQuery(sug.name);
                            handleUpdatePlayText(
                              selectedCell.wbId,
                              selectedCell.colIdx,
                              selectedCell.rowIdx,
                              sug.name
                            );
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-mono text-[11px] border border-slate-700 transition-colors"
                        >
                          {sug.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlight Color Pickers for Slot & Number */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block flex items-center justify-between">
                      <span>Play Number Column Highlight:</span>
                      <span className="text-[10px] text-indigo-400 font-normal">Number Column Only</span>
                    </label>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateNumberHighlight(
                            selectedCell.wbId,
                            selectedCell.colIdx,
                            selectedCell.rowIdx,
                            undefined
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] hover:bg-slate-700 cursor-pointer"
                      >
                        Default
                      </button>
                      {HIGHLIGHT_PALETTE.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() =>
                            handleUpdateNumberHighlight(
                              selectedCell.wbId,
                              selectedCell.colIdx,
                              selectedCell.rowIdx,
                              pal.tint
                            )
                          }
                          style={{ backgroundColor: pal.bg }}
                          className="w-5 h-5 rounded-full border border-black/40 hover:scale-110 transition-transform cursor-pointer"
                          title={`Highlight Play Number in ${pal.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <label className="text-slate-400 font-semibold block">Full Slot Highlight:</label>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePlayHighlight(
                            selectedCell.wbId,
                            selectedCell.colIdx,
                            selectedCell.rowIdx,
                            undefined
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] hover:bg-slate-700 cursor-pointer"
                      >
                        None
                      </button>
                      {HIGHLIGHT_PALETTE.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() =>
                            handleUpdatePlayHighlight(
                              selectedCell.wbId,
                              selectedCell.colIdx,
                              selectedCell.rowIdx,
                              pal.tint
                            )
                          }
                          style={{ backgroundColor: pal.bg }}
                          className="w-5 h-5 rounded-full border border-black/40 hover:scale-110 transition-transform cursor-pointer"
                          title={pal.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Play Bank Sidebar (Drawer / Linked Playhub) */}
        {isPlayBankOpen && (
          <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Play Bank Library ({playDatabase.length})
              </span>
              <button
                type="button"
                onClick={() => setIsPlayBankOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              {(['all', 'offense', 'defense'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setPlayBankFilterUnit(u)}
                  className={`flex-1 py-1 rounded text-[11px] font-bold capitalize transition-colors ${
                    playBankFilterUnit === u
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={playBankSearch}
                onChange={(e) => setPlayBankSearch(e.target.value)}
                placeholder="Search plays or formations..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Personnel Sub-tabs Breakdown */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {getPersonnelSubTabs(
                playDatabase,
                playBankFilterUnit === 'defense' ? 'defense' : 'offense'
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPlayBankPersonnelFilter(tab.id)}
                  className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    playBankPersonnelFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.id === 'all' ? 'All' : tab.label.replace(' Personnel', ' Pers')} ({tab.count})
                </button>
              ))}
            </div>

            {/* Plays List (Draggable Cards) */}
            <div className="flex-1 max-h-[450px] overflow-y-auto space-y-1.5 pr-1">
              {playDatabase
                .filter((p) => {
                  if (playBankFilterUnit !== 'all' && p.unit !== playBankFilterUnit) return false;
                  if (playBankPersonnelFilter !== 'all') {
                    const pkg = extractPersonnel(p);
                    if (pkg !== playBankPersonnelFilter) return false;
                  }
                  if (!playBankSearch.trim()) return true;
                  const q = playBankSearch.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.formation?.toLowerCase().includes(q) ||
                    p.type?.toLowerCase().includes(q)
                  );
                })
                .map((play) => (
                  <div
                    key={play.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', play.name);
                      e.dataTransfer.setData(
                        'callSheetPlayTransfer',
                        safeJSONStringify({
                          id: play.id,
                          name: play.name,
                          formation: play.formation,
                          type: play.type,
                          wristbandNum: play.wristbandNum,
                        })
                      );
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white tracking-tight">
                        {play.name}
                      </span>
                      {play.wristbandNum && (
                        <span className="text-[9px] bg-slate-700 text-slate-300 font-mono px-1 rounded font-bold">
                          #{play.wristbandNum}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <span className="uppercase text-indigo-400 font-semibold">{play.formation}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{play.type}</span>
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-500 text-center italic">
              Drag any card directly into a wristband slot!
            </p>
          </div>
        )}
      </div>

      {/* Hidden Print Section for Exact Cut-Out Cards */}
      <div id="wristband-print-section" className="hidden print:block">
        <div className="p-4 space-y-8">
          {wristbands.map((wb) => (
            <div key={`print_${wb.id}`} className="page-break-after flex flex-col items-center">
              <div className="mb-2 text-center text-xs font-bold uppercase text-black">
                {wb.title} &bull; 4.5&quot; &times; 2.25&quot; Exact Cutout
              </div>
              {renderSingleWristbandCard(wb, 'print')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
