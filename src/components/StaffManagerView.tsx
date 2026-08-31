import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Check,
  X,
  Trash2,
  Plus,
  Layers,
  Edit2,
  AlertTriangle,
  Crown,
  Lock,
  Copy,
  ChevronDown,
  Star,
} from 'lucide-react';
import { StaffCoach, UserRole, Team } from '../types';

interface StaffManagerViewProps {
  staffList: StaffCoach[];
  savedCoaches: string[];
  teamSavedCoaches?: Record<string, string[]>;
  userRole: UserRole;
  teams: Team[];
  activeTeamId: string;
  defaultTeamId?: string;
  onSelectTeam: (teamId: string) => void;
  onSetDefaultTeam?: (teamId: string) => void;
  onAddTeam: (team: Omit<Team, 'id'>) => void;
  onUpdateTeam: (teamId: string, updated: Partial<Team>) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddStaffCoach: (email: string, role?: string, assignedTeamIds?: string[]) => void;
  onUpdateStaffRole: (idx: number, role: string) => void;
  onToggleStaffApproval: (idx: number) => void;
  onRemoveStaffCoach: (idx: number) => void;
  onUpdateStaffAssignedTeams: (idx: number, teamIds: string[]) => void;
  onAddNewSavedCoach: (name: string, teamId?: string) => void;
  onDeleteSavedCoach: (name: string, teamId?: string) => void;
  onCopyCoachesFromTeam?: (sourceTeamId: string, targetTeamId: string) => void;
}

export const StaffManagerView: React.FC<StaffManagerViewProps> = ({
  staffList,
  savedCoaches,
  teamSavedCoaches = {},
  userRole,
  teams = [],
  activeTeamId,
  defaultTeamId,
  onSelectTeam,
  onSetDefaultTeam,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddStaffCoach,
  onUpdateStaffRole,
  onToggleStaffApproval,
  onRemoveStaffCoach,
  onUpdateStaffAssignedTeams,
  onAddNewSavedCoach,
  onDeleteSavedCoach,
  onCopyCoachesFromTeam,
}) => {
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamAge, setNewTeamAge] = useState('10U');
  const [newTeamSeason, setNewTeamSeason] = useState('2026');
  const [newTeamColor, setNewTeamColor] = useState('indigo');
  const [newTeamCalendarUrl, setNewTeamCalendarUrl] = useState('');

  // Add Staff Coach Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Head Coach (Admin)');
  const [newStaffAssignedTeams, setNewStaffAssignedTeams] = useState<string[]>([activeTeamId]);

  // Saved Practice Coaches per Team State
  const [practiceCoachTeamFilter, setPracticeCoachTeamFilter] = useState<string>(activeTeamId);
  const [showAddPracticeCoachModal, setShowAddPracticeCoachModal] = useState(false);
  const [newPracticeCoachName, setNewPracticeCoachName] = useState('');
  const [showCopyCoachesModal, setShowCopyCoachesModal] = useState(false);
  const [copySourceTeamId, setCopySourceTeamId] = useState(teams[0]?.id || '');

  // Keep practiceCoachTeamFilter in sync if activeTeamId changes
  React.useEffect(() => {
    if (activeTeamId && teams.some((t) => t.id === activeTeamId)) {
      setPracticeCoachTeamFilter(activeTeamId);
    }
  }, [activeTeamId, teams]);

  const activeFilterTeam = teams.find((t) => t.id === practiceCoachTeamFilter) || teams[0];
  const currentTeamPracticeCoaches =
    teamSavedCoaches[practiceCoachTeamFilter] || savedCoaches;

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    onAddTeam({
      name: newTeamName.trim(),
      ageGroup: newTeamAge.trim() || 'Youth',
      season: newTeamSeason.trim() || '2026',
      color: newTeamColor,
      headCoachName: 'Head Coach',
      calendarUrl: newTeamCalendarUrl.trim() || undefined,
    });
    setNewTeamName('');
    setNewTeamAge('10U');
    setNewTeamCalendarUrl('');
    setShowAddTeamModal(false);
  };

  const handleSaveEditedTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.name.trim()) return;
    onUpdateTeam(editingTeam.id, {
      name: editingTeam.name.trim(),
      ageGroup: editingTeam.ageGroup?.trim(),
      season: editingTeam.season?.trim(),
      color: editingTeam.color,
      calendarUrl: editingTeam.calendarUrl?.trim() || undefined,
    });
    setEditingTeam(null);
  };

  const handleConfirmDeleteTeam = () => {
    if (!teamToDelete) return;
    onDeleteTeam(teamToDelete.id);
    setTeamToDelete(null);
  };

  const handleCreateStaffCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim()) return;
    onAddStaffCoach(
      newStaffEmail.trim().toLowerCase(),
      newStaffRole,
      newStaffAssignedTeams.length > 0 ? newStaffAssignedTeams : [activeTeamId]
    );
    setNewStaffEmail('');
    setNewStaffRole('Head Coach (Admin)');
    setNewStaffAssignedTeams([activeTeamId]);
    setShowAddStaffModal(false);
  };

  const handleCreatePracticeCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPracticeCoachName.trim()) return;
    onAddNewSavedCoach(newPracticeCoachName.trim(), practiceCoachTeamFilter);
    setNewPracticeCoachName('');
    setShowAddPracticeCoachModal(false);
  };

  const toggleTeamForCoach = (coachIdx: number, coach: StaffCoach, teamId: string) => {
    if (userRole !== 'admin') return;
    let currentAssigned = coach.assignedTeamIds || [];

    // If currently 'all' or empty, initialize with all team IDs except clicked
    if (currentAssigned.length === 0 || currentAssigned.includes('all')) {
      const allIds = teams.map((t) => t.id);
      currentAssigned = allIds.filter((id) => id !== teamId);
    } else if (currentAssigned.includes(teamId)) {
      currentAssigned = currentAssigned.filter((id) => id !== teamId);
    } else {
      currentAssigned = [...currentAssigned, teamId];
    }
    onUpdateStaffAssignedTeams(coachIdx, currentAssigned);
  };

  const setAllTeamsForCoach = (coachIdx: number) => {
    if (userRole !== 'admin') return;
    onUpdateStaffAssignedTeams(coachIdx, ['all']);
  };

  const isMasterSuperAdminUser = (email: string) => {
    const clean = email.toLowerCase().trim();
    return clean.includes('dannym1010') || clean === 'dannym1010@gmail.com';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight flex items-center gap-2">
                <span>Program Teams, Staff &amp; Access Permissions</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  dannym1010 Super Admin
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Manage football teams, control which specific teams each Head Coach &amp; Assistant Coach can access, and configure practice coaches per team.
              </p>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95 border border-indigo-400/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Team</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: PROGRAM TEAMS & DIVISIONS */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-sm text-slate-100">
              Program Teams &amp; Age Divisions ({teams.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Each team maintains its own roster, schedule, depth chart, formations &amp; practice coaches
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isActive = team.id === activeTeamId;
            const isDefault = (defaultTeamId || (teams[0] && teams[0].id)) === team.id;

            return (
              <div
                key={team.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {team.ageGroup || 'Division'}
                      </span>
                      {isDefault && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>Default</span>
                        </span>
                      )}
                    </div>
                    {team.season && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        {team.season}
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-sm text-slate-100 tracking-tight">
                    {team.name}
                  </h4>
                  {team.headCoachName && (
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Coach: <span className="font-semibold text-slate-100">{team.headCoachName}</span>
                    </p>
                  )}
                  {team.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {team.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectTeam(team.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{isActive ? 'Active' : 'Switch'}</span>
                    </button>

                    {onSetDefaultTeam && !isDefault && (
                      <button
                        type="button"
                        onClick={() => onSetDefaultTeam(team.id)}
                        title="Set as startup default team"
                        className="px-2 py-1.5 rounded-xl text-[11px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-slate-400" />
                        <span className="hidden sm:inline">Set Default</span>
                      </button>
                    )}
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Team Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTeamToDelete(team)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: STAFF & COACH ACCESS PERMISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Accounts & Team Assignments */}
        <div className="lg:col-span-2 bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-700 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h3 className="font-black text-sm text-slate-100">
                  Staff Accounts &amp; Team Access Permissions
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <strong className="text-amber-300">dannym1010</strong> has permanent full access to all teams. Head Coaches only access teams allowed below.
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Coach Account</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-black uppercase text-[10px] border-b border-slate-700">
                  <th className="py-3 px-3 text-left">Email / User</th>
                  <th className="py-3 px-3 text-left">Role Assigned</th>
                  <th className="py-3 px-3 text-left">Allowed Teams</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  {userRole === 'admin' && (
                    <th className="py-3 px-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {staffList.map((coach, idx) => {
                  const isMaster = isMasterSuperAdminUser(coach.email);
                  const isHeadCoachRole = coach.role.toLowerCase().includes('head coach');
                  const isActive = coach.status === 'Active';
                  const isAssignedAll =
                    !coach.assignedTeamIds ||
                    coach.assignedTeamIds.length === 0 ||
                    coach.assignedTeamIds.includes('all');

                  return (
                    <tr key={idx} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-100 font-mono">
                        <div className="flex items-center gap-1.5">
                          {isMaster && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span>{coach.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {isMaster ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10.5px] border border-amber-500/30 inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Master Super Admin</span>
                          </span>
                        ) : userRole === 'admin' ? (
                          <select
                            value={coach.role}
                            onChange={(e) =>
                              onUpdateStaffRole(idx, e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none"
                          >
                            <option value="Head Coach (Admin)">
                              Head Coach (Admin)
                            </option>
                            <option value="Assistant Coach">
                              Assistant Coach
                            </option>
                          </select>
                        ) : (
                          <span className="font-semibold text-slate-300">
                            {coach.role}
                          </span>
                        )}
                      </td>

                      {/* Assigned Teams Access */}
                      <td className="py-3.5 px-3">
                        {isMaster ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>All Teams (Permanent Full Access)</span>
                          </span>
                        ) : userRole === 'admin' ? (
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            <button
                              type="button"
                              onClick={() => setAllTeamsForCoach(idx)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                isAssignedAll
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700'
                              }`}
                              title="Grant access to all teams"
                            >
                              All Teams
                            </button>
                            {teams.map((t) => {
                              const hasAccess =
                                isAssignedAll ||
                                (coach.assignedTeamIds &&
                                  coach.assignedTeamIds.includes(t.id));
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => toggleTeamForCoach(idx, coach, t.id)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    hasAccess && !isAssignedAll
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : hasAccess && isAssignedAll
                                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
                                  }`}
                                  title={`Toggle access to ${t.name}`}
                                >
                                  <span>{t.ageGroup || t.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 font-medium">
                            {isAssignedAll
                              ? 'All Teams'
                              : teams
                                  .filter((t) => coach.assignedTeamIds?.includes(t.id))
                                  .map((t) => t.ageGroup || t.name)
                                  .join(', ') || 'No Teams Assigned'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {coach.status}
                        </span>
                      </td>

                      {userRole === 'admin' && (
                        <td className="py-3.5 px-3 text-right">
                          {!isMaster ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onToggleStaffApproval(idx)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-slate-900 hover:bg-slate-750 text-slate-300 border border-slate-700'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                                }`}
                              >
                                {isActive ? 'Deactivate' : 'Approve'}
                              </button>
                              <button
                                onClick={() => onRemoveStaffCoach(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Remove staff account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10.5px] text-amber-400/80 font-bold italic">
                              Owner
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Saved Practice Coaches Roster (Per-Team) */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-700 flex-wrap gap-2">
            <div>
              <h3 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                <span>Practice Coaches</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Per Team
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Staff names for drill stations
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddPracticeCoachModal(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Name</span>
              </button>
            )}
          </div>

          {/* Team Filter for Practice Coaches */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Coaching Staff for Team:
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={practiceCoachTeamFilter}
                onChange={(e) => setPracticeCoachTeamFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.ageGroup || 'Youth'})
                  </option>
                ))}
              </select>

              {userRole === 'admin' && teams.length > 1 && onCopyCoachesFromTeam && (
                <button
                  type="button"
                  onClick={() => setShowCopyCoachesModal(true)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  title="Copy coaches from another team"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {currentTeamPracticeCoaches.map((coachName) => (
              <div
                key={coachName}
                className="p-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-200 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>{coachName}</span>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => onDeleteSavedCoach(coachName, practiceCoachTeamFilter)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title={`Remove ${coachName} from ${activeFilterTeam?.name || 'this team'}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {currentTeamPracticeCoaches.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No practice coaches listed for this team yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE NEW TEAM MODAL */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white">Create New Football Team</h3>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. 10U Tackle Gold, 12U White, 8U Flag"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Age Group / Division
                  </label>
                  <input
                    type="text"
                    value={newTeamAge}
                    onChange={(e) => setNewTeamAge(e.target.value)}
                    placeholder="e.g. 10U, 12U, 8U, Flag"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Season
                  </label>
                  <input
                    type="text"
                    value={newTeamSeason}
                    onChange={(e) => setNewTeamSeason(e.target.value)}
                    placeholder="e.g. 2026, Fall 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  TeamSnap / iCal Feed URL (Optional)
                </label>
                <input
                  type="url"
                  value={newTeamCalendarUrl}
                  onChange={(e) => setNewTeamCalendarUrl(e.target.value)}
                  placeholder="http://ical-cdn.teamsnap.com/team_schedule/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Each team can have its own separate TeamSnap calendar feed URL.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Badge Color Theme
                </label>
                <div className="flex items-center gap-3">
                  {['indigo', 'amber', 'emerald', 'sky', 'rose', 'purple'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTeamColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        newTeamColor === c ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent'
                      } ${
                        c === 'indigo'
                          ? 'bg-indigo-600'
                          : c === 'amber'
                          ? 'bg-amber-500'
                          : c === 'emerald'
                          ? 'bg-emerald-500'
                          : c === 'sky'
                          ? 'bg-sky-500'
                          : c === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-purple-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white">Edit Team Details</h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingTeam.name}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Age Group / Division
                  </label>
                  <input
                    type="text"
                    value={editingTeam.ageGroup || ''}
                    onChange={(e) =>
                      setEditingTeam({ ...editingTeam, ageGroup: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Season
                  </label>
                  <input
                    type="text"
                    value={editingTeam.season || ''}
                    onChange={(e) =>
                      setEditingTeam({ ...editingTeam, season: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  TeamSnap / iCal Feed URL
                </label>
                <input
                  type="url"
                  value={editingTeam.calendarUrl || ''}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, calendarUrl: e.target.value })
                  }
                  placeholder="http://ical-cdn.teamsnap.com/team_schedule/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Custom schedule feed for this team.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TEAM CONFIRMATION MODAL */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  Delete Team "{teamToDelete.name}"?
                </h3>
                <p className="text-xs text-rose-300/80 font-medium">
                  This action will permanently delete this team.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              Are you sure you want to remove <strong className="text-white font-bold">{teamToDelete.name}</strong> from the program? Any coach permissions, schedule events, and roster players assigned to this team will be cleanly updated.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STAFF COACH MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white">Add Coach Account</h3>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffCoach} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Coach Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="coach.name@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Role Assigned
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Head Coach (Admin)">Head Coach (Admin)</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                </select>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Head Coaches can build plays &amp; schedules for their allowed teams.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Allowed Teams (Access Permissions)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {teams.map((t) => {
                    const isChecked = newStaffAssignedTeams.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer text-xs font-bold text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewStaffAssignedTeams([...newStaffAssignedTeams, t.id]);
                            } else {
                              setNewStaffAssignedTeams(
                                newStaffAssignedTeams.filter((id) => id !== t.id)
                              );
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                        />
                        <span>{t.name} ({t.ageGroup || 'Youth'})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Add Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRACTICE COACH MODAL */}
      {showAddPracticeCoachModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">
                  Add Practice Coach for {activeFilterTeam?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddPracticeCoachModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePracticeCoach} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Coach Title or Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPracticeCoachName}
                  onChange={(e) => setNewPracticeCoachName(e.target.value)}
                  placeholder="e.g. Coach Davis, Line Coach, Offensive Coordinator"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Team Scoped To:
                </label>
                <select
                  value={practiceCoachTeamFilter}
                  onChange={(e) => setPracticeCoachTeamFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ageGroup || 'Youth'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPracticeCoachModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Save Practice Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COPY COACHES MODAL */}
      {showCopyCoachesModal && onCopyCoachesFromTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white">
                  Copy Practice Coaches
                </h3>
              </div>
              <button
                onClick={() => setShowCopyCoachesModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Copy the practice station coaching list from another team into{' '}
                <strong className="text-white">{activeFilterTeam?.name}</strong>:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Source Team:
                </label>
                <select
                  value={copySourceTeamId}
                  onChange={(e) => setCopySourceTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  {teams
                    .filter((t) => t.id !== practiceCoachTeamFilter)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCopyCoachesModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCopyCoachesFromTeam(copySourceTeamId, practiceCoachTeamFilter);
                    setShowCopyCoachesModal(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Copy List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
