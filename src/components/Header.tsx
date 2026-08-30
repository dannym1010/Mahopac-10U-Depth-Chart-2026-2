import React from 'react';
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
} from 'lucide-react';
import { UserRole, SeasonConfig, Team, formatWeekLabel } from '../types';

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
  onSelectTeam?: (teamId: string) => void;
  onOpenManageTeams?: () => void;
  userAssignedTeamIds?: string[];
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
  onSelectTeam,
  onOpenManageTeams,
  userAssignedTeamIds,
}) => {
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
            <div className="flex items-center gap-2 bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 px-3 py-1 rounded-2xl shadow-inner transition-colors">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 leading-none">
                  Active Team
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
                      {t.name} {t.ageGroup ? `(${t.ageGroup})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {userRole === 'admin' && onOpenManageTeams && (
                <button
                  onClick={onOpenManageTeams}
                  title="Configure & Manage Teams"
                  className="ml-1 p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Sync status badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] font-medium text-slate-200 shadow-inner">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: syncStatus.color || '#10b981' }}
            />
            <span className="hidden md:inline font-bold">{syncStatus.text}</span>
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

      {/* Week Selector & Season Phase Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2 bg-slate-800/90 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-700/70">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Phase Quick Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => {
                if (currentWeek.startsWith('pre') || currentWeek === '0') return;
                onWeekChange('0');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                currentWeek.startsWith('pre') || currentWeek === '0'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>⚡ Pre-Season</span>
            </button>
            <button
              onClick={() => {
                const isReg = !currentWeek.startsWith('pre') && currentWeek !== '0' && currentWeek !== 'playoffs' && currentWeek !== 'championship';
                if (isReg) return;
                onWeekChange('1');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                !currentWeek.startsWith('pre') && currentWeek !== '0' && currentWeek !== 'playoffs' && currentWeek !== 'championship'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>🏈 Regular Season</span>
            </button>
            <button
              onClick={() => {
                if (currentWeek === 'playoffs' || currentWeek === 'championship') return;
                onWeekChange('playoffs');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                currentWeek === 'playoffs' || currentWeek === 'championship'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>🏆 Playoffs</span>
            </button>
          </div>

          {/* Game Week Dropdown with Prev/Next controls */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-xl">
            <button
              onClick={() => {
                const allWeeks = ['0', 'pre-2', 'pre-3', 'pre-4', '1', '2', '3', '4', '5', '6', '7', '8', 'playoffs'];
                const curIdx = allWeeks.indexOf(currentWeek);
                if (curIdx > 0) onWeekChange(allWeeks[curIdx - 1]);
              }}
              title="Previous Week"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              ◀
            </button>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentWeek}
                onChange={(e) => onWeekChange(e.target.value)}
                className="bg-transparent text-slate-100 font-bold text-xs focus:outline-none cursor-pointer pr-1 py-0.5"
              >
                <optgroup label="⚡ Pre-Season Weeks">
                  <option value="0" className="bg-slate-900 text-slate-100 font-bold">Pre-Season • Wk 1 (Conditioning)</option>
                  <option value="pre-2" className="bg-slate-900 text-slate-100 font-bold">Pre-Season • Wk 2 (Conditioning &amp; Shells)</option>
                  <option value="pre-3" className="bg-slate-900 text-slate-100 font-bold">Pre-Season • Wk 3 (Pads &amp; Fundamentals)</option>
                  <option value="pre-4" className="bg-slate-900 text-slate-100 font-bold">Pre-Season • Wk 4 (Pads &amp; Scrimmage)</option>
                </optgroup>
                <optgroup label="🏈 Regular Season Weeks">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                    <option key={wk} value={String(wk)} className="bg-slate-900 text-slate-100 font-bold">
                      Regular Season • Week {wk}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏆 Post-Season / Playoffs">
                  <option value="playoffs" className="bg-slate-900 text-slate-100 font-bold">Post-Season • Playoffs Round 1</option>
                  <option value="championship" className="bg-slate-900 text-slate-100 font-bold">Championship Bowl Game</option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={() => {
                const allWeeks = ['0', 'pre-2', 'pre-3', 'pre-4', '1', '2', '3', '4', '5', '6', '7', '8', 'playoffs'];
                const curIdx = allWeeks.indexOf(currentWeek);
                if (curIdx !== -1 && curIdx < allWeeks.length - 1) onWeekChange(allWeeks[curIdx + 1]);
              }}
              title="Next Week"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              ▶
            </button>
          </div>

          {/* Opponent Input */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-black uppercase tracking-widest text-[10px] hidden sm:inline">
              Opponent / Note:
            </span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => onOpponentChange(e.target.value)}
              placeholder="e.g. vs. Somers / Homecoming"
              disabled={userRole !== 'admin'}
              className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1 rounded-xl text-xs placeholder:text-slate-400 w-44 md:w-56 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            />
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

