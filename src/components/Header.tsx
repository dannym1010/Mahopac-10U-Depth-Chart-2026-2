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
} from 'lucide-react';
import { UserRole } from '../types';

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
}) => {
  return (
    <header className="bg-slate-850/95 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 text-slate-100 shadow-xl sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70">
        
        {/* Brand / Title Bento Block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-500/30 ring-1 ring-white/10">
            <span className="text-xl select-none">🏈</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Mahopac 10U Operations Manager
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs">
                10U YOUTH
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block font-medium">
              Live Depth Charts, Custom Formations, Playbooks & Multi-Station Practice Itinerary
            </p>
          </div>
        </div>

        {/* Sync Status & User Profile Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* Week Selector & Game Opponent Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 bg-slate-800/90 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-700/70">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Game Week Dropdown Bento */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-black uppercase tracking-widest text-[10px]">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Season Week:</span>
            </div>
            <select
              value={currentWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 font-bold px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <optgroup label="⚡ Pre-Season (Acclimatization & Prep)">
                <option value="0">Pre-Season • Week 1 (Conditioning Only)</option>
                <option value="pre-2">Pre-Season • Week 2 (Pads & Scrimmage)</option>
              </optgroup>
              <optgroup label="🏈 Regular Season">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                  <option key={wk} value={String(wk)}>
                    Regular Season • Week {wk}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏆 Post-Season">
                <option value="playoffs">Post-Season • Playoffs</option>
              </optgroup>
            </select>
          </div>

          {/* Opponent Input */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-black uppercase tracking-widest text-[10px]">
              Opponent / Note:
            </span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => onOpponentChange(e.target.value)}
              placeholder="e.g. vs. Somers / Homecoming"
              disabled={userRole !== 'admin'}
              className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-xl text-xs placeholder:text-slate-400 w-52 md:w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
