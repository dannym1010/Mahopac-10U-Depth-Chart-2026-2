import React from 'react';
import { Users, UserPlus, Shield, Check, X, Trash2, Plus } from 'lucide-react';
import { StaffCoach, UserRole } from '../types';

interface StaffManagerViewProps {
  staffList: StaffCoach[];
  savedCoaches: string[];
  userRole: UserRole;
  onAddStaffCoach: (email: string) => void;
  onUpdateStaffRole: (idx: number, role: string) => void;
  onToggleStaffApproval: (idx: number) => void;
  onRemoveStaffCoach: (idx: number) => void;
  onAddNewSavedCoach: (name: string) => void;
  onDeleteSavedCoach: (name: string) => void;
}

export const StaffManagerView: React.FC<StaffManagerViewProps> = ({
  staffList,
  savedCoaches,
  userRole,
  onAddStaffCoach,
  onUpdateStaffRole,
  onToggleStaffApproval,
  onRemoveStaffCoach,
  onAddNewSavedCoach,
  onDeleteSavedCoach,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
              Coaching Staff &amp; Account Permissions
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Manage Head Coach (Admin) credentials, Assistant Coach access, and approve new user signups
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Accounts & Access Levels */}
        <div className="lg:col-span-2 bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h3 className="font-black text-sm text-slate-100">
                Staff Accounts &amp; Permissions
              </h3>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  const email = prompt('Enter Assistant Coach Email Address:');
                  if (email && email.trim()) onAddStaffCoach(email.trim());
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Coach</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-black uppercase text-[10.5px] border-b border-slate-700">
                  <th className="py-3 px-3.5 text-left">Email Address</th>
                  <th className="py-3 px-3.5 text-left">Role Assigned</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  {userRole === 'admin' && (
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {staffList.map((coach, idx) => {
                  const isMaster =
                    coach.email.toLowerCase() === 'dannym1010@gmail.com';
                  const isActive = coach.status === 'Active';

                  return (
                    <tr key={idx} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3.5 px-3.5 font-bold text-slate-100 font-mono">
                        {coach.email}
                      </td>

                      <td className="py-3.5 px-3.5">
                        {isMaster ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black text-[10.5px] border border-rose-500/30">
                            Head Coach (Master Admin)
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

                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {coach.status}
                        </span>
                      </td>

                      {userRole === 'admin' && (
                        <td className="py-3.5 px-3.5 text-right">
                          {!isMaster ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onToggleStaffApproval(idx)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                  isActive
                                    ? 'bg-slate-900 hover:bg-slate-750 text-slate-300 border border-slate-700'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                                }`}
                              >
                                {isActive ? 'Deactivate' : 'Approve'}
                              </button>
                              <button
                                onClick={() => onRemoveStaffCoach(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                                title="Remove staff account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10.5px] text-slate-400 italic">
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

        {/* Right Column: Saved Practice Coaches Roster */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-700">
            <h3 className="font-black text-sm text-slate-100">
              Saved Practice Coaches
            </h3>
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  const name = prompt('Enter Coach Name (e.g. Coach Smith):');
                  if (name && name.trim()) onAddNewSavedCoach(name.trim());
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Add Name</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {savedCoaches.map((coachName) => (
              <div
                key={coachName}
                className="p-3 bg-slate-900/90 border border-slate-700 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-200 hover:border-slate-600 transition-all"
              >
                <span>{coachName}</span>
                {userRole === 'admin' && (
                  <button
                    onClick={() => onDeleteSavedCoach(coachName)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Remove Coach"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
