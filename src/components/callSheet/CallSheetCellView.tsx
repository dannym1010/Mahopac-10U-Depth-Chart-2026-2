import React from 'react';
import { Check, Star, Trash2, GripVertical } from 'lucide-react';
import { CallSheetPlay } from '../../types/callSheet';

interface CallSheetCellViewProps {
  sectionId: string;
  slotIndex: number;
  play: CallSheetPlay | null;
  gameMode?: 'caller' | 'editor';
  isRedZone?: boolean;
  highlightClass?: string;
  onSlotClick: () => void;
  onToggleCalled?: () => void;
  onToggleStar?: () => void;
  onClearSlot?: () => void;
  onDropPlay?: (droppedPlay: CallSheetPlay) => void;
}

export const CallSheetCellView: React.FC<CallSheetCellViewProps> = ({
  sectionId,
  slotIndex,
  play,
  isRedZone = false,
  highlightClass,
  onSlotClick,
  onToggleStar,
  onClearSlot,
  onDropPlay,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed && parsed.name && onDropPlay) {
          onDropPlay(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped play:', err);
    }
  };

  // Base background class
  const baseBgClass = highlightClass
    ? highlightClass
    : isRedZone
    ? 'bg-rose-50/80 hover:bg-rose-100/90 text-slate-900 border-rose-300/80 dark:bg-rose-950/20 dark:text-rose-100 dark:border-rose-800/40 dark:hover:bg-rose-950/40'
    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-850';

  if (!play) {
    return (
      <div
        onClick={onSlotClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`h-7 sm:h-7.5 px-2 border-b flex items-center justify-between text-xs transition-colors cursor-pointer group ${baseBgClass}`}
        title="Click to select play or drag from Play Bank"
      >
        <span className="text-[11px] text-slate-300 dark:text-slate-600 font-mono select-none">
          {slotIndex + 1}.
        </span>
        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
          + Pick Play
        </span>
      </div>
    );
  }

  const isStarred = !!play.isStarred;

  return (
    <div
      onClick={onSlotClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`h-7 sm:h-7.5 px-2 border-b flex items-center justify-between gap-1.5 text-xs select-none transition-all cursor-pointer group ${baseBgClass}`}
      title="Click to edit or change play"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* Slot Number */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 w-3.5 text-right">
          {slotIndex + 1}.
        </span>

        {/* Wristband badge if available */}
        {play.wristbandNum && (
          <span className="px-1 py-0.2 rounded bg-amber-400/90 text-black font-black text-[9px] font-mono shrink-0 leading-tight">
            #{play.wristbandNum}
          </span>
        )}

        {/* Play Name */}
        <span className="font-black text-[11px] sm:text-[11.5px] uppercase tracking-tight truncate text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
          {play.name}
        </span>

        {/* Formation or Type tag */}
        {play.formation && (
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono shrink-0 hidden sm:inline-block">
            ({play.formation})
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1 shrink-0">
        {isStarred && (
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
        )}

        {onClearSlot && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearSlot();
            }}
            className="w-4 h-4 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Clear play from slot"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
