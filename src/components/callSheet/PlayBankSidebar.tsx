import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  GripVertical,
  Layers,
  Sparkles,
  Star,
  Tag,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { PlayDatabaseEntry, PlayType, CallSheetPlay } from '../../types/callSheet';

interface PlayBankSidebarProps {
  unit: 'offense' | 'defense';
  plays: PlayDatabaseEntry[];
  onAddCustomPlay: () => void;
  onOpenExcelImport?: () => void;
  onDeletePlay?: (playId: string) => void;
  onResetDefaults?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const PlayBankSidebar: React.FC<PlayBankSidebarProps> = ({
  unit,
  plays,
  onAddCustomPlay,
  onOpenExcelImport,
  onDeletePlay,
  onResetDefaults,
  isOpen,
  onToggleOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredPlays = useMemo(() => {
    return plays.filter((p) => {
      if (p.unit !== unit) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesFormation = p.formation.toLowerCase().includes(term);
        const matchesConcept = (p.concept || '').toLowerCase().includes(term);
        const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(term));
        const matchesWristband = p.wristbandNum ? `#${p.wristbandNum}`.includes(term) : false;
        if (!matchesName && !matchesFormation && !matchesConcept && !matchesTags && !matchesWristband) {
          return false;
        }
      }
      return true;
    });
  }, [plays, unit, selectedType, searchTerm]);

  const handleDragStart = (e: React.DragEvent, play: PlayDatabaseEntry) => {
    const playData: CallSheetPlay = {
      id: `drag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: play.name,
      formation: play.formation,
      type: play.type,
      wristbandNum: play.wristbandNum,
      personnel: play.personnel,
      notes: play.concept,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(playData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        className="fixed right-4 top-40 z-30 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs cursor-pointer print:hidden transition-all hover:scale-105"
        title="Open Play Database Bank"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Play Bank</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 sm:hidden print:hidden"
        onClick={onToggleOpen}
      />

      <div className="fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] sm:relative sm:inset-auto sm:w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full print:hidden shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                {unit === 'offense' ? 'Offense' : 'Defense'} Play Bank
              </h3>
              <span className="text-[10px] text-slate-400">
                Drag plays onto any sheet cell
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onOpenExcelImport && (
              <button
                type="button"
                onClick={onOpenExcelImport}
                className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Import plays from Excel (.xlsx, .xls, .csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onAddCustomPlay}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              title="Create new play"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close play bank"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-2 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plays or wristband #..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({plays.filter((p) => p.unit === unit).length})
            </button>
            {(unit === 'offense'
              ? ['run', 'pass', 'play_action', 'screen', 'rpo', 'trick']
              : ['coverage', 'blitz', 'goal_line', 'run']
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-1.5 py-0.5 rounded-md font-bold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Plays List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 no-scrollbar">
          {filteredPlays.map((play) => (
            <div
              key={play.id}
              draggable
              onDragStart={(e) => handleDragStart(e, play)}
              className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/60 rounded-xl cursor-grab active:cursor-grabbing transition-all select-none group shadow-xs"
              title="Drag onto any slot in the call sheet"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {play.wristbandNum && (
                    <span className="px-1 py-0.2 rounded bg-amber-400 text-black font-black text-[9px] font-mono shrink-0">
                      #{play.wristbandNum}
                    </span>
                  )}
                  <span className="font-bold text-xs text-slate-100 group-hover:text-white uppercase truncate">
                    {play.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onDeletePlay && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeletePlay(play.id);
                      }}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      title={`Delete "${play.name}" from play bank`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                </div>
              </div>

              <div className="flex items-center gap-1 flex-wrap text-[9px]">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {play.formation}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 font-bold uppercase border border-indigo-500/30">
                  {play.type.replace('_', ' ')}
                </span>
                {play.personnel && (
                  <span className="text-slate-400 truncate">
                    • {play.personnel}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredPlays.length === 0 && (
            <div className="text-center py-10 space-y-3 text-slate-400 text-xs px-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-200">No matching plays</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Try changing filters or import plays from your spreadsheet.</p>
              </div>
              {onOpenExcelImport && (
                <button
                  type="button"
                  onClick={onOpenExcelImport}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import Plays from Excel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary & Reset */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-[10px] text-slate-400">
          <span>{filteredPlays.length} {unit} plays</span>
          {onResetDefaults && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset to factory default plays"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
