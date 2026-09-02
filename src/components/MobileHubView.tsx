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
import { getSeasonWeekList } from '../utils/seasonWeekUtils';

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
}) => {
  const [playerSearch, setPlayerSearch] = useState('');
  const [quickAttendanceMode, setQuickAttendanceMode] = useState(false);
  const [quickAttendancePresent, setQuickAttendancePresent] = useState<Set<string>>(new Set());
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<RosterPlayer | null>(null);

  // Determine Next / Upcoming Event for Active Team
  const upcomingEvent = useMemo(() => {
    if (!scheduleEvents || scheduleEvents.length === 0) return null;
    const now = new Date();
    // Sort events by date ascending
    const sorted = [...scheduleEvents]
      .filter((e) => e && e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // First try to find upcoming game/practice in current week
    const cleanWk = currentWeek.replace(/^Week\s+/i, '').trim();
    const currentWeekEvent = sorted.find((e) => {
      const eWk = (e.week || '').replace(/^Week\s+/i, '').trim();
      return eWk === cleanWk;
    });
    if (currentWeekEvent) return currentWeekEvent;

    // Otherwise find closest event today or in future
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

  // Today's practice plan preview
  const todayPracticePlan = useMemo(() => {
    if (!practicePlans || practicePlans.length === 0) return null;
    return practicePlans[0];
  }, [practicePlans]);

  // Filtered Roster for Quick Search
  const filteredRoster = useMemo(() => {
    if (!playerSearch.trim()) return roster.slice(0, 10);
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

  const allWeeks = useMemo(() => getSeasonWeekList(), []);
  const currentWeekIdx = allWeeks.findIndex((w) => w.key === currentWeek);

  const handlePrevWeek = () => {
    if (currentWeekIdx > 0) {
      onSelectWeek(allWeeks[currentWeekIdx - 1].key);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIdx < allWeeks.length - 1) {
      onSelectWeek(allWeeks[currentWeekIdx + 1].key);
    }
  };

  const handleToggleAttendancePlayer = (num: string) => {
    setQuickAttendancePresent((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const handleSaveQuickAttendance = () => {
    if (!onQuickAttendanceSave) return;
    const presentList = Array.from(quickAttendancePresent);
    const absentList = roster.map((r) => r.num).filter((n) => !quickAttendancePresent.has(n));
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: dateStr,
      week: currentWeek,
      title: `Mobile Practice Check-in (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      sessionType: 'padded',
      hours: 1.5,
      location: activeTeam.name,
      presentPlayerNums: presentList,
      absentPlayerNums: absentList,
      timestamp: Date.now(),
    };
    onQuickAttendanceSave(newRecord);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
    setQuickAttendanceMode(false);
  };

  const isDefaultMobileHub = defaultScreen === 'mobile_hub';

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      {/* Top Mobile Coach Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">Coach Mobile Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Game Day Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Quick tap command center</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSetDefaultScreen('mobile_hub')}
              title={isDefaultMobileHub ? 'Default starting screen' : 'Set as default starting screen'}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                isDefaultMobileHub
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-300 border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isDefaultMobileHub ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {onOpenPreferencesModal && (
              <button
                onClick={onOpenPreferencesModal}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="Preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Team & Week Quick Switchers */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Active Team
            </label>
            <select
              value={activeTeam.id}
              onChange={(e) => onSelectTeam(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Current Week
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevWeek}
                disabled={currentWeekIdx <= 0}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 disabled:opacity-30 border border-slate-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <select
                value={currentWeek}
                onChange={(e) => onSelectWeek(e.target.value)}
                className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-indigo-300 rounded-xl px-1.5 py-1.5 text-xs font-black text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {allWeeks.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNextWeek}
                disabled={currentWeekIdx >= allWeeks.length - 1}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 disabled:opacity-30 border border-slate-700"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Big Touch Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Pocket Depth Chart Quick Button */}
        <button
          onClick={() => onNavigateToUnit('depth_chart', 'offense')}
          className="group text-left bg-gradient-to-br from-indigo-900/60 to-slate-900 hover:from-indigo-900/80 hover:to-slate-850 border border-indigo-500/40 rounded-3xl p-4 shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[120px] cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white mt-2">Offense Depth</h3>
            <p className="text-[11px] text-indigo-200 font-medium line-clamp-1">
              Black, Gold, Blue lines
            </p>
          </div>
        </button>

        {/* 2. Defense Depth Chart Quick Button */}
        <button
          onClick={() => onNavigateToUnit('depth_chart', 'defense')}
          className="group text-left bg-gradient-to-br from-emerald-900/60 to-slate-900 hover:from-emerald-900/80 hover:to-slate-850 border border-emerald-500/40 rounded-3xl p-4 shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[120px] cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white mt-2">Defense Depth</h3>
            <p className="text-[11px] text-emerald-200 font-medium line-clamp-1">
              Base & Sub packages
            </p>
          </div>
        </button>

        {/* 3. Wristband / Play Call Card */}
        <button
          onClick={() => onNavigateToUnit('wristband')}
          className="group text-left bg-gradient-to-br from-amber-900/60 to-slate-900 hover:from-amber-900/80 hover:to-slate-850 border border-amber-500/40 rounded-3xl p-4 shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[120px] cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Watch className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white mt-2">Wristband Plays</h3>
            <p className="text-[11px] text-amber-200 font-medium line-clamp-1">
              Live playcall cards
            </p>
          </div>
        </button>

        {/* 4. Practice Plan Quick Button */}
        <button
          onClick={() => onNavigateToUnit('practice')}
          className="group text-left bg-gradient-to-br from-purple-900/60 to-slate-900 hover:from-purple-900/80 hover:to-slate-850 border border-purple-500/40 rounded-3xl p-4 shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[120px] cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white mt-2">Practice Plan</h3>
            <p className="text-[11px] text-purple-200 font-medium line-clamp-1">
              Periods, timer & drills
            </p>
          </div>
        </button>
      </div>

      {/* Upcoming Event / Game Card */}
      {upcomingEvent && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  upcomingEvent.type === 'game'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {upcomingEvent.type === 'game'
                  ? '🏈 GAME DAY'
                  : upcomingEvent.type === 'scrimmage'
                  ? '⚔️ SCRIMMAGE'
                  : '📋 PRACTICE'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {formatWeekLabel(upcomingEvent.week || currentWeek)}
              </span>
            </div>

            {upcomingEvent.locationType && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {upcomingEvent.locationType === 'home' ? '🏠 HOME' : '✈️ AWAY'}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              {upcomingEvent.title ||
                (upcomingEvent.opponent ? `vs ${upcomingEvent.opponent}` : 'Scheduled Event')}
            </h3>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300 mt-1 font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{upcomingEvent.date}</span>
              </div>
              {(upcomingEvent.startTime || upcomingEvent.time) && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{upcomingEvent.startTime || upcomingEvent.time}</span>
                </div>
              )}
            </div>
          </div>

          {upcomingEvent.location && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200 truncate">
                  {upcomingEvent.location}
                </span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(upcomingEvent.location)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[11px] font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNavigateToUnit('schedule')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 text-center transition-colors"
            >
              Full Schedule & iCal
            </button>
            <button
              onClick={() => onNavigateToUnit('depth_chart', 'offense')}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/30 text-center transition-colors"
            >
              View Pocket Card
            </button>
          </div>
        </div>
      )}

      {/* Secondary Fast Tools: Quick Tabs */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-3 shadow-xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-2 mb-2">
          Coaching Tools
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateToUnit('schedule')}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-center transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-300">Schedule</span>
          </button>

          <button
            onClick={() => onNavigateToUnit('compliance')}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-center transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-300">Hours</span>
          </button>

          <button
            onClick={() => onNavigateToUnit('drills')}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-center transition-all cursor-pointer"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-300">Drills</span>
          </button>

          <button
            onClick={() => onNavigateToUnit('guide')}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-center transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-bold text-slate-300">Playbooks</span>
          </button>
        </div>
      </div>

      {/* Starters Snapshot (Offense & Defense) */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-black text-white">Starting Lineup Snapshot</h3>
          </div>
          <button
            onClick={() => onNavigateToUnit('depth_chart', 'offense')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Full Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Offense Starters Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span>Offense ({offensiveFormation?.name || 'Base'})</span>
            <span className="text-indigo-400">{offenseStarters.length} assigned</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {offenseStarters.slice(0, 6).map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center gap-2"
              >
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {s.posName}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{s.playerName}</p>
                  <p className="text-[10px] text-slate-400">#{s.playerNum}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defense Starters Strip */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span>Defense ({defensiveFormation?.name || 'Base'})</span>
            <span className="text-emerald-400">{defenseStarters.length} assigned</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {defenseStarters.slice(0, 6).map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center gap-2"
              >
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {s.posName}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{s.playerName}</p>
                  <p className="text-[10px] text-slate-400">#{s.playerNum}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fast Roster Lookup & Calling Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">Roster Quick Lookup</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {roster.length} Players
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            placeholder="Search jersey # or name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Players Quick List */}
        <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto no-scrollbar">
          {filteredRoster.map((p) => {
            const fullName = getPlayerFullName(p);
            const pos = getPlayerPos(p);
            return (
              <div
                key={p.id || p.num}
                onClick={() => setSelectedPlayerModal(p)}
                className="py-2 flex items-center justify-between gap-2 hover:bg-slate-800/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                    #{p.num}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">{fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {pos} {p.notes ? `• ${p.notes}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Attendance Check-in Section (Optional Fast Tap) */}
      {userRole === 'admin' && onQuickAttendanceSave && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white">10-Second Attendance</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!quickAttendanceMode) {
                  // Pre-populate with all players initially
                  setQuickAttendancePresent(new Set(roster.map((p) => p.num)));
                }
                setQuickAttendanceMode(!quickAttendanceMode);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-xl border border-indigo-500/40 transition-all cursor-pointer"
            >
              {quickAttendanceMode ? 'Close' : 'Take Attendance'}
            </button>
          </div>

          {quickAttendanceMode && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-[11px] text-slate-400">
                Tap player numbers to toggle <strong>Present</strong> (green) / <strong>Absent</strong> (gray).
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar p-1">
                {roster.map((p) => {
                  const isPresent = quickAttendancePresent.has(p.num);
                  const shortName = p.firstName || p.lastName || p.rosterName || `#${p.num}`;
                  return (
                    <button
                      key={p.num}
                      type="button"
                      onClick={() => handleToggleAttendancePlayer(p.num)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        isPresent
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                          : 'bg-slate-800 text-slate-400 border-slate-700 line-through opacity-60'
                      }`}
                    >
                      <span>#{p.num}</span>
                      <span className="truncate max-w-[80px]">{shortName}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  {quickAttendancePresent.size} / {roster.length} Present
                </span>
                <button
                  type="button"
                  onClick={handleSaveQuickAttendance}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>
          )}

          {attendanceSavedToast && (
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-150">
              <CheckCircle2 className="w-4 h-4" />
              <span>Attendance logged successfully!</span>
            </div>
          )}
        </div>
      )}

      {/* Selected Player Details Modal */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  #{selectedPlayerModal.num}
                </div>
                <div>
                  <h3 className="font-black text-base text-white">{getPlayerFullName(selectedPlayerModal)}</h3>
                  <p className="text-xs text-indigo-400 font-bold">
                    {getPlayerPos(selectedPlayerModal)} {selectedPlayerModal.isCaptain ? '• Team Captain' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayerModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Team:</span>
                <span className="font-bold text-slate-200">{activeTeam.name}</span>
              </div>
              {selectedPlayerModal.primaryPosition && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Position:</span>
                  <span className="font-bold text-slate-200">{selectedPlayerModal.primaryPosition}</span>
                </div>
              )}
              {selectedPlayerModal.secondaryPosition && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Secondary Position:</span>
                  <span className="font-bold text-slate-200">{selectedPlayerModal.secondaryPosition}</span>
                </div>
              )}
              {selectedPlayerModal.conditioningHours !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Conditioning Hours:</span>
                  <span className="font-bold text-slate-200">{selectedPlayerModal.conditioningHours} hrs</span>
                </div>
              )}
              {selectedPlayerModal.paddedHours !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Padded Hours:</span>
                  <span className="font-bold text-slate-200">{selectedPlayerModal.paddedHours} hrs</span>
                </div>
              )}
              {selectedPlayerModal.notes && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Notes:</span>
                  <span className="font-bold text-indigo-300">{selectedPlayerModal.notes}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPlayerModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
