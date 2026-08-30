import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  CheckCircle2,
  Award,
  Swords,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sparkles,
  Calendar,
  MapPin,
  Flame,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  ScoutingData,
  CoachScoutingNote,
  OpponentKeyPlayer,
  StaffCoach,
  UserRole,
} from '../types';

interface ScoutingViewProps {
  scouting: ScoutingData;
  userRole: UserRole;
  currentUser?: any;
  staffList?: StaffCoach[];
  savedCoaches?: string[];
  onUpdateScouting: (field: keyof ScoutingData, val: any) => void;
}

const NOTE_CATEGORIES = [
  { id: 'Defense & Fronts', label: '🛡️ Defense & Fronts', color: 'text-indigo-400' },
  { id: 'Offense & Plays', label: '⚡ Offense & Plays', color: 'text-amber-400' },
  { id: 'O-Line & Blocking', label: '🏈 O-Line & Blocking', color: 'text-orange-400' },
  { id: 'Special Teams', label: '👟 Special Teams', color: 'text-emerald-400' },
  { id: 'QB Reads & Keys', label: '🎯 QB Reads & Keys', color: 'text-sky-400' },
  { id: 'Key Matchups', label: '⚔️ Key Matchups', color: 'text-rose-400' },
  { id: 'Sideline Adjustments', label: '📋 Sideline Adjustments', color: 'text-purple-400' },
  { id: 'General Notes', label: '📝 General Notes', color: 'text-slate-300' },
];

export const ScoutingView: React.FC<ScoutingViewProps> = ({
  scouting,
  userRole,
  currentUser,
  staffList = [],
  savedCoaches = [],
  onUpdateScouting,
}) => {
  // Current user email & power admin check
  const currentEmail = (currentUser?.email || '').toLowerCase().trim();
  const isPowerAdmin =
    currentEmail === 'dannym1010@gmail.com' ||
    userRole === 'admin' ||
    currentEmail.includes('admin');

  // Filter state for coach notes
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // New Note Modal / Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteCategory, setNewNoteCategory] = useState('Defense & Fronts');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCoachEmail, setNewNoteCoachEmail] = useState(
    currentEmail || 'dannym1010@gmail.com'
  );
  const [newNoteCoachName, setNewNoteCoachName] = useState(
    currentUser?.displayName || (isPowerAdmin ? 'Coach Danny (Head Coach)' : 'Assistant Coach')
  );

  // Editing Note State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editContent, setEditContent] = useState('');

  // Keys to victory helper
  const keysToVictory: string[] = scouting.keysToVictory || [];
  const [newKeyText, setNewKeyText] = useState('');

  // Opponent key players helper
  const keyPlayersList: OpponentKeyPlayer[] = scouting.keyPlayersList || [];
  const [newPlayerNum, setNewPlayerNum] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('');
  const [newPlayerThreat, setNewPlayerThreat] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newPlayerNotes, setNewPlayerNotes] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Coach notes array
  const coachNotes: CoachScoutingNote[] = scouting.coachNotes || [];

  // Helper to determine if current user can edit a given note
  const canEditNote = (note: CoachScoutingNote): boolean => {
    if (isPowerAdmin) return true; // dannym1010@gmail.com and Admin can edit everything
    if (!currentEmail) return false;
    return note.coachEmail?.toLowerCase().trim() === currentEmail;
  };

  // Add Key to Victory
  const handleAddKey = () => {
    if (!newKeyText.trim()) return;
    const updated = [...keysToVictory, newKeyText.trim()];
    onUpdateScouting('keysToVictory', updated);
    setNewKeyText('');
  };

  const handleRemoveKey = (idx: number) => {
    if (!isPowerAdmin && userRole !== 'admin') return;
    const updated = keysToVictory.filter((_, i) => i !== idx);
    onUpdateScouting('keysToVictory', updated);
  };

  // Add Key Player
  const handleAddPlayer = () => {
    if (!newPlayerNum.trim() && !newPlayerName.trim()) return;
    const newEntry: OpponentKeyPlayer = {
      id: 'kp_' + Date.now(),
      num: newPlayerNum.trim() || '00',
      name: newPlayerName.trim() || 'Opponent Player',
      pos: newPlayerPos.trim().toUpperCase() || 'ATH',
      threatLevel: newPlayerThreat,
      notes: newPlayerNotes.trim(),
    };
    const updated = [...keyPlayersList, newEntry];
    onUpdateScouting('keyPlayersList', updated);
    setNewPlayerNum('');
    setNewPlayerName('');
    setNewPlayerPos('');
    setNewPlayerNotes('');
    setIsAddingPlayer(false);
  };

  const handleRemovePlayer = (id: string) => {
    if (!isPowerAdmin && userRole !== 'admin') return;
    const updated = keyPlayersList.filter((p) => p.id !== id);
    onUpdateScouting('keyPlayersList', updated);
  };

  // Add Coach Note
  const handleCreateCoachNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    const newNote: CoachScoutingNote = {
      id: 'cn_' + Date.now(),
      coachEmail: newNoteCoachEmail.trim() || currentEmail || 'dannym1010@gmail.com',
      coachName: newNoteCoachName.trim() || (isPowerAdmin ? 'Coach Danny' : 'Coach'),
      category: newNoteCategory,
      title: newNoteTitle.trim() || `${newNoteCategory} Plan`,
      content: newNoteContent.trim(),
      createdAt: Date.now(),
      lastEdited: Date.now(),
      lastEditedBy: currentEmail || 'Coach',
    };
    const updated = [...coachNotes, newNote];
    onUpdateScouting('coachNotes', updated);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // Save Note Edit
  const handleSaveNoteEdit = (noteId: string) => {
    const updated = coachNotes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          title: editTitle.trim() || note.title,
          category: editCategory || note.category,
          content: editContent,
          lastEdited: Date.now(),
          lastEditedBy: currentEmail || 'Coach',
        };
      }
      return note;
    });
    onUpdateScouting('coachNotes', updated);
    setEditingNoteId(null);
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    const note = coachNotes.find((n) => n.id === noteId);
    if (!note) return;
    if (!canEditNote(note)) {
      alert('You do not have permission to delete this section. Only the author or Master Admin (Danny) can delete it.');
      return;
    }
    if (confirm(`Delete coach section "${note.title}"?`)) {
      const updated = coachNotes.filter((n) => n.id !== noteId);
      onUpdateScouting('coachNotes', updated);
    }
  };

  // Copy Full Gameplan Text
  const handleCopyGameplan = () => {
    const lines: string[] = [
      `=== MAHOPAC 10U SCOUTING REPORT & GAMEPLAN ===`,
      `Opponent: ${scouting.opponent || 'Upcoming Opponent'} | Week: ${scouting.week || 'Week 1'} | Year: ${scouting.year || '2026'}`,
      `Date & Time: ${scouting.gameDate || 'TBD'} | Location: ${scouting.gameLocation || 'TBD'}`,
      `\n[1. TEAM OVERVIEW & SCHEMES]`,
      scouting.teamOverview || 'No overview notes entered.',
      `\n[2. OFFENSIVE TENDENCIES]`,
      scouting.offensiveTendencies || 'No offensive tendency notes.',
      `\n[3. DEFENSIVE FRONTS & BLITZES]`,
      scouting.defensiveFronts || 'No defensive front notes.',
      `\n[4. SPECIAL TEAMS]`,
      scouting.specialTeamsNotes || 'No special teams notes.',
      `\n[5. KEYS TO VICTORY]`,
      ...(keysToVictory.length > 0
        ? keysToVictory.map((k, i) => `${i + 1}. ${k}`)
        : ['No keys to victory set.']),
      `\n[6. KEY OPPONENT PLAYERS]`,
      ...(keyPlayersList.length > 0
        ? keyPlayersList.map(
            (p) => `#${p.num} ${p.name} (${p.pos}) [${p.threatLevel} Threat]: ${p.notes}`
          )
        : [scouting.keyPlayers || 'No player matchups listed.']),
      `\n[7. COACHING STAFF GAMEPLAN BREAKDOWNS]`,
      ...(coachNotes.length > 0
        ? coachNotes.map(
            (n) => `--- [${n.category || 'Note'}] ${n.title} (by ${n.coachName || n.coachEmail}) ---\n${n.content}\n`
          )
        : ['No individual coach notes entered.']),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered coach notes
  const filteredNotes = coachNotes.filter((note) => {
    if (selectedCoachFilter === 'all') return true;
    if (selectedCoachFilter === 'mine') {
      return note.coachEmail?.toLowerCase().trim() === currentEmail;
    }
    return (
      note.coachEmail?.toLowerCase().trim() === selectedCoachFilter.toLowerCase().trim() ||
      note.coachName?.toLowerCase().trim() === selectedCoachFilter.toLowerCase().trim()
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar with Permission Indicator */}
      <div className="bg-slate-800/95 backdrop-blur-md p-4 md:p-5 rounded-3xl border border-slate-700/80 shadow-xl print:hidden flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                  Opponent Scouting &amp; Staff Game Plan
                </h2>
                {isPowerAdmin ? (
                  <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10.5px] font-black rounded-lg flex items-center gap-1">
                    <Award className="w-3 h-3 text-rose-400" />
                    <span>Power Admin (Danny M)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10.5px] font-black rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span>Coach Account</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Comprehensive scouting, personnel matchups, and individual coach-scoped game planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyGameplan}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-300" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-amber-500 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Print Full Scouting Report</span>
            </button>
          </div>
        </div>

        {/* User Scope Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              Active User:{' '}
              <strong className="text-slate-100">
                {currentEmail || 'Local Coach'}
              </strong>
            </span>
            {isPowerAdmin ? (
              <span className="text-amber-300 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                👑 Full Administrative Access: You can edit and manage all shared sections &amp; individual coach notes.
              </span>
            ) : (
              <span className="text-indigo-300 font-medium text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                🛡️ Individual Access: You can add and edit your own scouting sections. Other coach sections are protected.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Opponent Metadata Row */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 print:hidden">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Game Information &amp; Opponent Header</span>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            Mahopac 10U Football
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Season Year
            </label>
            <input
              type="text"
              value={scouting.year || '2026'}
              disabled={!isPowerAdmin && userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('year', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Game Week
            </label>
            <input
              type="text"
              value={scouting.week || 'Week 1'}
              disabled={!isPowerAdmin && userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('week', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Opponent Program
            </label>
            <input
              type="text"
              value={scouting.opponent || ''}
              disabled={!isPowerAdmin && userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('opponent', e.target.value)}
              placeholder="e.g. Carmel Rams"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Date &amp; Kickoff Time
            </label>
            <input
              type="text"
              value={scouting.gameDate || ''}
              disabled={!isPowerAdmin && userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('gameDate', e.target.value)}
              placeholder="e.g. Sun, Oct 4 @ 10:00 AM"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Location / Venue
            </label>
            <input
              type="text"
              value={scouting.gameLocation || ''}
              disabled={!isPowerAdmin && userRole !== 'admin'}
              onChange={(e) => onUpdateScouting('gameLocation', e.target.value)}
              placeholder="Home @ Mahopac HS / Away"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Keys to Victory & Must-Win Priorities */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 print:hidden space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-sm text-slate-100">
              Keys to Victory &amp; Critical Game Goals
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {keysToVictory.length} Goals Defined
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {keysToVictory.map((keyItem, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-700 hover:border-amber-400/40 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs font-bold text-slate-200 leading-snug break-words">
                  {keyItem}
                </p>
              </div>
              {(isPowerAdmin || userRole === 'admin') && (
                <button
                  onClick={() => handleRemoveKey(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                  title="Remove Key"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {keysToVictory.length === 0 && (
            <div className="col-span-full py-3 text-center text-xs text-slate-400 font-medium italic bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
              No keys to victory listed yet. Add high-priority execution goals below (e.g. Win turnover battle, Stop off-tackle run, Secure onside kick).
            </div>
          )}
        </div>

        {(isPowerAdmin || userRole === 'admin') && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newKeyText}
              onChange={(e) => setNewKeyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
              placeholder="Add a new key to victory (e.g. Contain #12 QB on perimeter)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddKey}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-amber-500 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Key</span>
            </button>
          </div>
        )}
      </div>

      {/* Opponent Key Personnel / Watchlist */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 print:hidden space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-sm text-slate-100">
              Opponent Key Players &amp; Matchup Watchlist
            </h3>
          </div>
          {(isPowerAdmin || userRole === 'admin') && (
            <button
              onClick={() => setIsAddingPlayer(!isAddingPlayer)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddingPlayer ? 'Cancel' : 'Add Key Player'}</span>
            </button>
          )}
        </div>

        {/* Add Player Form */}
        {isAddingPlayer && (
          <div className="p-4 bg-slate-900/95 rounded-2xl border border-indigo-500/40 space-y-3">
            <h4 className="font-black text-xs text-indigo-300 uppercase tracking-wider">
              Add Opponent Player
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Jersey #
                </label>
                <input
                  type="text"
                  value={newPlayerNum}
                  onChange={(e) => setNewPlayerNum(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value)}
                  placeholder="e.g. QB / FS"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Threat Level
                </label>
                <select
                  value={newPlayerThreat}
                  onChange={(e: any) => setNewPlayerThreat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="High">🔴 High Threat</option>
                  <option value="Medium">🟡 Medium Threat</option>
                  <option value="Low">🟢 Standard / Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Tendencies, Strengths &amp; How to Defend / Attack
              </label>
              <textarea
                rows={2}
                value={newPlayerNotes}
                onChange={(e) => setNewPlayerNotes(e.target.value)}
                placeholder="Runs outside contain on bootlegs; aggressive on run blitz; forces turnovers..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingPlayer(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayer}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md"
              >
                Save Player
              </button>
            </div>
          </div>
        )}

        {/* Players Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyPlayersList.map((player) => (
            <div
              key={player.id}
              className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-black font-mono text-xs flex items-center justify-center shrink-0">
                    #{player.num}
                  </span>
                  <div>
                    <h4 className="font-black text-xs text-slate-100 leading-tight">
                      {player.name}
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-300 font-extrabold uppercase">
                      {player.pos}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                      player.threatLevel === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : player.threatLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {player.threatLevel}
                  </span>
                  {(isPowerAdmin || userRole === 'admin') && (
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                      title="Remove Player"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
                {player.notes || 'No detailed matchup notes entered.'}
              </p>
            </div>
          ))}

          {keyPlayersList.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-slate-400 font-medium italic bg-slate-900/40 rounded-2xl border border-dashed border-slate-700">
              No key opponent players listed. Click "Add Key Player" above to track threat levels and matchup tactics.
            </div>
          )}
        </div>
      </div>

      {/* Shared Strategic Schemes & Formations Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Team Overview & Base Schemes */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Team Overview &amp; Base Philosophy</span>
            </div>
            {isPowerAdmin ? (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                Admin Editable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">
                Team Shared
              </span>
            )}
          </div>
          <textarea
            rows={5}
            value={scouting.teamOverview || ''}
            disabled={!isPowerAdmin && userRole !== 'admin'}
            onChange={(e) => onUpdateScouting('teamOverview', e.target.value)}
            placeholder="General team strengths, coaching habits, tempo (fast-break vs huddle), disciplined vs penalty prone, preferred hash marks..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-400 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-500"
          />
        </div>

        {/* Offensive Formations & Run/Pass Tendencies */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Offensive Formations &amp; Tendencies</span>
            </div>
            {isPowerAdmin ? (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                Admin Editable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">
                Team Shared
              </span>
            )}
          </div>
          <textarea
            rows={5}
            value={scouting.offensiveTendencies || ''}
            disabled={!isPowerAdmin && userRole !== 'admin'}
            onChange={(e) => onUpdateScouting('offensiveTendencies', e.target.value)}
            placeholder="Primary offensive formations (I-Formation, Wing-T, Single Wing, Spread), run/pass ratio, sweep tendencies, QB scramble habits, favorite third-down calls..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-400 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-500"
          />
        </div>

        {/* Defensive Fronts & Blitz Packages */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-sky-300 font-black text-sm">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Defensive Fronts, Coverage &amp; Blitzes</span>
            </div>
            {isPowerAdmin ? (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                Admin Editable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">
                Team Shared
              </span>
            )}
          </div>
          <textarea
            rows={5}
            value={scouting.defensiveFronts || ''}
            disabled={!isPowerAdmin && userRole !== 'admin'}
            onChange={(e) => onUpdateScouting('defensiveFronts', e.target.value)}
            placeholder="Base defensive front (5-3, 4-4, 6-2 goal line), secondary coverage (Cover 2, Cover 3, Man), corner run support aggressiveness, inside blitz frequency..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-sky-400 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-500"
          />
        </div>

        {/* Special Teams & Field Position */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Special Teams &amp; Field Position</span>
            </div>
            {isPowerAdmin ? (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                Admin Editable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">
                Team Shared
              </span>
            )}
          </div>
          <textarea
            rows={5}
            value={scouting.specialTeamsNotes || ''}
            disabled={!isPowerAdmin && userRole !== 'admin'}
            onChange={(e) => onUpdateScouting('specialTeamsNotes', e.target.value)}
            placeholder="Kickoff return coverage strengths, dangerous returners, onside kick likelihood, punt block vulnerability, extra point kick vs 2-pt conversion strategy..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-400 leading-relaxed resize-y disabled:opacity-60 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INDIVIDUAL COACH SCOUTING SECTIONS (USER-SCOPED NOTES)                    */}
      {/* ========================================================================= */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border-2 border-indigo-500/40 shadow-2xl p-5 md:p-7 print:hidden space-y-5">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-black shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                  Staff Gameplan Sections &amp; Coach Notes
                </h3>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10.5px] font-black rounded-lg border border-indigo-500/30">
                  {coachNotes.length} Section{coachNotes.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Each coach has their own dedicated section. Power Admin (Danny) has full authority over all sections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Coach */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-bold px-1.5 text-[11px]">View:</span>
              <button
                onClick={() => setSelectedCoachFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedCoachFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Staff
              </button>
              <button
                onClick={() => setSelectedCoachFilter('mine')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedCoachFilter === 'mine'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Section
              </button>
            </div>

            {/* Add New Coach Section Button */}
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coach Section</span>
            </button>
          </div>
        </div>

        {/* Modal / Form: Add Coach Section */}
        {isAddingNote && (
          <div className="bg-slate-900/95 rounded-3xl border-2 border-indigo-500/60 p-5 md:p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New Coach Scouting Section</span>
              </div>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                &times; Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Section Category
                </label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  {NOTE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Section Title / Focus
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Blitz Scheme & Inside Contain"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Author Coach / Role
                </label>
                {isPowerAdmin && staffList.length > 0 ? (
                  <select
                    value={newNoteCoachEmail}
                    onChange={(e) => {
                      setNewNoteCoachEmail(e.target.value);
                      const found = staffList.find((s) => s.email === e.target.value);
                      if (found) setNewNoteCoachName(found.role || found.email);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                  >
                    <option value="dannym1010@gmail.com">Coach Danny (Head Coach)</option>
                    {staffList.map((s, idx) => (
                      <option key={idx} value={s.email}>
                        {s.email} ({s.role || 'Staff'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newNoteCoachName}
                    onChange={(e) => setNewNoteCoachName(e.target.value)}
                    placeholder="Coach Name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Detailed Gameplan Notes &amp; Coaching Points
              </label>
              <textarea
                rows={5}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter tactical breakdown, keys for the position group, specific audible signals, blitz calls, or sideline check-ins..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-400 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoachNote}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md"
              >
                Create Section
              </button>
            </div>
          </div>
        )}

        {/* Coach Note Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isAuthor = note.coachEmail?.toLowerCase().trim() === currentEmail;
            const editable = canEditNote(note);
            const isEditingThis = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`bg-slate-900/90 rounded-2xl border transition-all flex flex-col justify-between ${
                  editable
                    ? 'border-indigo-500/40 hover:border-indigo-500/80 shadow-md'
                    : 'border-slate-700/80 opacity-90'
                }`}
              >
                {/* Note Card Header */}
                <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-black text-[10px] rounded-md border border-indigo-500/30">
                        {note.category || 'General'}
                      </span>
                      {editable ? (
                        <span className="px-1.5 py-0.2 text-[9.5px] font-black text-emerald-400 bg-emerald-500/10 rounded flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5" />
                          <span>{isPowerAdmin && !isAuthor ? 'Admin Edit' : 'You can edit'}</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 text-[9.5px] font-black text-slate-400 bg-slate-800 rounded flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          <span>Read Only</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-sm text-slate-100 tracking-tight truncate">
                      {note.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-medium">
                      <span>Coach: <strong className="text-slate-200">{note.coachName || note.coachEmail}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-500 text-[9.5px]">
                        {new Date(note.lastEdited || note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions (if permitted) */}
                  {editable && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (isEditingThis) {
                            setEditingNoteId(null);
                          } else {
                            setEditingNoteId(note.id);
                            setEditTitle(note.title);
                            setEditCategory(note.category || 'General');
                            setEditContent(note.content);
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 rounded-lg transition-colors"
                        title={isEditingThis ? 'Cancel Edit' : 'Edit Section'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Note Card Body (Viewing or In-Place Editing) */}
                <div className="p-4 flex-1">
                  {isEditingThis ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-400"
                        >
                          {NOTE_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                          Notes &amp; Strategy
                        </label>
                        <textarea
                          rows={6}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-400 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNoteEdit(note.id)}
                          className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                      {note.content || 'No detailed content entered for this section.'}
                    </p>
                  )}
                </div>

                {/* Footer status */}
                {!isEditingThis && (
                  <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Author: <strong className="text-slate-300">{note.coachEmail}</strong>
                    </span>
                    {editable ? (
                      <span className="text-emerald-400 font-bold">● Unlocked</span>
                    ) : (
                      <span className="text-slate-500 font-medium">🔒 Protected</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="col-span-full py-8 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-700 space-y-2">
              <Shield className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="font-black text-sm text-slate-300">
                No Coach Sections Created Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-medium">
                Create position-specific scouting sections (e.g. Defensive Coordinator Notes, O-Line Blocking Rules, Special Teams) that stay organized and protected.
              </p>
              <button
                onClick={() => setIsAddingNote(true)}
                className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Coach Section</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH-VISIBILITY PRINT VIEW FOR SIDELINES                                  */}
      {/* ========================================================================= */}
      <div className="hidden print:block space-y-4 bg-white text-black p-2">
        {/* Printable Header */}
        <div className="border-b-2 border-black pb-2 text-center">
          <h1 className="text-lg font-black uppercase tracking-wider">
            Mahopac 10U Football &bull; Opponent Scouting Report &bull; {scouting.opponent || 'Upcoming Game'}
          </h1>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-4 mt-1">
            <span>Year: {scouting.year || '2026'}</span>
            <span>Week: {scouting.week || 'Week 1'}</span>
            <span>Date: {scouting.gameDate || 'TBD'}</span>
            <span>Location: {scouting.gameLocation || 'TBD'}</span>
          </div>
        </div>

        {/* Keys to Victory */}
        {keysToVictory.length > 0 && (
          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              1. Keys to Victory &amp; Critical Goals
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold text-black">
              {keysToVictory.map((k, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span>&bull;</span>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Schemes & Formations */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              2. Team Overview &amp; Base Philosophy
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight">
              {scouting.teamOverview || 'No overview notes entered.'}
            </p>
          </div>

          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              3. Offensive Formations &amp; Tendencies
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight">
              {scouting.offensiveTendencies || 'No offensive tendency notes entered.'}
            </p>
          </div>

          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              4. Defensive Fronts, Coverage &amp; Blitzes
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight">
              {scouting.defensiveFronts || 'No defensive front notes entered.'}
            </p>
          </div>

          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              5. Special Teams &amp; Field Position
            </h3>
            <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight">
              {scouting.specialTeamsNotes || 'No special teams notes entered.'}
            </p>
          </div>
        </div>

        {/* Key Opponent Personnel */}
        {keyPlayersList.length > 0 && (
          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-1.5 text-black">
              6. Opponent Key Players &amp; Matchup Watchlist
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-black">
              {keyPlayersList.map((p, i) => (
                <div key={i} className="border border-black p-1.5">
                  <div className="flex justify-between font-black mb-0.5">
                    <span>#{p.num} {p.name} ({p.pos})</span>
                    <span>[{p.threatLevel} Threat]</span>
                  </div>
                  <p className="text-[11px] font-normal leading-tight">{p.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Coach Sections */}
        {coachNotes.length > 0 && (
          <div className="border-2 border-black p-2.5 rounded-none">
            <h3 className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-2 text-black">
              7. Coaching Staff Gameplan Breakdowns
            </h3>
            <div className="space-y-2">
              {coachNotes.map((cn, i) => (
                <div key={i} className="border-b border-black/60 pb-1.5">
                  <div className="flex justify-between font-black text-xs mb-0.5">
                    <span>[{cn.category || 'Note'}] {cn.title}</span>
                    <span className="text-[10px]">Coach: {cn.coachName || cn.coachEmail}</span>
                  </div>
                  <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight">
                    {cn.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
