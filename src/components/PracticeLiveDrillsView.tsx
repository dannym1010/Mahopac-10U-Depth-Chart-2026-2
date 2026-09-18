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
  ChevronLeft,
  ChevronRight,
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
  SlidersHorizontal,
  Smartphone,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  FileSpreadsheet,
  Settings2,
  Layers,
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
  const [localGroups, setLocalGroups] = useState<LiveDrillGroup[]>(() => {
    if (Array.isArray(practiceDrillGroups) && practiceDrillGroups.length > 0) {
      return practiceDrillGroups;
    }
    return createInitialPracticeDrillGroups();
  });

  useEffect(() => {
    if (Array.isArray(practiceDrillGroups) && practiceDrillGroups.length > 0) {
      setLocalGroups(practiceDrillGroups);
    }
  }, [practiceDrillGroups]);

  const groups = localGroups;

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

  // Active Matchup selection: 1 (1s vs 1s), 2 (2s vs 2s), 3 (3s vs 3s), or 'all' (View All 3 Together)
  const [activeMatchup, setActiveMatchup] = useState<1 | 2 | 3 | 'all'>(1);
  const [activeOffenseString, setActiveOffenseString] = useState<1 | 2 | 3>(1);
  const [activeDefenseString, setActiveDefenseString] = useState<1 | 2 | 3>(1);

  // Active Team being customized in the customization panel: 1 | 2 | 3
  const [customizingTeamOffense, setCustomizingTeamOffense] = useState<1 | 2 | 3>(1);
  const [customizingTeamDefense, setCustomizingTeamDefense] = useState<1 | 2 | 3>(1);

  // Matchup selection handlers
  const handleSelectMatchup = (m: 1 | 2 | 3 | 'all') => {
    setActiveMatchup(m);
    if (m === 1) {
      setActiveOffenseString(1);
      setActiveDefenseString(1);
    } else if (m === 2) {
      setActiveOffenseString(2);
      setActiveDefenseString(2);
    } else if (m === 3) {
      setActiveOffenseString(3);
      setActiveDefenseString(3);
    }
  };

  const handleNextSlide = () => {
    if (activeMatchup === 1) handleSelectMatchup(2);
    else if (activeMatchup === 2) handleSelectMatchup(3);
    else if (activeMatchup === 3) handleSelectMatchup('all');
  };

  const handlePrevSlide = () => {
    if (activeMatchup === 'all') handleSelectMatchup(3);
    else if (activeMatchup === 3) handleSelectMatchup(2);
    else if (activeMatchup === 2) handleSelectMatchup(1);
  };

  const handleNextMatchup = handleNextSlide;
  const handlePrevMatchup = handlePrevSlide;

  // Touch Swipe detection for mobile screen sliding
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      handlePrevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

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
    targetIdx?: number;
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

  // Helper to commit updated groups and notify parent
  const updateGroup = (updated: LiveDrillGroup) => {
    const next = localGroups.map((g) => (g.id === updated.id ? updated : g));
    setLocalGroups(next);
    onUpdatePracticeDrillGroups(next);
  };

  const handleAddOffenseLabel = (labelToAdd?: string) => {
    const val = (labelToAdd !== undefined ? labelToAdd : newOffenseLabelInput).trim();
    if (!val) return;
    const exists = offenseCustomLabels.some((l) => l.toLowerCase() === val.toLowerCase());
    const nextList = exists ? offenseCustomLabels : [...offenseCustomLabels, val];
    setOffenseCustomLabels(nextList);
    try {
      localStorage.setItem('football_offense_team_labels', JSON.stringify(nextList));
    } catch (e) {}
    handleUpdateOffenseLabel(val, customizingTeamOffense);
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
    handleUpdateDefenseLabel(val, customizingTeamDefense);
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

  // Multi-Team Label Resolvers
  const offenseTeam1Label = currentGroup.offenseTeam1Label || currentGroup.offenseLabel || '1st Team Offense';
  const offenseTeam2Label = currentGroup.offenseTeam2Label || '2nd Team Offense';
  const offenseTeam3Label = currentGroup.offenseTeam3Label || '3rd Team Offense';

  const getOffenseLabelForString = (str: 1 | 2 | 3) => {
    if (str === 1) return offenseTeam1Label;
    if (str === 2) return offenseTeam2Label;
    return offenseTeam3Label;
  };

  const defenseTeam1Label = currentGroup.defenseTeam1Label || currentGroup.defenseLabel || '1st Team Defense';
  const defenseTeam2Label = currentGroup.defenseTeam2Label || '2nd Team Defense';
  const defenseTeam3Label = currentGroup.defenseTeam3Label || '3rd Team Defense';

  const getDefenseLabelForString = (str: 1 | 2 | 3) => {
    if (str === 1) return defenseTeam1Label;
    if (str === 2) return defenseTeam2Label;
    return defenseTeam3Label;
  };

  // Multi-Team Color Resolvers
  const offenseTeam1Color = currentGroup.offenseColor || 'gold';
  const offenseTeam2Color = currentGroup.offenseTeam2Color || currentGroup.offenseColor || 'orange';
  const offenseTeam3Color = currentGroup.offenseTeam3Color || currentGroup.offenseColor || 'white';

  const getOffenseColorForString = (str: 1 | 2 | 3) => {
    if (str === 1) return offenseTeam1Color;
    if (str === 2) return offenseTeam2Color;
    return offenseTeam3Color;
  };

  const defenseTeam1Color = currentGroup.defenseColor || 'blue';
  const defenseTeam2Color = currentGroup.defenseTeam2Color || currentGroup.defenseColor || 'navy';
  const defenseTeam3Color = currentGroup.defenseTeam3Color || currentGroup.defenseColor || 'red';

  const getDefenseColorForString = (str: 1 | 2 | 3) => {
    if (str === 1) return defenseTeam1Color;
    if (str === 2) return defenseTeam2Color;
    return defenseTeam3Color;
  };

  // Active color configs for currently active on-field units
  const activeOffenseLabel = getOffenseLabelForString(activeOffenseString);
  const activeDefenseLabel = getDefenseLabelForString(activeDefenseString);

  const activeOffenseColorConfig = getTeamColorConfig(getOffenseColorForString(activeOffenseString), 'gold');
  const activeDefenseColorConfig = getTeamColorConfig(getDefenseColorForString(activeDefenseString), 'blue');

  const offenseColorConfig = activeOffenseColorConfig;
  const defenseColorConfig = activeDefenseColorConfig;

  // Color change handlers
  const handleUpdateOffenseColor = (colorHexOrId: string, teamNum: 1 | 2 | 3 = customizingTeamOffense) => {
    if (teamNum === 1) {
      updateGroup({ ...currentGroup, offenseColor: colorHexOrId });
    } else if (teamNum === 2) {
      updateGroup({ ...currentGroup, offenseTeam2Color: colorHexOrId });
    } else {
      updateGroup({ ...currentGroup, offenseTeam3Color: colorHexOrId });
    }
  };

  const handleUpdateDefenseColor = (colorHexOrId: string, teamNum: 1 | 2 | 3 = customizingTeamDefense) => {
    if (teamNum === 1) {
      updateGroup({ ...currentGroup, defenseColor: colorHexOrId });
    } else if (teamNum === 2) {
      updateGroup({ ...currentGroup, defenseTeam2Color: colorHexOrId });
    } else {
      updateGroup({ ...currentGroup, defenseTeam3Color: colorHexOrId });
    }
  };

  // Label change handlers
  const handleUpdateOffenseLabel = (newLabel: string, teamNum: 1 | 2 | 3 = customizingTeamOffense) => {
    if (teamNum === 1) {
      updateGroup({ ...currentGroup, offenseLabel: newLabel, offenseTeam1Label: newLabel });
    } else if (teamNum === 2) {
      updateGroup({ ...currentGroup, offenseTeam2Label: newLabel });
    } else {
      updateGroup({ ...currentGroup, offenseTeam3Label: newLabel });
    }
  };

  const handleUpdateDefenseLabel = (newLabel: string, teamNum: 1 | 2 | 3 = customizingTeamDefense) => {
    if (teamNum === 1) {
      updateGroup({ ...currentGroup, defenseLabel: newLabel, defenseTeam1Label: newLabel });
    } else if (teamNum === 2) {
      updateGroup({ ...currentGroup, defenseTeam2Label: newLabel });
    } else {
      updateGroup({ ...currentGroup, defenseTeam3Label: newLabel });
    }
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
  const handleAssignPlayer = (posId: string, player: PlacedPlayer, targetIdx?: number) => {
    if (!currentGroup) return;
    const currentList = [...(currentGroup.lineup[posId] || [])];
    
    // If targetIdx is provided, place or replace at that specific depth slot
    if (targetIdx !== undefined && targetIdx >= 0) {
      while (currentList.length <= targetIdx) {
        currentList.push({ num: '?', name: 'TBD' });
      }
      // Remove this player if they already exist elsewhere in this slot
      const filtered = currentList.map((p, idx) => (idx === targetIdx ? player : (String(p.num) === String(player.num) ? { num: '?', name: 'TBD' } : p)));
      updateGroup({
        ...currentGroup,
        lineup: {
          ...currentGroup.lineup,
          [posId]: filtered,
        },
      });
      return;
    }

    // Default append/add
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

  const handlePromoteToActive = (posId: string, fromIndex: number) => {
    if (!currentGroup) return;
    const isOffense = currentGroup.offensePositions.some((p) => p.id === posId);
    const activeString = isOffense ? activeOffenseString : activeDefenseString;
    const targetIdx = activeString - 1;

    const list = [...(currentGroup.lineup[posId] || [])];
    while (list.length <= targetIdx) {
      list.push({ num: '?', name: 'TBD' });
    }
    const temp = list[targetIdx];
    list[targetIdx] = list[fromIndex];
    list[fromIndex] = temp;

    updateGroup({
      ...currentGroup,
      lineup: {
        ...currentGroup.lineup,
        [posId]: list,
      },
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
    targetString: 1 | 2 | 3 | 'all';
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
        {/* CUSTOMIZE OFFENSE & DEFENSE (3-TEAM SUPPORT, LABELS, COLORS, QUANTITY) */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          {/* ---------------- OFFENSE CUSTOMIZATION CARD ---------------- */}
          {(() => {
            const currentSelectedColor = getOffenseColorForString(customizingTeamOffense);
            const currentSelectedLabel = getOffenseLabelForString(customizingTeamOffense);
            const selectedColorConfig = getTeamColorConfig(currentSelectedColor, 'gold');
            const isActiveOnField = activeOffenseString === customizingTeamOffense;

            return (
              <div
                className={`border-2 rounded-2xl p-4 transition-all shadow-xs ${selectedColorConfig.borderClass} ${selectedColorConfig.bgLightClass}`}
              >
                {/* Header with Title and Quantity Stepper */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                      style={{ backgroundColor: selectedColorConfig.hex }}
                    />
                    <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Offense (3 Teams Support)</span>
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

                {/* 3 OFFENSE TEAMS SELECTOR TABS */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Select Team to Customize:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Active on field: Team {activeOffenseString}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    {([1, 2, 3] as (1 | 2 | 3)[]).map((tNum) => {
                      const isSelected = customizingTeamOffense === tNum;
                      const isFieldActive = activeOffenseString === tNum;
                      const tColor = getOffenseColorForString(tNum);
                      const tLabel = getOffenseLabelForString(tNum);
                      const cfg = getTeamColorConfig(tColor, 'gold');

                      return (
                        <button
                          key={tNum}
                          type="button"
                          onClick={() => setCustomizingTeamOffense(tNum)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white"
                              style={{ backgroundColor: cfg.hex }}
                            />
                            <span className="truncate max-w-[80px]">Team {tNum}</span>
                            {isFieldActive && (
                              <span
                                className={`text-[9px] px-1 rounded-full font-black ${
                                  isSelected ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
                                }`}
                              >
                                ON
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] truncate max-w-[95px] font-normal ${
                              isSelected ? 'text-amber-100' : 'text-slate-400'
                            }`}
                          >
                            {tLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Label Input & Active Set Button */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Team {customizingTeamOffense} Label:
                    </label>
                    <div className="flex items-center gap-2">
                      {!isActiveOnField && (
                        <button
                          type="button"
                          onClick={() => setActiveOffenseString(customizingTeamOffense)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-black cursor-pointer shadow-xs transition-all"
                        >
                          ★ Make Active On Field
                        </button>
                      )}
                      {currentSelectedLabel && !offenseCustomLabels.includes(currentSelectedLabel) && (
                        <button
                          type="button"
                          onClick={() => handleAddOffenseLabel(currentSelectedLabel)}
                          className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          title="Save current label to your saved labels list"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={currentSelectedLabel}
                    onChange={(e) => handleUpdateOffenseLabel(e.target.value, customizingTeamOffense)}
                    placeholder={`e.g. ${customizingTeamOffense === 1 ? '1st Team' : customizingTeamOffense === 2 ? '2nd Team' : 'Scout'} Offense`}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                {/* Saved Label Badges with 1-click apply and delete */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Saved Labels for Team {customizingTeamOffense}:
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

                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto pr-1">
                    {offenseCustomLabels.map((label) => {
                      const isSelected = currentSelectedLabel === label;
                      return (
                        <div
                          key={label}
                          onClick={() => handleUpdateOffenseLabel(label, customizingTeamOffense)}
                          className={`group inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border shadow-xs ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500'
                          }`}
                          title={`Apply "${label}" to Team ${customizingTeamOffense}`}
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
                      placeholder="+ Add new label (e.g. Freshman, Heavy)..."
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
                  {/* Color Swatches & Native Color Dropper */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      Team {customizingTeamOffense} Color:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {TEAM_COLOR_OPTIONS.map((color) => {
                        const isChosen = currentSelectedColor.toLowerCase() === color.id.toLowerCase() || currentSelectedColor.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handleUpdateOffenseColor(color.id, customizingTeamOffense)}
                            className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                              isChosen
                                ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          />
                        );
                      })}

                      {/* Custom Color Dropper / Picker */}
                      <label
                        className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-400 hover:border-slate-600 dark:border-slate-500 cursor-pointer overflow-hidden group shadow-xs ml-0.5"
                        title="Pick any custom team color"
                      >
                        <Palette className="w-3 h-3 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
                        <input
                          type="color"
                          value={selectedColorConfig.hex}
                          onChange={(e) => handleUpdateOffenseColor(e.target.value, customizingTeamOffense)}
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
            );
          })()}

          {/* ---------------- DEFENSE CUSTOMIZATION CARD ---------------- */}
          {(() => {
            const currentSelectedColor = getDefenseColorForString(customizingTeamDefense);
            const currentSelectedLabel = getDefenseLabelForString(customizingTeamDefense);
            const selectedColorConfig = getTeamColorConfig(currentSelectedColor, 'blue');
            const isActiveOnField = activeDefenseString === customizingTeamDefense;

            return (
              <div
                className={`border-2 rounded-2xl p-4 transition-all shadow-xs ${selectedColorConfig.borderClass} ${selectedColorConfig.bgLightClass}`}
              >
                {/* Header with Title and Quantity Stepper */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                      style={{ backgroundColor: selectedColorConfig.hex }}
                    />
                    <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Defense (3 Teams Support)</span>
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

                {/* 3 DEFENSE TEAMS SELECTOR TABS */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Select Team to Customize:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Active on field: Team {activeDefenseString}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    {([1, 2, 3] as (1 | 2 | 3)[]).map((tNum) => {
                      const isSelected = customizingTeamDefense === tNum;
                      const isFieldActive = activeDefenseString === tNum;
                      const tColor = getDefenseColorForString(tNum);
                      const tLabel = getDefenseLabelForString(tNum);
                      const cfg = getTeamColorConfig(tColor, 'blue');

                      return (
                        <button
                          key={tNum}
                          type="button"
                          onClick={() => setCustomizingTeamDefense(tNum)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white"
                              style={{ backgroundColor: cfg.hex }}
                            />
                            <span className="truncate max-w-[80px]">Team {tNum}</span>
                            {isFieldActive && (
                              <span
                                className={`text-[9px] px-1 rounded-full font-black ${
                                  isSelected ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                                }`}
                              >
                                ON
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] truncate max-w-[95px] font-normal ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {tLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Label Input & Active Set Button */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Team {customizingTeamDefense} Label:
                    </label>
                    <div className="flex items-center gap-2">
                      {!isActiveOnField && (
                        <button
                          type="button"
                          onClick={() => setActiveDefenseString(customizingTeamDefense)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer shadow-xs transition-all"
                        >
                          ★ Make Active On Field
                        </button>
                      )}
                      {currentSelectedLabel && !defenseCustomLabels.includes(currentSelectedLabel) && (
                        <button
                          type="button"
                          onClick={() => handleAddDefenseLabel(currentSelectedLabel)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          title="Save current label to your saved labels list"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={currentSelectedLabel}
                    onChange={(e) => handleUpdateDefenseLabel(e.target.value, customizingTeamDefense)}
                    placeholder={`e.g. ${customizingTeamDefense === 1 ? '1st Team' : customizingTeamDefense === 2 ? '2nd Team' : 'Scout'} Defense`}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>

                {/* Saved Label Badges with 1-click apply and delete */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Saved Labels for Team {customizingTeamDefense}:
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

                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto pr-1">
                    {defenseCustomLabels.map((label) => {
                      const isSelected = currentSelectedLabel === label;
                      return (
                        <div
                          key={label}
                          onClick={() => handleUpdateDefenseLabel(label, customizingTeamDefense)}
                          className={`group inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border shadow-xs ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/40'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                          title={`Apply "${label}" to Team ${customizingTeamDefense}`}
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
                      placeholder="+ Add new label (e.g. Nickel, Goal Line)..."
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
                  {/* Color Swatches & Native Color Dropper */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      Team {customizingTeamDefense} Color:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {TEAM_COLOR_OPTIONS.map((color) => {
                        const isChosen = currentSelectedColor.toLowerCase() === color.id.toLowerCase() || currentSelectedColor.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handleUpdateDefenseColor(color.id, customizingTeamDefense)}
                            className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                              isChosen
                                ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          />
                        );
                      })}

                      {/* Custom Color Dropper / Picker */}
                      <label
                        className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-400 hover:border-slate-600 dark:border-slate-500 cursor-pointer overflow-hidden group shadow-xs ml-0.5"
                        title="Pick any custom team color"
                      >
                        <Palette className="w-3 h-3 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
                        <input
                          type="color"
                          value={selectedColorConfig.hex}
                          onChange={(e) => handleUpdateDefenseColor(e.target.value, customizingTeamDefense)}
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
            );
          })()}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. INTERACTIVE MATCHUP BOARD (OFFENSE VS DEFENSE - 3-TEAM DEPTH) */}
      {/* ==================================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all"
      >
        {/* MOBILE SLIDE / CAROUSEL & MATCHUP NAVIGATION CONTROLS */}
        <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          {/* Top Bar: Matchup Tabs & Slide Arrows */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Prev / Next Slide Arrows (Mobile & Desktop Friendly) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMatchup}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
                title="Slide to previous matchup (or swipe left/right on mobile)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Matchup Selector Tabs */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSelectMatchup(1)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeMatchup === 1
                      ? 'bg-amber-500 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Matchup 1 (1s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMatchup(2)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeMatchup === 2
                      ? 'bg-sky-600 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Matchup 2 (2s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMatchup(3)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeMatchup === 3
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Matchup 3 (3s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMatchup('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeMatchup === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="View all 3 team matchups together side-by-side"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View All 3 Together</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextMatchup}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
                title="Slide to next matchup"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile swipe helper badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <span className="hidden sm:inline">📱 Swipe to slide screen</span>
                <span className="sm:hidden">Swipe ◀ / ▶</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase">
                {activeMatchup === 'all' ? 'All 3 Matchups' : `Screen ${activeMatchup} of 3`}
              </span>
            </div>
          </div>

          {/* ACTIVE FIELD TEAM SWITCHERS (Offense & Defense independently) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Active Offense Team Switcher */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-600/40">
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: activeOffenseColorConfig.hex }}
                />
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase">
                  Active Offense:
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {([1, 2, 3] as (1 | 2 | 3)[]).map((num) => {
                  const isActive = activeOffenseString === num;
                  const label = getOffenseLabelForString(num);
                  const col = getOffenseColorForString(num);
                  const cfg = getTeamColorConfig(col, 'gold');
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setActiveOffenseString(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                        isActive
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-black ring-1 ring-amber-400'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cfg.hex }}
                      />
                      <span>{num}s: {label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Defense Team Switcher */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-blue-500/10 border border-blue-300 dark:border-blue-600/40">
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: activeDefenseColorConfig.hex }}
                />
                <span className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase">
                  Active Defense:
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {([1, 2, 3] as (1 | 2 | 3)[]).map((num) => {
                  const isActive = activeDefenseString === num;
                  const label = getDefenseLabelForString(num);
                  const col = getDefenseColorForString(num);
                  const cfg = getTeamColorConfig(col, 'blue');
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setActiveDefenseString(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-black ring-1 ring-blue-400'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cfg.hex }}
                      />
                      <span>{num}s: {label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Matchup Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-lg font-black text-xs shadow-xs"
                style={{ backgroundColor: activeOffenseColorConfig.hex, color: activeOffenseColorConfig.badgeText.includes('white') ? '#fff' : '#000' }}
              >
                {activeOffenseLabel}
              </span>
              <span className="text-slate-400 font-black">vs</span>
              <span
                className="px-2.5 py-0.5 rounded-lg font-black text-xs shadow-xs"
                style={{ backgroundColor: activeDefenseColorConfig.hex, color: activeDefenseColorConfig.badgeText.includes('white') ? '#fff' : '#000' }}
              >
                {activeDefenseLabel}
              </span>
              {activeMatchup === 'all' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black">
                  Viewing All 3 Together
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Active drill field: Team {activeOffenseString} Offense vs Team {activeDefenseString} Defense. Click any string to promote or assign.
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
        {/* VIEW ALL 3 MATCHUPS TOGETHER MODE */}
        {/* ------------------------------------------------------------------ */}
        {activeMatchup === 'all' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h5 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Synchronized All 3 Depth Matchups (1s, 2s, 3s)
                </h5>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing all 3 string depths simultaneously. Click &ldquo;Make Active&rdquo; to put any matchup set onto the active field.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {([1, 2, 3] as (1 | 2 | 3)[]).map((matchupNum) => {
                const offLabel = getOffenseLabelForString(matchupNum);
                const offCol = getOffenseColorForString(matchupNum);
                const offCfg = getTeamColorConfig(offCol, 'gold');

                const defLabel = getDefenseLabelForString(matchupNum);
                const defCol = getDefenseColorForString(matchupNum);
                const defCfg = getTeamColorConfig(defCol, 'blue');

                const isCurrentActiveField = activeOffenseString === matchupNum && activeDefenseString === matchupNum;

                return (
                  <div
                    key={matchupNum}
                    className={`rounded-3xl border transition-all p-4 shadow-sm flex flex-col ${
                      isCurrentActiveField
                        ? 'bg-amber-500/5 border-amber-500/60 ring-2 ring-amber-400/30'
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    {/* Matchup Card Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            Matchup {matchupNum} ({matchupNum === 1 ? '1st String' : matchupNum === 2 ? '2nd String' : '3rd String'})
                          </span>
                          {isCurrentActiveField && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                              ★ Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-black"
                            style={{ backgroundColor: offCfg.hex, color: offCfg.badgeText.includes('white') ? '#fff' : '#000' }}
                          >
                            {offLabel}
                          </span>
                          <span className="text-slate-400 font-bold text-[10px]">vs</span>
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-black"
                            style={{ backgroundColor: defCfg.hex, color: defCfg.badgeText.includes('white') ? '#fff' : '#000' }}
                          >
                            {defLabel}
                          </span>
                        </div>
                      </div>

                      {!isCurrentActiveField && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOffenseString(matchupNum);
                            setActiveDefenseString(matchupNum);
                            setActiveMatchup(matchupNum);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] cursor-pointer shadow-xs transition-all shrink-0"
                        >
                          Make Active
                        </button>
                      )}
                    </div>

                    {/* Positions List for this Matchup Depth */}
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
                      {/* OFFENSE POSITIONS */}
                      {(filterUnit === 'both' || filterUnit === 'offense') && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: offCfg.hex }} />
                              <span>{offLabel}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {currentGroup.offensePositions.filter((p) => (currentGroup.lineup[p.id] || [])[matchupNum - 1]).length} / {currentGroup.offensePositions.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {currentGroup.offensePositions.map((pos) => {
                              const assigned = currentGroup.lineup[pos.id] || [];
                              const player = assigned[matchupNum - 1];
                              return (
                                <div
                                  key={`m${matchupNum}_off_${pos.id}`}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs"
                                >
                                  <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] w-12 shrink-0">
                                    {pos.name}
                                  </span>
                                  {player && player.num !== '?' ? (
                                    <div className="flex items-center justify-between flex-1 pl-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="w-5 h-5 rounded text-white font-black text-[10px] flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: offCfg.hex }}
                                        >
                                          #{player.num}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {player.name}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePlayer(pos.id, matchupNum - 1)}
                                        className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                        title="Remove player"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAssigningPos({ id: pos.id, name: pos.name, unit: 'offense', targetIdx: matchupNum - 1 })
                                      }
                                      className="flex-1 text-center py-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-400 hover:text-amber-600 hover:border-amber-400 transition-colors cursor-pointer"
                                    >
                                      + Assign {offLabel}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* DEFENSE POSITIONS */}
                      {(filterUnit === 'both' || filterUnit === 'defense') && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: defCfg.hex }} />
                              <span>{defLabel}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {currentGroup.defensePositions.filter((p) => (currentGroup.lineup[p.id] || [])[matchupNum - 1]).length} / {currentGroup.defensePositions.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {currentGroup.defensePositions.map((pos) => {
                              const assigned = currentGroup.lineup[pos.id] || [];
                              const player = assigned[matchupNum - 1];
                              return (
                                <div
                                  key={`m${matchupNum}_def_${pos.id}`}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs"
                                >
                                  <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] w-12 shrink-0">
                                    {pos.name}
                                  </span>
                                  {player && player.num !== '?' ? (
                                    <div className="flex items-center justify-between flex-1 pl-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="w-5 h-5 rounded text-white font-black text-[10px] flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: defCfg.hex }}
                                        >
                                          #{player.num}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {player.name}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePlayer(pos.id, matchupNum - 1)}
                                        className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                        title="Remove player"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense', targetIdx: matchupNum - 1 })
                                      }
                                      className="flex-1 text-center py-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-colors cursor-pointer"
                                    >
                                      + Assign {defLabel}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------------ */}
            {/* VIEW MODE 1: SIDE-BY-SIDE / FACING LAYOUT (SINGLE ACTIVE MATCHUP) */}
            {/* ------------------------------------------------------------------ */}
            {viewMode === 'side_by_side' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFFENSE COLUMN */}
                {(filterUnit === 'both' || filterUnit === 'offense') && (
                  <div className="space-y-3">
                    {/* Column Header */}
                    <div
                      className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${activeOffenseColorConfig.borderClass} ${activeOffenseColorConfig.bgLightClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900"
                          style={{ backgroundColor: activeOffenseColorConfig.hex }}
                        />
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          {activeOffenseLabel} (Team {activeOffenseString})
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
                        const activeStarter = assigned[activeOffenseString - 1];

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
                                      backgroundColor: activeOffenseColorConfig.hex,
                                      color: activeOffenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                      borderColor: activeOffenseColorConfig.hex,
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
                                    setAssigningPos({
                                      id: pos.id,
                                      name: pos.name,
                                      unit: 'offense',
                                      targetIdx: activeOffenseString - 1,
                                    })
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

                            {/* Main Active Starter on Field for this position */}
                            <div className="space-y-2">
                              {activeStarter && activeStarter.num !== '?' ? (
                                <div
                                  draggable={userRole === 'admin'}
                                  onDragStart={(e) =>
                                    onDragStartPlacedPlayer &&
                                    onDragStartPlacedPlayer(e, pos.id, activeOffenseString - 1, activeStarter)
                                  }
                                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs ${activeOffenseColorConfig.bgLightClass} ${activeOffenseColorConfig.borderClass}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className="w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                                      style={{ backgroundColor: activeOffenseColorConfig.hex }}
                                    >
                                      #{activeStarter.num}
                                    </span>
                                    <span className="truncate text-slate-900 dark:text-white font-black">
                                      {activeStarter.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-black uppercase">
                                      Team {activeOffenseString}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlayer(pos.id, activeOffenseString - 1)}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                    title="Remove active starter"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    setAssigningPos({
                                      id: pos.id,
                                      name: pos.name,
                                      unit: 'offense',
                                      targetIdx: activeOffenseString - 1,
                                    })
                                  }
                                  className="border border-dashed border-amber-300 dark:border-amber-600/60 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-2 text-center text-xs text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100/50 cursor-pointer transition-all"
                                >
                                  + Assign {activeOffenseLabel} Starter (Team {activeOffenseString})
                                </div>
                              )}

                              {/* 3-Team Depth Rotation Rows */}
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                  Depth Rotation String (1s, 2s, 3s):
                                </div>
                                {([1, 2, 3] as (1 | 2 | 3)[]).map((teamNum) => {
                                  const tPlayer = assigned[teamNum - 1];
                                  const tLabel = getOffenseLabelForString(teamNum);
                                  const tColor = getOffenseColorForString(teamNum);
                                  const tCfg = getTeamColorConfig(tColor, 'gold');
                                  const isCurrentActive = activeOffenseString === teamNum;

                                  return (
                                    <div
                                      key={`off_depth_${pos.id}_${teamNum}`}
                                      className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs transition-all ${
                                        isCurrentActive
                                          ? 'bg-amber-500/10 border-amber-400/60 font-bold'
                                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0"
                                          style={{ backgroundColor: tCfg.hex }}
                                        />
                                        <span className="text-[10px] font-black text-slate-500 shrink-0">
                                          T{teamNum}:
                                        </span>
                                        {tPlayer && tPlayer.num !== '?' ? (
                                          <span className="truncate font-bold">
                                            #{tPlayer.num} {tPlayer.name}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 italic text-[11px]">
                                            Unassigned
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {tPlayer && tPlayer.num !== '?' ? (
                                          <>
                                            {!isCurrentActive && (
                                              <button
                                                type="button"
                                                onClick={() => handlePromoteToActive(pos.id, teamNum - 1)}
                                                className="text-[10px] text-amber-600 hover:underline font-bold cursor-pointer"
                                                title="Promote to active field"
                                              >
                                                Swap
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleRemovePlayer(pos.id, teamNum - 1)}
                                              className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setAssigningPos({
                                                id: pos.id,
                                                name: pos.name,
                                                unit: 'offense',
                                                targetIdx: teamNum - 1,
                                              })
                                            }
                                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                                          >
                                            + Add
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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
                      className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${activeDefenseColorConfig.borderClass} ${activeDefenseColorConfig.bgLightClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900"
                          style={{ backgroundColor: activeDefenseColorConfig.hex }}
                        />
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          {activeDefenseLabel} (Team {activeDefenseString})
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
                        const activeStarter = assigned[activeDefenseString - 1];

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
                                      backgroundColor: activeDefenseColorConfig.hex,
                                      color: activeDefenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                      borderColor: activeDefenseColorConfig.hex,
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
                                    setAssigningPos({
                                      id: pos.id,
                                      name: pos.name,
                                      unit: 'defense',
                                      targetIdx: activeDefenseString - 1,
                                    })
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

                            {/* Main Active Starter on Field for this position */}
                            <div className="space-y-2">
                              {activeStarter && activeStarter.num !== '?' ? (
                                <div
                                  draggable={userRole === 'admin'}
                                  onDragStart={(e) =>
                                    onDragStartPlacedPlayer &&
                                    onDragStartPlacedPlayer(e, pos.id, activeDefenseString - 1, activeStarter)
                                  }
                                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs ${activeDefenseColorConfig.bgLightClass} ${activeDefenseColorConfig.borderClass}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className="w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                                      style={{ backgroundColor: activeDefenseColorConfig.hex }}
                                    >
                                      #{activeStarter.num}
                                    </span>
                                    <span className="truncate text-slate-900 dark:text-white font-black">
                                      {activeStarter.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-black uppercase">
                                      Team {activeDefenseString}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlayer(pos.id, activeDefenseString - 1)}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                    title="Remove active starter"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    setAssigningPos({
                                      id: pos.id,
                                      name: pos.name,
                                      unit: 'defense',
                                      targetIdx: activeDefenseString - 1,
                                    })
                                  }
                                  className="border border-dashed border-blue-300 dark:border-blue-600/60 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-2 text-center text-xs text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100/50 cursor-pointer transition-all"
                                >
                                  + Assign {activeDefenseLabel} Starter (Team {activeDefenseString})
                                </div>
                              )}

                              {/* 3-Team Depth Rotation Rows */}
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                  Depth Rotation String (1s, 2s, 3s):
                                </div>
                                {([1, 2, 3] as (1 | 2 | 3)[]).map((teamNum) => {
                                  const tPlayer = assigned[teamNum - 1];
                                  const tLabel = getDefenseLabelForString(teamNum);
                                  const tColor = getDefenseColorForString(teamNum);
                                  const tCfg = getTeamColorConfig(tColor, 'blue');
                                  const isCurrentActive = activeDefenseString === teamNum;

                                  return (
                                    <div
                                      key={`def_depth_${pos.id}_${teamNum}`}
                                      className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs transition-all ${
                                        isCurrentActive
                                          ? 'bg-blue-500/10 border-blue-400/60 font-bold'
                                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0"
                                          style={{ backgroundColor: tCfg.hex }}
                                        />
                                        <span className="text-[10px] font-black text-slate-500 shrink-0">
                                          T{teamNum}:
                                        </span>
                                        {tPlayer && tPlayer.num !== '?' ? (
                                          <span className="truncate font-bold">
                                            #{tPlayer.num} {tPlayer.name}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 italic text-[11px]">
                                            Unassigned
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {tPlayer && tPlayer.num !== '?' ? (
                                          <>
                                            {!isCurrentActive && (
                                              <button
                                                type="button"
                                                onClick={() => handlePromoteToActive(pos.id, teamNum - 1)}
                                                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                                                title="Promote to active field"
                                              >
                                                Swap
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleRemovePlayer(pos.id, teamNum - 1)}
                                              className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setAssigningPos({
                                                id: pos.id,
                                                name: pos.name,
                                                unit: 'defense',
                                                targetIdx: teamNum - 1,
                                              })
                                            }
                                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                                          >
                                            + Add
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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
                    className={`border rounded-3xl p-5 shadow-xs ${activeOffenseColorConfig.borderClass} ${activeOffenseColorConfig.bgLightClass}`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: activeOffenseColorConfig.hex }}
                        />
                        <h5 className="font-black text-base text-slate-900 dark:text-white">
                          {activeOffenseLabel} (Team {activeOffenseString})
                        </h5>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {currentGroup.offensePositions.length} Positions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {currentGroup.offensePositions.map((pos) => {
                        const assigned = currentGroup.lineup[pos.id] || [];
                        const starter = assigned[activeOffenseString - 1];
                        return (
                          <div
                            key={pos.id}
                            onClick={() =>
                              setAssigningPos({
                                id: pos.id,
                                name: pos.name,
                                unit: 'offense',
                                targetIdx: activeOffenseString - 1,
                              })
                            }
                            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="px-2 py-0.5 rounded-md font-black text-xs"
                                style={{
                                  backgroundColor: activeOffenseColorConfig.hex,
                                  color: activeOffenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                }}
                              >
                                {pos.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {assigned.filter(Boolean).length} in depth
                              </span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {starter && starter.num !== '?' ? `#${starter.num} ${starter.name}` : `+ Assign Team ${activeOffenseString}`}
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
                    className={`border rounded-3xl p-5 shadow-xs ${activeDefenseColorConfig.borderClass} ${activeDefenseColorConfig.bgLightClass}`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: activeDefenseColorConfig.hex }}
                        />
                        <h5 className="font-black text-base text-slate-900 dark:text-white">
                          {activeDefenseLabel} (Team {activeDefenseString})
                        </h5>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {currentGroup.defensePositions.length} Positions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {currentGroup.defensePositions.map((pos) => {
                        const assigned = currentGroup.lineup[pos.id] || [];
                        const starter = assigned[activeDefenseString - 1];
                        return (
                          <div
                            key={pos.id}
                            onClick={() =>
                              setAssigningPos({
                                id: pos.id,
                                name: pos.name,
                                unit: 'defense',
                                targetIdx: activeDefenseString - 1,
                              })
                            }
                            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="px-2 py-0.5 rounded-md font-black text-xs"
                                style={{
                                  backgroundColor: activeDefenseColorConfig.hex,
                                  color: activeDefenseColorConfig.badgeText.includes('white') ? '#fff' : '#000',
                                }}
                              >
                                {pos.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {assigned.filter(Boolean).length} in depth
                              </span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {starter && starter.num !== '?' ? `#${starter.num} ${starter.name}` : `+ Assign Team ${activeDefenseString}`}
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
                      style={{ backgroundColor: activeOffenseColorConfig.hex }}
                    />
                    <h5 className="font-black text-sm text-slate-900 dark:text-white">
                      Offense 3-Team Depth Chart
                    </h5>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                        <tr>
                          <th className="p-2.5">Slot</th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getOffenseColorForString(1), 'gold').hex }} />
                              <span>{getOffenseLabelForString(1)}</span>
                            </span>
                          </th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getOffenseColorForString(2), 'gold').hex }} />
                              <span>{getOffenseLabelForString(2)}</span>
                            </span>
                          </th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getOffenseColorForString(3), 'gold').hex }} />
                              <span>{getOffenseLabelForString(3)}</span>
                            </span>
                          </th>
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
                                {assigned[0] && assigned[0].num !== '?' ? `#${assigned[0].num} ${assigned[0].name}` : '—'}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {assigned[1] && assigned[1].num !== '?' ? `#${assigned[1].num} ${assigned[1].name}` : '—'}
                              </td>
                              <td className="p-2.5 text-slate-500 dark:text-slate-500">
                                {assigned[2] && assigned[2].num !== '?' ? `#${assigned[2].num} ${assigned[2].name}` : '—'}
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
                      style={{ backgroundColor: activeDefenseColorConfig.hex }}
                    />
                    <h5 className="font-black text-sm text-slate-900 dark:text-white">
                      Defense 3-Team Depth Chart
                    </h5>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                        <tr>
                          <th className="p-2.5">Slot</th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getDefenseColorForString(1), 'blue').hex }} />
                              <span>{getDefenseLabelForString(1)}</span>
                            </span>
                          </th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getDefenseColorForString(2), 'blue').hex }} />
                              <span>{getDefenseLabelForString(2)}</span>
                            </span>
                          </th>
                          <th className="p-2.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColorConfig(getDefenseColorForString(3), 'blue').hex }} />
                              <span>{getDefenseLabelForString(3)}</span>
                            </span>
                          </th>
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
                                {assigned[0] && assigned[0].num !== '?' ? `#${assigned[0].num} ${assigned[0].name}` : '—'}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {assigned[1] && assigned[1].num !== '?' ? `#${assigned[1].num} ${assigned[1].name}` : '—'}
                              </td>
                              <td className="p-2.5 text-slate-500 dark:text-slate-500">
                                {assigned[2] && assigned[2].num !== '?' ? `#${assigned[2].num} ${assigned[2].name}` : '—'}
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
          </>
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
                    handleAssignPlayer(
                      assigningPos.id,
                      {
                        name: `${player.firstName} ${player.lastName}`.trim() || player.rosterName,
                        num: player.num,
                      },
                      assigningPos.targetIdx
                    );
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
                        <th className="p-1 text-left border border-slate-400 w-14">Slot</th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.offenseTeam1Label || drill.offenseLabel || '1st String'}
                        </th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.offenseTeam2Label || '2nd String'}
                        </th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.offenseTeam3Label || '3rd String'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {drill.offensePositions.map((pos) => {
                        const assigned = drill.lineup[pos.id] || [];
                        const starter = assigned[0];
                        const backup1 = assigned[1];
                        const backup2 = assigned[2];
                        return (
                          <tr key={pos.id} className="border-b border-slate-300">
                            <td className="p-1 font-bold border border-slate-300 bg-slate-50">
                              {pos.name}
                            </td>
                            <td className="p-1 font-black border border-slate-300">
                              {starter && starter.num !== '?' ? `#${starter.num} ${starter.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-700 border border-slate-300">
                              {backup1 && backup1.num !== '?' ? `#${backup1.num} ${backup1.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-500 border border-slate-300">
                              {backup2 && backup2.num !== '?' ? `#${backup2.num} ${backup2.name}` : '—'}
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
                        <th className="p-1 text-left border border-slate-400 w-14">Slot</th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.defenseTeam1Label || drill.defenseLabel || '1st String'}
                        </th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.defenseTeam2Label || '2nd String'}
                        </th>
                        <th className="p-1 text-left border border-slate-400">
                          {drill.defenseTeam3Label || '3rd String'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {drill.defensePositions.map((pos) => {
                        const assigned = drill.lineup[pos.id] || [];
                        const starter = assigned[0];
                        const backup1 = assigned[1];
                        const backup2 = assigned[2];
                        return (
                          <tr key={pos.id} className="border-b border-slate-300">
                            <td className="p-1 font-bold border border-slate-300 bg-slate-50">
                              {pos.name}
                            </td>
                            <td className="p-1 font-black border border-slate-300">
                              {starter && starter.num !== '?' ? `#${starter.num} ${starter.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-700 border border-slate-300">
                              {backup1 && backup1.num !== '?' ? `#${backup1.num} ${backup1.name}` : '—'}
                            </td>
                            <td className="p-1 text-slate-500 border border-slate-300">
                              {backup2 && backup2.num !== '?' ? `#${backup2.num} ${backup2.name}` : '—'}
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
