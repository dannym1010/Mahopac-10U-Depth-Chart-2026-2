import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Swords,
  ClipboardList,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  PenTool,
  Dumbbell,
  BookOpen,
  FileSpreadsheet,
  Watch,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Shirt,
  Sparkles,
  Trophy,
  ClipboardCheck,
} from 'lucide-react';
import {
  ScheduleEvent,
  PracticePlan,
  Team,
  UnitType,
  UserRole,
  SeasonConfig,
  RosterPlayer,
} from '../types';

interface HomeViewProps {
  scheduleEvents: ScheduleEvent[];
  practicePlans: PracticePlan[];
  activeTeam?: Team;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  currentWeek: string;
  seasonConfig: SeasonConfig;
  onNavigateToUnit: (unit: UnitType, options?: any) => void;
  onSelectPractice?: (practiceId: string) => void;
  onOpenPrintPractice?: (plan: PracticePlan) => void;
  roster?: RosterPlayer[];
  userRole: UserRole;
}

export const HomeView: React.FC<HomeViewProps> = ({
  scheduleEvents,
  practicePlans,
  activeTeam,
  teams,
  onSelectTeam,
  currentWeek,
  seasonConfig,
  onNavigateToUnit,
  onSelectPractice,
  onOpenPrintPractice,
  roster = [],
  userRole,
}) => {
  // Format today's date cleanly
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const formattedToday = useMemo(() => {
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [today]);

  // Helper to format date labels e.g. "Saturday, Sep 12"
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  // 1. Determine Upcoming Practice
  const practiceEventData = useMemo(() => {
    const teamPractices = (scheduleEvents || [])
      .filter((e) => e && (e.type === 'practice' || e.type === 'walkthrough') && !e.isCancelled)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (teamPractices.length === 0) return null;

    // Find today's practice or upcoming future practices
    const upcoming = teamPractices.filter((e) => {
      const eventEnd = new Date(`${e.date}T${e.endTime || e.startTime || '23:59'}:00`);
      return eventEnd.getTime() >= today.getTime();
    });

    const selectedEvent = upcoming.length > 0 ? upcoming[0] : teamPractices[teamPractices.length - 1];
    if (!selectedEvent) return null;

    const isToday = selectedEvent.date === todayStr;

    // Match linked practice plan
    let linkedPlan: PracticePlan | null = null;
    if (selectedEvent.linkedPracticePlanId) {
      linkedPlan = (practicePlans || []).find((p) => p.id === selectedEvent.linkedPracticePlanId) || null;
    }
    if (!linkedPlan) {
      linkedPlan = (practicePlans || []).find(
        (p) => p.date === selectedEvent.date || (p.weekFolder && (p.weekFolder === selectedEvent.week || p.weekFolder.includes(selectedEvent.week)))
      ) || null;
    }
    if (!linkedPlan && practicePlans && practicePlans.length > 0) {
      linkedPlan = practicePlans[0];
    }

    return {
      event: selectedEvent,
      plan: linkedPlan,
      isToday,
    };
  }, [scheduleEvents, practicePlans, today, todayStr]);

  // 2. Determine Upcoming Game or Scrimmage
  const gameEventData = useMemo(() => {
    const teamGames = (scheduleEvents || [])
      .filter((e) => e && (e.type === 'game' || e.type === 'scrimmage') && !e.isCancelled)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (teamGames.length === 0) return null;

    const upcoming = teamGames.filter((e) => {
      const eventEnd = new Date(`${e.date}T${e.endTime || e.startTime || '23:59'}:00`);
      return eventEnd.getTime() >= today.getTime();
    });

    const selectedEvent = upcoming.length > 0 ? upcoming[0] : teamGames[teamGames.length - 1];
    if (!selectedEvent) return null;

    const isToday = selectedEvent.date === todayStr;

    return {
      event: selectedEvent,
      isToday,
    };
  }, [scheduleEvents, today, todayStr]);

  const handleOpenPracticePlan = (planId?: string) => {
    if (planId) {
      if (onSelectPractice) onSelectPractice(planId);
      onNavigateToUnit('practice', { practiceId: planId });
    } else if (practiceEventData?.plan) {
      if (onSelectPractice) onSelectPractice(practiceEventData.plan.id);
      onNavigateToUnit('practice', { practiceId: practiceEventData.plan.id });
    } else {
      onNavigateToUnit('practice');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* =========================================================================
          1. CLEAN SPLASH SCREEN HEADER
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Football Command Center
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                Week {currentWeek}
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {formattedToday}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {activeTeam?.name || 'Mahopac 10U Indians'}
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-2xl leading-relaxed">
              Welcome back, Coach. Here is your team's upcoming schedule, practice scripts, and game day preparation hub.
            </p>
          </div>

          {/* Quick Team Switcher & Roster Stat */}
          <div className="flex items-center gap-3 shrink-0">
            {teams.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Team</label>
                <select
                  value={activeTeam?.id || ''}
                  onChange={(e) => onSelectTeam(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-400 cursor-pointer shadow-md"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs font-black text-white">{roster.length} Players</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Roster</div>
              </div>
            </div>

            {/* Direct Attendance Shortcut in Header */}
            <button
              type="button"
              onClick={() => onNavigateToUnit('compliance', { openTakeAttendance: true })}
              className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md transition-all cursor-pointer group"
              title="Open Take Practice Attendance Roll Call"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                  Take Attendance
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practice Roll Call</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. UPCOMING PRACTICE & UPCOMING GAME HERO SECTION (2-COLUMN PC SPLASH)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -------------------------------------------------------------
            CARD 1: UPCOMING PRACTICE INFO & DIRECT LINKS
            ------------------------------------------------------------- */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
          <div className="space-y-4">
            {/* Header / Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                    practiceEventData?.isToday
                      ? 'bg-emerald-500 text-slate-950 shadow-md animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{practiceEventData?.isToday ? "TODAY'S PRACTICE" : 'UPCOMING PRACTICE'}</span>
                </span>
                {practiceEventData?.event?.attireCategory && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {practiceEventData.event.attireCategory.replace('_', ' ')}
                  </span>
                )}
              </div>

              {practiceEventData?.event?.startTime && (
                <span className="text-xs font-black text-amber-300 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {practiceEventData.event.startTime}
                    {practiceEventData.event.endTime ? ` - ${practiceEventData.event.endTime}` : ''}
                  </span>
                </span>
              )}
            </div>

            {practiceEventData ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                    {practiceEventData.event.title || 'Team Practice'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                    <span>{formatDateLabel(practiceEventData.event.date)}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-extrabold">Week {practiceEventData.event.week}</span>
                  </p>
                </div>

                {/* Location */}
                {practiceEventData.event.location && (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate font-semibold">{practiceEventData.event.location}</span>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(practiceEventData.event.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Practice Script Preview / Highlights */}
                {practiceEventData.plan ? (
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-300">
                        📋 {practiceEventData.plan.title}
                      </span>
                      <span className="text-[11px] font-black text-emerald-400">
                        {practiceEventData.plan.periods?.length || 0} Periods
                      </span>
                    </div>

                    {/* Drill Periods Chips */}
                    {practiceEventData.plan.periods && practiceEventData.plan.periods.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {practiceEventData.plan.periods.slice(0, 4).map((period, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300"
                          >
                            P{idx + 1}: {period.title}
                          </span>
                        ))}
                        {practiceEventData.plan.periods.length > 4 && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500">
                            +{practiceEventData.plan.periods.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
                    No specific practice plan attached yet for this session.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm font-semibold">
                No upcoming practice scheduled.
              </div>
            )}
          </div>

          {/* Action Links & Buttons */}
          <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={() => handleOpenPracticePlan(practiceEventData?.plan?.id)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl border border-amber-300/80 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <ClipboardList className="w-4 h-4 text-slate-950" />
              <span>Open Practice Plan & Drill Script</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {/* Single direct action button for Player Roll Call & Attendance */}
            <button
              type="button"
              onClick={() => onNavigateToUnit('compliance', { openTakeAttendance: true })}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group"
              title="Open Player Roll Call & Practice Attendance"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-3.5 h-3.5" />
              </div>
              <span>Take Practice Attendance • Player Roll Call</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CARD 2: UPCOMING GAME INFO & DIRECT LINKS
            ------------------------------------------------------------- */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
          <div className="space-y-4">
            {/* Header / Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                    gameEventData?.event.type === 'scrimmage'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>
                    {gameEventData?.isToday
                      ? "TODAY'S GAME"
                      : gameEventData?.event.type === 'scrimmage'
                      ? 'NEXT SCRIMMAGE'
                      : 'UPCOMING GAME'}
                  </span>
                </span>

                {gameEventData?.event.locationType && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {gameEventData.event.locationType}
                  </span>
                )}
              </div>

              {gameEventData?.event.startTime && (
                <span className="text-xs font-black text-rose-300 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kickoff: {gameEventData.event.startTime}</span>
                </span>
              )}
            </div>

            {gameEventData ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-300 transition-colors">
                    {gameEventData.event.opponent ? `vs ${gameEventData.event.opponent}` : gameEventData.event.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                    <span>{formatDateLabel(gameEventData.event.date)}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-extrabold">Week {gameEventData.event.week}</span>
                  </p>
                </div>

                {/* Location */}
                {gameEventData.event.location && (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate font-semibold">{gameEventData.event.location}</span>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(gameEventData.event.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-extrabold text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Uniform & Arrival Info */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Shirt className="w-3 h-3 text-indigo-400" />
                      <span>Uniform</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1 truncate">
                      {gameEventData.event.uniform || (gameEventData.event.locationType === 'away' ? 'White Jerseys (Away)' : 'Dark / Gold (Home)')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Warmups</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1 truncate">
                      {gameEventData.event.arrivalMinutesBefore
                        ? `${gameEventData.event.arrivalMinutesBefore}m prior`
                        : '60m before kickoff'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm font-semibold">
                No upcoming game scheduled.
              </div>
            )}
          </div>

          {/* Action Links & Buttons */}
          <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={() => onNavigateToUnit('game_day')}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Trophy className="w-4 h-4" />
              <span>Launch Game Day Sideline Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToUnit('call_sheet')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Offensive & Defensive Call Sheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Call Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToUnit('wristband')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Player Wristband Card"
              >
                <Watch className="w-3.5 h-3.5 text-blue-400" />
                <span>Wristbands</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToUnit('depth_chart')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Starters & Depth Chart"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Depth Chart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. CLEAN QUICK NAVIGATION LAUNCHPAD FOR PC
          ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Coaching Tools Quick Launch</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">Fast PC Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Attendance & Compliance Hours */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('compliance', { openTakeAttendance: true })}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
            title="Open Practice Attendance Roll Call"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-emerald-300 transition-colors">
                Take Attendance
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Roll Call & Hours</div>
            </div>
          </button>

          {/* Depth Chart */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('depth_chart')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-indigo-300 transition-colors">
                Depth Chart
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Offense & Defense</div>
            </div>
          </button>

          {/* Practice Planner */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('practice')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-emerald-300 transition-colors">
                Practice Plan
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Scripts & Periods</div>
            </div>
          </button>

          {/* Drill Library */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('drills')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-amber-300 transition-colors">
                Drill Library
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Technique & Cues</div>
            </div>
          </button>

          {/* Whiteboard Playbook */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('whiteboard')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-blue-300 transition-colors">
                Whiteboard
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">2D Play Animator</div>
            </div>
          </button>

          {/* Call Sheet */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('call_sheet')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-rose-300 transition-colors">
                Call Sheet
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Down & Distance</div>
            </div>
          </button>

          {/* Playbook Guides */}
          <button
            type="button"
            onClick={() => onNavigateToUnit('guide')}
            className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-100 group-hover:text-cyan-300 transition-colors">
                Playbooks
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Schemes & PDFs</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
