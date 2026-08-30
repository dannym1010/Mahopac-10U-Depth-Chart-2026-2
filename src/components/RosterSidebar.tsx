import React from 'react';
import { Search, UserCheck, GripVertical, BookOpen, Layers } from 'lucide-react';
import { RosterPlayer, UserRole, UnitType, WeekState } from '../types';

interface RosterSidebarProps {
  roster: RosterPlayer[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeUnit: UnitType;
  selectedFormationId: string | null;
  currentWeekState: WeekState;
  userRole: UserRole;
  playLibrary: string[];
  playSearchTerm: string;
  onPlaySearchChange: (term: string) => void;
  onDragStartPlayer: (e: React.DragEvent, player: RosterPlayer) => void;
  onDragStartPlay?: (e: React.DragEvent, play: string) => void;
}

export const RosterSidebar: React.FC<RosterSidebarProps> = ({
  roster,
  searchTerm,
  onSearchChange,
  activeUnit,
  selectedFormationId,
  currentWeekState,
  userRole,
  playLibrary,
  playSearchTerm,
  onPlaySearchChange,
  onDragStartPlayer,
  onDragStartPlay,
}) => {
  // If Wristband tab is active, show Play Library
  if (activeUnit === 'wristband') {
    const filteredPlays = playLibrary.filter((p) =>
      p.toLowerCase().includes(playSearchTerm.toLowerCase().trim())
    );

    return (
      <div className="w-full lg:w-72 bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 sticky top-[170px] flex flex-col max-h-[calc(100vh-190px)] print:hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="font-black text-sm text-slate-100 tracking-tight">
              Play Library
            </h2>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {filteredPlays.length} Plays
          </span>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={playSearchTerm}
            onChange={(e) => onPlaySearchChange(e.target.value)}
            placeholder="Search plays..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <ul className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
          {filteredPlays.map((play, idx) => (
            <li
              key={idx}
              draggable={userRole === 'admin'}
              onDragStart={(e) => onDragStartPlay && onDragStartPlay(e, play)}
              className="px-3 py-2 bg-slate-900/80 hover:bg-slate-750 hover:bg-slate-700 border border-slate-700/80 hover:border-indigo-400/50 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between cursor-grab active:cursor-grabbing transition-all select-none group"
            >
              <span className="truncate">{play}</span>
              <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 transition-colors" />
            </li>
          ))}
          {filteredPlays.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              No plays found
            </div>
          )}
        </ul>
      </div>
    );
  }

  // Filter Master Roster
  const filteredRoster = roster.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const fName = p.firstName.toLowerCase();
    const lName = p.lastName.toLowerCase();
    const num = p.num.toLowerCase();
    return fName.includes(term) || lName.includes(term) || num.includes(term);
  });

  const isScrimmageTab = activeUnit === 'scrimmage';
  const activeChart = isScrimmageTab
    ? currentWeekState.scrimmageChart || {}
    : currentWeekState.depthChart || {};

  return (
    <div className="w-full lg:w-80 bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 sticky top-[170px] flex flex-col max-h-[calc(100vh-190px)] print:hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <UserCheck className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-slate-100 tracking-tight">
            Master Roster
          </h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700">
          {roster.length} Players
        </span>
      </div>

      <div className="mb-2">
        <p className="text-[10px] text-slate-300 font-medium leading-tight">
          {isScrimmageTab
            ? 'Drag to assign Gold / Blue scrimmage rotations'
            : 'Click any formation card to inspect active assignments'}
        </p>
      </div>

      {/* Search Box */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or jersey #..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Roster List */}
      <ul className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
        {filteredRoster.map((player) => {
          // Calculate placements in current view
          const placements: { posName: string; badgeClass: string }[] = [];
          const allForms = currentWeekState.formations || [];

          if (isScrimmageTab) {
            allForms
              .filter((f) => f.unit === 'offense' || f.unit === 'defense')
              .forEach((form) => {
                form.rows.forEach((row) => {
                  row.positions.forEach((pos) => {
                    if (pos && activeChart[pos.id]) {
                      activeChart[pos.id].forEach((p, idx) => {
                        if (String(p.num) === String(player.num)) {
                          placements.push({
                            posName: pos.name,
                            badgeClass:
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 font-black border border-amber-500 shadow-xs'
                                : idx === 1
                                ? 'bg-blue-700 text-white font-black border border-blue-500 shadow-xs'
                                : 'bg-white text-slate-900 font-black border border-slate-300 shadow-xs',
                          });
                        }
                      });
                    }
                  });
                });
              });
          } else {
            const currentForm = allForms.find(
              (f) => f.id === selectedFormationId && f.unit === activeUnit
            );
            if (currentForm) {
              currentForm.rows.forEach((row) => {
                row.positions.forEach((pos) => {
                  if (pos && activeChart[pos.id]) {
                    activeChart[pos.id].forEach((p, idx) => {
                      if (String(p.num) === String(player.num)) {
                        placements.push({
                          posName: pos.name,
                          badgeClass:
                            idx === 0
                              ? 'bg-slate-900 text-indigo-300 border border-indigo-500/40 font-black'
                              : idx === 1
                              ? 'bg-amber-400 text-slate-950 border border-amber-500 font-black'
                              : idx === 2
                              ? 'bg-blue-700 text-white border border-blue-500 font-black'
                              : 'bg-white text-slate-900 border border-slate-300 font-black',
                        });
                      }
                    });
                  }
                });
              });
            }
          }

          return (
            <li
              key={player.num}
              draggable={userRole === 'admin'}
              onDragStart={(e) => onDragStartPlayer(e, player)}
              className={`p-2.5 bg-slate-900/80 hover:bg-slate-750 hover:bg-slate-700/90 border border-slate-700/80 hover:border-indigo-400/50 rounded-xl flex items-center justify-between text-xs transition-all select-none ${
                userRole === 'admin' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-black text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-2 py-0.5 text-[11px] min-w-[28px] text-center font-mono">
                  #{player.num}
                </span>
                <span className="font-bold text-slate-100 uppercase tracking-tight text-[11px] truncate">
                  {player.firstName} {player.lastName}
                </span>
              </div>

              {/* Badges for active positions */}
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {placements.map((pl, pIdx) => (
                  <span
                    key={pIdx}
                    className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider ${pl.badgeClass}`}
                  >
                    {pl.posName}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
        {filteredRoster.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            No player found
          </div>
        )}
      </ul>
    </div>
  );
};
