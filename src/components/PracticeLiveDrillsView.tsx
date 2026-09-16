import React, { useState, useMemo } from 'react';
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
  Award,
  Clock,
  HelpCircle,
  FileText,
  Flame,
  LayoutGrid,
  Columns,
  Search,
  UserPlus
} from 'lucide-react';
import {
  LiveDrillGroup,
  LiveDrillFormat,
  LiveDrillPosition,
  PlacedPlayer,
  RosterPlayer,
  UserRole,
  FormationBoard,
  Team
} from '../types';

interface PracticeLiveDrillsViewProps {
  currentWeek: string;
  practiceDrillGroups: LiveDrillGroup[];
  onUpdatePracticeDrillGroups: (groups: LiveDrillGroup[]) => void;
  roster: RosterPlayer[];
  userRole: UserRole;
  depthChart?: Record<string, PlacedPlayer[]>;
  formations?: FormationBoard[];
  activeTeam?: Team;
  onDragStartPlacedPlayer?: (e: React.DragEvent, posId: string, idx: number, player: PlacedPlayer) => void;
}

// Quick preset labels for Offense & Defense groups
const OFFENSE_LABEL_PRESETS = [
  '1st Team Offense (Gold)',
  '2nd Team Offense (Blue)',
  'Varsity Offense',
  'JV Offense',
  'Scout Offense (Opponent Look)',
  'Gold Group',
  'Red Zone Offense',
  '2-Minute Offense',
];

const DEFENSE_LABEL_PRESETS = [
  '1st Team Defense (Blue)',
  '2nd Team Defense (Gold)',
  'Varsity Defense',
  'JV Defense',
  'Scout Defense (Opponent Look)',
  'Lockdown Defense',
  'Goal Line Defense',
  'Nickel Package',
];

// Helper to generate default positions for a given drill format
export function generateDefaultPositions(format: LiveDrillFormat): {
  offense: LiveDrillPosition[];
  defense: LiveDrillPosition[];
} {
  const ts = Date.now();
  if (format === '7v7') {
    return {
      offense: [
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
        { id: `off_x_${ts}`, name: 'WR (X)', unit: 'offense' },
        { id: `off_z_${ts}`, name: 'WR (Z)', unit: 'offense' },
        { id: `off_w_${ts}`, name: 'Slot (W)', unit: 'offense' },
        { id: `off_y_${ts}`, name: 'TE (Y)', unit: 'offense' },
        { id: `off_h_${ts}`, name: 'H / Slot', unit: 'offense' },
      ],
      defense: [
        { id: `def_cb1_${ts}`, name: 'CB1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB2', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB / Nickel', unit: 'defense' },
      ],
    };
  }

  if (format === '11v11') {
    return {
      offense: [
        { id: `off_lt_${ts}`, name: 'LT', unit: 'offense' },
        { id: `off_lg_${ts}`, name: 'LG', unit: 'offense' },
        { id: `off_c_${ts}`, name: 'C', unit: 'offense' },
        { id: `off_rg_${ts}`, name: 'RG', unit: 'offense' },
        { id: `off_rt_${ts}`, name: 'RT', unit: 'offense' },
        { id: `off_te_${ts}`, name: 'TE (Y)', unit: 'offense' },
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
        { id: `off_x_${ts}`, name: 'WR (X)', unit: 'offense' },
        { id: `off_z_${ts}`, name: 'WR (Z)', unit: 'offense' },
        { id: `off_w_${ts}`, name: 'Slot (W)', unit: 'offense' },
      ],
      defense: [
        { id: `def_lde_${ts}`, name: 'LDE', unit: 'defense' },
        { id: `def_ldt_${ts}`, name: 'LDT', unit: 'defense' },
        { id: `def_rdt_${ts}`, name: 'RDT', unit: 'defense' },
        { id: `def_rde_${ts}`, name: 'RDE', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB', unit: 'defense' },
        { id: `def_cb1_${ts}`, name: 'CB1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB2', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
      ],
    };
  }

  if (format === '9v9') {
    return {
      offense: [
        { id: `off_lt_${ts}`, name: 'LT', unit: 'offense' },
        { id: `off_lg_${ts}`, name: 'LG', unit: 'offense' },
        { id: `off_c_${ts}`, name: 'C', unit: 'offense' },
        { id: `off_rg_${ts}`, name: 'RG', unit: 'offense' },
        { id: `off_rt_${ts}`, name: 'RT', unit: 'offense' },
        { id: `off_te_${ts}`, name: 'TE', unit: 'offense' },
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_fb_${ts}`, name: 'FB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
      ],
      defense: [
        { id: `def_lde_${ts}`, name: 'LDE', unit: 'defense' },
        { id: `def_ldt_${ts}`, name: 'LDT', unit: 'defense' },
        { id: `def_rdt_${ts}`, name: 'RDT', unit: 'defense' },
        { id: `def_rde_${ts}`, name: 'RDE', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
      ],
    };
  }

  if (format === '1v1') {
    return {
      offense: [
        { id: `off_wr1_${ts}`, name: 'WR 1', unit: 'offense' },
        { id: `off_wr2_${ts}`, name: 'WR 2', unit: 'offense' },
        { id: `off_wr3_${ts}`, name: 'WR 3', unit: 'offense' },
        { id: `off_te1_${ts}`, name: 'TE 1', unit: 'offense' },
      ],
      defense: [
        { id: `def_cb1_${ts}`, name: 'CB 1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB 2', unit: 'defense' },
        { id: `def_nb1_${ts}`, name: 'Nickel / DB', unit: 'defense' },
        { id: `def_s1_${ts}`, name: 'Safety / LB', unit: 'defense' },
      ],
    };
  }

  // Custom default
  return {
    offense: [
      { id: `off_p1_${ts}`, name: 'Pos 1 (O)', unit: 'offense' },
      { id: `off_p2_${ts}`, name: 'Pos 2 (O)', unit: 'offense' },
      { id: `off_p3_${ts}`, name: 'Pos 3 (O)', unit: 'offense' },
    ],
    defense: [
      { id: `def_p1_${ts}`, name: 'Pos 1 (D)', unit: 'defense' },
      { id: `def_p2_${ts}`, name: 'Pos 2 (D)', unit: 'defense' },
      { id: `def_p3_${ts}`, name: 'Pos 3 (D)', unit: 'defense' },
    ],
  };
}

export function createInitialPracticeDrillGroups(): LiveDrillGroup[] {
  const g7 = generateDefaultPositions('7v7');
  const g11 = generateDefaultPositions('11v11');

  return [
    {
      id: `live_group_7v7_${Date.now()}`,
      name: 'Period 4: 7v7 Pass Skeleton',
      format: '7v7',
      offenseLabel: '1st Team Offense (Gold)',
      defenseLabel: '1st Team Defense (Blue)',
      notes: 'Dropback & quick-game timing. Defense in match-cover 3.',
      offensePositions: g7.offense,
      defensePositions: g7.defense,
      lineup: {},
      createdAt: Date.now(),
    },
    {
      id: `live_group_11v11_${Date.now() + 1}`,
      name: 'Period 6: 11v11 Team Live',
      format: '11v11',
      offenseLabel: 'Varsity Offense',
      defenseLabel: 'Varsity Defense',
      notes: 'Full team live run/pass period with substitutions.',
      offensePositions: g11.offense,
      defensePositions: g11.defense,
      lineup: {},
      createdAt: Date.now() + 1,
    },
  ];
}

export const PracticeLiveDrillsView: React.FC<PracticeLiveDrillsViewProps> = ({
  currentWeek,
  practiceDrillGroups,
  onUpdatePracticeDrillGroups,
  roster,
  userRole,
  depthChart = {},
  formations = [],
  activeTeam,
  onDragStartPlacedPlayer,
}) => {
  // Ensure we have at least one drill group
  const groups: LiveDrillGroup[] = useMemo(() => {
    if (Array.isArray(practiceDrillGroups) && practiceDrillGroups.length > 0) {
      return practiceDrillGroups;
    }
    return createInitialPracticeDrillGroups();
  }, [practiceDrillGroups]);

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return groups[0]?.id || '';
  });

  // Keep active group valid
  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || groups[0];
  }, [groups, activeGroupId]);

  // View presentation mode: 'side_by_side' (facing each other) or 'grid' (cards)
  const [viewMode, setViewMode] = useState<'side_by_side' | 'grid'>('side_by_side');

  // Inline editing state for drill title
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleDraft, setTitleDraft] = useState<string>('');

  // Editing position name modal or inline
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editingPosName, setEditingPosName] = useState<string>('');

  // Quick player assignment modal
  const [assigningPos, setAssigningPos] = useState<{ id: string; name: string; unit: 'offense' | 'defense' } | null>(null);
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');

  // Helper to commit updated groups
  const updateGroup = (updated: LiveDrillGroup) => {
    const next = groups.map((g) => (g.id === updated.id ? updated : g));
    onUpdatePracticeDrillGroups(next);
  };

  // Add new drill group
  const handleAddNewGroup = (format: LiveDrillFormat = '7v7') => {
    const gen = generateDefaultPositions(format);
    const newGroup: LiveDrillGroup = {
      id: `live_group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `New ${format.toUpperCase()} Practice Drill`,
      format,
      offenseLabel: format === '7v7' ? '1st Team Offense (Gold)' : 'Varsity Offense',
      defenseLabel: format === '7v7' ? '1st Team Defense (Blue)' : 'Varsity Defense',
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

  // Duplicate current drill group
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

  // Delete drill group
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

  // Change format of current group
  const handleChangeFormat = (newFormat: LiveDrillFormat) => {
    if (!currentGroup) return;
    if (newFormat === currentGroup.format) return;
    const shouldResetPositions = confirm(
      `Switching to ${newFormat.toUpperCase()}? Would you like to reset positions to default ${newFormat.toUpperCase()} slots? (Cancel keeps existing custom slots)`
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

  // Add position slot to offense or defense
  const handleAddPositionSlot = (unit: 'offense' | 'defense') => {
    if (!currentGroup) return;
    const defaultName = unit === 'offense' ? 'New Slot (O)' : 'New Slot (D)';
    const promptName = prompt(`Enter position label for ${unit.toUpperCase()}:`, defaultName);
    if (!promptName || !promptName.trim()) return;

    const newPos: LiveDrillPosition = {
      id: `pos_${unit}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: promptName.trim(),
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
  };

  // Remove position slot
  const handleRemovePositionSlot = (posId: string, unit: 'offense' | 'defense') => {
    if (!currentGroup) return;
    if (!confirm('Remove this position slot from this drill?')) return;

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

  // Rename position slot
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

  // Assign player to position
  const handleAssignPlayer = (posId: string, player: PlacedPlayer) => {
    if (!currentGroup) return;
    const currentList = currentGroup.lineup[posId] || [];
    // If player already in this slot, don't duplicate
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

  // Remove player from position
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

  // Drag & drop handling for dropping player into position slot
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropOnPosition = (e: React.DragEvent, posId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (userRole !== 'admin') return;

    // Check dataTransfer for player info
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
        return;
      }
    } catch {
      // ignore
    }
  };

  // Swap Offense and Defense groups
  const handleSwapOffenseDefense = () => {
    if (!currentGroup) return;
    if (
      !confirm(
        'Swap the Offense and Defense labels and rosters for this drill?'
      )
    )
      return;

    const swappedLineup: Record<string, PlacedPlayer[]> = {};
    // Map offense positions to defense positions if count matches, or swap labels
    updateGroup({
      ...currentGroup,
      offenseLabel: currentGroup.defenseLabel,
      defenseLabel: currentGroup.offenseLabel,
    });
  };

  // Clear all players in group
  const handleClearLineup = () => {
    if (!currentGroup) return;
    if (!confirm('Clear all player assignments for this drill matchup?')) return;
    updateGroup({
      ...currentGroup,
      lineup: {},
    });
  };

  // Auto-populate starters or backups from main Depth Chart
  const handleAutoPopulateFromDepthChart = (targetString: 1 | 2 = 1) => {
    if (!currentGroup) return;
    const stringName = targetString === 1 ? '1st String (Starters)' : '2nd String (Backups)';
    if (
      !confirm(
        `Auto-populate this drill with ${stringName} from the current week's Depth Chart? (Existing matching slots will be filled)`
      )
    )
      return;

    const nextLineup = { ...currentGroup.lineup };

    // Helper to find a matching depth chart position for a drill position name
    const allFormations = formations || [];
    const findMatchingDepthPlayer = (posName: string, unit: 'offense' | 'defense'): PlacedPlayer | null => {
      const cleanTarget = posName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Search all formations of this unit
      for (const form of allFormations) {
        if (form.unit !== unit) continue;
        for (const row of form.rows || []) {
          for (const p of row.positions || []) {
            if (!p) continue;
            const cleanPos = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // Exact or high match
            if (
              cleanPos === cleanTarget ||
              (cleanTarget.includes('qb') && cleanPos.includes('qb')) ||
              (cleanTarget.includes('rb') && cleanPos.includes('rb')) ||
              (cleanTarget.includes('x') && cleanPos.includes('x')) ||
              (cleanTarget.includes('z') && cleanPos.includes('z')) ||
              (cleanTarget.includes('w') && cleanPos.includes('w')) ||
              (cleanTarget.includes('y') && cleanPos.includes('y')) ||
              (cleanTarget.includes('te') && cleanPos.includes('te')) ||
              (cleanTarget.includes('lt') && cleanPos.includes('lt')) ||
              (cleanTarget.includes('c') && cleanPos.includes('c')) ||
              (cleanTarget.includes('rt') && cleanPos.includes('rt')) ||
              (cleanTarget.includes('cb1') && cleanPos.includes('cb1')) ||
              (cleanTarget.includes('cb2') && cleanPos.includes('cb2')) ||
              (cleanTarget.includes('fs') && cleanPos.includes('fs')) ||
              (cleanTarget.includes('ss') && cleanPos.includes('ss')) ||
              (cleanTarget.includes('mlb') && cleanPos.includes('mlb')) ||
              (cleanTarget.includes('wlb') && cleanPos.includes('wlb')) ||
              (cleanTarget.includes('slb') && cleanPos.includes('slb'))
            ) {
              const playersAtPos = depthChart[p.id] || [];
              const desiredPlayer = playersAtPos[targetString - 1] || playersAtPos[0];
              if (desiredPlayer) return desiredPlayer;
            }
          }
        }
      }
      return null;
    };

    // Fill Offense positions
    currentGroup.offensePositions.forEach((pos) => {
      const matched = findMatchingDepthPlayer(pos.name, 'offense');
      if (matched) {
        nextLineup[pos.id] = [matched];
      }
    });

    // Fill Defense positions
    currentGroup.defensePositions.forEach((pos) => {
      const matched = findMatchingDepthPlayer(pos.name, 'defense');
      if (matched) {
        nextLineup[pos.id] = [matched];
      }
    });

    updateGroup({
      ...currentGroup,
      lineup: nextLineup,
    });
  };

  // Filtered roster for manual assignment modal
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

  // Printable trigger
  const handlePrint = () => {
    window.print();
  };

  if (!currentGroup) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & MAIN CONTROLS */}
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
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                — Organize Offense vs Defense with custom groups & rotations
              </span>
            </h2>
          </div>

          {/* Top action buttons */}
          <div className="flex items-center flex-wrap gap-2">
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

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Print field-ready drill card"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Print Sheet</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-750 mx-1" />

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'side_by_side'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Face-to-Face Matchup View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Facing</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Full Cards Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drill Groups Tab Switcher */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <span>Drill Sets:</span>
          </span>
          {groups.map((group) => {
            const isActive = group.id === currentGroup.id;
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
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>{group.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {group.format.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE DRILL CONFIGURATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm print:hidden">
        {/* Drill Title & Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="e.g. Period 4: 7v7 Pass Skelly"
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
              <span className="font-semibold">Coaching Focus:</span>
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

            {/* Auto Fill Starters */}
            <button
              onClick={() => handleAutoPopulateFromDepthChart(1)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Populate current slots with 1st String Starters from the main Depth Chart"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Auto-Fill 1st String</span>
            </button>

            {/* Auto Fill Backups */}
            <button
              onClick={() => handleAutoPopulateFromDepthChart(2)}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700/60 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Populate current slots with 2nd String Backups from the main Depth Chart"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>2nd String</span>
            </button>

            {/* Swap Offense / Defense */}
            <button
              onClick={handleSwapOffenseDefense}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Swap Offense and Defense labels"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Clear players */}
            <button
              onClick={handleClearLineup}
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

        {/* EDITABLE GROUP LABELS: Offense vs Defense ("label the group differently") */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* OFFENSE GROUP LABEL */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Offense Group Label:</span>
              </div>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-semibold">
                {currentGroup.offensePositions.length} Pos Slots
              </span>
            </div>
            <input
              type="text"
              value={currentGroup.offenseLabel}
              onChange={(e) => updateGroup({ ...currentGroup, offenseLabel: e.target.value })}
              placeholder="e.g. 1st Team Offense (Gold)"
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600/60 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {/* Quick Presets for Offense */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {OFFENSE_LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateGroup({ ...currentGroup, offenseLabel: preset })}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                    currentGroup.offenseLabel === preset
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white/80 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* DEFENSE GROUP LABEL */}
          <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-black text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Defense Group Label:</span>
              </div>
              <span className="text-[10px] text-sky-600/80 dark:text-sky-400/80 font-semibold">
                {currentGroup.defensePositions.length} Pos Slots
              </span>
            </div>
            <input
              type="text"
              value={currentGroup.defenseLabel}
              onChange={(e) => updateGroup({ ...currentGroup, defenseLabel: e.target.value })}
              placeholder="e.g. 1st Team Defense (Blue)"
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-600/60 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {/* Quick Presets for Defense */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DEFENSE_LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateGroup({ ...currentGroup, defenseLabel: preset })}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                    currentGroup.defenseLabel === preset
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                      : 'bg-white/80 dark:bg-slate-800 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE MATCHUP BOARD (OFFENSE VS DEFENSE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        {/* Header with Add Slot buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span>⚔️ {currentGroup.offenseLabel}</span>
              <span className="text-slate-400 font-light">vs</span>
              <span>{currentGroup.defenseLabel}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Drag players from the Roster Sidebar or click &ldquo;+ Assign&rdquo; on any card. Rotations & backup players sit in the secondary depth row.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddPositionSlot('offense')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700/60 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Offense Slot</span>
            </button>
            <button
              onClick={() => handleAddPositionSlot('defense')}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-700/60 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Defense Slot</span>
            </button>
          </div>
        </div>

        {/* SIDE-BY-SIDE / FACING LAYOUT */}
        {viewMode === 'side_by_side' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OFFENSE COLUMN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-600/40 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-black text-sm text-amber-900 dark:text-amber-200">
                    {currentGroup.offenseLabel}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {currentGroup.offensePositions.length} Positions
                </span>
              </div>

              <div className="space-y-2.5">
                {currentGroup.offensePositions.map((pos) => {
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
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-black text-xs border border-amber-200 dark:border-amber-800">
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

                      {/* Player Slots */}
                      <div className="space-y-1.5">
                        {starter ? (
                          <div
                            draggable={userRole === 'admin'}
                            onDragStart={(e) =>
                              onDragStartPlacedPlayer &&
                              onDragStartPlacedPlayer(e, pos.id, 0, starter)
                            }
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100 font-bold text-xs shadow-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                                #{starter.num}
                              </span>
                              <span className="truncate">{starter.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold uppercase">
                                Starter
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemovePlayer(pos.id, 0)}
                              className="text-amber-700 dark:text-amber-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Remove player"
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
                                    (Rot {bIdx + 1})
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

            {/* DEFENSE COLUMN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-sky-500/10 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-600/40 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-black text-sm text-sky-900 dark:text-sky-200">
                    {currentGroup.defenseLabel}
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                  {currentGroup.defensePositions.length} Positions
                </span>
              </div>

              <div className="space-y-2.5">
                {currentGroup.defensePositions.map((pos) => {
                  const assigned = currentGroup.lineup[pos.id] || [];
                  const starter = assigned[0];
                  const backups = assigned.slice(1);

                  return (
                    <div
                      key={pos.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnPosition(e, pos.id)}
                      className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 hover:border-sky-400 dark:hover:border-sky-500/60 transition-all shadow-xs"
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
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 font-black text-xs border border-sky-200 dark:border-sky-800">
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

                      {/* Player Slots */}
                      <div className="space-y-1.5">
                        {starter ? (
                          <div
                            draggable={userRole === 'admin'}
                            onDragStart={(e) =>
                              onDragStartPlacedPlayer &&
                              onDragStartPlacedPlayer(e, pos.id, 0, starter)
                            }
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-100/90 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700/80 text-sky-950 dark:text-sky-100 font-bold text-xs shadow-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                                #{starter.num}
                              </span>
                              <span className="truncate">{starter.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200/80 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold uppercase">
                                Starter
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemovePlayer(pos.id, 0)}
                              className="text-sky-700 dark:text-sky-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Remove player"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense' })
                            }
                            className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 text-center text-xs text-slate-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-all"
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
                                    (Rot {bIdx + 1})
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
          </div>
        ) : (
          /* GRID VIEW */
          <div className="space-y-6">
            <div>
              <h5 className="text-xs font-black uppercase text-amber-700 dark:text-amber-300 tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{currentGroup.offenseLabel} ({currentGroup.offensePositions.length} Slots)</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {currentGroup.offensePositions.map((pos) => {
                  const assigned = currentGroup.lineup[pos.id] || [];
                  const starter = assigned[0];
                  const backups = assigned.slice(1);
                  return (
                    <div
                      key={pos.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnPosition(e, pos.id)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col justify-between min-h-[110px]"
                    >
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-black text-xs text-amber-700 dark:text-amber-300">
                          {pos.name}
                        </span>
                        <button
                          onClick={() =>
                            setAssigningPos({ id: pos.id, name: pos.name, unit: 'offense' })
                          }
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {starter ? (
                        <div className="my-auto">
                          <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                            #{starter.num} {starter.name}
                          </div>
                          {backups.length > 0 && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              +{backups.length} rot
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 my-auto text-center">
                          Empty
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase text-sky-700 dark:text-sky-300 tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{currentGroup.defenseLabel} ({currentGroup.defensePositions.length} Slots)</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {currentGroup.defensePositions.map((pos) => {
                  const assigned = currentGroup.lineup[pos.id] || [];
                  const starter = assigned[0];
                  const backups = assigned.slice(1);
                  return (
                    <div
                      key={pos.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnPosition(e, pos.id)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col justify-between min-h-[110px]"
                    >
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-black text-xs text-sky-700 dark:text-sky-300">
                          {pos.name}
                        </span>
                        <button
                          onClick={() =>
                            setAssigningPos({ id: pos.id, name: pos.name, unit: 'defense' })
                          }
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {starter ? (
                        <div className="my-auto">
                          <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                            #{starter.num} {starter.name}
                          </div>
                          {backups.length > 0 && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              +{backups.length} rot
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 my-auto text-center">
                          Empty
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL: ASSIGN PLAYER FROM ROSTER */}
      {assigningPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Assign Player to {assigningPos.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a player from the active team roster.
                </p>
              </div>
              <button
                onClick={() => setAssigningPos(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Search player name, #, position..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Roster list */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
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
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
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
                    Assign →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PRINT-ONLY PRACTICE SCRIPT / CARD */}
      <div className="hidden print:block font-sans text-slate-900 p-4">
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {activeTeam?.name || 'Football Operations'} — Practice Matchup
            </h1>
            <p className="text-sm font-bold text-slate-700">
              Week {currentWeek} • Drill: {currentGroup.name} ({currentGroup.format.toUpperCase()})
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black uppercase px-2 py-1 bg-slate-900 text-white rounded">
              Field Script
            </span>
          </div>
        </div>

        {currentGroup.notes && (
          <div className="mb-4 p-2.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold">
            <span className="font-black uppercase">Focus / Notes: </span>
            {currentGroup.notes}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Offense */}
          <div>
            <h2 className="text-base font-black uppercase border-b-2 border-amber-600 pb-1 mb-2">
              ⚡ {currentGroup.offenseLabel}
            </h2>
            <table className="w-full text-xs border border-slate-400">
              <thead>
                <tr className="bg-slate-200">
                  <th className="p-1.5 text-left border border-slate-400">Slot</th>
                  <th className="p-1.5 text-left border border-slate-400">Starter (1st)</th>
                  <th className="p-1.5 text-left border border-slate-400">Rotations (2nd/3rd)</th>
                </tr>
              </thead>
              <tbody>
                {currentGroup.offensePositions.map((pos) => {
                  const assigned = currentGroup.lineup[pos.id] || [];
                  const starter = assigned[0];
                  const backups = assigned.slice(1);
                  return (
                    <tr key={pos.id} className="border-b border-slate-300">
                      <td className="p-1.5 font-bold border border-slate-300 bg-slate-50">
                        {pos.name}
                      </td>
                      <td className="p-1.5 font-black border border-slate-300">
                        {starter ? `#${starter.num} ${starter.name}` : '—'}
                      </td>
                      <td className="p-1.5 text-slate-600 border border-slate-300">
                        {backups.map((b) => `#${b.num} ${b.name}`).join(', ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Defense */}
          <div>
            <h2 className="text-base font-black uppercase border-b-2 border-sky-600 pb-1 mb-2">
              🛡️ {currentGroup.defenseLabel}
            </h2>
            <table className="w-full text-xs border border-slate-400">
              <thead>
                <tr className="bg-slate-200">
                  <th className="p-1.5 text-left border border-slate-400">Slot</th>
                  <th className="p-1.5 text-left border border-slate-400">Starter (1st)</th>
                  <th className="p-1.5 text-left border border-slate-400">Rotations (2nd/3rd)</th>
                </tr>
              </thead>
              <tbody>
                {currentGroup.defensePositions.map((pos) => {
                  const assigned = currentGroup.lineup[pos.id] || [];
                  const starter = assigned[0];
                  const backups = assigned.slice(1);
                  return (
                    <tr key={pos.id} className="border-b border-slate-300">
                      <td className="p-1.5 font-bold border border-slate-300 bg-slate-50">
                        {pos.name}
                      </td>
                      <td className="p-1.5 font-black border border-slate-300">
                        {starter ? `#${starter.num} ${starter.name}` : '—'}
                      </td>
                      <td className="p-1.5 text-slate-600 border border-slate-300">
                        {backups.map((b) => `#${b.num} ${b.name}`).join(', ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
