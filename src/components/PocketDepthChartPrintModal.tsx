import React, { useState, useMemo } from 'react';
import {
  Printer,
  ExternalLink,
  X,
  FileText,
  Check,
  LayoutGrid,
  Columns,
  Layers,
  Scissors,
  Sliders,
  CheckCircle2,
  Swords,
  Shield,
  Sparkles,
  Info,
  ArrowUp,
  ArrowDown,
  Star,
  ArrowUpDown,
  ListOrdered,
} from 'lucide-react';
import { FormationBoard, PlacedPlayer } from '../types';
import {
  triggerPrint,
  generatePocketDepthChartPrintHTML,
  openCleanPrintTab,
  PocketDepthChartPrintOptions,
} from '../utils/printUtils';

interface PocketDepthChartPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  formations: FormationBoard[];
  depthChart: Record<string, PlacedPlayer[]>;
  activeUnit: 'offense' | 'defense' | 'st' | 'groups';
  activeTeamName?: string;
  seasonLabel?: string;
  initialSelectedFormationId?: string | null;
}

export const PocketDepthChartPrintModal: React.FC<PocketDepthChartPrintModalProps> = ({
  isOpen,
  onClose,
  formations,
  depthChart,
  activeUnit,
  activeTeamName = 'Football Manager',
  seasonLabel = 'Game Day Lineup',
  initialSelectedFormationId,
}) => {
  // Modal state
  const [unitMode, setUnitMode] = useState<
    'current' | 'both_off_def' | 'all' | 'offense' | 'defense' | 'st'
  >(() => (initialSelectedFormationId ? 'current' : 'both_off_def'));
  const [depthLevels, setDepthLevels] = useState<'starters_only' | '2_deep' | '3_deep' | 'all'>('2_deep');
  const [layout, setLayout] = useState<'pocket_grid' | 'side_by_side' | 'full_table' | 'single_column'>('pocket_grid');
  const [columnsCount, setColumnsCount] = useState<1 | 2 | 3>(2);
  const [oneChartPerColumn, setOneChartPerColumn] = useState<boolean>(false);
  const [oneChartPerPage, setOneChartPerPage] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [inkFriendly, setInkFriendly] = useState<boolean>(true);
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>('compact');

  // Specific formation selection
  const [selectedFormationIds, setSelectedFormationIds] = useState<string[]>(() =>
    initialSelectedFormationId ? [initialSelectedFormationId] : formations.map((f) => f.id)
  );

  // Formation ordering state (controls exact sequence on print, and which is 1st)
  const [orderedFormationIds, setOrderedFormationIds] = useState<string[]>(() => {
    const allIds = formations.map((f) => f.id);
    if (initialSelectedFormationId && allIds.includes(initialSelectedFormationId)) {
      return [initialSelectedFormationId, ...allIds.filter((id) => id !== initialSelectedFormationId)];
    }
    return allIds;
  });

  // Sync state when initialSelectedFormationId or formations change
  React.useEffect(() => {
    if (initialSelectedFormationId) {
      setSelectedFormationIds([initialSelectedFormationId]);
      setOrderedFormationIds((prev) => {
        const remaining = prev.filter((id) => id !== initialSelectedFormationId);
        return [initialSelectedFormationId, ...remaining];
      });
      setUnitMode('current');
    } else {
      setSelectedFormationIds(formations.map((f) => f.id));
      setOrderedFormationIds((prev) => {
        const existing = new Set(prev);
        const currentIds = formations.map((f) => f.id);
        const validExisting = prev.filter((id) => currentIds.includes(id));
        const newIds = currentIds.filter((id) => !existing.has(id));
        return [...validExisting, ...newIds];
      });
    }
  }, [initialSelectedFormationId, isOpen, formations]);

  // Available formations based on unit mode
  const relevantFormations = useMemo(() => {
    if (unitMode === 'current') {
      return formations.filter((f) => f.unit === activeUnit);
    }
    if (unitMode === 'both_off_def') {
      return formations.filter((f) => f.unit === 'offense' || f.unit === 'defense');
    }
    if (unitMode === 'offense') return formations.filter((f) => f.unit === 'offense');
    if (unitMode === 'defense') return formations.filter((f) => f.unit === 'defense');
    if (unitMode === 'st') return formations.filter((f) => f.unit === 'st');
    return formations;
  }, [formations, unitMode, activeUnit]);

  // Relevant formations sorted by orderedFormationIds
  const orderedRelevantFormations = useMemo(() => {
    const map = new Map(relevantFormations.map((f) => [f.id, f]));
    const ordered: FormationBoard[] = [];
    const visited = new Set<string>();

    for (const id of orderedFormationIds) {
      const f = map.get(id);
      if (f) {
        ordered.push(f);
        visited.add(id);
      }
    }
    // Any remaining formations not yet in orderedFormationIds
    for (const f of relevantFormations) {
      if (!visited.has(f.id)) {
        ordered.push(f);
      }
    }
    return ordered;
  }, [relevantFormations, orderedFormationIds]);

  // Formations actually displayed in preview/print, respecting exact coach-defined order
  const targetFormations = useMemo(() => {
    return orderedRelevantFormations.filter((f) => selectedFormationIds.includes(f.id));
  }, [orderedRelevantFormations, selectedFormationIds]);

  // First formation designated
  const firstFormation = targetFormations[0] || null;

  if (!isOpen) return null;

  // Set a specific formation as 1st
  const handleSetFirstFormation = (formId: string) => {
    setOrderedFormationIds((prev) => {
      const filtered = prev.filter((id) => id !== formId);
      return [formId, ...filtered];
    });
    // Ensure it is checked
    if (!selectedFormationIds.includes(formId)) {
      setSelectedFormationIds((prev) => [formId, ...prev]);
    }
  };

  // Move up in list
  const handleMoveUp = (formId: string) => {
    const currentList = orderedRelevantFormations.map((f) => f.id);
    const idx = currentList.indexOf(formId);
    if (idx <= 0) return;

    const prevId = currentList[idx - 1];
    setOrderedFormationIds((prev) => {
      const fullList = [...prev];
      const pIdx = fullList.indexOf(formId);
      const prevFullIdx = fullList.indexOf(prevId);
      if (pIdx !== -1 && prevFullIdx !== -1) {
        fullList[pIdx] = prevId;
        fullList[prevFullIdx] = formId;
      }
      return fullList;
    });
  };

  // Move down in list
  const handleMoveDown = (formId: string) => {
    const currentList = orderedRelevantFormations.map((f) => f.id);
    const idx = currentList.indexOf(formId);
    if (idx === -1 || idx >= currentList.length - 1) return;

    const nextId = currentList[idx + 1];
    setOrderedFormationIds((prev) => {
      const fullList = [...prev];
      const pIdx = fullList.indexOf(formId);
      const nextFullIdx = fullList.indexOf(nextId);
      if (pIdx !== -1 && nextFullIdx !== -1) {
        fullList[pIdx] = nextId;
        fullList[nextFullIdx] = formId;
      }
      return fullList;
    });
  };

  // Sorting presets
  const handleSortPreset = (preset: 'offense_first' | 'defense_first' | 'alphabetical' | 'reset') => {
    if (preset === 'reset') {
      setOrderedFormationIds(formations.map((f) => f.id));
      return;
    }
    if (preset === 'alphabetical') {
      const sorted = [...formations].sort((a, b) => a.name.localeCompare(b.name)).map((f) => f.id);
      setOrderedFormationIds(sorted);
      return;
    }
    if (preset === 'offense_first') {
      const off = formations.filter((f) => f.unit === 'offense').map((f) => f.id);
      const def = formations.filter((f) => f.unit === 'defense').map((f) => f.id);
      const st = formations.filter((f) => f.unit === 'st').map((f) => f.id);
      const others = formations.filter((f) => !['offense', 'defense', 'st'].includes(f.unit)).map((f) => f.id);
      setOrderedFormationIds([...off, ...def, ...st, ...others]);
      return;
    }
    if (preset === 'defense_first') {
      const def = formations.filter((f) => f.unit === 'defense').map((f) => f.id);
      const off = formations.filter((f) => f.unit === 'offense').map((f) => f.id);
      const st = formations.filter((f) => f.unit === 'st').map((f) => f.id);
      const others = formations.filter((f) => !['offense', 'defense', 'st'].includes(f.unit)).map((f) => f.id);
      setOrderedFormationIds([...def, ...off, ...st, ...others]);
      return;
    }
  };

  const toggleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedFormationIds(relevantFormations.map((f) => f.id));
    } else {
      setSelectedFormationIds([]);
    }
  };

  const printOptions: PocketDepthChartPrintOptions = {
    orientation,
    layout: oneChartPerColumn ? 'single_column' : (unitMode === 'both_off_def' ? 'side_by_side' : layout),
    depthLevels,
    fontSize,
    inkFriendly,
    columnsCount: oneChartPerColumn ? 1 : columnsCount,
    oneChartPerColumn,
    oneChartPerPage,
    showCutLines,
    selectedFormationIds: targetFormations.map((f) => f.id),
    unitFilter: oneChartPerColumn ? 'all' : (unitMode === 'both_off_def' ? 'both_off_def' : unitMode === 'current' ? activeUnit : unitMode),
    teamName: activeTeamName,
    seasonLabel,
  };

  // Direct print
  const handleDirectPrint = () => {
    onClose();
    const html = generatePocketDepthChartPrintHTML(formations, depthChart, printOptions);
    openCleanPrintTab(html, `${activeTeamName}_Pocket_Depth_Chart`);
  };

  // Clean Tab print
  const handleOpenCleanTab = () => {
    const html = generatePocketDepthChartPrintHTML(formations, depthChart, printOptions);
    openCleanPrintTab(html, `${activeTeamName}_Pocket_Depth_Chart`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Print Pocket Depth Chart
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Pocket / Sideline Card
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Clean, position-focused print layout with custom formation ordering and single-column options.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Controls Left, Live Preview Right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-750 overflow-y-auto space-y-4 bg-slate-900/60">
            {/* 1. Unit Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unit &amp; Scope</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnitMode('both_off_def');
                    setOneChartPerColumn(false);
                    setLayout('side_by_side');
                    setOrientation('landscape');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    unitMode === 'both_off_def' && !oneChartPerColumn
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-xs'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Offense + Defense</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                      Coaches' Pick
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Side-by-side pocket card (folds into pocket)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUnitMode('current')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    unitMode === 'current'
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200 shadow-xs'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-black mb-1 capitalize">
                    Current Unit ({activeUnit})
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Print active {activeUnit} formation depth
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUnitMode('offense')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    unitMode === 'offense'
                      ? 'bg-blue-600/20 border-blue-500/60 text-blue-200 shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5 text-blue-400" />
                    <span>Offense Only</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUnitMode('defense')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    unitMode === 'defense'
                      ? 'bg-red-600/20 border-red-500/60 text-red-200 shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span>Defense Only</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Formation Ordering & 1st Formation Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>1st Formation &amp; Sequence</span>
                </label>
                <span className="text-[10px] text-amber-300 font-bold">
                  #1 Appears 1st on Sheet
                </span>
              </div>

              {/* 1st Formation Dropdown Picker */}
              <div className="bg-slate-850 border border-slate-700 rounded-xl p-2.5 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <span>Which Formation is 1st:</span>
                  </span>
                  {firstFormation && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9.5px]">
                      ⭐ 1ST: {firstFormation.name}
                    </span>
                  )}
                </div>
                <select
                  value={firstFormation?.id || ''}
                  onChange={(e) => handleSetFirstFormation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {relevantFormations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.unit.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3 text-slate-400" />
                  <span>Sort:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSortPreset('offense_first')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Offense 1st
                </button>
                <button
                  type="button"
                  onClick={() => handleSortPreset('defense_first')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Defense 1st
                </button>
                <button
                  type="button"
                  onClick={() => handleSortPreset('alphabetical')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  A-Z
                </button>
                <button
                  type="button"
                  onClick={() => handleSortPreset('reset')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-medium transition-colors cursor-pointer ml-auto"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 3. Re-order List & Selection */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Order &amp; Inclusions ({targetFormations.length}/{relevantFormations.length})</span>
                </label>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(true)}
                    className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">&bull;</span>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(false)}
                    className="text-slate-400 hover:text-slate-300 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                {orderedRelevantFormations.map((f, idx) => {
                  const isChecked = selectedFormationIds.includes(f.id);
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                        isFirst
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                          : isChecked
                          ? 'bg-slate-850/80 border-slate-800 text-slate-200'
                          : 'bg-slate-900/40 border-slate-850/40 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFormationIds((prev) => [...prev, f.id]);
                            } else {
                              setSelectedFormationIds((prev) => prev.filter((id) => id !== f.id));
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 w-3.5 h-3.5 cursor-pointer shrink-0"
                        />
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 ${
                            isFirst
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                          title={isFirst ? '1st formation on printout' : `Order position #${idx + 1}`}
                        >
                          {isFirst ? '⭐ #1' : `#${idx + 1}`}
                        </span>
                        <span className="font-bold text-xs truncate">{f.name}</span>
                        <span className="text-[8.5px] font-mono uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                          {f.unit}
                        </span>
                      </div>

                      {/* Reorder controls */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => handleSetFirstFormation(f.id)}
                            className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black text-[9px] transition-colors cursor-pointer"
                            title="Make this the 1st formation"
                          >
                            1st
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMoveUp(f.id)}
                          disabled={idx === 0}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(f.id)}
                          disabled={idx === orderedRelevantFormations.length - 1}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Layout & Column Options (Includes 1 Chart Per Column) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                <span>Layout &amp; Columns</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* 1 Chart per column */}
                <button
                  type="button"
                  onClick={() => {
                    setOneChartPerColumn(true);
                    setColumnsCount(1);
                    setLayout('single_column');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    oneChartPerColumn || columnsCount === 1
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs flex items-center justify-center gap-1">
                    <Columns className="w-3 h-3" />
                    <span>1 Chart / Col</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Full Width Single</div>
                </button>

                {/* 2 Columns */}
                <button
                  type="button"
                  onClick={() => {
                    setOneChartPerColumn(false);
                    setColumnsCount(2);
                    setLayout('pocket_grid');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    !oneChartPerColumn && columnsCount === 2 && layout === 'pocket_grid'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">2 Columns</div>
                  <div className="text-[9px] text-slate-400">Side-by-Side Grid</div>
                </button>

                {/* 3 Columns */}
                <button
                  type="button"
                  onClick={() => {
                    setOneChartPerColumn(false);
                    setColumnsCount(3);
                    setLayout('pocket_grid');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    !oneChartPerColumn && columnsCount === 3
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">3-Col Dense</div>
                  <div className="text-[9px] text-slate-400">Max Fit 1-Page</div>
                </button>
              </div>

              {/* Orientation & Font Size */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-1 bg-slate-800/70 border border-slate-700 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Portrait
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-800/70 border border-slate-700 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFontSize('compact')}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fontSize === 'compact'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('standard')}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fontSize === 'standard'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Depth Levels */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Depth Levels</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: '2_deep', label: 'Black + Gold', sub: 'Top 2 Tiers' },
                  { id: '3_deep', label: '3 Tiers', sub: 'Black, Gold, Blue' },
                  { id: 'all', label: 'Full', sub: 'All Backups' },
                  { id: 'starters_only', label: 'Black Only', sub: 'Black Tier' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setDepthLevels(tier.id as any)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      depthLevels === tier.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-black'
                        : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{tier.label}</div>
                    <div className="text-[8.5px] text-slate-400 font-medium truncate">{tier.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Toggles (1 Chart/Col, 1 Chart/Page, Ink-Friendly, Cut Lines) */}
            <div className="space-y-2 pt-1">
              {/* Explicit toggle for 1 Chart Per Column */}
              <label className="flex items-center justify-between p-2.5 bg-slate-800/70 border border-slate-750 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Columns className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">1 Chart Per Column (Full Width)</div>
                    <div className="text-[10px] text-slate-400">
                      Stack each formation chart in its own full-width column
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={oneChartPerColumn || columnsCount === 1}
                  onChange={(e) => {
                    setOneChartPerColumn(e.target.checked);
                    if (e.target.checked) setColumnsCount(1);
                    else setColumnsCount(2);
                  }}
                  className="rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 w-4 h-4"
                />
              </label>

              {/* Explicit toggle for 1 Chart Per Page */}
              <label className="flex items-center justify-between p-2.5 bg-slate-800/70 border border-slate-750 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">1 Chart Per Page (Page Breaks)</div>
                    <div className="text-[10px] text-slate-400">
                      Print each formation card on its own dedicated page
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={oneChartPerPage}
                  onChange={(e) => setOneChartPerPage(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-400 bg-slate-900 border-slate-700 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-800/70 border border-slate-750 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                    $
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Ink-Friendly Black &amp; White</div>
                    <div className="text-[10px] text-slate-400">
                      Clean white backgrounds, zero background ink waste
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={inkFriendly}
                  onChange={(e) => setInkFriendly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-800/70 border border-slate-750 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Pocket Fold / Cut Guide Lines</div>
                    <div className="text-[10px] text-slate-400">
                      Center dashed line for folding into coach's back pocket
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Live Print Preview Column (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-950 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Live Print Sheet Preview
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                <span>{targetFormations.length} Formations</span>
                <span>&bull;</span>
                <span className="text-amber-400 font-bold">
                  {oneChartPerColumn || columnsCount === 1 ? '1 Chart / Col' : `${columnsCount} Columns`}
                </span>
                {firstFormation && (
                  <>
                    <span>&bull;</span>
                    <span className="text-amber-300 font-mono">1st: {firstFormation.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable scaled preview page */}
            <div className="flex-1 overflow-auto rounded-xl bg-slate-900/50 p-2 flex justify-center items-start">
              <div
                className="bg-white text-slate-950 p-4 rounded shadow-2xl transition-all select-none origin-top"
                style={{
                  width: orientation === 'landscape' ? '800px' : '620px',
                  minHeight: orientation === 'landscape' ? '520px' : '750px',
                  transform: 'scale(0.88)',
                  transformOrigin: 'top center',
                }}
              >
                {/* Header inside preview */}
                <div className="border-b-2 border-slate-950 pb-1.5 mb-2.5 flex items-center justify-between">
                  <div>
                    <h1 className="font-black text-sm uppercase tracking-wider text-slate-950">
                      {activeTeamName} &bull; POCKET DEPTH CHART
                    </h1>
                    <p className="text-[9px] font-bold text-slate-600 uppercase">
                      {seasonLabel} &bull; Laminated Sideline Pocket Reference
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-black inline-block"></span>
                      <span>Black</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600 inline-block"></span>
                      <span>Gold</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 border border-blue-700 inline-block"></span>
                      <span>Blue</span>
                    </span>
                  </div>
                </div>

                {/* Formations preview */}
                {targetFormations.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-bold text-xs">
                    No formations selected. Check at least one formation above.
                  </div>
                ) : (oneChartPerColumn || columnsCount === 1) ? (
                  /* 1 Chart per column layout */
                  <div className="flex flex-col gap-3 w-full">
                    {targetFormations.map((f, idx) => (
                      <div key={f.id} className={oneChartPerPage && idx > 0 ? "pt-3 border-t-2 border-dashed border-slate-300" : ""}>
                        {oneChartPerPage && idx > 0 && (
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest pb-1 text-center">
                            --- PAGE BREAK (NEW SHEET) ---
                          </div>
                        )}
                        <PreviewFormationCard
                          formation={f}
                          depthChart={depthChart}
                          depthLevels={depthLevels}
                          inkFriendly={inkFriendly}
                          isFirst={idx === 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : unitMode === 'both_off_def' ? (
                  <div className="grid grid-cols-2 gap-3 relative">
                    {showCutLines && (
                      <div className="absolute top-0 bottom-0 left-1/2 -ml-px border-l-2 border-dashed border-slate-400 pointer-events-none flex items-center justify-center">
                        <span className="bg-white px-1 text-[8px] font-black text-slate-500 rotate-90 whitespace-nowrap">
                          ✂ FOLD / CUT LINE
                        </span>
                      </div>
                    )}
                    {/* Offense */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-black uppercase text-slate-900 border-b border-slate-900 pb-0.5">
                        Offensive Depth
                      </div>
                      {targetFormations
                        .filter((f) => f.unit === 'offense')
                        .map((f, idx) => (
                          <PreviewFormationCard
                            key={f.id}
                            formation={f}
                            depthChart={depthChart}
                            depthLevels={depthLevels}
                            inkFriendly={inkFriendly}
                            isFirst={idx === 0 && targetFormations[0]?.id === f.id}
                          />
                        ))}
                    </div>

                    {/* Defense */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-black uppercase text-slate-900 border-b border-slate-900 pb-0.5">
                        Defensive Depth
                      </div>
                      {targetFormations
                        .filter((f) => f.unit === 'defense')
                        .map((f, idx) => (
                          <PreviewFormationCard
                            key={f.id}
                            formation={f}
                            depthChart={depthChart}
                            depthLevels={depthLevels}
                            inkFriendly={inkFriendly}
                            isFirst={idx === 0 && targetFormations[0]?.id === f.id}
                          />
                        ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`grid gap-2.5 ${
                      columnsCount === 3
                        ? 'grid-cols-3'
                        : columnsCount === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {targetFormations.map((f, idx) => (
                      <PreviewFormationCard
                        key={f.id}
                        formation={f}
                        depthChart={depthChart}
                        depthLevels={depthLevels}
                        inkFriendly={inkFriendly}
                        isFirst={idx === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-850 border-t border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">
              Tip: Print on heavy cardstock or laminate for season-long durability in your back pocket.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleOpenCleanTab}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open print sheet in clean new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Clean Tab / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={targetFormations.length === 0}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pocket Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Scaled mini card for the live preview
 * Position descriptions removed for ultra-clean pocket card readability
 */
const PreviewFormationCard: React.FC<{
  formation: FormationBoard;
  depthChart: Record<string, PlacedPlayer[]>;
  depthLevels: 'starters_only' | '2_deep' | '3_deep' | 'all';
  inkFriendly: boolean;
  isFirst?: boolean;
}> = ({ formation, depthChart, depthLevels, inkFriendly, isFirst }) => {
  // Collect slots - position descriptions removed
  const slots: Array<{ pos: { id: string; name: string } }> = [];
  formation.rows.forEach((r) => {
    r.positions.forEach((p) => {
      if (p) slots.push({ pos: p });
    });
  });

  const showStarter = true;
  const show2nd = depthLevels !== 'starters_only';
  const show3rd = depthLevels === '3_deep' || depthLevels === 'all';
  const showBackups = depthLevels === 'all';

  return (
    <div className="border border-slate-950 rounded overflow-hidden text-[10px] bg-white">
      <div className="bg-slate-950 text-white px-2 py-0.5 font-black uppercase text-[9.5px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="px-1 py-0.2 bg-amber-400 text-slate-950 rounded text-[8px] font-black">
            {formation.unit === 'offense' ? 'OFF' : formation.unit === 'defense' ? 'DEF' : 'ST'}
          </span>
          <span className="font-black text-[10px]">{formation.name}</span>
          {isFirst && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[7.5px] font-black uppercase">
              ⭐ 1st
            </span>
          )}
        </div>
        <span className="text-[8px] text-slate-400 font-bold">{slots.length} Pos</span>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-950 text-[8px] font-black uppercase text-slate-800">
            <th className="py-0.5 px-1 border-r border-slate-950 w-[18%] text-center">POS</th>
            {showStarter && <th className="py-0.5 px-1 border-r border-slate-400">Black</th>}
            {show2nd && <th className="py-0.5 px-1 border-r border-slate-400">Gold</th>}
            {show3rd && <th className="py-0.5 px-1 border-r border-slate-400">Blue</th>}
            {showBackups && <th className="py-0.5 px-1">Backups</th>}
          </tr>
        </thead>
        <tbody>
          {slots.map(({ pos }) => {
            const players = depthChart[pos.id] || [];
            const p1 = players[0];
            const p2 = players[1];
            const p3 = players[2];
            const extra = players.slice(3);

            return (
              <tr key={pos.id} className="border-b border-slate-200">
                <td className="py-0.5 px-1.5 font-black bg-slate-100 border-r border-slate-950 whitespace-nowrap text-center text-[9px]">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono font-black text-[8.5px] inline-block">
                    {pos.name}
                  </span>
                </td>

                {showStarter && (
                  <td className="py-0.5 px-1 border-r border-slate-200 text-[8.5px]">
                    {p1 ? (
                      <span className="font-black text-black">
                        <span className="bg-black text-white px-1 py-0.2 rounded font-mono mr-1 text-[8px]">
                          #{p1.num}
                        </span>
                        {p1.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                )}

                {show2nd && (
                  <td className="py-0.5 px-1 border-r border-slate-200 text-[8.5px]">
                    {p2 ? (
                      <span className="font-bold text-slate-800">
                        <span
                          className={`px-1 py-0.2 rounded font-mono mr-1 text-[8px] font-black ${
                            inkFriendly
                              ? 'border border-black text-black bg-white'
                              : 'bg-amber-100 text-amber-900 border border-amber-400'
                          }`}
                        >
                          #{p2.num}
                        </span>
                        {p2.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                )}

                {show3rd && (
                  <td className="py-0.5 px-1 border-r border-slate-200 text-[8.5px]">
                    {p3 ? (
                      <span className="font-medium text-slate-700">
                        <span
                          className={`px-1 py-0.2 rounded font-mono mr-1 text-[8px] font-black ${
                            inkFriendly
                              ? 'border border-dashed border-slate-600 text-slate-800'
                              : 'bg-blue-100 text-blue-900 border border-blue-400'
                          }`}
                        >
                          #{p3.num}
                        </span>
                        {p3.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                )}

                {showBackups && (
                  <td className="py-0.5 px-1 text-[8px] text-slate-600">
                    {extra.length > 0
                      ? extra.map((b) => `#${b.num} ${b.name}`).join(', ')
                      : <span className="text-slate-400">&mdash;</span>}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
