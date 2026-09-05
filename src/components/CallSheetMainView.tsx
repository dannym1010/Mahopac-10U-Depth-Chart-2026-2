import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Printer,
  Sparkles,
  RotateCcw,
  Smartphone,
  Monitor,
  Swords,
  Shield,
  BookOpen,
  Plus,
  Zap,
  LayoutGrid,
  Columns,
  FileSpreadsheet,
  BookmarkCheck,
} from 'lucide-react';
import {
  CallSheetFullData,
  CallSheetSection,
  CallSheetPlay,
  PlayDatabaseEntry,
  TimeoutsState,
  TwoPointRule,
} from '../types/callSheet';
import {
  DEFAULT_CALL_SHEET_DATA,
  MASTER_PLAY_DATABASE,
  DEFAULT_OFFENSE_SECTIONS,
  DEFAULT_DEFENSE_SECTIONS,
} from '../data/callSheetData';
import { WristbandData } from '../types';
import { INITIAL_TWO_WRISTBANDS_DATA } from '../data/userGameDayPlays';
import { safeJSONParse, safeJSONSet, safeJSONStringify } from '../services/storageService';
import { syncWristbandToCallSheet } from '../utils/wristbandLinking';
import { ComputerCallSheetView } from './callSheet/ComputerCallSheetView';
import { MobileCallSheetView } from './callSheet/MobileCallSheetView';
import { PlayPickerModal } from './callSheet/PlayPickerModal';
import { PlayBankSidebar } from './callSheet/PlayBankSidebar';
import { ExcelPlayImportModal } from './callSheet/ExcelPlayImportModal';
import { AddTableModal } from './callSheet/AddTableModal';

interface CallSheetMainViewProps {
  activeTeamName?: string;
  masterPlayLibrary?: string[];
  onUpdateMasterPlayLibrary?: (plays: string[]) => void;
  playDatabase?: PlayDatabaseEntry[];
  onUpdatePlayDatabase?: (plays: PlayDatabaseEntry[]) => void;
  callSheetData?: CallSheetFullData;
  onUpdateCallSheetData?: (data: CallSheetFullData) => void;
  deletedPlayIds?: string[];
  onUpdateDeletedPlayIds?: (ids: string[]) => void;
  wristbandData?: WristbandData;
}

export const CallSheetMainView: React.FC<CallSheetMainViewProps> = ({
  activeTeamName = 'Mahopac 10U',
  masterPlayLibrary = [],
  onUpdateMasterPlayLibrary,
  playDatabase: propPlayDatabase,
  onUpdatePlayDatabase,
  callSheetData: propCallSheetData,
  onUpdateCallSheetData,
  deletedPlayIds: propDeletedPlayIds,
  onUpdateDeletedPlayIds,
  wristbandData: propWristbandData,
}) => {
  // Permanently deleted play IDs tracking (guarantees deleted plays never reappear on refresh)
  const [deletedPlayIds, setDeletedPlayIds] = useState<string[]>(() => {
    if (propDeletedPlayIds && Array.isArray(propDeletedPlayIds)) {
      return propDeletedPlayIds;
    }
    return safeJSONParse<string[]>('footballDeletedPlayIds', []);
  });

  // Call sheet state with localStorage & remote sync
  const [callSheetData, setCallSheetData] = useState<CallSheetFullData>(() => {
    if (propCallSheetData && propCallSheetData.offenseSections && propCallSheetData.defenseSections) {
      return propCallSheetData;
    }
    const saved = safeJSONParse<CallSheetFullData | null>('footballCallSheetData', null);
    if (saved && saved.offenseSections && saved.defenseSections) {
      return saved;
    }
    return DEFAULT_CALL_SHEET_DATA;
  });

  // Play database state with persistent deleted ID filtering
  const [playDatabase, setPlayDatabase] = useState<PlayDatabaseEntry[]>(() => {
    const savedDeleted = safeJSONParse<string[]>('footballDeletedPlayIds', []);
    const deletedSet = new Set([...(propDeletedPlayIds || []), ...savedDeleted]);

    if (propPlayDatabase && Array.isArray(propPlayDatabase)) {
      return propPlayDatabase.filter((p) => !deletedSet.has(p.id));
    }
    const hasBeenInitialized = localStorage.getItem('footballPlayDatabaseInitialized');
    const saved = safeJSONParse<PlayDatabaseEntry[] | null>('footballPlayDatabase', null);
    if (hasBeenInitialized && Array.isArray(saved)) {
      return saved.filter((p) => !deletedSet.has(p.id));
    }
    if (saved && Array.isArray(saved)) {
      localStorage.setItem('footballPlayDatabaseInitialized', 'true');
      return saved.filter((p) => !deletedSet.has(p.id));
    }
    localStorage.setItem('footballPlayDatabaseInitialized', 'true');
    return MASTER_PLAY_DATABASE.filter((p) => !deletedSet.has(p.id));
  });

  // Safeguard refs to prevent infinite render loops between prop sync and state updates
  const lastEmittedCallSheetJson = useRef<string>('');
  const lastEmittedPlayDbJson = useRef<string>('');

  // Sync state if parent props update from server or Firestore
  useEffect(() => {
    if (propPlayDatabase && Array.isArray(propPlayDatabase)) {
      const deletedSet = new Set(deletedPlayIds);
      const filtered = propPlayDatabase.filter((p) => !deletedSet.has(p.id));
      const filteredJson = safeJSONStringify(filtered);
      if (filteredJson !== lastEmittedPlayDbJson.current) {
        lastEmittedPlayDbJson.current = filteredJson;
        setPlayDatabase(filtered);
      }
    }
  }, [propPlayDatabase, deletedPlayIds]);

  useEffect(() => {
    if (propCallSheetData && propCallSheetData.offenseSections) {
      const incomingJson = safeJSONStringify(propCallSheetData);
      if (incomingJson !== lastEmittedCallSheetJson.current) {
        lastEmittedCallSheetJson.current = incomingJson;
        setCallSheetData((prev) => {
          // If local state has newly added sections that incoming is missing, preserve local sections
          if (
            prev.offenseSections &&
            propCallSheetData.offenseSections &&
            prev.offenseSections.length > propCallSheetData.offenseSections.length
          ) {
            return prev;
          }
          return propCallSheetData;
        });
      }
    }
  }, [propCallSheetData]);

  // Re-sync call sheet tables whenever wristband data changes
  useEffect(() => {
    if (propWristbandData) {
      setCallSheetData((prev) => {
        const synced = syncWristbandToCallSheet(propWristbandData, prev, playDatabase);
        const syncedJson = safeJSONStringify(synced);
        const prevJson = safeJSONStringify(prev);
        if (syncedJson !== prevJson) {
          lastEmittedCallSheetJson.current = syncedJson;
          safeJSONSet('footballCallSheetData', synced);
          if (onUpdateCallSheetData) {
            onUpdateCallSheetData(synced);
          }
          return synced;
        }
        return prev;
      });
    }
  }, [propWristbandData, playDatabase, onUpdateCallSheetData]);

  useEffect(() => {
    if (propDeletedPlayIds && Array.isArray(propDeletedPlayIds)) {
      setDeletedPlayIds(propDeletedPlayIds);
    }
  }, [propDeletedPlayIds]);

  // UI state
  const [activeUnit, setActiveUnit] = useState<'offense' | 'defense'>('offense');
  const [viewDevice, setViewDevice] = useState<'computer' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'computer';
  });
  const [highlightRedZone, setHighlightRedZone] = useState(true);
  // Normalize wristband data
  const normalizedWristbandData: WristbandData = useMemo(() => {
    if (propWristbandData?.wristbands && propWristbandData.wristbands.length > 0) {
      return propWristbandData;
    }
    const saved = safeJSONParse<WristbandData | null>('footballWristbandData', null);
    if (saved?.wristbands && saved.wristbands.length > 0) {
      return saved;
    }
    return INITIAL_TWO_WRISTBANDS_DATA;
  }, [propWristbandData]);

  // Default to showing the Play Bank on computer view as requested by user
  const [isPlayBankOpen, setIsPlayBankOpen] = useState(true);
  const [gridColumns, setGridColumns] = useState<number>(() => {
    return callSheetData.desktopGridColumns || 4;
  });
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [addTableModalState, setAddTableModalState] = useState<{
    isOpen: boolean;
    group: 'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom';
    initialTab?: 'wristband' | 'custom';
    targetRowIndex?: number;
  }>({
    isOpen: false,
    group: 'top_situations',
    initialTab: 'wristband',
  });

  // Play Picker Modal state
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    sectionId: string;
    sectionTitle: string;
    slotIndex: number;
    currentPlay: CallSheetPlay | null;
  }>({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    slotIndex: 0,
    currentPlay: null,
  });

  // Sync to localStorage and parent remote sync only when local state actually changes
  useEffect(() => {
    const currentJson = safeJSONStringify(callSheetData);
    if (currentJson !== lastEmittedCallSheetJson.current) {
      lastEmittedCallSheetJson.current = currentJson;
      safeJSONSet('footballCallSheetData', callSheetData);
      if (onUpdateCallSheetData) {
        onUpdateCallSheetData(callSheetData);
      }
    }
  }, [callSheetData, onUpdateCallSheetData]);

  useEffect(() => {
    const currentJson = safeJSONStringify(playDatabase);
    if (currentJson !== lastEmittedPlayDbJson.current) {
      lastEmittedPlayDbJson.current = currentJson;
      safeJSONSet('footballPlayDatabase', playDatabase);
      if (onUpdatePlayDatabase) {
        onUpdatePlayDatabase(playDatabase);
      }
    }
  }, [playDatabase, onUpdatePlayDatabase]);

  // Handle slot click to directly edit/pick play
  const handleSlotClick = (sectionId: string, slotIndex: number) => {
    let title = 'Scripted Play';
    let currentPlay: CallSheetPlay | null = null;

    if (sectionId === 'script') {
      title = activeUnit === 'offense' ? 'Offensive Opening Script' : 'Defensive Opening Script';
      currentPlay =
        activeUnit === 'offense'
          ? callSheetData.offenseScript[slotIndex]
          : callSheetData.defenseScript[slotIndex];
    } else {
      const sections =
        activeUnit === 'offense'
          ? callSheetData.offenseSections
          : callSheetData.defenseSections;
      const sec = sections.find((s) => s.id === sectionId);
      if (sec) {
        title = sec.title;
        currentPlay = sec.plays[slotIndex] || null;
      }
    }

    setPickerState({
      isOpen: true,
      sectionId,
      sectionTitle: title,
      slotIndex,
      currentPlay,
    });
  };

  // Handle assigning play from picker or drag-and-drop
  const handleAssignPlayToSlot = (
    sectionId: string,
    slotIndex: number,
    play: CallSheetPlay
  ) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      if (sectionId === 'script') {
        if (activeUnit === 'offense') {
          const arr = [...next.offenseScript];
          arr[slotIndex] = play;
          next.offenseScript = arr;
        } else {
          const arr = [...next.defenseScript];
          arr[slotIndex] = play;
          next.defenseScript = arr;
        }
      } else {
        const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
        const sections = [...next[sectionsKey]];
        const secIndex = sections.findIndex((s) => s.id === sectionId);
        if (secIndex >= 0) {
          const sec = { ...sections[secIndex] };
          const plays = [...sec.plays];
          plays[slotIndex] = play;
          sec.plays = plays;
          sections[secIndex] = sec;
          next[sectionsKey] = sections;
        }
      }
      return next;
    });
  };

  // Handle clearing a slot
  const handleClearSlot = (sectionId: string, slotIndex: number) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      if (sectionId === 'script') {
        if (activeUnit === 'offense') {
          const arr = [...next.offenseScript];
          arr[slotIndex] = null;
          next.offenseScript = arr;
        } else {
          const arr = [...next.defenseScript];
          arr[slotIndex] = null;
          next.defenseScript = arr;
        }
      } else {
        const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
        const sections = [...next[sectionsKey]];
        const secIndex = sections.findIndex((s) => s.id === sectionId);
        if (secIndex >= 0) {
          const sec = { ...sections[secIndex] };
          const plays = [...sec.plays];
          plays[slotIndex] = null;
          sec.plays = plays;
          sections[secIndex] = sec;
          next[sectionsKey] = sections;
        }
      }
      return next;
    });
  };

  // Handle section update (renaming, changing color, slot counts, column count, highlight)
  const handleUpdateSection = (updatedSection: CallSheetSection) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
      const sections = [...next[sectionsKey]];
      const secIndex = sections.findIndex((s) => s.id === updatedSection.id);
      if (secIndex >= 0) {
        sections[secIndex] = updatedSection;
        next[sectionsKey] = sections;
      }
      return next;
    });
  };

  // Handle deleting ANY section
  const handleDeleteSection = (sectionId: string) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
      next[sectionsKey] = next[sectionsKey].filter((s) => s.id !== sectionId);
      return next;
    });
  };

  // Handle adding a new section table via modal
  const handleAddSection = (
    group: 'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom' = 'top_situations',
    initialTab: 'wristband' | 'custom' = 'wristband',
    targetRowIndex?: number
  ) => {
    setAddTableModalState({
      isOpen: true,
      group,
      initialTab,
      targetRowIndex,
    });
  };

  const handleConfirmAddSections = (newSections: CallSheetSection[]) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
      const targetRow = addTableModalState.targetRowIndex;
      const preparedSections = newSections.map((s) => ({
        ...s,
        rowIndex: targetRow !== undefined ? targetRow : s.rowIndex,
      }));
      next[sectionsKey] = [...next[sectionsKey], ...preparedSections];
      return next;
    });
  };

  const handleConfirmAddSection = (newSection: CallSheetSection) => {
    handleConfirmAddSections([newSection]);
  };

  // Handle reordering entire sections list (drag and drop situational rearranging)
  const handleReorderSections = (reorderedSections: CallSheetSection[]) => {
    setCallSheetData((prev) => {
      const next = { ...prev };
      const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
      next[sectionsKey] = reorderedSections;
      return next;
    });
  };

  // Grid layout columns changer
  const handleChangeGridColumns = (cols: number) => {
    setGridColumns(cols);
    setCallSheetData((prev) => ({
      ...prev,
      desktopGridColumns: cols,
    }));
  };

  // Scripts Table Handlers
  const handleAddScriptRow = () => {
    setCallSheetData((prev) => {
      const key = activeUnit === 'offense' ? 'offenseScript' : 'defenseScript';
      return { ...prev, [key]: [...prev[key], null] };
    });
  };

  const handleRemoveScriptRow = () => {
    setCallSheetData((prev) => {
      const key = activeUnit === 'offense' ? 'offenseScript' : 'defenseScript';
      if (prev[key].length <= 1) return prev;
      return { ...prev, [key]: prev[key].slice(0, prev[key].length - 1) };
    });
  };

  const handleToggleScriptColumns = (cols: number) => {
    setCallSheetData((prev) => ({
      ...prev,
      scriptColumnsCount: cols,
    }));
  };

  const handleToggleScriptHighlight = () => {
    setCallSheetData((prev) => ({
      ...prev,
      scriptHighlightEnabled: !prev.scriptHighlightEnabled,
    }));
  };

  // 2-Point Table Handlers
  const handleUpdateTwoPointRules = (rules: TwoPointRule[]) => {
    setCallSheetData((prev) => ({
      ...prev,
      twoPointRules: rules,
    }));
  };

  const handleToggleTwoPointHighlight = () => {
    setCallSheetData((prev) => ({
      ...prev,
      twoPointHighlightEnabled: !(prev.twoPointHighlightEnabled ?? true),
    }));
  };

  // Timeouts Table Handlers
  const handleToggleTimeoutsHighlight = () => {
    setCallSheetData((prev) => ({
      ...prev,
      timeoutsHighlightEnabled: !prev.timeoutsHighlightEnabled,
    }));
  };

  const handleChangeTimeoutsCount = (cnt: number) => {
    setCallSheetData((prev) => ({
      ...prev,
      timeoutsCount: cnt,
    }));
  };

  // Add custom play to database
  const handleAddCustomToDatabase = (newPlay: PlayDatabaseEntry) => {
    setPlayDatabase((prev) => {
      const next = [newPlay, ...prev];
      safeJSONSet('footballPlayDatabase', next);
      if (onUpdatePlayDatabase) onUpdatePlayDatabase(next);
      return next;
    });

    // If this play ID was previously marked deleted, un-delete it
    if (deletedPlayIds.includes(newPlay.id)) {
      const nextDeleted = deletedPlayIds.filter((id) => id !== newPlay.id);
      setDeletedPlayIds(nextDeleted);
      safeJSONSet('footballDeletedPlayIds', nextDeleted);
      if (onUpdateDeletedPlayIds) onUpdateDeletedPlayIds(nextDeleted);
    }
  };

  // Delete play from database (offensive or defensive play bank)
  const handleDeletePlayFromDatabase = (playId: string) => {
    const playToDelete = playDatabase.find((p) => p.id === playId);
    const next = playDatabase.filter((p) => p.id !== playId);
    setPlayDatabase(next);
    safeJSONSet('footballPlayDatabase', next);
    if (onUpdatePlayDatabase) onUpdatePlayDatabase(next);

    // Track permanently in deletedPlayIds so it never returns on refresh
    const nextDeleted = Array.from(new Set([...deletedPlayIds, playId]));
    setDeletedPlayIds(nextDeleted);
    safeJSONSet('footballDeletedPlayIds', nextDeleted);
    if (onUpdateDeletedPlayIds) onUpdateDeletedPlayIds(nextDeleted);

    // Remove play name from master library if present
    if (playToDelete && playToDelete.name) {
      const playNameLower = playToDelete.name.toLowerCase().trim();
      const currentMaster = masterPlayLibrary.length > 0
        ? masterPlayLibrary
        : (safeJSONParse<string[]>('footballMasterPlays', []) || []);
      const nextMaster = currentMaster.filter(
        (name) => name.toLowerCase().trim() !== playNameLower
      );
      safeJSONSet('footballMasterPlays', nextMaster);
      if (onUpdateMasterPlayLibrary) onUpdateMasterPlayLibrary(nextMaster);
    }
  };

  // Batch delete plays from database
  const handleDeleteMultiplePlaysFromDatabase = (playIds: string[]) => {
    if (!playIds || playIds.length === 0) return;
    const idSet = new Set(playIds);
    const playsToDelete = playDatabase.filter((p) => idSet.has(p.id));
    const next = playDatabase.filter((p) => !idSet.has(p.id));
    setPlayDatabase(next);
    safeJSONSet('footballPlayDatabase', next);
    if (onUpdatePlayDatabase) onUpdatePlayDatabase(next);

    // Track permanently in deletedPlayIds so they never return on refresh
    const nextDeleted = Array.from(new Set([...deletedPlayIds, ...playIds]));
    setDeletedPlayIds(nextDeleted);
    safeJSONSet('footballDeletedPlayIds', nextDeleted);
    if (onUpdateDeletedPlayIds) onUpdateDeletedPlayIds(nextDeleted);

    // Remove play names from master library if present
    const namesToDelete = new Set(playsToDelete.map((p) => p.name.toLowerCase().trim()));
    const currentMaster = masterPlayLibrary.length > 0
      ? masterPlayLibrary
      : (safeJSONParse<string[]>('footballMasterPlays', []) || []);
    const nextMaster = currentMaster.filter(
      (name) => !namesToDelete.has(name.toLowerCase().trim())
    );
    safeJSONSet('footballMasterPlays', nextMaster);
    if (onUpdateMasterPlayLibrary) onUpdateMasterPlayLibrary(nextMaster);
  };

  // Reset active unit play bank to defaults
  const handleResetPlayDatabase = () => {
    const confirm = window.confirm(
      `Reset ${activeUnit.toUpperCase()} play bank to system defaults? Any custom deletions in this unit will be restored.`
    );
    if (!confirm) return;

    setPlayDatabase((prev) => {
      const otherPlays = prev.filter((p) => p.unit !== activeUnit);
      const defaultUnitPlays = MASTER_PLAY_DATABASE.filter((p) => p.unit === activeUnit);
      const next = [...defaultUnitPlays, ...otherPlays];
      safeJSONSet('footballPlayDatabase', next);
      if (onUpdatePlayDatabase) onUpdatePlayDatabase(next);
      return next;
    });

    const defaultUnitPlayIds = new Set(
      MASTER_PLAY_DATABASE.filter((p) => p.unit === activeUnit).map((p) => p.id)
    );
    const nextDeleted = deletedPlayIds.filter((id) => !defaultUnitPlayIds.has(id));
    setDeletedPlayIds(nextDeleted);
    safeJSONSet('footballDeletedPlayIds', nextDeleted);
    if (onUpdateDeletedPlayIds) onUpdateDeletedPlayIds(nextDeleted);
  };

  // Import plays from Excel into database and master play library
  const handleImportPlays = (importedPlays: PlayDatabaseEntry[], mode: 'append' | 'replace') => {
    let nextDb: PlayDatabaseEntry[] = [];
    if (mode === 'replace') {
      nextDb = importedPlays;
    } else {
      // Append: new plays take precedence, keeping non-duplicates
      const existingFiltered = playDatabase.filter(
        (ep) => !importedPlays.some((ip) => ip.name.toLowerCase() === ep.name.toLowerCase() && ip.unit === ep.unit)
      );
      nextDb = [...importedPlays, ...existingFiltered];
    }

    setPlayDatabase(nextDb);
    safeJSONSet('footballPlayDatabase', nextDb);
    if (onUpdatePlayDatabase) onUpdatePlayDatabase(nextDb);

    // Un-mark any imported play IDs from deletedPlayIds
    const importedIds = new Set(importedPlays.map((p) => p.id));
    const nextDeleted = deletedPlayIds.filter((id) => !importedIds.has(id));
    setDeletedPlayIds(nextDeleted);
    safeJSONSet('footballDeletedPlayIds', nextDeleted);
    if (onUpdateDeletedPlayIds) onUpdateDeletedPlayIds(nextDeleted);

    // Sync play names to Master Play Library for Wristband view and Sidebar
    const newPlayNames = importedPlays.map((p) => p.name);
    const currentMaster = safeJSONParse<string[]>('footballMasterPlays', []) || [];
    let nextMaster: string[] = [];
    if (mode === 'replace') {
      nextMaster = Array.from(new Set(newPlayNames));
    } else {
      nextMaster = Array.from(new Set([...currentMaster, ...newPlayNames]));
    }
    safeJSONSet('footballMasterPlays', nextMaster);
    if (onUpdateMasterPlayLibrary) {
      onUpdateMasterPlayLibrary(nextMaster);
    }
  };

  // Smart auto-fill empty slots
  const handleAutoFill = () => {
    const confirm = window.confirm(
      `Auto-fill unfilled slots on the ${activeUnit.toUpperCase()} call sheet from matching plays in your database?`
    );
    if (!confirm) return;

    setCallSheetData((prev) => {
      const next = { ...prev };
      const sectionsKey = activeUnit === 'offense' ? 'offenseSections' : 'defenseSections';
      const sections = next[sectionsKey].map((sec) => {
        const newPlays = [...sec.plays];
        const matchingDb = playDatabase.filter(
          (p) =>
            p.unit === activeUnit &&
            p.situations.some(
              (sit) =>
                sec.title.toLowerCase().includes(sit.toLowerCase()) ||
                sit.toLowerCase().includes(sec.title.toLowerCase())
            )
        );

        let matchIdx = 0;
        for (let i = 0; i < sec.slotsCount; i++) {
          if (!newPlays[i] && matchingDb[matchIdx]) {
            const dbP = matchingDb[matchIdx];
            newPlays[i] = {
              id: `auto_${Date.now()}_${i}_${Math.random()}`,
              name: dbP.name,
              formation: dbP.formation,
              type: dbP.type,
              wristbandNum: dbP.wristbandNum,
              personnel: dbP.personnel,
              notes: dbP.concept,
            };
            matchIdx++;
          }
        }
        return { ...sec, plays: newPlays };
      });

      next[sectionsKey] = sections;
      return next;
    });
  };

  // Reset to default
  const handleReset = () => {
    const confirm = window.confirm(
      `Reset the ${activeUnit.toUpperCase()} call sheet back to original starter templates? Any custom table edits will be restored.`
    );
    if (!confirm) return;

    setCallSheetData((prev) => {
      const next = { ...prev };
      if (activeUnit === 'offense') {
        next.offenseSections = DEFAULT_OFFENSE_SECTIONS;
      } else {
        next.defenseSections = DEFAULT_DEFENSE_SECTIONS;
      }
      return next;
    });
  };

  // Print Call Sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Main Navigation Toolbar (Hidden when printing) */}
      <header className="bg-slate-850 border-b border-slate-750 px-3 sm:px-6 py-2.5 shrink-0 shadow-md print:hidden">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left Title & Unit Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${
                  activeUnit === 'offense'
                    ? 'bg-gradient-to-br from-red-600 to-rose-700'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                }`}
              >
                {activeUnit === 'offense' ? (
                  <Swords className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Situational Call Sheet</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeTeamName}
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Editable tables, rows, columns, highlights &bull; Auto-formatting grid &bull; Interactive Play Bank
                </p>
              </div>
            </div>

            {/* Offense / Defense Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-750 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveUnit('offense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeUnit === 'offense'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Offense Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit('defense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeUnit === 'defense'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Defense Sheet</span>
              </button>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Desktop Grid Columns Selector (Auto-Formatting) */}
            {viewDevice === 'computer' && (
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-750 text-xs">
                <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
                  <LayoutGrid className="w-3 h-3" />
                  Grid:
                </span>
                {[2, 3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => handleChangeGridColumns(cols)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                      gridColumns === cols
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Format call sheet in ${cols} columns`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            )}

            {/* Device Switcher (Computer vs Mobile) */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-750">
              <button
                type="button"
                onClick={() => setViewDevice('computer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewDevice === 'computer'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Spreadsheet Grid Layout (Computer)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewDevice('mobile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewDevice === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Touch Sideline HUD"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile HUD</span>
              </button>
            </div>

            {/* Global Red Zone Highlight Toggle */}
            <button
              type="button"
              onClick={() => setHighlightRedZone(!highlightRedZone)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                highlightRedZone
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
              }`}
              title="Toggle Red Zone highlight container"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Red Zone Tint {highlightRedZone ? 'ON' : 'OFF'}</span>
            </button>

            {/* Play Bank Sidebar Toggle */}
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
              <span>Play Bank ({playDatabase.filter((p) => p.unit === activeUnit).length})</span>
            </button>

            {/* Import Plays from Excel Button */}
            <button
              type="button"
              onClick={() => setIsExcelImportOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-emerald-600/50"
              title="Import plays from Excel (.xlsx, .xls, .csv) or paste tabular data"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            {/* Wristband Preset Table Button */}
            <button
              type="button"
              onClick={() =>
                setAddTableModalState({
                  isOpen: true,
                  group: 'top_situations',
                  initialTab: 'wristband',
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Add preset table populated from any wristband with matching numbers & highlights"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Wristband Preset</span>
            </button>

            {/* Add Section Button */}
            <button
              type="button"
              onClick={() => handleAddSection('top_situations', 'custom')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Add a new situation table to the sheet"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Table</span>
            </button>

            {/* Auto Fill */}
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Auto-fill empty slots with matching plays"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Auto-Fill</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Reset to defaults */}
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-750 transition-colors cursor-pointer"
              title="Reset sheet to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main sheet container */}
        <main className="flex-1 overflow-y-auto min-h-0 p-2 sm:p-4 print:p-0 print:overflow-visible overscroll-contain">
          {/* Printable Call Sheet Header Bar */}
          <div className="hidden print:block mb-3 border-b-2 border-black pb-2 text-black">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">
                  {activeTeamName} &bull; {activeUnit.toUpperCase()} SITUATIONAL CALL SHEET
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  Laminated Sideline Master Sheet &bull; 2-Pt Decision Matrix &bull; Timeouts Tracker
                </p>
              </div>
              <div className="text-right text-xs font-mono font-bold">
                Date: {callSheetData.gameDate || 'Game Day'}
              </div>
            </div>
          </div>

          {/* Render Computer vs Mobile View */}
          {viewDevice === 'computer' ? (
            <ComputerCallSheetView
              unit={activeUnit}
              callSheetData={callSheetData}
              highlightRedZone={highlightRedZone}
              gridColumns={gridColumns}
              onSlotClick={handleSlotClick}
              onClearSlot={handleClearSlot}
              onDropPlayToSlot={handleAssignPlayToSlot}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onAddSection={handleAddSection}
              onReorderSections={handleReorderSections}
              onChangeTimeouts={(timeouts) =>
                setCallSheetData((prev) => ({ ...prev, timeouts }))
              }
              onUpdateTwoPointRules={handleUpdateTwoPointRules}
              onToggleTwoPointHighlight={handleToggleTwoPointHighlight}
              onAddScriptRow={handleAddScriptRow}
              onRemoveScriptRow={handleRemoveScriptRow}
              onToggleScriptColumns={handleToggleScriptColumns}
              onToggleScriptHighlight={handleToggleScriptHighlight}
              onToggleTimeoutsHighlight={handleToggleTimeoutsHighlight}
              onChangeTimeoutsCount={handleChangeTimeoutsCount}
            />
          ) : (
            <MobileCallSheetView
              unit={activeUnit}
              callSheetData={callSheetData}
              highlightRedZone={highlightRedZone}
              onSelectUnit={setActiveUnit}
              onSlotClick={handleSlotClick}
              onClearSlot={handleClearSlot}
              onChangeTimeouts={(timeouts) =>
                setCallSheetData((prev) => ({ ...prev, timeouts }))
              }
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onAddSection={handleAddSection}
              onUpdateTwoPointRules={handleUpdateTwoPointRules}
              onToggleTwoPointHighlight={handleToggleTwoPointHighlight}
            />
          )}
        </main>

        {/* Play Bank Sidebar (Drawer on mobile, docked on desktop) */}
        <PlayBankSidebar
          unit={activeUnit}
          plays={playDatabase}
          wristbandData={normalizedWristbandData}
          onAddCustomPlay={() => {
            const firstSec =
              activeUnit === 'offense'
                ? callSheetData.offenseSections[0]?.id || 'script'
                : callSheetData.defenseSections[0]?.id || 'script';
            setPickerState({
              isOpen: true,
              sectionId: firstSec,
              sectionTitle: 'New Play Entry',
              slotIndex: 0,
              currentPlay: null,
            });
          }}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
          onDeletePlay={handleDeletePlayFromDatabase}
          onDeleteMultiplePlays={handleDeleteMultiplePlaysFromDatabase}
          onResetDefaults={handleResetPlayDatabase}
          isOpen={isPlayBankOpen}
          onToggleOpen={() => setIsPlayBankOpen(!isPlayBankOpen)}
        />
      </div>

      {/* 3. Play Picker Modal */}
      <PlayPickerModal
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState((prev) => ({ ...prev, isOpen: false }))}
        sectionTitle={pickerState.sectionTitle}
        unit={activeUnit}
        slotIndex={pickerState.slotIndex}
        currentPlay={pickerState.currentPlay}
        databasePlays={playDatabase}
        wristbandData={normalizedWristbandData}
        onSelectPlay={(play) => {
          handleAssignPlayToSlot(pickerState.sectionId, pickerState.slotIndex, play);
          setPickerState((prev) => ({ ...prev, isOpen: false }));
        }}
        onClearSlot={() => {
          handleClearSlot(pickerState.sectionId, pickerState.slotIndex);
          setPickerState((prev) => ({ ...prev, isOpen: false }));
        }}
        onAddCustomToDatabase={handleAddCustomToDatabase}
        onDeleteFromDatabase={handleDeletePlayFromDatabase}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
      />

      {/* 4. Excel Play Import Modal */}
      <ExcelPlayImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        defaultUnit={activeUnit}
        existingPlaysCount={playDatabase.length}
        onImportPlays={handleImportPlays}
      />

      {/* 5. Add Table / Section Modal */}
      <AddTableModal
        isOpen={addTableModalState.isOpen}
        activeUnit={activeUnit}
        initialGroup={addTableModalState.group}
        initialTab={addTableModalState.initialTab || 'wristband'}
        wristbandData={normalizedWristbandData}
        playDatabase={playDatabase}
        onClose={() => setAddTableModalState((prev) => ({ ...prev, isOpen: false }))}
        onAddSection={handleConfirmAddSection}
        onAddSections={handleConfirmAddSections}
      />
    </div>
  );
};
