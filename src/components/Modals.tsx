import React, { useState } from 'react';
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
} from 'lucide-react';
import { FormationBoard, PracticePeriod } from '../types';

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
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen && !isPendingApproval) return null;

  if (isPendingApproval) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Approval Pending
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              Your coach account (<strong className="text-indigo-400">{pendingEmail}</strong>) has been registered and is awaiting approval from Head Coach Danny (Admin).
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 font-semibold">
            Once approved, you will automatically receive real-time cloud access.
          </div>
          <button
            onClick={onSignOut}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md mb-2">
            <span className="text-2xl">🏈</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            Coach Portal Access
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Sign in to sync youth depth charts, playbooks, and practice plans.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
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
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
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
              className="w-full py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 text-slate-400 hover:text-slate-200 font-semibold text-[11px] rounded-lg transition-all text-center"
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

        <div className="flex items-center gap-2 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
          <div className="flex-1 border-b border-slate-800" />
          <span>OR WITH EMAIL</span>
          <div className="flex-1 border-b border-slate-800" />
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
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onBypassLogin}
            className="text-xs font-bold text-slate-400 hover:text-indigo-300 transition-colors"
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
  onExecuteCopy: (srcWeek: string, targetWeek: string) => void;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((wk) => (
                <option key={wk} value={String(wk)}>
                  {wk === 0 ? 'Week 0 (Base / Preseason)' : `Week ${wk}`}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              This will duplicate all formations, position card layouts, and starter/sub depth chart assignments from Week {srcWeek} into Week {targetWeek}.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (srcWeek === targetWeek) {
                alert('Source week and Target week cannot be the same.');
                return;
              }
              onExecuteCopy(srcWeek, targetWeek);
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
   ========================================================= */
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800"
          >
            Select All
          </button>
          <button
            onClick={() => toggleSelectAll(false)}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-800 p-3 rounded-2xl bg-slate-950/80">
          {unitFormations.map((f) => {
            const isChecked = selectedIds.includes(f.id);
            return (
              <label
                key={f.id}
                className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-xs font-bold text-slate-200 cursor-pointer hover:border-slate-700 transition-colors"
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

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-800 p-3 rounded-2xl bg-slate-950/80">
          {relevantForms.map((f) => {
            const isChecked = selectedIds.includes(f.id);
            return (
              <label
                key={f.id}
                className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-xs font-bold text-slate-200 cursor-pointer hover:border-slate-700 transition-colors"
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

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/95 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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

        <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-800 p-3 rounded-2xl bg-slate-950/80">
          {Object.keys(templates).map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-xs font-bold text-slate-200"
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
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-300 text-[11px] border border-slate-800"
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
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No templates saved.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. IMPORT / RESTORE BACKUP MODAL
   ========================================================================= */
interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: () => void;
  onPasteImport: (jsonString: string) => void;
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  onPasteImport,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPaste = () => {
    setError(null);
    if (!pastedText.trim()) {
      setError('Please paste JSON data first.');
      return;
    }
    try {
      JSON.parse(pastedText.trim());
      onPasteImport(pastedText.trim());
      onClose();
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
            Import / Restore Playbook Backup
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="font-bold text-slate-200 block mb-1">Option 1: Choose .JSON File</label>
            <button
              onClick={() => {
                onClose();
                onSelectFile();
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Browse & Upload .JSON File
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-3">
            <label className="font-bold text-slate-200 block mb-1">Option 2: Paste Backup JSON</label>
            <textarea
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                setError(null);
              }}
              placeholder='Paste JSON backup code here (e.g. {"weeklyData": ...})...'
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            {error && <div className="text-rose-400 font-bold mt-1 text-[11px]">{error}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleApplyPaste}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Restore Pasted Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

