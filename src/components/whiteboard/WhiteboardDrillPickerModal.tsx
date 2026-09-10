import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Dumbbell,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  WhiteboardDrill,
  DEFENSIVE_POSITION_GROUPS,
  DefensivePositionCategory,
} from './whiteboardDrillData';

interface WhiteboardDrillPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  drills: WhiteboardDrill[];
  activeDrillId: string;
  selectedCategory: 'ALL' | DefensivePositionCategory;
  onSelectCategory: (cat: 'ALL' | DefensivePositionCategory) => void;
  onSelectDrill: (drillId: string) => void;
  onNavigateToDrills?: () => void;
}

export const WhiteboardDrillPickerModal: React.FC<WhiteboardDrillPickerModalProps> = ({
  isOpen,
  onClose,
  drills,
  activeDrillId,
  selectedCategory,
  onSelectCategory,
  onSelectDrill,
  onNavigateToDrills,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered drills based on category & search
  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      // Category match
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'OFFENSE') {
          if (!drill.category.startsWith('OFF')) return false;
        } else if (selectedCategory === 'DEFENSE') {
          if (!['DL', 'DE', 'LB', 'DB', 'SCHEME', 'DEFENSE'].includes(drill.category)) return false;
        } else if (drill.category !== selectedCategory) {
          return false;
        }
      }

      // Search match
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        drill.title.toLowerCase().includes(q) ||
        drill.subtitle?.toLowerCase().includes(q) ||
        drill.objective?.toLowerCase().includes(q) ||
        drill.category.toLowerCase().includes(q) ||
        (drill.categoryLabel && drill.categoryLabel.toLowerCase().includes(q)) ||
        (drill.cues && drill.cues.some((c) => c.toLowerCase().includes(q)))
      );
    });
  }, [drills, selectedCategory, searchTerm]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: drills.length };
    drills.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
      if (d.category.startsWith('OFF')) {
        counts.OFFENSE = (counts.OFFENSE || 0) + 1;
      }
      if (['DL', 'DE', 'LB', 'DB', 'SCHEME', 'DEFENSE'].includes(d.category)) {
        counts.DEFENSE = (counts.DEFENSE || 0) + 1;
      }
    });
    return counts;
  }, [drills]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 p-0 sm:p-4">
      <div
        className="w-full max-w-lg bg-slate-950 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Drag Handle (Mobile) */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate">
                Whiteboard Drills &amp; Diagrams
              </h3>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {filteredDrills.length} of {drills.length} drills available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onNavigateToDrills && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToDrills();
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                title="Switch to Master Drill Library"
              >
                <Dumbbell className="w-3 h-3" />
                <span className="hidden sm:inline">Drill Library</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drills, keys, cues (e.g. 'Get-off', 'Spill', 'Rip')..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400 shadow-inner"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => onSelectCategory('ALL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All ({categoryCounts.ALL || 0})
          </button>
          {DEFENSIVE_POSITION_GROUPS.filter((g) => g.id !== 'ALL').map((group) => {
            const count = categoryCounts[group.id] || 0;
            if (count === 0 && !group.id.startsWith('OFF')) return null;
            const isSelected = selectedCategory === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectCategory(group.id as any)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 font-black shadow-xs'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.shortLabel}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-200 font-black' : 'text-slate-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Drill List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-800/40">
          {filteredDrills.length > 0 ? (
            filteredDrills.map((drill) => {
              const isActive = drill.id === activeDrillId;
              const group = DEFENSIVE_POSITION_GROUPS.find((g) => g.id === drill.category);
              const phaseCount = drill.phases?.length || 0;

              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => {
                    onSelectDrill(drill.id);
                    onClose();
                  }}
                  className={`w-full pt-1.5 first:pt-0 text-left p-2.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 group border ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500/60 shadow-md ring-1 ring-blue-400/40'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black mt-0.5 border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {group?.icon || '🏈'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-blue-500/30 text-blue-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {group?.shortLabel || drill.category}
                        </span>
                        {phaseCount > 0 && (
                          <span className="text-[9.5px] font-bold text-slate-400 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            {phaseCount} {phaseCount === 1 ? 'Phase' : 'Phases'}
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs font-black tracking-wide uppercase mt-0.5 truncate ${
                          isActive ? 'text-blue-300 font-extrabold' : 'text-slate-100 group-hover:text-blue-300'
                        }`}
                      >
                        {drill.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {drill.subtitle || drill.objective}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    {isActive ? (
                      <span className="p-1 rounded-full bg-blue-500 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p className="font-bold text-slate-400">No drills found</p>
              <p className="mt-1">Try a different category or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
