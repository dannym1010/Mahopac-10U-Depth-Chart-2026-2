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
  onAddFormation: (unit: 'offense' | 'defense' | 'st' | 'groups') => void;
  onMoveFormation: (formId: string, direction: number) => void;
  onDuplicateFormation: (formId: string) => void;
  onRenameFormation: (formId: string) => void;
  onDeleteFormation: (formId: string) => void;
  onAddRow: (formId: string) => void;
  onEditRowName: (formId: string, rIdx: number) => void;
  onEditRowSlots: (formId: string, rIdx: number) => void;
  onDeleteRow: (formId: string, rIdx: number) => void;
  onAddPosition: (formId: string, rIdx: number) => void;
  onEditPositionName: (formId: string, rIdx: number, pIdx: number) => void;
  onMovePositionRow: (formId: string, rIdx: number, pIdx: number) => void;
  onCopyPositionToOtherForm: (formId: string, rIdx: number, pIdx: number) => void;
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
}

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
}) => {
  const [filterViewId, setFilterViewId] = useState<string>('ALL');
  const [dragOverPosId, setDragOverPosId] = useState<string | null>(null);
  const [dragOverSlotKey, setDragOverSlotKey] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceTeamId, setCopySourceTeamId] = useState(teams.find((t) => t.id !== activeTeam?.id)?.id || teams[0]?.id || '');

  const unitFormations = formations.filter((f) => f && f.unit === unit);
  const displayedFormations =
    filterViewId === 'ALL'
      ? unitFormations
      : unitFormations.filter((f) => f.id === filterViewId);

  const teamDisplayName = activeTeam ? `${activeTeam.name} ${activeTeam.ageGroup ? `(${activeTeam.ageGroup})` : ''}` : 'Football Program';

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/95 backdrop-blur-md p-4 rounded-3xl border border-slate-700/80 shadow-xl print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTeam && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-500/30 text-xs">
              <span className="text-[10px] font-black uppercase text-indigo-400 font-mono">Team Playbook:</span>
              <span className="font-bold text-white">{activeTeam.name}</span>
            </div>
          )}

          {userRole === 'admin' && (
            <>
              <button
                onClick={() => onAddFormation(unit)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-500/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  Add {unit === 'offense' ? 'Offensive' : unit === 'defense' ? 'Defensive' : unit === 'st' ? 'Special Teams' : 'Depth Chart'} Formation
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

      {/* Clone Formations Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-slate-100">Clone Formations from Team</h3>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copy all offensive, defensive, and special teams formations from another team into <strong className="text-indigo-300">{activeTeam?.name || 'this team'}</strong>.
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
                {teams.filter((t) => t.id !== activeTeam?.id).map((t) => (
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

      {/* Printable Sheet Title Header (Shown only on Print) */}
      <div className="hidden print:block mb-2 border-b-2 border-black pb-1.5 text-center">
        <h1 className="font-black text-sm uppercase text-black tracking-wider">
          {teamDisplayName} &bull; {unit === 'offense' ? 'Offensive' : unit === 'defense' ? 'Defensive' : unit === 'st' ? 'Special Teams' : 'Depth Chart'} Formation Sheets
        </h1>
        <p className="text-[10px] font-bold text-black mt-0.5">
          High-Visibility Sideline Depth Chart &bull; Starters (ST) &bull; 2nd String (D2) &bull; 3rd String (D3) &bull; 4th+ String (D4+)
        </p>
      </div>

      {displayedFormations.length === 0 && (
        <div className="bg-slate-800/90 rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400 shadow-xl">
          <p className="text-sm font-bold text-slate-200">No formations found for this unit.</p>
          {userRole === 'admin' && (
            <button
              onClick={() => onAddFormation(unit)}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Formation
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
                    {unit === 'offense' ? 'OFF' : unit === 'defense' ? 'DEF' : unit === 'st' ? 'ST' : 'GRP'}
                  </div>
                  <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight print:text-black print:text-xl print:font-black print:tracking-wider">
                    {form.name}
                  </h2>
                </div>

                {/* Admin Controls */}
                {userRole === 'admin' && (
                  <div className="flex items-center gap-1.5 flex-wrap print:hidden" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onMoveFormation(form.id, -1)}
                      title="Move Formation Up"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveFormation(form.id, 1)}
                      title="Move Formation Down"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAddRow(form.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-900/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>Add Row</span>
                    </button>
                    <button
                      onClick={() => onDuplicateFormation(form.id)}
                      title="Duplicate formation with all players"
                      className="px-2.5 py-1 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                    <button
                      onClick={() => onRenameFormation(form.id)}
                      title="Rename formation"
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFormation(form.id)}
                      title="Delete formation"
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rows inside Formation */}
              <div className="space-y-4 print:space-y-2">
                {form.rows.map((row, rIdx) => {
                  const positionsList = row.positions || [];
                  const slotCount = positionsList.length || row.slotCount || 7;

                  return (
                    <div key={row.id || rIdx} className="space-y-1.5 print:space-y-1">
                      {/* Level/Row Header Bar */}
                      <div className="formation-row-header flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (userRole === 'admin') onEditRowName(form.id, rIdx);
                          }}
                          className={`text-[10.5px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5 print:text-black ${
                            userRole === 'admin' ? 'cursor-pointer hover:text-indigo-300' : ''
                          }`}
                        >
                          <span>{row.label || `Level ${rIdx + 1}`}</span>
                          {userRole === 'admin' && (
                            <Edit2 className="w-2.5 h-2.5 opacity-60 print:hidden" />
                          )}
                        </div>

                        {/* Row Level Action buttons */}
                        {userRole === 'admin' && (
                          <div
                            className="flex items-center gap-1.5 print:hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onEditRowSlots(form.id, rIdx)}
                              title="Edit number of position slots (1 to 10)"
                              className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg flex items-center gap-1"
                            >
                              <Settings2 className="w-2.5 h-2.5 text-indigo-400" />
                              <span>Slots ({slotCount})</span>
                            </button>
                            <button
                              onClick={() => onAddPosition(form.id, rIdx)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Pos</span>
                            </button>
                            <button
                              onClick={() => onDeleteRow(form.id, rIdx)}
                              title="Delete Row"
                              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg"
                            >
                              <X className="w-3 h-3" />
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
                              className={`position-slot-card min-h-[110px] print:min-h-[55px] rounded-2xl flex flex-col transition-all relative ${
                                isSlotDragOver
                                  ? 'bg-indigo-950/60 border-2 border-dashed border-indigo-400 ring-2 ring-indigo-500/40'
                                  : pos
                                  ? 'bg-slate-850/90 bg-slate-800/90'
                                  : 'bg-slate-900/40 border border-dashed border-slate-700/60'
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
                                        if (userRole === 'admin')
                                          onEditPositionName(form.id, rIdx, pIdx);
                                      }}
                                      className={`flex items-center gap-1 truncate ${
                                        userRole === 'admin' ? 'hover:text-indigo-400 cursor-pointer' : ''
                                      }`}
                                    >
                                      <span className="font-black text-[11px] print:text-[10px] text-indigo-300 print:text-slate-950 tracking-tight">
                                        {pos.name}
                                      </span>
                                    </div>

                                    {/* Position Header Actions */}
                                    {userRole === 'admin' && (
                                      <div
                                        className="flex items-center gap-1 print:hidden"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          onClick={() => onMovePositionRow(form.id, rIdx, pIdx)}
                                          title="Move position to another row"
                                          className="p-0.5 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-800"
                                        >
                                          <Move className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => onCopyPositionToOtherForm(form.id, rIdx, pIdx)}
                                          title="Copy position to another formation"
                                          className="p-0.5 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-800"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => onDeletePosition(form.id, rIdx, pIdx)}
                                          title="Delete position slot"
                                          className="p-0.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40"
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
                                              className={`ml-1 opacity-70 hover:opacity-100 print:hidden text-xs ${
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
                                <div className="flex-1 flex items-center justify-center text-[10px] text-slate-600 italic print:hidden">
                                  Empty
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
