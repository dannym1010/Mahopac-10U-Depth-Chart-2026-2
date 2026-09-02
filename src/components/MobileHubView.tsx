import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Shield,
  Zap,
  Target,
  Swords,
  Watch,
  FileSpreadsheet,
  BookOpen,
  Dumbbell,
  ClipboardList,
  Calendar,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  MessageSquare,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Settings,
  Plus,
  ArrowRight,
  Check,
  X,
  Play,
} from 'lucide-react';
import {
  Team,
  UnitType,
  UserRole,
  RosterPlayer,
  ScheduleEvent,
  PracticePlan,
  WeekState,
  FormationBoard,
  formatWeekLabel,
  AttendanceRecord,
} from '../types';

interface MobileHubViewProps {
  activeTeam: Team;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  currentWeek: string;
  onSelectWeek: (week: string) => void;
  userRole: UserRole;
  roster: RosterPlayer[];
  scheduleEvents: ScheduleEvent[];
  practicePlans: PracticePlan[];
  currentWeekState: WeekState;
  formations: FormationBoard[];
  depthChart: Record<string, any>;
  defaultScreen: UnitType;
  onSetDefaultScreen: (screen: UnitType) => void;
  onNavigateToUnit: (unit: UnitType, subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage') => void;
  onQuickAttendanceSave?: (record: AttendanceRecord) => void;
  onOpenPreferencesModal?: () => void;
  onOpenScheduleModal?: () => void;
  onOpenThemeGallery?: () => void;
}

const getPlayerFullName = (p: RosterPlayer): string => {
  if (p.rosterName) return p.rosterName;
  if (p.firstName || p.lastName) {
    return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  }
  return `#${p.num}`;
};

const getPlayerPos = (p: RosterPlayer): string => {
  return p.primaryPosition || p.offensivePosition || p.defensivePosition || 'ATH';
};

export const MobileHubView: React.FC<MobileHubViewProps> = ({
  activeTeam,
  teams,
  onSelectTeam,
  currentWeek,
  onSelectWeek,
  userRole,
  roster,
  scheduleEvents,
  practicePlans,
  currentWeekState,
  formations,
  depthChart,
  defaultScreen,
  onSetDefaultScreen,
  onNavigateToUnit,
  onQuickAttendanceSave,
  onOpenPreferencesModal,
  onOpenScheduleModal,
  onOpenThemeGallery,
}) => {
  // Mobile Hub active tab: 'starters' | 'roster' | 'attendance'
  const [hubTab, setHubTab] = useState<'starters' | 'roster' | 'attendance'>('starters');
  const [starterUnit, setStarterUnit] = useState<'offense' | 'defense'>('offense');
  const [playerSearch, setPlayerSearch] = useState('');
  const [attendancePresent, setAttendancePresent] = useState<Set<string>>(() => {
    return new Set(roster.map((r) => r.id || r.num));
  });
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<RosterPlayer | null>(null);

  // Determine Next / Upcoming Event for Active Team
  const upcomingEvent = useMemo(() => {
    if (!scheduleEvents || scheduleEvents.length === 0) return null;
    const now = new Date();
    const sorted = [...scheduleEvents]
      .filter((e) => e && e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cleanWk = currentWeek.replace(/^Week\s+/i, '').trim();
    const currentWeekEvent = sorted.find((e) => {
      const eWk = (e.week || '').replace(/^Week\s+/i, '').trim();
      return eWk === cleanWk;
    });
    if (currentWeekEvent) return currentWeekEvent;

    const future = sorted.find((e) => new Date(e.date + 'T23:59:59').getTime() >= now.getTime());
    return future || sorted[0];
  }, [scheduleEvents, currentWeek]);

  // Starters preview calculation for Offense & Defense
  const offensiveFormation = useMemo(() => {
    return formations.find((f) => f && f.unit === 'offense') || formations[0];
  }, [formations]);

  const defensiveFormation = useMemo(() => {
    return formations.find((f) => f && f.unit === 'defense') || formations[1];
  }, [formations]);

  const offenseStarters = useMemo(() => {
    if (!offensiveFormation || !offensiveFormation.rows) return [];
    const starters: { posName: string; playerName: string; playerNum: string }[] = [];
    offensiveFormation.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (!pos) return;
        const assigned = depthChart[pos.id] || [];
        const topItem = assigned[0];
        const topNum = typeof topItem === 'string' ? topItem : topItem?.playerNum || topItem?.num || '';
        if (topNum) {
          const p = roster.find((r) => r.num === topNum);
          starters.push({
            posName: pos.name,
            playerName: p ? getPlayerFullName(p) : `#${topNum}`,
            playerNum: topNum,
          });
        }
      });
    });
    return starters;
  }, [offensiveFormation, depthChart, roster]);

  const defenseStarters = useMemo(() => {
    if (!defensiveFormation || !defensiveFormation.rows) return [];
    const starters: { posName: string; playerName: string; playerNum: string }[] = [];
    defensiveFormation.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (!pos) return;
        const assigned = depthChart[pos.id] || [];
        const topItem = assigned[0];
        const topNum = typeof topItem === 'string' ? topItem : topItem?.playerNum || topItem?.num || '';
        if (topNum) {
          const p = roster.find((r) => r.num === topNum);
          starters.push({
            posName: pos.name,
            playerName: p ? getPlayerFullName(p) : `#${topNum}`,
            playerNum: topNum,
          });
        }
      });
    });
    return starters;
  }, [defensiveFormation, depthChart, roster]);

  // Filtered Roster for Quick Search
  const filteredRoster = useMemo(() => {
    if (!playerSearch.trim()) return roster;
    const q = playerSearch.toLowerCase().trim();
    return roster.filter((p) => {
      const fullName = getPlayerFullName(p).toLowerCase();
      const pos = getPlayerPos(p).toLowerCase();
      return (
        fullName.includes(q) ||
        p.num.toLowerCase().includes(q) ||
        pos.includes(q)
      );
    });
  }, [roster, playerSearch]);

  const handleToggleAttendance = (playerId: string) => {
    setAttendancePresent((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSelectAllAttendance = () => {
    setAttendancePresent(new Set(roster.map((r) => r.id || r.num)));
  };

  const handleClearAllAttendance = () => {
    setAttendancePresent(new Set());
  };

  const handleSaveAttendance = () => {
    if (!onQuickAttendanceSave) return;
    const presentNums = Array.from(attendancePresent);
    const absentNums = roster
      .map((r) => r.num)
      .filter((num) => !attendancePresent.has(num));

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      week: currentWeek,
      title: `Practice Attendance (${formatWeekLabel(currentWeek)})`,
      sessionType: 'padded',
      hours: 1.5,
      presentPlayerNums: presentNums,
      absentPlayerNums: absentNums,
      timestamp: Date.now(),
      notes: `Mobile Quick Check-in (${presentNums.length}/${roster.length} present)`,
    };
    onQuickAttendanceSave(record);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
  };

  const currentStartersList = starterUnit === 'offense' ? offenseStarters : defenseStarters;

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-xl mx-auto text-slate-100">
      {/* =========================================================================
          1. UPCOMING EVENT / GAME DAY HERO CARD
          ========================================================================= */}
      {upcomingEvent ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/80 rounded-3xl border border-indigo-500/30 p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wider uppercase flex items-center gap-1 ${
                  upcomingEvent.type === 'game'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : upcomingEvent.type === 'scrimmage'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {upcomingEvent.type === 'game' ? '🏈 GAME' : upcomingEvent.type === 'scrimmage' ? '⚡ SCRIMMAGE' : '📋 PRACTICE'}
              </span>
              {upcomingEvent.locationType && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {upcomingEvent.locationType}
                </span>
              )}
            </div>
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{upcomingEvent.time || '10:00 AM'}</span>
            </span>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-black text-white tracking-tight">
              {upcomingEvent.opponent ? `vs ${upcomingEvent.opponent}` : upcomingEvent.title}
            </h2>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              {upcomingEvent.date}
            </p>
          </div>

          {/* Location & Directions */}
          {upcomingEvent.location && (
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5 min-w-0 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate font-medium">{upcomingEvent.location}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(upcomingEvent.location)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
              >
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-4 text-center space-y-1 shadow-lg">
          <p className="text-xs font-black text-indigo-300 uppercase tracking-wider">
            {activeTeam.name} • {formatWeekLabel(currentWeek)}
          </p>
          <p className="text-sm font-bold text-white">Ready for Practice &amp; Game Day</p>
        </div>
      )}

      {/* =========================================================================
          2. CORE LAUNCH PAD TILES (Depth Chart, Practice Plan, Drills Library, Wristband)
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Depth Chart (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('depth_chart', 'offense')}
          className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-indigo-200">
            Depth Chart
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Pocket Chart &amp; Matrix
          </div>
        </button>

        {/* 2. Practice Plan (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('practice')}
          className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-emerald-200">
            Practice Plan
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Periods, Stations &amp; Timer
          </div>
        </button>

        {/* 3. Drills Library (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('drills')}
          className="bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-cyan-200">
            Drills Library
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Technique &amp; Catalog
          </div>
        </button>

        {/* 4. Wristband Plays */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('wristband')}
          className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Watch className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Call Sheet
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-amber-200">
            Wristband Plays
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Color Grid &amp; Callout
          </div>
        </button>
      </div>

      {/* =========================================================================
          3. SEGMENTED COACH COMMAND HUB (Tabs: Starters | Roster | Attendance)
          ========================================================================= */}
      <div className="bg-slate-850 rounded-3xl border border-slate-700/80 p-3.5 shadow-xl space-y-3">
        {/* Segmented Tab Bar */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setHubTab('starters')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'starters'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Starters</span>
          </button>
          <button
            type="button"
            onClick={() => setHubTab('roster')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setHubTab('attendance')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>
        </div>

        {/* TAB CONTENT 1: STARTERS */}
        {hubTab === 'starters' && (
          <div className="space-y-3">
            {/* Unit Sub-Toggle (Offense vs Defense) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStarterUnit('offense')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    starterUnit === 'offense'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Offense ({offenseStarters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStarterUnit('defense')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    starterUnit === 'defense'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Defense ({defenseStarters.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToUnit('depth_chart', starterUnit)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Starters Grid */}
            <div className="grid grid-cols-2 gap-2">
              {currentStartersList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-black text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-zinc-700">
                    #{item.playerNum}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-indigo-300 uppercase tracking-tight">
                      {item.posName}
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {item.playerName}
                    </div>
                  </div>
                </div>
              ))}
              {currentStartersList.length === 0 && (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                  No starters assigned yet in this unit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ROSTER DIRECTORY */}
        {hubTab === 'roster' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name, #, or position..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {playerSearch && (
                <button
                  type="button"
                  onClick={() => setPlayerSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Roster List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {filteredRoster.map((player) => {
                const fullName = getPlayerFullName(player);
                const pos = getPlayerPos(player);

                return (
                  <div
                    key={player.id || player.num}
                    onClick={() => setSelectedPlayerModal(player)}
                    className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono font-black text-xs text-amber-300 flex items-center justify-center shrink-0">
                        #{player.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">
                          {fullName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          Pos: {pos}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {player.isCaptain && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Captain
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
              {filteredRoster.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                  No players matched "{playerSearch}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: QUICK ATTENDANCE */}
        {hubTab === 'attendance' && (
          <div className="space-y-3">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-black text-slate-200">
                <span>{attendancePresent.size}</span> / <span>{roster.length} Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllAttendance}
                  className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllAttendance}
                  className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Player Grid for Quick Tap */}
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
              {roster.map((player) => {
                const pid = player.id || player.num;
                const isPresent = attendancePresent.has(pid);
                const fullName = getPlayerFullName(player);

                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => handleToggleAttendance(pid)}
                    className={`p-2 rounded-xl text-left flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-black text-xs shrink-0 text-amber-300">
                        #{player.num}
                      </span>
                      <span className="text-xs font-bold truncate">
                        {fullName}
                      </span>
                    </div>
                    {isPresent ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Save Attendance Button */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 border border-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Practice Attendance</span>
            </button>

            {attendanceSavedToast && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 text-center animate-in fade-in">
                ✓ Attendance logged successfully for {formatWeekLabel(currentWeek)}!
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. COACHING SHORTCUTS STRIP
          ========================================================================= */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onNavigateToUnit('schedule')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-bold text-slate-300">Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('compliance')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-300">Hours</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('scouting')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Target className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] font-bold text-slate-300">Scouting</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('guide')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-300">Playbook</span>
        </button>
      </div>

      {/* =========================================================================
          5. THEME SCHEME SHOWCASE BANNER
          ========================================================================= */}
      {onOpenThemeGallery && (
        <button
          type="button"
          onClick={onOpenThemeGallery}
          className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-left shadow-lg active:scale-98 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-indigo-200 flex items-center gap-1.5">
                <span>Visual Theme Schemes</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  5 Presets
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Preview Volt Neon, Championship Gold, Cyber Cobalt &amp; more
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
        </button>
      )}

      {/* =========================================================================
          5. PLAYER DETAIL MODAL
          ========================================================================= */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm flex items-center justify-center">
                  #{selectedPlayerModal.num}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {getPlayerFullName(selectedPlayerModal)}
                  </h3>
                  <p className="text-xs text-indigo-300 font-bold">
                    {getPlayerPos(selectedPlayerModal)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlayerModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400">Position Profile</div>
                <div className="text-slate-200">
                  <span className="font-bold">Primary:</span> {selectedPlayerModal.primaryPosition || 'None'}
                </div>
                {selectedPlayerModal.offensivePosition && (
                  <div className="text-emerald-300">
                    <span className="font-bold">Offense:</span> {selectedPlayerModal.offensivePosition}
                  </div>
                )}
                {selectedPlayerModal.defensivePosition && (
                  <div className="text-blue-300">
                    <span className="font-bold">Defense:</span> {selectedPlayerModal.defensivePosition}
                  </div>
                )}
              </div>

              {selectedPlayerModal.notes && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Coach Notes</div>
                  <p className="text-slate-300 italic">{selectedPlayerModal.notes}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlayerModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
