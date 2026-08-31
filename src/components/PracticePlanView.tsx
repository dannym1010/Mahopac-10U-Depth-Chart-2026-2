import React, { useState, useRef, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Edit,
  Hash,
  Trash2,
  Save,
  Settings,
  Printer,
  Calendar,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  X,
  ArrowUp,
  ArrowDown,
  Check,
  UserPlus,
  Sparkles,
  Search,
  Layers,
} from 'lucide-react';
import {
  PracticePlan,
  PracticePeriod,
  PracticeStation,
  DrillFolder,
  DrillItem,
  UserRole,
} from '../types';
import { formatTimeMinutes, parseTimeString } from '../services/storageService';
import { PracticeWizardModal, PracticeWizardGeneratedResult } from './PracticeWizardModal';

interface PracticePlanViewProps {
  practices: PracticePlan[];
  currentPracticeId: string | null;
  practiceTemplates: Record<string, PracticePeriod[]>;
  cascadingDrills: DrillFolder[];
  savedCoaches: string[];
  printFontSize: string;
  userRole: UserRole;
  scheduleEvents?: any[];
  onSelectPractice: (id: string) => void;
  onOpenNewPracticeModal: () => void;
  onEditPracticeDetails: () => void;
  onAutoNumberPractices: () => void;
  onDeletePractice: () => void;
  onApplyTemplate: (templateName: string) => void;
  onSaveCurrentAsTemplate: () => void;
  onOpenTemplatesModal: () => void;
  onUpdatePrintFontSize: (size: string) => void;
  onUpdateMeta: (field: keyof PracticePlan, value: any) => void;
  onAddPeriod: () => void;
  onRemovePeriod: (pIdx: number) => void;
  onMovePeriod: (pIdx: number, direction: number) => void;
  onUpdatePeriodTime: (pIdx: number, time: number) => void;
  onUpdatePeriodCategory: (pIdx: number, cat: string) => void;
  onUpdatePeriodFormat: (pIdx: number, format: 'static' | 'rotating') => void;
  onAddStationToPeriod: (pIdx: number) => void;
  onRemoveStationFromPeriod: (pIdx: number, sIdx: number) => void;
  onUpdateStation: (
    pIdx: number,
    sIdx: number,
    field: keyof PracticeStation,
    value: string
  ) => void;
  onSelectDrillForStation: (
    pIdx: number,
    sIdx: number,
    drill: DrillItem
  ) => void;
  onAddNewSavedCoach: (name: string) => void;
  onDeleteSavedCoach: (name: string) => void;
  onNavigateToSchedule?: () => void;
  onPracticeWizardGenerate?: (result: PracticeWizardGeneratedResult) => void;
  onQuickCreateFromSchedule?: (event: any) => void;
}

export const PracticePlanView: React.FC<PracticePlanViewProps> = ({
  practices,
  currentPracticeId,
  practiceTemplates,
  cascadingDrills,
  savedCoaches,
  printFontSize,
  userRole,
  scheduleEvents = [],
  onSelectPractice,
  onOpenNewPracticeModal,
  onEditPracticeDetails,
  onAutoNumberPractices,
  onDeletePractice,
  onApplyTemplate,
  onSaveCurrentAsTemplate,
  onOpenTemplatesModal,
  onUpdatePrintFontSize,
  onUpdateMeta,
  onAddPeriod,
  onRemovePeriod,
  onMovePeriod,
  onUpdatePeriodTime,
  onUpdatePeriodCategory,
  onUpdatePeriodFormat,
  onAddStationToPeriod,
  onRemoveStationFromPeriod,
  onUpdateStation,
  onSelectDrillForStation,
  onAddNewSavedCoach,
  onDeleteSavedCoach,
  onNavigateToSchedule,
  onPracticeWizardGenerate,
  onQuickCreateFromSchedule,
}) => {
  const [isPlanLibraryOpen, setIsPlanLibraryOpen] = useState(false);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');
  const [dropdownViewMode, setDropdownViewMode] = useState<'tree' | 'flat' | 'schedule'>('tree');
  const [filterTag, setFilterTag] = useState<'all' | 'this_week' | 'upcoming' | 'past'>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeCoachPopup, setActiveCoachPopup] = useState<string | null>(null);
  const [collapsedTreeFolders, setCollapsedTreeFolders] = useState<Record<string, boolean>>({});

  const currentPlan =
    practices.find((p) => p.id === currentPracticeId) || practices[0];

  // Auto expand current plan's folders when library opens
  useEffect(() => {
    if (isPlanLibraryOpen && currentPlan) {
      const yr = currentPlan.year || '2026';
      const wk = currentPlan.weekFolder || 'Week 1';
      setCollapsedTreeFolders((prev) => ({
        ...prev,
        [`yr_${yr}`]: false,
        [`wk_${yr}_${wk}`]: false,
      }));
    }
  }, [isPlanLibraryOpen, currentPlan]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlanLibraryOpen) {
        setIsPlanLibraryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlanLibraryOpen]);

  // Helper to flat list drills from matching category or all
  const getDrillsForCategory = (catName: string): DrillItem[] => {
    const flat: DrillItem[] = [];
    const traverse = (nodeList: DrillFolder[]) => {
      nodeList.forEach((n) => {
        if (n.drills) flat.push(...n.drills);
        if (n.subfolders) traverse(n.subfolders);
      });
    };

    const matchingFolder = cascadingDrills.find((f) => f.name === catName);
    if (matchingFolder) {
      if (matchingFolder.drills) flat.push(...matchingFolder.drills);
      if (matchingFolder.subfolders) traverse(matchingFolder.subfolders);
    } else {
      traverse(cascadingDrills);
    }
    return flat;
  };

  // Build hierarchical year -> week -> practice tree
  const practiceTree: Record<string, Record<string, PracticePlan[]>> = {};
  const sortedPractices = [...practices].sort((a, b) =>
    (a.date || '1970-01-01').localeCompare(b.date || '1970-01-01')
  );

  sortedPractices.forEach((p) => {
    const yr = p.year || '2026';
    const wk = p.weekFolder || 'Week 1';
    if (!practiceTree[yr]) practiceTree[yr] = {};
    if (!practiceTree[yr][wk]) practiceTree[yr][wk] = [];
    practiceTree[yr][wk].push(p);
  });

  const currentIndex = sortedPractices.findIndex((p) => p.id === currentPlan?.id);
  const prevPractice = currentIndex > 0 ? sortedPractices[currentIndex - 1] : null;
  const nextPractice =
    currentIndex >= 0 && currentIndex < sortedPractices.length - 1
      ? sortedPractices[currentIndex + 1]
      : null;

  const currentPlanPeriodsCount = (currentPlan?.periods || []).length;
  const currentPlanDurationMinutes = (currentPlan?.periods || []).reduce(
    (acc, per) => acc + (per.time || 0),
    0
  );

  // Unplanned schedule events (practices/scrimmages without a created plan)
  const unplannedScheduleEvents = scheduleEvents.filter(
    (e) =>
      (e.type === 'practice' || e.type === 'scrimmage') &&
      !practices.some((p) => p.date === e.date)
  );

  let currentStartMinutes = parseTimeString(currentPlan?.startTime || '17:05');

  // Filter practices based on search and tag
  const filteredPractices = sortedPractices.filter((p) => {
    const term = dropdownSearchTerm.toLowerCase().trim();
    if (term) {
      const matchTitle = p.title.toLowerCase().includes(term);
      const matchWeek = (p.weekFolder || '').toLowerCase().includes(term);
      const matchDate = (p.date || '').toLowerCase().includes(term);
      const matchDay = (p.dayFolder || '').toLowerCase().includes(term);
      const matchFocus = (p.periods || []).some((per) =>
        (per.stations || []).some(
          (st) =>
            (st.name || '').toLowerCase().includes(term) ||
            (st.focus || '').toLowerCase().includes(term) ||
            (st.desc || '').toLowerCase().includes(term)
        )
      );
      if (!matchTitle && !matchWeek && !matchDate && !matchDay && !matchFocus) {
        return false;
      }
    }

    if (filterTag === 'this_week' && currentPlan) {
      return p.weekFolder === currentPlan.weekFolder;
    }

    if (filterTag === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      return (p.date || '9999-99-99') >= today;
    }

    if (filterTag === 'past') {
      const today = new Date().toISOString().split('T')[0];
      return (p.date || '0000-00-00') < today;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Action & Navigation Bar */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
          
          {/* Enhanced Practice Plan Selector & Quick Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Prev Practice Arrow */}
            <button
              type="button"
              disabled={!prevPractice}
              onClick={() => prevPractice && onSelectPractice(prevPractice.id)}
              title={prevPractice ? `Go to Previous: ${prevPractice.title}` : 'No earlier practices'}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                prevPractice
                  ? 'bg-slate-900 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-500 active:scale-95 cursor-pointer shadow-sm'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Primary Practice Hub Selector Trigger */}
            <button
              type="button"
              onClick={() => setIsPlanLibraryOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-800 hover:to-slate-750 border border-slate-700/90 hover:border-indigo-500/60 rounded-2xl text-xs font-bold text-slate-100 flex items-center gap-2.5 shadow-md transition-all active:scale-98 group cursor-pointer"
              title="Click to open Practice Plan Library & Folder Hub"
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/40 text-[9px] font-black text-indigo-300 uppercase tracking-wider">
                    {currentPlan?.weekFolder || 'Week 1'}
                  </span>
                  <span className="font-black text-slate-100 text-xs truncate max-w-[200px] sm:max-w-[260px]">
                    {currentPlan ? currentPlan.title : 'Select Practice Plan...'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{currentPlan?.date || 'No Date'}</span>
                  <span>•</span>
                  <span>{currentPlanPeriodsCount} Periods ({currentPlanDurationMinutes}m)</span>
                </div>
              </div>
              <div className="pl-1 border-l border-slate-700/80 text-slate-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider">Browse</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Next Practice Arrow */}
            <button
              type="button"
              disabled={!nextPractice}
              onClick={() => nextPractice && onSelectPractice(nextPractice.id)}
              title={nextPractice ? `Go to Next: ${nextPractice.title}` : 'No later practices'}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                nextPractice
                  ? 'bg-slate-900 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-500 active:scale-95 cursor-pointer shadow-sm'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Counter Chip */}
            {sortedPractices.length > 0 && (
              <span className="hidden sm:inline px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono font-bold text-slate-400">
                {currentIndex >= 0 ? `${currentIndex + 1} / ${sortedPractices.length}` : `${sortedPractices.length} Plans`}
              </span>
            )}

            {/* Practice Plan Management Buttons */}
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95 border border-amber-400/40 cursor-pointer"
                  title="Multi-Week & Multi-Day Practice Wizard"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Practice Wizard</span>
                </button>
                <button
                  onClick={onOpenNewPracticeModal}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Plan</span>
                </button>
                <button
                  onClick={onEditPracticeDetails}
                  title="Edit Date, Day, Year, Week title"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Details</span>
                </button>
                <button
                  onClick={onAutoNumberPractices}
                  title="Auto-number practice days sequentially"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>Auto #</span>
                </button>
                <button
                  onClick={onDeletePractice}
                  title="Delete this practice plan"
                  className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Templates & Print Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {userRole === 'admin' && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] font-black uppercase text-slate-300">
                  Template:
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-800 border border-slate-600 text-xs font-semibold text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="">-- Apply --</option>
                  {Object.keys(practiceTemplates).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onSaveCurrentAsTemplate}
                  title="Save current plan as template"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={onOpenTemplatesModal}
                  title="Manage templates"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Print font size */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl">
              <span className="text-[11px] font-black uppercase text-slate-300">Font:</span>
              <select
                value={printFontSize}
                onChange={(e) => onUpdatePrintFontSize(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-xs font-semibold text-slate-200 rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="9">9px (Tight)</option>
                <option value="10">10px (Default)</option>
                <option value="11">11px (Med)</option>
                <option value="12">12px (Large)</option>
                <option value="13">13px (XL)</option>
                <option value="14">14px (2XL)</option>
              </select>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={onAddPeriod}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            )}

            {onNavigateToSchedule && (
              <button
                type="button"
                onClick={onNavigateToSchedule}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                title="View in Season Schedule"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Season Schedule</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Practice Meta Bar */}
        {currentPlan && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 text-xs font-semibold text-slate-200">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Year
              </span>
              <input
                type="text"
                value={currentPlan.year || '2026'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('year', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Week Folder
              </span>
              <input
                type="text"
                value={currentPlan.weekFolder || 'Week 1'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('weekFolder', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Practice Date
              </span>
              <input
                type="date"
                value={currentPlan.date || ''}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('date', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Day of Week
              </span>
              <select
                value={currentPlan.day || 'Wednesday'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('day', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Start Time
              </span>
              <input
                type="time"
                value={currentPlan.startTime || '17:05'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('startTime', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* FULL VIEWPORT PRACTICE PLAN LIBRARY & FOLDER HUB MODAL */}
      {isPlanLibraryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsPlanLibraryOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                      Practice Plan Library &amp; Schedule Folders
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-[10px] font-black text-indigo-300 font-mono">
                      {practices.length} Plans
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse, search, and jump to any practice plan organized by season, week, and day.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanLibraryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search, View Mode, Filter Chips */}
            <div className="p-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dropdownSearchTerm}
                    onChange={(e) => setDropdownSearchTerm(e.target.value)}
                    placeholder="Search by plan title, week folder, date, day, or drill..."
                    className="w-full pl-9.5 pr-8 py-2 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                    autoFocus
                  />
                  {dropdownSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDropdownSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDropdownViewMode('tree')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      dropdownViewMode === 'tree'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>📁 Week Folders</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDropdownViewMode('flat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      dropdownViewMode === 'flat'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>🗂️ All Plans (Grid)</span>
                  </button>
                  {unplannedScheduleEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDropdownViewMode('schedule')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        dropdownViewMode === 'schedule'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-amber-400/80 hover:text-amber-300'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>📅 Unplanned ({unplannedScheduleEvents.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">Filter:</span>
                <button
                  type="button"
                  onClick={() => setFilterTag('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterTag === 'all'
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({sortedPractices.length})
                </button>
                {currentPlan && (
                  <button
                    type="button"
                    onClick={() => setFilterTag('this_week')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      filterTag === 'this_week'
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Current {currentPlan.weekFolder || 'Week'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFilterTag('upcoming')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterTag === 'upcoming'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTag('past')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterTag === 'past'
                      ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Past
                </button>

                {dropdownViewMode === 'tree' && (
                  <div className="ml-auto shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCollapsedTreeFolders({})}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allCollapsed: Record<string, boolean> = {};
                        Object.keys(practiceTree).forEach((yr) => {
                          allCollapsed[`yr_${yr}`] = true;
                          Object.keys(practiceTree[yr]).forEach((wk) => {
                            allCollapsed[`wk_${yr}_${wk}`] = true;
                          });
                        });
                        setCollapsedTreeFolders(allCollapsed);
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* MODE 1: HIERARCHICAL WEEK FOLDERS VIEW */}
              {dropdownViewMode === 'tree' && (
                <div className="space-y-4">
                  {Object.keys(practiceTree).length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No practice plans found. Click "+ New Plan" to create your first practice plan.
                    </div>
                  )}

                  {Object.keys(practiceTree).map((yr) => {
                    const yrKey = `yr_${yr}`;
                    const isYrCollapsed = collapsedTreeFolders[yrKey];
                    const weekKeys = Object.keys(practiceTree[yr]);
                    const totalSeasonPlans = weekKeys.reduce(
                      (acc, wk) => acc + practiceTree[yr][wk].length,
                      0
                    );

                    return (
                      <div
                        key={yr}
                        className="bg-slate-950/60 border border-slate-800 rounded-3xl p-3 sm:p-4 space-y-3"
                      >
                        {/* Year Folder Header */}
                        <div
                          onClick={() =>
                            setCollapsedTreeFolders({
                              ...collapsedTreeFolders,
                              [yrKey]: !isYrCollapsed,
                            })
                          }
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 cursor-pointer select-none transition-colors border border-slate-750"
                        >
                          <div className="flex items-center gap-2">
                            {isYrCollapsed ? (
                              <Folder className="w-4 h-4 text-amber-400" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-amber-400" />
                            )}
                            <span className="font-black text-sm text-indigo-300">
                              Season {yr}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-slate-400">
                              {totalSeasonPlans} Plans
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                              isYrCollapsed ? '-rotate-90' : ''
                            }`}
                          />
                        </div>

                        {/* Week Folders in this Year */}
                        {!isYrCollapsed && (
                          <div className="space-y-3 pl-1 sm:pl-2">
                            {weekKeys.map((wk) => {
                              const wkKey = `wk_${yr}_${wk}`;
                              const isWkCollapsed = collapsedTreeFolders[wkKey];
                              const weekPractices = practiceTree[yr][wk].filter((p) =>
                                filteredPractices.some((fp) => fp.id === p.id)
                              );

                              if (dropdownSearchTerm && weekPractices.length === 0) {
                                return null;
                              }

                              const totalWeekMinutes = practiceTree[yr][wk].reduce((acc, p) => {
                                return (
                                  acc +
                                  (p.periods || []).reduce(
                                    (pAcc, per) => pAcc + (per.time || 0),
                                    0
                                  )
                                );
                              }, 0);

                              const hasCurrentPlanInWeek = practiceTree[yr][wk].some(
                                (p) => p.id === currentPracticeId
                              );

                              return (
                                <div
                                  key={wk}
                                  className={`rounded-2xl border transition-all ${
                                    hasCurrentPlanInWeek
                                      ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                                      : 'bg-slate-900/80 border-slate-800'
                                  }`}
                                >
                                  {/* Week Folder Header */}
                                  <div
                                    onClick={() =>
                                      setCollapsedTreeFolders({
                                        ...collapsedTreeFolders,
                                        [wkKey]: !isWkCollapsed,
                                      })
                                    }
                                    className="flex items-center justify-between gap-2 p-3 cursor-pointer select-none hover:bg-slate-800/60 rounded-2xl transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      {isWkCollapsed ? (
                                        <Folder className="w-4 h-4 text-amber-400" />
                                      ) : (
                                        <FolderOpen className="w-4 h-4 text-amber-400" />
                                      )}
                                      <span className="font-black text-xs text-slate-100">
                                        {wk}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
                                        {practiceTree[yr][wk].length} {practiceTree[yr][wk].length === 1 ? 'Plan' : 'Plans'}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                                        ({totalWeekMinutes} min total)
                                      </span>
                                      {hasCurrentPlanInWeek && (
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-black text-indigo-300 uppercase tracking-wider">
                                          Active Week
                                        </span>
                                      )}
                                    </div>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isWkCollapsed ? '-rotate-90' : ''
                                      }`}
                                    />
                                  </div>

                                  {/* Plans inside this Week */}
                                  {!isWkCollapsed && (
                                    <div className="p-2 sm:p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {weekPractices.map((p) => {
                                        const isSelected = p.id === currentPracticeId;
                                        const periodCount = (p.periods || []).length;
                                        const totalMinutes = (p.periods || []).reduce(
                                          (acc, per) => acc + (per.time || 0),
                                          0
                                        );

                                        return (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                              onSelectPractice(p.id);
                                              setIsPlanLibraryOpen(false);
                                            }}
                                            className={`text-left p-3 rounded-2xl transition-all border flex items-start justify-between gap-3 group cursor-pointer ${
                                              isSelected
                                                ? 'bg-indigo-950 text-indigo-100 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                                                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border-slate-800 hover:border-slate-700'
                                            }`}
                                          >
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                {p.dayFolder && (
                                                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-750 text-[10px] font-bold text-amber-400">
                                                    {p.dayFolder}
                                                  </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {p.date || 'No date'}
                                                </span>
                                              </div>
                                              <div className="font-black text-slate-100 text-xs truncate group-hover:text-indigo-300 transition-colors">
                                                {p.title}
                                              </div>
                                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                                                <span>{p.startTime || '17:05'}</span>
                                                <span>•</span>
                                                <span>{periodCount} Periods</span>
                                                <span>•</span>
                                                <span className="text-emerald-400">{totalMinutes} min</span>
                                              </div>
                                            </div>
                                            <div className="shrink-0 pt-1">
                                              {isSelected ? (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                                                  <Check className="w-3.5 h-3.5" />
                                                  <span>Active</span>
                                                </div>
                                              ) : (
                                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Open →
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: ALL PLANS GRID CARDS VIEW */}
              {dropdownViewMode === 'flat' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredPractices.map((p) => {
                      const isSelected = p.id === currentPracticeId;
                      const periodCount = (p.periods || []).length;
                      const totalMinutes = (p.periods || []).reduce(
                        (acc, per) => acc + (per.time || 0),
                        0
                      );

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectPractice(p.id);
                            setIsPlanLibraryOpen(false);
                          }}
                          className={`p-4 rounded-3xl transition-all border flex flex-col justify-between gap-3 group cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/90 text-indigo-100 border-indigo-500 shadow-xl ring-2 ring-indigo-500/40'
                              : 'bg-slate-950/80 hover:bg-slate-800/90 text-slate-300 hover:text-slate-100 border-slate-800 hover:border-slate-700 shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-750 text-[10px] font-black text-indigo-300 uppercase">
                                {p.weekFolder || 'Week'}
                              </span>
                              {isSelected ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                                  <Check className="w-3 h-3" />
                                  Active Plan
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">
                                  {p.date || 'No Date'}
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-slate-100 text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                              {p.title}
                            </h3>

                            {p.dayFolder && (
                              <div className="text-[11px] font-bold text-amber-400/90 mb-2">
                                {p.dayFolder}
                              </div>
                            )}

                            {/* Preview period categories */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(p.periods || []).slice(0, 3).map((per, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[9px] font-semibold text-slate-400 truncate max-w-[110px]"
                                >
                                  {per.category}
                                </span>
                              ))}
                              {(p.periods || []).length > 3 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 text-[9px] font-bold text-slate-500">
                                  +{(p.periods || []).length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>{periodCount} Periods</span>
                            <span className="font-bold text-emerald-400">{totalMinutes} min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredPractices.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="font-bold text-sm text-slate-400">No practice plans matched your search.</p>
                      <p className="text-xs text-slate-500 mt-1">Try clearing filters or search keywords.</p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 3: UNPLANNED SCHEDULE PRACTICES VIEW */}
              {dropdownViewMode === 'schedule' && (
                <div className="space-y-3">
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-amber-300">Unplanned Schedule Practices Detected</div>
                      <p className="mt-0.5 text-amber-200/80">
                        These practice/scrimmage dates exist on your season schedule but don't have a practice plan attached yet. Click "+ Create Plan" to generate one instantly!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {unplannedScheduleEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                              Week {evt.week || 1}
                            </span>
                            <span className="font-black text-sm text-slate-100">{evt.title}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                            <span>📅 {evt.date}</span>
                            <span>•</span>
                            <span>⏰ {evt.time || '17:05'}</span>
                            {evt.location && (
                              <>
                                <span>•</span>
                                <span>📍 {evt.location}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {onQuickCreateFromSchedule && (
                          <button
                            type="button"
                            onClick={() => {
                              onQuickCreateFromSchedule(evt);
                              setIsPlanLibraryOpen(false);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Create Plan</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlanLibraryOpen(false);
                        onOpenNewPracticeModal();
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Plan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlanLibraryOpen(false);
                        setIsWizardOpen(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Practice Wizard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAutoNumberPractices();
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 font-bold text-xs rounded-xl border border-slate-750 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Hash className="w-3.5 h-3.5 text-sky-400" />
                      <span>Auto # Days</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsPlanLibraryOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Sheet Title Header (Shown only on Print) */}
      <div className="hidden print:block mb-3 border-b-2 border-black pb-2 text-center">
        <h1 className="font-extrabold text-base uppercase text-black">
          Mahopac 10U Practice Itinerary &amp; Script
        </h1>
        <p className="text-xs font-bold text-black mt-0.5">
          {currentPlan?.title} | Date: {currentPlan?.date} ({currentPlan?.day}) | Start: {currentPlan?.startTime} | {currentPlan?.weekFolder}
        </p>
      </div>

      {/* Main Practice Schedule Table */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl overflow-hidden">
        <table className="w-full border-collapse practice-table text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-200 font-black uppercase text-[11px] border-b border-slate-700">
              <th className="py-3 px-3 text-left w-24 sm:w-28 print:w-[14%]">Time / Period</th>
              <th className="py-3 px-3 text-left w-32 sm:w-36 print:w-[16%]">Category / Format</th>
              <th className="py-3 px-3.5 text-left print:w-[42%]">Stations / Drills</th>
              <th className="py-3 px-2.5 text-left w-28 sm:w-32 print:w-[13%]">Coaches</th>
              <th className="py-3 px-3 text-left w-36 sm:w-40 print:w-[15%]">Focus / Cues</th>
              {userRole === 'admin' && (
                <th className="py-3 px-2 text-center w-20 print:hidden">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {(currentPlan?.plan || []).map((row, pIdx) => {
              const rowDuration = Number(row.time) || 0;
              const periodEndMin = currentStartMinutes + rowDuration;
              const timeString = `${formatTimeMinutes(currentStartMinutes)} - ${formatTimeMinutes(periodEndMin)}`;
              const isRotating = row.format === 'rotating';

              const stationsList =
                row.stations && row.stations.length > 0
                  ? row.stations
                  : [{ name: '', desc: '', coach: '', focus: '' }];
              const numStations = stationsList.length;
              const stationDuration =
                isRotating && numStations > 0
                  ? rowDuration / numStations
                  : rowDuration;

              const categoryDrills = getDrillsForCategory(row.category);

              const element = stationsList.map((station, sIdx) => {
                const isFirstStationInPeriod = sIdx === 0;
                const coachPopupId = `coach_popup_${pIdx}_${sIdx}`;
                const isCoachPopupOpen = activeCoachPopup === coachPopupId;

                const assignedCoachTokens = (station.coach || '')
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean);

                const stationStartMin =
                  currentStartMinutes + sIdx * stationDuration;
                const stationEndMin = stationStartMin + stationDuration;

                return (
                  <tr
                    key={`${pIdx}_${sIdx}`}
                    className={`border-b border-slate-700/70 ${
                      pIdx % 2 === 0 ? 'bg-slate-800/80' : 'bg-slate-850/60 bg-slate-800/50'
                    }`}
                  >
                    {/* Time / Period Cell (Rowspan) */}
                    {isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-3.5 align-top border-r border-slate-700 font-bold"
                      >
                        <div className="text-xs font-black text-indigo-300 uppercase tracking-tight print:hidden">
                          Period {pIdx + 1}
                        </div>
                        <div className="hidden print:block text-xs font-black text-slate-950 uppercase tracking-tight">
                          Period {pIdx + 1}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 print:hidden">
                          <input
                            type="number"
                            value={row.time}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodTime(
                                pIdx,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-100"
                          />
                          <span className="text-[11px] text-slate-400 font-medium">mins</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-amber-300 mt-1.5 font-mono print:hidden">
                          {timeString}
                        </div>
                        <div className="hidden print:block text-[11px] font-extrabold text-slate-900 font-mono mt-0.5">
                          {timeString}
                        </div>
                        <div className="hidden print:block text-[10px] font-bold text-slate-600 mt-0.5">
                          ({row.time} min)
                        </div>
                      </td>
                    )}

                    {/* Category / Format Cell (Rowspan) */}
                    {isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-3.5 align-top border-r border-slate-700 space-y-2"
                      >
                        <div className="print:hidden">
                          <select
                            value={row.category}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodCategory(pIdx, e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200"
                          >
                            {cascadingDrills.map((folder) => (
                              <option key={folder.name} value={folder.name}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden print:block font-black text-slate-950 text-xs uppercase tracking-tight">
                          {row.category}
                        </div>

                        {/* Format selector (Static vs Rotating) */}
                        <div className="print:hidden">
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-wider">
                            Station Mode:
                          </label>
                          <select
                            value={row.format || 'static'}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodFormat(
                                pIdx,
                                e.target.value as 'static' | 'rotating'
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-300"
                          >
                            <option value="static">Static Group</option>
                            <option value="rotating">Rotating Stations</option>
                          </select>
                        </div>
                        <div className="hidden print:block text-[10px] font-bold text-slate-600 mt-0.5">
                          {isRotating ? 'Rotating Stations' : 'Full Group'}
                        </div>
                      </td>
                    )}

                    {/* Station / Drill Title & Instructions */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-700 space-y-2">
                      {isRotating && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10.5px] font-black border border-indigo-500/30 print:bg-slate-100 print:text-slate-900 print:border-slate-300 print:py-0.5 print:px-1.5">
                          <Clock className="w-3 h-3 print:hidden" />
                          <span className="font-mono print:text-[9.5px]">
                            Station {sIdx + 1}: {formatTimeMinutes(stationStartMin)} -{' '}
                            {formatTimeMinutes(stationEndMin)} (
                            {Math.round(stationDuration)} min)
                          </span>
                        </div>
                      )}

                      {/* Drill Quick Select Dropdown */}
                      <div className="print:hidden">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const found = categoryDrills.find(
                              (d) => d.name === e.target.value
                            );
                            if (found) {
                              onSelectDrillForStation(pIdx, sIdx, found);
                              e.target.value = '';
                            }
                          }}
                          className="w-full bg-slate-900/90 border border-slate-700 hover:border-slate-600 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-300"
                        >
                          <option value="">-- Choose Drill from Library --</option>
                          {categoryDrills.map((d, dIdx) => (
                            <option key={dIdx} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Station Title */}
                      <input
                        type="text"
                        value={station.name || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'name', e.target.value)
                        }
                        placeholder="Drill / Group Name"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-100 focus:ring-1 focus:ring-indigo-500 disabled:bg-transparent disabled:border-transparent print:hidden"
                      />

                      {/* Station Details */}
                      <textarea
                        rows={2}
                        value={station.desc || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'desc', e.target.value)
                        }
                        placeholder="Instructions, alignments, cone layout..."
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-200 leading-relaxed focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                      />

                      {/* Print view */}
                      <div className="hidden print:block">
                        <div className="text-[11px] font-black text-slate-950 uppercase tracking-tight">
                          {station.name || 'Station / Drill'}
                        </div>
                        {station.desc && (
                          <div className="text-[10px] font-medium text-slate-800 mt-1 whitespace-pre-wrap leading-snug">
                            {station.desc}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Coaches Column */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-700 relative">
                      <textarea
                        rows={2}
                        value={station.coach || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'coach', e.target.value)
                        }
                        placeholder="Type coach names..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-100 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                      />

                      <div
                        onClick={() =>
                          setActiveCoachPopup(
                            isCoachPopupOpen ? null : coachPopupId
                          )
                        }
                        className="text-[10.5px] text-indigo-400 font-black cursor-pointer mt-1.5 hover:underline print:hidden flex items-center gap-1"
                      >
                        <span>Select Coaches</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </div>

                      <div className="hidden print:block text-[10.5px] font-bold text-slate-950 leading-snug">
                        {station.coach || '—'}
                      </div>

                      {/* Coach Multi-select Popup */}
                      {isCoachPopupOpen && (
                        <div
                          className="absolute left-0 top-full mt-1.5 w-60 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 print:hidden backdrop-blur-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                            <span className="text-[11px] font-black text-slate-200">
                              Assigned Staff
                            </span>
                            <button
                              onClick={() => setActiveCoachPopup(null)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {savedCoaches.map((coachName) => {
                              const isChecked =
                                assignedCoachTokens.includes(coachName) ||
                                assignedCoachTokens.includes(`Coach ${coachName}`);

                              return (
                                <div
                                  key={coachName}
                                  className="flex items-center justify-between p-1.5 hover:bg-slate-700 rounded-lg"
                                >
                                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let updatedTokens = [...assignedCoachTokens];
                                        if (e.target.checked) {
                                          if (!updatedTokens.includes(coachName))
                                            updatedTokens.push(coachName);
                                        } else {
                                          updatedTokens = updatedTokens.filter(
                                            (t) =>
                                              t !== coachName &&
                                              t !== `Coach ${coachName}`
                                          );
                                        }
                                        onUpdateStation(
                                          pIdx,
                                          sIdx,
                                          'coach',
                                          updatedTokens.join(', ')
                                        );
                                      }}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                                    />
                                    <span className="text-xs font-bold text-slate-200">
                                      {coachName}
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Remove "${coachName}" from the team coach list?`)) {
                                        onDeleteSavedCoach(coachName);
                                      }
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                                    title={`Delete ${coachName} from team list`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-700 text-center">
                            <button
                              onClick={() => {
                                const name = prompt('Enter new Coach Name:');
                                if (name && name.trim())
                                  onAddNewSavedCoach(name.trim());
                              }}
                              className="w-full py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Add New Coach</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Coaching Focus Column */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-700">
                      <textarea
                        rows={2}
                        value={station.focus || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'focus', e.target.value)
                        }
                        placeholder="Key coaching cues & assignments..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-semibold text-slate-200 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                      />
                      <div className="hidden print:block text-[10.5px] font-medium text-slate-900 whitespace-pre-wrap leading-snug">
                        {station.focus || '—'}
                      </div>
                    </td>

                    {/* Period Actions (Only on first station row in the period) */}
                    {userRole === 'admin' && isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-2 align-top text-center print:hidden"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onMovePeriod(pIdx, -1)}
                              title="Move Period Up"
                              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-slate-100"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMovePeriod(pIdx, 1)}
                              title="Move Period Down"
                              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-slate-100"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => onAddStationToPeriod(pIdx)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-sky-300 text-[10px] font-bold rounded-lg flex items-center gap-0.5 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 text-sky-400" />
                            <span>Station</span>
                          </button>
                          <button
                            onClick={() => onRemovePeriod(pIdx)}
                            title="Delete Period"
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              });

              currentStartMinutes = periodEndMin;
              return element;
            })}
          </tbody>
        </table>
      </div>

      {/* Practice Cadence & Multi-Week Wizard */}
      <PracticeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        practiceTemplates={practiceTemplates}
        currentWeek={currentPlan?.weekFolder ? currentPlan.weekFolder.replace('Week ', '') : '1'}
        onGenerate={(res) => {
          if (onPracticeWizardGenerate) {
            onPracticeWizardGenerate(res);
          }
        }}
      />
    </div>
  );
};
