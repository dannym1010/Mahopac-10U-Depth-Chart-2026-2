import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Watch,
  Printer,
  Sparkles,
  RotateCcw,
  Scissors,
  Copy,
  Check,
  Search,
  Highlighter,
  Palette,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Edit3,
  Layers,
  BookOpen,
  Hash,
  FolderSync,
  AlertTriangle,
  X,
  ChevronRight,
  Shield,
  Swords,
  Maximize2,
  Minimize2,
  LayoutGrid,
  FileSpreadsheet,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { SingleWristband, WristbandColumn, WristbandData, WristbandPlay, UserRole } from '../types';
import { PlayDatabaseEntry, CallSheetFullData, CallSheetPlay, PlayType } from '../types/callSheet';
import { deepClone, safeJSONStringify, safeJSONSet, safeJSONParse } from '../services/storageService';
import { printWristbandInserts, generateWristbandPrintHTML, openCleanPrintTab, triggerPrint } from '../utils/printUtils';
import { extractPersonnel, getPersonnelSubTabs, normalizePlayName, syncCallSheetWithWristbands, syncWristbandToCallSheet } from '../utils/wristbandLinking';
import { PlayPickerModal } from './callSheet/PlayPickerModal';
import { PlayBankSidebar } from './callSheet/PlayBankSidebar';
import { ExcelPlayImportModal } from './callSheet/ExcelPlayImportModal';
import { DEFAULT_CALL_SHEET_DATA } from '../data/callSheetData';
import {
  DEFAULT_WRISTBAND_1,
  DEFAULT_WRISTBAND_2,
  INITIAL_TWO_WRISTBANDS_DATA,
  USER_IMPORTED_GAME_DAY_PLAYS,
} from '../data/userGameDayPlays';

export interface HighlightColorOption {
  name: string;
  bg: string;
  text: string;
  category: 'athletic' | 'pastel' | 'classic';
}

// 1. High-Intensity Athletic Game Day Neons
export const ATHLETIC_NEON_PALETTE: HighlightColorOption[] = [
  { name: 'Volt Lime', bg: '#a3e635', text: '#000000', category: 'athletic' },
  { name: 'Athletic Gold', bg: '#facc15', text: '#000000', category: 'athletic' },
  { name: 'Sky Cyan', bg: '#38bdf8', text: '#000000', category: 'athletic' },
  { name: 'Blaze Orange', bg: '#fb923c', text: '#000000', category: 'athletic' },
  { name: 'Crimson Red', bg: '#ef4444', text: '#ffffff', category: 'athletic' },
  { name: 'Royal Blue', bg: '#2563eb', text: '#ffffff', category: 'athletic' },
  { name: 'Electric Purple', bg: '#a855f7', text: '#ffffff', category: 'athletic' },
  { name: 'Hot Magenta', bg: '#ec4899', text: '#ffffff', category: 'athletic' },
];

// 2. Coach Soft Pastel Highlighters
export const PASTEL_HIGHLIGHTER_PALETTE: HighlightColorOption[] = [
  { name: 'Soft Yellow', bg: '#fef08a', text: '#000000', category: 'pastel' },
  { name: 'Soft Mint', bg: '#bbf7d0', text: '#000000', category: 'pastel' },
  { name: 'Ice Blue', bg: '#bae6fd', text: '#000000', category: 'pastel' },
  { name: 'Soft Peach', bg: '#fed7aa', text: '#000000', category: 'pastel' },
  { name: 'Soft Lavender', bg: '#e9d5ff', text: '#000000', category: 'pastel' },
  { name: 'Soft Coral', bg: '#fecdd3', text: '#000000', category: 'pastel' },
  { name: 'Pale Teal', bg: '#99f6e4', text: '#000000', category: 'pastel' },
  { name: 'Pure White', bg: '#ffffff', text: '#000000', category: 'pastel' },
];

// 3. Deep Football Team Contrast Colors
export const CLASSIC_TEAM_PALETTE: HighlightColorOption[] = [
  { name: 'Navy Blue', bg: '#1e3a8a', text: '#ffffff', category: 'classic' },
  { name: 'Forest Green', bg: '#14532d', text: '#ffffff', category: 'classic' },
  { name: 'Rich Amber', bg: '#d97706', text: '#000000', category: 'classic' },
  { name: 'Deep Maroon', bg: '#831843', text: '#ffffff', category: 'classic' },
  { name: 'Jet Black', bg: '#09090b', text: '#facc15', category: 'classic' },
];

export const HIGHLIGHT_PALETTE: HighlightColorOption[] = [
  ...ATHLETIC_NEON_PALETTE,
  ...PASTEL_HIGHLIGHTER_PALETTE,
  ...CLASSIC_TEAM_PALETTE,
];

const PLAY_TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  run: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'RUN' },
  pass: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', text: 'PASS' },
  play_action: { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', text: 'PA' },
  screen: { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', text: 'SCR' },
  rpo: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'RPO' },
  trick: { bg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40', text: 'TRICK' },
  two_point: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', text: '2-PT' },
  blitz: { bg: 'bg-red-500/20 text-red-300 border-red-500/40', text: 'BLITZ' },
  coverage: { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40', text: 'COV' },
  goal_line: { bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40', text: 'GL' },
};

function getContrastTextColor(hexBg: string, explicitTextColor?: string): string {
  if (explicitTextColor) return explicitTextColor;
  if (!hexBg || hexBg === 'transparent') return '#000000';
  const cleanHex = hexBg.replace('#', '');
  if (cleanHex.length !== 6) return '#000000';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? '#000000' : '#ffffff';
}

interface WristbandViewProps {
  wristbandData?: WristbandData;
  userRole: UserRole;
  masterPlayLibrary?: string[];
  playDatabase?: PlayDatabaseEntry[];
  callSheetData?: CallSheetFullData;
  activeTeamName?: string;
  onUpdateCallSheetData?: (data: CallSheetFullData) => void;
  onUpdatePlayDatabase?: (plays: PlayDatabaseEntry[]) => void;
  onUpdateWristbandData?: (data: WristbandData) => void;
  // Legacy props
  onUpdatePlay?: (colIdx: number, rowIdx: number, text: string) => void;
  onUpdateTitle?: (title: string) => void;
  onClearPlays?: () => void;
  onBulkFillPlays?: (plays: string[]) => void;
}

export const WristbandView: React.FC<WristbandViewProps> = ({
  wristbandData: propWristbandData,
  userRole,
  masterPlayLibrary = [],
  playDatabase = USER_IMPORTED_GAME_DAY_PLAYS,
  callSheetData,
  activeTeamName = 'Mahopac 10U',
  onUpdateCallSheetData,
  onUpdatePlayDatabase,
  onUpdateWristbandData,
}) => {
  // Internal state for resilient, instantaneous editing and printing
  const [internalData, setInternalData] = useState<WristbandData>(() => {
    if (propWristbandData?.wristbands && propWristbandData.wristbands.length > 0) {
      return propWristbandData;
    }
    const saved = safeJSONParse<WristbandData | null>('footballWristbandData', null);
    if (saved?.wristbands && saved.wristbands.length > 0) {
      return saved;
    }
    return INITIAL_TWO_WRISTBANDS_DATA;
  });

  // Guard against stale prop overwriting fresh local edits
  const lastEditTimeRef = useRef<number>(0);

  // Synchronize internal state when prop changes from parent (only if not recently edited locally)
  useEffect(() => {
    if (Date.now() - lastEditTimeRef.current < 2500) {
      return;
    }
    if (propWristbandData?.wristbands && propWristbandData.wristbands.length > 0) {
      setInternalData(propWristbandData);
    }
  }, [propWristbandData]);

  const normalizedData: WristbandData = internalData;

  const wristbands = normalizedData.wristbands || [DEFAULT_WRISTBAND_1, DEFAULT_WRISTBAND_2];

  const [activeWristbandId, setActiveWristbandId] = useState<string>(() => {
    return normalizedData.activeWristbandId || wristbands[0]?.id || 'wb_1';
  });

  const currentWristband: SingleWristband = useMemo(() => {
    const found = wristbands.find((w) => w.id === activeWristbandId);
    return found || wristbands[0] || DEFAULT_WRISTBAND_1;
  }, [wristbands, activeWristbandId]);

  // UI state matching Call Sheet Maker
  const [isPlayBankOpen, setIsPlayBankOpen] = useState(true);
  const [playBankUnit, setPlayBankUnit] = useState<'offense' | 'defense'>('offense');
  const [showPhysicalPreview, setShowPhysicalPreview] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [editingColumnHeaderIdx, setEditingColumnHeaderIdx] = useState<number | null>(null);
  const [editHeaderTitle, setEditHeaderTitle] = useState('');
  const [openPaletteColIdx, setOpenPaletteColIdx] = useState<number | null>(null);
  const [confirmDeleteWbId, setConfirmDeleteWbId] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Play Picker Modal state (exact same as Call Sheet Maker)
  const [pickingSlot, setPickingSlot] = useState<{
    wbId: string;
    colIdx: number;
    rowIdx: number;
  } | null>(null);

  // Inline editing state
  const [inlineEditingSlot, setInlineEditingSlot] = useState<{
    wbId: string;
    colIdx: number;
    rowIdx: number;
  } | null>(null);
  const [inlineTextValue, setInlineTextValue] = useState('');

  // Print mode state: 'active' | 'all'
  const [printMode, setPrintMode] = useState<'active' | 'all'>('active');

  // Drag-over visual feedback on slots
  const [dragOverSlot, setDragOverSlot] = useState<{ colIdx: number; rowIdx: number } | null>(null);

  // Helper to commit changes to storage, internal state & parent
  const commitWristbandData = (updated: WristbandData) => {
    lastEditTimeRef.current = Date.now();
    setInternalData(updated);
    safeJSONSet('footballWristbandData', updated);
    if (onUpdateWristbandData) {
      onUpdateWristbandData(updated);
    }
    // Automatically keep Call Sheet wristband tables & linked plays synchronized
    if (onUpdateCallSheetData) {
      const currentCs: CallSheetFullData =
        callSheetData || safeJSONParse<CallSheetFullData | null>('footballCallSheetData', null) || DEFAULT_CALL_SHEET_DATA;
      const syncedCs = syncWristbandToCallSheet(updated, currentCs, playDatabase);
      safeJSONSet('footballCallSheetData', syncedCs);
      onUpdateCallSheetData(syncedCs);
    }
  };

  const updateCurrentWristband = (updater: (wb: SingleWristband) => SingleWristband) => {
    const nextWristbands = wristbands.map((wb) => {
      if (wb.id === currentWristband.id) {
        return updater(wb);
      }
      return wb;
    });
    const nextData: WristbandData = {
      ...normalizedData,
      wristbands: nextWristbands,
      activeWristbandId: currentWristband.id,
    };
    commitWristbandData(nextData);
  };

  // Calculates slot label (1, 2, ... 13 / 14 ... 26 or letters)
  const getSlotLabel = (
    wb: SingleWristband,
    colIdx: number,
    rowIdx: number,
    play?: WristbandPlay
  ): string => {
    if (play?.customLabel) return play.customLabel;
    const mode = wb.labelingMode || 'same_per_card';
    const rows = wb.rowsCount || 13;

    if (mode === 'same_per_card') {
      const num = colIdx * rows + rowIdx + 1;
      return String(num);
    }
    if (mode === 'continuous') {
      const wbIndex = wristbands.findIndex((w) => w.id === wb.id);
      const prevRowsTotal = wbIndex * (rows * (wb.columns?.length || 2));
      return String(prevRowsTotal + colIdx * rows + rowIdx + 1);
    }
    if (mode === 'letter_num') {
      const letter = colIdx === 0 ? 'A' : colIdx === 1 ? 'B' : 'C';
      return `${letter}${rowIdx + 1}`;
    }
    return String(colIdx * rows + rowIdx + 1);
  };

  // Synchronize assigned play with Play Database and Call Sheet
  const syncPlayToDatabaseAndCallSheet = (
    playText: string,
    slotNumber: number,
    colHighlightColor: string,
    colTextColor: string,
    colHeaderName: string,
    formation?: string,
    type?: PlayType
  ) => {
    if (!playText || !playText.trim()) return;
    const norm = normalizePlayName(playText);

    // 1. Update matching play in playDatabase
    let updatedDb: PlayDatabaseEntry[] | undefined;
    if (playDatabase && onUpdatePlayDatabase) {
      let foundMatch = false;
      updatedDb = playDatabase.map((dbEntry) => {
        if (normalizePlayName(dbEntry.name) === norm) {
          foundMatch = true;
          return {
            ...dbEntry,
            wristbandNum: slotNumber,
            wristbandColor: colHighlightColor,
            wristbandNumberColor: colHighlightColor,
            wristbandTextColor: colTextColor,
            wristbandLabel: colHeaderName,
          };
        }
        return dbEntry;
      });

      if (!foundMatch) {
        // Automatically add to database if not present
        const newDbEntry: PlayDatabaseEntry = {
          id: `db_wb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: playText.trim().toUpperCase(),
          formation: formation || '',
          type: type || 'run',
          unit: playBankUnit,
          wristbandNum: slotNumber,
          wristbandColor: colHighlightColor,
          wristbandNumberColor: colHighlightColor,
          wristbandTextColor: colTextColor,
          wristbandLabel: colHeaderName,
          situations: ['1-10', 'Base'],
          tags: ['Wristband Play'],
        };
        updatedDb = [newDbEntry, ...updatedDb];
      }
      onUpdatePlayDatabase(updatedDb);
    }

    // 2. Synchronize across Call Sheet
    if (onUpdateCallSheetData) {
      const currentCs: CallSheetFullData =
        callSheetData || safeJSONParse<CallSheetFullData | null>('footballCallSheetData', null) || DEFAULT_CALL_SHEET_DATA;
      const syncedCs = syncWristbandToCallSheet(normalizedData, currentCs, updatedDb || playDatabase);
      safeJSONSet('footballCallSheetData', syncedCs);
      onUpdateCallSheetData(syncedCs);
    }
  };

  // Handle assigning a play into a wristband slot
  const handleAssignPlayToSlot = (
    wbId: string,
    colIdx: number,
    rowIdx: number,
    playInput: string | CallSheetPlay | PlayDatabaseEntry | WristbandPlay | any
  ) => {
    let playName = '';
    let formation = '';
    let type: PlayType | undefined = undefined;
    let rowHighlight: string | undefined = undefined;

    if (typeof playInput === 'string') {
      playName = playInput.trim().toUpperCase();
    } else if (playInput && typeof playInput === 'object') {
      playName = ((playInput.name || playInput.text || '') as string).trim().toUpperCase();
      formation = playInput.formation || '';
      type = playInput.type;
      rowHighlight =
        playInput.rowHighlightColor ||
        playInput.highlightColor ||
        playInput.wristbandRowColor ||
        (playInput.isHighlighted ? playInput.highlightColor : undefined);
    }

    const rows = currentWristband.rowsCount || 13;
    const slotNumber = colIdx * rows + rowIdx + 1;
    const col = currentWristband.columns[colIdx];
    const colColor = col?.numberBgColor || col?.color || (colIdx === 0 ? '#facc15' : '#38bdf8');
    const colTextColor = col?.numberTextColor || getContrastTextColor(colColor);
    const colHeaderName = col?.name || (colIdx === 0 ? 'Left Column' : 'Right Column');

    updateCurrentWristband((wb) => {
      const nextCols = [...wb.columns];
      const targetCol = { ...nextCols[colIdx] };
      const nextPlays = [...(targetCol.plays || [])];

      while (nextPlays.length <= rowIdx) {
        nextPlays.push({ text: '' });
      }

      nextPlays[rowIdx] = {
        ...nextPlays[rowIdx],
        text: playName,
        formation,
        type,
        wristbandNum: slotNumber,
        numberHighlightColor: colColor,
        numberTextColor: colTextColor,
        rowHighlightColor: rowHighlight || nextPlays[rowIdx]?.rowHighlightColor,
      };

      targetCol.plays = nextPlays;
      nextCols[colIdx] = targetCol;
      return { ...wb, columns: nextCols };
    });

    if (playName) {
      syncPlayToDatabaseAndCallSheet(
        playName,
        slotNumber,
        colColor,
        colTextColor,
        colHeaderName,
        formation,
        type
      );
    }
  };

  // Handle clearing a slot
  const handleClearSlot = (wbId: string, colIdx: number, rowIdx: number) => {
    updateCurrentWristband((wb) => {
      const nextCols = [...wb.columns];
      const targetCol = { ...nextCols[colIdx] };
      const nextPlays = [...(targetCol.plays || [])];
      if (nextPlays[rowIdx]) {
        nextPlays[rowIdx] = { text: '', rowHighlightColor: undefined };
      }
      targetCol.plays = nextPlays;
      nextCols[colIdx] = targetCol;
      return { ...wb, columns: nextCols };
    });
  };

  // Drag and drop handler
  const handleDropOnSlot = (
    e: React.DragEvent,
    wbId: string,
    colIdx: number,
    rowIdx: number
  ) => {
    e.preventDefault();
    setDragOverSlot(null);
    try {
      // 1. Try application/json (standard from PlayBankSidebar and Call Sheet)
      const appJson = e.dataTransfer.getData('application/json');
      if (appJson) {
        try {
          const parsed = JSON.parse(appJson);
          if (parsed && (parsed.name || parsed.text)) {
            handleAssignPlayToSlot(wbId, colIdx, rowIdx, parsed);
            return;
          }
        } catch {}
      }

      // 2. Try callSheetPlayTransfer
      const customTransfer = e.dataTransfer.getData('callSheetPlayTransfer');
      if (customTransfer) {
        try {
          const parsed = JSON.parse(customTransfer);
          if (parsed && (parsed.name || parsed.text)) {
            handleAssignPlayToSlot(wbId, colIdx, rowIdx, parsed);
            return;
          }
        } catch {}
      }

      // 3. Try text/plain
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && (parsed.name || parsed.text)) {
            handleAssignPlayToSlot(wbId, colIdx, rowIdx, parsed);
            return;
          }
        } catch {}
        handleAssignPlayToSlot(wbId, colIdx, rowIdx, text);
        return;
      }
    } catch (err) {
      console.error('Error handling drop on slot:', err);
    }
  };

  // Update Column Highlight Color
  const handleUpdateColumnHighlight = (wbId: string, colIdx: number, newColor: string) => {
    const textColor = getContrastTextColor(newColor);
    updateCurrentWristband((wb) => {
      const nextCols = wb.columns.map((col, idx) => {
        if (idx !== colIdx) return col;
        const updatedPlays = (col.plays || []).map((p) => ({
          ...p,
          numberHighlightColor: newColor,
          numberTextColor: textColor,
        }));
        return {
          ...col,
          color: newColor,
          numberBgColor: newColor,
          numberTextColor: textColor,
          headerTextColor: textColor,
          plays: updatedPlays,
        };
      });
      return { ...wb, columns: nextCols };
    });

    // Also update all plays currently in this column in playDatabase & callSheetData
    const rows = currentWristband.rowsCount || 13;
    const col = currentWristband.columns[colIdx];
    (col.plays || []).forEach((play, rIdx) => {
      if (play.text && play.text.trim()) {
        const slotNumber = colIdx * rows + rIdx + 1;
        syncPlayToDatabaseAndCallSheet(
          play.text,
          slotNumber,
          newColor,
          textColor,
          col.name || `Column ${colIdx + 1}`
        );
      }
    });
  };

  // Toggle Font Contrast (BLK / WHT)
  const handleToggleColumnFontColor = (wbId: string, colIdx: number, color: '#000000' | '#ffffff') => {
    updateCurrentWristband((wb) => {
      const nextCols = wb.columns.map((col, idx) => {
        if (idx !== colIdx) return col;
        const updatedPlays = (col.plays || []).map((p) => ({
          ...p,
          numberTextColor: color,
        }));
        return {
          ...col,
          numberTextColor: color,
          headerTextColor: color,
          plays: updatedPlays,
        };
      });
      return { ...wb, columns: nextCols };
    });
  };

  // Add Row to Column
  const handleAddRow = () => {
    const currentRows = currentWristband.rowsCount || 13;
    const nextRows = currentRows + 1;
    updateCurrentWristband((wb) => {
      const nextCols = (wb.columns || []).map((col) => {
        const plays = [...(col.plays || [])];
        plays.push({ text: '' });
        return { ...col, plays };
      });
      return { ...wb, rowsCount: nextRows, columns: nextCols };
    });
  };

  // Remove Row from Column
  const handleRemoveRow = () => {
    const currentRows = currentWristband.rowsCount || 13;
    if (currentRows <= 5) return;
    const nextRows = currentRows - 1;
    updateCurrentWristband((wb) => {
      const nextCols = (wb.columns || []).map((col) => {
        const plays = [...(col.plays || [])];
        plays.pop();
        return { ...col, plays };
      });
      return { ...wb, rowsCount: nextRows, columns: nextCols };
    });
  };

  // Clear all plays in current wristband
  const handleClearAllPlays = () => {
    const confirm = window.confirm(
      `Clear all play entries in "${currentWristband.title}"?`
    );
    if (!confirm) return;

    updateCurrentWristband((wb) => {
      const nextCols = (wb.columns || []).map((col) => ({
        ...col,
        plays: (col.plays || []).map(() => ({ text: '' })),
      }));
      return { ...wb, columns: nextCols };
    });
  };

  // Smart Auto-Fill empty slots from database
  const handleAutoFill = () => {
    const confirm = window.confirm(
      `Auto-fill unfilled slots on "${currentWristband.title}" using matching plays from your ${playBankUnit.toUpperCase()} database?`
    );
    if (!confirm) return;

    const availablePlays = playDatabase.filter((p) => p.unit === playBankUnit);
    let playIdx = 0;

    updateCurrentWristband((wb) => {
      const rows = wb.rowsCount || 13;
      const nextCols = (wb.columns || []).map((col, cIdx) => {
        const plays = [...(col.plays || [])];
        for (let r = 0; r < rows; r++) {
          if (!plays[r] || !plays[r].text) {
            if (availablePlays[playIdx]) {
              const matched = availablePlays[playIdx];
              const slotNumber = cIdx * rows + r + 1;
              const colColor = col.numberBgColor || col.color || '#facc15';
              const colText = col.numberTextColor || getContrastTextColor(colColor);
              plays[r] = {
                text: matched.name,
                formation: matched.formation,
                type: matched.type,
                wristbandNum: slotNumber,
                numberHighlightColor: colColor,
                numberTextColor: colText,
              };
              playIdx++;
            }
          }
        }
        return { ...col, plays };
      });
      return { ...wb, columns: nextCols };
    });
  };

  // Print Handlers - Uses isolated clean print engine to preserve DOM and state
  const handlePrint = (mode: 'active' | 'all') => {
    setPrintMode(mode);
    const targetWristbands = mode === 'all' ? wristbands : [currentWristband];
    const docTitle = mode === 'all' ? `${activeTeamName} Wristband Inserts` : `${currentWristband.title}`;
    printWristbandInserts(targetWristbands, activeTeamName, docTitle);
  };

  const handleOpenPrintTab = (mode: 'active' | 'all') => {
    const targetWristbands = mode === 'all' ? wristbands : [currentWristband];
    const docTitle = mode === 'all' ? `${activeTeamName} Wristband Inserts` : `${currentWristband.title}`;
    const html = generateWristbandPrintHTML(targetWristbands, activeTeamName, docTitle);
    openCleanPrintTab(html, docTitle);
  };

  // Current slot being picked via modal
  const activePickerSlotPlay: CallSheetPlay | null = useMemo(() => {
    if (!pickingSlot) return null;
    const col = currentWristband.columns[pickingSlot.colIdx];
    const play = col?.plays[pickingSlot.rowIdx];
    if (!play || !play.text) return null;
    return {
      id: `picked_${play.text}`,
      name: play.text,
      formation: play.formation || '',
      type: (play.type as PlayType) || 'run',
      wristbandNum: play.wristbandNum,
    };
  }, [pickingSlot, currentWristband]);

  // Physical 4.5" x 2.25" Card Cutout Renderer (Used for exact physical printing & live miniature preview)
  const renderPhysicalPrintCard = (wb: SingleWristband, isForPrint: boolean) => {
    const rows = wb.rowsCount || 13;
    const cols = wb.columns || [];

    return (
      <div
        key={`print_${wb.id}`}
        className="wristband-insert-print-box bg-white text-black border-[2px] border-black rounded-none shadow-md overflow-hidden flex flex-col select-none relative mx-auto my-2 print:my-0 print:shadow-none print:break-inside-avoid"
        style={{
          width: '4.5in',
          minWidth: '4.5in',
          maxWidth: '4.5in',
          height: '2.25in',
          minHeight: '2.25in',
          maxHeight: '2.25in',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Top Header Strip */}
        <div className="bg-black text-white text-center font-black py-0.5 px-2 flex items-center justify-between border-b-[1.5px] border-black shrink-0">
          <span className={`text-[10px] tracking-wider truncate uppercase font-mono font-bold ${isForPrint ? 'w-full text-center' : ''}`}>
            {wb.title}
          </span>
          {!isForPrint && (
            <span className="text-[8px] bg-yellow-400 text-black px-1 rounded font-mono font-bold tracking-tight shrink-0 ml-2">
              4.5&quot; &times; 2.25&quot;
            </span>
          )}
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-2 text-center text-[10px] font-black tracking-wider border-b-[1.5px] border-black shrink-0">
          {cols.map((col, cIdx) => {
            const colHighlightColor = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#38bdf8');
            const colHeaderTextColor = col.headerTextColor || getContrastTextColor(colHighlightColor, col.numberTextColor);

            return (
              <div
                key={cIdx}
                className="py-0.5 px-1.5 truncate flex items-center justify-center border-r last:border-r-0 border-black"
                style={{
                  backgroundColor: colHighlightColor,
                  color: colHeaderTextColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <span className="truncate uppercase font-bold text-[9px] font-mono">
                  {col.name || (cIdx === 0 ? `COL 1 (1 - ${rows})` : `COL 2 (${rows + 1} - ${rows * 2})`)}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2-Column High-Density Grid */}
        <div className="grid grid-cols-2 flex-1 divide-x-[1.5px] divide-black overflow-hidden">
          {cols.map((col, cIdx) => {
            const plays = col.plays || [];
            const colHighlightColor = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#38bdf8');

            return (
              <div key={cIdx} className="flex flex-col h-full divide-y divide-black/30">
                {Array.from({ length: rows }).map((_, rIdx) => {
                  const play = plays[rIdx] || { text: '' };
                  const slotLabel = getSlotLabel(wb, cIdx, rIdx, play);
                  const numberBg = play.numberHighlightColor || colHighlightColor;
                  const numberTextColor = play.numberTextColor || col.numberTextColor || getContrastTextColor(numberBg);

                  return (
                    <div
                      key={rIdx}
                      className="flex items-stretch text-[10px] h-[calc(100%/${rows})] leading-none"
                      style={{
                        backgroundColor: play.rowHighlightColor || '#ffffff',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      {/* Number Badge */}
                      <span
                        className="font-mono font-black text-[9px] w-5 min-w-[20px] flex items-center justify-center border-r border-black/50 pr-0.5 select-none shrink-0"
                        style={{
                          backgroundColor: numberBg,
                          color: numberTextColor,
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        }}
                      >
                        {slotLabel}
                      </span>

                      {/* Play Text */}
                      <span className="wristband-print-play-text flex-1 px-1.5 self-center font-mono font-bold uppercase truncate text-[8.5px] text-black">
                        {play.text || '—'}
                      </span>
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
    <div className="h-[calc(100vh-4.5rem)] bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Main Navigation Toolbar (Hidden when printing - matching CallSheetMainView) */}
      <header className="bg-slate-850 border-b border-slate-750 px-3 sm:px-6 py-2.5 shrink-0 shadow-md print:hidden">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left Title & Team Indicator */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white shadow-md bg-gradient-to-br from-indigo-600 to-purple-700">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Wristband Insert Builder</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeTeamName}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
                    4.5&quot; &times; 2.25&quot; Sleeve
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Full-screen builder like Call Sheet &bull; Drag from Play Bank &bull; Exact 4.5&quot; &times; 2.25&quot; print size
                </p>
              </div>
            </div>

            {/* Wristband Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-750 shadow-inner">
              {wristbands.map((wb, idx) => (
                <button
                  key={wb.id}
                  type="button"
                  onClick={() => setActiveWristbandId(wb.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeWristbandId === wb.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Watch className="w-3.5 h-3.5" />
                  <span>{wb.title ? wb.title.split('•')[0].trim() : `Wristband ${idx + 1}`}</span>
                </button>
              ))}

              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    const newIdx = wristbands.length + 1;
                    const rows = currentWristband.rowsCount || 13;
                    const newWb: SingleWristband = {
                      id: `wb_${Date.now()}`,
                      title: `WRISTBAND ${newIdx} • NEW INSERT`,
                      subtitle: `CARDS 1 - 26`,
                      labelingMode: 'same_per_card',
                      rowsCount: rows,
                      columns: [
                        {
                          name: `LEFT COLUMN (1 - ${rows})`,
                          color: '#facc15',
                          numberBgColor: '#facc15',
                          numberTextColor: '#000000',
                          plays: Array.from({ length: rows }, () => ({ text: '' })),
                        },
                        {
                          name: `RIGHT COLUMN (${rows + 1} - ${rows * 2})`,
                          color: '#38bdf8',
                          numberBgColor: '#38bdf8',
                          numberTextColor: '#000000',
                          plays: Array.from({ length: rows }, () => ({ text: '' })),
                        },
                      ],
                    };
                    commitWristbandData({
                      ...normalizedData,
                      wristbands: [...wristbands, newWb],
                      activeWristbandId: newWb.id,
                    });
                    setActiveWristbandId(newWb.id);
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                  title="Add another wristband insert"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Toolbar Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Play Bank Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlayBankOpen(!isPlayBankOpen)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isPlayBankOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-750 hover:text-white'
              }`}
              title="Toggle Play Bank sidebar"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>Play Bank ({playDatabase.length})</span>
            </button>

            {/* Toggle 4.5" x 2.25" Physical Preview */}
            <button
              type="button"
              onClick={() => setShowPhysicalPreview(!showPhysicalPreview)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showPhysicalPreview
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
              }`}
              title="Toggle true-scale 4.5 x 2.25 insert cutout preview"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cutout Preview {showPhysicalPreview ? 'ON' : 'OFF'}</span>
            </button>

            {/* Excel Import Button */}
            <button
              type="button"
              onClick={() => setIsExcelImportOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-emerald-600/50"
              title="Import plays from Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            {/* Smart Auto-Fill Button */}
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Auto-fill empty slots with matching plays"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Auto-Fill</span>
            </button>

            {/* Print Active Insert (Exact 4.5" x 2.25") */}
            <button
              type="button"
              onClick={() => handlePrint('active')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              title="Print active 4.5 x 2.25 insert card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Insert</span>
            </button>

            {/* Print All Inserts */}
            {wristbands.length > 1 && (
              <button
                type="button"
                onClick={() => handlePrint('all')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print all wristband inserts on one sheet"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Print All ({wristbands.length})</span>
              </button>
            )}

            {/* Open Standalone Printable View in New Tab / Save to PDF */}
            <button
              type="button"
              onClick={() => handleOpenPrintTab('active')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open print view in new tab (PDF export / high-res review)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Print Tab</span>
            </button>

            {/* Clear All Plays */}
            <button
              type="button"
              onClick={handleClearAllPlays}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-slate-800 border border-slate-750 transition-colors cursor-pointer"
              title="Clear all plays on this wristband"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area (`flex-1 flex overflow-hidden min-h-0` for independent scrolling) */}
      <div className="wristband-builder-screen flex-1 flex overflow-hidden min-h-0 print:hidden">
        {/* Main interactive builder canvas */}
        <main className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-4 print:p-0 print:overflow-visible overscroll-contain">
          {/* Top Quick Settings Bar */}
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Title Editor */}
            <div className="flex-1 min-w-[260px] flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                Insert Title:
              </span>
              <input
                type="text"
                disabled={userRole !== 'admin'}
                value={currentWristband.title || ''}
                onChange={(e) => updateCurrentWristband((wb) => ({ ...wb, title: e.target.value }))}
                className="flex-1 bg-slate-900 border border-slate-750 text-white font-black px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none uppercase"
                placeholder="e.g. WRISTBAND 1 • 21 SERIES (OFFENSE)"
              />
            </div>

            {/* Rows Per Column Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold whitespace-nowrap">Rows / Column:</span>
              <select
                disabled={userRole !== 'admin'}
                value={currentWristband.rowsCount || 13}
                onChange={(e) => {
                  const rows = parseInt(e.target.value, 10);
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
                }}
                className="bg-slate-900 border border-slate-750 text-white font-bold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={10}>10 Rows (20 Plays)</option>
                <option value={12}>12 Rows (24 Plays)</option>
                <option value={13}>13 Rows (26 Plays - Standard 4.5&quot;)</option>
                <option value={14}>14 Rows (28 Plays)</option>
                <option value={15}>15 Rows (30 Plays)</option>
                <option value={16}>16 Rows (32 Plays)</option>
                <option value={20}>20 Rows (40 Plays)</option>
              </select>
            </div>

            {/* Labeling Scheme */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>Labeling:</span>
              </span>
              <select
                disabled={userRole !== 'admin'}
                value={currentWristband.labelingMode || 'same_per_card'}
                onChange={(e) => {
                  updateCurrentWristband((wb) => ({
                    ...wb,
                    labelingMode: e.target.value as any,
                  }));
                }}
                className="bg-slate-900 border border-slate-750 text-white font-bold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="same_per_card">Same on Each Card (1 - 26)</option>
                <option value="continuous">Continuous Numbers (1 - 52+)</option>
                <option value="letter_num">Letters &amp; Numbers (A1, B1...)</option>
              </select>
            </div>
          </div>

          {/* =========================================================================
              3. WRISTBAND COLUMN TABLES (Auto-Formatting Grid like Call Sheet Sections)
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {currentWristband.columns.map((col, cIdx) => {
              const rows = currentWristband.rowsCount || 13;
              const plays = col.plays || [];
              const colHighlightColor = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#38bdf8');
              const colTextColor = col.numberTextColor || getContrastTextColor(colHighlightColor);
              const filledCount = plays.filter((p) => p && p.text && p.text.trim()).length;

              return (
                <div
                  key={cIdx}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-none shadow-md overflow-hidden flex flex-col"
                >
                  {/* Table Header Bar (Styled with Column Highlight Color) */}
                  <div
                    className="py-2 px-3 font-black text-xs tracking-wider flex items-center justify-between border-b transition-colors select-none"
                    style={{
                      backgroundColor: colHighlightColor,
                      color: colTextColor,
                    }}
                  >
                    {/* Left: Column Title (Editable) */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      {editingColumnHeaderIdx === cIdx ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            autoFocus
                            value={editHeaderTitle}
                            onChange={(e) => setEditHeaderTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const nextCols = currentWristband.columns.map((c, idx) =>
                                  idx === cIdx ? { ...c, name: editHeaderTitle.trim() } : c
                                );
                                updateCurrentWristband((w) => ({ ...w, columns: nextCols }));
                                setEditingColumnHeaderIdx(null);
                              } else if (e.key === 'Escape') {
                                setEditingColumnHeaderIdx(null);
                              }
                            }}
                            onBlur={() => {
                              const nextCols = currentWristband.columns.map((c, idx) =>
                                idx === cIdx ? { ...c, name: editHeaderTitle.trim() } : c
                              );
                              updateCurrentWristband((w) => ({ ...w, columns: nextCols }));
                              setEditingColumnHeaderIdx(null);
                            }}
                            className="w-full bg-white text-black font-black px-2 py-0.5 rounded text-xs uppercase"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1.5 cursor-pointer truncate"
                          onClick={() => {
                            if (userRole !== 'admin') return;
                            setEditHeaderTitle(
                              col.name ||
                                (cIdx === 0
                                  ? `LEFT COLUMN (1 - ${rows})`
                                  : `RIGHT COLUMN (${rows + 1} - ${rows * 2})`)
                            );
                            setEditingColumnHeaderIdx(cIdx);
                          }}
                          title="Click to rename column header"
                        >
                          <span className="truncate uppercase font-black text-sm">
                            {col.name ||
                              (cIdx === 0
                                ? `LEFT COLUMN (1 - ${rows})`
                                : `RIGHT COLUMN (${rows + 1} - ${rows * 2})`)}
                          </span>
                          {userRole === 'admin' && (
                            <Edit2 className="w-3 h-3 opacity-60 hover:opacity-100 shrink-0" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Slot Counter & Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/20 text-current">
                        {filledCount} / {rows}
                      </span>

                      {/* Palette Swatch Trigger */}
                      {userRole === 'admin' && (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenPaletteColIdx(openPaletteColIdx === cIdx ? null : cIdx)
                          }
                          className="p-1 rounded hover:bg-black/15 transition-colors cursor-pointer"
                          title="Change column highlight color"
                        >
                          <Palette className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pop-down Color Palette Swatches Bar */}
                  {openPaletteColIdx === cIdx && userRole === 'admin' && (
                    <div className="bg-slate-950 p-2.5 border-b border-slate-800 space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-bold uppercase tracking-wider">
                          Select Column Highlight:
                        </span>
                        {/* Font Contrast Buttons */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-semibold">Number Font:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleColumnFontColor(currentWristband.id, cIdx, '#000000')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer ${
                              col.numberTextColor === '#000000'
                                ? 'bg-black text-white ring-1 ring-amber-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            BLK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleColumnFontColor(currentWristband.id, cIdx, '#ffffff')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer ${
                              col.numberTextColor === '#ffffff'
                                ? 'bg-white text-black ring-1 ring-indigo-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            WHT
                          </button>
                        </div>
                      </div>

                      {/* Athletic Neons Swatches */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-slate-400 font-semibold w-12">Neons:</span>
                        {ATHLETIC_NEON_PALETTE.map((swatch) => (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => {
                              handleUpdateColumnHighlight(currentWristband.id, cIdx, swatch.bg);
                            }}
                            style={{ backgroundColor: swatch.bg }}
                            className={`w-4 h-4 rounded border border-black/40 hover:scale-125 transition-transform cursor-pointer ${
                              colHighlightColor === swatch.bg ? 'ring-2 ring-indigo-400 scale-110' : ''
                            }`}
                            title={swatch.name}
                          />
                        ))}
                      </div>

                      {/* Soft Pastels */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-slate-400 font-semibold w-12">Pastels:</span>
                        {PASTEL_HIGHLIGHTER_PALETTE.map((swatch) => (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => {
                              handleUpdateColumnHighlight(currentWristband.id, cIdx, swatch.bg);
                            }}
                            style={{ backgroundColor: swatch.bg }}
                            className={`w-4 h-4 rounded border border-black/40 hover:scale-125 transition-transform cursor-pointer ${
                              colHighlightColor === swatch.bg ? 'ring-2 ring-indigo-400 scale-110' : ''
                            }`}
                            title={swatch.name}
                          />
                        ))}
                      </div>

                      {/* Classic Team Colors */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-slate-400 font-semibold w-12">Classic:</span>
                        {CLASSIC_TEAM_PALETTE.map((swatch) => (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => {
                              handleUpdateColumnHighlight(currentWristband.id, cIdx, swatch.bg);
                            }}
                            style={{ backgroundColor: swatch.bg }}
                            className={`w-4 h-4 rounded border border-black/40 hover:scale-125 transition-transform cursor-pointer ${
                              colHighlightColor === swatch.bg ? 'ring-2 ring-indigo-400 scale-110' : ''
                            }`}
                            title={swatch.name}
                          />
                        ))}
                        <input
                          type="color"
                          value={colHighlightColor}
                          onChange={(e) =>
                            handleUpdateColumnHighlight(currentWristband.id, cIdx, e.target.value)
                          }
                          className="w-4 h-4 rounded cursor-pointer border border-black/40 p-0 ml-1"
                          title="Custom Color"
                        />
                      </div>
                    </div>
                  )}

                  {/* Table Rows (Spacious, comfortable ~36px height like CallSheetCellView) */}
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {Array.from({ length: rows }).map((_, rIdx) => {
                      const play = plays[rIdx] || { text: '' };
                      const slotLabel = getSlotLabel(currentWristband, cIdx, rIdx, play);
                      const isInline =
                        inlineEditingSlot?.wbId === currentWristband.id &&
                        inlineEditingSlot?.colIdx === cIdx &&
                        inlineEditingSlot?.rowIdx === rIdx;

                      const numberBg = play.numberHighlightColor || colHighlightColor;
                      const numberTextColor =
                        play.numberTextColor || col.numberTextColor || getContrastTextColor(numberBg);
                      const isFilled = Boolean(play.text && play.text.trim());

                      const isDragOver = dragOverSlot?.colIdx === cIdx && dragOverSlot?.rowIdx === rIdx;

                      return (
                        <div
                          key={rIdx}
                          draggable={!isInline && isFilled}
                          onDragStart={(e) => {
                            const playData: CallSheetPlay = {
                              id: `wb_slot_${cIdx}_${rIdx}_${Date.now()}`,
                              name: play.text,
                              formation: play.formation,
                              type: play.type as PlayType,
                              wristbandNum: slotLabel,
                              wristbandColor: numberBg,
                              wristbandNumberColor: numberBg,
                              wristbandTextColor: numberTextColor,
                              wristbandRowColor: play.rowHighlightColor,
                            };
                            const jsonStr = safeJSONStringify(playData);
                            try {
                              e.dataTransfer.setData('application/json', jsonStr);
                              e.dataTransfer.setData('callSheetPlayTransfer', jsonStr);
                              e.dataTransfer.setData('text/plain', play.text);
                            } catch {}
                            e.dataTransfer.effectAllowed = 'copyMove';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                            if (dragOverSlot?.colIdx !== cIdx || dragOverSlot?.rowIdx !== rIdx) {
                              setDragOverSlot({ colIdx: cIdx, rowIdx: rIdx });
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverSlot?.colIdx === cIdx && dragOverSlot?.rowIdx === rIdx) {
                              setDragOverSlot(null);
                            }
                          }}
                          onDrop={(e) => {
                            setDragOverSlot(null);
                            handleDropOnSlot(e, currentWristband.id, cIdx, rIdx);
                          }}
                          onClick={() => {
                            if (isInline) return;
                            // Single click opens PlayPickerModal (same as Call Sheet!)
                            setPickingSlot({ wbId: currentWristband.id, colIdx: cIdx, rowIdx: rIdx });
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            // Double click allows quick typing
                            setInlineEditingSlot({ wbId: currentWristband.id, colIdx: cIdx, rowIdx: rIdx });
                            setInlineTextValue(play.text || '');
                          }}
                          style={{
                            backgroundColor: play.rowHighlightColor ? play.rowHighlightColor : undefined,
                          }}
                          className={`flex items-center min-h-[38px] px-2.5 py-1.5 text-xs transition-all group select-none relative ${
                            isDragOver
                              ? 'bg-indigo-100 dark:bg-indigo-950/70 ring-2 ring-indigo-500 border-indigo-400 z-10 scale-[1.01]'
                              : isInline
                              ? 'ring-2 ring-amber-500 z-10 bg-amber-50/20'
                              : play.rowHighlightColor
                              ? ''
                              : rIdx % 2 === 0
                              ? 'bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30'
                              : 'bg-white dark:bg-slate-900 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30'
                          } ${isFilled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                          title={`Slot #${slotLabel}: Click to open Play Picker, drag from Play Bank, or double-click to type`}
                        >
                          {/* Large, Crisp Slot Number Badge */}
                          <span
                            className="font-mono font-black text-xs min-w-[28px] h-6 px-1.5 rounded flex items-center justify-center mr-2.5 shadow-2xs shrink-0 select-none"
                            style={{
                              backgroundColor: numberBg,
                              color: numberTextColor,
                            }}
                          >
                            {slotLabel}
                          </span>

                          {/* Play Details or Empty Slot Placeholder */}
                          {isInline ? (
                            <div
                              className="flex-1 flex items-center min-w-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                autoFocus
                                value={inlineTextValue}
                                onChange={(e) => setInlineTextValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAssignPlayToSlot(
                                      currentWristband.id,
                                      cIdx,
                                      rIdx,
                                      inlineTextValue
                                    );
                                    setInlineEditingSlot(null);
                                  } else if (e.key === 'Escape') {
                                    setInlineEditingSlot(null);
                                  }
                                }}
                                onBlur={() => {
                                  handleAssignPlayToSlot(
                                    currentWristband.id,
                                    cIdx,
                                    rIdx,
                                    inlineTextValue
                                  );
                                  setInlineEditingSlot(null);
                                }}
                                placeholder="Type play name..."
                                className="w-full bg-amber-50 dark:bg-amber-950/40 border border-amber-500 rounded-lg px-2 py-1 text-xs font-black text-slate-900 dark:text-amber-100 tracking-tight font-mono focus:outline-none uppercase"
                              />
                            </div>
                          ) : isFilled ? (
                            <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-black text-xs text-slate-900 dark:text-slate-100 uppercase tracking-tight truncate">
                                  {play.text}
                                </span>
                                {play.formation && (
                                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase shrink-0">
                                    {play.formation}
                                  </span>
                                )}
                                {play.type && PLAY_TYPE_BADGES[play.type] && (
                                  <span
                                    className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase shrink-0 ${
                                      PLAY_TYPE_BADGES[play.type].bg
                                    }`}
                                  >
                                    {PLAY_TYPE_BADGES[play.type].text}
                                  </span>
                                )}
                              </div>

                              {/* Quick Clear Button on Hover */}
                              {userRole === 'admin' && (
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearSlot(currentWristband.id, cIdx, rIdx);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                                    title="Clear slot"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-between text-slate-400 dark:text-slate-500 italic text-[11px]">
                              <span>+ Click to select play or drag from Play Bank</span>
                              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 not-italic">
                                Select
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Table Footer Controls */}
                  {userRole === 'admin' && (
                    <div className="bg-slate-100 dark:bg-slate-950/80 px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Add row to wristband"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Row</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveRow}
                          disabled={rows <= 5}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                          title="Remove row from wristband"
                        >
                          <Minus className="w-3 h-3" />
                          <span>Row</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const confirm = window.confirm(
                            `Clear all plays in ${col.name || `Column ${cIdx + 1}`}?`
                          );
                          if (!confirm) return;
                          updateCurrentWristband((wb) => {
                            const nextCols = [...wb.columns];
                            nextCols[cIdx] = {
                              ...nextCols[cIdx],
                              plays: (nextCols[cIdx].plays || []).map(() => ({ text: '' })),
                            };
                            return { ...wb, columns: nextCols };
                          });
                        }}
                        className="text-[10px] text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                      >
                        Clear Column
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              4. PHYSICAL 4.5" x 2.25" INSERT PREVIEW CARD (Toggleable/Display Section)
              ========================================================================= */}
          {showPhysicalPreview && (
            <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-750">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Physical Insert Preview (4.5&quot; &times; 2.25&quot; Standard Sleeve Size)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    Exact 1:1 scale preview of how it prints for your quarterback wrist sleeve
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhysicalPreview(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Centered Miniature Mockup with Cut Line Guide */}
              <div className="p-4 bg-slate-900 rounded-xl flex flex-col items-center justify-center overflow-x-auto">
                <div className="p-2 border-2 border-dashed border-slate-500 bg-slate-950/60 rounded flex flex-col items-center">
                  <div className="text-[9px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-slate-400" />
                    <span>Cut Along Dashed Border (4.5&quot; &times; 2.25&quot;)</span>
                  </div>
                  {renderPhysicalPrintCard(currentWristband, false)}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 5. Docked Play Bank Sidebar (Right side, identical to Call Sheet Maker!) */}
        <PlayBankSidebar
          unit={playBankUnit}
          plays={playDatabase}
          wristbandData={normalizedData}
          isOpen={isPlayBankOpen}
          onToggleOpen={() => setIsPlayBankOpen(!isPlayBankOpen)}
          onAddCustomPlay={() => {
            // Find first empty slot to pick play or open picker
            setPickingSlot({ wbId: currentWristband.id, colIdx: 0, rowIdx: 0 });
          }}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
          onDeletePlay={(playId) => {
            if (onUpdatePlayDatabase) {
              const next = playDatabase.filter((p) => p.id !== playId);
              onUpdatePlayDatabase(next);
            }
          }}
          onDeleteMultiplePlays={(playIds) => {
            if (onUpdatePlayDatabase) {
              const idSet = new Set(playIds);
              const next = playDatabase.filter((p) => !idSet.has(p.id));
              onUpdatePlayDatabase(next);
            }
          }}
        />
      </div>

      {/* =========================================================================
          6. PLAY PICKER MODAL (Exact same modal as Call Sheet Maker)
          ========================================================================= */}
      {pickingSlot && (
        <PlayPickerModal
          isOpen={Boolean(pickingSlot)}
          onClose={() => setPickingSlot(null)}
          sectionTitle={
            currentWristband.columns[pickingSlot.colIdx]?.name ||
            (pickingSlot.colIdx === 0 ? 'Left Column' : 'Right Column')
          }
          unit={playBankUnit}
          slotIndex={pickingSlot.rowIdx}
          currentPlay={activePickerSlotPlay}
          databasePlays={playDatabase}
          wristbandData={normalizedData}
          onSelectPlay={(selectedPlay) => {
            if (pickingSlot) {
              handleAssignPlayToSlot(
                pickingSlot.wbId,
                pickingSlot.colIdx,
                pickingSlot.rowIdx,
                selectedPlay
              );
            }
            setPickingSlot(null);
          }}
          onClearSlot={() => {
            if (pickingSlot) {
              handleClearSlot(pickingSlot.wbId, pickingSlot.colIdx, pickingSlot.rowIdx);
            }
            setPickingSlot(null);
          }}
          onAddCustomToDatabase={(newEntry) => {
            if (onUpdatePlayDatabase) {
              onUpdatePlayDatabase([newEntry, ...playDatabase]);
            }
          }}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
        />
      )}

      {/* =========================================================================
          7. EXCEL PLAY IMPORT MODAL
          ========================================================================= */}
      {isExcelImportOpen && (
        <ExcelPlayImportModal
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          defaultUnit={playBankUnit}
          existingPlaysCount={playDatabase.length}
          onImportPlays={(newPlays, mode) => {
            let nextDb: PlayDatabaseEntry[] = [];
            if (mode === 'replace') {
              nextDb = newPlays;
            } else {
              const existingFiltered = playDatabase.filter(
                (ep) => !newPlays.some((ip) => ip.name.toLowerCase() === ep.name.toLowerCase() && ip.unit === ep.unit)
              );
              nextDb = [...newPlays, ...existingFiltered];
            }
            if (onUpdatePlayDatabase) {
              onUpdatePlayDatabase(nextDb);
            }
            safeJSONSet('footballPlayDatabase', nextDb);
            setIsExcelImportOpen(false);
          }}
        />
      )}

      {/* =========================================================================
          8. DEDICATED PRINT CONTAINER - ONLY CUTOUTS SPACED OUT
          ========================================================================= */}
      <div
        id="wristband-print-section"
        className="hidden print:block print:w-full print:m-0 print:p-0 bg-white text-black"
      >
        <div className="wristband-print-page w-full bg-white flex flex-col items-center">
          <div className="flex flex-col items-center gap-12 print:gap-14 w-full">
            {(printMode === 'all' ? wristbands : [currentWristband]).map((wb) => (
              <div
                key={`cutout_${wb.id}`}
                className="wristband-cutout-item print:break-inside-avoid mx-auto relative"
                style={{
                  width: '4.5in',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  boxSizing: 'content-box',
                }}
              >
                {/* Thin dashed cut guideline marking the exact 4.5" x 2.25" wrist sleeve insert */}
                <div
                  className="border-[1.5px] border-dashed border-black bg-white"
                  style={{
                    boxSizing: 'content-box',
                  }}
                >
                  {renderPhysicalPrintCard(wb, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
