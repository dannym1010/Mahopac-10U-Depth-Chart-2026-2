import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  GripVertical,
  Layers,
  Sparkles,
  Star,
  Tag,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { PlayDatabaseEntry, PlayType, CallSheetPlay } from '../../types/callSheet';
import { WristbandData } from '../../types';
import {
  extractPersonnel,
  getPersonnelSubTabs,
  buildWristbandIndex,
  lookupWristbandPlay,
  isDarkColor,
} from '../../utils/wristbandLinking';
import { safeJSONParse, safeJSONStringify } from '../../services/storageService';
import { INITIAL_TWO_WRISTBANDS_DATA } from '../../data/userGameDayPlays';

interface PlayBankSidebarProps {
  unit: 'offense' | 'defense';
  plays: PlayDatabaseEntry[];
  wristbandData?: WristbandData;
  onAddCustomPlay: () => void;
  onAddMultiplePlaysToWristband?: (plays: PlayDatabaseEntry[]) => void;
  onOpenExcelImport?: () => void;
  onDeletePlay?: (playId: string) => void;
  onDeleteMultiplePlays?: (playIds: string[]) => void;
  onResetDefaults?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const PlayBankSidebar: React.FC<PlayBankSidebarProps> = ({
  unit,
  plays,
  wristbandData,
  onAddCustomPlay,
  onAddMultiplePlaysToWristband,
  onOpenExcelImport,
  onDeletePlay,
  onDeleteMultiplePlays,
  onResetDefaults,
  isOpen,
  onToggleOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isManageMode, setIsManageMode] = useState(false);
  const [isOrderSelectMode, setIsOrderSelectMode] = useState(false);
  const [orderedQueue, setOrderedQueue] = useState<PlayDatabaseEntry[]>([]);
  const [selectedPlayIds, setSelectedPlayIds] = useState<Record<string, boolean>>({});
  const [playToDelete, setPlayToDelete] = useState<PlayDatabaseEntry | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');

  // Derive live wristband index so play bank only colors plays actively assigned to a wristband slot
  const effectiveWristbandData = useMemo(() => {
    if (wristbandData && wristbandData.wristbands && wristbandData.wristbands.length > 0) {
      return wristbandData;
    }
    const saved = safeJSONParse<WristbandData | null>('footballWristbandData', null);
    if (saved && saved.wristbands && saved.wristbands.length > 0) {
      return saved;
    }
    return INITIAL_TWO_WRISTBANDS_DATA;
  }, [wristbandData]);

  const wristbandIndex = useMemo(() => {
    return buildWristbandIndex(effectiveWristbandData);
  }, [effectiveWristbandData]);

  const personnelTabs = useMemo(() => {
    return getPersonnelSubTabs(plays, unit);
  }, [plays, unit]);

  const filteredPlays = useMemo(() => {
    return plays.filter((p) => {
      if (p.unit !== unit) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (selectedPersonnel !== 'all') {
        const pkg = extractPersonnel(p);
        if (pkg !== selectedPersonnel) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesFormation = p.formation.toLowerCase().includes(term);
        const matchesConcept = (p.concept || '').toLowerCase().includes(term);
        const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(term));
        const match = lookupWristbandPlay(p.name, wristbandIndex);
        const matchesWristband = match
          ? `#${match.slotLabel}`.includes(term)
          : p.wristbandNum
          ? `#${p.wristbandNum}`.includes(term)
          : false;
        if (!matchesName && !matchesFormation && !matchesConcept && !matchesTags && !matchesWristband) {
          return false;
        }
      }
      return true;
    });
  }, [plays, unit, selectedType, selectedPersonnel, searchTerm, wristbandIndex]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedPlayIds).filter(Boolean).length;
  }, [selectedPlayIds]);

  const handleToggleSelectPlay = (id: string) => {
    setSelectedPlayIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllFiltered = () => {
    const allSelected = filteredPlays.every((p) => selectedPlayIds[p.id]);
    const next: Record<string, boolean> = { ...selectedPlayIds };
    filteredPlays.forEach((p) => {
      next[p.id] = !allSelected;
    });
    setSelectedPlayIds(next);
  };

  const handleConfirmBatchDelete = () => {
    const idsToDelete = Object.keys(selectedPlayIds).filter((id) => selectedPlayIds[id]);
    if (idsToDelete.length === 0) return;
    if (onDeleteMultiplePlays) {
      onDeleteMultiplePlays(idsToDelete);
    } else if (onDeletePlay) {
      idsToDelete.forEach((id) => onDeletePlay(id));
    }
    setSelectedPlayIds({});
    setIsManageMode(false);
  };

  const handleExecuteSingleDelete = (play: PlayDatabaseEntry) => {
    if (onDeletePlay) {
      onDeletePlay(play.id);
    }
    setPlayToDelete(null);
  };

  const handleDragStart = (e: React.DragEvent, play: PlayDatabaseEntry) => {
    const match = lookupWristbandPlay(play.name, wristbandIndex);
    const playData: CallSheetPlay = {
      id: `drag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: play.name,
      formation: play.formation,
      type: play.type,
      wristbandNum: match ? match.wristbandNum : play.wristbandNum,
      wristbandLabel: match ? match.slotLabel : (play.wristbandLabel || (play.wristbandNum ? String(play.wristbandNum) : undefined)),
      wristbandColor: match ? match.numberBgColor : undefined,
      wristbandNumberColor: match ? match.numberBgColor : undefined,
      wristbandRowColor: match ? match.rowBgColor : undefined,
      wristbandHighlightTarget: match ? match.highlightTarget : undefined,
      wristbandTitle: match ? match.wristbandTitle : undefined,
      wristbandSlotMatch: match
        ? {
            wristbandId: match.wristbandId,
            wristbandTitle: match.wristbandTitle,
            cardLabel: match.wristbandShort,
            slotNumber: match.slotLabel,
            numberBgColor: match.numberBgColor,
            rowHighlightColor: match.rowBgColor,
            highlightTarget: match.highlightTarget,
          }
        : undefined,
      personnel: play.personnel || extractPersonnel(play),
      notes: play.concept,
    };
    const jsonStr = safeJSONStringify(playData);
    try {
      e.dataTransfer.setData('application/json', jsonStr);
      e.dataTransfer.setData('callSheetPlayTransfer', jsonStr);
      e.dataTransfer.setData('text/plain', play.name || jsonStr);
    } catch {}
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        className="fixed right-4 top-40 z-30 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs cursor-pointer print:hidden transition-all hover:scale-105"
        title="Open Play Database Bank"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Play Bank</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 sm:hidden print:hidden"
        onClick={onToggleOpen}
      />

      <div className="fixed inset-y-0 right-0 z-40 w-84 max-w-[88vw] sm:relative sm:inset-auto sm:w-84 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full min-h-0 print:hidden shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                {unit === 'offense' ? 'Offense' : 'Defense'} Play Bank
              </h3>
              <span className="text-[10px] text-slate-400">
                {isManageMode ? 'Select plays to delete' : 'Drag plays onto any sheet cell'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Manage / Delete mode button */}
            <button
              type="button"
              onClick={() => {
                setIsManageMode(!isManageMode);
                setSelectedPlayIds({});
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isManageMode
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isManageMode ? 'Done managing plays' : 'Manage & delete plays'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">{isManageMode ? 'Done' : 'Manage'}</span>
            </button>

            {onAddMultiplePlaysToWristband && !isManageMode && (
              <button
                type="button"
                onClick={() => {
                  setIsOrderSelectMode(!isOrderSelectMode);
                  setOrderedQueue([]);
                }}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isOrderSelectMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/40'
                }`}
                title={isOrderSelectMode ? 'Cancel order select mode' : 'Select multiple plays in order to place on wristband'}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="text-[10px]">{isOrderSelectMode ? 'Cancel' : 'In Order'}</span>
              </button>
            )}

            {onOpenExcelImport && !isManageMode && (
              <button
                type="button"
                onClick={onOpenExcelImport}
                className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Import plays from Excel (.xlsx, .xls, .csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            )}
            {!isManageMode && (
              <button
                type="button"
                onClick={onAddCustomPlay}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                title="Create new play"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close play bank"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manage Mode Toolbar */}
        {isManageMode && (
          <div className="p-2.5 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-[11px] text-rose-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {filteredPlays.length > 0 && filteredPlays.every((p) => selectedPlayIds[p.id]) ? (
                <CheckSquare className="w-4 h-4 text-rose-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredPlays.length})</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmBatchDelete}
              disabled={selectedCount === 0}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedCount})</span>
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="p-3 space-y-2 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plays or wristband #..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({plays.filter((p) => p.unit === unit).length})
            </button>
            {(unit === 'offense'
              ? ['run', 'pass', 'play_action', 'screen', 'rpo', 'trick']
              : ['coverage', 'blitz', 'goal_line', 'run']
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-1.5 py-0.5 rounded-md font-bold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Personnel Sub-tabs */}
          <div className="pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Personnel Sub-Tabs:
              </span>
              {selectedPersonnel !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedPersonnel('all')}
                  className="text-[9px] text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {personnelTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedPersonnel(tab.id)}
                  className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedPersonnel === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.id === 'all' ? 'All' : tab.label.replace(' Personnel', ' Pers')} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Single Play Delete Confirmation Dialog */}
        {playToDelete && (
          <div className="p-3 bg-rose-950/80 border-b border-rose-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Delete "{playToDelete.name}"?</span>
            </div>
            <p className="text-[11px] text-rose-200/80">
              This will remove this play from your {unit} play bank.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleExecuteSingleDelete(playToDelete)}
                className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
              >
                Delete Play
              </button>
              <button
                type="button"
                onClick={() => setPlayToDelete(null)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reset Confirmation Dialog */}
        {isConfirmResetOpen && (
          <div className="p-3 bg-amber-950/80 border-b border-amber-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Reset {unit === 'offense' ? 'Offense' : 'Defense'} to Defaults?</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Any custom plays you added to this bank will be cleared and replaced with default playbook plays.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onResetDefaults) onResetDefaults();
                  setIsConfirmResetOpen(false);
                }}
                className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(false)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Plays List - Scrolls independently with visible slim scrollbar */}
        <div className="flex-1 overflow-y-auto min-h-0 p-2.5 space-y-1.5 overscroll-contain scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600 scrollbar-track-slate-950/40">
          {filteredPlays.map((play) => {
            const queueIdx = orderedQueue.findIndex((p) => p.id === play.id);
            const isQueued = queueIdx >= 0;
            const orderNum = queueIdx + 1;

            return (
              <div
                key={play.id}
                draggable={!isManageMode && !isOrderSelectMode}
                onDragStart={(e) => handleDragStart(e, play)}
                onClick={() => {
                  if (isManageMode) {
                    handleToggleSelectPlay(play.id);
                  } else if (isOrderSelectMode) {
                    setOrderedQueue((prev) => {
                      const idx = prev.findIndex((p) => p.id === play.id);
                      if (idx >= 0) {
                        return prev.filter((_, i) => i !== idx);
                      } else {
                        return [...prev, play];
                      }
                    });
                  }
                }}
                className={`p-2.5 border rounded-xl transition-all select-none group shadow-xs ${
                  isManageMode || isOrderSelectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                } ${
                  isManageMode && selectedPlayIds[play.id]
                    ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40'
                    : isOrderSelectMode && isQueued
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/50 shadow-md'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-indigo-500/60'
                }`}
                title={
                  isManageMode
                    ? 'Click to select for deletion'
                    : isOrderSelectMode
                    ? isQueued
                      ? `Selected #${orderNum} - click to remove`
                      : 'Click to select in order'
                    : 'Drag onto any slot in the call sheet or wristband'
                }
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {isManageMode && (
                      <div className="shrink-0 mr-0.5">
                        {selectedPlayIds[play.id] ? (
                          <CheckSquare className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    )}
                    {isOrderSelectMode && (
                      <div className="shrink-0 mr-1">
                        {isQueued ? (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs ring-1 ring-indigo-400 font-mono">
                            #{orderNum}
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 group-hover:border-indigo-500 text-[10px] flex items-center justify-center font-bold">
                            +
                          </span>
                        )}
                      </div>
                    )}
                    {(() => {
                      const match = lookupWristbandPlay(play.name, wristbandIndex);
                      if (match) {
                        // Play HAS a spot on the active wristband -> render with wristband color
                        const bg = match.numberBgColor || '#facc15';
                        const fg = isDarkColor(bg) ? '#ffffff' : '#000000';
                        return (
                          <span
                            style={{
                              backgroundColor: bg,
                              color: fg,
                            }}
                            className="px-1 py-0.2 rounded font-black text-[9px] font-mono shrink-0 shadow-2xs border border-black/20"
                            title={`${match.wristbandTitle} • Slot #${match.slotLabel}`}
                          >
                            #{match.slotLabel}
                          </span>
                        );
                      }

                      // Play DOES NOT have a spot on the wristband:
                      // "If a play doesnt have a spot on the wristband it shouldnt have a color in the play bank"
                      // If the entry has a custom wristbandNum, show uncolored (transparent bg, neutral slate border/text)
                      if (play.wristbandNum) {
                        return (
                          <span
                            className="px-1 py-0.2 rounded font-mono text-[9px] font-semibold text-slate-400 bg-transparent border border-slate-700/70 shrink-0"
                            title="No spot on active wristband"
                          >
                            #{play.wristbandNum}
                          </span>
                        );
                      }

                      return null;
                    })()}
                    <span className="font-bold text-xs text-slate-100 group-hover:text-white uppercase truncate">
                      {play.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {onDeletePlay && !isManageMode && !isOrderSelectMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setPlayToDelete(play);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-all cursor-pointer"
                        title={`Delete "${play.name}" from play bank`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!isManageMode && !isOrderSelectMode && (
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap text-[9px]">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {play.formation}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 font-bold uppercase border border-indigo-500/30">
                    {play.type.replace('_', ' ')}
                  </span>
                  {play.personnel && (
                    <span className="text-slate-400 truncate">
                      • {play.personnel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredPlays.length === 0 && (
            <div className="text-center py-10 space-y-3 text-slate-400 text-xs px-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-200">No matching plays</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Try changing filters or import plays from your spreadsheet.</p>
              </div>
              {onOpenExcelImport && (
                <button
                  type="button"
                  onClick={onOpenExcelImport}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import Plays from Excel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Select Sticky Bottom Bar */}
        {isOrderSelectMode && onAddMultiplePlaysToWristband && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  {orderedQueue.length}
                </span>
                <span>Plays selected in order</span>
              </span>
              {orderedQueue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderedQueue([])}
                  className="text-[11px] text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={orderedQueue.length === 0}
              onClick={() => {
                if (orderedQueue.length > 0) {
                  onAddMultiplePlaysToWristband(orderedQueue);
                  setOrderedQueue([]);
                  setIsOrderSelectMode(false);
                }
              }}
              className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
                orderedQueue.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {orderedQueue.length === 0
                  ? 'Click plays above in order'
                  : `Add ${orderedQueue.length} Plays in Order`}
              </span>
            </button>
          </div>
        )}

        {/* Footer Summary & Reset */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-[10px] text-slate-400">
          <span>{filteredPlays.length} {unit} plays</span>
          {onResetDefaults && !isManageMode && (
            <button
              type="button"
              onClick={() => setIsConfirmResetOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Reset to factory default plays"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
