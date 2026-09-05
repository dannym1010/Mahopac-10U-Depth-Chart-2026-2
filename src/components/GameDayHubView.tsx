import React, { useState } from 'react';
import {
  Swords,
  FileSpreadsheet,
  Watch,
  BarChart3,
  Printer,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Eye,
  Clock,
  ExternalLink,
  Target,
} from 'lucide-react';
import { CallSheetMainView } from './CallSheetMainView';
import { WristbandView } from './WristbandView';
import { ScoutingView } from './ScoutingView';
import {
  CallSheetData,
  PlayDatabaseEntry,
} from '../types/callSheet';
import {
  WristbandData,
  ScoutingData,
  UserRole,
  StaffCoach,
  RosterPlayer,
  ScheduleEvent,
} from '../types';
import { triggerPrint } from '../utils/printUtils';

interface GameDayHubViewProps {
  userRole: UserRole;
  activeTeamName: string;
  opponent: string;
  onUpdateOpponent?: (opponent: string) => void;
  currentWeek: string;
  gameDate?: string;
  playDatabase: PlayDatabaseEntry[];
  onUpdatePlayDatabase: (plays: PlayDatabaseEntry[]) => void;
  callSheetData: CallSheetData;
  onUpdateCallSheetData: (data: CallSheetData) => void;
  deletedPlayIds: string[];
  onUpdateDeletedPlayIds: (ids: string[]) => void;
  wristbandData?: WristbandData;
  onUpdateWristbandData?: (data: WristbandData) => void;
  scouting?: ScoutingData;
  onUpdateScouting: (field: keyof ScoutingData, val: any) => void;
  staffList?: StaffCoach[];
  savedCoaches?: string[];
  scheduleEvents?: ScheduleEvent[];
  activeTeamRoster?: RosterPlayer[];
  currentUser?: any;
  onNavigateToSchedule?: () => void;
}

export type GameDayTab = 'command' | 'call_sheet' | 'wristband' | 'scouting';

export const GameDayHubView: React.FC<GameDayHubViewProps> = ({
  userRole,
  activeTeamName,
  opponent,
  onUpdateOpponent,
  currentWeek,
  gameDate,
  playDatabase,
  onUpdatePlayDatabase,
  callSheetData,
  onUpdateCallSheetData,
  deletedPlayIds,
  onUpdateDeletedPlayIds,
  wristbandData,
  onUpdateWristbandData,
  scouting = {},
  onUpdateScouting,
  staffList = [],
  savedCoaches = [],
  scheduleEvents = [],
  currentUser,
  onNavigateToSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<GameDayTab>('command');
  const [isQuickOpponentEditing, setIsQuickOpponentEditing] = useState(false);
  const [tempOpponent, setTempOpponent] = useState(opponent || '');

  // Derived counts
  const totalWristbands = wristbandData?.wristbands?.length || 2;
  const totalCallSheetPlays =
    (callSheetData?.offenseSections?.reduce((acc, s) => acc + (s.plays?.filter(Boolean).length || 0), 0) || 0) +
    (callSheetData?.defenseSections?.reduce((acc, s) => acc + (s.plays?.filter(Boolean).length || 0), 0) || 0);

  const handlePrintAll = () => {
    triggerPrint({
      targetElementSelector: '#game-day-hub-content',
      documentTitle: `GameDay_Package_Week_${currentWeek}`,
    });
  };

  return (
    <div id="game-day-hub-content" className="space-y-6">
      {/* Top Game Day Matchup Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/80 border border-slate-700/80 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Swords className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Game Day Command Center &bull; Week {currentWeek}
              </span>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeTeamName}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>VS.</span>
                {isQuickOpponentEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempOpponent}
                      onChange={(e) => setTempOpponent(e.target.value)}
                      placeholder="Opponent Team Name..."
                      className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateOpponent) onUpdateOpponent(tempOpponent);
                        setIsQuickOpponentEditing(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => {
                      if (userRole === 'admin') {
                        setTempOpponent(opponent || '');
                        setIsQuickOpponentEditing(true);
                      }
                    }}
                    className={`cursor-pointer hover:text-amber-300 transition-colors border-b border-dashed border-slate-500 ${
                      opponent ? 'text-white' : 'text-slate-500 italic'
                    }`}
                    title={userRole === 'admin' ? 'Click to edit opponent' : undefined}
                  >
                    {opponent || 'Set Opponent Name'}
                  </span>
                )}
              </h1>
            </div>

            <p className="text-xs text-slate-400">
              Unified Sideline HUD &bull; Call Sheet ({totalCallSheetPlays} plays) &bull; Wristbands ({totalWristbands} active inserts) &bull; Scouting Report &bull; Play Bank ({playDatabase.length} plays)
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrintAll}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Game Day Package</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('command')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'command'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-300" />
            <span>⚡ Sideline HUD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('call_sheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'call_sheet'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-red-300" />
            <span>🏈 Call Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wristband')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'wristband'
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Watch className="w-4 h-4 text-amber-300" />
            <span>⌚ Wristbands ({totalWristbands})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scouting')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'scouting'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-300" />
            <span>📊 Scouting Report</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'command' && (
        <div className="space-y-6">
          {/* Quick Summary Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Call Sheet Quick Situations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4 text-red-400" />
                  Primary Situations (Call Sheet)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('call_sheet')}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex items-center gap-1"
                >
                  Open <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(callSheetData?.offenseSections || []).slice(0, 3).map((sec) => (
                  <div key={sec.id} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[11px] font-bold text-amber-300 uppercase mb-1">
                      {sec.title} ({sec.plays?.filter(Boolean).length || 0} plays)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(sec.plays || []).filter(Boolean).slice(0, 4).map((p: any) => (
                        <span
                          key={p.id}
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-750"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Active Wristbands Quick Reference */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Watch className="w-4 h-4 text-amber-400" />
                  Wristband Inserts ({wristbandData?.wristbands?.length || 2})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('wristband')}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex items-center gap-1"
                >
                  Open <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {(wristbandData?.wristbands || []).slice(0, 2).map((wb, idx) => (
                  <div key={wb.id} className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white uppercase block">
                        {wb.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {wb.columns?.[0]?.plays?.length || 13} rows &bull; Same labeling (1-26)
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      Insert #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Opponent Scouting Keys */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Scouting & Tendencies
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('scouting')}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex items-center gap-1"
                >
                  Open <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Base Defensive Front:</span>
                  <span className="text-white font-bold">{scouting.defensiveFronts || scouting.defenseFront || '4-3 Over / Cover 3'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Primary Coverage:</span>
                  <span className="text-white font-bold">{scouting.defenseCoverage || 'Cover 2 / Man Under'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Keys to Victory:</span>
                  <span className="text-slate-300 text-[11px]">
                    {Array.isArray(scouting.keysToVictory)
                      ? scouting.keysToVictory.join(', ')
                      : scouting.keysToVictory || 'Control line of scrimmage, establish 21/32 series dive and zone runs.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Full Wristband Quick Access */}
          <div className="space-y-2">
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Watch className="w-4 h-4 text-amber-400" />
              Active Game Day Wristbands (4.5&quot; &times; 2.25&quot;)
            </h2>
            <WristbandView
              wristbandData={wristbandData}
              userRole={userRole}
              playDatabase={playDatabase}
              onUpdatePlayDatabase={onUpdatePlayDatabase}
              onUpdateWristbandData={onUpdateWristbandData}
            />
          </div>
        </div>
      )}

      {/* Embedded Call Sheet Tab */}
      {activeTab === 'call_sheet' && (
        <CallSheetMainView
          activeTeamName={activeTeamName}
          playDatabase={playDatabase}
          onUpdatePlayDatabase={onUpdatePlayDatabase}
          callSheetData={callSheetData}
          onUpdateCallSheetData={onUpdateCallSheetData}
          deletedPlayIds={deletedPlayIds}
          onUpdateDeletedPlayIds={onUpdateDeletedPlayIds}
        />
      )}

      {/* Embedded Wristbands Tab */}
      {activeTab === 'wristband' && (
        <WristbandView
          wristbandData={wristbandData}
          userRole={userRole}
          playDatabase={playDatabase}
          onUpdatePlayDatabase={onUpdatePlayDatabase}
          onUpdateWristbandData={onUpdateWristbandData}
        />
      )}

      {/* Embedded Scouting Tab */}
      {activeTab === 'scouting' && (
        <ScoutingView
          scouting={scouting}
          userRole={userRole}
          currentUser={currentUser}
          staffList={staffList}
          savedCoaches={savedCoaches}
          scheduleEvents={scheduleEvents}
          currentWeek={currentWeek}
          onUpdateScouting={onUpdateScouting}
          onNavigateToSchedule={onNavigateToSchedule}
        />
      )}
    </div>
  );
};
