import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Maximize,
  Download,
  Upload,
  RotateCcw,
  Copy,
  LogOut,
  UserCheck,
  ChevronDown,
  Calendar,
  Layers,
  Users,
  Settings,
  Star,
  Sliders,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { UserRole, SeasonConfig, Team, formatWeekLabel } from '../types';
import { getAutoActiveWeek } from '../utils/seasonWeekUtils';

interface HeaderProps {
  currentWeek: string;
  onWeekChange: (week: string) => void;
  opponent: string;
  onOpponentChange: (opp: string) => void;
  userEmail: string;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  syncStatus: { text: string; color: string };
  onSignOut: () => void;
  onToggleFullScreen: () => void;
  onExportData: () => void;
  onImportClick: () => void;
  onResetData: () => void;
  onOpenCopyWeekModal: () => void;
  activeUnit?: string;
  onNavigateToSchedule?: () => void;
  seasonConfig?: SeasonConfig;
  teams?: Team[];
  activeTeamId?: string;
  defaultTeamId?: string;
  onSelectTeam?: (teamId: string) => void;
  onSetDefaultTeam?: (teamId: string) => void;
  onOpenManageTeams?: () => void;
  onOpenPreferencesModal?: () => void;
  userAssignedTeamIds?: string[];
  scheduleEvents?: import('../types').ScheduleEvent[];
  onForceSave?: () => void;
  onForceRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeek,
  onWeekChange,
  opponent,
  onOpponentChange,
  userEmail,
  userRole,
  onRoleChange,
  syncStatus,
  onSignOut,
  onToggleFullScreen,
  onExportData,
  onImportClick,
  onResetData,
  onOpenCopyWeekModal,
  activeUnit,
  onNavigateToSchedule,
  seasonConfig,
  teams = [],
  activeTeamId,
  defaultTeamId,
  onSelectTeam,
  onSetDefaultTeam,
  onOpenManageTeams,
  onOpenPreferencesModal,
  userAssignedTeamIds,
  scheduleEvents = [],
  onForceSave,
  onForceRefresh,
}) => {
  // Find scheduled game for current week
  const matchedScheduledGame = React.useMemo(() => {
    if (!scheduleEvents || scheduleEvents.length === 0) return null;
    const cleanWeek = currentWeek.replace(/^Week\s+/i, '').trim();
    return scheduleEvents.find((ev) => {
      if (ev.type !== 'game' && ev.type !== 'scrimmage') return false;
      const evWeek = (ev.week || '').replace(/^Week\s+/i, '').trim();
      if (evWeek === cleanWeek) return true;
      if (
        cleanWeek === '0' &&
        (evWeek.startsWith('pre') || evWeek === '0' || (ev.title && ev.title.toLowerCase().includes('pre-season')))
      ) {
        return true;
      }
      if (
        cleanWeek === 'playoffs' &&
        (evWeek === 'playoffs' || evWeek === 'post' || evWeek === 'championship')
      ) {
        return true;
      }
      return false;
    });
  }, [scheduleEvents, currentWeek]);

  // Filter accessible teams: dannym1010 has full access, head coaches & assistant coaches access allowed teams only
  const accessibleTeams = React.useMemo(() => {
    const isMaster =
      (userEmail || '').toLowerCase().includes('dannym1010') ||
      (userEmail || '').toLowerCase().trim() === 'dannym1010@gmail.com';
    if (isMaster) {
      return teams;
    }
    if (userAssignedTeamIds && userAssignedTeamIds.length > 0) {
      if (userAssignedTeamIds.includes('all')) return teams;
      const permitted = teams.filter((t) => userAssignedTeamIds.includes(t.id));
      return permitted.length > 0 ? permitted : teams.slice(0, 1);
    }
    return teams.slice(0, 1);
  }, [teams, userEmail, userAssignedTeamIds]);

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const isCurrentTeamDefault = activeTeam && (defaultTeamId || (teams[0] && teams[0].id)) === activeTeam.id;

  return (
    <header className="bg-slate-850/95 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 text-slate-100 shadow-xl sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70">
        
        {/* Brand / Title Bento Block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-500/30 ring-1 ring-white/10 shrink-0">
            <span className="text-xl select-none">🏈</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                {activeTeam ? activeTeam.name : 'Football Operations Manager'}
              </h1>
              {activeTeam?.ageGroup && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs">
                  {activeTeam.ageGroup}
                </span>
              )}
              {activeTeam?.season && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-700">
                  {activeTeam.season}
                </span>
              )}
              {isCurrentTeamDefault && (
                <span
                  title="This is your default startup team"
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs"
                >
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>Default Team</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block font-medium">
              Live Depth Charts, Custom Formations, Playbooks &amp; Multi-Station Practice Itinerary
            </p>
          </div>
        </div>

        {/* Sync Status, Team Selector & User Profile Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Team Switcher Selector */}
          {accessibleTeams.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 px-3 py-1 rounded-2xl shadow-inner transition-colors">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 leading-none flex items-center gap-1">
                  <span>Active Team</span>
                  {isCurrentTeamDefault && (
                    <span className="text-amber-400 text-[8px] font-bold">★ Default</span>
                  )}
                </span>
                <select
                  value={activeTeamId || (accessibleTeams && accessibleTeams[0]?.id) || ''}
                  onChange={(e) => onSelectTeam && onSelectTeam(e.target.value)}
                  className="bg-transparent font-black text-xs text-white focus:outline-none cursor-pointer pr-1 py-0.5"
                >
                  {(accessibleTeams || []).map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      className="bg-slate-900 text-slate-100 font-bold"
                    >
                      {t.name} {t.ageGroup ? `(${t.ageGroup})` : ''} {t.id === defaultTeamId ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Set as Default Team Star Button */}
              {onSetDefaultTeam && activeTeam && (
                <button
                  type="button"
                  onClick={() => onSetDefaultTeam(activeTeam.id)}
                  title={
                    isCurrentTeamDefault
                      ? '⭐ Default Startup Team (Active on launch)'
                      : `Click to set "${activeTeam.name}" as your default startup team`
                  }
                  className={`p-1 rounded-lg transition-all ${
                    isCurrentTeamDefault
                      ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                      : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isCurrentTeamDefault ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                    }`}
                  />
                </button>
              )}

              {userRole === 'admin' && onOpenManageTeams && (
                <button
                  onClick={onOpenManageTeams}
                  title="Configure & Manage Teams"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Sync status badge & Quick Sync Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-2xl shadow-inner">
            <div className="flex items-center gap-2 pr-1 text-[11px] font-medium text-slate-200">
              <span
                className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: syncStatus.color || '#10b981' }}
              />
              <span className="hidden md:inline font-bold">{syncStatus.text}</span>
            </div>

            {onForceSave && (
              <button
                type="button"
                onClick={onForceSave}
                title="Force Save & Sync All Changes to Cloud/Server Now"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all active:scale-95 cursor-pointer"
              >
                <Cloud className="w-3 h-3" />
                <span className="hidden lg:inline">Save &amp; Sync</span>
              </button>
            )}

            {onForceRefresh && (
              <button
                type="button"
                onClick={onForceRefresh}
                title="Pull latest live changes from Server/Cloud"
                className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md transition-all active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* User Role Switcher Bento Chip */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-xl shadow-inner">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 truncate max-w-[120px] md:max-w-[160px]">
              {userEmail}
            </span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-0.5 text-[11px] font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="admin">Head Coach (Admin)</option>
              <option value="assistant">Assistant Coach</option>
            </select>
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                userRole === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {userRole === 'admin' ? 'ADMIN' : 'VIEWER'}
            </span>
          </div>

          {/* App Defaults & Preferences Button */}
          {onOpenPreferencesModal && (
            <button
              onClick={onOpenPreferencesModal}
              title="App Defaults & Preferences (Set Default Screen & Team)"
              className="px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Defaults</span>
            </button>
          )}

          {/* Actions: Fullscreen, Backup, Import, Reset, SignOut */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleFullScreen}
              title="Toggle Fullscreen"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
            >
              <Maximize className="w-4 h-4" />
            </button>
            {userRole === 'admin' && (
              <>
                <button
                  onClick={onExportData}
                  title="Download Data Backup (.json)"
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-750 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Backup</span>
                </button>
                <button
                  onClick={onImportClick}
                  title="Import Backup (.json)"
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-750 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Import</span>
                </button>
                <button
                  onClick={onResetData}
                  title="Reset App State"
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/40 rounded-xl transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onSignOut}
              title="Sign Out / Switch"
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Automated Game Week & Status Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2 bg-slate-800/90 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-700/70">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Automated Active Week Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 px-3 rounded-2xl border border-slate-700/80 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 inline" /> Auto Active Week:
                  </span>
                  <span className="text-white font-extrabold text-xs">
                    {formatWeekLabel(currentWeek)}
                  </span>
                  {matchedScheduledGame && (
                    <span className="text-slate-300 font-semibold text-[11px] hidden md:inline">
                      • {matchedScheduledGame.opponent ? `vs ${matchedScheduledGame.opponent}` : matchedScheduledGame.title} ({matchedScheduledGame.date})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {getAutoActiveWeek(scheduleEvents).reason}
                </span>
              </div>
            </div>

            {/* Quick manual week switcher if coach wants to inspect other weeks */}
            <div className="relative flex items-center ml-2 border-l border-slate-700 pl-2">
              <select
                value={currentWeek}
                onChange={(e) => onWeekChange(e.target.value)}
                className="bg-slate-800 border border-slate-700/90 text-slate-200 font-bold text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:bg-slate-750 transition-colors"
                title="Change active depth chart week"
              >
                <optgroup label="⚡ Pre-Season">
                  <option value="0">Pre-Season (Week 0)</option>
                  <option value="pre-2">Pre-Season Wk 2</option>
                  <option value="pre-3">Pre-Season Wk 3</option>
                  <option value="pre-4">Pre-Season Wk 4</option>
                </optgroup>
                <optgroup label="🏈 Regular Season">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                    <option key={wk} value={String(wk)}>
                      Week {wk} {wk === 1 ? '(Game 1 vs Carmel)' : wk === 2 ? '(Game 2 @ Somers)' : wk === 3 ? '(Game 3 vs Yorktown)' : wk === 4 ? '(Game 4 vs Brewster)' : wk === 5 ? '(Game 5 @ John Jay)' : wk === 6 ? '(Game 6 vs Lakeland)' : wk === 7 ? '(Game 7 @ Arlington)' : '(Game 8 - Playoffs Rd 1)'}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏆 Post-Season">
                  <option value="playoffs">Playoffs Round 1</option>
                  <option value="championship">Championship</option>
                </optgroup>
              </select>
            </div>

            {currentWeek !== getAutoActiveWeek(scheduleEvents).activeWeek && (
              <button
                type="button"
                onClick={() => onWeekChange(getAutoActiveWeek(scheduleEvents).activeWeek)}
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black flex items-center gap-1 transition-all shadow-xs ml-1"
                title="Sync back to automated schedule week"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Jump to Auto ({formatWeekLabel(getAutoActiveWeek(scheduleEvents).activeWeek)})</span>
              </button>
            )}
          </div>

          {/* Opponent Input */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-300 font-black uppercase tracking-widest text-[10px] hidden sm:inline">
              Opponent / Note:
            </span>
            <div className="relative flex items-center">
              <input
                type="text"
                value={opponent}
                onChange={(e) => onOpponentChange(e.target.value)}
                placeholder={matchedScheduledGame ? `e.g. ${matchedScheduledGame.opponent || matchedScheduledGame.title}` : 'e.g. vs. Somers / Homecoming'}
                disabled={userRole !== 'admin'}
                className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1 rounded-xl text-xs placeholder:text-slate-400 w-44 md:w-56 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              />
            </div>
            {matchedScheduledGame && (
              <button
                type="button"
                onClick={() => {
                  const opp = matchedScheduledGame.opponent || matchedScheduledGame.title;
                  if (opp) onOpponentChange(opp);
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title={`Click to set Opponent to "${matchedScheduledGame.opponent || matchedScheduledGame.title}" from schedule`}
              >
                <span>⚡ {matchedScheduledGame.opponent || matchedScheduledGame.title}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {onNavigateToSchedule && (
            <button
              onClick={onNavigateToSchedule}
              className={`px-3.5 py-1.5 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                activeUnit === 'schedule'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 font-black'
                  : 'bg-slate-900/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border-amber-500/40 hover:border-amber-400/80'
              }`}
              title="Open Full Season Schedule & Games Calendar"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>📅 Season Schedule</span>
            </button>
          )}

          {/* Copy Week Button */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenCopyWeekModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 border border-indigo-500/30 transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Week Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

