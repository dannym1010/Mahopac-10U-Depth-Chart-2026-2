import React, { useState, useMemo, useEffect } from 'react';
import {
  Swords,
  Plus,
  Trash2,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  Shield,
  Zap,
  Users,
  Flame,
  LayoutGrid,
  Columns,
  Search,
  UserPlus,
  Palette,
  Sliders,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  FileSpreadsheet,
  Settings2,
} from 'lucide-react';
import {
  LiveDrillGroup,
  LiveDrillFormat,
  LiveDrillPosition,
  PlacedPlayer,
  RosterPlayer,
  UserRole,
  FormationBoard,
  Team,
} from '../types';
import {
  TEAM_COLOR_OPTIONS,
  getTeamColorConfig,
  COLOR_MATCHUP_PRESETS,
  DEFAULT_OFFENSE_LABELS,
  DEFAULT_DEFENSE_LABELS,
  SUGGESTED_OFFENSE_TAGS,
  SUGGESTED_DEFENSE_TAGS,
  generateDefaultPositions,
  createInitialPracticeDrillGroups,
  executeIntelligentAutoFill,
  AutoFillSummary,
} from './practiceDrillsUtils';

interface PracticeLiveDrillsViewProps {
  currentWeek: string;
  practiceDrillGroups: LiveDrillGroup[];
  onUpdatePracticeDrillGroups: (groups: LiveDrillGroup[]) => void;
  roster: RosterPlayer[];
  userRole: UserRole;
  depthChart?: Record<string, PlacedPlayer[]>;
  scrimmageChart?: Record<string, PlacedPlayer[]>;
  formations?: FormationBoard[];
  activeTeam?: Team;
  onDragStartPlacedPlayer?: (
    e: React.DragEvent,
    posId: string,
    idx: number,
    player: PlacedPlayer
  ) => void;
}

export const PracticeLiveDrillsView: React.FC<PracticeLiveDrillsViewProps> = ({
  currentWeek,
  practiceDrillGroups,
  onUpdatePracticeDrillGroups,
  roster,
  userRole,
  depthChart = {},
  scrimmageChart = {},
  formations = [],
  activeTeam,
  onDragStartPlacedPlayer,
}) => {
  // Ensure we have at least one drill group and initialize if empty
  const groups: LiveDrillGroup[] = useMemo(() => {
    if (Array.isArray(practiceDrillGroups) && practiceDrillGroups.length > 0) {
      return practiceDrillGroups;
    }
    return createInitialPracticeDrillGroups();
  }, [practiceDrillGroups]);

  // Sync initial groups to parent if empty initially
  useEffect(() => {
    if (!practiceDrillGroups || practiceDrillGroups.length === 0) {
      onUpdatePracticeDrillGroups(groups);
    }
  }, []);

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return groups[0]?.id || '';
  });

  // Keep active group valid
  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || groups[0] || createInitialPracticeDrillGroups()[0];
  }, [groups, activeGroupId]);

  // View presentation mode: 'side_by_side' | 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'side_by_side' | 'grid' | 'table'>('side_by_side');

  // Filter unit: 'both' | 'offense' | 'defense'
  const [filterUnit, setFilterUnit] = useState<'both' | 'offense' | 'defense'>('both');

  // Inline editing state for drill title
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleDraft, setTitleDraft] = useState<string>('');

  // Inline editing for position slot name
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editingPosName, setEditingPosName] = useState<string>('');

  // Quick player assignment modal
  const [assigningPos, setAssigningPos] = useState<{
    id: string;
    name: string;
    unit: 'offense' | 'defense';
  } | null>(null);
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');

  // Auto-fill feedback toast
  const [autoFillFeedback, setAutoFillFeedback] = useState<string | null>(null);

  // Auto-fill options modal
  const [showAutoFillModal, setShowAutoFillModal] = useState<boolean>(false);

  // Color picker open states
  const [showColorPicker, setShowColorPicker] = useState<'offense' | 'defense' | null>(null);

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printScope, setPrintScope] = useState<'active' | 'all'>('active');
  const [includePrintRepLog, setIncludePrintRepLog] = useState<boolean>(true);

  // Quick Add Slot popup
  const [showAddSlotUnit, setShowAddSlotUnit] = useState<'offense' | 'defense' | null>(null);
  const [customSlotName, setCustomSlotName] = useState<string>('');

  // --------------------------------------------------------------------------
  // DYNAMIC TEAM LABELS MANAGEMENT (Add, Delete, Persist)
  // --------------------------------------------------------------------------
  const [offenseCustomLabels, setOffenseCustomLabels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('football_offense_team_labels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_OFFENSE_LABELS;
  });

  const [defenseCustomLabels, setDefenseCustomLabels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('football_defense_team_labels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_DEFENSE_LABELS;
  });

  const [newOffenseLabelInput, setNewOffenseLabelInput] = useState<string>('');
  const [newDefenseLabelInput, setNewDefenseLabelInput] = useState<string>('');

  const handleAddOffenseLabel = (labelToAdd?: string) => {
    const val = (labelToAdd !== undefined ? labelToAdd : newOffenseLabelInput).trim();
    if (!val) return;
    const exists = offenseCustomLabels.some((l) => l.toLowerCase() === val.toLowerCase());
    const nextList = exists ? offenseCustomLabels : [...offenseCustomLabels, val];
    setOffenseCustomLabels(nextList);
    try {
      localStorage.setItem('football_offense_team_labels', JSON.stringify(nextList));
    } catch (e) {}
    updateGroup({ ...currentGroup, offenseLabel: val });
    setNewOffenseLabelInput('');
  };

  const handleDeleteOffenseLabel = (labelToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = offenseCustomLabels.filter((l) => l !== labelToDelete);
    setOffenseCustomLabels(nextList);
    try {
      localStorage.setItem('football_offense_team_labels', JSON.stringify(nextList));
    } catch (e) {}
  };

  const handleAddDefenseLabel = (labelToAdd?: string) => {
    const val = (labelToAdd !== undefined ? labelToAdd : newDefenseLabelInput).trim();
    if (!val) return;
    const exists = defenseCustomLabels.some((l) => l.toLowerCase() === val.toLowerCase());
    const nextList = exists ? defenseCustomLabels : [...defenseCustomLabels, val];
    setDefenseCustomLabels(nextList);
    try {
      localStorage.setItem('football_defense_team_labels', JSON.stringify(nextList));
    } catch (e) {}
    updateGroup({ ...currentGroup, defenseLabel: val });
    setNewDefenseLabelInput('');
  };

  const handleDeleteDefenseLabel = (labelToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = defenseCustomLabels.filter((l) => l !== labelToDelete);
    setDefenseCustomLabels(nextList);
    try {
      localStorage.setItem('football_defense_team_labels', JSON.stringify(nextList));
    } catch (e) {}
  };

  // Helper to commit updated groups and notify parent
  const updateGroup = (updated: LiveDrillGroup) => {
    const next = groups.map((g) => (g.id === updated.id ? updated : g));
    onUpdatePracticeDrillGroups(next);
  };

  // --------------------------------------------------------------------------
  // TAB / DRILL MANAGEMENT
  // --------------------------------------------------------------------------
  const handleAddNewGroup = (format: LiveDrillFormat = '7v7') => {
    const gen = generateDefaultPositions(format);
    const newGroup: LiveDrillGroup = {
      id: `live_group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `New ${format.toUpperCase()} Practice Drill`,
      format,
      offenseLabel: format === '7v7' ? '1st Team Offense' : 'Varsity Offense',
      defenseLabel: format === '7v7' ? '1st Team Defense' : 'Varsity Defense',
      offenseColor: 'gold',
      defenseColor: 'blue',
      notes: '',
      offensePositions: gen.offense,
      defensePositions: gen.defense,
      lineup: {},
      createdAt: Date.now(),
    };
    const next = [...groups, newGroup];
    onUpdatePracticeDrillGroups(next);
    setActiveGroupId(newGroup.id);
  };

  const handleDuplicateGroup = (group: LiveDrillGroup) => {
    const copyId = `live_group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cloned: LiveDrillGroup = {
      ...group,
      id: copyId,
      name: `${group.name} (Copy)`,
      lineup: { ...group.lineup },
      createdAt: Date.now(),
    };
    const next = [...groups, cloned];
    onUpdatePracticeDrillGroups(next);
    setActiveGroupId(copyId);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groups.length <= 1) {
      alert('You must keep at least one practice drill group.');
      return;
    }
    if (!confirm('Are you sure you want to delete this drill group?')) return;
    const remaining = groups.filter((g) => g.id !== groupId);
    onUpdatePracticeDrillGroups(remaining);
    if (activeGroupId === groupId) {
      setActiveGroupId(remaining[0].id);
    }
  };

  const handleChangeFormat = (newFormat: LiveDrillFormat) => {
    if (!currentGroup) return;
    if (newFormat === currentGroup.format) return;
    const shouldResetPositions = confirm(
      `Switch format to ${newFormat.toUpperCase()}? Reset position slots to default ${newFormat.toUpperCase()} layout? (Click Cancel to keep existing slots)`
    );

    if (shouldResetPositions) {
      const gen = generateDefaultPositions(newFormat);
      updateGroup({
        ...currentGroup,
        format: newFormat,
        offensePositions: gen.offense,
        defensePositions: gen.defense,
      });
    } else {
      updateGroup({
        ...currentGroup,
        format: newFormat,
      });
    }
  };

  // --------------------------------------------------------------------------
  // QUANTITY & POSITION SLOT CUSTOMIZATION
  // --------------------------------------------------------------------------
  const handleAdjustQuantity = (unit: 'offense' | 'defense', delta: number) => {
    if (!currentGroup) return;
    const positions = unit === 'offense' ? currentGroup.offensePositions : currentGroup.defensePositions;
    const newCount = positions.length + delta;
    if (newCount < 1) return;
    if (newCount > 22) return;

    if (delta > 0) {
      // Add a slot
      const ts = Date.now();
      const nextNum = newCount;
      const defaultName = unit === 'offense' ? `Skill / Slot ${nextNum}` : `Defender ${nextNum}`;
      const newPos: LiveDrillPosition = {
        id: `pos_${unit}_${ts}_${Math.random().toString(36).substring(2, 6)}`,
        name: defaultName,
        unit,
      };
      if (unit === 'offense') {
        updateGroup({
          ...currentGroup,
          offensePositions: [...currentGroup.offensePositions, newPos],
        });
      } else {
        updateGroup({
          ...currentGroup,
          defensePositions: [...currentGroup.defensePositions, newPos],
        });
      }
    } else {
      // Remove last slot
      const lastPos = positions[positions.length - 1];
      const nextLineup = { ...currentGroup.lineup };
      if (lastPos) {
        delete nextLineup[lastPos.id];
      }
      if (unit === 'offense') {
        updateGroup({
          ...currentGroup,
          offensePositions: currentGroup.offensePositions.slice(0, -1),
          lineup: nextLineup,
        });
      } else {
        updateGroup({
          ...currentGroup,
          defensePositions: currentGroup.defensePositions.slice(0, -1),
          lineup: nextLineup,
        });
      }
    }
  };

  const handleApplyPresetQuantity = (unit: 'offense' | 'defense', formatPreset: LiveDrillFormat) => {
    if (!currentGroup) return;
    const gen = generateDefaultPositions(formatPreset);
    const newPositions = unit === 'offense' ? gen.offense : gen.defense;

    if (unit === 'offense') {
      updateGroup({
        ...currentGroup,
        offensePositions: newPositions,
      });
    } else {
      updateGroup({
        ...currentGroup,
        defensePositions: newPositions,
      });
    }
  };

  const handleAddSingleSlot = (unit: 'offense' | 'defense', slotName: string) => {
    if (!currentGroup || !slotName.trim()) return;
    const ts = Date.now();
    const newPos: LiveDrillPosition = {
      id: `pos_${unit}_${ts}_${Math.random().toString(36).substring(2, 6)}`,
      name: slotName.trim(),
      unit,
    };
    if (unit === 'offense') {
      updateGroup({
        ...currentGroup,
        offensePositions: [...currentGroup.offensePositions, newPos],
      });
    } else {
      updateGroup({
        ...currentGroup,
        defensePositions: [...currentGroup.defensePositions, newPos],
      });
    }
    setCustomSlotName('');
    setShowAddSlotUnit(null);
  };

  const handleRemovePositionSlot = (posId: string, unit: 'offense' | 'defense') => {
    if (!currentGroup) return;
    const nextLineup = { ...currentGroup.lineup };
    delete nextLineup[posId];

    if (unit === 'offense') {
      updateGroup({
        ...currentGroup,
        offensePositions: currentGroup.offensePositions.filter((p) => p.id !== posId),
        lineup: nextLineup,
      });
    } else {
      updateGroup({
        ...currentGroup,
        defensePositions: currentGroup.defensePositions.filter((p) => p.id !== posId),
        lineup: nextLineup,
      });
    }
  };

  const handleMovePositionSlot = (posId: string, unit: 'offense' | 'defense', direction: 'up' | 'down') => {
    if (!currentGroup) return;
    const positions = unit === 'offense' ? [...currentGroup.offensePositions] : [...currentGroup.defensePositions];
    const idx = positions.findIndex((p) => p.id === posId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= positions.length) return;

    const temp = positions[idx];
    positions[idx] = positions[targetIdx];
    positions[targetIdx] = temp;

    if (unit === 'offense') {
      updateGroup({ ...currentGroup, offensePositions: positions });
    } else {
      updateGroup({ ...currentGroup, defensePositions: positions });
    }
  };

  const handleStartRenamePosition = (pos: LiveDrillPosition) => {
    setEditingPosId(pos.id);
    setEditingPosName(pos.name);
  };

  const handleSaveRenamePosition = () => {
    if (!currentGroup || !editingPosId) return;
    const clean = editingPosName.trim();
    if (!clean) {
      setEditingPosId(null);
      return;
    }

    const updateList = (list: LiveDrillPosition[]) =>
      list.map((p) => (p.id === editingPosId ? { ...p, name: clean } : p));

    updateGroup({
      ...currentGroup,
      offensePositions: updateList(currentGroup.offensePositions),
      defensePositions: updateList(currentGroup.defensePositions),
    });
    setEditingPosId(null);
  };

  // --------------------------------------------------------------------------
  // PLAYER ASSIGNMENTS & AUTO-FILL
  // --------------------------------------------------------------------------
  const handleAssignPlayer = (posId: string, player: PlacedPlayer) => {
    if (!currentGroup) return;
    const currentList = currentGroup.lineup[posId] || [];
    if (currentList.some((p) => String(p.num) === String(player.num))) {
      return;
    }
    const updatedLineup = {
      ...currentGroup.lineup,
      [posId]: [...currentList, player],
    };
    updateGroup({
      ...currentGroup,
      lineup: updatedLineup,
    });
  };

  const handleRemovePlayer = (posId: string, playerIndex: number) => {
    if (!currentGroup) return;
    const currentList = [...(currentGroup.lineup[posId] || [])];
    currentList.splice(playerIndex, 1);
    const updatedLineup = {
      ...currentGroup.lineup,
      [posId]: currentList,
    };
    updateGroup({
      ...currentGroup,
      lineup: updatedLineup,
    });
  };

  const handleClearLineup = (unit?: 'offense' | 'defense') => {
    if (!currentGroup) return;
    if (!confirm(`Clear player assignments for ${unit ? unit.toUpperCase() : 'this entire drill'}?`)) return;

    if (!unit) {
      updateGroup({ ...currentGroup, lineup: {} });
      return;
    }

    const nextLineup = { ...currentGroup.lineup };
    const positionsToClear = unit === 'offense' ? currentGroup.offensePositions : currentGroup.defensePositions;
    positionsToClear.forEach((p) => {
      delete nextLineup[p.id];
    });
    updateGroup({ ...currentGroup, lineup: nextLineup });
  };

  const handleRunAutoFill = (options: {
    targetString: 1 | 2;
    fillUnit: 'both' | 'offense' | 'defense';
  }) => {
    if (!currentGroup) return;
    const result = executeIntelligentAutoFill({
      group: currentGroup,
      formations,
      depthChart,
      scrimmageChart,
      roster,
      targetString: options.targetString,
      fillUnit: options.fillUnit,
    });

    updateGroup({
      ...currentGroup,
      lineup: result.nextLineup,
    });

    const msg = `Auto-filled ${result.summary.filledOffense}/${result.summary.totalOffense} Offense & ${result.summary.filledDefense}/${result.summary.totalDefense} Defense slots (${result.summary.sourceDescription})`;
    setAutoFillFeedback(msg);
    setTimeout(() => setAutoFillFeedback(null), 5000);
    setShowAutoFillModal(false);
  };

  const handleTriggerPrint = () => {
    setShowPrintModal(false);
    document.body.classList.add('is-printing', 'is-printing-drills');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing', 'is-printing-drills');
      }, 500);
    }, 150);
  };

  // Drag & drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropOnPosition = (e: React.DragEvent, posId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (userRole !== 'admin') return;

    try {
      const plainText = e.dataTransfer.getData('text/plain');
      const rosterPlayer = roster.find(
        (p) =>
          p.rosterName === plainText ||
          `${p.firstName} ${p.lastName}` === plainText ||
          p.lastName === plainText
      );
      if (rosterPlayer) {
        handleAssignPlayer(posId, {
          name: `${rosterPlayer.firstName} ${rosterPlayer.lastName}`.trim() || rosterPlayer.rosterName,
          num: rosterPlayer.num,
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSwapOffenseDefense = () => {
    if (!currentGroup) return;
    if (!confirm('Swap Offense and Defense labels and colors for this drill?')) return;
    updateGroup({
      ...currentGroup,
      offenseLabel: currentGroup.defenseLabel,
      defenseLabel: currentGroup.offenseLabel,
      offenseColor: currentGroup.defenseColor || 'blue',
      defenseColor: currentGroup.offenseColor || 'gold',
    });
  };

  // Filtered roster for manual assignment search
  const filteredRoster = useMemo(() => {
    if (!playerSearchQuery.trim()) return roster;
    const q = playerSearchQuery.toLowerCase().trim();
    return roster.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.num.toLowerCase().includes(q) ||
        (p.primaryPosition || '').toLowerCase().includes(q)
    );
  }, [roster, playerSearchQuery]);

  // Color configurations for the current active group
  const offenseColorConfig = getTeamColorConfig(currentGroup.offenseColor, 'gold');
  const defenseColorConfig = getTeamColorConfig(currentGroup.defenseColor, 'blue');

  return (
    <>
      <div className="space-y-6 pb-12 animate-in fade-in duration-200 print:hidden">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & MAIN CONTROLS BAR */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>Practice Matchups & Live Rotations</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                Week {currentWeek}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏈 Live Drills (7v7 & 11v11)</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 hidden sm:inline">
                — Full customizable offense & defense lineups, colors, and print scripts
              </span>
            </h2>
          </div>

          {/* Top action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Auto Fill Quick Button */}
            <button
              onClick={() => setShowAutoFillModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Intelligent Auto-Fill from Depth Chart & Roster"
            >
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Auto-Fill Drill</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Print Sheet Button */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Print field-ready practice card"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Print Sheet</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-750 mx-1" />

            {/* Add New Drill Group Buttons */}
            <button
              onClick={() => handleAddNewGroup('7v7')}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Add a new 7v7 Drill Group"
            >
              <Plus className="w-4 h-4" />
              <span>+ New 7v7</span>
            </button>

            <button
              onClick={() => handleAddNewGroup('11v11')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Add a new 11v11 Team Drill Group"
            >
              <Plus className="w-4 h-4" />
              <span>+ New 11v11</span>
            </button>

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'side_by_side'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Facing Matchup Board"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Facing</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Split Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Rotations Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* AutoFill Success Toast */}
        {autoFillFeedback && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{autoFillFeedback}</span>
            </div>
            <button
              onClick={() => setAutoFillFeedback(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DRILL SETS TABS STRIP */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <span>Drill Sets:</span>
          </span>
          {groups.map((group) => {
            const isActive = group.id === currentGroup.id;
            const gOffColor = getTeamColorConfig(group.offenseColor, 'gold');
            const gDefColor = getTeamColorConfig(group.defenseColor, 'blue');

            return (
              <button
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/50 shadow-xs ring-1 ring-orange-400/40'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Team Color indicator dots */}
                <div className="flex items-center -space-x-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900"
                    style={{ backgroundColor: gOffColor.hex }}
                    title={`Offense: ${gOffColor.label}`}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900"
                    style={{ backgroundColor: gDefColor.hex }}
                    title={`Defense: ${gDefColor.label}`}
                  />
                </div>
                <span>{group.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {group.format.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. ACTIVE DRILL CONTROLS & DYNAMIC COLOR / QUANTITY BAR */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm print:hidden">
        {/* Drill Title & Format Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="e.g. Period 4: 7v7 Pass Skeleton"
                  className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (titleDraft.trim()) {
                      updateGroup({ ...currentGroup, name: titleDraft.trim() });
                    }
                    setIsEditingTitle(false);
                  }}
                  className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  {currentGroup.name}
                </h3>
                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      setTitleDraft(currentGroup.name);
                      setIsEditingTitle(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
                    title="Rename Drill Title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Drill Notes / Coaching Focus */}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Coaching Focus:</span>
              <input
                type="text"
                value={currentGroup.notes || ''}
                onChange={(e) => updateGroup({ ...currentGroup, notes: e.target.value })}
                placeholder="Add drill notes (e.g. quick passes, cover 3 match, 3rd down redzone...)"
                className="bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none text-slate-700 dark:text-slate-300 text-xs py-0.5 px-1 w-full max-w-lg"
              />
            </div>
          </div>

          {/* Drill Format & Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Format Selector Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              {(['7v7', '11v11', '9v9', '1v1', 'custom'] as LiveDrillFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleChangeFormat(fmt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    currentGroup.format === fmt
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Swap Offense / Defense */}
            <button
              onClick={handleSwapOffenseDefense}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Swap Offense and Defense labels & colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Clear players */}
            <button
              onClick={() => handleClearLineup()}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Clear all player assignments"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate group */}
            <button
              onClick={() => handleDuplicateGroup(currentGroup)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Duplicate this Drill Group"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete group */}
            <button
              onClick={() => handleDeleteGroup(currentGroup.id)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Delete this Drill Group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CUSTOMIZE OFFENSE & DEFENSE (LABEL, QUANTITY, COLOR) */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          {/* ---------------- OFFENSE CUSTOMIZATION CARD ---------------- */}
          <div
            className={`border rounded-2xl p-4 transition-all shadow-xs ${offenseColorConfig.borderClass} ${offenseColorConfig.bgLightClass}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                  style={{ backgroundColor: offenseColorConfig.hex }}
                />
                <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Offense Customization</span>
                </span>
              </div>

              {/* Quantity Stepper for Offense */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-xs">
                <span className="text-[11px] font-black uppercase text-slate-500">Qty:</span>
                <button
                  onClick={() => handleAdjustQuantity('offense', -1)}
                  disabled={currentGroup.offensePositions.length <= 1}
                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  title="Remove last position slot"
                >
                  -
                </button>
                <span className="font-black text-xs px-1 text-slate-900 dark:text-white min-w-5 text-center">
                  {currentGroup.offensePositions.length}
                </span>
                <button
                  onClick={() => handleAdjustQuantity('offense', 1)}
                  disabled={currentGroup.offensePositions.length >= 22}
                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  title="Add another position slot"
                >
                  +
                </button>
              </div>
            </div>

            {/* Offense Group Label Input */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Active Offense Label:
                </label>
                {currentGroup.offenseLabel && !offenseCustomLabels.includes(currentGroup.offenseLabel) && (
                  <button
                    type="button"
                    onClick={() => handleAddOffenseLabel(currentGroup.offenseLabel)}
                    className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    title="Save current label to your saved labels list"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Save to My Labels</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={currentGroup.offenseLabel}
                onChange={(e) => updateGroup({ ...currentGroup, offenseLabel: e.target.value })}
                placeholder="e.g. 1st Team Offense"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {/* Dynamic Custom Offense Team Labels (Add, Select, Delete) */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Offense Team Labels ({offenseCustomLabels.length}):
                </span>
                {offenseCustomLabels.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOffenseCustomLabels(DEFAULT_OFFENSE_LABELS);
                      try {
                        localStorage.setItem('football_offense_team_labels', JSON.stringify(DEFAULT_OFFENSE_LABELS));
                      } catch (e) {}
                    }}
                    className="text-[10px] text-amber-600 font-bold hover:underline cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                )}
              </div>

              {/* Saved Label Badges with 1-click apply and delete */}
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto pr-1">
                {offenseCustomLabels.map((label) => {
                  const isSelected = currentGroup.offenseLabel === label;
                  return (
                    <div
                      key={label}
                      onClick={() => updateGroup({ ...currentGroup, offenseLabel: label })}
                      className={`group inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border shadow-xs ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                      title={`Click to use "${label}"`}
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOffenseLabel(label, e)}
                        className={`p-0.5 rounded hover:bg-black/20 transition-colors cursor-pointer ${
                          isSelected ? 'text-white/90 hover:text-white' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title={`Delete "${label}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {offenseCustomLabels.length === 0 && (
                  <span className="text-[11px] italic text-slate-400 py-0.5">
                    No saved labels. Add custom labels below!
                  </span>
                )}
              </div>

              {/* Add New Offense Label Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddOffenseLabel();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={newOffenseLabelInput}
                  onChange={(e) => setNewOffenseLabelInput(e.target.value)}
                  placeholder="+ Add new offense label (e.g. Freshman, Heavy)..."
                  className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!newOffenseLabelInput.trim()}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Team Color Selector & Quantity Presets for Offense */}
            <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
              {/* Color Swatches & Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500">Color:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {TEAM_COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => updateGroup({ ...currentGroup, offenseColor: color.id })}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                        (currentGroup.offenseColor || 'gold') === color.id
                          ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}

                  {/* Custom Color Dropper / Picker */}
                  <label
                    className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-400 hover:border-slate-600 dark:border-slate-500 cursor-pointer overflow-hidden group shadow-xs ml-0.5"
                    title="Pick any custom team color"
                  >
                    <Palette className="w-3 h-3 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
                    <input
                      type="color"
                      value={offenseColorConfig.hex}
                      onChange={(e) => updateGroup({ ...currentGroup, offenseColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* Quantity Preset Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Presets:</span>
                {(['7v7', '11v11', '9v9'] as LiveDrillFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleApplyPresetQuantity('offense', fmt)}
                    className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- DEFENSE CUSTOMIZATION CARD ---------------- */}
          <div
            className={`border rounded-2xl p-4 transition-all shadow-xs ${defenseColorConfig.borderClass} ${defenseColorConfig.bgLightClass}`}
            style={{
              borderColor: `${defenseColorConfig.hex}40`,
              backgroundColor: `${defenseColorConfig.hex}12`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                  style={{ backgroundColor: defenseColorConfig.hex }}
                />
                <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Defense Customization</span>
                </span>
              </div>

              {/* Quantity Stepper for Defense */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-xs">
                <span className="text-[11px] font-black uppercase text-slate-500">Qty:</span>
                <button
                  onClick={() => handleAdjustQuantity('defense', -1)}
                  disabled={currentGroup.defensePositions.length <= 1}
                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  title="Remove last position slot"
                >
                  -
                </button>
                <span className="font-black text-xs px-1 text-slate-900 dark:text-white min-w-5 text-center">
                  {currentGroup.defensePositions.length}
                </span>
                <button
                  onClick={() => handleAdjustQuantity('defense', 1)}
                  disabled={currentGroup.defensePositions.length >= 22}
                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  title="Add another position slot"
                >
                  +
                </button>
              </div>
            </div>

            {/* Defense Group Label Input */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Active Defense Label:
                </label>
                {currentGroup.defenseLabel && !defenseCustomLabels.includes(currentGroup.defenseLabel) && (
                  <button
                    type="button"
                    onClick={() => handleAddDefenseLabel(currentGroup.defenseLabel)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    title="Save current label to your saved labels list"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Save to My Labels</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={currentGroup.defenseLabel}
                onChange={(e) => updateGroup({ ...currentGroup, defenseLabel: e.target.value })}
                placeholder="e.g. 1st Team Defense"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            {/* Dynamic Custom Defense Team Labels (Add, Select, Delete) */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Defense Team Labels ({defenseCustomLabels.length}):
                </span>
                {defenseCustomLabels.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDefenseCustomLabels(DEFAULT_DEFENSE_LABELS);
                      try {
                        localStorage.setItem('football_defense_team_labels', JSON.stringify(DEFAULT_DEFENSE_LABELS));
                      } catch (e) {}
                    }}
                    className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                )}
              </div>

              {/* Saved Label Badges with 1-click apply and delete */}
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto pr-1">
                {defenseCustomLabels.map((label) => {
                  const isSelected = currentGroup.defenseLabel === label;
                  return (
                    <div
                      key={label}
                      onClick={() => updateGroup({ ...currentGroup, defenseLabel: label })}
                      className={`group inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border shadow-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/40'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}
                      title={`Click to use "${label}"`}
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDefenseLabel(label, e)}
                        className={`p-0.5 rounded hover:bg-black/20 transition-colors cursor-pointer ${
                          isSelected ? 'text-white/90 hover:text-white' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title={`Delete "${label}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {defenseCustomLabels.length === 0 && (
                  <span className="text-[11px] italic text-slate-400 py-0.5">
                    No saved labels. Add custom labels below!
                  </span>
                )}
              </div>

              {/* Add New Defense Label Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDefenseLabel();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={newDefenseLabelInput}
                  onChange={(e) => setNewDefenseLabelInput(e.target.value)}
                  placeholder="+ Add new defense label (e.g. Goal Line, Nickel)..."
                  className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!newDefenseLabelInput.trim()}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Team Color Selector & Quantity Presets for Defense */}
            <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
              {/* Color Swatches & Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500">Color:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {TEAM_COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => updateGroup({ ...currentGroup, defenseColor: color.id })}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                        (currentGroup.defenseColor || 'blue') === color.id
                          ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}

                  {/* Custom Color Dropper / Picker */}
                  <label
                    className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-400 hover:border-slate-600 dark:border-slate-500 cursor-pointer overflow-hidden group shadow-xs ml-0.5"
                    title="Pick any custom team color"
                  >
                    <Palette className="w-3 h-3 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
                    <input
                      type="color"
                      value={defenseColorConfig.hex}
                      onChange={(e) => updateGroup({ ...currentGroup, defenseColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* Quantity Preset Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Presets:</span>
                {(['7v7', '11v11', '9v9'] as LiveDrillFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleApplyPresetQuantity('defense', fmt)}
                    className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. INTERACTIVE MATCHUP BOARD (OFFENSE VS DEFENSE) */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        {/* Matchup Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-lg font-black text-xs shadow-xs"
                style={{ backgroundColor: offenseColorConfig.hex, color: offenseColorConfig.badgeText.includes('white') ? '#fff' : '#000' }}
              >
                {currentGroup.offenseLabel}
              </span>
              <span className="text-slate-400 font-black">vs</span>
              <span
                className="px-2.5 py-0.5 rounded-lg font-black text-xs shadow-xs"
                style={{ backgroundColor: defenseColorConfig.hex, color: defenseColorConfig.badgeText.includes('white') ? '#fff' : '#000' }}
              >
                {currentGroup.defenseLabel}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Drag players or click &ldquo;+ Assign&rdquo; to set starters and backup rotation depth.
            </p>
          </div>

          {/* Unit Filter Tabs & Add Slot Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Unit Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setFilterUnit('both')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterUnit === 'both'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setFilterUnit('offense')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterUnit === 'offense'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Offense
              </button>
              <button
                onClick={() => setFilterUnit('defense')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterUnit === 'defense'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Defense
              </button>
            </div>

            {/* Quick Add Slot buttons */}
            <button
              onClick={() => setShowAddSlotUnit(showAddSlotUnit === 'offense' ? null : 'offense')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Offense Slot</span>
            </button>
            <button
              onClick={() => setShowAddSlotUnit(showAddSlotUnit === 'defense' ? null : 'defense')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700/60 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Defense Slot</span>
            </button>
          </div>
        </div>

        {/* Quick Add Slot Popover */}
        {showAddSlotUnit && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-orange-500" />
                <span>Add Position Slot to {showAddSlotUnit.toUpperCase()}</span>
              </span>
              <button
                onClick={() => setShowAddSlotUnit(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tag suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(showAddSlotUnit === 'offense' ? SUGGESTED_OFFENSE_TAGS : SUGGESTED_DEFENSE_TAGS).map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddSingleSlot(showAddSlotUnit, tag)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-orange-400 hover:text-orange-600 cursor-pointer"
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>

            {/* Custom text input */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={customSlotName}
                onChange={(e) => setCustomSlotName(e.target.value)}
                placeholder="Or type custom slot name (e.g. Gunner, Rover, Dime...)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSingleSlot(showAddSlotUnit, customSlotName);
                }}
              />
              <button
                onClick={() => handleAddSingleSlot(showAddSlotUnit, customSlotName)}
                disabled={!customSlotName.trim()}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer shrink-0"
              >
                Add Slot
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW MODE 1: SIDE-BY-SIDE / FACING LAYOUT */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OFFENSE COLUMN */}
            {(filterUnit === 'both' || filterUnit === 'offense') && (
              <div className="space-y-3">
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${offenseColorConfig.borderClass} ${offenseColorConfig.bgLightClass}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900"
                      style={{ backgroundColor: offenseColorConfig.hex }}
                    />
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {currentGroup.offenseLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {currentGroup.offensePositions.length} Positions
                    </span>
                    <button
                      onClick={() => handleClearLineup('offense')}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Clear Offense Players"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Positions list */}
                <div className="space-y-2.5">
                  {currentGroup.offensePositions.map((pos, pIdx) => {
                    const assigned = currentGroup.lineup[pos.id] || [];
                    const starter = assigned[0];
                    const backups = assigned.slice(1);

                    return (
                      <div
                        key={pos.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnPosition(e, pos.id)}
                        className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {editingPosId === pos.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingPosName}
                                onChange={(e) => setEditingPosName(e.target.value)}
                                className="px-2 py-0.5 rounded-md border text-xs font-bold w-24 bg-white dark:bg-slate-900"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveRenamePosition}
                                className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-2 py-0.5 rounded-lg font-black text-xs border shadow-xs"
                                style={{
                                  backgroundColor: offenseColorConfig.hex,
                                  color: offenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                  borderColor: offenseColorConfig.hex,
                                }}
                              >
                                {pos.name}
                              </span>
                              <button
                                onClick={() => handleStartRenamePosition(pos)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                title="Rename position"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            {/* Reorder arrows */}
                            <button
                              onClick={() => handleMovePositionSlot(pos.id, 'offense', 'up')}
                              disabled={pIdx === 0}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-20 p-0.5 cursor-pointer"
                              title="Move slot up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMovePositionSlot(pos.id, 'offense', 'down')}
                              disabled={pIdx === currentGroup.offensePositions.length - 1}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-20 p-0.5 cursor-pointer"
                              title="Move slot down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() =>
                                setAssigningPos({ id: pos.id, name: pos.name, unit: 'offense' })
                              }
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Player</span>
                            </button>
                            <button
                              onClick={() => handleRemovePositionSlot(pos.id, 'offense')}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove slot"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Player Slots (Starter + Backups) */}
                        <div className="space-y-1.5">
                          {starter ? (
                            <div
                              draggable={userRole === 'admin'}
                              onDragStart={(e) =>
                                onDragStartPlacedPlayer &&
                                onDragStartPlacedPlayer(e, pos.id, 0, starter)
                              }
                              className={`flex items-center justify-between px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs ${offenseColorConfig.bgLightClass} ${offenseColorConfig.borderClass}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                                  style={{ backgroundColor: offenseColorConfig.hex }}
                                >
                                  #{starter.num}
                                </span>
                                <span className="truncate text-slate-900 dark:text-white">
                                  {starter.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase">
                                  1st
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemovePlayer(pos.id, 0)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Remove starter"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setAssigningPos({ id: pos.id, name: pos.name, unit: 'offense' })
                              }
                              className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 text-center text-xs text-slate-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-all"
                            >
                              + Drop or assign starter player
                            </div>
                          )}

                          {/* Backups / Rotations */}
                          {backups.length > 0 && (
                            <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-1 mt-1">
                              {backups.map((backup, bIdx) => (
                                <div
                                  key={`${backup.num}_${bIdx}`}
                                  className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{backup.num}
                                    </span>
                                    <span className="truncate">{backup.name}</span>
                                    <span className="text-[9px] text-slate-400">
                                      (Rot {bIdx + 2})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlayer(pos.id, bIdx + 1)}
                                    className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DEFENSE COLUMN */}
            {(filterUnit === 'both' || filterUnit === 'defense') && (
              <div className="space-y-3">
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${defenseColorConfig.borderClass} ${defenseColorConfig.bgLightClass}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900"
                      style={{ backgroundColor: defenseColorConfig.hex }}
                    />
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {currentGroup.defenseLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {currentGroup.defensePositions.length} Positions
                    </span>
                    <button
                      onClick={() => handleClearLineup('defense')}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Clear Defense Players"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Positions list */}
                <div className="space-y-2.5">
                  {currentGroup.defensePositions.map((pos, pIdx) => {
                    const assigned = currentGroup.lineup[pos.id] || [];
                    const starter = assigned[0];
                    const backups = assigned.slice(1);

                    return (
                      <div
                        key={pos.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnPosition(e, pos.id)}
                        className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {editingPosId === pos.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingPosName}
                                onChange={(e) => setEditingPosName(e.target.value)}
                                className="px-2 py-0.5 rounded-md border text-xs font-bold w-24 bg-white dark:bg-slate-900"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveRenamePosition}
                                className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-2 py-0.5 rounded-lg font-black text-xs border shadow-xs"
                                style={{
                                  backgroundColor: defenseColorConfig.hex,
                                  color: defenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                  borderColor: defenseColorConfig.hex,
                                }}
                              >
                                {pos.name}
                              </span>
                              <button
                                onClick={() => handleStartRenamePosition(pos)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                title="Rename position"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            {/* Reorder arrows */}
                            <button
                              onClick={() => handleMovePositionSlot(pos.id, 'defense', 'up')}
                              disabled={pIdx === 0}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-20 p-0.5 cursor-pointer"
                              title="Move slot up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMovePositionSlot(pos.id, 'defense', 'down')}
                              disabled={pIdx === currentGroup.defensePositions.length - 1}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-20 p-0.5 cursor-pointer"
                              title="Move slot down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() =>
                                setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense' })
                              }
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Player</span>
                            </button>
                            <button
                              onClick={() => handleRemovePositionSlot(pos.id, 'defense')}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove slot"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Player Slots (Starter + Backups) */}
                        <div className="space-y-1.5">
                          {starter ? (
                            <div
                              draggable={userRole === 'admin'}
                              onDragStart={(e) =>
                                onDragStartPlacedPlayer &&
                                onDragStartPlacedPlayer(e, pos.id, 0, starter)
                              }
                              className={`flex items-center justify-between px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs ${defenseColorConfig.bgLightClass} ${defenseColorConfig.borderClass}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                                  style={{ backgroundColor: defenseColorConfig.hex }}
                                >
                                  #{starter.num}
                                </span>
                                <span className="truncate text-slate-900 dark:text-white">
                                  {starter.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase">
                                  1st
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemovePlayer(pos.id, 0)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Remove starter"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense' })
                              }
                              className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 text-center text-xs text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all"
                            >
                              + Drop or assign starter player
                            </div>
                          )}

                          {/* Backups / Rotations */}
                          {backups.length > 0 && (
                            <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-1 mt-1">
                              {backups.map((backup, bIdx) => (
                                <div
                                  key={`${backup.num}_${bIdx}`}
                                  className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{backup.num}
                                    </span>
                                    <span className="truncate">{backup.name}</span>
                                    <span className="text-[9px] text-slate-400">
                                      (Rot {bIdx + 2})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlayer(pos.id, bIdx + 1)}
                                    className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW MODE 2: GRID CARDS LAYOUT */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === 'grid' && (
          <div className="space-y-6">
            {/* Offense Card */}
            {(filterUnit === 'both' || filterUnit === 'offense') && (
              <div
                className={`border rounded-3xl p-5 shadow-xs ${offenseColorConfig.borderClass} ${offenseColorConfig.bgLightClass}`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: offenseColorConfig.hex }}
                    />
                    <h5 className="font-black text-base text-slate-900 dark:text-white">
                      {currentGroup.offenseLabel}
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {currentGroup.offensePositions.length} Positions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentGroup.offensePositions.map((pos) => {
                    const assigned = currentGroup.lineup[pos.id] || [];
                    const starter = assigned[0];
                    return (
                      <div
                        key={pos.id}
                        onClick={() =>
                          setAssigningPos({ id: pos.id, name: pos.name, unit: 'offense' })
                        }
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="px-2 py-0.5 rounded-md font-black text-xs"
                            style={{
                              backgroundColor: offenseColorConfig.hex,
                              color: offenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                            }}
                          >
                            {pos.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {assigned.length} assigned
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {starter ? `#${starter.num} ${starter.name}` : '+ Assign Player'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Defense Card */}
            {(filterUnit === 'both' || filterUnit === 'defense') && (
              <div
                className={`border rounded-3xl p-5 shadow-xs ${defenseColorConfig.borderClass} ${defenseColorConfig.bgLightClass}`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: defenseColorConfig.hex }}
                    />
                    <h5 className="font-black text-base text-slate-900 dark:text-white">
                      {currentGroup.defenseLabel}
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {currentGroup.defensePositions.length} Positions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentGroup.defensePositions.map((pos) => {
                    const assigned = currentGroup.lineup[pos.id] || [];
                    const starter = assigned[0];
                    return (
                      <div
                        key={pos.id}
                        onClick={() =>
                          setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense' })
                        }
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="px-2 py-0.5 rounded-md font-black text-xs"
                            style={{
                              backgroundColor: defenseColorConfig.hex,
                              color: defenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                            }}
                          >
                            {pos.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {assigned.length} assigned
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {starter ? `#${starter.num} ${starter.name}` : '+ Assign Player'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW MODE 3: ROTATIONS DEPTH SPREADSHEET TABLE */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === 'table' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offense Table */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: offenseColorConfig.hex }}
                />
                <h5 className="font-black text-sm text-slate-900 dark:text-white">
                  {currentGroup.offenseLabel} (Rotations Depth)
                </h5>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                    <tr>
                      <th className="p-2.5">Slot</th>
                      <th className="p-2.5">1st String (Starter)</th>
                      <th className="p-2.5">2nd String (Backup)</th>
                      <th className="p-2.5">3rd String</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {currentGroup.offensePositions.map((pos) => {
                      const assigned = currentGroup.lineup[pos.id] || [];
                      return (
                        <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-black text-slate-900 dark:text-white">
                            {pos.name}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {assigned[0] ? `#${assigned[0].num} ${assigned[0].name}` : '—'}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {assigned[1] ? `#${assigned[1].num} ${assigned[1].name}` : '—'}
                          </td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-500">
                            {assigned[2] ? `#${assigned[2].num} ${assigned[2].name}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Defense Table */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: defenseColorConfig.hex }}
                />
                <h5 className="font-black text-sm text-slate-900 dark:text-white">
                  {currentGroup.defenseLabel} (Rotations Depth)
                </h5>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                    <tr>
                      <th className="p-2.5">Slot</th>
                      <th className="p-2.5">1st String (Starter)</th>
                      <th className="p-2.5">2nd String (Backup)</th>
                      <th className="p-2.5">3rd String</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {currentGroup.defensePositions.map((pos) => {
                      const assigned = currentGroup.lineup[pos.id] || [];
                      return (
                        <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-black text-slate-900 dark:text-white">
                            {pos.name}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {assigned[0] ? `#${assigned[0].num} ${assigned[0].name}` : '—'}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {assigned[1] ? `#${assigned[1].num} ${assigned[1].name}` : '—'}
                          </td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-500">
                            {assigned[2] ? `#${assigned[2].num} ${assigned[2].name}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. AUTO-FILL INTELLIGENT MODAL */}
      {/* ==================================================================== */}
      {showAutoFillModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Auto-Fill Drill Matchup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Populate 11v11 or 7v7 slots from Depth Chart & Roster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAutoFillModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4">
              <button
                onClick={() => handleRunAutoFill({ targetString: 1, fillUnit: 'both' })}
                className="w-full text-left p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-600/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-amber-950 dark:text-amber-200">
                    ⚡ Auto-Fill 1st String Starters (Both)
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Run →
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-1">
                  Pulls starting depth chart players for both Offense & Defense positions with smart roster fallback.
                </p>
              </button>

              <button
                onClick={() => handleRunAutoFill({ targetString: 2, fillUnit: 'both' })}
                className="w-full text-left p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-300 dark:border-sky-600/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-sky-950 dark:text-sky-200">
                    🔄 Auto-Fill 2nd String Backups (Both)
                  </span>
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Run →
                  </span>
                </div>
                <p className="text-xs text-sky-800/80 dark:text-sky-300/70 mt-1">
                  Populates 2nd-string rotation depth players behind existing starters.
                </p>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleRunAutoFill({ targetString: 1, fillUnit: 'offense' })}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <div className="text-amber-600 font-black mb-0.5">Offense Only</div>
                  <div className="text-[11px] text-slate-500">Fill starters on Offense</div>
                </button>
                <button
                  onClick={() => handleRunAutoFill({ targetString: 1, fillUnit: 'defense' })}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <div className="text-blue-600 font-black mb-0.5">Defense Only</div>
                  <div className="text-[11px] text-slate-500">Fill starters on Defense</div>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAutoFillModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. PLAYER ASSIGNMENT SEARCH MODAL */}
      {/* ==================================================================== */}
      {assigningPos && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>Assign Player to</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {assigningPos.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a roster athlete to add as starter or rotation depth
                </p>
              </div>
              <button
                onClick={() => setAssigningPos(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Search player name, jersey #, position..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Roster list */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredRoster.map((player) => (
                <button
                  key={player.num}
                  onClick={() => {
                    handleAssignPlayer(assigningPos.id, {
                      name: `${player.firstName} ${player.lastName}`.trim() || player.rosterName,
                      num: player.num,
                    });
                    setAssigningPos(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      #{player.num}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Pos: {player.primaryPosition || 'ATH'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Assign
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. PRINT MODAL (PREVIEW & SCRIPT OPTIONS) */}
      {/* ==================================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Print Practice Cards & Scripts
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Print Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Print Scope:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrintScope('active')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      printScope === 'active'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-black text-xs">Current Drill Only</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {currentGroup.name}
                    </div>
                  </button>
                  <button
                    onClick={() => setPrintScope('all')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      printScope === 'all'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-black text-xs">All Practice Drills</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Full packet ({groups.length} Drills)
                    </div>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePrintRepLog}
                    onChange={(e) => setIncludePrintRepLog(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Include Sideline Live Rep & Snap Chart (for coaches to log reps)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerPrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* ==================================================================== */}
      {/* 7. FIELD-READY PRINT LAYOUT (PRINT ONLY) */}
      {/* ==================================================================== */}
      <div className="hidden print:block font-sans text-slate-900 bg-white">
        {(printScope === 'active' ? [currentGroup] : groups).map((drill, dIdx) => {
          const dOffColor = getTeamColorConfig(drill.offenseColor, 'gold');
          const dDefColor = getTeamColorConfig(drill.defenseColor, 'blue');

          return (
            <div
              key={drill.id}
              className={`p-6 ${dIdx > 0 ? 'break-before-page' : ''}`}
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">
                    {activeTeam?.name || 'Football Operations'} — Practice Script & Matchup
                  </h1>
                  <p className="text-xs font-bold text-slate-700">
                    Week {currentWeek} • Drill: {drill.name} ({drill.format.toUpperCase()} Format)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black uppercase px-2 py-1 bg-slate-900 text-white rounded">
                    Field Script
                  </span>
                </div>
              </div>

              {/* Coaching Focus */}
              {drill.notes && (
                <div className="mb-4 p-2.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold">
                  <span className="font-black uppercase">Coaching Focus / Notes: </span>
                  {drill.notes}
                </div>
              )}

              {/* Offense & Defense side-by-side tables */}
              <div className="grid grid-cols-2 gap-6 mb-5">
                {/* Offense */}
                <div>
                  <h2
                    className="text-sm font-black uppercase border-b-2 pb-1 mb-2 flex items-center justify-between"
                    style={{ borderColor: dOffColor.hex }}
                  >
                    <span>⚡ {drill.offenseLabel}</span>
                    <span className="text-xs text-slate-500 font-bold">
                      {drill.offensePositions.length} Slots
                    </span>
                  </h2>
                  <table className="w-full text-xs border border-slate-400">
                    <thead>
                      <tr className="bg-slate-200">
                        <th className="p-1 text-left border border-slate-400 w-16">Slot</th>
                        <th className="p-1 text-left border border-slate-400">Starter (1st)</th>
                        <th className="p-1 text-left border border-slate-400">Rotation (2nd)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drill.offensePositions.map((pos) => {
                        const assigned = drill.lineup[pos.id] || [];
                        const starter = assigned[0];
                        const backup = assigned[1];
                        return (
                          <tr key={pos.id} className="border-b border-slate-300">
                            <td className="p-1 font-bold border border-slate-300 bg-slate-50">
                              {pos.name}
                            </td>
                            <td className="p-1 font-black border border-slate-300">
                              {starter ? `#${starter.num} ${starter.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-600 border border-slate-300">
                              {backup ? `#${backup.num} ${backup.name}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Defense */}
                <div>
                  <h2
                    className="text-sm font-black uppercase border-b-2 pb-1 mb-2 flex items-center justify-between"
                    style={{ borderColor: dDefColor.hex }}
                  >
                    <span>🛡️ {drill.defenseLabel}</span>
                    <span className="text-xs text-slate-500 font-bold">
                      {drill.defensePositions.length} Slots
                    </span>
                  </h2>
                  <table className="w-full text-xs border border-slate-400">
                    <thead>
                      <tr className="bg-slate-200">
                        <th className="p-1 text-left border border-slate-400 w-16">Slot</th>
                        <th className="p-1 text-left border border-slate-400">Starter (1st)</th>
                        <th className="p-1 text-left border border-slate-400">Rotation (2nd)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drill.defensePositions.map((pos) => {
                        const assigned = drill.lineup[pos.id] || [];
                        const starter = assigned[0];
                        const backup = assigned[1];
                        return (
                          <tr key={pos.id} className="border-b border-slate-300">
                            <td className="p-1 font-bold border border-slate-300 bg-slate-50">
                              {pos.name}
                            </td>
                            <td className="p-1 font-black border border-slate-300">
                              {starter ? `#${starter.num} ${starter.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-600 border border-slate-300">
                              {backup ? `#${backup.num} ${backup.name}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sideline Rep Log Table */}
              {includePrintRepLog && (
                <div className="mt-4 pt-3 border-t border-slate-300">
                  <h3 className="text-xs font-black uppercase text-slate-800 mb-2">
                    Sideline Live Rep Log / Chart
                  </h3>
                  <table className="w-full text-[11px] border border-slate-400">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-1 border border-slate-400 w-12 text-center">Rep #</th>
                        <th className="p-1 border border-slate-400 w-16 text-center">Hash</th>
                        <th className="p-1 border border-slate-400 text-left">Offense Play Call</th>
                        <th className="p-1 border border-slate-400 text-left">Defense Front / Coverage</th>
                        <th className="p-1 border border-slate-400 text-left">Result / Coaching Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((rep) => (
                        <tr key={rep} className="border-b border-slate-300 h-6">
                          <td className="p-1 text-center font-bold border border-slate-300 bg-slate-50">
                            {rep}
                          </td>
                          <td className="p-1 text-center border border-slate-300"></td>
                          <td className="p-1 border border-slate-300"></td>
                          <td className="p-1 border border-slate-300"></td>
                          <td className="p-1 border border-slate-300"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
