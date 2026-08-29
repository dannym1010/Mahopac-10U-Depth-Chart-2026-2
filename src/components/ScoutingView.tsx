import React from 'react';
import { FileSpreadsheet, Printer, ShieldAlert, Users } from 'lucide-react';
import { ScoutingData, UserRole } from '../types';

interface ScoutingViewProps {
  scouting: ScoutingData;
  userRole: UserRole;
  onUpdateScouting: (field: keyof ScoutingData, val: string) => void;
}

export const ScoutingView: React.FC<ScoutingViewProps> = ({
  scouting,
  userRole,
  onUpdateScouting,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black shadow-inner">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
              Opponent Scouting & Game Plan Report
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Weekly tendencies, keys to victory, defensive fronts, and player match-ups
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-800 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Scouting Sheet</span>
        </button>
      </div>

      {/* Main Bento Form Card */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-6 md:p-8 space-y-6">
        {/* Meta Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Season Year
            </label>
            <input
              type="text"
              value={scouting.year || '2026'}
              disabled={userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('year', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Game Week
            </label>
            <input
              type="text"
              value={scouting.week || 'Week 1'}
              disabled={userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('week', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Opponent Name / Program
            </label>
            <input
              type="text"
              value={scouting.opponent || ''}
              disabled={userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('opponent', e.target.value)}
              placeholder="e.g. Carmel / Yorktown"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Text Areas Bento Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Team Overview */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-sm pb-1">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Team Overview, Formations & Tendencies</span>
            </div>
            <textarea
              rows={10}
              value={scouting.teamOverview || ''}
              disabled={userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('teamOverview', e.target.value)}
              placeholder="Enter offensive schemes (e.g. heavy I-formation, sweep right tendency), defensive fronts (5-3 or 4-4), blitz packages, and special teams notes..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-600"
            />
          </div>

          {/* Key Players */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-sm pb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Key Players to Watch & Matchup Notes</span>
            </div>
            <textarea
              rows={10}
              value={scouting.keyPlayers || ''}
              disabled={userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('keyPlayers', e.target.value)}
              placeholder="#12 QB - Runs outside contain when pressured.&#10;#24 RB - Hard downhill runner, cuts back inside A-gap.&#10;#55 MLB - Aggressive flow, vulnerable to play-action pass..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Printable View (Visible only during print for high visibility) */}
        <div className="hidden print:block space-y-4">
          <div className="border-2 border-black p-3 rounded-md">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-2 text-black">
              1. Team Overview, Formations & Tendencies
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-relaxed">
              {scouting.teamOverview || 'No overview notes entered.'}
            </p>
          </div>

          <div className="border-2 border-black p-3 rounded-md">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-2 text-black">
              2. Key Players to Watch & Matchup Notes
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-relaxed">
              {scouting.keyPlayers || 'No player matchup notes entered.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
