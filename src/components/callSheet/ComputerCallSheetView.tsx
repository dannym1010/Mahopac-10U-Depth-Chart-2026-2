import React, { useState } from 'react';
import { Plus, Sparkles, LayoutGrid, Trash2 } from 'lucide-react';
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
  onAddSection: (group: 'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom') => void;
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

  // Helper to determine responsive grid classes based on gridColumns
  const getGridClass = () => {
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
          1. TOP SITUATIONAL SECTION (Auto-Formatting Grid)
          ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 print:hidden">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Situational &amp; Down-and-Distance ({topSections.length} Tables)
          </span>
          <button
            type="button"
            onClick={() => onAddSection('top_situations')}
            className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Situational Table</span>
          </button>
        </div>

        <div className={getGridClass()}>
          {topSections.map((sec) => (
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
        <div className={getGridClass()}>
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

          <div className={getGridClass()}>
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

          <div className={getGridClass()}>
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
