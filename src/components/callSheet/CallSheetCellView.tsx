import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Star, Trash2, Edit2, Check, X, Copy, ClipboardPaste } from 'lucide-react';
import { CallSheetPlay } from '../../types/callSheet';
import { WristbandSlotMatch, isDarkColor } from '../../utils/wristbandLinking';
import { getCopiedPlay, setCopiedPlay, subscribeCopiedPlay } from '../../utils/callSheetClipboard';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [clipboardPlay, setClipboardPlay] = useState<CallSheetPlay | null>(() => getCopiedPlay());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeCopiedPlay((latest) => {
      setClipboardPlay(latest);
    });
  }, []);

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

  const handleCopyPlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!play || !play.name) return;
    setCopiedPlay({ ...play });
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1600);
  };

  const handlePastePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!clipboardPlay) return;
    const pasted: CallSheetPlay = {
      ...clipboardPlay,
      id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    if (onDirectUpdatePlay) {
      onDirectUpdatePlay(pasted);
    } else if (onDropPlay) {
      onDropPlay(pasted);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('callSheetPlayTransfer');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed && (parsed.name || parsed.text) && onDropPlay) {
          onDropPlay({
            ...parsed,
            id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: parsed.name || parsed.text,
          });
          return;
        }
      }
      const textStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
      if (textStr && onDropPlay) {
        try {
          const parsed = JSON.parse(textStr);
          if (parsed && (parsed.name || parsed.text)) {
            onDropPlay({
              ...parsed,
              id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: parsed.name || parsed.text,
            });
            return;
          }
        } catch {}
        onDropPlay({
          id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: textStr.trim().toUpperCase(),
        });
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
    if (isInlineEditing) {
      if (e.key === 'Enter') {
        handleSaveInline();
      } else if (e.key === 'Escape') {
        setInlineName(play?.name || '');
        setIsInlineEditing(false);
      }
      return;
    }

    // Copy shortcut (Ctrl+C / Cmd+C)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && play?.name) {
      e.preventDefault();
      handleCopyPlay();
    }
    // Paste shortcut (Ctrl+V / Cmd+V)
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && clipboardPlay) {
      e.preventDefault();
      handlePastePlay();
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
        className={`h-7 sm:h-7.5 px-2 border-b flex items-center gap-1.5 text-xs ${baseBgClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="WB"
          value={inlineWristband}
          onChange={(e) => setInlineWristband(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-10 px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-400 rounded text-slate-900 dark:text-white text-center"
          title="Wristband Number"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Play Name"
          value={inlineName}
          onChange={(e) => setInlineName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 px-1.5 py-0.5 text-[11px] font-bold uppercase bg-white dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white"
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
          onClick={() => {
            setInlineName(play?.name || '');
            setIsInlineEditing(false);
          }}
          className="p-1 text-slate-400 hover:bg-slate-500/20 rounded cursor-pointer"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // If slot is empty
  if (!play || !play.name || !play.name.trim()) {
    return (
      <div
        tabIndex={0}
        onClick={onSlotClick}
        onDoubleClick={() => setIsInlineEditing(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`h-7 sm:h-7.5 px-2 border-b flex items-center justify-between text-xs transition-all cursor-pointer group outline-none ${baseBgClass} ${
          isDragOver ? 'ring-2 ring-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50' : ''
        }`}
        title="Click to select play, or paste copied play (Ctrl+V)"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {clipboardPlay ? (
            <button
              type="button"
              onClick={(e) => handlePastePlay(e)}
              className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              title={`Paste copied play: ${clipboardPlay.name}`}
            >
              <ClipboardPaste className="w-3 h-3 text-indigo-500" />
              <span>Paste {clipboardPlay.name}</span>
            </button>
          ) : (
            <span className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 font-bold">
              + Pick Play
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInlineEditing(true);
            }}
            className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold px-1 py-0.5 rounded cursor-pointer"
            title="Type play directly"
          >
            Type
          </button>
          {clipboardPlay && (
            <button
              type="button"
              onClick={(e) => handlePastePlay(e)}
              className="p-1 rounded text-indigo-500 hover:bg-indigo-500/20 transition-colors cursor-pointer"
              title={`Paste ${clipboardPlay.name}`}
            >
              <ClipboardPaste className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Linked wristband metadata
  const hasRealName = Boolean(play.name && play.name.trim());
  const match = play.wristbandSlotMatch;
  const hasWristbandSpot = Boolean(match || play.wristbandNum);
  const rawNum = match?.slotNumber ? String(match.slotNumber) : (play.wristbandNum ? String(play.wristbandNum) : '');
  const cleanDisplayNum = rawNum.replace(/^#\s*/, '').trim();

  // Exact number badge color matching wristband
  const numberBgColor =
    play.wristbandNumberColor ||
    match?.numberBgColor ||
    (play.wristbandColor && play.wristbandColor.startsWith('#') ? play.wristbandColor : undefined);

  const numberTextColor =
    play.wristbandTextColor ||
    match?.numberTextColor ||
    (numberBgColor ? (isDarkColor(numberBgColor) ? '#ffffff' : '#000000') : '#000000');

  // Row highlight color
  const rowHighlightColor =
    play.wristbandRowColor ||
    (play.isHighlighted && play.highlightColor ? play.highlightColor : undefined) ||
    match?.rowHighlightColor;

  const isStarred = Boolean(play.isStarred);
  const isLongName = play.name.length > 20;

  // Clean play name to strip any leading hash symbol or index prefix
  const cleanPlayName = useMemo(() => {
    if (!play.name) return '';
    return play.name
      .replace(/^#\s*\d*\s*[-.:]?\s*/i, '')
      .replace(/^\d+[\.\)]\s+/, '')
      .replace(/^#\s*/, '')
      .trim();
  }, [play.name]);

  const effectiveBgStyle: React.CSSProperties | undefined = rowHighlightColor
    ? {
        backgroundColor: rowHighlightColor,
        borderLeft: `3.5px solid ${numberBgColor || '#4f46e5'}`,
      }
    : undefined;

  const displayFormation = useMemo(() => {
    const rawForm = (play.formation || '').trim();
    const nameToCheck = (play.name || '').toUpperCase();
    // Strictly enforce 21 L or 21 R for any 21 play (never Spread)
    if (
      /\b21\b/.test(nameToCheck) ||
      nameToCheck.startsWith('21') ||
      nameToCheck.includes('21 R') ||
      nameToCheck.includes('21 L') ||
      rawForm.includes('21')
    ) {
      if (
        /\b21\s*L\b/i.test(nameToCheck) ||
        nameToCheck.includes('21 L') ||
        nameToCheck.includes('21L') ||
        /\b21\s*L\b/i.test(rawForm) ||
        rawForm.includes('21 L') ||
        /\bLEFT\b/i.test(nameToCheck)
      ) {
        return '21 L';
      }
      return '21 R';
    }
    return rawForm;
  }, [play.formation, play.name]);

  return (
    <div
      tabIndex={0}
      draggable={Boolean(hasRealName && !isInlineEditing)}
      onDragStart={(e) => {
        if (!play || !hasRealName) return;
        const playData: CallSheetPlay = {
          ...play,
          id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
        let jsonStr = '';
        try {
          jsonStr = JSON.stringify(playData);
          e.dataTransfer.setData('application/json', jsonStr);
          e.dataTransfer.setData('callSheetPlayTransfer', jsonStr);
          e.dataTransfer.setData('text/plain', play.name);
        } catch {}
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={onSlotClick}
      onDoubleClick={() => setIsInlineEditing(true)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      style={effectiveBgStyle}
      className={`min-h-[28px] sm:min-h-[30px] py-1 px-1.5 sm:px-2 border-b flex items-center justify-between gap-1 text-xs select-none transition-all cursor-pointer group print:py-0.5 print:min-h-0 outline-none ${
        rowHighlightColor ? 'text-slate-900 border-slate-300' : baseBgClass
      } ${isDragOver ? 'ring-2 ring-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50' : ''}`}
      title="Click to change play, drag to copy to another cell, or press Ctrl+C / Ctrl+V"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 print:overflow-visible">
        {/* Exact Wristband Number Badge - cleanly displays slot number without hash sign */}
        {cleanDisplayNum && (
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
                  ? `${play.wristbandTitle || match?.wristbandTitle} Slot ${cleanDisplayNum}`
                  : `Wristband Slot ${cleanDisplayNum}`)
                : `No spot on wristband (${cleanDisplayNum})`
            }
          >
            {cleanDisplayNum}
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
            cleanPlayName
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

        {/* Copied feedback badge */}
        {copyFeedback && (
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1 py-0.2 rounded animate-pulse">
            Copied!
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1 shrink-0 print:hidden">
        {isStarred && (
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
        )}

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopyPlay}
          className="w-4 h-4 rounded hover:bg-slate-500/20 text-slate-400 hover:text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Copy play (Ctrl+C)"
        >
          <Copy className="w-2.5 h-2.5" />
        </button>

        {/* Paste button if clipboard has play */}
        {clipboardPlay && (
          <button
            type="button"
            onClick={handlePastePlay}
            className="w-4 h-4 rounded hover:bg-slate-500/20 text-slate-400 hover:text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title={`Paste ${clipboardPlay.name} (Ctrl+V)`}
          >
            <ClipboardPaste className="w-2.5 h-2.5" />
          </button>
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
