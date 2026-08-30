import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Shield,
  Zap,
  Download,
  Upload,
  Search,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { RosterPlayer, UserRole } from '../types';
import { MASTER_ROSTER } from '../data/initialData';

interface RosterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterPlayer[];
  onUpdateRoster: (newRoster: RosterPlayer[]) => void;
  userRole: UserRole;
  editingPlayer?: RosterPlayer | null;
  onClearEditingPlayer?: () => void;
}

const COMMON_POSITIONS = [
  'QB', 'RB', 'FB', 'TB', 'WR', 'TE', 'X', 'Z', 'W', 'Y1',
  'LT', 'LG', 'C', 'RG', 'RT', 'OL',
  'DE', 'DT', 'NT', 'MLB', 'OLB', 'ILB', 'M', 'W', 'S', 'R', 'E9', 'E5', 'T3', 'T1',
  'CB', 'FS', 'SS', 'LCB', 'RCB', 'DB',
  'K', 'P', 'LS', 'H', 'RET', 'ATH'
];

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  isOpen,
  onClose,
  roster,
  onUpdateRoster,
  userRole,
  editingPlayer: initialEditingPlayer,
  onClearEditingPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'csv'>('list');

  // Form State for Add / Edit
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [num, setNum] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [primaryPos, setPrimaryPos] = useState('RB');
  const [secondaryPos, setSecondaryPos] = useState('CB');
  const [offensivePos, setOffensivePos] = useState('');
  const [defensivePos, setDefensivePos] = useState('');
  const [conditioningHours, setConditioningHours] = useState<number>(10);
  const [paddedHours, setPaddedHours] = useState<number>(10);
  const [isCaptain, setIsCaptain] = useState(false);
  const [notes, setNotes] = useState('');
  const [csvText, setCsvText] = useState('');
  const [formError, setFormError] = useState('');

  // Handle opening directly in edit mode if editingPlayer prop is provided
  React.useEffect(() => {
    if (initialEditingPlayer) {
      const idx = roster.findIndex((p) => p.num === initialEditingPlayer.num);
      if (idx >= 0) {
        startEditPlayer(initialEditingPlayer, idx);
      }
    }
  }, [initialEditingPlayer]);

  if (!isOpen) return null;

  const startAddPlayer = () => {
    setEditingIndex(null);
    setNum('');
    setFirstName('');
    setLastName('');
    setPrimaryPos('RB');
    setSecondaryPos('CB');
    setOffensivePos('');
    setDefensivePos('');
    setConditioningHours(10);
    setPaddedHours(10);
    setIsCaptain(false);
    setNotes('');
    setFormError('');
    setActiveTab('add');
  };

  const startEditPlayer = (player: RosterPlayer, idx: number) => {
    setEditingIndex(idx);
    setNum(player.num);
    setFirstName(player.firstName);
    setLastName(player.lastName);
    setPrimaryPos(player.primaryPosition || 'RB');
    setSecondaryPos(player.secondaryPosition || 'CB');
    setOffensivePos(player.offensivePosition || '');
    setDefensivePos(player.defensivePosition || '');
    setConditioningHours(Number(player.conditioningHours || 0));
    setPaddedHours(Number(player.paddedHours || 0));
    setIsCaptain(!!player.isCaptain);
    setNotes(player.notes || '');
    setFormError('');
    setActiveTab('add');
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!num.trim()) {
      setFormError('Jersey number is required');
      return;
    }
    if (!firstName.trim()) {
      setFormError('First name is required');
      return;
    }

    const cleanNum = num.trim().replace(/\D/g, '');
    if (!cleanNum) {
      setFormError('Jersey number must contain digits');
      return;
    }

    // Check duplicate jersey number if adding or changing
    const duplicate = roster.some(
      (p, i) => p.num === cleanNum && i !== editingIndex
    );
    if (duplicate) {
      setFormError(`Jersey #${cleanNum} is already assigned to another player.`);
      return;
    }

    const newPlayer: RosterPlayer = {
      num: cleanNum,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      primaryPosition: primaryPos,
      secondaryPosition: secondaryPos,
      offensivePosition: offensivePos.trim() || primaryPos,
      defensivePosition: defensivePos.trim() || secondaryPos,
      conditioningHours: Number(conditioningHours) || 0,
      paddedHours: Number(paddedHours) || 0,
      isCaptain,
      notes: notes.trim(),
    };

    let updated: RosterPlayer[];
    if (editingIndex !== null && editingIndex >= 0) {
      updated = [...roster];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...newPlayer,
      };
    } else {
      updated = [...roster, newPlayer];
      // Sort roster by jersey number
      updated.sort((a, b) => parseInt(a.num, 10) - parseInt(b.num, 10));
    }

    onUpdateRoster(updated);
    if (onClearEditingPlayer) onClearEditingPlayer();
    setActiveTab('list');
  };

  const handleDeletePlayer = (numToDelete: string) => {
    if (!window.confirm(`Are you sure you want to remove #${numToDelete} from the roster?`)) {
      return;
    }
    const updated = roster.filter((p) => p.num !== numToDelete);
    onUpdateRoster(updated);
  };

  const handleResetToDefaultRoster = () => {
    if (
      window.confirm(
        'Reset to the official 26-man Mahopac 10U roster with all assigned positions and compliance data?'
      )
    ) {
      onUpdateRoster([...MASTER_ROSTER]);
    }
  };

  // CSV Import Parser
  const handleImportCSV = () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.trim().split('\n');
      const imported: RosterPlayer[] = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const rawNum = parts[0].replace(/\D/g, '');
          const fName = parts[1] || '';
          const lName = parts[2] || '';
          const pPos = parts[3] || 'ATH';
          const sPos = parts[4] || 'ATH';

          if (rawNum && fName) {
            imported.push({
              num: rawNum,
              firstName: fName,
              lastName: lName,
              primaryPosition: pPos,
              secondaryPosition: sPos,
              conditioningHours: 10,
              paddedHours: 10,
            });
          }
        }
      });

      if (imported.length > 0) {
        onUpdateRoster(imported);
        alert(`Successfully imported ${imported.length} players!`);
        setActiveTab('list');
        setCsvText('');
      } else {
        alert('Could not parse any players from CSV. Ensure format is: Jersey#, FirstName, LastName, PrimaryPos, SecondaryPos');
      }
    } catch (err) {
      alert('Error parsing CSV');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const header = 'Jersey,FirstName,LastName,PrimaryPos,SecondaryPos,ConditioningHours,PaddedHours\n';
    const rows = roster
      .map(
        (p) =>
          `${p.num},"${p.firstName}","${p.lastName}","${p.primaryPosition || ''}","${
            p.secondaryPosition || ''
          }",${p.conditioningHours || 0},${p.paddedHours || 0}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mahopac_10U_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRoster = roster.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.num.includes(term) ||
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      (p.primaryPosition || '').toLowerCase().includes(term) ||
      (p.secondaryPosition || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>Roster &amp; Player Management</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
                  {roster.length} Players
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                User-editable roster with custom positions, jersey numbers, and practice hours
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onClearEditingPlayer) onClearEditingPlayer();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Players ({roster.length})
            </button>
            {userRole === 'admin' && (
              <>
                <button
                  onClick={startAddPlayer}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'add' && editingIndex === null
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New Player</span>
                </button>
                <button
                  onClick={() => setActiveTab('csv')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'csv'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>CSV Import / Export</span>
                </button>
              </>
            )}
          </div>

          {userRole === 'admin' && activeTab === 'list' && (
            <button
              onClick={handleResetToDefaultRoster}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-950/40 border border-rose-900/30 transition-all"
              title="Reset roster to default 26 players"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Mahopac Defaults</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: ALL PLAYERS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, jersey, or position..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player Name</th>
                      <th className="py-2.5 px-3">Offense Pos</th>
                      <th className="py-2.5 px-3">Defense Pos</th>
                      <th className="py-2.5 px-3">Conditioning</th>
                      <th className="py-2.5 px-3">Padded</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredRoster.map((player, idx) => {
                      const condH = Number(player.conditioningHours || 0);
                      const padH = Number(player.paddedHours || 0);
                      const isPadsCleared = condH >= 10;
                      const isScrimmageCleared = isPadsCleared && padH >= 10;

                      return (
                        <tr key={player.num} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-black text-indigo-400">
                            #{player.num}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span>{player.firstName} {player.lastName}</span>
                              {player.isCaptain && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                                  C
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-indigo-500/30 font-black text-[10px]">
                              {player.primaryPosition || 'ATH'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/30 font-black text-[10px]">
                              {player.secondaryPosition || 'ATH'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className={isPadsCleared ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                              {condH.toFixed(1)} / 10h
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className={isScrimmageCleared ? 'text-emerald-400 font-bold' : 'text-sky-400 font-bold'}>
                              {padH.toFixed(1)} / 10h
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {userRole === 'admin' && (
                                <>
                                  <button
                                    onClick={() => startEditPlayer(player, idx)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all"
                                    title="Edit player"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(player.num)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                                    title="Delete player"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADD / EDIT PLAYER FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSavePlayer} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-3">
                  <h4 className="font-black text-sm text-slate-100">
                    {editingIndex !== null ? `Edit Player #${num}` : 'Add New Player to Roster'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Back to List
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Jersey & Name */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      Jersey # *
                    </label>
                    <input
                      type="text"
                      value={num}
                      onChange={(e) => setNum(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Luke"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mancini"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Positions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      Offense / Primary Position
                    </label>
                    <select
                      value={primaryPos}
                      onChange={(e) => setPrimaryPos(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {COMMON_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      Defense / Secondary Position
                    </label>
                    <select
                      value={secondaryPos}
                      onChange={(e) => setSecondaryPos(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {COMMON_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Acclimatization Practice Hours */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Conditioning Hours (Target: 10h)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={conditioningHours}
                      onChange={(e) => setConditioningHours(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-slate-400">Needs 10h to wear full pads</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-sky-300 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Padded Hours (Target: 10h)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={paddedHours}
                      onChange={(e) => setPaddedHours(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                    />
                    <span className="text-[10px] text-slate-400">Needs 10h to play scrimmage</span>
                  </div>
                </div>

                {/* Captain toggle & Notes */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCaptain}
                      onChange={(e) => setIsCaptain(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-amber-300">Team Captain Designation</span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Player Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Coaching notes, medical reminders..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingIndex !== null ? 'Update Player' : 'Add Player to Roster'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CSV IMPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-black text-sm text-slate-100">Bulk Import via CSV / Text</h4>
                <p className="text-xs text-slate-400">
                  Paste roster data. Format per line: <br/>
                  <code className="text-indigo-300 font-mono text-[11px]">
                    Jersey#, FirstName, LastName, PrimaryPos, SecondaryPos
                  </code>
                </p>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`10, Luke, Mancini, QB, FS\n2, Mohammed, Ibrahim, RB, CB\n56, Ryan, Russell, LT, DE`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleImportCSV}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Parse &amp; Import Roster</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
