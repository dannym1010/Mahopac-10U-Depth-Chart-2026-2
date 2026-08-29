import React from 'react';
import { Watch, Plus, Minus, Printer, BookOpen } from 'lucide-react';
import { WristbandData, UserRole } from '../types';

interface WristbandViewProps {
  wristbandData: WristbandData;
  userRole: UserRole;
  onAddRow: () => void;
  onRemoveRow: () => void;
  onUpdatePlay: (colIdx: number, rowIdx: number, text: string) => void;
}

export const WristbandView: React.FC<WristbandViewProps> = ({
  wristbandData,
  userRole,
  onAddRow,
  onRemoveRow,
  onUpdatePlay,
}) => {
  const rowCount = wristbandData?.rows || 10;
  const col = wristbandData?.columns?.[0] || { color: 'blue', plays: [] };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black shadow-inner">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
              QB / Skill Wristband Playbook Sheet
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Standard size wristband insert layout for sideline play calling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && (
            <>
              <button
                onClick={onAddRow}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Row</span>
              </button>
              <button
                onClick={onRemoveRow}
                disabled={rowCount <= 1}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove Row</span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-800 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Wristband</span>
          </button>
        </div>
      </div>

      {/* Wristband Card Table Bento Container */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-8 flex flex-col items-center">
        <div className="w-full max-w-lg border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-white">
          {/* Top Label */}
          <div className="bg-slate-950 text-amber-300 font-black text-xs text-center py-2 tracking-wider uppercase border-b-2 border-slate-800">
            Mahopac 10U Play Calling Insert
          </div>

          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: rowCount }).map((_, rIdx) => {
                const playText = col.plays?.[rIdx]?.text || '';

                return (
                  <tr
                    key={rIdx}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-indigo-50/50 transition-colors"
                  >
                    {/* Row Index */}
                    <td className="w-12 text-center py-2.5 px-2 border-r border-slate-300 bg-slate-100 font-black text-xs text-slate-900 select-none">
                      {rIdx + 1}
                    </td>

                    {/* Play Name Cell */}
                    <td className="p-0">
                      <input
                        type="text"
                        value={playText}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => onUpdatePlay(0, rIdx, e.target.value)}
                        placeholder={`Play #${rIdx + 1} (e.g. 24 Trap / Sweep Right)`}
                        className="w-full h-full px-3.5 py-2.5 text-xs md:text-sm font-bold uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:outline-none focus:bg-indigo-50/70 disabled:bg-transparent"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
