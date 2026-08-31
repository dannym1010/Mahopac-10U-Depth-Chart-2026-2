import React, { useState } from 'react';
import {
  Plus,
  Printer,
  Filter,
  ArrowUp,
  ArrowDown,
  Copy,
  Edit2,
  Trash2,
  Move,
  Settings2,
  GripHorizontal,
  X,
  Shield,
  Zap,
  Check,
  Minus,
  Sliders,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Eraser,
  SquarePlus,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  FormationBoard,
  FormationRow,
  PositionSlot,
  PlacedPlayer,
  UserRole,
  UnitType,
  Team,
} from '../types';

interface FormationsViewProps {
  unit: 'offense' | 'defense' | 'st' | 'groups';
  formations: FormationBoard[];
  depthChart: Record<string, PlacedPlayer[]>;
  selectedFormationId: string | null;
  onSelectFormation: (formId: string) => void;
  userRole: UserRole;
  activeTeam?: Team;
  teams?: Team[];
  onCopyFormationsFromTeam?: (sourceTeamId: string) => void;
  onAddFormation?: (unit: 'offense' | 'defense' | 'st' | 'groups') => void;
  onMoveFormation: (formId: string, direction: number) => void;
  onDuplicateFormation?: (formId: string) => void;
  onRenameFormation?: (formId: string) => void;
  onDeleteFormation: (formId: string) => void;
  onAddRow?: (formId: string) => void;
  onEditRowName?: (formId: string, rIdx: number) => void;
  onEditRowSlots?: (formId: string, rIdx: number) => void;
  onDeleteRow: (formId: string, rIdx: number) => void;
  onAddPosition?: (formId: string, rIdx: number) => void;
  onEditPositionName?: (formId: string, rIdx: number, pIdx: number) => void;
  onMovePositionRow?: (formId: string, rIdx: number, pIdx: number) => void;
  onCopyPositionToOtherForm?: (formId: string, rIdx: number, pIdx: number) => void;
  onDeletePosition: (formId: string, rIdx: number, pIdx: number) => void;
  onDropPlayerOnCard: (
    targetPosId: string,
    targetFormId: string,
    targetRowId: string
  ) => void;
  onRemovePlayerFromCard: (posId: string, playerIndex: number) => void;
  onOpenSelectivePrintModal: (unit: 'offense' | 'defense' | 'st' | 'groups') => void;
  onDragStartPlacedPlayer: (
    e: React.DragEvent,
    posId: string,
    idx: number,
    player: PlacedPlayer
  ) => void;
  onPositionCardDragStart: (
    e: React.DragEvent,
    formId: string,
    rIdx: number,
    pIdx: number
  ) => void;
  onPositionCardDropOnSlot: (
    e: React.DragEvent,
    targetFormId: string,
    targetRIdx: number,
    targetPIdx: number
  ) => void;
  // Direct interactive handlers
  onSetRowSlots?: (formId: string, rIdx: number, count: number) => void;
  onAddSlotToRow?: (formId: string, rIdx: number) => void;
  onRemoveSlotFromRow?: (formId: string, rIdx: number, pIdx?: number) => void;
  onInsertSlotAt?: (formId: string, rIdx: number, pIdx: number) => void;
  onClearPositionToEmpty?: (formId: string, rIdx: number, pIdx: number) => void;
  onAssignPositionToSlot?: (formId: string, rIdx: number, pIdx: number, posName: string) => void;
  onAddPositionDirect?: (formId: string, rIdx: number, posName: string) => void;
  onRenamePositionDirect?: (formId: string, rIdx: number, pIdx: number, newName: string) => void;
  onRenameRowDirect?: (formId: string, rIdx: number, newName: string) => void;
  onAddRowDirect?: (formId: string, label: string, slotCount?: number) => void;
  onAddFormationDirect?: (unit: 'offense' | 'defense' | 'st' | 'groups', name: string, templateKey?: string) => void;
  onRenameFormationDirect?: (formId: string, newName: string) => void;
  onDuplicateFormationDirect?: (formId: string, newName: string) => void;
  onMovePositionDirect?: (formId: string, srcRIdx: number, srcPIdx: number, targetRIdx: number) => void;
  onCopyPositionDirect?: (formId: string, srcRIdx: number, srcPIdx: number, targetFormId: string) => void;
}

const OFFENSE_PRESET_TAGS = [
  'QB', '1 (QB)', 'RB', '4 (RB)', 'FB', '2 (FB)', 'TB', '3 (TB)',
  'X', 'Z', 'W', 'Y', 'TE', 'Y1', 'Slot', 'H-Back',
  'LT', 'LG', 'C', 'RG', 'RT', 'OL',
];

const DEFENSE_PRESET_TAGS = [
  'DE', 'LDE', 'RDE', 'DT', 'LDT', 'RDT', 'NT', 'DL',
  'MLB', 'MIKE', 'WLB', 'WILL', 'SLB', 'SAM', 'ROV', 'OLB', 'ILB',
  'CB', 'LCB', 'RCB', 'FS', 'SS', 'DB', 'Nickel', 'Dime',
];

const SPECIAL_TEAMS_PRESET_TAGS = [
  'K', 'P', 'LS', 'H (Holder)', 'KR', 'PR', 'Gunner', 'Upback', 'PP',
  'L1', 'L2', 'L3', 'L4', 'L5', 'R1', 'R2', 'R3', 'R4', 'R5',
];

const FORMATION_TEMPLATES = {
  offense: [
    { key: '11_offense', label: '11 Personnel (1 RB, 1 TE, 3 WR)', desc: 'Standard 3-WR Pro Set with LT-RT and Backfield' },
    { key: '12_offense', label: '12 Personnel (1 RB, 2 TE, 2 WR)', desc: 'Heavy balanced tight end offense' },
    { key: '21_offense', label: '21 I-Formation (2 RB, 1 TE, 2 WR)', desc: 'Power run with QB under center and Fullback' },
    { key: 'spread_offense', label: 'Spread / 10 Personnel (4 WR, 1 RB)', desc: 'Gun 4-wide spread formation' },
    { key: 'empty_offense', label: 'Empty Backfield (5 WR / Flex)', desc: 'Quick pass spread attack' },
  ],
  defense: [
    { key: '44_defense', label: '4-4 Base Defense', desc: '4 DL, 4 LBs (Will/Mike/Sam/Rover), 3 DBs' },
    { key: '43_defense', label: '4-3 Over Defense', desc: '4 DL, 3 LBs, 4 DBs (2 CB, FS, SS)' },
    { key: '34_defense', label: '3-4 Defense', desc: '3 DL, 4 LBs (2 OLB, 2 ILB), 4 DBs' },
    { key: '53_defense', label: '5-3 Youth Defense', desc: '5 DL, 3 LBs, 3 DBs run-stopping wall' },
    { key: 'nickel_defense', label: 'Nickel Defense (4-2-5)', desc: '4 DL, 2 LBs, 5 DBs (Nickel Back)' },
  ],
  st: [
    { key: 'punt_st', label: 'Punt Coverage', desc: '7 Line + PP + Punter + 2 Gunners' },
    { key: 'kickoff_st', label: 'Kickoff Team', desc: '10 Coverage Players + Kicker' },
    { key: 'pat_st', label: 'Field Goal / PAT', desc: '7 Line + 2 Wing + Holder + Kicker' },
    { key: 'hands_st', label: 'Onside Hands Team', desc: 'Frontline Hands + Safety Returners' },
  ],
  groups: [
    { key: 'depth_groups', label: 'Custom Position Groups', desc: 'Multi-level drill & depth evaluation board' },
  ],
};

const ROW_PRESET_LABELS = [
  'Offensive Line & TE',
  'Wide Receivers & Slots',
  'Backfield (QB & RB)',
  'Defensive Line (DE / DT / NT)',
  'Linebackers (WLB / MLB / SLB)',
  'Secondary & Safeties (CB / FS / SS)',
  'Front Line Coverage',
  'Specialists & Returners',
  'Main Level',
  'Secondary Level',
  'Third Level',
];

export const FormationsView: React.FC<FormationsViewProps> = ({
  unit,
  formations,
  depthChart,
  selectedFormationId,
  onSelectFormation,
  userRole,
  activeTeam,
  teams = [],
  onCopyFormationsFromTeam,
  onAddFormation,
  onMoveFormation,
  onDuplicateFormation,
  onRenameFormation,
  onDeleteFormation,
  onAddRow,
  onEditRowName,
  onEditRowSlots,
  onDeleteRow,
  onAddPosition,
  onEditPositionName,
  onMovePositionRow,
  onCopyPositionToOtherForm,
  onDeletePosition,
  onDropPlayerOnCard,
  onRemovePlayerFromCard,
  onOpenSelectivePrintModal,
  onDragStartPlacedPlayer,
  onPositionCardDragStart,
  onPositionCardDropOnSlot,
  // Direct in-app handlers
  onSetRowSlots,
  onAddSlotToRow,
  onRemoveSlotFromRow,
  onInsertSlotAt,
  onClearPositionToEmpty,
  onAssignPositionToSlot,
  onAddPositionDirect,
  onRenamePositionDirect,
  onRenameRowDirect,
  onAddRowDirect,
  onAddFormationDirect,
  onRenameFormationDirect,
  onDuplicateFormationDirect,
  onMovePositionDirect,
  onCopyPositionDirect,
}) => {
  const [filterViewId, setFilterViewId] = useState<string>('ALL');
  const [dragOverPosId, setDragOverPosId] = useState<string | null>(null);
  const [dragOverSlotKey, setDragOverSlotKey] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceTeamId, setCopySourceTeamId] = useState(
    teams.find((t) => t.id !== activeTeam?.id)?.id || teams[0]?.id || ''
  );

  // In-App Modal Dialog States (Bypasses window.prompt in iframe)
  const [positionPickerTarget, setPositionPickerTarget] = useState<{
    formId: string;
    rIdx: number;
    pIdx: number;
    currentName?: string;
    isEdit?: boolean;
  } | null>(null);
  const [customPosInput, setCustomPosInput] = useState('');

  const [rowSlotsModalTarget, setRowSlotsModalTarget] = useState<{
    formId: string;
    rIdx: number;
    currentSlots: number;
    rowLabel: string;
  } | null>(null);
  const [rowSlotsCountInput, setRowSlotsCountInput] = useState<number>(7);

  const [rowLabelModalTarget, setRowLabelModalTarget] = useState<{
    formId: string;
    rIdx?: number;
    currentLabel?: string;
    isNew?: boolean;
  } | null>(null);
  const [rowLabelInput, setRowLabelInput] = useState('');

  const [formationModalState, setFormationModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'rename' | 'duplicate';
    formId?: string;
    unit: 'offense' | 'defense' | 'st' | 'groups';
    currentName?: string;
  }>({
    isOpen: false,
    mode: 'add',
    unit,
  });
  const [formationNameInput, setFormationNameInput] = useState('');
  const [formationTemplateKey, setFormationTemplateKey] = useState('');

  const [movePositionTarget, setMovePositionTarget] = useState<{
    formId: string;
    rIdx: number;
    pIdx: number;
    posName: string;
  } | null>(null);
  const [selectedTargetRowIdx, setSelectedTargetRowIdx] = useState<number>(0);

  const [copyPositionTarget, setCopyPositionTarget] = useState<{
    formId: string;
    rIdx: number;
    pIdx: number;
    posName: string;
  } | null>(null);
  const [selectedTargetFormId, setSelectedTargetFormId] = useState<string>('');

  const unitFormations = formations.filter((f) => f && f.unit === unit);
  const displayedFormations =
    filterViewId === 'ALL'
      ? unitFormations
      : unitFormations.filter((f) => f.id === filterViewId);

  const teamDisplayName = activeTeam
    ? `${activeTeam.name} ${activeTeam.ageGroup ? `(${activeTeam.ageGroup})` : ''}`
    : 'Football Program';

  // Helper to trigger slot count change directly
  const handleDirectSetSlots = (formId: string, rIdx: number, newCount: number) => {
    const safeCount = Math.max(1, Math.min(12, newCount));
    if (onSetRowSlots) {
      onSetRowSlots(formId, rIdx, safeCount);
    } else if (onEditRowSlots) {
      onEditRowSlots(formId, rIdx);
    }
  };

  // Helper to add 1 slot to row
  const handleQuickAddSlot = (formId: string, rIdx: number, currentLen: number) => {
    if (currentLen >= 12) return;
    if (onAddSlotToRow) {
      onAddSlotToRow(formId, rIdx);
    } else {
      handleDirectSetSlots(formId, rIdx, currentLen + 1);
    }
  };

  // Helper to remove 1 slot from row
  const handleQuickRemoveSlot = (formId: string, rIdx: number, currentLen: number) => {
    if (currentLen <= 1) return;
    if (onRemoveSlotFromRow) {
      onRemoveSlotFromRow(formId, rIdx);
    } else {
      handleDirectSetSlots(formId, rIdx, currentLen - 1);
    }
  };

  // Preset suggestions based on unit
  const activePresetTags =
    unit === 'offense'
      ? OFFENSE_PRESET_TAGS
      : unit === 'defense'
      ? DEFENSE_PRESET_TAGS
      : unit === 'st'
      ? SPECIAL_TEAMS_PRESET_TAGS
      : [...OFFENSE_PRESET_TAGS.slice(0, 8), ...DEFENSE_PRESET_TAGS.slice(0, 8)];

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/95 backdrop-blur-md p-4 rounded-3xl border border-slate-700/80 shadow-xl print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTeam && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-500/30 text-xs shadow-inner">
              <span className="text-[10px] font-black uppercase text-indigo-400 font-mono">
                Team Playbook:
              </span>
              <span className="font-bold text-white">{activeTeam.name}</span>
            </div>
          )}

          {userRole === 'admin' && (
            <>
              <button
                onClick={() => {
                  setFormationNameInput('');
                  setFormationTemplateKey(FORMATION_TEMPLATES[unit]?.[0]?.key || '');
                  setFormationModalState({
                    isOpen: true,
                    mode: 'add',
                    unit,
                  });
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-500/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  Add{' '}
                  {unit === 'offense'
                    ? 'Offensive'
                    : unit === 'defense'
                    ? 'Defensive'
                    : unit === 'st'
                    ? 'Special Teams'
                    : 'Depth Chart'}{' '}
                  Formation
                </span>
              </button>

              {teams.length > 1 && onCopyFormationsFromTeam && (
                <button
                  onClick={() => setShowCopyModal(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-750 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copy formations from another team's playbook"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone from Team...</span>
                </button>
              )}
            </>
          )}

          {/* On-screen view filter */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-black text-slate-200">Filter View:</span>
            <select
              value={filterViewId}
              onChange={(e) => setFilterViewId(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-xs font-bold text-slate-100 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Formations ({unitFormations.length})</option>
              {unitFormations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print All</span>
          </button>
          <button
            onClick={() => onOpenSelectivePrintModal(unit)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Selective Print</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Title Header (Shown only on Print) */}
      <div className="hidden print:block mb-2 border-b-2 border-black pb-1.5 text-center">
        <h1 className="font-black text-sm uppercase text-black tracking-wider">
          {teamDisplayName} &bull;{' '}
          {unit === 'offense'
            ? 'Offensive'
            : unit === 'defense'
            ? 'Defensive'
            : unit === 'st'
            ? 'Special Teams'
            : 'Depth Chart'}{' '}
          Formation Sheets
        </h1>
        <p className="text-[10px] font-bold text-black mt-0.5">
          High-Visibility Sideline Depth Chart &bull; Starters (ST) &bull; 2nd String (D2)
          &bull; 3rd String (D3) &bull; 4th+ String (D4+)
        </p>
      </div>

      {displayedFormations.length === 0 && (
        <div className="bg-slate-800/90 rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400 shadow-xl space-y-3">
          <p className="text-sm font-bold text-slate-200">No formations found for this unit.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create your first formation scheme or click Clone to import existing formations from
            another squad.
          </p>
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setFormationNameInput('');
                setFormationTemplateKey(FORMATION_TEMPLATES[unit]?.[0]?.key || '');
                setFormationModalState({
                  isOpen: true,
                  mode: 'add',
                  unit,
                });
              }}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Formation
            </button>
          )}
        </div>
      )}

      {/* Formation Cards */}
      <div className="space-y-6 print:space-y-3">
        {displayedFormations.map((form) => {
          const isSelected = selectedFormationId === form.id;

          return (
            <div
              key={form.id}
              data-form-id={form.id}
              onClick={() => onSelectFormation(form.id)}
              className={`formation-container bg-slate-800/90 backdrop-blur-md rounded-3xl border transition-all p-5 relative shadow-xl ${
                isSelected
                  ? 'border-indigo-500/80 shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {/* Formation Card Header */}
              <div className="formation-card-header flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-700/80 mb-4 print:pb-2 print:mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-xs print:w-7 print:h-7 print:bg-black print:text-white print:border-black print:text-xs print:font-black print:rounded-md">
                    {unit === 'offense'
                      ? 'OFF'
                      : unit === 'defense'
                      ? 'DEF'
                      : unit === 'st'
                      ? 'ST'
                      : 'GRP'}
                  </div>
                  <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight print:text-black print:text-xl print:font-black print:tracking-wider">
                    {form.name}
                  </h2>
                </div>

                {/* Admin Controls for Formation */}
                {userRole === 'admin' && (
                  <div
                    className="flex items-center gap-1.5 flex-wrap print:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onMoveFormation(form.id, -1)}
                      title="Move Formation Up"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveFormation(form.id, 1)}
                      title="Move Formation Down"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setRowLabelInput('Secondary Level');
                        setRowLabelModalTarget({
                          formId: form.id,
                          isNew: true,
                        });
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-900/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>Add Row</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormationNameInput(`${form.name} (Copy)`);
                        setFormationModalState({
                          isOpen: true,
                          mode: 'duplicate',
                          formId: form.id,
                          unit: form.unit,
                        });
                      }}
                      title="Duplicate formation with all players"
                      className="px-2.5 py-1 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormationNameInput(form.name);
                        setFormationModalState({
                          isOpen: true,
                          mode: 'rename',
                          formId: form.id,
                          unit: form.unit,
                        });
                      }}
                      title="Rename formation"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFormation(form.id)}
                      title="Delete formation"
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rows inside Formation */}
              <div className="space-y-4 print:space-y-2">
                {((form && Array.isArray(form.rows)) ? form.rows : []).map((row, rIdx) => {
                  const positionsList = (row && Array.isArray(row.positions)) ? row.positions : [];
                  const slotCount = positionsList.length || row?.slotCount || 7;

                  return (
                    <div key={row?.id || rIdx} className="space-y-2 print:space-y-1">
                      {/* Level/Row Header Bar */}
                      <div className="formation-row-header flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-inner">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (userRole === 'admin') {
                              setRowLabelInput(row?.label || `Level ${rIdx + 1}`);
                              setRowLabelModalTarget({
                                formId: form.id,
                                rIdx,
                                currentLabel: row?.label,
                                isNew: false,
                              });
                            }
                          }}
                          className={`text-[11px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 print:text-black ${
                            userRole === 'admin'
                              ? 'cursor-pointer hover:text-indigo-300 group transition-colors'
                              : ''
                          }`}
                        >
                          <span>{row?.label || `Level ${rIdx + 1}`}</span>
                          {userRole === 'admin' && (
                            <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors print:hidden" />
                          )}
                        </div>

                        {/* Row Level Action Buttons & Slot Steppers */}
                        {userRole === 'admin' && (
                          <div
                            className="flex items-center gap-1.5 print:hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Quick Slot Stepper Controls: [ - ] [ Slots (N) ] [ + ] */}
                            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5 shadow-xs">
                              <button
                                onClick={() => handleQuickRemoveSlot(form.id, rIdx, positionsList.length)}
                                disabled={positionsList.length <= 1}
                                title="Remove 1 slot from row"
                                className="px-1.5 py-0.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <button
                                onClick={() => {
                                  setRowSlotsCountInput(positionsList.length);
                                  setRowSlotsModalTarget({
                                    formId: form.id,
                                    rIdx,
                                    currentSlots: positionsList.length,
                                    rowLabel: row?.label || `Row ${rIdx + 1}`,
                                  });
                                }}
                                title="Configure number of slots (1 to 12)"
                                className="px-2 py-0.5 text-[10.5px] font-black text-indigo-300 hover:text-white hover:bg-indigo-600/30 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Settings2 className="w-2.5 h-2.5 text-indigo-400" />
                                <span>{positionsList.length} Slots</span>
                              </button>

                              <button
                                onClick={() => handleQuickAddSlot(form.id, rIdx, positionsList.length)}
                                disabled={positionsList.length >= 12}
                                title="Add 1 slot to row"
                                className="px-1.5 py-0.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/80 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Add Empty Slot Button */}
                            <button
                              onClick={() => handleQuickAddSlot(form.id, rIdx, positionsList.length)}
                              disabled={positionsList.length >= 12}
                              title="Add an empty spacing slot to this row"
                              className="px-2.5 py-1 text-[10.5px] font-bold bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-40"
                            >
                              <SquarePlus className="w-3 h-3 text-indigo-400" />
                              <span>+ Empty Slot</span>
                            </button>

                            {/* Add Position Button */}
                            <button
                              onClick={() => {
                                const emptyIdx = positionsList.indexOf(null);
                                setCustomPosInput('');
                                setPositionPickerTarget({
                                  formId: form.id,
                                  rIdx,
                                  pIdx: emptyIdx !== -1 ? emptyIdx : positionsList.length,
                                  isEdit: false,
                                });
                              }}
                              className="px-2.5 py-1 text-[10.5px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3 h-3 text-emerald-400" />
                              <span>+ Pos</span>
                            </button>

                            {/* Delete Row Button */}
                            <button
                              onClick={() => onDeleteRow(form.id, rIdx)}
                              title="Delete Row"
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Formation Grid Row */}
                      <div
                        className="formation-grid-row grid gap-2.5 p-3 bg-slate-900/60 border border-slate-700/80 rounded-2xl overflow-x-auto print:overflow-visible print:p-1.5 print:gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                        style={{
                          gridTemplateColumns: `repeat(${slotCount}, minmax(115px, 1fr))`,
                        }}
                      >
                        {positionsList.map((pos, pIdx) => {
                          const slotKey = `${form.id}_${rIdx}_${pIdx}`;
                          const isSlotDragOver = dragOverSlotKey === slotKey;

                          return (
                            <div
                              key={pIdx}
                              onDragOver={(e) => {
                                if (userRole === 'admin') {
                                  e.preventDefault();
                                  setDragOverSlotKey(slotKey);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverSlotKey === slotKey) setDragOverSlotKey(null);
                              }}
                              onDrop={(e) => {
                                if (userRole === 'admin') {
                                  setDragOverSlotKey(null);
                                  onPositionCardDropOnSlot(e, form.id, rIdx, pIdx);
                                }
                              }}
                              className={`position-slot-card min-h-[115px] print:min-h-[55px] rounded-2xl flex flex-col transition-all relative ${
                                isSlotDragOver
                                  ? 'bg-indigo-950/60 border-2 border-dashed border-indigo-400 ring-2 ring-indigo-500/40'
                                  : pos
                                  ? 'bg-slate-850/90 bg-slate-800/90'
                                  : 'bg-slate-900/40 border border-dashed border-slate-700/60 hover:border-indigo-500/60 hover:bg-indigo-950/20'
                              }`}
                            >
                              {pos ? (
                                <div
                                  onDragOver={(e) => {
                                    if (userRole === 'admin') {
                                      e.preventDefault();
                                      setDragOverPosId(pos.id);
                                    }
                                  }}
                                  onDragLeave={() => {
                                    if (dragOverPosId === pos.id) setDragOverPosId(null);
                                  }}
                                  onDrop={(e) => {
                                    if (userRole === 'admin') {
                                      setDragOverPosId(null);
                                      onDropPlayerOnCard(pos.id, form.id, row.id);
                                    }
                                  }}
                                  className={`h-full flex flex-col rounded-2xl print:rounded-none border transition-all ${
                                    dragOverPosId === pos.id
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/40 shadow-lg'
                                      : 'border-slate-700 shadow-sm'
                                  }`}
                                >
                                  {/* Card Header (Position Name + Actions) */}
                                  <div
                                    draggable={userRole === 'admin'}
                                    onDragStart={(e) =>
                                      onPositionCardDragStart(e, form.id, rIdx, pIdx)
                                    }
                                    className={`position-card-title px-2.5 py-1.5 bg-slate-900 border-b border-slate-700 rounded-t-2xl print:rounded-none flex items-center justify-between text-xs font-black select-none ${
                                      userRole === 'admin' ? 'cursor-grab active:cursor-grabbing' : ''
                                    }`}
                                  >
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (userRole === 'admin') {
                                          setCustomPosInput(pos.name);
                                          setPositionPickerTarget({
                                            formId: form.id,
                                            rIdx,
                                            pIdx,
                                            currentName: pos.name,
                                            isEdit: true,
                                          });
                                        }
                                      }}
                                      className={`flex items-center gap-1 truncate ${
                                        userRole === 'admin'
                                          ? 'hover:text-indigo-400 cursor-pointer'
                                          : ''
                                      }`}
                                    >
                                      <span className="font-black text-[11px] print:text-[10px] text-indigo-300 print:text-slate-950 tracking-tight">
                                        {pos.name}
                                      </span>
                                      {userRole === 'admin' && (
                                        <Edit2 className="w-2.5 h-2.5 text-slate-500 hover:text-indigo-400 print:hidden" />
                                      )}
                                    </div>

                                    {/* Position Header Actions */}
                                    {userRole === 'admin' && (
                                      <div
                                        className="flex items-center gap-0.5 print:hidden"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          onClick={() => {
                                            if (onInsertSlotAt) {
                                              onInsertSlotAt(form.id, rIdx, pIdx);
                                            } else {
                                              handleQuickAddSlot(form.id, rIdx, positionsList.length);
                                            }
                                          }}
                                          title="Insert empty slot to the left (←)"
                                          className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                          <ArrowLeft className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (onInsertSlotAt) {
                                              onInsertSlotAt(form.id, rIdx, pIdx + 1);
                                            } else {
                                              handleQuickAddSlot(form.id, rIdx, positionsList.length);
                                            }
                                          }}
                                          title="Insert empty slot to the right (→)"
                                          className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                          <ArrowRight className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (onClearPositionToEmpty) {
                                              onClearPositionToEmpty(form.id, rIdx, pIdx);
                                            } else {
                                              onDeletePosition(form.id, rIdx, pIdx);
                                            }
                                          }}
                                          title="Clear position name (make this slot empty for spacing)"
                                          className="p-1 text-amber-400 hover:text-amber-300 rounded hover:bg-amber-950/40 cursor-pointer"
                                        >
                                          <Eraser className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedTargetRowIdx(
                                              rIdx === 0 && form.rows.length > 1 ? 1 : 0
                                            );
                                            setMovePositionTarget({
                                              formId: form.id,
                                              rIdx,
                                              pIdx,
                                              posName: pos.name,
                                            });
                                          }}
                                          title="Move position to another row"
                                          className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                          <Move className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const other = formations.find((f) => f.id !== form.id);
                                            setSelectedTargetFormId(other?.id || '');
                                            setCopyPositionTarget({
                                              formId: form.id,
                                              rIdx,
                                              pIdx,
                                              posName: pos.name,
                                            });
                                          }}
                                          title="Copy position to another formation"
                                          className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (onRemoveSlotFromRow) {
                                              onRemoveSlotFromRow(form.id, rIdx, pIdx);
                                            } else {
                                              onDeletePosition(form.id, rIdx, pIdx);
                                            }
                                          }}
                                          title="Delete slot completely from row"
                                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Player List on this Position Card */}
                                  <div className="p-2 print:p-1 flex-1 flex flex-col gap-1.5 print:gap-1 min-h-[64px] print:min-h-[40px]">
                                    {(depthChart[pos.id] || []).map((player, plIdx) => {
                                      const isStarter = plIdx === 0;
                                      const isD2 = plIdx === 1;
                                      const isD3 = plIdx === 2;

                                      return (
                                        <div
                                          key={plIdx}
                                          draggable={userRole === 'admin'}
                                          onDragStart={(e) =>
                                            onDragStartPlacedPlayer(e, pos.id, plIdx, player)
                                          }
                                          className={`px-2 py-1 print:px-1 print:py-0.5 rounded-xl print:rounded-sm border text-[10.5px] print:text-[8.5px] font-bold flex items-center justify-between transition-all select-none ${
                                            isStarter
                                              ? 'bg-slate-950 text-indigo-300 border-indigo-500/40 shadow-xs print-player-badge-starter'
                                              : isD2
                                              ? 'bg-amber-400 text-slate-950 border-amber-500 font-extrabold shadow-xs print-player-badge-d2'
                                              : isD3
                                              ? 'bg-blue-700 text-white border-blue-500 font-extrabold shadow-xs print-player-badge-d3'
                                              : 'bg-white text-slate-900 border-slate-300 font-extrabold shadow-xs print-player-badge-d4'
                                          } ${userRole === 'admin' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                                            <span
                                              className={`text-[8.5px] print:text-[7.5px] font-black uppercase px-1 py-0.2 rounded-md ${
                                                isStarter
                                                  ? 'bg-indigo-500/20 text-indigo-300 print-tag-st'
                                                  : isD2
                                                  ? 'bg-black/20 text-black print-tag-d2'
                                                  : isD3
                                                  ? 'bg-white/20 text-white print-tag-d3'
                                                  : 'bg-slate-200 text-slate-900 border border-slate-300 print-tag-d4'
                                              }`}
                                            >
                                              {isStarter ? 'ST' : isD2 ? 'D2' : isD3 ? 'D3' : `D${plIdx + 1}`}
                                            </span>
                                            <span className="font-mono text-[10px] print:text-[8.5px] opacity-90 font-black">
                                              #{player.num}
                                            </span>
                                            <span className="truncate uppercase font-extrabold">
                                              {player.name}
                                            </span>
                                          </div>

                                          {userRole === 'admin' && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onRemovePlayerFromCard(pos.id, plIdx);
                                              }}
                                              className={`ml-1 opacity-70 hover:opacity-100 print:hidden text-xs cursor-pointer ${
                                                isStarter
                                                  ? 'text-indigo-300 hover:text-rose-300'
                                                  : isD2
                                                  ? 'text-slate-900 hover:text-rose-700'
                                                  : isD3
                                                  ? 'text-white hover:text-rose-300'
                                                  : 'text-slate-700 hover:text-rose-600'
                                              }`}
                                            >
                                              &times;
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {(!depthChart[pos.id] || depthChart[pos.id].length === 0) && (
                                      <div className="flex-1 flex items-center justify-center text-[10px] text-slate-500 font-medium italic border border-dashed border-slate-800 rounded-xl print:rounded-none p-2 print:p-0.5 print:border-none">
                                        <span className="print:hidden">Open</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* Interactive Empty Slot */
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (userRole === 'admin') {
                                      setCustomPosInput('');
                                      setPositionPickerTarget({
                                        formId: form.id,
                                        rIdx,
                                        pIdx,
                                        isEdit: false,
                                      });
                                    }
                                  }}
                                  className={`flex-1 flex flex-col items-center justify-between p-2.5 text-center transition-all ${
                                    userRole === 'admin'
                                      ? 'cursor-pointer hover:bg-indigo-950/30 group'
                                      : ''
                                  }`}
                                >
                                  {/* Top label / slot indicator */}
                                  <div className="w-full flex items-center justify-between text-[8.5px] font-bold text-slate-400">
                                    <span>Empty Slot #{pIdx + 1}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-indigo-400 font-bold transition-opacity">
                                      + Pos
                                    </span>
                                  </div>

                                  {/* Center Add Position Icon */}
                                  <div className="my-1.5 flex flex-col items-center">
                                    <div className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700/80 group-hover:border-indigo-500/60 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-300 flex items-center justify-center transition-all shadow-inner">
                                      <Plus className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 mt-1 transition-colors">
                                      + Position
                                    </span>
                                  </div>

                                  {/* Bottom Slot Action Bar */}
                                  {userRole === 'admin' && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full flex items-center justify-center gap-1.5 pt-1 border-t border-slate-800/80 opacity-60 group-hover:opacity-100 transition-opacity"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onInsertSlotAt) {
                                            onInsertSlotAt(form.id, rIdx, pIdx);
                                          } else {
                                            handleQuickAddSlot(form.id, rIdx, positionsList.length);
                                          }
                                        }}
                                        title="Insert empty slot left (←)"
                                        className="p-1 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all text-[9px] flex items-center gap-0.5"
                                      >
                                        <ArrowLeft className="w-2.5 h-2.5" />
                                        <span className="text-[8px] font-bold">Slot</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onInsertSlotAt) {
                                            onInsertSlotAt(form.id, rIdx, pIdx + 1);
                                          } else {
                                            handleQuickAddSlot(form.id, rIdx, positionsList.length);
                                          }
                                        }}
                                        title="Insert empty slot right (→)"
                                        className="p-1 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all text-[9px] flex items-center gap-0.5"
                                      >
                                        <span className="text-[8px] font-bold">Slot</span>
                                        <ArrowRight className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onRemoveSlotFromRow) {
                                            onRemoveSlotFromRow(form.id, rIdx, pIdx);
                                          } else {
                                            handleQuickRemoveSlot(form.id, rIdx, positionsList.length);
                                          }
                                        }}
                                        title="Delete this empty slot"
                                        className="p-1 rounded-md bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all text-[9px]"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Direct "+ Add Slot" card at end of row for 1-click slot insertion */}
                        {userRole === 'admin' && positionsList.length < 12 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAddSlot(form.id, rIdx, positionsList.length);
                            }}
                            title="Add an empty slot to the end of this row"
                            className="min-h-[115px] print:hidden rounded-2xl border-2 border-dashed border-slate-700/60 hover:border-indigo-500/80 hover:bg-indigo-950/20 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 group-hover:border-indigo-500/80 group-hover:bg-indigo-600/30 text-slate-400 group-hover:text-indigo-300 flex items-center justify-center transition-all shadow-inner">
                              <SquarePlus className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 mt-1.5 transition-colors">
                              + Empty Slot
                            </span>
                            <span className="text-[8px] text-slate-400 font-medium">
                              Slot #{positionsList.length + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
         1. POSITION PICKER & BUILDER MODAL (In-App Dialog)
         ========================================================================= */}
      {positionPickerTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  {positionPickerTarget.isEdit ? 'Rename Position Slot' : 'Assign / Create Position'}
                </h3>
              </div>
              <button
                onClick={() => setPositionPickerTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                Position Label:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPosInput}
                  onChange={(e) => setCustomPosInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPosInput.trim()) {
                      const val = customPosInput.trim();
                      if (positionPickerTarget.isEdit) {
                        if (onRenamePositionDirect) {
                          onRenamePositionDirect(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            positionPickerTarget.pIdx,
                            val
                          );
                        } else if (onEditPositionName) {
                          onEditPositionName(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            positionPickerTarget.pIdx
                          );
                        }
                      } else {
                        if (onAssignPositionToSlot) {
                          onAssignPositionToSlot(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            positionPickerTarget.pIdx,
                            val
                          );
                        } else if (onAddPositionDirect) {
                          onAddPositionDirect(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            val
                          );
                        }
                      }
                      setPositionPickerTarget(null);
                    }
                  }}
                  placeholder="e.g. QB, MLB, LT, Gunner..."
                  autoFocus
                  className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    if (!customPosInput.trim()) return;
                    const val = customPosInput.trim();
                    if (positionPickerTarget.isEdit) {
                      if (onRenamePositionDirect) {
                        onRenamePositionDirect(
                          positionPickerTarget.formId,
                          positionPickerTarget.rIdx,
                          positionPickerTarget.pIdx,
                          val
                        );
                      }
                    } else {
                      if (onAssignPositionToSlot) {
                        onAssignPositionToSlot(
                          positionPickerTarget.formId,
                          positionPickerTarget.rIdx,
                          positionPickerTarget.pIdx,
                          val
                        );
                      }
                    }
                    setPositionPickerTarget(null);
                  }}
                  disabled={!customPosInput.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Quick Football Position Preset Badges */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-400">
                ⚡ Quick Select Standard Positions:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                {activePresetTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (positionPickerTarget.isEdit) {
                        if (onRenamePositionDirect) {
                          onRenamePositionDirect(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            positionPickerTarget.pIdx,
                            tag
                          );
                        }
                      } else {
                        if (onAssignPositionToSlot) {
                          onAssignPositionToSlot(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            positionPickerTarget.pIdx,
                            tag
                          );
                        } else if (onAddPositionDirect) {
                          onAddPositionDirect(
                            positionPickerTarget.formId,
                            positionPickerTarget.rIdx,
                            tag
                          );
                        }
                      }
                      setPositionPickerTarget(null);
                    }}
                    className="px-2.5 py-1.5 bg-slate-850 hover:bg-indigo-600 hover:text-white border border-slate-700/80 rounded-xl text-xs font-black text-slate-200 transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onClearPositionToEmpty) {
                      onClearPositionToEmpty(
                        positionPickerTarget.formId,
                        positionPickerTarget.rIdx,
                        positionPickerTarget.pIdx
                      );
                    } else if (onRemoveSlotFromRow) {
                      onRemoveSlotFromRow(
                        positionPickerTarget.formId,
                        positionPickerTarget.rIdx,
                        positionPickerTarget.pIdx
                      );
                    }
                    setPositionPickerTarget(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Make Slot Empty</span>
                </button>

                <button
                  onClick={() => {
                    if (onRemoveSlotFromRow) {
                      onRemoveSlotFromRow(
                        positionPickerTarget.formId,
                        positionPickerTarget.rIdx,
                        positionPickerTarget.pIdx
                      );
                    } else {
                      handleQuickRemoveSlot(
                        positionPickerTarget.formId,
                        positionPickerTarget.rIdx,
                        positionPickerTarget.pIdx + 1
                      );
                    }
                    setPositionPickerTarget(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer border border-rose-500/30"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Delete Slot</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPositionPickerTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         2. ROW SLOTS CONFIG MODAL
         ========================================================================= */}
      {rowSlotsModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  Configure Row Slot Count
                </h3>
              </div>
              <button
                onClick={() => setRowSlotsModalTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-medium">
                Set how many position slots are rendered in row{' '}
                <strong className="text-indigo-300">"{rowSlotsModalTarget.rowLabel}"</strong>.
              </p>
            </div>

            {/* Stepper Control */}
            <div className="flex items-center justify-center gap-4 py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <button
                onClick={() => setRowSlotsCountInput((prev) => Math.max(1, prev - 1))}
                disabled={rowSlotsCountInput <= 1}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-md"
              >
                -
              </button>
              <div className="text-center px-4">
                <span className="text-3xl font-black text-white font-mono">
                  {rowSlotsCountInput}
                </span>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Slots (1 to 12)
                </span>
              </div>
              <button
                onClick={() => setRowSlotsCountInput((prev) => Math.min(12, prev + 1))}
                disabled={rowSlotsCountInput >= 12}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-md"
              >
                +
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-400">
                Common Grid Presets:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 7, 9, 11].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setRowSlotsCountInput(cnt)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      rowSlotsCountInput === cnt
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {cnt} Slots
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRowSlotsModalTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDirectSetSlots(
                    rowSlotsModalTarget.formId,
                    rowSlotsModalTarget.rIdx,
                    rowSlotsCountInput
                  );
                  setRowSlotsModalTarget(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Slots ({rowSlotsCountInput})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         3. ROW LABEL / ADD ROW MODAL
         ========================================================================= */}
      {rowLabelModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  {rowLabelModalTarget.isNew ? 'Add New Row Level' : 'Rename Row Level'}
                </h3>
              </div>
              <button
                onClick={() => setRowLabelModalTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase text-slate-300">
                Row Label / Header:
              </label>
              <input
                type="text"
                value={rowLabelInput}
                onChange={(e) => setRowLabelInput(e.target.value)}
                placeholder="e.g. Backfield, Linebackers, Secondary..."
                autoFocus
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-indigo-400">
                Preset Suggestions:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                {ROW_PRESET_LABELS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRowLabelInput(preset)}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-indigo-600 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRowLabelModalTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rowLabelInput.trim()) return;
                  const label = rowLabelInput.trim();
                  if (rowLabelModalTarget.isNew) {
                    if (onAddRowDirect) {
                      onAddRowDirect(rowLabelModalTarget.formId, label, 7);
                    } else if (onAddRow) {
                      onAddRow(rowLabelModalTarget.formId);
                    }
                  } else if (typeof rowLabelModalTarget.rIdx === 'number') {
                    if (onRenameRowDirect) {
                      onRenameRowDirect(
                        rowLabelModalTarget.formId,
                        rowLabelModalTarget.rIdx,
                        label
                      );
                    } else if (onEditRowName) {
                      onEditRowName(rowLabelModalTarget.formId, rowLabelModalTarget.rIdx);
                    }
                  }
                  setRowLabelModalTarget(null);
                }}
                disabled={!rowLabelInput.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{rowLabelModalTarget.isNew ? 'Create Row' : 'Save Name'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         4. FORMATION BUILDER / RENAME / DUPLICATE MODAL
         ========================================================================= */}
      {formationModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  {formationModalState.mode === 'add'
                    ? `Create ${formationModalState.unit.toUpperCase()} Formation`
                    : formationModalState.mode === 'rename'
                    ? 'Rename Formation'
                    : 'Duplicate Formation'}
                </h3>
              </div>
              <button
                onClick={() => setFormationModalState((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase text-slate-300">
                Formation Name:
              </label>
              <input
                type="text"
                value={formationNameInput}
                onChange={(e) => setFormationNameInput(e.target.value)}
                placeholder="e.g. 11 Shotgun / 4-4 Base Defense / Punt..."
                autoFocus
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Template selector when adding */}
            {formationModalState.mode === 'add' && FORMATION_TEMPLATES[formationModalState.unit] && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  ⚡ Choose Preset Football Template (Optional):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {FORMATION_TEMPLATES[formationModalState.unit].map((tpl) => (
                    <div
                      key={tpl.key}
                      onClick={() => {
                        setFormationTemplateKey(tpl.key);
                        if (!formationNameInput) {
                          setFormationNameInput(tpl.label.split('(')[0].trim());
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        formationTemplateKey === tpl.key
                          ? 'bg-indigo-600/20 border-indigo-500/80 ring-1 ring-indigo-500'
                          : 'bg-slate-850/80 hover:bg-slate-800 border-slate-700/80'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black text-slate-100 block">
                          {tpl.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {tpl.desc}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          formationTemplateKey === tpl.key ? 'text-indigo-400' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setFormationModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formationNameInput.trim()) return;
                  const name = formationNameInput.trim();

                  if (formationModalState.mode === 'add') {
                    if (onAddFormationDirect) {
                      onAddFormationDirect(formationModalState.unit, name, formationTemplateKey);
                    } else if (onAddFormation) {
                      onAddFormation(formationModalState.unit);
                    }
                  } else if (formationModalState.mode === 'rename' && formationModalState.formId) {
                    if (onRenameFormationDirect) {
                      onRenameFormationDirect(formationModalState.formId, name);
                    } else if (onRenameFormation) {
                      onRenameFormation(formationModalState.formId);
                    }
                  } else if (formationModalState.mode === 'duplicate' && formationModalState.formId) {
                    if (onDuplicateFormationDirect) {
                      onDuplicateFormationDirect(formationModalState.formId, name);
                    } else if (onDuplicateFormation) {
                      onDuplicateFormation(formationModalState.formId);
                    }
                  }

                  setFormationModalState((prev) => ({ ...prev, isOpen: false }));
                }}
                disabled={!formationNameInput.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {formationModalState.mode === 'add'
                    ? 'Create Formation'
                    : formationModalState.mode === 'rename'
                    ? 'Save Name'
                    : 'Duplicate'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         5. MOVE POSITION MODAL
         ========================================================================= */}
      {movePositionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Move className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  Move [{movePositionTarget.posName}] to Another Row
                </h3>
              </div>
              <button
                onClick={() => setMovePositionTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select destination row level inside this formation:
            </p>

            <div className="space-y-2">
              {formations
                .find((f) => f.id === movePositionTarget.formId)
                ?.rows.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    onClick={() => setSelectedTargetRowIdx(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedTargetRowIdx === idx
                        ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-white block">
                        {r.label || `Level ${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {r.positions.filter(Boolean).length} of {r.positions.length} slots filled
                      </span>
                    </div>
                    {selectedTargetRowIdx === idx && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setMovePositionTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onMovePositionDirect) {
                    onMovePositionDirect(
                      movePositionTarget.formId,
                      movePositionTarget.rIdx,
                      movePositionTarget.pIdx,
                      selectedTargetRowIdx
                    );
                  } else if (onMovePositionRow) {
                    onMovePositionRow(
                      movePositionTarget.formId,
                      movePositionTarget.rIdx,
                      movePositionTarget.pIdx
                    );
                  }
                  setMovePositionTarget(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Move Position</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         6. COPY POSITION MODAL
         ========================================================================= */}
      {copyPositionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-slate-100">
                  Copy [{copyPositionTarget.posName}] to Another Formation
                </h3>
              </div>
              <button
                onClick={() => setCopyPositionTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select destination formation to duplicate this position tag and depth assignments:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formations
                .filter((f) => f.id !== copyPositionTarget.formId)
                .map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedTargetFormId(f.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedTargetFormId === f.id
                        ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-white block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">
                        Unit: {f.unit} &bull; {f.rows.length} rows
                      </span>
                    </div>
                    {selectedTargetFormId === f.id && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCopyPositionTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedTargetFormId) {
                    if (onCopyPositionDirect) {
                      onCopyPositionDirect(
                        copyPositionTarget.formId,
                        copyPositionTarget.rIdx,
                        copyPositionTarget.pIdx,
                        selectedTargetFormId
                      );
                    } else if (onCopyPositionToOtherForm) {
                      onCopyPositionToOtherForm(
                        copyPositionTarget.formId,
                        copyPositionTarget.rIdx,
                        copyPositionTarget.pIdx
                      );
                    }
                  }
                  setCopyPositionTarget(null);
                }}
                disabled={!selectedTargetFormId}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Copy Position</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         7. CLONE FORMATIONS FROM TEAM MODAL
         ========================================================================= */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-slate-100">
                  Clone Formations from Team
                </h3>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copy all offensive, defensive, and special teams formations from another team into{' '}
              <strong className="text-indigo-300">{activeTeam?.name || 'this team'}</strong>.
            </p>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Source Team:
              </label>
              <select
                value={copySourceTeamId}
                onChange={(e) => setCopySourceTeamId(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {teams
                  .filter((t) => t.id !== activeTeam?.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ageGroup || 'Youth'})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onCopyFormationsFromTeam && copySourceTeamId) {
                    onCopyFormationsFromTeam(copySourceTeamId);
                    setShowCopyModal(false);
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Clone Formations</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
