import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Ban,
  RotateCcw,
  AlertTriangle,
  Users,
  CheckCircle2,
} from 'lucide-react';
import {
  PracticePlan,
  PracticePeriod,
  PracticeStation,
  DrillFolder,
  DrillItem,
  UserRole,
  ScheduleEvent,
} from '../types';
import { formatTimeMinutes, parseTimeString } from '../services/storageService';
import { PracticeWizardModal, PracticeWizardGeneratedResult } from './PracticeWizardModal';
import {
  getPracticeSequenceMap,
  calculateWeekFolderForDate,
  getDayOfWeekForDate,
  getFormattedDayFolder,
} from '../utils/practiceUtils';

interface PracticePlanViewProps {
  practices: PracticePlan[];
  currentPracticeId: string | null;
  practiceTemplates: Record<string, PracticePeriod[]>;
  cascadingDrills: DrillFolder[];
  savedCoaches: string[];
  printFontSize: string;
  userRole: UserRole;
  scheduleEvents?: ScheduleEvent[];
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
  onTogglePracticeCancelled?: (practiceId: string, isCancelled?: boolean, reason?: string) => void;
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
  onTogglePracticeCancelled,
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
  const [filterTag, setFilterTag] = useState<'all' | 'active_only' | 'cancelled' | 'this_week' | 'upcoming' | 'past'>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeCoachPopup, setActiveCoachPopup] = useState<string | null>(null);
  const [coachSearchTerm, setCoachSearchTerm] = useState('');
  const [collapsedTreeFolders, setCollapsedTreeFolders] = useState<Record<string, boolean>>({});

  const currentPlan =
    practices.find((p) => p.id === currentPracticeId) || practices[0];

  // Calculate dynamic practice sequence map across all practices
  const practiceSeqMap = getPracticeSequenceMap(practices);
  const currentSeq = currentPlan
    ? practiceSeqMap[currentPlan.id] || {
        practiceNumber: 1,
        isCancelled: Boolean(currentPlan.isCancelled),
        totalActivePractices: practices.filter((p) => !p.isCancelled).length,
        totalCancelledPractices: practices.filter((p) => p.isCancelled).length,
        isPast: false,
        displayDayLabel: currentPlan.isCancelled ? 'Cancelled' : 'Day 1',
        fullBadgeLabel: currentPlan.isCancelled ? 'Cancelled (Not Counted)' : 'Practice Day #1',
      }
    : null;

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

  // ESC key listener to close modal & popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCoachPopup) {
          setActiveCoachPopup(null);
        } else if (isPlanLibraryOpen) {
          setIsPlanLibraryOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlanLibraryOpen, activeCoachPopup]);

  // Helper to flat list drills from matching category or all
  const getDrillsForCategory = (catName: string): DrillItem[] => {
    const flat: DrillItem[] = [];
    const cleanCat = (catName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const traverse = (nodeList: DrillFolder[]) => {
      nodeList.forEach((n) => {
        const cleanNode = (n.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (
          cleanCat &&
          (cleanNode === cleanCat ||
            cleanNode.includes(cleanCat) ||
            cleanCat.includes(cleanNode))
        ) {
          if (n.drills) flat.push(...n.drills);
        }
        if (n.subfolders) traverse(n.subfolders);
      });
    };

    traverse(cascadingDrills);
    return flat;
  };

  // Group all drills from cascadingDrills by folder hierarchy for quick dropdown select
  const allCategorizedDrills = useMemo(() => {
    const groups: { category: string; drills: DrillItem[] }[] = [];
    const collect = (folder: DrillFolder, prefix = '') => {
      const fullName = prefix ? `${prefix} ➔ ${folder.name}` : folder.name;
      if (folder.drills && folder.drills.length > 0) {
        groups.push({ category: fullName, drills: folder.drills });
      }
      if (folder.subfolders) {
        folder.subfolders.forEach((sf) => collect(sf, fullName));
      }
    };
    cascadingDrills.forEach((f) => collect(f));
    return groups;
  }, [cascadingDrills]);

  // Build hierarchical year -> week -> practice tree
  const practiceTree: Record<string, Record<string, PracticePlan[]>> = {};
  const sortedPractices = [...practices].sort((a, b) => {
    const dateA = a.date || '1970-01-01';
    const dateB = b.date || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
  });

  sortedPractices.forEach((p) => {
    const yr = p.year || '2026';
    const wk = p.weekFolder || 'Week 1';
    if (!practiceTree[yr]) practiceTree[yr] = {};
    if (!practiceTree[yr][wk]) practiceTree[yr][wk] = [];
    practiceTree[yr][wk].push(p);
  });

  const sortWeekKeys = (keys: string[]) => {
    return [...keys].sort((a, b) => {
      const getWeight = (w: string) => {
        const lower = w.toLowerCase();
        if (lower.includes('pre-1') || lower.includes('preseason wk 1') || lower.includes('preseason week 1')) return 1;
        if (lower.includes('pre-2') || lower.includes('preseason wk 2') || lower.includes('preseason week 2')) return 2;
        if (lower.includes('pre-3') || lower.includes('preseason wk 3')) return 3;
        if (lower.includes('pre-4') || lower.includes('preseason wk 4')) return 4;
        const numMatch = w.match(/\d+/);
        if (numMatch) return 10 + parseInt(numMatch[0], 10);
        if (lower.includes('playoff')) return 90;
        if (lower.includes('champ')) return 95;
        return 50;
      };
      return getWeight(a) - getWeight(b);
    });
  };

  const currentIndex = sortedPractices.findIndex((p) => p.id === currentPlan?.id);
  const prevPractice = currentIndex > 0 ? sortedPractices[currentIndex - 1] : null;
  const nextPractice =
    currentIndex >= 0 && currentIndex < sortedPractices.length - 1
      ? sortedPractices[currentIndex + 1]
      : null;

  const currentPlanPeriods = Array.isArray(currentPlan?.plan)
    ? currentPlan.plan
    : Array.isArray(currentPlan?.periods)
    ? currentPlan.periods
    : [];
  const currentPlanPeriodsCount = currentPlanPeriods.length;
  const currentPlanDurationMinutes = currentPlanPeriods.reduce(
    (acc, per) => acc + (Number(per?.time) || 0),
    0
  );

  // Unplanned schedule events (practices/scrimmages without a created plan)
  const unplannedScheduleEvents = scheduleEvents.filter(
    (e) =>
      (e.type === 'practice' || e.type === 'scrimmage') &&
      !practices.some((p) => p && p.date === e.date)
  );

  let currentStartMinutes = parseTimeString(currentPlan?.startTime || '17:05');

  // Filter practices based on search and tag
  const filteredPractices = sortedPractices.filter((p) => {
    if (!p) return false;
    const term = dropdownSearchTerm.toLowerCase().trim();
    if (term) {
      const seq = practiceSeqMap[p.id];
      const matchTitle = (p.title || '').toLowerCase().includes(term);
      const matchWeek = (p.weekFolder || '').toLowerCase().includes(term);
      const matchDate = (p.date || '').toLowerCase().includes(term);
      const matchDay = (p.dayFolder || p.day || '').toLowerCase().includes(term);
      const matchSeq = seq?.practiceNumber ? `practice #${seq.practiceNumber}`.includes(term) || `day ${seq.practiceNumber}`.includes(term) : false;
      const matchFocus = (p.plan || p.periods || []).some((per) =>
        per &&
        Array.isArray(per.stations) &&
        per.stations.some(
          (st) =>
            st &&
            (((st.name || '').toLowerCase().includes(term)) ||
              ((st.focus || '').toLowerCase().includes(term)) ||
              ((st.desc || '').toLowerCase().includes(term)))
        )
      );
      if (!matchTitle && !matchWeek && !matchDate && !matchDay && !matchSeq && !matchFocus) {
        return false;
      }
    }

    if (filterTag === 'active_only') {
      return !p.isCancelled;
    }

    if (filterTag === 'cancelled') {
      return Boolean(p.isCancelled);
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

  const handleToggleCancel = () => {
    if (!currentPlan) return;
    if (onTogglePracticeCancelled) {
      if (!currentPlan.isCancelled) {
        const reason = prompt('Optional cancellation reason (e.g. Weather, Lightning, Field Conflict):', 'Weather / Field Conflict');
        onTogglePracticeCancelled(currentPlan.id, true, reason || 'Cancelled');
      } else {
        onTogglePracticeCancelled(currentPlan.id, false, '');
      }
    } else {
      // Fallback to onUpdateMeta
      const nextState = !currentPlan.isCancelled;
      onUpdateMeta('isCancelled', nextState);
    }
  };

  return (
    <div className="space-y-5 pb-80 sm:pb-96 min-h-[calc(100vh-120px)] print:space-y-0 print:pb-0 print:min-h-0 print:m-0 print:p-0">
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
              className={`px-3.5 py-2 border rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md transition-all active:scale-98 group cursor-pointer ${
                currentPlan?.isCancelled
                  ? 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-500/50 text-rose-100'
                  : 'bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-800 hover:to-slate-750 border-slate-700/90 hover:border-indigo-500/60 text-slate-100'
              }`}
              title="Click to open Practice Plan Library & Folder Hub"
            >
              <div
                className={`p-1.5 rounded-lg transition-all shadow-inner ${
                  currentPlan?.isCancelled
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                }`}
              >
                {currentPlan?.isCancelled ? <Ban className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/40 text-[9px] font-black text-indigo-300 uppercase tracking-wider">
                    {currentPlan?.weekFolder || 'Week 1'}
                  </span>
                  {currentSeq?.isCancelled ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-900/80 border border-rose-500/50 text-[9px] font-black text-rose-300 uppercase tracking-wider">
                      CANCELLED
                    </span>
                  ) : currentSeq?.practiceNumber ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                      Day {currentSeq.practiceNumber}
                    </span>
                  ) : null}
                  <span className={`font-black text-xs truncate max-w-[180px] sm:max-w-[240px] ${currentPlan?.isCancelled ? 'line-through text-rose-200/80' : 'text-slate-100'}`}>
                    {currentPlan ? currentPlan.title : 'Select Practice Plan...'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{currentPlan?.date || 'No Date'}</span>
                  <span>•</span>
                  <span>{currentPlan?.day || getDayOfWeekForDate(currentPlan?.date)}</span>
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

            {/* Practice Day Counter Badge (Dynamic & State-Aware) */}
            {currentSeq && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold shadow-inner ${
                  currentSeq.isCancelled
                    ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                    : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
                }`}
                title={
                  currentSeq.isCancelled
                    ? 'Cancelled practice: Excluded from cumulative practice day held count.'
                    : `Held Practice #${currentSeq.practiceNumber} of ${currentSeq.totalActivePractices} active practices in the season.`
                }
              >
                {currentSeq.isCancelled ? (
                  <>
                    <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-black text-rose-300 uppercase tracking-tight text-[11px]">
                      Cancelled (Not Counted)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px]">
                      Day {currentSeq.practiceNumber}
                    </span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      Practice #{currentSeq.practiceNumber} Held
                    </span>
                  </>
                )}
              </div>
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
                  title="Auto-number non-cancelled practice days sequentially by date"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>Auto # Days</span>
                </button>

                {/* Cancel / Reinstate Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleCancel}
                  title={
                    currentPlan?.isCancelled
                      ? 'Reinstate this practice (will re-enter practice day numbering sequence)'
                      : 'Cancel this practice (will exclude from practice day count and automatically re-number remaining practices)'
                  }
                  className={`px-3 py-2 font-bold text-xs rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentPlan?.isCancelled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border-slate-700 hover:border-rose-500/50'
                  }`}
                >
                  {currentPlan?.isCancelled ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reinstate Practice</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Practice</span>
                    </>
                  )}
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
                <option value="9">9px (Compact)</option>
                <option value="10">10px (Small)</option>
                <option value="11">11px (Medium)</option>
                <option value="12">12px (Large - Default)</option>
                <option value="13">13px (XL)</option>
                <option value="14">14px (2XL - Big)</option>
                <option value="15">15px (3XL)</option>
                <option value="16">16px (Jumbo)</option>
              </select>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={onAddPeriod}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            )}

            {onNavigateToSchedule && (
              <button
                type="button"
                onClick={onNavigateToSchedule}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="View in Season Schedule"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Season Schedule</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Cancellation Alert Banner */}
        {currentPlan?.isCancelled && (
          <div className="bg-rose-950/80 border border-rose-500/60 rounded-2xl p-3.5 text-xs text-rose-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-rose-100 uppercase tracking-tight">
                  This practice is marked as CANCELLED
                </div>
                <div className="text-[11px] text-rose-300/90 font-medium">
                  {currentPlan.cancellationReason
                    ? `Reason: ${currentPlan.cancellationReason}. `
                    : ''}
                  This practice is excluded from the cumulative practice day count. Subsequent practices are automatically re-numbered.
                </div>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                type="button"
                onClick={handleToggleCancel}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reinstate</span>
              </button>
            )}
          </div>
        )}

        {/* Practice Meta Bar */}
        {currentPlan && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 text-xs font-semibold text-slate-200">
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
                onChange={(e) => {
                  const newDate = e.target.value;
                  onUpdateMeta('date', newDate);
                  if (newDate) {
                    const derivedDay = getDayOfWeekForDate(newDate);
                    const derivedDayFolder = getFormattedDayFolder(newDate);
                    const derivedWeek = calculateWeekFolderForDate(newDate, scheduleEvents);
                    onUpdateMeta('day', derivedDay);
                    onUpdateMeta('dayFolder', derivedDayFolder);
                    onUpdateMeta('weekFolder', derivedWeek);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Day of Week
              </span>
              <select
                value={currentPlan.day || getDayOfWeekForDate(currentPlan.date)}
                disabled={userRole !== 'admin'}
                onChange={(e) => {
                  const newDay = e.target.value;
                  onUpdateMeta('day', newDay);
                  onUpdateMeta('dayFolder', newDay);
                }}
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

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Practice Status
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  disabled={userRole !== 'admin'}
                  onClick={handleToggleCancel}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1 ${
                    currentPlan.isCancelled
                      ? 'bg-rose-950 border-rose-500/60 text-rose-300 hover:bg-rose-900'
                      : 'bg-emerald-950 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                  }`}
                >
                  {currentPlan.isCancelled ? (
                    <>
                      <Ban className="w-3 h-3" />
                      <span>Cancelled</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </>
                  )}
                </button>
              </div>
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
                      {practices.filter((p) => !p.isCancelled).length} Active / {practices.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse and jump to any practice plan. Practices are dynamically numbered sequentially by date (excluding cancellations).
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
                    placeholder="Search by practice #, title, week folder, date, day, or drill..."
                    className="w-full pl-9.5 pr-8 py-2 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                    autoFocus
                  />
                  {dropdownSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDropdownSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
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
                <button
                  type="button"
                  onClick={() => setFilterTag('active_only')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterTag === 'active_only'
                      ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/60'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Active ({practices.filter((p) => !p.isCancelled).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTag('cancelled')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterTag === 'cancelled'
                      ? 'bg-rose-600/40 text-rose-200 border border-rose-500/60'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Cancelled ({practices.filter((p) => p.isCancelled).length})
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
                      ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
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

                  {Object.keys(practiceTree).sort().reverse().map((yr) => {
                    const yrKey = `yr_${yr}`;
                    const isYrCollapsed = collapsedTreeFolders[yrKey];
                    const weekKeys = sortWeekKeys(Object.keys(practiceTree[yr]));
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
                                const pList = p.plan || p.periods || [];
                                return (
                                  acc +
                                  pList.reduce(
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
                                        const pList = p.plan || p.periods || [];
                                        const periodCount = pList.length;
                                        const totalMinutes = pList.reduce(
                                          (acc, per) => acc + (per.time || 0),
                                          0
                                        );
                                        const seq = practiceSeqMap[p.id];

                                        return (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                              onSelectPractice(p.id);
                                              setIsPlanLibraryOpen(false);
                                            }}
                                            className={`text-left p-3 rounded-2xl transition-all border flex items-start justify-between gap-3 group cursor-pointer ${
                                              p.isCancelled
                                                ? 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/30'
                                                : isSelected
                                                ? 'bg-indigo-950 text-indigo-100 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                                                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border-slate-800 hover:border-slate-700'
                                            }`}
                                          >
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                {seq?.isCancelled ? (
                                                  <span className="px-2 py-0.5 rounded-md bg-rose-900 border border-rose-500/60 text-[9px] font-black text-rose-200 uppercase tracking-tight">
                                                    🚫 Cancelled
                                                  </span>
                                                ) : seq?.practiceNumber ? (
                                                  <span className="px-2 py-0.5 rounded-md bg-indigo-900/80 border border-indigo-500/50 text-[10px] font-black text-indigo-300">
                                                    Day {seq.practiceNumber} • Prac #{seq.practiceNumber}
                                                  </span>
                                                ) : null}

                                                {p.dayFolder && (
                                                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-750 text-[10px] font-bold text-amber-400">
                                                    {p.dayFolder}
                                                  </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {p.date || 'No date'}
                                                </span>
                                              </div>
                                              <div className={`font-black text-xs truncate group-hover:text-indigo-300 transition-colors ${p.isCancelled ? 'line-through text-rose-300/80' : 'text-slate-100'}`}>
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
                      const pList = p.plan || p.periods || [];
                      const periodCount = pList.length;
                      const totalMinutes = pList.reduce(
                        (acc, per) => acc + (per.time || 0),
                        0
                      );
                      const seq = practiceSeqMap[p.id];

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectPractice(p.id);
                            setIsPlanLibraryOpen(false);
                          }}
                          className={`p-4 rounded-3xl transition-all border flex flex-col justify-between gap-3 group cursor-pointer ${
                            p.isCancelled
                              ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-500/40 shadow-sm'
                              : isSelected
                              ? 'bg-indigo-950/90 text-indigo-100 border-indigo-500 shadow-xl ring-2 ring-indigo-500/40'
                              : 'bg-slate-950/80 hover:bg-slate-800/90 text-slate-300 hover:text-slate-100 border-slate-800 hover:border-slate-700 shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-750 text-[10px] font-black text-indigo-300 uppercase">
                                  {p.weekFolder || 'Week'}
                                </span>
                                {seq?.isCancelled ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-900/80 border border-rose-500/50 text-[9px] font-black text-rose-200 uppercase">
                                    Cancelled
                                  </span>
                                ) : seq?.practiceNumber ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-indigo-900/80 border border-indigo-500/40 text-[9px] font-black text-indigo-200">
                                    Day {seq.practiceNumber}
                                  </span>
                                ) : null}
                              </div>
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

                            <h3 className={`font-black text-sm mb-1 group-hover:text-indigo-300 transition-colors ${p.isCancelled ? 'line-through text-rose-300/80' : 'text-slate-100'}`}>
                              {p.title}
                            </h3>

                            {p.dayFolder && (
                              <div className="text-[11px] font-bold text-amber-400/90 mb-2">
                                {p.dayFolder}
                              </div>
                            )}

                            {/* Preview period categories */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pList.slice(0, 3).map((per, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[9px] font-semibold text-slate-400 truncate max-w-[110px]"
                                >
                                  {per.category}
                                </span>
                              ))}
                              {pList.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 text-[9px] font-bold text-slate-500">
                                  +{pList.length - 3} more
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
                            <span>⏰ {evt.startTime || evt.time || '17:05'}</span>
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

      {/* Printable Sheet Title Header */}
      <div className="hidden print:block mb-2.5 border-b-2 border-black pb-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="font-black text-lg uppercase tracking-tight text-black">
            Mahopac 10U Practice Plan
          </h1>
          <div className="text-sm font-black text-black">
            {currentSeq?.isCancelled
              ? `[CANCELLED SESSION]`
              : currentSeq?.practiceNumber
              ? `Day #${currentSeq.practiceNumber} (Prac #${currentSeq.practiceNumber})`
              : ''}
            {' • '}
            {currentPlan?.title}
          </div>
        </div>
        <div className="text-xs font-bold text-slate-800 flex items-center justify-between mt-0.5">
          <span>Date: {currentPlan?.date} ({currentPlan?.day || getDayOfWeekForDate(currentPlan?.date)}) • Time: {currentPlan?.startTime || '5:05 PM'}{currentPlan?.endTime ? ` - ${currentPlan.endTime}` : ''} • Location: {currentPlan?.location || 'Crane Road'}</span>
          <span>{currentPlan?.weekFolder}</span>
        </div>
      </div>

      {/* Main Practice Schedule Table */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl overflow-visible print:bg-transparent print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse practice-table text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-black uppercase text-[11px] border-b border-slate-700 print:bg-slate-100 print:text-black">
                <th className="py-3 px-3 text-left w-24 sm:w-28 print:w-[13%]">Time / Period</th>
                <th className="py-3 px-3 text-left w-28 sm:w-32 print:w-[10%]">Category</th>
                <th className="py-3 px-3.5 text-left print:w-[49%]">Stations / Drills</th>
                <th className="py-3 px-2.5 text-left w-28 sm:w-32 print:w-[11%]">Coaches</th>
                <th className="py-3 px-3 text-left w-36 sm:w-40 print:w-[17%]">Focus / Cues</th>
                {userRole === 'admin' && (
                  <th className="py-3 px-2 text-center w-20 print:hidden">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(currentPlanPeriods || [])
                .filter((row): row is PracticePeriod => Boolean(row && typeof row === 'object'))
                .map((row, pIdx, allPeriods) => {
                  const rowDuration = Number(row.time) || 0;
                  const periodEndMin = currentStartMinutes + rowDuration;
                  const timeString = `${formatTimeMinutes(currentStartMinutes)} - ${formatTimeMinutes(periodEndMin)}`;
                  const isRotating = row.format === 'rotating';

                  const rawStations = Array.isArray(row.stations) ? row.stations : [];
                  const validStations = rawStations.filter(
                    (st): st is PracticeStation => Boolean(st && typeof st === 'object')
                  );
                  const stationsList =
                    validStations.length > 0
                      ? validStations
                      : [{ name: '', desc: '', coach: '', focus: '' }];
                  const numStations = stationsList.length > 0 ? stationsList.length : 1;
                  const stationDuration =
                    isRotating && numStations > 0
                      ? rowDuration / numStations
                      : rowDuration;

                  const categoryDrills = getDrillsForCategory(row.category);
                  const isNearBottom = pIdx >= allPeriods.length - 2;

                  const element = stationsList.map((station, sIdx) => {
                    const safeStation = station || { name: '', desc: '', coach: '', focus: '' };
                    const isFirstStationInPeriod = sIdx === 0;
                    const coachPopupId = `coach_popup_${pIdx}_${sIdx}`;
                    const isCoachPopupOpen = activeCoachPopup === coachPopupId;

                    const assignedCoachTokens = (safeStation.coach || '')
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
                            <div className="hidden print:block font-black text-black uppercase tracking-tight leading-tight print-text-title">
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
                            <div className="hidden print:block font-extrabold text-black font-mono mt-1 leading-tight print-text-body">
                              {timeString}
                            </div>
                            <div className="hidden print:block font-bold text-slate-700 mt-0.5 leading-none print-text-sub">
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
                            <div className="hidden print:block font-black text-black uppercase tracking-tight leading-tight break-words print-text-title">
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
                            <div className="hidden print:block font-bold text-slate-700 mt-1 leading-none print-text-sub">
                              {isRotating ? 'Rotating' : 'Full Group'}
                            </div>
                          </td>
                        )}

                        {/* Station / Drill Title & Instructions */}
                        <td className="py-3 px-3.5 align-top border-r border-slate-700 space-y-2 print:space-y-1">
                          {isRotating && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10.5px] font-black border border-indigo-500/30 print:bg-slate-200 print:text-black print:border-slate-400 print:py-0.5 print:px-1.5 print:mb-1 print-text-badge">
                              <Clock className="w-3 h-3 print:hidden" />
                              <span className="font-mono print:font-bold">
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
                              disabled={userRole !== 'admin'}
                              onChange={(e) => {
                                const drillName = e.target.value;
                                if (!drillName) return;
                                // Check in categoryDrills first, then allCategorizedDrills
                                let found = categoryDrills.find((d) => d.name === drillName);
                                if (!found) {
                                  for (const grp of allCategorizedDrills) {
                                    found = grp.drills.find((d) => d.name === drillName);
                                    if (found) break;
                                  }
                                }
                                if (found) {
                                  onSelectDrillForStation(pIdx, sIdx, found);
                                  e.target.value = '';
                                }
                              }}
                              className="w-full bg-slate-900/90 border border-slate-700 hover:border-slate-600 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                            >
                              <option value="">-- Choose Drill from Library (120+ drills) --</option>
                              {categoryDrills.length > 0 && (
                                <optgroup label={`⭐ Matching Category Drills (${categoryDrills.length})`}>
                                  {categoryDrills.map((d, dIdx) => (
                                    <option key={`cat_${dIdx}`} value={d.name}>
                                      {d.name}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {allCategorizedDrills.map((grp, gIdx) => (
                                <optgroup key={`grp_${gIdx}`} label={`📁 ${grp.category} (${grp.drills.length})`}>
                                  {grp.drills.map((d, dIdx) => (
                                    <option key={`all_${gIdx}_${dIdx}`} value={d.name}>
                                      {d.name}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>

                          {/* Station Title */}
                          <input
                            type="text"
                            value={safeStation.name || ''}
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
                            value={safeStation.desc || ''}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdateStation(pIdx, sIdx, 'desc', e.target.value)
                            }
                            placeholder="Instructions, alignments, cone layout..."
                            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-200 leading-relaxed focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                          />

                          {/* Print view */}
                          <div className="hidden print:block">
                            <div className="font-black text-black uppercase tracking-tight leading-snug print-text-title">
                              {safeStation.name || 'Station / Drill'}
                            </div>
                            {safeStation.desc && (
                              <div className="font-semibold text-slate-950 mt-1 whitespace-pre-wrap leading-relaxed print-text-body">
                                {safeStation.desc}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Coaches Column & Smart Scrolling Selector */}
                        <td className="py-3 px-3.5 align-top border-r border-slate-700 relative">
                          {/* Render assigned coach chips for immediate clarity */}
                          {assignedCoachTokens.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5 print:hidden">
                              {assignedCoachTokens.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-500/40 text-[10px] font-bold text-indigo-300 flex items-center gap-1"
                                >
                                  <span>{c}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <textarea
                            rows={2}
                            value={safeStation.coach || ''}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdateStation(pIdx, sIdx, 'coach', e.target.value)
                            }
                            placeholder="Type or select coach names..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-100 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                          />

                          <div
                            onClick={() => {
                              setCoachSearchTerm('');
                              setActiveCoachPopup(
                                isCoachPopupOpen ? null : coachPopupId
                              );
                            }}
                            className="text-[11px] text-indigo-400 font-bold cursor-pointer mt-1.5 hover:underline print:hidden flex items-center gap-1 select-none"
                          >
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span>Select Coaches</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isCoachPopupOpen ? 'rotate-180' : ''}`} />
                          </div>

                          <div className="hidden print:block font-bold text-black leading-snug break-words print-text-body">
                            {safeStation.coach || '—'}
                          </div>

                          {/* Enhanced Coach Multi-select Popup with Upward Smart Flipping */}
                          {isCoachPopupOpen && (
                            <div
                              className={`absolute left-0 w-72 bg-slate-850 border border-slate-600 rounded-2xl shadow-2xl p-3.5 z-50 space-y-2.5 print:hidden backdrop-blur-md ring-1 ring-slate-700/80 ${
                                isNearBottom ? 'bottom-full mb-2' : 'top-full mt-1.5'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-xs font-black text-slate-100">
                                    Assign Coaching Staff
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveCoachPopup(null)}
                                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-750 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Coach Search filter */}
                              {savedCoaches.length > 4 && (
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={coachSearchTerm}
                                    onChange={(e) => setCoachSearchTerm(e.target.value)}
                                    placeholder="Search coaches..."
                                    className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              )}

                              {/* Coaches List with Large Readability */}
                              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                {savedCoaches
                                  .filter((c) =>
                                    !coachSearchTerm ||
                                    c.toLowerCase().includes(coachSearchTerm.toLowerCase().trim())
                                  )
                                  .map((coachName) => {
                                    const isChecked =
                                      assignedCoachTokens.includes(coachName) ||
                                      assignedCoachTokens.includes(`Coach ${coachName}`);

                                    return (
                                      <div
                                        key={coachName}
                                        className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                                          isChecked
                                            ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-100'
                                            : 'hover:bg-slate-750/70 border-transparent text-slate-200'
                                        }`}
                                      >
                                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 select-none">
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
                                            className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
                                          />
                                          <span className="text-xs font-bold">
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
                                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                          title={`Delete ${coachName} from team list`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}

                                {savedCoaches.length === 0 && (
                                  <div className="p-3 text-center text-xs text-slate-400">
                                    No saved coaches. Click below to add staff coaches.
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-700 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const name = prompt('Enter new Coach Name (e.g. Coach Dan, Coach Mike):');
                                    if (name && name.trim()) {
                                      onAddNewSavedCoach(name.trim());
                                    }
                                  }}
                                  className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
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
                            value={safeStation.focus || ''}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdateStation(pIdx, sIdx, 'focus', e.target.value)
                            }
                            placeholder="Key coaching cues & assignments..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-semibold text-slate-200 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-500 print:hidden"
                          />
                          <div className="hidden print:block font-medium text-black whitespace-pre-wrap leading-relaxed print-text-body">
                            {safeStation.focus || '—'}
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
                                  className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-slate-100 cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onMovePeriod(pIdx, 1)}
                                  title="Move Period Down"
                                  className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-slate-100 cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <button
                                onClick={() => onAddStationToPeriod(pIdx)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-sky-300 text-[10px] font-bold rounded-lg flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5 text-sky-400" />
                                <span>Station</span>
                              </button>
                              <button
                                onClick={() => onRemovePeriod(pIdx)}
                                title="Delete Period"
                                className="p-1 text-rose-400 hover:bg-rose-950/50 rounded-lg cursor-pointer"
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
      </div>

      {/* Extra bottom scroll cushion to allow generous scrolling */}
      <div className="h-44 print:hidden" aria-hidden="true" />

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
