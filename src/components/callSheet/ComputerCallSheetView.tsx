import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  LayoutGrid,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RefreshCw,
} from 'lucide-react';
import {
  CallSheetFullData,
  CallSheetSection,
  CallSheetPlay,
  TimeoutsState,
  TwoPointRule,
} from '../../types/callSheet';
import { CallSheetSectionBox } from './CallSheetSectionBox';
import { ScriptsBox } from './ScriptsBox';
import { TwoPointChartBox } from './TwoPointChartBox';
import { TimeoutsTrackerBox } from './TimeoutsTrackerBox';

interface ComputerCallSheetViewProps {
  unit: 'offense' | 'defense';
  callSheetData: CallSheetFullData;
  highlightRedZone: boolean;
  gridColumns?: number;
  onSlotClick: (sectionId: string, slotIndex: number) => void;
  onClearSlot: (sectionId: string, slotIndex: number) => void;
  onDropPlayToSlot: (sectionId: string, slotIndex: number, play: CallSheetPlay) => void;
  onUpdateSection: (section: CallSheetSection) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddSection: (
    group: 'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom',
    initialTab?: 'wristband' | 'custom',
    targetRowIndex?: number
  ) => void;
  onReorderSections?: (reordered: CallSheetSection[]) => void;
  onChangeTimeouts: (timeouts: TimeoutsState) => void;
  onUpdateTwoPointRules?: (rules: TwoPointRule[]) => void;
  onToggleTwoPointHighlight?: () => void;
  onAddScriptRow?: () => void;
  onRemoveScriptRow?: () => void;
  onToggleScriptColumns?: (cols: number) => void;
  onToggleScriptHighlight?: () => void;
  onToggleTimeoutsHighlight?: () => void;
  onChangeTimeoutsCount?: (cnt: number) => void;
}

export const ComputerCallSheetView: React.FC<ComputerCallSheetViewProps> = ({
  unit,
  callSheetData,
  highlightRedZone,
  gridColumns = 4,
  onSlotClick,
  onClearSlot,
  onDropPlayToSlot,
  onUpdateSection,
  onDeleteSection,
  onAddSection,
  onReorderSections,
  onChangeTimeouts,
  onUpdateTwoPointRules,
  onToggleTwoPointHighlight,
  onAddScriptRow,
  onRemoveScriptRow,
  onToggleScriptColumns,
  onToggleScriptHighlight,
  onToggleTimeoutsHighlight,
  onChangeTimeoutsCount,
}) => {
  const sections =
    unit === 'offense' ? callSheetData.offenseSections : callSheetData.defenseSections;
  const scriptPlays =
    unit === 'offense' ? callSheetData.offenseScript : callSheetData.defenseScript;

  // Filter sections by group for dynamic auto-formatting
  const topSections = sections.filter(
    (s) => s.group === 'top_situations' || (!s.group && !s.id.includes('rz_'))
  );
  const rzSections = sections.filter(
    (s) => s.group === 'red_zone' || (s.id.startsWith('off_rz_') || s.id.startsWith('def_rz_'))
  );
  const tempoSections = sections.filter(
    (s) => s.group === 'tempo_game_mgmt'
  );
  const customSections = sections.filter(
    (s) =>
      s.group === 'custom' ||
      (!topSections.includes(s) && !rzSections.includes(s) && !tempoSections.includes(s))
  );

  // Drag-and-drop state for table rearranging
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    sectionId?: string;
    rowIndex: number;
    position: 'before' | 'after' | 'row-end' | 'new-row';
  } | null>(null);
  const [emptyRowIndices, setEmptyRowIndices] = useState<number[]>([]);

  // Compute normalized situational sections with rowIndex and order
  const normalizedTopSections = useMemo(() => {
    const hasAnyRowIndex = topSections.some((s) => s.rowIndex !== undefined);
    if (hasAnyRowIndex) {
      return topSections;
    }
    // Default partition: 4 tables per row (or gridColumns)
    const perRow = gridColumns || 4;
    return topSections.map((sec, idx) => ({
      ...sec,
      rowIndex: Math.floor(idx / perRow),
      order: idx % perRow,
    }));
  }, [topSections, gridColumns]);

  // Compute distinct rows of situational tables
  const situationalRows = useMemo(() => {
    const rowMap = new Map<number, CallSheetSection[]>();

    normalizedTopSections.forEach((sec) => {
      const r = sec.rowIndex ?? 0;
      if (!rowMap.has(r)) {
        rowMap.set(r, []);
      }
      rowMap.get(r)!.push(sec);
    });

    emptyRowIndices.forEach((r) => {
      if (!rowMap.has(r)) {
        rowMap.set(r, []);
      }
    });

    const sortedRowIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);
    return sortedRowIndices.map((rIdx) => {
      const rowSecs = (rowMap.get(rIdx) || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return {
        rowIndex: rIdx,
        sections: rowSecs,
      };
    });
  }, [normalizedTopSections, emptyRowIndices]);

  // Helper to commit reordered situational sections
  const commitRows = (rows: { rowIndex: number; sections: CallSheetSection[] }[]) => {
    // Filter out rows that have no sections to ensure clean sequential rows
    const activeRows = rows.filter((r) => r.sections.length > 0);
    const newTopSections: CallSheetSection[] = [];
    activeRows.forEach((row, newRowIdx) => {
      row.sections.forEach((sec, orderIdx) => {
        newTopSections.push({
          ...sec,
          rowIndex: newRowIdx,
          order: orderIdx,
        });
      });
    });

    // Clear empty row indices or retain intentional empty rows
    setEmptyRowIndices([]);

    // Recombine with non-top sections
    const nonTopSections = sections.filter((s) => !topSections.some((ts) => ts.id === s.id));
    const allUpdated = [...newTopSections, ...nonTopSections];

    if (onReorderSections) {
      onReorderSections(allUpdated);
    } else {
      newTopSections.forEach((s) => onUpdateSection(s));
    }
  };

  // Move table to specific row and position
  const moveTableToRow = (
    sourceId: string,
    targetRowIndex: number,
    insertIndexInRow?: number
  ) => {
    const sourceSec = sections.find((s) => s.id === sourceId);
    if (!sourceSec) return;

    // Clone rows structure
    const updatedRows = situationalRows.map((r) => ({
      rowIndex: r.rowIndex,
      sections: r.sections.filter((s) => s.id !== sourceId),
    }));

    // Find or create target row
    let targetRow = updatedRows.find((r) => r.rowIndex === targetRowIndex);
    if (!targetRow) {
      targetRow = { rowIndex: targetRowIndex, sections: [] };
      updatedRows.push(targetRow);
      updatedRows.sort((a, b) => a.rowIndex - b.rowIndex);
    }

    if (insertIndexInRow !== undefined && insertIndexInRow >= 0) {
      targetRow.sections.splice(insertIndexInRow, 0, sourceSec);
    } else {
      targetRow.sections.push(sourceSec);
    }

    // Clean emptyRowIndices if target row was empty
    setEmptyRowIndices((prev) => prev.filter((idx) => idx !== targetRowIndex));

    commitRows(updatedRows);
  };

  // Move table left or right within its row
  const handleMoveTableInRow = (secId: string, direction: -1 | 1) => {
    const updatedRows = situationalRows.map((r) => ({
      rowIndex: r.rowIndex,
      sections: [...r.sections],
    }));

    for (const row of updatedRows) {
      const idx = row.sections.findIndex((s) => s.id === secId);
      if (idx !== -1) {
        const targetIdx = idx + direction;
        if (targetIdx >= 0 && targetIdx < row.sections.length) {
          const temp = row.sections[idx];
          row.sections[idx] = row.sections[targetIdx];
          row.sections[targetIdx] = temp;
          commitRows(updatedRows);
          return;
        }
      }
    }
  };

  // Move table to previous or next row
  const handleMoveTableAcrossRows = (secId: string, direction: -1 | 1) => {
    const curRowIdx = situationalRows.findIndex((r) => r.sections.some((s) => s.id === secId));
    if (curRowIdx === -1) return;

    const targetRowIdx = curRowIdx + direction;
    if (targetRowIdx >= 0 && targetRowIdx < situationalRows.length) {
      moveTableToRow(secId, situationalRows[targetRowIdx].rowIndex);
    } else if (direction === 1) {
      // Create new row at bottom
      const maxRow = situationalRows.reduce((max, r) => Math.max(max, r.rowIndex), -1);
      moveTableToRow(secId, maxRow + 1);
    }
  };

  // Move entire row up or down
  const handleMoveRow = (rowIndex: number, direction: -1 | 1) => {
    const curIdx = situationalRows.findIndex((r) => r.rowIndex === rowIndex);
    if (curIdx === -1) return;
    const targetIdx = curIdx + direction;
    if (targetIdx < 0 || targetIdx >= situationalRows.length) return;

    const updatedRows = [...situationalRows];
    const temp = updatedRows[curIdx];
    updatedRows[curIdx] = updatedRows[targetIdx];
    updatedRows[targetIdx] = temp;

    commitRows(updatedRows);
  };

  // Add empty row
  const handleAddEmptyRow = () => {
    const maxRow = situationalRows.reduce((max, r) => Math.max(max, r.rowIndex), -1);
    const newRowIndex = maxRow + 1;
    setEmptyRowIndices((prev) => [...prev, newRowIndex]);
  };

  // Remove empty row
  const handleRemoveRow = (rowIndex: number) => {
    setEmptyRowIndices((prev) => prev.filter((idx) => idx !== rowIndex));
  };

  // Reset all situational tables to an even row count (e.g. 4 or 3 across)
  const handleResetRows = (tablesPerRow: number = 4) => {
    const rechunked = topSections.map((sec, idx) => ({
      ...sec,
      rowIndex: Math.floor(idx / tablesPerRow),
      order: idx % tablesPerRow,
    }));
    setEmptyRowIndices([]);
    const nonTopSections = sections.filter((s) => !topSections.some((ts) => ts.id === s.id));
    if (onReorderSections) {
      onReorderSections([...rechunked, ...nonTopSections]);
    }
  };

  // Drag handlers
  const handleDragStartTable = (e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.setData('application/callsheet-table-drag', sectionId);
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingSectionId(sectionId);
  };

  const handleDragEndTable = () => {
    setDraggingSectionId(null);
    setDragOverTarget(null);
  };

  const handleDragOverTable = (
    e: React.DragEvent,
    targetSectionId: string,
    rowIndex: number
  ) => {
    if (!draggingSectionId || draggingSectionId === targetSectionId) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const position = e.clientX < midX ? 'before' : 'after';
    setDragOverTarget({ sectionId: targetSectionId, rowIndex, position });
  };

  const handleDropOnTable = (
    e: React.DragEvent,
    targetSectionId: string,
    targetRowIndex: number
  ) => {
    const sourceId = e.dataTransfer.getData('application/callsheet-table-drag') || draggingSectionId;
    if (!sourceId || sourceId === targetSectionId) {
      setDraggingSectionId(null);
      setDragOverTarget(null);
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const targetRow = situationalRows.find((r) => r.rowIndex === targetRowIndex);
    if (!targetRow) return;
    const targetIdx = targetRow.sections.findIndex((s) => s.id === targetSectionId);
    const position = dragOverTarget?.position || 'after';
    const insertIndex = position === 'before' ? targetIdx : targetIdx + 1;

    moveTableToRow(sourceId, targetRowIndex, insertIndex);
    setDraggingSectionId(null);
    setDragOverTarget(null);
  };

  const handleDropOnRowEnd = (e: React.DragEvent, targetRowIndex: number) => {
    const sourceId = e.dataTransfer.getData('application/callsheet-table-drag') || draggingSectionId;
    if (!sourceId) return;
    e.preventDefault();
    e.stopPropagation();
    moveTableToRow(sourceId, targetRowIndex);
    setDraggingSectionId(null);
    setDragOverTarget(null);
  };

  const handleDropOnNewRow = (e: React.DragEvent) => {
    const sourceId = e.dataTransfer.getData('application/callsheet-table-drag') || draggingSectionId;
    if (!sourceId) return;
    e.preventDefault();
    e.stopPropagation();
    const maxRow = situationalRows.reduce((max, r) => Math.max(max, r.rowIndex), -1);
    const newRowIndex = maxRow + 1;
    moveTableToRow(sourceId, newRowIndex);
    setDraggingSectionId(null);
    setDragOverTarget(null);
  };

  const handleDropBetweenRows = (e: React.DragEvent, insertRowPosition: number) => {
    const sourceId = draggingSectionId || e.dataTransfer.getData('application/callsheet-table-drag');
    if (!sourceId) return;
    e.preventDefault();
    e.stopPropagation();

    const sourceSec = sections.find((s) => s.id === sourceId);
    if (!sourceSec) return;

    // Filter out sourceSec from current rows
    const nonSourceRows = situationalRows
      .map((r) => ({
        rowIndex: r.rowIndex,
        sections: r.sections.filter((s) => s.id !== sourceId),
      }))
      .filter((r) => r.sections.length > 0);

    // Insert new row containing sourceSec at insertRowPosition
    nonSourceRows.splice(insertRowPosition, 0, {
      rowIndex: 9999,
      sections: [sourceSec],
    });

    commitRows(nonSourceRows);
    setDraggingSectionId(null);
    setDragOverTarget(null);
  };

  // Helper to determine responsive grid classes based on table count in a row
  const getRowGridClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid grid-cols-1 print:grid-cols-1 w-full gap-2.5 items-start';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 w-full gap-2.5 items-start';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 w-full gap-2.5 items-start';
      case 4:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 w-full gap-2.5 items-start';
      case 5:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 print:grid-cols-5 w-full gap-2 items-start';
      case 6:
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 print:grid-cols-6 w-full gap-2 items-start';
    }
  };

  // Fallback grid class for Red Zone & Custom sections
  const getStandardGridClass = () => {
    switch (gridColumns) {
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 items-start';
      case 5:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start';
      case 4:
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-start';
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-white dark:bg-slate-950 p-2 sm:p-4 rounded-none shadow-md space-y-4 font-sans print:p-0 print:shadow-none print:bg-white print:text-black">
      {/* =========================================================================
          1. TOP SITUATIONAL SECTION (Drag-and-Drop Rows & Custom Table Counts)
          ========================================================================= */}
      <div className="space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-1 flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Situational &amp; Down-and-Distance
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
              {topSections.length} Tables in {situationalRows.length} {situationalRows.length === 1 ? 'Row' : 'Rows'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Reset / Preset row balance */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-500">
              <span className="font-semibold">Reset to:</span>
              <button
                type="button"
                onClick={() => handleResetRows(4)}
                className="px-1 py-0.2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
                title="Reset layout to 4 tables per row"
              >
                4/row
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => handleResetRows(3)}
                className="px-1 py-0.2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
                title="Reset layout to 3 tables per row"
              >
                3/row
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => handleResetRows(2)}
                className="px-1 py-0.2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
                title="Reset layout to 2 tables per row"
              >
                2/row
              </button>
            </div>

            {/* Add New Row Button */}
            <button
              type="button"
              onClick={handleAddEmptyRow}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Add a new row tier for situational tables"
            >
              <Plus className="w-3 h-3" />
              <span>Add Row</span>
            </button>

            {/* Add Situational Table Modal Trigger */}
            <button
              type="button"
              onClick={() => onAddSection('top_situations')}
              className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* Multi-Row Situational Layout */}
        <div className="space-y-3.5">
          {situationalRows.map((row, rowIdx) => {
            const tableCount = row.sections.length;
            return (
              <React.Fragment key={`sit-row-${row.rowIndex}`}>
                <div className="space-y-1.5 transition-all">
                {/* Row Header & Toolbar (screen only) */}
                <div className="flex items-center justify-between px-1 py-0.5 text-[10.5px] border-b border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 print:hidden select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-slate-400" />
                      Row {rowIdx + 1}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-semibold text-slate-500 dark:text-slate-400">
                      {tableCount} {tableCount === 1 ? 'table' : 'tables'} across
                    </span>
                    {tableCount > 0 && (
                      <span className="text-[9.5px] text-slate-400 font-mono hidden md:inline">
                        (Each spans 1/{tableCount} width)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Add Table to this specific row */}
                    <button
                      type="button"
                      onClick={() => onAddSection('top_situations', 'wristband', row.rowIndex)}
                      className="px-1.5 py-0.2 text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded flex items-center gap-0.5 cursor-pointer"
                      title={`Add a table into Row ${rowIdx + 1}`}
                    >
                      <Plus className="w-2.5 h-2.5" /> Table
                    </button>

                    {/* Move Row Up */}
                    {rowIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveRow(row.rowIndex, -1)}
                        className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"
                        title="Move entire row up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}

                    {/* Move Row Down */}
                    {rowIdx < situationalRows.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveRow(row.rowIndex, 1)}
                        className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"
                        title="Move entire row down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete Row if empty */}
                    {tableCount === 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.rowIndex)}
                        className="p-0.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer ml-1"
                        title="Remove empty row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Row Grid Container with Adaptive Widths */}
                {tableCount === 0 ? (
                  <div
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes('application/callsheet-table-drag')) {
                        e.preventDefault();
                        setDragOverTarget({ rowIndex: row.rowIndex, position: 'row-end' });
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverTarget?.rowIndex === row.rowIndex) {
                        setDragOverTarget(null);
                      }
                    }}
                    onDrop={(e) => handleDropOnRowEnd(e, row.rowIndex)}
                    className={`border-2 border-dashed rounded p-4 text-center text-xs flex items-center justify-center gap-2 transition-all print:hidden ${
                      dragOverTarget?.rowIndex === row.rowIndex
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Empty Row {rowIdx + 1} &mdash; Drag situational tables here, or click "+ Table"</span>
                  </div>
                ) : (
                  <div
                    className={getRowGridClass(
                      draggingSectionId && !row.sections.some((s) => s.id === draggingSectionId)
                        ? tableCount + 1
                        : tableCount
                    )}
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes('application/callsheet-table-drag')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {row.sections.map((sec, secIdx) => {
                      const isDragTargetThis = dragOverTarget?.sectionId === sec.id;
                      const isDraggingThis = draggingSectionId === sec.id;

                      return (
                        <div
                          key={sec.id}
                          className="relative flex flex-col min-w-0"
                          onDragOver={(e) => handleDragOverTable(e, sec.id, row.rowIndex)}
                          onDrop={(e) => handleDropOnTable(e, sec.id, row.rowIndex)}
                        >
                          {/* Drop Indicator Bar on Left (Before) */}
                          {isDragTargetThis && dragOverTarget?.position === 'before' && (
                            <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-indigo-600 z-30 rounded shadow-md pointer-events-none animate-pulse" />
                          )}

                          <CallSheetSectionBox
                            section={sec}
                            onSlotClick={(slotIdx) => onSlotClick(sec.id, slotIdx)}
                            onClearSlot={(slotIdx) => onClearSlot(sec.id, slotIdx)}
                            onDropPlay={(slotIdx, play) => onDropPlayToSlot(sec.id, slotIdx, play)}
                            onUpdateSection={onUpdateSection}
                            onDeleteSection={onDeleteSection}
                            isDraggable={true}
                            onDragStartTable={handleDragStartTable}
                            onDragEndTable={handleDragEndTable}
                            onDragOverTable={(e, targetId) => handleDragOverTable(e, targetId, row.rowIndex)}
                            onDropOnTable={(e, targetId) => handleDropOnTable(e, targetId, row.rowIndex)}
                            onMoveTableLeft={(secId) => handleMoveTableInRow(secId, -1)}
                            onMoveTableRight={(secId) => handleMoveTableInRow(secId, 1)}
                            onMoveTableUpRow={(secId) => handleMoveTableAcrossRows(secId, -1)}
                            onMoveTableDownRow={(secId) => handleMoveTableAcrossRows(secId, 1)}
                            onMoveTableToRow={(secId, targetRowIdx) => moveTableToRow(secId, targetRowIdx)}
                            availableRowIndices={situationalRows.map((r) => r.rowIndex)}
                            canMoveLeft={secIdx > 0}
                            canMoveRight={secIdx < row.sections.length - 1}
                            canMoveUpRow={rowIdx > 0}
                            canMoveDownRow={true}
                            isDragTarget={isDragTargetThis}
                            isDragging={isDraggingThis}
                            rowIndex={row.rowIndex}
                          />

                          {/* Drop Indicator Bar on Right (After) */}
                          {isDragTargetThis && dragOverTarget?.position === 'after' && (
                            <div className="absolute -right-1.5 top-0 bottom-0 w-1 bg-indigo-600 z-30 rounded shadow-md pointer-events-none animate-pulse" />
                          )}
                        </div>
                      );
                    })}

                    {/* End-of-row drop slot when dragging a table from elsewhere */}
                    {draggingSectionId && !row.sections.some((s) => s.id === draggingSectionId) && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverTarget({ rowIndex: row.rowIndex, position: 'row-end' });
                        }}
                        onDragLeave={() => {
                          if (dragOverTarget?.rowIndex === row.rowIndex && dragOverTarget?.position === 'row-end') {
                            setDragOverTarget(null);
                          }
                        }}
                        onDrop={(e) => handleDropOnRowEnd(e, row.rowIndex)}
                        className={`border-2 border-dashed rounded min-h-[140px] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer p-3 select-none print:hidden ${
                          dragOverTarget?.rowIndex === row.rowIndex && dragOverTarget?.position === 'row-end'
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 scale-[1.01] shadow-md'
                            : 'border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                        }`}
                        title={`Drop here to place table at the end of Row ${rowIdx + 1}`}
                      >
                        <Plus className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-bold text-center">Drop in Row {rowIdx + 1}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({tableCount + 1} tables &bull; 1/{tableCount + 1} width)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Inter-row drop indicator to split or insert a new row between rows */}
              {draggingSectionId && rowIdx < situationalRows.length - 1 && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverTarget({ rowIndex: row.rowIndex, position: 'new-row-between' as any });
                  }}
                  onDragLeave={() => {
                    if (dragOverTarget?.position === ('new-row-between' as any)) {
                      setDragOverTarget(null);
                    }
                  }}
                  onDrop={(e) => handleDropBetweenRows(e, rowIdx + 1)}
                  className={`h-6 -my-1 rounded transition-all flex items-center justify-center print:hidden cursor-pointer ${
                    dragOverTarget?.rowIndex === row.rowIndex && dragOverTarget?.position === ('new-row-between' as any)
                      ? 'bg-indigo-500/20 border-2 border-dashed border-indigo-500 py-3 h-10'
                      : 'opacity-0 hover:opacity-100 hover:bg-indigo-500/10'
                  }`}
                  title="Drop here to insert a brand new row in between"
                >
                  <span className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-0.5 rounded shadow-xs border border-indigo-300 dark:border-indigo-700">
                    + Drop here to insert a new row between Row {rowIdx + 1} and Row {rowIdx + 2}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}

          {/* Bottom Drop Zone / Add Row Trigger */}
          <div
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('application/callsheet-table-drag')) {
                e.preventDefault();
                setDragOverTarget({ rowIndex: -1, position: 'new-row' });
              }
            }}
            onDragLeave={() => {
              if (dragOverTarget?.position === 'new-row') {
                setDragOverTarget(null);
              }
            }}
            onDrop={handleDropOnNewRow}
            onClick={handleAddEmptyRow}
            className={`border-2 border-dashed rounded py-2 px-3 text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 print:hidden ${
              dragOverTarget?.position === 'new-row'
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
            title="Drag any situational table here or click to start a new row"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {draggingSectionId
                ? 'Drop situational table here to create a New Row'
                : '+ Add New Row of Situational Tables'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. RED ZONE SECTION (Big Banner, Global Red Zone Highlight, Auto-Formatting Grid)
          ========================================================================= */}
      <div
        className={`border-2 border-red-600 rounded-none overflow-hidden transition-all ${
          highlightRedZone
            ? 'bg-rose-100/70 p-2 sm:p-2.5 shadow-xs dark:bg-rose-950/20'
            : 'bg-white dark:bg-slate-900 p-2 sm:p-2.5'
        }`}
      >
        {/* Giant Red Zone Header Bar */}
        <div className="bg-red-600 text-white font-black text-center text-sm sm:text-base tracking-widest py-1 px-4 mb-2 shadow-xs uppercase flex items-center justify-between">
          <span className="flex-1 text-center font-black">
            {unit === 'offense' ? 'RED ZONE' : 'RED ZONE DEFENSE'}
          </span>
          <button
            type="button"
            onClick={() => onAddSection('red_zone')}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer print:hidden"
          >
            <Plus className="w-3 h-3" />
            <span>Add Red Zone Table</span>
          </button>
        </div>

        {/* Auto-Formatting Red Zone Grid */}
        <div className={getStandardGridClass()}>
          {rzSections.map((sec) => (
            <CallSheetSectionBox
              key={sec.id}
              section={sec}
              isRedZoneParent={true}
              onSlotClick={(slotIdx) => onSlotClick(sec.id, slotIdx)}
              onClearSlot={(slotIdx) => onClearSlot(sec.id, slotIdx)}
              onDropPlay={(slotIdx, play) => onDropPlayToSlot(sec.id, slotIdx, play)}
              onUpdateSection={onUpdateSection}
              onDeleteSection={onDeleteSection}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. TEMPO & GAME MANAGEMENT SECTION (Auto-Formatting Grid)
          ========================================================================= */}
      {tempoSections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 print:hidden">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tempo, Clock &amp; Specials ({tempoSections.length} Tables)
            </span>
            <button
              type="button"
              onClick={() => onAddSection('tempo_game_mgmt')}
              className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Tempo Table</span>
            </button>
          </div>

          <div className={getStandardGridClass()}>
            {tempoSections.map((sec) => (
              <CallSheetSectionBox
                key={sec.id}
                section={sec}
                onSlotClick={(slotIdx) => onSlotClick(sec.id, slotIdx)}
                onClearSlot={(slotIdx) => onClearSlot(sec.id, slotIdx)}
                onDropPlay={(slotIdx, play) => onDropPlayToSlot(sec.id, slotIdx, play)}
                onUpdateSection={onUpdateSection}
                onDeleteSection={onDeleteSection}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. CUSTOM SECTIONS (If Any Added By Coach)
          ========================================================================= */}
      {customSections.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1 print:hidden">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Custom Sections ({customSections.length} Tables)
            </span>
            <button
              type="button"
              onClick={() => onAddSection('custom')}
              className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Table</span>
            </button>
          </div>

          <div className={getStandardGridClass()}>
            {customSections.map((sec) => (
              <CallSheetSectionBox
                key={sec.id}
                section={sec}
                onSlotClick={(slotIdx) => onSlotClick(sec.id, slotIdx)}
                onClearSlot={(slotIdx) => onClearSlot(sec.id, slotIdx)}
                onDropPlay={(slotIdx, play) => onDropPlayToSlot(sec.id, slotIdx, play)}
                onUpdateSection={onUpdateSection}
                onDeleteSection={onDeleteSection}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          5. BOTTOM SECTION: SCRIPTS, 2-POINT CHART, & TIMEOUTS TRACKER
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-2">
        {/* Scripts Column */}
        <div className="md:col-span-4 lg:col-span-4">
          <ScriptsBox
            scriptPlays={scriptPlays}
            columnsCount={callSheetData.scriptColumnsCount || 1}
            highlightEnabled={callSheetData.scriptHighlightEnabled || false}
            onSlotClick={(slotIdx) => onSlotClick('script', slotIdx)}
            onClearSlot={(slotIdx) => onClearSlot('script', slotIdx)}
            onDropPlay={(slotIdx, play) => onDropPlayToSlot('script', slotIdx, play)}
            onAddRow={onAddScriptRow}
            onRemoveRow={onRemoveScriptRow}
            onToggleColumns={onToggleScriptColumns}
            onToggleHighlight={onToggleScriptHighlight}
          />
        </div>

        {/* 2-Point Conversion Decision Matrix */}
        <div className="md:col-span-5 lg:col-span-5">
          <TwoPointChartBox
            rules={callSheetData.twoPointRules}
            highlightEnabled={callSheetData.twoPointHighlightEnabled ?? true}
            onUpdateRules={onUpdateTwoPointRules}
            onToggleHighlight={onToggleTwoPointHighlight}
          />
        </div>

        {/* Timeouts Left Tracker */}
        <div className="md:col-span-3 lg:col-span-3">
          <TimeoutsTrackerBox
            timeouts={callSheetData.timeouts}
            highlightEnabled={callSheetData.timeoutsHighlightEnabled ?? false}
            timeoutsCount={callSheetData.timeoutsCount || 3}
            onChangeTimeouts={onChangeTimeouts}
            onToggleHighlight={onToggleTimeoutsHighlight}
            onChangeTimeoutsCount={onChangeTimeoutsCount}
          />
        </div>
      </div>
    </div>
  );
};

