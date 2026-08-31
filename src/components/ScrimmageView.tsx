import React, { useState } from 'react';
import { Swords, Filter, Printer, X } from 'lucide-react';
import {
  FormationBoard,
  PlacedPlayer,
  UserRole,
  Team,
} from '../types';

interface ScrimmageViewProps {
  formations: FormationBoard[];
  scrimmageChart: Record<string, PlacedPlayer[]>;
  scrimmageFilters: string[] | null;
  userRole: UserRole;
  activeTeam?: Team;
  onOpenScrimmageFilterModal: () => void;
  onOpenScrimmagePrintModal: () => void;
  onDropPlayerOnScrimmageCard: (
    targetPosId: string,
    targetFormId: string,
    targetRowId: string
  ) => void;
  onRemovePlayerFromScrimmageCard: (posId: string, playerIndex: number) => void;
  onDragStartPlacedPlayer: (
    e: React.DragEvent,
    posId: string,
    idx: number,
    player: PlacedPlayer
  ) => void;
}

export const ScrimmageView: React.FC<ScrimmageViewProps> = ({
  formations,
  scrimmageChart,
  scrimmageFilters,
  userRole,
  activeTeam,
  onOpenScrimmageFilterModal,
  onOpenScrimmagePrintModal,
  onDropPlayerOnScrimmageCard,
  onRemovePlayerFromScrimmageCard,
  onDragStartPlacedPlayer,
}) => {
  const [dragOverPosId, setDragOverPosId] = useState<string | null>(null);

  const allRelevantForms = formations.filter(
    (f) => f && (f.unit === 'offense' || f.unit === 'defense')
  );
  const activeForms = allRelevantForms.filter(
    (f) => !scrimmageFilters || scrimmageFilters.includes(f.id)
  );

  const teamDisplayName = activeTeam ? `${activeTeam.name} ${activeTeam.ageGroup ? `(${activeTeam.ageGroup})` : ''}` : 'Football Program';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/95 backdrop-blur-md p-4 rounded-3xl border border-slate-700/80 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black shadow-inner">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
              Practice / Scrimmage Rotation
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Gold & Blue Substitutions Rotation Only (Offense & Defense)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenScrimmageFilterModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Boards</span>
          </button>
          <button
            onClick={onOpenScrimmagePrintModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Scrimmage Sheet</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Title Header (Shown only on Print) */}
      <div className="hidden print:block mb-2 border-b-2 border-black pb-1.5 text-center">
        <h1 className="font-black text-sm uppercase text-black tracking-wider">
          {teamDisplayName} &bull; Practice / Scrimmage Rotation Sheet
        </h1>
        <p className="text-[10px] font-bold text-black mt-0.5">
          Gold Group (Primary) &bull; Blue Group (Rotational Subs)
        </p>
      </div>

      {activeForms.length === 0 && (
        <div className="bg-slate-800/90 rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400 shadow-xl">
          <p className="text-sm font-bold text-slate-200">No scrimmage boards selected.</p>
          <button
            onClick={onOpenScrimmageFilterModal}
            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Filter className="w-3.5 h-3.5" /> Select Boards to Include
          </button>
        </div>
      )}

      {/* Scrimmage Formation Cards */}
      <div className="space-y-6 print:space-y-3">
        {activeForms.map((form) => (
          <div
            key={form.id}
            data-form-id={form.id}
            className="formation-container bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5"
          >
            <div className="formation-card-header flex items-center justify-between pb-3.5 border-b border-slate-700/80 mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border print:bg-black print:text-white print:border-black ${
                    form.unit === 'offense'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {form.unit.toUpperCase()}
                </span>
                <h3 className="font-black text-base md:text-lg text-slate-100 print:text-black print:text-sm">
                  {form.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 print:space-y-2">
              {((form && Array.isArray(form.rows)) ? form.rows : []).map((row, rIdx) => {
                const positionsList = (row && Array.isArray(row.positions)) ? row.positions : [];
                const slotCount = positionsList.length || row?.slotCount || 7;

                return (
                  <div key={row?.id || rIdx} className="space-y-1.5 print:space-y-1">
                    <div className="formation-row-header px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-[10.5px] font-black text-slate-300 uppercase tracking-widest print:text-black">
                      {row?.label || `Level ${rIdx + 1}`} (Gold & Blue Rotation)
                    </div>

                    <div
                      className="formation-grid-row grid gap-2.5 p-3 bg-slate-900/60 border border-slate-700/80 rounded-2xl overflow-x-auto print:overflow-visible print:p-1.5 print:gap-1.5"
                      style={{
                        gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
                      }}
                    >
                      {positionsList.map((pos, pIdx) => {
                        if (!pos) {
                          return (
                            <div
                              key={pIdx}
                              className="position-slot-card position-slot-empty min-h-[95px] print:min-h-[50px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-700/60 flex items-center justify-center text-[10px] text-slate-500 italic"
                            >
                              <span className="print:hidden">Empty</span>
                            </div>
                          );
                        }

                        const players = scrimmageChart[pos.id] || [];
                        const isDragOver = dragOverPosId === pos.id;

                        return (
                          <div
                            key={pIdx}
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
                                onDropPlayerOnScrimmageCard(pos.id, form.id, row.id);
                              }
                            }}
                            className={`position-slot-card min-h-[95px] print:min-h-[50px] rounded-2xl print:rounded-none border flex flex-col transition-all bg-slate-800/90 shadow-sm ${
                              isDragOver
                                ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/30'
                                : 'border-slate-700'
                            }`}
                          >
                            {/* Header */}
                            <div className="position-card-title px-2.5 py-1.5 bg-slate-900 border-b border-slate-700 rounded-t-2xl print:rounded-none text-[11px] print:text-[10px] font-black text-indigo-300 print:text-slate-950 text-center tracking-tight">
                              {pos.name}
                            </div>

                            {/* Players */}
                            <div className="p-2 print:p-1 flex-1 flex flex-col gap-1.5 print:gap-1">
                              {players.map((player, sIdx) => {
                                const isGold = sIdx === 0;
                                const isBlue = sIdx === 1;

                                return (
                                  <div
                                    key={sIdx}
                                    draggable={userRole === 'admin'}
                                    onDragStart={(e) =>
                                      onDragStartPlacedPlayer(e, pos.id, sIdx, player)
                                    }
                                    className={`px-2 py-1 print:px-1 print:py-0.5 rounded-xl print:rounded-sm border text-[10.5px] print:text-[8.5px] font-bold flex items-center justify-between transition-all select-none ${
                                      isGold
                                        ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs print-scrimmage-gold'
                                        : isBlue
                                        ? 'bg-blue-700 text-white border-blue-500 font-black shadow-xs print-scrimmage-blue'
                                        : 'bg-white text-slate-900 border-slate-300 font-black shadow-xs print-scrimmage-white'
                                    } ${userRole === 'admin' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                                      <span
                                        className={`text-[8.5px] print:text-[7.5px] font-black uppercase px-1 py-0.2 rounded-md ${
                                          isGold
                                            ? 'bg-black/20 text-black print-tag-gold'
                                            : isBlue
                                            ? 'bg-white/20 text-white print-tag-blue'
                                            : 'bg-slate-200 text-slate-900 border border-slate-300 print-tag-white'
                                        }`}
                                      >
                                        {isGold ? 'Gold' : isBlue ? 'Blue' : `Sub ${sIdx + 1}`}
                                      </span>
                                      <span className="font-mono text-[10px] print:text-[8.5px] opacity-90 font-black">
                                        #{player.num}
                                      </span>
                                      <span className="truncate uppercase font-black">
                                        {player.name}
                                      </span>
                                    </div>

                                    {userRole === 'admin' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemovePlayerFromScrimmageCard(pos.id, sIdx);
                                        }}
                                        className={`ml-1 opacity-70 hover:opacity-100 print:hidden text-xs ${
                                          isGold
                                            ? 'text-slate-900 hover:text-rose-700'
                                            : isBlue
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

                              {players.length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-[9.5px] print:text-[8px] text-slate-500 print:text-slate-300 font-medium italic">
                                  Drop Sub
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
          </div>
        ))}
      </div>
    </div>
  );
};
