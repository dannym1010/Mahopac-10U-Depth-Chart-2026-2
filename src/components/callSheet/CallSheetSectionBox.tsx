import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Palette,
  Trash2,
  Columns,
  Sparkles,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CallSheetSection, CallSheetPlay } from '../../types/callSheet';
import { CallSheetCellView } from './CallSheetCellView';

interface CallSheetSectionBoxProps {
  section: CallSheetSection;
  isRedZoneParent?: boolean;
  onSlotClick: (slotIndex: number) => void;
  onClearSlot: (slotIndex: number) => void;
  onDropPlay: (slotIndex: number, play: CallSheetPlay) => void;
  onUpdateSection?: (updated: CallSheetSection) => void;
  onDeleteSection?: (sectionId: string) => void;
  // Drag & Reorder props for the table itself:
  isDraggable?: boolean;
  onDragStartTable?: (e: React.DragEvent, sectionId: string) => void;
  onDragEndTable?: (e: React.DragEvent) => void;
  onDragOverTable?: (e: React.DragEvent, sectionId: string) => void;
  onDropOnTable?: (e: React.DragEvent, targetSectionId: string) => void;
  onMoveTableLeft?: (sectionId: string) => void;
  onMoveTableRight?: (sectionId: string) => void;
  onMoveTableUpRow?: (sectionId: string) => void;
  onMoveTableDownRow?: (sectionId: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  canMoveUpRow?: boolean;
  canMoveDownRow?: boolean;
  isDragTarget?: boolean;
  isDragging?: boolean;
  rowIndex?: number;
}

const COLOR_SWATCHES = [
  '#dc2626', // Red
  '#16a34a', // Green
  '#ea580c', // Orange
  '#2563eb', // Blue
  '#eab308', // Yellow
  '#78350f', // Olive/Brown
  '#65a30d', // Light Olive
  '#09090b', // Black
  '#0284c7', // Cyan
  '#84cc16', // Lime
  '#7e22ce', // Purple
  '#0f766e', // Teal
  '#64748b', // Slate
  '#60a5fa', // Light Blue
  '#881337', // Maroon
];

const HIGHLIGHT_COLORS: { id: string; label: string; bgClass: string; cellClass: string }[] = [
  {
    id: 'rose',
    label: 'Red / Rose',
    bgClass: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-400 dark:border-rose-800/80',
    cellClass: 'bg-rose-50/80 hover:bg-rose-100/90 text-slate-900 border-rose-300 dark:bg-rose-950/20 dark:text-rose-100 dark:border-rose-800/50',
  },
  {
    id: 'yellow',
    label: 'Gold / Alert',
    bgClass: 'bg-yellow-50/80 dark:bg-yellow-950/25 border-yellow-400 dark:border-yellow-700/80',
    cellClass: 'bg-yellow-50/80 hover:bg-yellow-100/90 text-slate-900 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-100 dark:border-yellow-800/50',
  },
  {
    id: 'emerald',
    label: 'Green / Go',
    bgClass: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800/80',
    cellClass: 'bg-emerald-50/80 hover:bg-emerald-100/90 text-slate-900 border-emerald-300 dark:bg-emerald-950/25 dark:text-emerald-100 dark:border-emerald-800/50',
  },
  {
    id: 'cyan',
    label: 'Cyan / Deep',
    bgClass: 'bg-cyan-50/70 dark:bg-cyan-950/20 border-cyan-400 dark:border-cyan-800/80',
    cellClass: 'bg-cyan-50/80 hover:bg-cyan-100/90 text-slate-900 border-cyan-300 dark:bg-cyan-950/25 dark:text-cyan-100 dark:border-cyan-800/50',
  },
  {
    id: 'purple',
    label: 'Purple / Special',
    bgClass: 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-400 dark:border-purple-800/80',
    cellClass: 'bg-purple-50/80 hover:bg-purple-100/90 text-slate-900 border-purple-300 dark:bg-purple-950/25 dark:text-purple-100 dark:border-purple-800/50',
  },
];

export const CallSheetSectionBox: React.FC<CallSheetSectionBoxProps> = ({
  section,
  isRedZoneParent = false,
  onSlotClick,
  onClearSlot,
  onDropPlay,
  onUpdateSection,
  onDeleteSection,
  isDraggable = false,
  onDragStartTable,
  onDragEndTable,
  onDragOverTable,
  onDropOnTable,
  onMoveTableLeft,
  onMoveTableRight,
  onMoveTableUpRow,
  onMoveTableDownRow,
  canMoveLeft = false,
  canMoveRight = false,
  canMoveUpRow = false,
  canMoveDownRow = false,
  isDragTarget = false,
  isDragging = false,
  rowIndex,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const columnsCount = section.columnsCount || 1;
  const isHighlighted = section.highlightEnabled ?? isRedZoneParent;
  const highlightColorKey = section.highlightColor || (isRedZoneParent ? 'rose' : 'yellow');
  const highlightConfig = HIGHLIGHT_COLORS.find((h) => h.id === highlightColorKey) || HIGHLIGHT_COLORS[0];

  const filledCount = section.plays.filter(Boolean).length;

  const handleSaveHeader = () => {
    if (onUpdateSection && editTitle.trim()) {
      onUpdateSection({
        ...section,
        title: editTitle.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleSelectColor = (color: string) => {
    if (onUpdateSection) {
      const isLight = ['#eab308', '#84cc16', '#60a5fa', '#facc15'].includes(color);
      onUpdateSection({
        ...section,
        headerBgColor: color,
        headerTextColor: isLight ? '#000000' : '#ffffff',
      });
    }
  };

  const handleDirectUpdatePlay = (slotIndex: number, play: CallSheetPlay) => {
    if (onUpdateSection) {
      const nextPlays = [...section.plays];
      nextPlays[slotIndex] = play;
      onUpdateSection({
        ...section,
        plays: nextPlays,
      });
    }
  };

  const handleAddSlot = () => {
    if (onUpdateSection) {
      onUpdateSection({
        ...section,
        slotsCount: section.slotsCount + 1,
        plays: [...section.plays, null],
      });
    }
  };

  const handleRemoveSlot = () => {
    if (onUpdateSection && section.slotsCount > 1) {
      onUpdateSection({
        ...section,
        slotsCount: section.slotsCount - 1,
        plays: section.plays.slice(0, section.slotsCount - 1),
      });
    }
  };

  const handleSetColumns = (newCols: number) => {
    if (onUpdateSection) {
      onUpdateSection({
        ...section,
        columnsCount: newCols,
      });
    }
  };

  const handleToggleHighlight = () => {
    if (onUpdateSection) {
      onUpdateSection({
        ...section,
        highlightEnabled: !isHighlighted,
      });
    }
  };

  const handleSelectHighlightColor = (colorId: string) => {
    if (onUpdateSection) {
      onUpdateSection({
        ...section,
        highlightEnabled: true,
        highlightColor: colorId,
      });
    }
  };

  const handleDelete = () => {
    if (onDeleteSection) {
      const confirmed = window.confirm(`Delete the "${section.title}" table from the call sheet?`);
      if (confirmed) {
        onDeleteSection(section.id);
      }
    }
  };

  // Determine container styling based on highlight status
  const containerClasses = isHighlighted
    ? highlightConfig.bgClass
    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700/80';

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/callsheet-table-drag')) {
          e.preventDefault();
          e.stopPropagation();
          onDragOverTable?.(e, section.id);
        }
      }}
      onDrop={(e) => {
        const tableId = e.dataTransfer.getData('application/callsheet-table-drag');
        if (tableId) {
          e.preventDefault();
          e.stopPropagation();
          onDropOnTable?.(e, section.id);
        }
      }}
      className={`border shadow-xs rounded-none overflow-hidden print:border-black flex flex-col transition-all group ${containerClasses} ${
        isDragging ? 'opacity-35 ring-2 ring-indigo-500 scale-[0.98]' : ''
      } ${
        isDragTarget ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.01] border-indigo-500' : ''
      }`}
    >
      {/* 1. Header Bar */}
      <div
        draggable={isDraggable && !isEditing}
        onDragStart={(e) => {
          if (isEditing) return;
          onDragStartTable?.(e, section.id);
        }}
        onDragEnd={onDragEndTable}
        className={`py-1 px-2 flex items-center justify-between font-black text-xs uppercase tracking-wider select-none relative transition-colors ${
          isDraggable && !isEditing ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          backgroundColor: section.headerBgColor,
          color: section.headerTextColor,
        }}
      >
        {!isEditing ? (
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isDraggable && (
                <div
                  title="Drag table to rearrange or move across rows"
                  className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-inherit opacity-70 hover:opacity-100 hover:bg-black/20 rounded transition-opacity print:hidden shrink-0 flex items-center"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              )}
              <span
                className="truncate cursor-pointer hover:underline text-[11.5px] sm:text-xs"
                onClick={() => setIsEditing(true)}
                title="Click to edit table settings (title, rows, columns, highlight, colors)"
              >
                {section.title}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <span className="text-[10px] opacity-90 font-mono font-bold">
                ({filledCount}/{section.slotsCount})
              </span>
              {/* Quick Move Buttons on hover */}
              <div className="hidden group-hover:flex items-center gap-0.5 print:hidden">
                {canMoveLeft && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTableLeft?.(section.id);
                    }}
                    className="p-0.5 rounded hover:bg-black/25 text-inherit transition-colors cursor-pointer"
                    title="Move table left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                )}
                {canMoveRight && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTableRight?.(section.id);
                    }}
                    className="p-0.5 rounded hover:bg-black/25 text-inherit transition-colors cursor-pointer"
                    title="Move table right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {canMoveUpRow && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTableUpRow?.(section.id);
                    }}
                    className="p-0.5 rounded hover:bg-black/25 text-inherit transition-colors cursor-pointer"
                    title="Move table to row above"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                )}
                {canMoveDownRow && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTableDownRow?.(section.id);
                    }}
                    className="p-0.5 rounded hover:bg-black/25 text-inherit transition-colors cursor-pointer"
                    title="Move table to row below"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Quick edit button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 hover:scale-110 p-0.5 rounded text-inherit transition-opacity print:hidden cursor-pointer"
                title="Table options & layout"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveHeader()}
              className="px-1.5 py-0.5 bg-black/40 text-white rounded text-xs font-bold border border-white/40 focus:outline-none w-full"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveHeader}
              className="px-1.5 py-0.5 rounded bg-white text-black text-[10px] font-black cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* 2. Interactive Editing Drawer (Rows, Columns, Highlight, Color, Delete, Row Position) */}
      {isEditing && (
        <div className="p-2 bg-slate-850 dark:bg-slate-950 border-b border-slate-700 text-slate-200 text-xs space-y-2 print:hidden animate-in fade-in duration-150">
          {/* Top Row: Rows, Columns, Highlight, and Delete */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Rows (+/-) */}
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Rows:</span>
              <span className="font-mono font-black text-amber-300 text-xs px-1">
                {section.slotsCount}
              </span>
              <button
                type="button"
                onClick={handleAddSlot}
                className="p-0.5 hover:bg-slate-700 text-emerald-400 rounded cursor-pointer"
                title="Add row"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveSlot}
                className="p-0.5 hover:bg-slate-700 text-rose-400 rounded cursor-pointer"
                title="Remove bottom row"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Columns (1, 2, 3, 4) */}
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5">
                <Columns className="w-3 h-3" />
                Cols:
              </span>
              {[1, 2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => handleSetColumns(cols)}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-black cursor-pointer ${
                    columnsCount === cols
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>

            {/* Highlight Toggle */}
            <button
              type="button"
              onClick={handleToggleHighlight}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle table highlight ON or OFF"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Highlight {isHighlighted ? 'ON' : 'OFF'}</span>
            </button>

            {/* Delete Section Button */}
            {onDeleteSection && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-600 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                title="Delete this section table"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Row Placement quick controls */}
          {(canMoveLeft || canMoveRight || canMoveUpRow || canMoveDownRow || rowIndex !== undefined) && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <GripVertical className="w-3 h-3" />
                Row {rowIndex !== undefined ? rowIndex + 1 : 1} Position:
              </span>
              <div className="flex items-center gap-1">
                {canMoveLeft && (
                  <button
                    type="button"
                    onClick={() => onMoveTableLeft?.(section.id)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Left
                  </button>
                )}
                {canMoveRight && (
                  <button
                    type="button"
                    onClick={() => onMoveTableRight?.(section.id)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Right <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {canMoveUpRow && (
                  <button
                    type="button"
                    onClick={() => onMoveTableUpRow?.(section.id)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" /> Row Above
                  </button>
                )}
                {canMoveDownRow && (
                  <button
                    type="button"
                    onClick={() => onMoveTableDownRow?.(section.id)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" /> Row Below
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Highlight Color Palette (when highlight is on) */}
          {isHighlighted && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400">Tint Color:</span>
              <div className="flex items-center gap-1">
                {HIGHLIGHT_COLORS.map((hc) => (
                  <button
                    key={hc.id}
                    type="button"
                    onClick={() => handleSelectHighlightColor(hc.id)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                      highlightColorKey === hc.id
                        ? 'bg-white text-black border-white'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {hc.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Header Color Swatches */}
          <div className="flex items-center gap-1 pt-1 border-t border-slate-800 overflow-x-auto pb-0.5">
            <Palette className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Header:</span>
            {COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleSelectColor(color)}
                className={`w-4 h-4 rounded-full shrink-0 border cursor-pointer hover:scale-110 transition-transform ${
                  section.headerBgColor === color
                    ? 'ring-2 ring-white border-black'
                    : 'border-white/30'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Cell Slots Table with Dynamic Multi-Column Support */}
      <div
        className={`flex-1 divide-y divide-slate-300 dark:divide-slate-800 ${
          columnsCount > 1
            ? `grid grid-cols-${columnsCount} divide-y-0 divide-x divide-slate-300 dark:divide-slate-800`
            : 'flex flex-col'
        }`}
        style={
          columnsCount > 1
            ? {
                display: 'grid',
                gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
        {Array.from({ length: section.slotsCount }).map((_, slotIdx) => {
          const play = section.plays[slotIdx] || null;
          return (
            <CallSheetCellView
              key={`${section.id}-${slotIdx}`}
              sectionId={section.id}
              slotIndex={slotIdx}
              play={play}
              isRedZone={isRedZoneParent}
              highlightClass={isHighlighted ? highlightConfig.cellClass : undefined}
              onSlotClick={() => onSlotClick(slotIdx)}
              onClearSlot={() => onClearSlot(slotIdx)}
              onDropPlay={(p) => onDropPlay(slotIdx, p)}
              onDirectUpdatePlay={(p) => handleDirectUpdatePlay(slotIdx, p)}
            />
          );
        })}
      </div>
    </div>
  );
};
