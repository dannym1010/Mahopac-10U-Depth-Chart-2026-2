import React, { useState } from 'react';
import { RotateCcw, Sparkles, Settings, Plus, Minus } from 'lucide-react';
import { TimeoutsState } from '../../types/callSheet';

interface TimeoutsTrackerBoxProps {
  timeouts: TimeoutsState;
  highlightEnabled?: boolean;
  timeoutsCount?: number; // default 3
  onChangeTimeouts: (timeouts: TimeoutsState) => void;
  onToggleHighlight?: () => void;
  onChangeTimeoutsCount?: (count: number) => void;
}

export const TimeoutsTrackerBox: React.FC<TimeoutsTrackerBoxProps> = ({
  timeouts,
  highlightEnabled = false,
  timeoutsCount = 3,
  onChangeTimeouts,
  onToggleHighlight,
  onChangeTimeoutsCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Normalize timeouts to ensure length matches timeoutsCount
  const firstHalfUs = timeouts.firstHalfUs || [true, true, true];
  const firstHalfOpp = timeouts.firstHalfOpp || [true, true, true];
  const secondHalfUs = timeouts.secondHalfUs || [true, true, true];
  const secondHalfOpp = timeouts.secondHalfOpp || [true, true, true];

  const toggleTimeout = (
    half: 'first' | 'second',
    side: 'us' | 'opp',
    index: number
  ) => {
    const next = { ...timeouts };
    if (half === 'first') {
      if (side === 'us') {
        const arr = [...firstHalfUs];
        arr[index] = !arr[index];
        next.firstHalfUs = arr;
      } else {
        const arr = [...firstHalfOpp];
        arr[index] = !arr[index];
        next.firstHalfOpp = arr;
      }
    } else {
      if (side === 'us') {
        const arr = [...secondHalfUs];
        arr[index] = !arr[index];
        next.secondHalfUs = arr;
      } else {
        const arr = [...secondHalfOpp];
        arr[index] = !arr[index];
        next.secondHalfOpp = arr;
      }
    }
    onChangeTimeouts(next);
  };

  const handleReset = () => {
    const fresh = Array(timeoutsCount).fill(true);
    onChangeTimeouts({
      firstHalfUs: [...fresh],
      firstHalfOpp: [...fresh],
      secondHalfUs: [...fresh],
      secondHalfOpp: [...fresh],
    });
  };

  const containerClasses = highlightEnabled
    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700/80'
    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700';

  return (
    <div
      className={`border shadow-xs rounded-none overflow-hidden print:border-black flex flex-col transition-all ${containerClasses}`}
    >
      {/* Header bar */}
      <div className="py-1 px-2.5 bg-slate-200/90 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between text-center">
        <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex-1 text-center">
          TIMEOUTS LEFT
        </span>

        <div className="flex items-center gap-1 print:hidden">
          {/* Edit toggle */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            title="Edit timeout rows / highlight"
          >
            <Settings className="w-3 h-3" />
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            title="Reset all timeouts"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editing Drawer */}
      {isEditing && (
        <div className="p-2 bg-slate-850 dark:bg-slate-950 border-b border-slate-700 text-slate-200 text-xs flex items-center justify-between gap-2 flex-wrap print:hidden animate-in fade-in duration-150">
          {/* Rows / Count (2, 3, 4) */}
          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Count:</span>
            {[2, 3, 4].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onChangeTimeoutsCount && onChangeTimeoutsCount(cnt)}
                className={`px-1.5 py-0.2 rounded text-[10px] font-black cursor-pointer ${
                  timeoutsCount === cnt
                    ? 'bg-amber-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>

          {/* Highlight Toggle */}
          {onToggleHighlight && (
            <button
              type="button"
              onClick={onToggleHighlight}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                highlightEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle Timeouts Highlight ON or OFF"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Highlight {highlightEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <table className="w-full text-center border-collapse text-xs font-sans">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 font-bold text-slate-800 dark:text-slate-200">
            <th className="py-1 px-2 border-r border-slate-300 dark:border-slate-700 w-1/2">
              US
            </th>
            <th className="py-1 px-2 w-1/2">
              Opponents
            </th>
          </tr>
        </thead>
        <tbody>
          {/* First Half Timeouts */}
          {Array.from({ length: timeoutsCount }).map((_, idx) => {
            const usAvail = firstHalfUs[idx] ?? true;
            const oppAvail = firstHalfOpp[idx] ?? true;
            const num = idx + 1;

            return (
              <tr key={`1h-${num}`} className="border-b border-slate-300 dark:border-slate-800">
                <td
                  onClick={() => toggleTimeout('first', 'us', idx)}
                  className={`py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 font-black cursor-pointer transition-colors select-none ${
                    usAvail
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'bg-red-100/90 dark:bg-red-950/50 text-red-600 dark:text-red-400 line-through'
                  }`}
                  title={usAvail ? 'Click to mark timeout used' : 'Click to restore'}
                >
                  {num}
                </td>
                <td
                  onClick={() => toggleTimeout('first', 'opp', idx)}
                  className={`py-1.5 px-2 font-black cursor-pointer transition-colors select-none ${
                    oppAvail
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'bg-red-100/90 dark:bg-red-950/50 text-red-600 dark:text-red-400 line-through'
                  }`}
                  title={oppAvail ? 'Click to mark timeout used' : 'Click to restore'}
                >
                  {num}
                </td>
              </tr>
            );
          })}

          {/* Divider between halves */}
          <tr className="bg-slate-200 dark:bg-slate-800 border-y border-slate-400 dark:border-slate-700">
            <td
              colSpan={2}
              className="py-0.5 px-2 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              2nd Half
            </td>
          </tr>

          {/* Second Half Timeouts */}
          {Array.from({ length: timeoutsCount }).map((_, idx) => {
            const usAvail = secondHalfUs[idx] ?? true;
            const oppAvail = secondHalfOpp[idx] ?? true;
            const num = idx + 1;

            return (
              <tr key={`2h-${num}`} className="border-b border-slate-300 dark:border-slate-800 last:border-b-0">
                <td
                  onClick={() => toggleTimeout('second', 'us', idx)}
                  className={`py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 font-black cursor-pointer transition-colors select-none ${
                    usAvail
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'bg-red-100/90 dark:bg-red-950/50 text-red-600 dark:text-red-400 line-through'
                  }`}
                  title={usAvail ? 'Click to mark timeout used' : 'Click to restore'}
                >
                  {num}
                </td>
                <td
                  onClick={() => toggleTimeout('second', 'opp', idx)}
                  className={`py-1.5 px-2 font-black cursor-pointer transition-colors select-none ${
                    oppAvail
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'bg-red-100/90 dark:bg-red-950/50 text-red-600 dark:text-red-400 line-through'
                  }`}
                  title={oppAvail ? 'Click to mark timeout used' : 'Click to restore'}
                >
                  {num}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
