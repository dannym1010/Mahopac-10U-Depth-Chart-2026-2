import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Printer,
  Filter,
  Settings,
  Lock,
  Mail,
  LogIn,
  UserPlus,
  Clock,
  LogOut,
  Check,
  AlertTriangle,
  Upload,
  FileJson,
  CheckSquare,
  Square,
  CheckCircle2,
  Layers,
  Dumbbell,
  Calendar,
  Users,
  BookOpen,
  Shield,
  Activity,
  FileText,
  Sparkles,
  RefreshCw,
  FolderTree,
  ChevronRight,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { FormationBoard, PracticePeriod, StaffCoach, Team, DrillFolder } from '../types';

/* =========================================================================
   1. AUTH OVERLAY & APPROVAL PENDING
   ========================================================================= */
interface AuthModalProps {
  isOpen: boolean;
  isPendingApproval: boolean;
  pendingEmail: string;
  onEmailAuth: (email: string, pass: string, isSignUp: boolean) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignInRedirect?: () => Promise<void>;
  onBypassLogin: () => void;
  onSignOut: () => void;
  staffList?: StaffCoach[];
  teams?: Team[];
  onSelectQuickCoach?: (coachEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isPendingApproval,
  pendingEmail,
  onEmailAuth,
  onGoogleSignIn,
  onGoogleSignInRedirect,
  onBypassLogin,
  onSignOut,
  staffList = [],
  teams = [],
  onSelectQuickCoach,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen && !isPendingApproval) return null;

  if (isPendingApproval) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-4 border border-slate-700/80">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Approval Pending
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
              Your coach account (<strong className="text-indigo-400">{pendingEmail}</strong>) has been registered and is awaiting approval from the Head Coach or Admin.
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 font-semibold">
            Once approved, you will automatically receive real-time cloud access.
          </div>
          <button
            onClick={onSignOut}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onEmailAuth(email, password, isSignUp);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-700/80 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md mb-2">
            <span className="text-2xl">🏈</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            Coach Portal Access
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Sign in to sync youth depth charts, playbooks, and practice plans.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              !isSignUp
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              isSignUp
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-700/80 rounded-xl text-xs text-rose-200 font-semibold space-y-1">
            <div className="flex items-center gap-1.5 font-black text-rose-300">
              <span>⚠️ Authentication Notice</span>
            </div>
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {/* Google Sign In Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await onGoogleSignIn();
              } catch (err: any) {
                console.error('Firebase Google Sign-In Error:', err);
                const code = err?.code || '';
                const message = err?.message || '';
                
                if (code === 'auth/unauthorized-domain') {
                  setError(
                    `Unauthorized Domain (${window.location.hostname}). Please add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`
                  );
                } else if (code === 'auth/operation-not-allowed') {
                  setError(
                    'Google Sign-in is not enabled in your Firebase Project. Go to Firebase Console -> Authentication -> Sign-in Method and enable Google.'
                  );
                } else if (code === 'auth/popup-blocked') {
                  setError('Popup blocked by browser. You can click "Sign in via Full Page Redirect" below or use Email/Password.');
                } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                  setError(
                    `Popup closed. If browser cookie privacy blocks the popup, try "Sign in via Full Page Redirect" or Email/Password.`
                  );
                } else {
                  setError(message ? `${code ? `[${code}] ` : ''}${message}` : 'Google Sign-In failed. Try Full Page Redirect or Email/Password.');
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {onGoogleSignInRedirect && (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await onGoogleSignInRedirect();
                } catch (err: any) {
                  setError(err?.message || 'Redirect sign-in error');
                  setLoading(false);
                }
              }}
              className="w-full py-1.5 bg-slate-900/60 hover:bg-slate-750/80 border border-slate-750/70 text-slate-300 hover:text-slate-100 font-semibold text-[11px] rounded-lg transition-all text-center"
            >
              🔄 Alternative: Sign in with Google (Redirect Mode)
            </button>
          )}
        </div>

        {/* New Tab Helper if in iframe preview */}
        <div className="text-center pt-0.5">
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            ↗ Open in New Tab for Google Auth
          </a>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[10.5px] font-black uppercase tracking-wider">
          <div className="flex-1 border-b border-slate-700" />
          <span>OR WITH EMAIL</span>
          <div className="flex-1 border-b border-slate-700" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Coach Email Address"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'Create Coach Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Coach Profiles (One-click Login with Favorite Team & Startup Screen) */}
        {staffList && staffList.length > 0 && (
          <div className="pt-2 border-t border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span>Fast Coach Sign-In &amp; Preferences</span>
              <span className="text-amber-400">Auto-loads Favorite Team</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {staffList.map((coach, cIdx) => {
                const favTeam = teams.find((t) => t.id === coach.favoriteTeamId);
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => {
                      if (onSelectQuickCoach) {
                        onSelectQuickCoach(coach.email);
                      } else {
                        setEmail(coach.email);
                        setPassword('password123');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500 rounded-xl text-left flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0">
                        {coach.role.charAt(0) || 'C'}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[11px] text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {coach.role}
                        </div>
                        <div className="text-[9.5px] text-slate-400 font-mono truncate">
                          {coach.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {favTeam && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 text-[9px] font-bold border border-amber-400/25">
                          🏈 {favTeam.ageGroup || favTeam.name}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[9px] font-mono capitalize">
                        {coach.startScreen || 'Schedule'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-700 text-center">
          <button
            type="button"
            onClick={onBypassLogin}
            className="text-xs font-bold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Continue in Offline Mode (No Login)
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. COPY WEEK MODAL
   ========================================================================= */
interface CopyWeekModalProps {
  isOpen: boolean;
  currentWeek: string;
  onClose: () => void;
  onExecuteCopy: (srcWeek: string, targetWeek: string, copyPlayerSpots?: boolean) => void;
}

export const CopyWeekModal: React.FC<CopyWeekModalProps> = ({
  isOpen,
  currentWeek,
  onClose,
  onExecuteCopy,
}) => {
  const [srcWeek, setSrcWeek] = useState(
    parseInt(currentWeek, 10) > 0 ? String(parseInt(currentWeek, 10) - 1) : '0'
  );
  const [targetWeek, setTargetWeek] = useState(currentWeek);
  const [copyPlayerSpots, setCopyPlayerSpots] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700/80">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-base text-slate-100">
              Copy Week Formations &amp; Depth Chart
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-semibold">
          <div>
            <label className="block text-slate-300 mb-1 font-bold">
              Copy From (Source Week):
            </label>
            <select
              value={srcWeek}
              onChange={(e) => setSrcWeek(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                <option key={wk} value={String(wk)}>
                  {wk === 0 ? 'Week 0 (Base / Preseason)' : `Week ${wk}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">
              Copy To (Target Week):
            </label>
            <select
              value={targetWeek}
              onChange={(e) => setTargetWeek(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                <option key={wk} value={String(wk)}>
                  {wk === 0 ? 'Week 0 (Base / Preseason)' : `Week ${wk}`}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 cursor-pointer hover:bg-slate-900 transition-colors">
            <input
              type="checkbox"
              checked={copyPlayerSpots}
              onChange={(e) => setCopyPlayerSpots(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
            />
            <div className="text-left">
              <span className="block text-slate-200 font-bold text-xs">Copy player spots in depth chart</span>
              <span className="block text-slate-400 text-[10px]">Copies starter and backup player assignments along with all formations</span>
            </div>
          </label>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              All formations from Week {srcWeek} will be copied to Week {targetWeek}.
              {copyPlayerSpots ? ' Player depth chart assignments will also be cloned.' : ' Depth chart slots will start blank.'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (srcWeek === targetWeek) {
                alert('Source week and Target week cannot be the same.');
                return;
              }
              onExecuteCopy(srcWeek, targetWeek, copyPlayerSpots);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 active:scale-95"
          >
            Copy Week Data
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. SELECTIVE PRINT MODAL
   ========================================================================= */
interface SelectivePrintModalProps {
  isOpen: boolean;
  unit: 'offense' | 'defense' | 'st' | 'groups';
  formations: FormationBoard[];
  onClose: () => void;
  onPrintSelected: (selectedFormIds: string[]) => void;
}

export const SelectivePrintModal: React.FC<SelectivePrintModalProps> = ({
  isOpen,
  unit,
  formations,
  onClose,
  onPrintSelected,
}) => {
  const unitFormations = formations.filter((f) => f && f.unit === unit);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    unitFormations.map((f) => f.id)
  );

  if (!isOpen) return null;

  const toggleSelectAll = (select: boolean) => {
    if (select) setSelectedIds(unitFormations.map((f) => f.id));
    else setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700/80">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-base text-slate-100">
              Select Boards to Print
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSelectAll(true)}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
          >
            Select All
          </button>
          <button
            onClick={() => toggleSelectAll(false)}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-700 p-3 rounded-2xl bg-slate-900/90">
          {unitFormations.map((f) => {
            const isChecked = selectedIds.includes(f.id);
            return (
              <label
                key={f.id}
                className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, f.id]);
                    else setSelectedIds(selectedIds.filter((id) => id !== f.id));
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                />
                <span>{f.name}</span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onPrintSelected(selectedIds);
              onClose();
            }}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 active:scale-95"
          >
            Print Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. SCRIMMAGE MODALS (FILTER & PRINT)
   ========================================================================= */
interface ScrimmageFilterModalProps {
  isOpen: boolean;
  formations: FormationBoard[];
  currentFilters: string[] | null;
  onClose: () => void;
  onSaveFilters: (selectedIds: string[]) => void;
}

export const ScrimmageFilterModal: React.FC<ScrimmageFilterModalProps> = ({
  isOpen,
  formations,
  currentFilters,
  onClose,
  onSaveFilters,
}) => {
  const relevantForms = formations.filter(
    (f) => f && (f.unit === 'offense' || f.unit === 'defense')
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentFilters || relevantForms.map((f) => f.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700/80">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-base text-slate-100">
              Filter Scrimmage Boards
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-700 p-3 rounded-2xl bg-slate-900/90">
          {relevantForms.map((f) => {
            const isChecked = selectedIds.includes(f.id);
            return (
              <label
                key={f.id}
                className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, f.id]);
                    else setSelectedIds(selectedIds.filter((id) => id !== f.id));
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                />
                <span>
                  [{f.unit.toUpperCase()}] {f.name}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveFilters(selectedIds);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 active:scale-95"
          >
            Save Filter
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   5. TEMPLATES MANAGER MODAL
   ========================================================================= */
interface TemplatesManagerModalProps {
  isOpen: boolean;
  templates: Record<string, PracticePeriod[]>;
  onClose: () => void;
  onRenameTemplate: (oldName: string, newName: string) => void;
  onDeleteTemplate: (name: string) => void;
}

export const TemplatesManagerModal: React.FC<TemplatesManagerModalProps> = ({
  isOpen,
  templates,
  onClose,
  onRenameTemplate,
  onDeleteTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700/80">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <h3 className="font-black text-base text-slate-100">
              Manage Practice Templates
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-700 p-3 rounded-2xl bg-slate-900/90">
          {Object.keys(templates).map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-200"
            >
              <span>{name}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const newName = prompt('Rename template:', name);
                    if (newName && newName.trim() && newName !== name) {
                      onRenameTemplate(name, newName.trim());
                    }
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-750 rounded-lg text-slate-300 text-[11px] border border-slate-700"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete template "${name}"?`)) onDeleteTemplate(name);
                  }}
                  className="p-1 hover:bg-rose-950/50 text-rose-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {Object.keys(templates).length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400 italic">
              No templates saved.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. SELECTIVE IMPORT / RESTORE BACKUP MODAL
   ========================================================================= */
interface ModuleInfo {
  key: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  countLabel: string;
  description: string;
  isAvailable: boolean;
}

export function inspectBackupModules(parsed: any): ModuleInfo[] {
  if (!parsed || typeof parsed !== 'object') return [];

  // Weekly data
  const hasWeekly = Boolean(
    parsed.weeklyData ||
      (parsed['0'] && parsed['0'].depthChart) ||
      (parsed.wk1 && parsed.wk1.depthChart)
  );
  const weeklySource = parsed.weeklyData || (hasWeekly ? parsed : null);
  const weekCount = weeklySource
    ? Object.keys(weeklySource).filter(
        (k) =>
          k.toLowerCase().includes('week') ||
          k.toLowerCase().includes('wk') ||
          !isNaN(Number(k))
      ).length || Object.keys(weeklySource).length
    : 0;

  // Practice plans
  const hasPractice = Array.isArray(parsed.practiceData) && parsed.practiceData.length > 0;
  const practiceCount = hasPractice ? parsed.practiceData.length : 0;

  // Practice templates
  const hasTemplates = Boolean(
    parsed.practiceTemplates &&
      typeof parsed.practiceTemplates === 'object' &&
      Object.keys(parsed.practiceTemplates).length > 0
  );
  const templateCount = hasTemplates ? Object.keys(parsed.practiceTemplates).length : 0;

  // Cascading drills
  const hasDrills = Array.isArray(parsed.cascadingDrills) && parsed.cascadingDrills.length > 0;
  let totalDrills = 0;
  let folderCount = 0;
  if (hasDrills) {
    const countDrills = (folders: DrillFolder[]) => {
      folders.forEach((f) => {
        folderCount++;
        totalDrills += f.drills?.length || 0;
        if (f.subfolders) countDrills(f.subfolders);
      });
    };
    countDrills(parsed.cascadingDrills);
  }

  // Default Formations
  const hasDefaults = Array.isArray(parsed.defaultFormations) && parsed.defaultFormations.length > 0;
  const defaultCount = hasDefaults ? parsed.defaultFormations.length : 0;

  // Guides
  const hasGuides = Boolean(
    parsed.guideTree ||
      parsed.pdfGuidesTree ||
      parsed.guideOrder ||
      parsed.pdfGuidesOrder
  );

  // Staff & Coaches
  const hasStaff = Boolean(
    (Array.isArray(parsed.savedCoaches) && parsed.savedCoaches.length > 0) ||
      (Array.isArray(parsed.staffList) && parsed.staffList.length > 0) ||
      (Array.isArray(parsed.savedCoachesList) && parsed.savedCoachesList.length > 0)
  );
  const staffCount =
    (parsed.savedCoaches?.length || 0) +
    (parsed.staffList?.length || 0) +
    (parsed.savedCoachesList?.length || 0);

  // Master Plays
  const hasPlays = Boolean(
    parsed.masterPlayLibrary &&
      typeof parsed.masterPlayLibrary === 'object' &&
      Object.keys(parsed.masterPlayLibrary).length > 0
  );
  const playCount = hasPlays ? Object.keys(parsed.masterPlayLibrary).length : 0;

  // Schedule Events
  const hasSchedule = Array.isArray(parsed.scheduleEvents) && parsed.scheduleEvents.length > 0;
  const scheduleCount = hasSchedule ? parsed.scheduleEvents.length : 0;

  // Roster
  const hasRoster = Array.isArray(parsed.roster) && parsed.roster.length > 0;
  const rosterCount = hasRoster ? parsed.roster.length : 0;

  return [
    {
      key: 'cascadingDrills',
      name: '💥 Master Drill Library',
      category: 'Training & Drills',
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
      countLabel: hasDrills ? `${totalDrills} drills • ${folderCount} categories` : 'Not found in file',
      description: 'All categorized exercises, agility circuits, tackling & blocking progressions',
      isAvailable: hasDrills,
    },
    {
      key: 'practiceData',
      name: '📋 Practice Plans & Schedules',
      category: 'Practice & Schedule',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      countLabel: hasPractice ? `${practiceCount} practice plans` : 'Not found in file',
      description: 'Full timeline practices, station coaches, drill allocations, & notes',
      isAvailable: hasPractice,
    },
    {
      key: 'practiceTemplates',
      name: '⚡ Practice Period Templates',
      category: 'Practice & Schedule',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      countLabel: hasTemplates ? `${templateCount} period templates` : 'Not found in file',
      description: 'Saved custom period formats (e.g. 5-Station Tackle Circuit, Indy, Specials)',
      isAvailable: hasTemplates,
    },
    {
      key: 'weeklyData',
      name: '🏈 Weekly Game Plans & Depth Charts',
      category: 'Playbook Core',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      countLabel: hasWeekly ? `${weekCount} game weeks` : 'Not found in file',
      description: 'Weekly offensive/defensive formation charts, player spot assignments, & notes',
      isAvailable: hasWeekly,
    },
    {
      key: 'defaultFormations',
      name: '📐 Default Formations & Alignments',
      category: 'Playbook Core',
      icon: <Shield className="w-5 h-5 text-sky-400" />,
      countLabel: hasDefaults ? `${defaultCount} base formations` : 'Not found in file',
      description: 'Base offensive and defensive field coordinates, positions, and alignments',
      isAvailable: hasDefaults,
    },
    {
      key: 'guideTree',
      name: '📖 Playbook PDF Guides & Structure',
      category: 'Playbook Core',
      icon: <BookOpen className="w-5 h-5 text-pink-400" />,
      countLabel: hasGuides ? 'Guides tree & order' : 'Not found in file',
      description: 'Playbook PDF documents, folder hierarchy, and custom manual ordering',
      isAvailable: hasGuides,
    },
    {
      key: 'staffList',
      name: '🧢 Coaching Staff & Directory',
      category: 'Administration',
      icon: <Users className="w-5 h-5 text-teal-400" />,
      countLabel: hasStaff ? `${staffCount} coaches/staff` : 'Not found in file',
      description: 'Saved coach names, station assignments, and team staff directory',
      isAvailable: hasStaff,
    },
    {
      key: 'masterPlayLibrary',
      name: '🎯 Master Play Library',
      category: 'Playbook Core',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      countLabel: hasPlays ? `${playCount} play collections` : 'Not found in file',
      description: 'Offensive run/pass plays, defensive coverages, and play call sheets',
      isAvailable: hasPlays,
    },
    {
      key: 'scheduleEvents',
      name: '📅 Season Schedule & Calendar',
      category: 'Administration',
      icon: <Calendar className="w-5 h-5 text-rose-400" />,
      countLabel: hasSchedule ? `${scheduleCount} calendar events` : 'Not found in file',
      description: 'Games, practices, scrimmages, and location details',
      isAvailable: hasSchedule,
    },
    {
      key: 'roster',
      name: '👥 Team Roster',
      category: 'Administration',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      countLabel: hasRoster ? `${rosterCount} players` : 'Not found in file',
      description: 'Player roster names, jersey numbers, and primary position slots',
      isAvailable: hasRoster,
    },
  ];
}

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySelectiveImport: (
    parsedData: any,
    selectedOptions: Record<string, boolean>
  ) => void;
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  onApplySelectiveImport,
}) => {
  const [step, setStep] = useState<'upload' | 'select'>('upload');
  const [parsedData, setParsedData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleProcessParsedData = (data: any, name = 'Backup File', sizeStr = '') => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Parsed backup file is empty or not a valid object.');
      }
      const modules = inspectBackupModules(data);
      const availableModules = modules.filter((m) => m.isAvailable);

      if (availableModules.length === 0) {
        throw new Error('No compatible playbook modules found in this JSON backup.');
      }

      // Default all available modules to checked
      const initialSelection: Record<string, boolean> = {};
      modules.forEach((m) => {
        initialSelection[m.key] = m.isAvailable;
      });

      setParsedData(data);
      setFileName(name);
      setFileSize(sizeStr);
      setSelectedModules(initialSelection);
      setError(null);
      setStep('select');
    } catch (err: any) {
      setError(err.message || 'Failed to process backup file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        handleProcessParsedData(parsed, file.name, sizeStr);
      } catch (err: any) {
        setError(`Invalid JSON file: ${err.message}`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        handleProcessParsedData(parsed, file.name, sizeStr);
      } catch (err: any) {
        setError(`Invalid JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPaste = () => {
    setError(null);
    if (!pastedText.trim()) {
      setError('Please paste JSON data first.');
      return;
    }
    try {
      const parsed = JSON.parse(pastedText.trim());
      handleProcessParsedData(parsed, 'Pasted Backup Code', `${(pastedText.length / 1024).toFixed(1)} KB`);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleToggleModule = (key: string) => {
    setSelectedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (modules: ModuleInfo[]) => {
    const next: Record<string, boolean> = {};
    modules.forEach((m) => {
      if (m.isAvailable) next[m.key] = true;
    });
    setSelectedModules(next);
  };

  const handleDeselectAll = () => {
    setSelectedModules({});
  };

  const handleConfirmRestore = () => {
    if (!parsedData) return;
    const selectedKeys = Object.keys(selectedModules).filter((k) => selectedModules[k]);
    if (selectedKeys.length === 0) {
      setError('Please select at least one module to restore.');
      return;
    }
    onApplySelectiveImport(parsedData, selectedModules);
    onClose();
  };

  const modules = parsedData ? inspectBackupModules(parsedData) : [];
  const availableCount = modules.filter((m) => m.isAvailable).length;
  const selectedCount = Object.keys(selectedModules).filter((k) => selectedModules[k]).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />

      <div className="bg-slate-800/98 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg text-slate-100 flex items-center gap-2">
                Selective Playbook Restore
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {step === 'upload'
                  ? 'Choose a backup file or paste JSON to choose what to restore'
                  : 'Select specific modules you want to import into your workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Upload / Paste File */}
        {step === 'upload' && (
          <div className="space-y-4 text-xs text-slate-300 overflow-y-auto pr-1">
            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 md:p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-indigo-500/70 bg-slate-900/60 hover:bg-slate-900/90'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-100">
                Click to browse or drag &amp; drop your backup .JSON file
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                You will be able to review and select individual modules before restoring.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md">
                  <FileJson className="w-4 h-4" />
                  <span>Choose .JSON Backup File</span>
                </span>
              </div>
            </div>

            {/* Paste Option */}
            <div className="border-t border-slate-700/80 pt-3">
              <label className="font-bold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Or Paste Backup JSON Directly</span>
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setError(null);
                }}
                placeholder='Paste raw backup JSON code here (e.g. {"cascadingDrills": [...], "practiceData": [...]})...'
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
              />

              {error && (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mt-2 text-xs bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end mt-2.5">
                <button
                  type="button"
                  onClick={handleApplyPaste}
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect &amp; Select Modules</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Selective Module Inspector */}
        {step === 'select' && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Backup Info & Quick Select Toolbar */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs text-slate-200 truncate max-w-[200px] md:max-w-xs">
                  {fileName}
                </span>
                {fileSize && (
                  <span className="text-[11px] text-slate-300 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                    {fileSize}
                  </span>
                )}
                <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30">
                  {availableCount} items found
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll(modules)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1 transition-all"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1 transition-all"
                >
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deselect All</span>
                </button>
              </div>
            </div>

            {/* Modules Checkbox List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[420px]">
              {modules.map((m) => {
                const isChecked = Boolean(selectedModules[m.key]);
                return (
                  <div
                    key={m.key}
                    onClick={() => m.isAvailable && handleToggleModule(m.key)}
                    className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      !m.isAvailable
                        ? 'opacity-40 border-slate-800 bg-slate-900/30 cursor-not-allowed'
                        : isChecked
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md cursor-pointer hover:bg-indigo-950/60'
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!m.isAvailable}
                        onChange={() => {}} // Handled by container click
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs md:text-sm text-slate-100 truncate">
                            {m.name}
                          </span>
                          {m.isAvailable ? (
                            <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {m.countLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                              Not in backup
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5 line-clamp-1">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Non-destructive notice */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 text-[11px] text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Safe Selective Restore:</strong> Only the checked modules above will be updated. All your other current playbook data will remain completely untouched.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  setStep('upload');
                  setParsedData(null);
                  setError(null);
                }}
                className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 rounded-xl hover:bg-slate-700/50 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Upload Different File</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  disabled={selectedCount === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Restore Selected ({selectedCount} Module{selectedCount === 1 ? '' : 's'})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

