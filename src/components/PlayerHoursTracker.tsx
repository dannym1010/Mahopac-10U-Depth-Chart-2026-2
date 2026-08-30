import React, { useState, useMemo } from 'react';
import {
  Shield,
  Zap,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserPlus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react';
import {
  RosterPlayer,
  UserRole,
  ScheduleEvent,
  formatWeekLabel,
  calculatePlayerCompliance,
  CONDITIONING_HOURS_REQUIRED,
  PADDED_HOURS_REQUIRED,
} from '../types';

interface PlayerHoursTrackerProps {
  roster: RosterPlayer[];
  userRole: UserRole;
  currentWeek: string;
  scheduleEvents?: ScheduleEvent[];
  onUpdatePlayer: (updatedPlayer: RosterPlayer) => void;
  onUpdateRoster: (updatedRoster: RosterPlayer[]) => void;
  onOpenAddPlayerModal: () => void;
  onOpenEditPlayerModal: (player: RosterPlayer) => void;
  onOpenRosterManager: () => void;
}

export const PlayerHoursTracker: React.FC<PlayerHoursTrackerProps> = ({
  roster,
  userRole,
  currentWeek,
  scheduleEvents = [],
  onUpdatePlayer,
  onUpdateRoster,
  onOpenAddPlayerModal,
  onOpenEditPlayerModal,
  onOpenRosterManager,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_conditioning' | 'needs_pads' | 'fully_cleared'>('all');
  const [selectedWeekForLog, setSelectedWeekForLog] = useState<string>(currentWeek || '0');
  const [showLogAttendanceModal, setShowLogAttendanceModal] = useState(false);
  const [selectedPlayerForAdjust, setSelectedPlayerForAdjust] = useState<RosterPlayer | null>(null);

  // Form state for Quick Attendance Logger
  const [logSessionType, setLogSessionType] = useState<'conditioning' | 'padded'>('conditioning');
  const [logSessionHours, setLogSessionHours] = useState<number>(1.5);
  const [logSessionTitle, setLogSessionTitle] = useState<string>('Preseason Conditioning Practice');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    roster.forEach((p) => {
      init[p.num] = true; // All present by default
    });
    return init;
  });

  // Calculate high-level compliance metrics
  const complianceStats = useMemo(() => {
    let fullyClearedCount = 0;
    let padsClearedCount = 0;
    let conditioningOnlyCount = 0;
    let totalConditioningHoursLogged = 0;
    let totalPaddedHoursLogged = 0;

    roster.forEach((player) => {
      const status = calculatePlayerCompliance(player);
      totalConditioningHoursLogged += status.conditioningHours;
      totalPaddedHoursLogged += status.paddedHours;

      if (status.isScrimmageCleared) {
        fullyClearedCount++;
      } else if (status.isPadsCleared) {
        padsClearedCount++;
      } else {
        conditioningOnlyCount++;
      }
    });

    const totalPlayers = roster.length || 1;
    const fullyClearedPct = Math.round((fullyClearedCount / totalPlayers) * 100);

    return {
      totalPlayers: roster.length,
      fullyClearedCount,
      padsClearedCount,
      conditioningOnlyCount,
      fullyClearedPct,
      totalConditioningHoursLogged: totalConditioningHoursLogged.toFixed(1),
      totalPaddedHoursLogged: totalPaddedHoursLogged.toFixed(1),
      totalHours: (totalConditioningHoursLogged + totalPaddedHoursLogged).toFixed(1),
    };
  }, [roster]);

  // Filtered Players
  const filteredRoster = useMemo(() => {
    return roster.filter((player) => {
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchesName = `${player.firstName} ${player.lastName}`.toLowerCase().includes(term);
        const matchesNum = player.num.includes(term);
        const matchesPos = (player.primaryPosition || '').toLowerCase().includes(term) || (player.secondaryPosition || '').toLowerCase().includes(term);
        if (!matchesName && !matchesNum && !matchesPos) return false;
      }

      const status = calculatePlayerCompliance(player);
      if (statusFilter === 'needs_conditioning' && status.isConditioningCleared) return false;
      if (statusFilter === 'needs_pads' && (!status.isConditioningCleared || status.isScrimmageCleared)) return false;
      if (statusFilter === 'fully_cleared' && !status.isScrimmageCleared) return false;

      return true;
    });
  }, [roster, searchTerm, statusFilter]);

  // Quick incremental hours adjustment
  const handleQuickAdjustHours = (player: RosterPlayer, type: 'conditioning' | 'padded', delta: number) => {
    if (userRole !== 'admin') return;
    const currentCond = Number(player.conditioningHours || 0);
    const currentPadded = Number(player.paddedHours || 0);

    let updatedCond = currentCond;
    let updatedPadded = currentPadded;

    if (type === 'conditioning') {
      updatedCond = Math.max(0, parseFloat((currentCond + delta).toFixed(1)));
    } else {
      updatedPadded = Math.max(0, parseFloat((currentPadded + delta).toFixed(1)));
    }

    const currentWeekly = { ...(player.weeklyHours || {}) };
    const currentWeekLogged = Number(currentWeekly[selectedWeekForLog] || 0);
    currentWeekly[selectedWeekForLog] = Math.max(0, parseFloat((currentWeekLogged + delta).toFixed(1)));

    const updatedPlayer: RosterPlayer = {
      ...player,
      conditioningHours: updatedCond,
      paddedHours: updatedPadded,
      weeklyHours: currentWeekly,
    };

    onUpdatePlayer(updatedPlayer);
  };

  // Submit bulk attendance session
  const handleSubmitAttendanceSession = () => {
    if (userRole !== 'admin') return;
    const hoursToAdd = Number(logSessionHours);
    if (hoursToAdd <= 0) return;

    const updatedRoster = roster.map((player) => {
      if (!selectedPlayerIds[player.num]) {
        return player; // absent
      }

      const currentCond = Number(player.conditioningHours || 0);
      const currentPadded = Number(player.paddedHours || 0);

      let newCond = currentCond;
      let newPadded = currentPadded;

      if (logSessionType === 'conditioning') {
        newCond = parseFloat((currentCond + hoursToAdd).toFixed(1));
      } else {
        newPadded = parseFloat((currentPadded + hoursToAdd).toFixed(1));
      }

      const newWeekly = { ...(player.weeklyHours || {}) };
      const currentWkVal = Number(newWeekly[selectedWeekForLog] || 0);
      newWeekly[selectedWeekForLog] = parseFloat((currentWkVal + hoursToAdd).toFixed(1));

      return {
        ...player,
        conditioningHours: newCond,
        paddedHours: newPadded,
        weeklyHours: newWeekly,
      };
    });

    onUpdateRoster(updatedRoster);
    setShowLogAttendanceModal(false);
  };

  // Print compliance summary
  const handlePrintCompliance = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bento Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/80 border border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
                MANDATED YOUTH COMPLIANCE
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider rounded-full">
                MAHOPAC 10U
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <span>⚡ Player Practice Hours & Acclimatization Tracker</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl mt-1.5 leading-relaxed">
              Enforces youth safety requirements: <strong className="text-amber-300">10 Hours Conditioning</strong> required before wearing full pads, then <strong className="text-sky-300">10 Hours in Pads</strong> required before participating in scrimmages or live games.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setShowLogAttendanceModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Log Practice Hours</span>
                </button>
                <button
                  onClick={onOpenRosterManager}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-400/30"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Manage Roster</span>
                </button>
              </>
            )}
            <button
              onClick={handlePrintCompliance}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl flex items-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* 4-Column Metric Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Full Scrimmage Cleared</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{complianceStats.fullyClearedCount}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {complianceStats.totalPlayers} ({complianceStats.fullyClearedPct}%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">10h Cond + 10h Pads Complete</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Pads Cleared</span>
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-400">{complianceStats.padsClearedCount}</span>
              <span className="text-xs text-slate-400 font-semibold">kids</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Can wear pads; working to 10h padded</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Conditioning Stage</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{complianceStats.conditioningOnlyCount}</span>
              <span className="text-xs text-slate-400 font-semibold">kids</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Helmets only; needs 10h conditioning</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Practice Hours</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300">{complianceStats.totalHours}</span>
              <span className="text-xs text-slate-400 font-semibold">hrs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{complianceStats.totalConditioningHoursLogged}h cond + {complianceStats.totalPaddedHoursLogged}h pads</p>
          </div>
        </div>
      </div>

      {/* Rules Information Ribbon */}
      <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-100 block text-xs">Acclimatization Rules Checklist:</span>
            <span className="text-[11px] text-slate-300 leading-tight">
              1. <strong>Conditioning Phase (10 hrs):</strong> Helmets, t-shirts & shorts only. No pads or contact.<br/>
              2. <strong>Padded Phase (10 hrs):</strong> Full gear & shells allowed. Must complete 10 logged padded hours before live game or scrimmage.
            </span>
          </div>
        </div>

        {/* Selected Week Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-300 text-[11px]">Active Week:</span>
          <select
            value={selectedWeekForLog}
            onChange={(e) => setSelectedWeekForLog(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="0">Preseason Wk 1 (Conditioning)</option>
            <option value="pre-2">Preseason Wk 2 (Pads & Scrimmage)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={String(w)}>
                Regular Season • Week {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player name, jersey #, position..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white border border-slate-600 shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({roster.length})
          </button>
          <button
            onClick={() => setStatusFilter('needs_conditioning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'needs_conditioning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-amber-400 border border-slate-800'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Needs Conditioning ({complianceStats.conditioningOnlyCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('needs_pads')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'needs_pads'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-sky-400 border border-slate-800'
            }`}
          >
            <Shield className="w-3 h-3 text-sky-400" />
            <span>Needs Padded Hours ({complianceStats.padsClearedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('fully_cleared')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'fully_cleared'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-emerald-400 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Fully Cleared ({complianceStats.fullyClearedCount})</span>
          </button>
        </div>
      </div>

      {/* Player Cards Compliance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRoster.map((player) => {
          const comp = calculatePlayerCompliance(player);
          const condProgress = Math.min(100, (comp.conditioningHours / CONDITIONING_HOURS_REQUIRED) * 100);
          const padProgress = Math.min(100, (comp.paddedHours / PADDED_HOURS_REQUIRED) * 100);
          const thisWeekHours = Number(player.weeklyHours?.[selectedWeekForLog] || 0);

          return (
            <div
              key={player.num}
              className={`bg-slate-900/90 border rounded-3xl p-4.5 shadow-lg flex flex-col justify-between gap-3 transition-all hover:border-slate-600 ${
                comp.isScrimmageCleared
                  ? 'border-emerald-500/30 ring-1 ring-emerald-500/10'
                  : comp.isPadsCleared
                  ? 'border-sky-500/30'
                  : 'border-amber-500/40'
              }`}
            >
              {/* Card Header: Jersey, Name, Positions & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-mono font-black text-indigo-300 text-sm shadow-inner shrink-0">
                      #{player.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm text-slate-100 uppercase tracking-tight truncate">
                          {player.firstName} {player.lastName}
                        </h3>
                        {player.isCaptain && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                            C
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {player.primaryPosition && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
                            OFF: {player.primaryPosition}
                          </span>
                        )}
                        {player.secondaryPosition && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                            DEF: {player.secondaryPosition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => onOpenEditPlayerModal(player)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                      title="Edit player information"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${comp.badgeColor}`}>
                    {comp.isScrimmageCleared ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Scrimmage &amp; Game Cleared</span>
                      </>
                    ) : comp.isPadsCleared ? (
                      <>
                        <Shield className="w-3 h-3 text-sky-400" />
                        <span>Pads Cleared ({comp.paddedRemaining.toFixed(1)}h to Scrimmage)</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Conditioning Only ({comp.conditioningRemaining.toFixed(1)}h to Pads)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Progress Bar 1: Conditioning Hours (Target 10h) */}
                <div className="space-y-1 mb-2.5 bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-2xl">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <Zap className="w-3 h-3" />
                      <span>1. Conditioning Practice</span>
                    </div>
                    <span className="font-mono text-slate-200">
                      {comp.conditioningHours.toFixed(1)} / 10.0 hrs
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        comp.isConditioningCleared ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${condProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                    <span>Target: 10 hrs</span>
                    <span>
                      {comp.isConditioningCleared
                        ? '✅ Pads Cleared'
                        : `${comp.conditioningRemaining.toFixed(1)} hrs remaining`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar 2: Padded Practice Hours (Target 10h) */}
                <div className="space-y-1 bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-2xl">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1.5 text-sky-300">
                      <Shield className="w-3 h-3" />
                      <span>2. Padded Practice (Full Gear)</span>
                    </div>
                    <span className="font-mono text-slate-200">
                      {comp.paddedHours.toFixed(1)} / 10.0 hrs
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        comp.isScrimmageCleared ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${padProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                    <span>Target: 10 hrs in pads</span>
                    <span>
                      {comp.isScrimmageCleared
                        ? '✅ Scrimmage Cleared'
                        : `${comp.paddedRemaining.toFixed(1)} hrs remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Weekly Hours & Quick Adjustment Controls */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span>
                    Logged for {formatWeekLabel(selectedWeekForLog).split(' ')[0]}:{' '}
                    <strong className="text-indigo-300">{thisWeekHours.toFixed(1)} hrs</strong>
                  </span>
                  <span>
                    Total: <strong className="text-amber-300">{comp.totalHours.toFixed(1)} hrs</strong>
                  </span>
                </div>

                {userRole === 'admin' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Conditioning Quick Adjust */}
                    <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl p-1 justify-between">
                      <span className="text-[9px] font-black text-amber-400 pl-1 uppercase">Cond</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'conditioning', -0.5)}
                          className="w-5 h-5 bg-slate-900 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-bold transition-all"
                          title="-0.5 hr conditioning"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'conditioning', 0.5)}
                          className="w-5 h-5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-md flex items-center justify-center text-[10px] font-bold transition-all"
                          title="+0.5 hr conditioning"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'conditioning', 1.0)}
                          className="px-1 py-0.5 bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 rounded-md text-[9px] font-bold transition-all"
                          title="+1.0 hr conditioning"
                        >
                          +1h
                        </button>
                      </div>
                    </div>

                    {/* Padded Quick Adjust */}
                    <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl p-1 justify-between">
                      <span className="text-[9px] font-black text-sky-400 pl-1 uppercase">Pads</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'padded', -0.5)}
                          className="w-5 h-5 bg-slate-900 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-bold transition-all"
                          title="-0.5 hr padded"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'padded', 0.5)}
                          className="w-5 h-5 bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 rounded-md flex items-center justify-center text-[10px] font-bold transition-all"
                          title="+0.5 hr padded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleQuickAdjustHours(player, 'padded', 1.0)}
                          className="px-1 py-0.5 bg-sky-500/30 hover:bg-sky-500/50 text-sky-300 rounded-md text-[9px] font-bold transition-all"
                          title="+1.0 hr padded"
                        >
                          +1h
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoster.length === 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 font-medium">
          <Users className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm font-bold text-slate-300">No players match the selected filter</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting search query or status filter</p>
        </div>
      )}

      {/* QUICK ATTENDANCE & HOURS LOGGER MODAL */}
      {showLogAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">
                    Log Practice Attendance &amp; Practice Hours
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bulk credit hours to all attending players in 1 click
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Practice Type / Gear Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  Practice Gear / Session Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLogSessionType('conditioning');
                      setLogSessionTitle('Preseason Conditioning (Helmets Only)');
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      logSessionType === 'conditioning'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-black text-xs">⚡ Conditioning / Helmets</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Counts toward 10h Conditioning requirement before pads
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLogSessionType('padded');
                      setLogSessionTitle('Full Padded Practice (Contact)');
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      logSessionType === 'padded'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-black text-xs">🛡️ Full Pads / Shells</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Counts toward 10h Padded requirement before scrimmage
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hours Duration & Target Week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-[11px]">
                    Practice Duration (Hours):
                  </label>
                  <select
                    value={logSessionHours}
                    onChange={(e) => setLogSessionHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value={0.5}>0.5 Hour (30 mins)</option>
                    <option value={1.0}>1.0 Hour (60 mins)</option>
                    <option value={1.5}>1.5 Hours (90 mins - Standard)</option>
                    <option value={2.0}>2.0 Hours (120 mins)</option>
                    <option value={2.5}>2.5 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-[11px]">
                    Assign to Week:
                  </label>
                  <select
                    value={selectedWeekForLog}
                    onChange={(e) => setSelectedWeekForLog(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="0">Preseason Wk 1 (Conditioning)</option>
                    <option value="pre-2">Preseason Wk 2 (Pads & Scrimmage)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={String(w)}>
                        Regular Season • Week {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Player Checkboxes with Select All / Deselect All */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 text-xs">
                    Attending Players ({Object.values(selectedPlayerIds).filter(Boolean).length} / {roster.length} Present):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        roster.forEach((p) => (all[p.num] = true));
                        setSelectedPlayerIds(all);
                      }}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlayerIds({})}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-300 underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-2xl no-scrollbar">
                  {roster.map((player) => {
                    const isSelected = !!selectedPlayerIds[player.num];
                    return (
                      <label
                        key={player.num}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500/50 text-slate-100'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedPlayerIds((prev) => ({
                              ...prev,
                              [player.num]: e.target.checked,
                            }));
                          }}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-indigo-400 text-[10px]">
                          #{player.num}
                        </span>
                        <span className="font-bold text-[11px] truncate">
                          {player.lastName || player.firstName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogAttendanceModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAttendanceSession}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Credit {logSessionHours} hrs to {Object.values(selectedPlayerIds).filter(Boolean).length} Players</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
