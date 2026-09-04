import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Columns,
  Hash,
  Palette,
  Layers,
  Check,
} from 'lucide-react';
import { CallSheetSection } from '../../types/callSheet';

interface AddTableModalProps {
  isOpen: boolean;
  activeUnit: 'offense' | 'defense';
  initialGroup?: 'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom';
  onClose: () => void;
  onAddSection: (newSection: CallSheetSection) => void;
}

const COLOR_OPTIONS = [
  { label: 'Blue', hex: '#2563eb' },
  { label: 'Red', hex: '#dc2626' },
  { label: 'Green', hex: '#16a34a' },
  { label: 'Dark / Slate', hex: '#09090b' },
  { label: 'Purple', hex: '#7e22ce' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Cyan', hex: '#0891b2' },
  { label: 'Emerald', hex: '#059669' },
];

const HIGHLIGHT_TINTS = [
  { id: 'yellow', label: 'Yellow Tint', swatch: '#fef08a' },
  { id: 'rose', label: 'Rose Tint', swatch: '#fecdd3' },
  { id: 'green', label: 'Green Tint', swatch: '#bbf7d0' },
  { id: 'cyan', label: 'Cyan Tint', swatch: '#a5f3fc' },
  { id: 'purple', label: 'Purple Tint', swatch: '#e9d5ff' },
  { id: 'orange', label: 'Orange Tint', swatch: '#fed7aa' },
];

const SUGGESTIONS = {
  offense: [
    '1st & 10 (Open Field)',
    '3rd & Short (1-3)',
    '3rd & Medium (4-6)',
    '3rd & Long (7+)',
    'Goal Line (Heavy)',
    'Backed Up (1-5 YD)',
    '2-Minute Drill',
    'Screen Package',
    'Shotgun Pass',
    'Trick Plays',
    'Overtime Calls',
    '4-Minute (Clock Kill)',
  ],
  defense: [
    'Base 1st Down Run Stop',
    '3rd & Short Blitz',
    '3rd & Long Pass Coverage',
    'Red Zone Tight Coverage',
    'Goal Line Stand',
    'Backed Up Pressure',
    '2-Minute Prevent',
    'Heavy Pressure Blitzes',
    'Empty Spread Check',
    'Trick Play Defense',
    'Overtime Base',
  ],
};

export const AddTableModal: React.FC<AddTableModalProps> = ({
  isOpen,
  activeUnit,
  initialGroup = 'top_situations',
  onClose,
  onAddSection,
}) => {
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState<'top_situations' | 'red_zone' | 'tempo_game_mgmt' | 'custom'>(
    initialGroup
  );
  const [rowsCount, setRowsCount] = useState(4);
  const [columnsCount, setColumnsCount] = useState(1);
  const [highlightEnabled, setHighlightEnabled] = useState(initialGroup === 'red_zone');
  const [highlightColor, setHighlightColor] = useState(initialGroup === 'red_zone' ? 'rose' : 'yellow');
  const [headerColor, setHeaderColor] = useState(
    initialGroup === 'red_zone'
      ? '#dc2626'
      : initialGroup === 'tempo_game_mgmt'
      ? '#09090b'
      : activeUnit === 'offense'
      ? '#2563eb'
      : '#16a34a'
  );

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = title.trim() || 'New Situation Table';
    const newSection: CallSheetSection = {
      id: `${activeUnit.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: finalTitle,
      headerBgColor: headerColor,
      headerTextColor: '#ffffff',
      targetUnit: activeUnit,
      group,
      slotsCount: rowsCount,
      columnsCount,
      highlightEnabled,
      highlightColor,
      plays: Array(rowsCount).fill(null),
    };

    onAddSection(newSection);
    onClose();
  };

  const suggestions = activeUnit === 'offense' ? SUGGESTIONS.offense : SUGGESTIONS.defense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Add New Table ({activeUnit === 'offense' ? 'Offense' : 'Defense'})
              </h2>
              <p className="text-[11px] text-slate-400">
                Customizable situational table with editable rows, columns &amp; highlight
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Table Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3rd &amp; Long, Screen Game, Goal Line Heavy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              autoFocus
            />

            {/* Suggestions Chips */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-bold">Quick Suggestions:</span>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {suggestions.slice(0, 6).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setTitle(sugg)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group Category */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Section Category (Auto-Formats Placement)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'top_situations', label: 'Situations' },
                { id: 'red_zone', label: 'Red Zone' },
                { id: 'tempo_game_mgmt', label: 'Tempo / Clock' },
                { id: 'custom', label: 'Custom' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const nextGroup = cat.id as any;
                    setGroup(nextGroup);
                    if (nextGroup === 'red_zone') {
                      setHeaderColor('#dc2626');
                      setHighlightEnabled(true);
                      setHighlightColor('rose');
                    } else if (nextGroup === 'tempo_game_mgmt') {
                      setHeaderColor('#09090b');
                    }
                  }}
                  className={`py-2 px-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                    group === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rows & Columns Configuration */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rows Count */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-400" />
                Initial Rows ({rowsCount})
              </label>
              <div className="flex items-center gap-1">
                {[2, 4, 6, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRowsCount(n)}
                    className={`flex-1 py-1.5 rounded-lg border font-black text-center text-xs cursor-pointer ${
                      rowsCount === n
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Columns Count */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Columns className="w-3 h-3 text-indigo-400" />
                Columns ({columnsCount})
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setColumnsCount(n)}
                    className={`flex-1 py-1.5 rounded-lg border font-black text-center text-xs cursor-pointer ${
                      columnsCount === n
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Highlight Toggle & Tint Selection */}
          <div className="space-y-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-200">Highlight Styling</span>
              </div>
              <button
                type="button"
                onClick={() => setHighlightEnabled(!highlightEnabled)}
                className={`px-3 py-1 rounded-lg font-black text-[10px] transition-colors cursor-pointer border ${
                  highlightEnabled
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                    : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-slate-200'
                }`}
              >
                {highlightEnabled ? 'HIGHLIGHT ON' : 'HIGHLIGHT OFF'}
              </button>
            </div>

            {highlightEnabled && (
              <div className="pt-2 border-t border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400">Select Tint Color:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {HIGHLIGHT_TINTS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHighlightColor(t.id)}
                      className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold cursor-pointer ${
                        highlightColor === t.id
                          ? 'bg-slate-700 text-white border-amber-400'
                          : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                        style={{ backgroundColor: t.swatch }}
                      />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Header Color Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
              <Palette className="w-3 h-3 text-slate-400" />
              Header Background Color
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setHeaderColor(c.hex)}
                  className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center transition-transform cursor-pointer border ${
                    headerColor === c.hex
                      ? 'scale-110 ring-2 ring-white border-black'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {headerColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Table</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
