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
  const [layout, setLayout] = useState<'pocket_grid' | 'side_by_side' | 'full_table'>('pocket_grid');
  const [columnsCount, setColumnsCount] = useState<1 | 2 | 3>(2);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [inkFriendly, setInkFriendly] = useState<boolean>(true);
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>('compact');

  // Specific formation selection
  const [selectedFormationIds, setSelectedFormationIds] = useState<string[]>(() =>
    initialSelectedFormationId ? [initialSelectedFormationId] : formations.map((f) => f.id)
  );

  React.useEffect(() => {
    if (initialSelectedFormationId) {
      setSelectedFormationIds([initialSelectedFormationId]);
      setUnitMode('current');
    } else {
      setSelectedFormationIds(formations.map((f) => f.id));
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

  // Formations actually displayed in preview/print
  const targetFormations = useMemo(() => {
    return relevantFormations.filter((f) => selectedFormationIds.includes(f.id));
  }, [relevantFormations, selectedFormationIds]);

  if (!isOpen) return null;

  const toggleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedFormationIds(relevantFormations.map((f) => f.id));
    } else {
      setSelectedFormationIds([]);
    }
  };

  const printOptions: PocketDepthChartPrintOptions = {
    orientation,
    layout: unitMode === 'both_off_def' ? 'side_by_side' : layout,
    depthLevels,
    fontSize,
    inkFriendly,
    columnsCount,
    showCutLines,
    selectedFormationIds,
    unitFilter: unitMode === 'both_off_def' ? 'both_off_def' : unitMode === 'current' ? activeUnit : unitMode,
    teamName: activeTeamName,
    seasonLabel,
  };

  // Direct print via window.print()
  const handleDirectPrint = () => {
    onClose();

    // Use isolated clean HTML in an iframe or dedicated tab to guarantee 0 distortion
    const html = generatePocketDepthChartPrintHTML(formations, depthChart, printOptions);
    openCleanPrintTab(html, `${activeTeamName}_Pocket_Depth_Chart`);
  };

  // Standalone tab print via openCleanPrintTab
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
                  Pocket / Laminated Format
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                High-density, ink-efficient print layout for coaches, playcallers, and sideline clipboards.
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
                    setLayout('side_by_side');
                    setOrientation('landscape');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    unitMode === 'both_off_def'
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
                    Side-by-side 2-column pocket card (folds into pocket)
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

            {/* 2. Depth Detail (How deep to print) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Depth String Depth</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: '2_deep', label: '2-Deep', sub: 'Starters + 2nd' },
                  { id: '3_deep', label: '3-Deep', sub: 'Top 3 Strings' },
                  { id: 'all', label: 'Full', sub: 'All Backups' },
                  { id: 'starters_only', label: 'Starters', sub: '1st String' },
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

            {/* 3. Layout & Pocket Density */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                <span>Layout &amp; Orientation</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLayout('pocket_grid');
                    setColumnsCount(2);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    layout === 'pocket_grid' && columnsCount === 2
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">2-Col Grid</div>
                  <div className="text-[9px] text-slate-400">5.5"x8.5" Pocket</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLayout('pocket_grid');
                    setColumnsCount(3);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    layout === 'pocket_grid' && columnsCount === 3
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">3-Col Dense</div>
                  <div className="text-[9px] text-slate-400">Max Fit 1-Page</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLayout('full_table');
                    setColumnsCount(1);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    layout === 'full_table'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-black'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">Full Width</div>
                  <div className="text-[9px] text-slate-400">Wide Binder Table</div>
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

            {/* 4. Toggles (Ink Friendly & Cut Lines) */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-2.5 bg-slate-800/70 border border-slate-750 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-700 text-slate-300 flex items-center justify-center text-xs">
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

            {/* 5. Formation Selection Filter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Select Formations ({targetFormations.length}/{relevantFormations.length})</span>
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

              <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                {relevantFormations.map((f) => {
                  const isChecked = selectedFormationIds.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                    >
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
                        className="rounded text-indigo-500 focus:ring-indigo-400 bg-slate-900 border-slate-700 w-3.5 h-3.5"
                      />
                      <span className="font-bold text-slate-200">{f.name}</span>
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 ml-auto">
                        {f.unit}
                      </span>
                    </label>
                  );
                })}
              </div>
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
              <div className="text-[11px] text-slate-400 font-medium">
                Standard Letter ({orientation.toUpperCase()}) &bull; {targetFormations.length} Boards
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
                      <span>1st (Black)</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600 inline-block"></span>
                      <span>2nd (Gold)</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 border border-blue-700 inline-block"></span>
                      <span>3rd (Blue)</span>
                    </span>
                  </div>
                </div>

                {/* Formations preview */}
                {targetFormations.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-bold text-xs">
                    No formations selected. Check at least one formation above.
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
                        .map((f) => (
                          <PreviewFormationCard
                            key={f.id}
                            formation={f}
                            depthChart={depthChart}
                            depthLevels={depthLevels}
                            inkFriendly={inkFriendly}
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
                        .map((f) => (
                          <PreviewFormationCard
                            key={f.id}
                            formation={f}
                            depthChart={depthChart}
                            depthLevels={depthLevels}
                            inkFriendly={inkFriendly}
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
                    {targetFormations.map((f) => (
                      <PreviewFormationCard
                        key={f.id}
                        formation={f}
                        depthChart={depthChart}
                        depthLevels={depthLevels}
                        inkFriendly={inkFriendly}
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
 */
const PreviewFormationCard: React.FC<{
  formation: FormationBoard;
  depthChart: Record<string, PlacedPlayer[]>;
  depthLevels: 'starters_only' | '2_deep' | '3_deep' | 'all';
  inkFriendly: boolean;
}> = ({ formation, depthChart, depthLevels, inkFriendly }) => {
  const slots: Array<{ pos: { id: string; name: string }; rowLabel: string }> = [];
  formation.rows.forEach((r, rIdx) => {
    r.positions.forEach((p) => {
      if (p) slots.push({ pos: p, rowLabel: r.label || `Lvl ${rIdx + 1}` });
    });
  });

  const showStarter = true;
  const show2nd = depthLevels !== 'starters_only';
  const show3rd = depthLevels === '3_deep' || depthLevels === 'all';
  const showBackups = depthLevels === 'all';

  return (
    <div className="border border-slate-950 rounded overflow-hidden text-[10px] bg-white">
      <div className="bg-slate-950 text-white px-2 py-0.5 font-black uppercase text-[9.5px] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="px-1 py-0.2 bg-amber-400 text-slate-950 rounded text-[8px] font-black">
            {formation.unit === 'offense' ? 'OFF' : formation.unit === 'defense' ? 'DEF' : 'ST'}
          </span>
          <span>{formation.name}</span>
        </div>
        <span className="text-[8px] text-slate-400 font-bold">{slots.length} Pos</span>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-950 text-[8px] font-black uppercase text-slate-800">
            <th className="py-0.5 px-1 border-r border-slate-950 w-1/4">POS</th>
            {showStarter && <th className="py-0.5 px-1 border-r border-slate-400">1st (Starter)</th>}
            {show2nd && <th className="py-0.5 px-1 border-r border-slate-400">2nd String</th>}
            {show3rd && <th className="py-0.5 px-1 border-r border-slate-400">3rd String</th>}
            {showBackups && <th className="py-0.5 px-1">Backups</th>}
          </tr>
        </thead>
        <tbody>
          {slots.map(({ pos, rowLabel }) => {
            const players = depthChart[pos.id] || [];
            const p1 = players[0];
            const p2 = players[1];
            const p3 = players[2];
            const extra = players.slice(3);

            return (
              <tr key={pos.id} className="border-b border-slate-200">
                <td className="py-0.5 px-1 font-black bg-slate-100 border-r border-slate-950 whitespace-nowrap text-[9px]">
                  <span className="px-1 py-0.2 bg-slate-800 text-white rounded text-[8.5px] mr-1">
                    {pos.name}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-bold">{rowLabel}</span>
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
