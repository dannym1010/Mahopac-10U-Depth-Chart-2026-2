import React, { useState } from 'react';
import {
  Settings,
  Star,
  Check,
  X,
  RotateCcw,
  Calendar,
  Zap,
  ClipboardList,
  Watch,
  FileSpreadsheet,
  Dumbbell,
  BookOpen,
  Users,
  Shield,
  Target,
  Swords,
  Sparkles,
  Smartphone,
  Download,
  Upload,
  Cloud,
  RefreshCw,
  Sliders,
  Copy,
} from 'lucide-react';
import { UnitType, Team, UserRole } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  activeTeamId: string;
  defaultTeamId: string;
  onSetDefaultTeam: (teamId: string) => void;
  activeUnit: UnitType;
  defaultScreen: UnitType;
  defaultDepthSubUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
  onSetDefaultScreen: (
    screen: UnitType,
    subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage'
  ) => void;
  userRole: UserRole;
  currentUserEmail?: string;
  onOpenThemeGallery?: () => void;
  onOpenSeasonConfigModal?: () => void;
  onOpenManageTeams?: () => void;
  onOpenCopyWeekModal?: () => void;
  onExportData?: () => void;
  onImportClick?: () => void;
  onResetData?: () => void;
  onForceSave?: () => void;
  onForceRefresh?: () => void;
}

interface ScreenOption {
  id: UnitType;
  subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const SCREEN_OPTIONS: ScreenOption[] = [
  {
    id: 'mobile_hub',
    name: 'Mobile Coach Hub (Sideline Command)',
    category: 'Mobile & Fast Access',
    description: 'Thumb-friendly game day dashboard with big touch buttons, next game countdown, attendance, and instant pocket depth chart access',
    icon: Smartphone,
  },
  {
    id: 'schedule',
    name: 'Season Schedule',
    category: 'Games & Events',
    description: 'Games calendar, practices, opponent addresses, and TeamSnap iCal feed sync',
    icon: Calendar,
  },
  {
    id: 'compliance',
    name: 'Practice Hours & Compliance',
    category: 'Safety & Requirements',
    description: 'Roster player conditioning/padded hours, 10-hour/15-hour rules, and attendance logs',
    icon: Zap,
  },
  {
    id: 'depth_chart',
    subUnit: 'offense',
    name: 'Depth Chart — Offense',
    category: 'Depth Chart',
    description: 'Offensive formations (I-Formation, Spread, Wishbone, etc.) and visual depth charts',
    icon: Zap,
  },
  {
    id: 'depth_chart',
    subUnit: 'defense',
    name: 'Depth Chart — Defense',
    category: 'Depth Chart',
    description: 'Defensive formations (4-3, 5-3, 3-4, Goal Line) and defensive player assignments',
    icon: Shield,
  },
  {
    id: 'depth_chart',
    subUnit: 'st',
    name: 'Depth Chart — Special Teams',
    category: 'Depth Chart',
    description: 'Kickoff, Kick Return, Punt, Punt Return, and Field Goal units',
    icon: Target,
  },
  {
    id: 'depth_chart',
    subUnit: 'groups',
    name: 'Position Groups & Rooms',
    category: 'Depth Chart',
    description: 'QB, RB, WR, OL, DL, LB, DB meeting rosters and unit grouping overview',
    icon: Users,
  },
  {
    id: 'depth_chart',
    subUnit: 'scrimmage',
    name: 'Gold vs Blue Scrimmage Matchups',
    category: 'Depth Chart',
    description: 'Inter-squad scrimmage lineups, team color cards, and head-to-head depth',
    icon: Swords,
  },
  {
    id: 'wristband',
    name: 'Wristband Playbook Inserts',
    category: 'Game Day Operations',
    description: 'Quarterback / Coach 4.5" x 2.25" physical inserts, multi-tier callout grids, and wristband cards',
    icon: Watch,
  },
  {
    id: 'practice',
    name: 'Practice Plan & Scripts',
    category: 'Practice Preparation',
    description: 'Multi-period practice itinerary, period timers, station breakouts, and install scripts',
    icon: ClipboardList,
  },
  {
    id: 'drills',
    name: 'Master Drill Library',
    category: 'Practice Preparation',
    description: 'Comprehensive 120+ football agility, positional, tackling, and coaching cue database',
    icon: Dumbbell,
  },
  {
    id: 'scouting',
    name: 'Scouting & Tendencies',
    category: 'Game Day Operations',
    description: 'Opponent tendencies, down & distance matrices, personnel breakdowns, and defensive fronts',
    icon: FileSpreadsheet,
  },
  {
    id: 'guide',
    name: 'Playbooks & Play Art Guides',
    category: 'Reference & Guides',
    description: 'Offensive and defensive system playbook sheets, route trees, and coaching manuals',
    icon: BookOpen,
  },
  {
    id: 'users',
    name: 'Staff & Access Management',
    category: 'Administration',
    description: 'Coach roles, team assignments, practice coaches, and program teams',
    icon: Users,
    adminOnly: true,
  },
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  teams,
  activeTeamId,
  defaultTeamId,
  onSetDefaultTeam,
  activeUnit,
  defaultScreen,
  defaultDepthSubUnit = 'offense',
  onSetDefaultScreen,
  userRole,
  currentUserEmail,
  onOpenThemeGallery,
  onOpenSeasonConfigModal,
  onOpenManageTeams,
  onOpenCopyWeekModal,
  onExportData,
  onImportClick,
  onResetData,
  onForceSave,
  onForceRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'team' | 'tools' | 'data'>('screen');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSelectDefaultTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    onSetDefaultTeam(teamId);
    showToast(`⭐ Default startup team set to "${team?.name || 'Selected Team'}"`);
  };

  const handleSelectDefaultScreen = (
    screenId: UnitType,
    subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage'
  ) => {
    onSetDefaultScreen(screenId, subUnit);
    const option = SCREEN_OPTIONS.find(
      (opt) => opt.id === screenId && (opt.subUnit === subUnit || !subUnit)
    );
    showToast(`⭐ Default startup screen set to "${option?.name || screenId}"`);
  };

  const isCurrentScreenDefault = (opt: ScreenOption) => {
    if (opt.id === 'depth_chart') {
      return defaultScreen === 'depth_chart' && (defaultDepthSubUnit || 'offense') === opt.subUnit;
    }
    if (opt.id === 'scrimmage') {
      return defaultScreen === 'scrimmage';
    }
    return defaultScreen === opt.id;
  };

  const availableScreenOptions = SCREEN_OPTIONS.filter(
    (opt) => !opt.adminOnly || userRole === 'admin'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-zinc-100 text-base flex items-center gap-2">
                <span>Coach Settings &amp; Sideline Tools</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Carbon &amp; Gold
                </span>
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                {currentUserEmail ? (
                  <span>
                    Saving preferences for <strong className="text-amber-400 font-bold">{currentUserEmail}</strong>
                  </span>
                ) : (
                  <span>Manage startup defaults, season calendar, visual schemes, and data backups</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Default Screen | Default Team | Sideline Tools | Data & Backup) */}
        <div className="px-5 pt-3 border-b border-zinc-800 bg-zinc-900/50 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'screen'
                ? 'border-amber-400 text-amber-300 bg-zinc-850 shadow-xs'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Default Screen</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'team'
                ? 'border-amber-400 text-amber-300 bg-zinc-850 shadow-xs'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Default Team</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tools'
                ? 'border-amber-400 text-amber-300 bg-zinc-850 shadow-xs'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Season &amp; Themes</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-amber-400 text-amber-300 bg-zinc-850 shadow-xs'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup &amp; Sync</span>
          </button>
        </div>

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh]">
          {/* TAB 1: DEFAULT SCREEN SELECTION */}
          {activeTab === 'screen' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                    Startup Landing Page
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    The chosen screen loads immediately when you open or refresh the app.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold capitalize">
                  {defaultScreen === 'depth_chart' ? defaultDepthSubUnit || 'Offense' : defaultScreen}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {availableScreenOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isDefault = isCurrentScreenDefault(opt);

                  return (
                    <div
                      key={`${opt.id}_${opt.subUnit || 'main'}`}
                      onClick={() => handleSelectDefaultScreen(opt.id, opt.subUnit)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-2.5 ${
                        isDefault
                          ? 'bg-amber-950/30 border-amber-400 shadow-md shadow-amber-950/40 ring-1 ring-amber-400/50'
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isDefault
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 shadow-md font-black'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-black text-xs text-zinc-100 flex items-center gap-1.5">
                              <span>{opt.name}</span>
                              {opt.adminOnly && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[8px] font-black uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-tight">
                              {opt.category}
                            </span>
                          </div>
                        </div>

                        {isDefault && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-zinc-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-xs shrink-0">
                            <Star className="w-2.5 h-2.5 fill-zinc-950" />
                            <span>Active Default</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DEFAULT TEAM SELECTION */}
          {activeTab === 'team' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                    Startup Default Team
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Your preferred squad automatically selected upon launching.
                  </p>
                </div>
                {onOpenManageTeams && userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenManageTeams();
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Teams</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {teams.map((t) => {
                  const isDefault = defaultTeamId === t.id;
                  const isCurrentActive = activeTeamId === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectDefaultTeam(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isDefault
                          ? 'bg-amber-950/30 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                            isDefault
                              ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          🏈
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-zinc-100 truncate">
                              {t.name}
                            </span>
                            {t.ageGroup && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {t.ageGroup}
                              </span>
                            )}
                            {isCurrentActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Viewing Now
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 truncate">
                            {t.season ? `${t.season} Season • ` : ''}
                            {t.headCoachName
                              ? `Coach: ${t.headCoachName}`
                              : 'Roster & Depth Charts'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDefault ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs shadow-xs">
                            <Star className="w-3.5 h-3.5 fill-zinc-950" />
                            <span>Default Team</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDefaultTeam(t.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SEASON & THEMES QUICK TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Season Configuration Tool */}
                {onOpenSeasonConfigModal && (
                  <div
                    onClick={() => {
                      onClose();
                      onOpenSeasonConfigModal();
                    }}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                          Configure Season &amp; Weeks
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Set total regular season weeks, preseason dates, and playoffs
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 self-end">
                      <span>Open Calendar Setup</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}

                {/* Theme Schemes Gallery Tool */}
                {onOpenThemeGallery && (
                  <div
                    onClick={() => {
                      onClose();
                      onOpenThemeGallery();
                    }}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                          Sideline Visual Themes
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Preview 5 varsity presets: Carbon Gold, Electric Volt, Cyber Cobalt &amp; more
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 self-end">
                      <span>Theme Showcase</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}

                {/* Copy Week Data */}
                {onOpenCopyWeekModal && (
                  <div
                    onClick={() => {
                      onClose();
                      onOpenCopyWeekModal();
                    }}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Copy className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 group-hover:text-cyan-300 transition-colors">
                          Clone / Copy Week Lineups
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Duplicate offensive/defensive depth charts and formations into next week
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 self-end">
                      <span>Launch Week Cloner</span>
                      <Copy className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}

                {/* Manage Staff & Teams */}
                {onOpenManageTeams && userRole === 'admin' && (
                  <div
                    onClick={() => {
                      onClose();
                      onOpenManageTeams();
                    }}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 group-hover:text-indigo-300 transition-colors">
                          Manage Staff &amp; Team Rosters
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Add assistant coaches, assign team privileges, and edit age groups
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 self-end">
                      <span>Open Staff Directory</span>
                      <Users className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DATA BACKUP & CLOUD SYNC */}
          {activeTab === 'data' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black text-zinc-100 uppercase tracking-wider">
                      Live Cloud Sync &amp; Storage
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Real-Time Database
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  All changes to rosters, formations, depth charts, wristband callouts, and practice scripts are stored persistently in cloud storage.
                </p>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {onForceSave && (
                    <button
                      type="button"
                      onClick={() => {
                        onForceSave();
                        showToast('✓ Forced immediate full cloud sync');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Force Save to Cloud</span>
                    </button>
                  )}

                  {onForceRefresh && (
                    <button
                      type="button"
                      onClick={() => {
                        onForceRefresh();
                        showToast('✓ Pulled latest data from cloud');
                      }}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-all active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh / Pull Cloud</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Offline Backup & File Archive */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>File Backup &amp; Offline Archive</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Download a complete portable JSON snapshot of your plays, wristband cards, depth charts, rosters, practice plans, and schedules.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {onExportData ? (
                    <button
                      type="button"
                      onClick={() => {
                        onExportData();
                        showToast('Backup download initiated');
                      }}
                      className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Download Backup (.json)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 bg-zinc-800 text-zinc-500 font-bold text-xs rounded-xl flex items-center gap-2 border border-zinc-700 opacity-60"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Unavailable</span>
                    </button>
                  )}

                  {onImportClick && userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={onImportClick}
                      className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-cyan-500/40 hover:border-cyan-400 transition-all active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Backup (.json)</span>
                    </button>
                  )}

                  {onResetData && userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={onResetData}
                      className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-500/40 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset App State</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/95 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              onSetDefaultScreen('schedule');
              if (teams.length > 0) onSetDefaultTeam(teams[0].id);
              showToast('Reset to standard defaults: Season Schedule & First Team');
            }}
            className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center gap-1.5 hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
