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
} from 'lucide-react';
import { UnitType, Team, UserRole } from '../types';
import { DEFAULT_NAV_TABS } from './NavigationTabs';

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
    name: 'Depth Chart — Position Groups',
    category: 'Depth Chart',
    description: 'QB, RB, WR/TE, OL, DL, LB, DB position group hierarchies and depth orders',
    icon: Users,
  },
  {
    id: 'scrimmage',
    subUnit: 'scrimmage',
    name: 'Practice / Scrimmage Rotation',
    category: 'Depth Chart',
    description: 'Live 11-on-11 scrimmage rotation matrix and playing-time balance',
    icon: Swords,
  },
  {
    id: 'wristband',
    name: 'Wristband Builder',
    category: 'Playcalling',
    description: 'Color-coded QB & player wristband cards, custom numbering, and printable inserts',
    icon: Watch,
  },
  {
    id: 'scouting',
    name: 'Scouting & Tendencies',
    category: 'Strategy',
    description: 'Opponent scouting reports, defensive coverage tendencies, and game strategy',
    icon: FileSpreadsheet,
  },
  {
    id: 'practice',
    name: 'Practice Plan & Itinerary',
    category: 'Coaching',
    description: 'Minute-by-minute practice schedule, multi-station rotations, and coach assignments',
    icon: ClipboardList,
  },
  {
    id: 'drills',
    name: 'Drills Library',
    category: 'Coaching',
    description: 'Categorized drill repository with station instructions, diagrams, and equipment',
    icon: Dumbbell,
  },
  {
    id: 'guide',
    name: 'Playbooks & Guides',
    category: 'Coaching',
    description: 'Offense & defense playbook reference cards, rulebooks, and coach guides',
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
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'team'>('screen');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                <span>App Defaults &amp; Preferences</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  User Settings
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Choose your default team and landing screen when launching the application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Default Screen vs Default Team) */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-850/50 flex gap-2">
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'screen'
                ? 'border-indigo-500 text-white bg-slate-800/80 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Default Landing Screen</span>
            {defaultScreen && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold capitalize">
                {defaultScreen === 'depth_chart' ? defaultDepthSubUnit || 'Offense' : defaultScreen}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black tracking-tight border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'team'
                ? 'border-indigo-500 text-white bg-slate-800/80 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Default Startup Team</span>
            {defaultTeamId && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {teams.find((t) => t.id === defaultTeamId)?.name || 'Selected'}
              </span>
            )}
          </button>
        </div>

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh]">
          {/* TAB 1: DEFAULT SCREEN SELECTION */}
          {activeTab === 'screen' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Select Default Startup Screen
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    The app will automatically open to this screen every time you open or refresh.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {availableScreenOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isDefault = isCurrentScreenDefault(opt);
                  const isCurrentlyActive =
                    activeUnit === opt.id ||
                    (opt.id === 'depth_chart' &&
                      ['offense', 'defense', 'st', 'groups'].includes(activeUnit) &&
                      activeUnit === opt.subUnit);

                  return (
                    <div
                      key={`${opt.id}-${opt.subUnit || 'main'}`}
                      onClick={() => handleSelectDefaultScreen(opt.id, opt.subUnit)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isDefault
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                          : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                              isDefault
                                ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-xs'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
                              {opt.category}
                            </span>
                            <span className="font-bold text-xs text-slate-100 block truncate">
                              {opt.name}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isDefault ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>Default</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDefaultScreen(opt.id, opt.subUnit);
                              }}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-transparent hover:border-slate-700 transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug pl-10">
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Select Default Startup Team
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    The chosen team's roster, schedule, depth charts and playbooks will load automatically on launch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {teams.map((team) => {
                  const isDefault = (defaultTeamId || teams[0]?.id) === team.id;
                  const isCurrentlyActive = activeTeamId === team.id;

                  return (
                    <div
                      key={team.id}
                      onClick={() => handleSelectDefaultTeam(team.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isDefault
                          ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/40'
                          : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
                              <span className="text-base">🏈</span>
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-100 leading-tight">
                                {team.name}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {team.ageGroup && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {team.ageGroup}
                                  </span>
                                )}
                                {team.season && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {team.season}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Star Default Badge / Button */}
                          {isDefault ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>Default Team</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDefaultTeam(team.id);
                              }}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 text-slate-400" />
                              <span>Set Default</span>
                            </button>
                          )}
                        </div>

                        {team.headCoachName && (
                          <p className="text-xs text-slate-400 mt-2">
                            Head Coach: <strong className="text-slate-200">{team.headCoachName}</strong>
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className={isCurrentlyActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                          {isCurrentlyActive ? '● Active Session Team' : '○ Standby Team'}
                        </span>
                        {isDefault && (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Selected Startup Default
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSetDefaultScreen('schedule');
              if (teams.length > 0) onSetDefaultTeam(teams[0].id);
              showToast('Reset to standard defaults: Season Schedule & First Team');
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1.5 hover:border-rose-500/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
