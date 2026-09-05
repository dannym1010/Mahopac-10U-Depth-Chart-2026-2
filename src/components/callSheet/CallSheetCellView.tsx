import React, { useState, useRef, useEffect } from 'react';
import { Star, Trash2, Edit2, Check, X } from 'lucide-react';
import { CallSheetPlay } from '../../types/callSheet';
import { WristbandSlotMatch, isDarkColor } from '../../utils/wristbandLinking';

interface CallSheetCellViewProps {
  sectionId: string;
  slotIndex: number;
  play: CallSheetPlay | null;
  isRedZone?: boolean;
  highlightClass?: string;
  wristbandSlotMatch?: WristbandSlotMatch;
  onSlotClick: () => void;
  onClearSlot?: () => void;
  onDropPlay?: (droppedPlay: CallSheetPlay) => void;
  onDirectUpdatePlay?: (updatedPlay: CallSheetPlay) => void;
}

export const CallSheetCellView: React.FC<CallSheetCellViewProps> = ({
  sectionId,
  slotIndex,
  play,
  isRedZone = false,
  highlightClass,
  onSlotClick,
  onClearSlot,
  onDropPlay,
  onDirectUpdatePlay,
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineName, setInlineName] = useState(play?.name || '');
  const [inlineWristband, setInlineWristband] = useState(play?.wristbandNum ? String(play.wristbandNum) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (play) {
      setInlineName(play.name);
      setInlineWristband(play.wristbandNum ? String(play.wristbandNum) : '');
    } else {
      setInlineName('');
      setInlineWristband('');
    }
  }, [play]);

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInlineEditing]);

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

  const handleSaveInline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inlineName.trim();
    if (!trimmed) {
      setIsInlineEditing(false);
      return;
    }
    const wbNum = inlineWristband.trim() ? parseInt(inlineWristband.trim(), 10) : undefined;
    const updated: CallSheetPlay = {
      id: play?.id || `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      formation: play?.formation || '',
      type: play?.type,
      wristbandNum: !isNaN(wbNum as number) ? wbNum : play?.wristbandNum,
      personnel: play?.personnel,
      notes: play?.notes,
    };
    if (onDirectUpdatePlay) {
      onDirectUpdatePlay(updated);
    } else if (onDropPlay) {
      onDropPlay(updated);
    }
    setIsInlineEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveInline();
    } else if (e.key === 'Escape') {
      setInlineName(play?.name || '');
      setIsInlineEditing(false);
    }
  };

  // Base background class
  const baseBgClass = highlightClass
    ? highlightClass
    : isRedZone
    ? 'bg-rose-50/80 hover:bg-rose-100/90 text-slate-900 border-rose-300/80 dark:bg-rose-950/20 dark:text-rose-100 dark:border-rose-800/40 dark:hover:bg-rose-950/40'
    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-850';

  if (isInlineEditing) {
    return (
      <div
        className={`h-7 sm:h-7.5 px-2 border-b flex items-center gap-1 text-xs ${baseBgClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] text-slate-400 font-mono shrink-0 w-4 text-right">
          {slotIndex + 1}.
        </span>
        <input
          type="text"
          placeholder="#WB"
          value={inlineWristband}
          onChange={(e) => setInlineWristband(e.target.value)}
          className="w-10 px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-400 rounded text-slate-900 dark:text-white"
          title="Wristband #"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Play Name"
          value={inlineName}
          onChange={(e) => setInlineName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-1.5 py-0.5 text-[11px] font-bold uppercase bg-white dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleSaveInline}
          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded cursor-pointer"
          title="Save"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => setIsInlineEditing(false)}
          className="p-1 text-slate-400 hover:bg-slate-500/20 rounded cursor-pointer"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (!play) {
    return (
      <div
        onClick={onSlotClick}
        onDoubleClick={() => setIsInlineEditing(true)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`h-7 sm:h-7.5 px-2 border-b flex items-center justify-between text-xs transition-colors cursor-pointer group ${baseBgClass}`}
        title="Click to select play from library, double-click to type play, or drag from Play Bank"
      >
        <span className="text-[11px] text-slate-300 dark:text-slate-600 font-mono select-none">
          {slotIndex + 1}.
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInlineEditing(true);
            }}
            className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold px-1 py-0.5 rounded"
            title="Type play directly"
          >
            Type
          </button>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">
            + Pick Play
          </span>
        </div>
      </div>
    );
  }

  const isStarred = !!play.isStarred;

  // Exact wristband number and highlight colors from either play metadata or play.wristbandSlotMatch
  const match = play.wristbandSlotMatch;
  const displayNum =
    play.wristbandLabel ||
    (play.wristbandNum ? String(play.wristbandNum) : '') ||
    (match ? String(match.slotNumber) : '');

  const hasWristbandSpot = Boolean(match || play.wristbandNumberColor || play.wristbandColor);

  const numberBgColor = hasWristbandSpot
    ? (play.wristbandNumberColor || match?.numberBgColor || play.wristbandColor)
    : undefined;

  const numberTextColor = numberBgColor
    ? (isDarkColor(numberBgColor) ? '#ffffff' : '#000000')
    : undefined;

  const rowHighlightColor =
    (play.wristbandHighlightTarget === 'full_row' && play.wristbandRowColor) ||
    (match?.highlightTarget === 'full_row' && match?.rowHighlightColor) ||
    play.wristbandRowColor ||
    (play.isHighlighted && play.highlightColor ? play.highlightColor : undefined);

  const effectiveBgStyle = rowHighlightColor ? { backgroundColor: rowHighlightColor } : undefined;

  const hasRealName = Boolean(
    play.name &&
      play.name.trim().length > 0 &&
      play.name.trim().toLowerCase() !== '(open slot)' &&
      play.name.trim().toLowerCase() !== 'open slot'
  );

  const isLongName = Boolean(hasRealName && play.name && play.name.length > 18);

  const displayFormation = useMemo(() => {
    if (!play.formation) return undefined;
    if (
      play.name &&
      (play.name.startsWith('21') || play.name.includes('21 R') || play.name.includes('21 L')) &&
      play.formation.toLowerCase().includes('spread')
    ) {
      if (/TWINS/i.test(play.name)) return '21 Twins';
      if (/21\s*R/i.test(play.name)) return '21 R';
      if (/21\s*L/i.test(play.name)) return '21 L';
      return '21 I-Form';
    }
    return play.formation;
  }, [play.name, play.formation]);

  return (
    <div
      onClick={onSlotClick}
      onDoubleClick={() => setIsInlineEditing(true)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={effectiveBgStyle}
      className={`min-h-[28px] sm:min-h-[30px] py-1 px-1.5 sm:px-2 border-b flex items-center justify-between gap-1 text-xs select-none transition-all cursor-pointer group print:py-0.5 print:min-h-0 ${
        rowHighlightColor ? 'text-slate-900 border-slate-300' : baseBgClass
      }`}
      title="Click to pick from library, double-click to edit directly"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 print:overflow-visible">
        {/* Slot Number */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 w-3.5 text-right print:text-[9px]">
          {slotIndex + 1}.
        </span>

        {/* Exact Wristband Number Badge matching Wristband Insert & Highlight */}
        {displayNum && (
          <span
            data-wristband-badge="true"
            className={`wristband-number-badge px-1.5 py-0.5 rounded font-black text-[9.5px] font-mono shrink-0 shadow-xs flex items-center gap-0.5 leading-tight select-none print:text-[9px] print:px-1 ${
              !hasRealName ? 'print:hidden' : ''
            } ${
              hasWristbandSpot
                ? 'border border-black/20'
                : 'bg-slate-200 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
            }`}
            style={
              hasWristbandSpot && numberBgColor
                ? {
                    backgroundColor: numberBgColor,
                    color: numberTextColor,
                  }
                : undefined
            }
            title={
              hasWristbandSpot
                ? (play.wristbandTitle || match?.wristbandTitle
                  ? `${play.wristbandTitle || match?.wristbandTitle} #${displayNum}`
                  : `Wristband #${displayNum}`)
                : `No spot on wristband (#${displayNum})`
            }
          >
            #{displayNum}
          </span>
        )}

        {/* Play Name - Full play visible without truncation */}
        <span
          className={`font-black uppercase tracking-tight break-words min-w-0 flex-1 print:overflow-visible print:break-words ${
            isLongName
              ? 'text-[10px] sm:text-[10.5px] leading-tight print:text-[9.5px]'
              : 'text-[11px] sm:text-[11.5px] leading-tight print:text-[10.5px]'
          } ${
            !hasRealName
              ? 'text-slate-400 dark:text-slate-500 italic font-normal print:hidden'
              : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 print:text-black'
          }`}
        >
          {hasRealName ? (
            play.name
          ) : (
            <span className="print:hidden">(Open Slot)</span>
          )}
        </span>

        {/* Formation or Type tag */}
        {displayFormation && (
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono shrink-0 hidden sm:inline-block print:text-[8px] print:inline-block">
            ({displayFormation})
          </span>
        )}

        {/* Personnel badge */}
        {play.personnel && (
          <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono shrink-0 hidden md:inline-block print:text-[8px]">
            {play.personnel}
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1 shrink-0 print:hidden">
        {isStarred && (
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
        )}

        {/* Quick edit inline button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsInlineEditing(true);
          }}
          className="w-4 h-4 rounded hover:bg-slate-500/20 text-slate-400 hover:text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Type/edit directly"
        >
          <Edit2 className="w-2.5 h-2.5" />
        </button>

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
