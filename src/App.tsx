import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Shield,
  Target,
  Users,
  Swords,
  ClipboardList,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Watch,
  Calendar,
} from 'lucide-react';
import {
  UnitType,
  UserRole,
  RosterPlayer,
  PlacedPlayer,
  FormationBoard,
  FormationRow,
  PositionSlot,
  PracticePlan,
  DrillFolder,
  PlaybookGuideTree,
  PlaybookGuideOrder,
  StaffCoach,
  WeekState,
  PracticePeriod,
  PracticeStation,
  DrillItem,
  ScoutingData,
  ScheduleEvent,
  SeasonConfig,
  AttendanceRecord,
  Team,
  formatWeekLabel,
  SectionLock,
} from './types';
import {
  MASTER_ROSTER,
  INITIAL_DEFAULT_FORMATIONS,
  DEFAULT_CASCADING_DRILLS,
  DEFAULT_PRACTICE_TEMPLATES,
  DEFAULT_GUIDES_TREE,
  DEFAULT_GUIDES_ORDER,
  DEFAULT_SAVED_COACHES,
  DEFAULT_SAVED_COACHES_BY_TEAM,
  DEFAULT_TEAM_COACHES,
  MASTER_PLAY_LIBRARY,
  DEFAULT_SCHEDULE_EVENTS,
  DEFAULT_SEASON_CONFIG,
  DEFAULT_ATTENDANCE_LOGS,
  DEFAULT_INITIAL_PRACTICES,
  DEFAULT_TEAMS,
} from './data/initialData';
import {
  safeJSONParse,
  safeJSONSet,
  deepClone,
  safeJSONStringify,
  getFirebaseServices,
  parseCSV,
  escapeCSV,
  fetchServerState,
  checkServerHealth,
  saveServerState,
  subscribeServerEvents,
  fetchServerLocks,
  acquireServerLock,
  releaseServerLock,
  heartbeatServerLock,
  normalizePracticeTemplates,
  normalizeCascadingDrills,
  CLIENT_ID,
} from './services/storageService';
import {
  calculateWeekFolderForDate,
  getDayOfWeekForDate,
  getFormattedDayFolder,
  sanitizePracticePlans,
  findBestActivePracticeId,
} from './utils/practiceUtils';
import { getAutoActiveWeek, normalizeWeeklyData } from './utils/seasonWeekUtils';
import { normalizeRoster } from './utils/depthChartUtils';
import { triggerPrint } from './utils/printUtils';

import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { RosterSidebar } from './components/RosterSidebar';
import { FormationsView } from './components/FormationsView';
import { ScrimmageView } from './components/ScrimmageView';
import { WristbandView } from './components/WristbandView';
import { ScoutingView } from './components/ScoutingView';
import { PlaybookGuidesView } from './components/PlaybookGuidesView';
import { DrillLibraryView } from './components/DrillLibraryView';
import { PracticePlanView } from './components/PracticePlanView';
import { StaffManagerView } from './components/StaffManagerView';
import { ScheduleView } from './components/ScheduleView';
import { PlayerHoursTracker } from './components/PlayerHoursTracker';
import { MobileHubView } from './components/MobileHubView';
import { RosterManagerModal } from './components/RosterManagerModal';
import { PracticeWizardGeneratedResult } from './components/PracticeWizardModal';
import { PreferencesModal } from './components/PreferencesModal';
import { ThemeGalleryModal } from './components/ThemeGalleryModal';
import { SeasonConfigModal } from './components/SeasonConfigModal';
import {
  AuthModal,
  CopyWeekModal,
  SelectivePrintModal,
  ScrimmageFilterModal,
  TemplatesManagerModal,
  ImportBackupModal,
} from './components/Modals';

export default function App() {
  // State Initialization from LocalStorage or Defaults
  const [weeklyData, setWeeklyData] = useState<Record<string, WeekState>>(() =>
    normalizeWeeklyData(safeJSONParse('footballWeeklyData', {}))
  );
  const [defaultFormations, setDefaultFormations] = useState<FormationBoard[]>(
    () => safeJSONParse('footballDefaultFormations', INITIAL_DEFAULT_FORMATIONS)
  );
  const [practiceData, setPracticeData] = useState<PracticePlan[]>(() => {
    const saved = safeJSONParse('footballPracticeData', null);
    let plansToUse: PracticePlan[] = [];
    if (saved && Array.isArray(saved) && saved.length > 0) {
      plansToUse = [...saved];
    } else {
      plansToUse = [...DEFAULT_INITIAL_PRACTICES];
    }
    const sanitized = sanitizePracticePlans(
      plansToUse,
      safeJSONParse('footballScheduleEvents', DEFAULT_SCHEDULE_EVENTS)
    );
    safeJSONSet('footballPracticeData', sanitized);
    return sanitized;
  });
  const [practiceTemplates, setPracticeTemplates] = useState<
    Record<string, PracticePeriod[]>
  >(() =>
    normalizePracticeTemplates(
      safeJSONParse('footballPracticeTemplates', DEFAULT_PRACTICE_TEMPLATES)
    )
  );
  const [cascadingDrills, setCascadingDrills] = useState<DrillFolder[]>(() =>
    normalizeCascadingDrills(
      safeJSONParse('footballCascadingDrills', DEFAULT_CASCADING_DRILLS)
    )
  );
  const [guideTree, setGuideTree] = useState<PlaybookGuideTree>(() =>
    safeJSONParse('footballPdfGuidesTree', DEFAULT_GUIDES_TREE)
  );
  const [guideOrder, setGuideOrder] = useState<PlaybookGuideOrder>(() =>
    safeJSONParse('footballPdfGuidesOrder', DEFAULT_GUIDES_ORDER)
  );
  const [savedCoaches, setSavedCoaches] = useState<string[]>(() =>
    safeJSONParse('footballSavedCoaches', DEFAULT_SAVED_COACHES)
  );
  const [teamSavedCoaches, setTeamSavedCoaches] = useState<Record<string, string[]>>(() =>
    safeJSONParse('footballTeamSavedCoaches', DEFAULT_SAVED_COACHES_BY_TEAM)
  );
  const [staffList, setStaffList] = useState<StaffCoach[]>(() =>
    safeJSONParse('footballTeamCoaches', DEFAULT_TEAM_COACHES)
  );
  const [masterPlayLibrary, setMasterPlayLibrary] = useState<string[]>(() =>
    safeJSONParse('footballMasterPlays', MASTER_PLAY_LIBRARY)
  );
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() => {
    const saved = safeJSONParse('footballScheduleEvents', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return DEFAULT_SCHEDULE_EVENTS;
  });
  const [seasonConfig, setSeasonConfig] = useState<SeasonConfig>(() =>
    safeJSONParse('footballSeasonConfig', DEFAULT_SEASON_CONFIG)
  );
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() =>
    safeJSONParse('footballAttendanceLogs', DEFAULT_ATTENDANCE_LOGS)
  );
  const [roster, setRoster] = useState<RosterPlayer[]>(() => {
    const saved = safeJSONParse('footballRoster', null);
    return normalizeRoster(saved, true);
  });
  const [teams, setTeams] = useState<Team[]>(() =>
    safeJSONParse('footballTeams', DEFAULT_TEAMS)
  );

  // User Default Preferences
  const [defaultTeamId, setDefaultTeamId] = useState<string>(() =>
    safeJSONParse('footballDefaultTeamId', DEFAULT_TEAMS[0]?.id || 'team_10u')
  );
  const [defaultScreen, setDefaultScreen] = useState<UnitType>(() => {
    const saved = safeJSONParse('footballDefaultScreen', null);
    if (saved) return saved;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return isMobile ? 'mobile_hub' : 'schedule';
  });
  const [defaultDepthSubUnit, setDefaultDepthSubUnit] = useState<
    'offense' | 'defense' | 'st' | 'groups' | 'scrimmage'
  >(() => safeJSONParse('footballDefaultDepthSubUnit', 'offense'));

  // Active Session States (initializes to User Defaults if set)
  const [activeTeamId, setActiveTeamId] = useState<string>(() => {
    const savedDefault = safeJSONParse('footballDefaultTeamId', null);
    if (savedDefault) return savedDefault;
    return safeJSONParse('footballActiveTeamId', DEFAULT_TEAMS[0]?.id || 'team_10u');
  });

  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    const saved = safeJSONParse('footballCurrentWeek', null);
    if (saved) return saved;
    const events = safeJSONParse('footballScheduleEvents', DEFAULT_SCHEDULE_EVENTS);
    const auto = getAutoActiveWeek(events);
    return auto.activeWeek || '1';
  });
  const [dismissedCopyPrompts, setDismissedCopyPrompts] = useState<Set<string>>(new Set());
  const [activeUnit, setActiveUnit] = useState<UnitType>(() => {
    const savedDefault = safeJSONParse('footballDefaultScreen', null);
    if (savedDefault) return savedDefault;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) return 'mobile_hub';
    return safeJSONParse('footballActiveUnit', 'schedule');
  });
  const [depthSubUnit, setDepthSubUnit] = useState<
    'offense' | 'defense' | 'st' | 'groups' | 'scrimmage'
  >(() => {
    const savedDefault = safeJSONParse('footballDefaultDepthSubUnit', null);
    if (savedDefault) return savedDefault;
    return 'offense';
  });
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(
    null
  );
  const [currentPracticeId, setCurrentPracticeId] = useState<string | null>(() =>
    safeJSONParse('footballCurrentPracticeId', null)
  );
  const [activeGuideMain, setActiveGuideMain] = useState<string>('Offense');
  const [activeGuideSub, setActiveGuideSub] = useState<string>('Full Playbook');
  const [printFontSize, setPrintFontSize] = useState<string>(() =>
    safeJSONParse('footballPrintFontSize', '12')
  );

  // Filter & Search States
  const [rosterSearchTerm, setRosterSearchTerm] = useState('');
  const [playSearchTerm, setPlaySearchTerm] = useState('');
  const [scrimmageFilters, setScrimmageFilters] = useState<string[] | null>(() =>
    safeJSONParse('footballScrimmageFilters', null)
  );
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >(() => safeJSONParse('footballCollapsedFolders', {}));

  // Auth & Roles
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ text: string; color: string }>({
    text: 'Local Storage Mode',
    color: '#22c55e',
  });

  // Real-Time Concurrency Section Locks
  const [activeLocks, setActiveLocks] = useState<SectionLock[]>([]);

  // Modal Dialog States
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>(() =>
    safeJSONParse('footballActiveThemeId', 'electric_volt')
  );
  const [isSeasonConfigModalOpen, setIsSeasonConfigModalOpen] = useState(false);
  const [isCopyWeekModalOpen, setIsCopyWeekModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [editingPlayerForModal, setEditingPlayerForModal] = useState<RosterPlayer | null>(null);
  const [selectivePrintUnit, setSelectivePrintUnit] = useState<
    'offense' | 'defense' | 'st' | 'groups' | null
  >(null);
  const [isScrimmageFilterOpen, setIsScrimmageFilterOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Drag-and-Drop Transferred Data Ref
  const draggedPlayerRef = useRef<{
    type: 'roster' | 'placed_player';
    name: string;
    num: string;
    sourcePosId?: string;
    sourceIndex?: number;
    isScrimmage?: boolean;
  } | null>(null);

  const draggedPositionCardRef = useRef<{
    formId: string;
    rIdx: number;
    pIdx: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const drillCsvInputRef = useRef<HTMLInputElement | null>(null);
  const drillJsonInputRef = useRef<HTMLInputElement | null>(null);

  // Debounced Cloud Sync Timeout
  const saveTimeoutRef = useRef<any>(null);
  const initialCloudLoadDoneRef = useRef<boolean>(false);
  const isImportingRef = useRef<boolean>(false);
  const isRemoteSyncRef = useRef<boolean>(false);
  const lastSavedPayloadRef = useRef<string>('');
  const localServerVersionRef = useRef<number>(0);
  const localServerUpdatedAtRef = useRef<number>(0);
  const lastLocalEditTimeRef = useRef<number>(0);
  const activeUnitRef = useRef<string>(activeUnit);
  const activeTeamIdRef = useRef<string>(activeTeamId);
  const currentWeekRef = useRef<string>(currentWeek);
  const currentPracticeIdRef = useRef<string | null>(currentPracticeId);

  activeUnitRef.current = activeUnit;
  activeTeamIdRef.current = activeTeamId;
  currentWeekRef.current = currentWeek;
  currentPracticeIdRef.current = currentPracticeId;

  const latestStateRef = useRef({
    weeklyData,
    defaultFormations,
    practiceData,
    practiceTemplates,
    cascadingDrills,
    guideTree,
    guideOrder,
    savedCoaches,
    teamSavedCoaches,
    staffList,
    masterPlayLibrary,
    collapsedFolders,
    scheduleEvents,
    roster,
    teams,
    seasonConfig,
    attendanceLogs,
  });

  useEffect(() => {
    latestStateRef.current = {
      weeklyData,
      defaultFormations,
      practiceData,
      practiceTemplates,
      cascadingDrills,
      guideTree,
      guideOrder,
      savedCoaches,
      teamSavedCoaches,
      staffList,
      masterPlayLibrary,
      collapsedFolders,
      scheduleEvents,
      roster,
      teams,
      seasonConfig,
      attendanceLogs,
    };
  });

  // Determine current active depth chart unit
  const currentDepthUnit =
    activeUnit === 'depth_chart'
      ? (depthSubUnit === 'scrimmage' ? 'offense' : (depthSubUnit || 'offense'))
      : (['offense', 'defense', 'st', 'groups'].includes(activeUnit)
          ? (activeUnit as 'offense' | 'defense' | 'st' | 'groups')
          : 'offense');

  // Find active lock for current section
  const currentUnitLock = activeLocks.find((l) => {
    if (!l) return false;
    const sameTeam = l.teamId === activeTeamId;
    const sameWeek = String(l.week) === String(currentWeek);
    const sameUnit = l.unit === currentDepthUnit || l.unit === 'all';
    const notExpired = l.expiresAt > Date.now();
    return sameTeam && sameWeek && sameUnit && notExpired;
  });

  const currentUserEmail = (currentUser?.email || '').toLowerCase().trim();
  const lockHolderEmail = (currentUnitLock?.holderEmail || '').toLowerCase().trim();

  const isLockedByOther = Boolean(
    currentUnitLock &&
    currentUserEmail &&
    lockHolderEmail &&
    lockHolderEmail !== currentUserEmail
  );

  const isHeldByMe = Boolean(
    currentUnitLock &&
    currentUserEmail &&
    lockHolderEmail &&
    lockHolderEmail === currentUserEmail
  );

  const lockHolderName = currentUnitLock?.holderName || currentUnitLock?.holderEmail || 'Another Coach';

  const handleAcquireLock = async (
    unitName: string = currentDepthUnit,
    weekNum: string = currentWeek,
    force = false
  ) => {
    const authorEmail = currentUser?.email || 'Coach';
    const authorName = currentUser?.displayName || authorEmail.split('@')[0];
    const res = await acquireServerLock({
      teamId: activeTeamId,
      week: String(weekNum),
      unit: unitName,
      holderEmail: authorEmail,
      holderName: authorName,
      force,
    });
    if (res && res.lock) {
      setActiveLocks((prev) => {
        const filtered = prev.filter(
          (l) => !(l.teamId === activeTeamId && String(l.week) === String(weekNum) && l.unit === unitName)
        );
        return [...filtered, res.lock!];
      });
    }
    return res;
  };

  const handleReleaseLock = async (
    unitName: string = currentDepthUnit,
    weekNum: string = currentWeek
  ) => {
    const authorEmail = currentUser?.email || 'Coach';
    const ok = await releaseServerLock({
      teamId: activeTeamId,
      week: String(weekNum),
      unit: unitName,
      holderEmail: authorEmail,
    });
    if (ok) {
      setActiveLocks((prev) =>
        prev.filter(
          (l) => !(l.teamId === activeTeamId && String(l.week) === String(weekNum) && l.unit === unitName)
        )
      );
    }
  };

  const handleTakeOverLock = async (
    unitName: string = currentDepthUnit,
    weekNum: string = currentWeek
  ) => {
    await handleAcquireLock(unitName, weekNum, true);
  };

  // Heartbeat to keep active editing locks alive
  useEffect(() => {
    if (!isHeldByMe || !currentUser?.email) return;
    const interval = setInterval(async () => {
      await heartbeatServerLock({
        teamId: activeTeamId,
        week: String(currentWeek),
        unit: currentDepthUnit,
        holderEmail: currentUser.email,
      });
    }, 25000);
    return () => clearInterval(interval);
  }, [isHeldByMe, activeTeamId, currentWeek, currentDepthUnit, currentUser?.email]);

  // Helper to compute team-scoped week key
  const getScopedWeekKey = (teamId: string, week: string) => `${teamId}__week_${week}`;

  // Helper to resolve the richest week state (formations, depthChart, scrimmageChart, etc.)
  const resolveWeekState = (
    wData: Record<string, WeekState>,
    teamId: string,
    week: string
  ): WeekState => {
    const scopedKey = getScopedWeekKey(teamId, week);
    const scopedState = wData[scopedKey];
    const legacyState = wData[week];
    const defScopedKey = getScopedWeekKey('team_10u', week);
    const defScopedState = wData[defScopedKey];

    // Formations resolution
    let formations: FormationBoard[] = [];
    if (Array.isArray(scopedState?.formations)) {
      formations = scopedState.formations;
    } else if (Array.isArray(legacyState?.formations)) {
      formations = legacyState.formations;
    } else if (Array.isArray(defScopedState?.formations)) {
      formations = defScopedState.formations;
    } else if (Array.isArray(wData['0']?.formations)) {
      formations = wData['0'].formations;
    } else if (
      Array.isArray(wData[getScopedWeekKey('team_10u', '0')]?.formations)
    ) {
      formations = wData[getScopedWeekKey('team_10u', '0')].formations;
    } else {
      formations =
        defaultFormations && Array.isArray(defaultFormations) && defaultFormations.length > 0
          ? defaultFormations
          : INITIAL_DEFAULT_FORMATIONS;
    }

    const countPlacedPlayers = (dc?: Record<string, PlacedPlayer[]>) => {
      if (!dc || typeof dc !== 'object') return 0;
      return Object.values(dc).reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      );
    };

    // Depth chart resolution: prioritize the state with real player assignments so empty stubs never wipe valid depth charts
    let depthChart: Record<string, PlacedPlayer[]> = {};
    const scopedDCCount = countPlacedPlayers(scopedState?.depthChart);
    const legacyDCCount = countPlacedPlayers(legacyState?.depthChart);
    const defScopedDCCount = countPlacedPlayers(defScopedState?.depthChart);

    if (scopedDCCount > 0) {
      depthChart = scopedState!.depthChart!;
    } else if (legacyDCCount > 0) {
      depthChart = legacyState!.depthChart!;
    } else if (defScopedDCCount > 0) {
      depthChart = defScopedState!.depthChart!;
    } else if (scopedState && scopedState.depthChart !== undefined) {
      depthChart = scopedState.depthChart;
    } else if (legacyState && legacyState.depthChart !== undefined) {
      depthChart = legacyState.depthChart;
    } else if (defScopedState && defScopedState.depthChart !== undefined) {
      depthChart = defScopedState.depthChart;
    } else {
      depthChart = {};
    }

    // Scrimmage chart resolution: prioritize the state with real player assignments
    let scrimmageChart: Record<string, PlacedPlayer[]> = {};
    const scopedSCCount = countPlacedPlayers(scopedState?.scrimmageChart);
    const legacySCCount = countPlacedPlayers(legacyState?.scrimmageChart);
    const defScopedSCCount = countPlacedPlayers(defScopedState?.scrimmageChart);

    if (scopedSCCount > 0) {
      scrimmageChart = scopedState!.scrimmageChart!;
    } else if (legacySCCount > 0) {
      scrimmageChart = legacyState!.scrimmageChart!;
    } else if (defScopedSCCount > 0) {
      scrimmageChart = defScopedState!.scrimmageChart!;
    } else if (scopedState && scopedState.scrimmageChart !== undefined) {
      scrimmageChart = scopedState.scrimmageChart;
    } else if (legacyState && legacyState.scrimmageChart !== undefined) {
      scrimmageChart = legacyState.scrimmageChart;
    } else if (defScopedState && defScopedState.scrimmageChart !== undefined) {
      scrimmageChart = defScopedState.scrimmageChart;
    } else {
      scrimmageChart = {};
    }

    return {
      formations,
      depthChart,
      scrimmageChart,
      opponent:
        scopedState?.opponent ||
        legacyState?.opponent ||
        defScopedState?.opponent ||
        '',
      wristbandData:
        scopedState?.wristbandData ||
        legacyState?.wristbandData ||
        defScopedState?.wristbandData,
      scouting:
        scopedState?.scouting ||
        legacyState?.scouting ||
        defScopedState?.scouting,
    };
  };

  // Ensure current week object exists and copies formations from source week
  const ensureWeekExists = (week: string, sourceWeek?: string) => {
    setWeeklyData((prev) => {
      const currentResolved = resolveWeekState(prev, activeTeamId, week);
      const scopedKey = getScopedWeekKey(activeTeamId, week);

      if (currentResolved.formations && currentResolved.formations.length > 0) {
        if (prev[scopedKey] && prev[week]) return prev;
        return {
          ...prev,
          [scopedKey]: currentResolved,
          [week]: currentResolved,
        };
      }

      // Determine source week to copy formations from
      let srcWk = sourceWeek;
      if (!srcWk) {
        const num = parseInt(week, 10);
        if (!isNaN(num) && num > 1) {
          srcWk = String(num - 1);
        } else if (week === '1') {
          srcWk = '0';
        } else {
          srcWk = '0';
        }
      }

      const srcResolved = resolveWeekState(prev, activeTeamId, srcWk);
      const templateForms =
        srcResolved.formations && srcResolved.formations.length > 0
          ? srcResolved.formations
          : defaultFormations && defaultFormations.length > 0
            ? defaultFormations
            : INITIAL_DEFAULT_FORMATIONS;

      const newWeekState: WeekState = {
        formations: deepClone(templateForms),
        depthChart: currentResolved.depthChart || {},
        scrimmageChart: currentResolved.scrimmageChart || {},
        opponent: currentResolved.opponent || '',
        wristbandData: currentResolved.wristbandData || {
          rows: 10,
          columns: [{ color: 'blue', plays: [] }],
        },
        scouting: currentResolved.scouting || {
          year: '2026',
          week: `Week ${week}`,
          opponent: '',
          gameDate: '',
          gameLocation: '',
          teamOverview: '',
          offensiveTendencies: '',
          defensiveFronts: '',
          specialTeamsNotes: '',
          keysToVictory: [],
          keyPlayersList: [],
          coachNotes: [],
        },
      };

      return {
        ...prev,
        [scopedKey]: newWeekState,
        [week]: newWeekState,
      };
    });
  };

// Helper to extract all position IDs belonging to a formation unit
function getUnitPositionIds(formations: FormationBoard[], unit: string): Set<string> {
  const ids = new Set<string>();
  if (Array.isArray(formations)) {
    formations.forEach((f) => {
      if (f && f.unit === unit && Array.isArray(f.rows)) {
        f.rows.forEach((r) => {
          if (r && Array.isArray(r.positions)) {
            r.positions.forEach((p) => {
              if (p && p.id) ids.add(p.id);
            });
          }
        });
      }
    });
  }
  return ids;
}

// Multi-Coach state merger that prevents Offense/Defense/Special Teams overwrites and respects formation ordering
function mergeRemoteWeeklyData(
  localWeekly: Record<string, WeekState>,
  remoteWeekly: Record<string, WeekState>,
  activeTeamId: string,
  currentWeek: string,
  activeUnit: string,
  lastLocalEditTime: number
): Record<string, WeekState> {
  if (!localWeekly || Object.keys(localWeekly).length === 0) return remoteWeekly;
  if (!remoteWeekly || Object.keys(remoteWeekly).length === 0) return localWeekly;

  const merged: Record<string, WeekState> = { ...remoteWeekly };
  const scopedKey = `${activeTeamId}__week_${currentWeek}`;
  const isActivelyEditingLocally = Date.now() - lastLocalEditTime < 15000;

  for (const weekKey of Object.keys(localWeekly)) {
    const localState = localWeekly[weekKey];
    const remoteState = remoteWeekly[weekKey];

    if (!remoteState) {
      merged[weekKey] = localState;
      continue;
    }

    if (!localState) {
      merged[weekKey] = remoteState;
      continue;
    }

    const isCurrentActiveWeek = weekKey === scopedKey || weekKey === currentWeek;
    const localFormations = Array.isArray(localState.formations) ? localState.formations : [];
    const remoteFormations = Array.isArray(remoteState.formations) ? remoteState.formations : [];

    if (isCurrentActiveWeek && isActivelyEditingLocally) {
      // Local coach is actively editing this week & unit (e.g. offense or defense).
      // Keep local coach's active unit formations and their exact ordering intact!
      // Accept remote coach's updates for all other units.
      const mergedFormations: FormationBoard[] = [];
      const usedIds = new Set<string>();

      // Keep local formations for activeUnit in exact local order
      localFormations.forEach((lf) => {
        if (lf && lf.id && lf.unit === activeUnit) {
          mergedFormations.push(lf);
          usedIds.add(lf.id);
        }
      });

      // Keep remote formations for all other units in remote order
      remoteFormations.forEach((rf) => {
        if (rf && rf.id && !usedIds.has(rf.id)) {
          mergedFormations.push(rf);
          usedIds.add(rf.id);
        }
      });

      // Keep any remaining local formations not yet included
      localFormations.forEach((lf) => {
        if (lf && lf.id && !usedIds.has(lf.id)) {
          mergedFormations.push(lf);
          usedIds.add(lf.id);
        }
      });

      const localActiveUnitPosIds = getUnitPositionIds(localFormations, activeUnit);

      const localDC = localState.depthChart || {};
      const remoteDC = remoteState.depthChart || {};
      const mergedDC: Record<string, PlacedPlayer[]> = { ...remoteDC };

      for (const posId of localActiveUnitPosIds) {
        mergedDC[posId] = localDC[posId] || [];
      }

      const localSC = localState.scrimmageChart || {};
      const remoteSC = remoteState.scrimmageChart || {};
      const mergedSC: Record<string, PlacedPlayer[]> = { ...remoteSC };
      if (activeUnit === 'scrimmage') {
        const localScrimmagePosIds = getUnitPositionIds(localFormations, 'scrimmage');
        for (const posId of localScrimmagePosIds) {
          mergedSC[posId] = localSC[posId] || [];
        }
      }

      merged[weekKey] = {
        ...remoteState,
        formations: mergedFormations,
        depthChart: mergedDC,
        scrimmageChart: mergedSC,
        opponent: remoteState.opponent || localState.opponent || '',
        wristbandData: remoteState.wristbandData || localState.wristbandData,
        scouting: remoteState.scouting || localState.scouting,
      };
    } else {
      // Not actively editing locally:
      // Remote cloud state is authoritative.
      const mergedFormations: FormationBoard[] =
        remoteFormations.length > 0
          ? remoteFormations
          : localFormations;

      const mergedDC: Record<string, PlacedPlayer[]> =
        remoteState.depthChart !== undefined
          ? remoteState.depthChart
          : localState.depthChart || {};

      const mergedSC: Record<string, PlacedPlayer[]> =
        remoteState.scrimmageChart !== undefined
          ? remoteState.scrimmageChart
          : localState.scrimmageChart || {};

      merged[weekKey] = {
        ...localState,
        ...remoteState,
        formations: mergedFormations,
        depthChart: mergedDC,
        scrimmageChart: mergedSC,
      };
    }
  }

  return merged;
}

  // Centralized helper to apply remote state updates cleanly without race conditions
  const applyRemoteState = (
    data: any,
    source: string = 'remote',
    version?: number,
    updatedAt?: number
  ) => {
    if (!data || typeof data !== 'object') return;

    if (typeof version === 'number' && version > localServerVersionRef.current) {
      localServerVersionRef.current = version;
    }
    if (typeof updatedAt === 'number' && updatedAt > localServerUpdatedAtRef.current) {
      localServerUpdatedAtRef.current = updatedAt;
    }

    isRemoteSyncRef.current = true;

    if (data.weeklyData && Object.keys(data.weeklyData).length > 0) {
      const normalizedWeekly = normalizeWeeklyData(
        data.weeklyData,
        data.defaultFormations || latestStateRef.current.defaultFormations
      );
      const mergedWeekly = mergeRemoteWeeklyData(
        latestStateRef.current.weeklyData,
        normalizedWeekly,
        activeTeamIdRef.current,
        currentWeekRef.current,
        activeUnitRef.current,
        lastLocalEditTimeRef.current
      );
      setWeeklyData(mergedWeekly);
      latestStateRef.current.weeklyData = mergedWeekly;
      safeJSONSet('footballWeeklyData', mergedWeekly);
    }
    if (
      data.defaultFormations &&
      Array.isArray(data.defaultFormations) &&
      data.defaultFormations.length > 0
    ) {
      if (Date.now() - lastLocalEditTimeRef.current < 15000) {
        const localDefs = latestStateRef.current.defaultFormations || [];
        const mergedDefs: FormationBoard[] = [];
        const usedIds = new Set<string>();
        localDefs.forEach((lf) => {
          if (lf && lf.id && lf.unit === activeUnitRef.current) {
            mergedDefs.push(lf);
            usedIds.add(lf.id);
          }
        });
        data.defaultFormations.forEach((rf: any) => {
          if (rf && rf.id && !usedIds.has(rf.id)) {
            mergedDefs.push(rf);
            usedIds.add(rf.id);
          }
        });
        setDefaultFormations(mergedDefs);
        latestStateRef.current.defaultFormations = mergedDefs;
        safeJSONSet('footballDefaultFormations', mergedDefs);
      } else {
        setDefaultFormations(data.defaultFormations);
        latestStateRef.current.defaultFormations = data.defaultFormations;
        safeJSONSet('footballDefaultFormations', data.defaultFormations);
      }
    }
    if (data.practiceData && Array.isArray(data.practiceData)) {
      const sanitized = sanitizePracticePlans(
        data.practiceData,
        data.scheduleEvents || latestStateRef.current.scheduleEvents || DEFAULT_SCHEDULE_EVENTS
      );
      if (Date.now() - lastLocalEditTimeRef.current < 15000 && activeUnitRef.current === 'practice') {
        // Local coach is actively editing practice plans, merge remote updates preserving recent local edits
        const localPlans = latestStateRef.current.practiceData || [];
        const localMap = new Map<string, PracticePlan>();
        localPlans.forEach((lp) => {
          if (lp && lp.id) localMap.set(lp.id, lp);
        });

        const mergedPlans: PracticePlan[] = [];
        const seenIds = new Set<string>();

        sanitized.forEach((rp) => {
          if (rp && rp.id) {
            seenIds.add(rp.id);
            const localP = localMap.get(rp.id);
            if (localP) {
              mergedPlans.push((localP.lastEdited || 0) >= (rp.lastEdited || 0) ? localP : rp);
            } else {
              mergedPlans.push(rp);
            }
          }
        });

        localPlans.forEach((lp) => {
          if (lp && lp.id && !seenIds.has(lp.id)) {
            mergedPlans.push(lp);
          }
        });

        setPracticeData(mergedPlans);
        latestStateRef.current.practiceData = mergedPlans;
        safeJSONSet('footballPracticeData', mergedPlans);
      } else {
        setPracticeData(sanitized);
        latestStateRef.current.practiceData = sanitized;
        safeJSONSet('footballPracticeData', sanitized);

        // If current practice is not set or invalid, auto-select the best active practice
        if (!currentPracticeId || !sanitized.some((p) => p && p.id === currentPracticeId)) {
          const bestId = findBestActivePracticeId(sanitized, currentPracticeId, currentWeek);
          if (bestId) {
            setCurrentPracticeId(bestId);
            safeJSONSet('footballCurrentPracticeId', bestId);
          }
        }
      }
    }
    if (data.practiceTemplates) {
      const normalizedTemplates = normalizePracticeTemplates(data.practiceTemplates);
      setPracticeTemplates(normalizedTemplates);
      latestStateRef.current.practiceTemplates = normalizedTemplates;
      safeJSONSet('footballPracticeTemplates', normalizedTemplates);
    }
    if (data.cascadingDrills) {
      if (Date.now() - lastLocalEditTimeRef.current < 15000 && activeUnitRef.current === 'drills') {
        // Local coach is actively editing drills, don't overwrite with remote pulse
      } else {
        const normalizedDrills = normalizeCascadingDrills(data.cascadingDrills);
        setCascadingDrills(normalizedDrills);
        latestStateRef.current.cascadingDrills = normalizedDrills;
        safeJSONSet('footballCascadingDrills', normalizedDrills);
      }
    }
    if (data.guideTree) {
      setGuideTree(data.guideTree);
      latestStateRef.current.guideTree = data.guideTree;
      safeJSONSet('footballPdfGuidesTree', data.guideTree);
    }
    if (data.guideOrder) {
      setGuideOrder(data.guideOrder);
      latestStateRef.current.guideOrder = data.guideOrder;
      safeJSONSet('footballPdfGuidesOrder', data.guideOrder);
    }
    if (data.savedCoaches && Array.isArray(data.savedCoaches)) {
      setSavedCoaches(data.savedCoaches);
      latestStateRef.current.savedCoaches = data.savedCoaches;
      safeJSONSet('footballSavedCoaches', data.savedCoaches);
    }
    if (data.teamSavedCoaches && typeof data.teamSavedCoaches === 'object') {
      setTeamSavedCoaches(data.teamSavedCoaches);
      latestStateRef.current.teamSavedCoaches = data.teamSavedCoaches;
      safeJSONSet('footballTeamSavedCoaches', data.teamSavedCoaches);
    }
    if (data.staffList && Array.isArray(data.staffList)) {
      setStaffList(data.staffList);
      latestStateRef.current.staffList = data.staffList;
      safeJSONSet('footballTeamCoaches', data.staffList);
    }
    if (data.masterPlayLibrary) {
      setMasterPlayLibrary(data.masterPlayLibrary);
      latestStateRef.current.masterPlayLibrary = data.masterPlayLibrary;
      safeJSONSet('footballMasterPlays', data.masterPlayLibrary);
    }
    if (data.collapsedFolders) {
      setCollapsedFolders(data.collapsedFolders);
      latestStateRef.current.collapsedFolders = data.collapsedFolders;
      safeJSONSet('footballCollapsedFolders', data.collapsedFolders);
    }
    if (data.scheduleEvents && Array.isArray(data.scheduleEvents)) {
      setScheduleEvents(data.scheduleEvents);
      latestStateRef.current.scheduleEvents = data.scheduleEvents;
      safeJSONSet('footballScheduleEvents', data.scheduleEvents);
    }
    if (data.roster && Array.isArray(data.roster)) {
      const normalized = normalizeRoster(data.roster, true);
      setRoster(normalized);
      latestStateRef.current.roster = normalized;
      safeJSONSet('footballRoster', normalized);
    }
    if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
      setTeams(data.teams);
      latestStateRef.current.teams = data.teams;
      safeJSONSet('footballTeams', data.teams);
    }
    if (data.seasonConfig) {
      setSeasonConfig(data.seasonConfig);
      latestStateRef.current.seasonConfig = data.seasonConfig;
      safeJSONSet('footballSeasonConfig', data.seasonConfig);
    }
    if (data.attendanceLogs && Array.isArray(data.attendanceLogs)) {
      setAttendanceLogs(data.attendanceLogs);
      latestStateRef.current.attendanceLogs = data.attendanceLogs;
      safeJSONSet('footballAttendanceLogs', data.attendanceLogs);
    }

    lastSavedPayloadRef.current = safeJSONStringify(latestStateRef.current);
    initialCloudLoadDoneRef.current = true;

    // Reset isRemoteSyncRef quickly after the React state cycle
    setTimeout(() => {
      isRemoteSyncRef.current = false;
    }, 250);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSyncStatus({ text: `✅ Live Synced (${timeStr})`, color: '#22c55e' });
  };

  // Trigger Save to LocalStorage, Server API & Firestore
  const saveStateToStorage = async (scope: string = 'all') => {
    const currentState = latestStateRef.current;

    // 1. LocalStorage update
    safeJSONSet('footballWeeklyData', currentState.weeklyData);
    safeJSONSet('footballDefaultFormations', currentState.defaultFormations);
    safeJSONSet('footballPracticeData', currentState.practiceData);
    safeJSONSet('footballPracticeTemplates', currentState.practiceTemplates);
    safeJSONSet('footballCascadingDrills', currentState.cascadingDrills);
    safeJSONSet('footballPdfGuidesTree', currentState.guideTree);
    safeJSONSet('footballPdfGuidesOrder', currentState.guideOrder);
    safeJSONSet('footballSavedCoaches', currentState.savedCoaches);
    safeJSONSet('footballTeamSavedCoaches', currentState.teamSavedCoaches);
    safeJSONSet('footballTeamCoaches', currentState.staffList);
    safeJSONSet('footballMasterPlays', currentState.masterPlayLibrary);
    safeJSONSet('footballCollapsedFolders', currentState.collapsedFolders);
    safeJSONSet('footballScheduleEvents', currentState.scheduleEvents);
    safeJSONSet('footballRoster', currentState.roster);
    safeJSONSet('footballTeams', currentState.teams);
    safeJSONSet('footballSeasonConfig', currentState.seasonConfig);
    safeJSONSet('footballAttendanceLogs', currentState.attendanceLogs);

    const payload = {
      weeklyData: currentState.weeklyData,
      defaultFormations: currentState.defaultFormations,
      practiceData: currentState.practiceData,
      practiceTemplates: currentState.practiceTemplates,
      cascadingDrills: currentState.cascadingDrills,
      guideTree: currentState.guideTree,
      guideOrder: currentState.guideOrder,
      savedCoaches: currentState.savedCoaches,
      teamSavedCoaches: currentState.teamSavedCoaches,
      staffList: currentState.staffList,
      masterPlayLibrary: currentState.masterPlayLibrary,
      collapsedFolders: currentState.collapsedFolders,
      scheduleEvents: currentState.scheduleEvents,
      roster: currentState.roster,
      teams: currentState.teams,
      seasonConfig: currentState.seasonConfig,
      attendanceLogs: currentState.attendanceLogs,
    };

    const payloadJson = safeJSONStringify(payload);
    if (payloadJson === lastSavedPayloadRef.current && scope !== 'force' && scope !== 'initial_seed') {
      return;
    }

    // Never overwrite cloud if initial cloud pull has not completed yet
    if (!initialCloudLoadDoneRef.current && scope !== 'force') {
      return;
    }

    lastSavedPayloadRef.current = payloadJson;

    setSyncStatus({ text: '☁️ Syncing...', color: '#f59e0b' });

    const authorEmail = currentUser?.email || 'Coach';

    // 2. Persistent Server Sync
    try {
      const metadata = {
        activeTeamId: activeTeamIdRef.current,
        currentWeek: currentWeekRef.current,
        activeUnit: activeUnitRef.current,
        scope,
        timestamp: Date.now(),
      };
      const sResult = await saveServerState(payload, authorEmail, metadata);
      if (sResult && typeof sResult.version === 'number') {
        localServerVersionRef.current = sResult.version;
      }
      if (sResult && typeof sResult.updatedAt === 'number') {
        localServerUpdatedAtRef.current = sResult.updatedAt;
      }
    } catch (err) {
      console.warn('Server save warning:', err);
    }

    // 3. Firestore Sync
    const { db } = getFirebaseServices();
    if (db && initialCloudLoadDoneRef.current) {
      try {
        await db
          .collection('teamData')
          .doc('depthChartData')
          .set(
            {
              ...payload,
              updatedAt: Date.now(),
              lastAuthor: authorEmail,
            },
            { merge: true }
          );
      } catch (err: any) {
        console.warn('Firestore sync warning:', err);
      }
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSyncStatus({ text: `✅ Saved & Synced (${timeStr})`, color: '#22c55e' });
  };

  // Immediate non-debounced flush to storage & cloud
  const flushAndSaveStateToStorage = async (scope: string = 'immediate') => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await saveStateToStorage(scope);
  };

  const debouncedSave = (scope: string = 'all') => {
    if (isRemoteSyncRef.current) {
      return;
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      saveStateToStorage(scope);
    }, 600);
  };

  const handleForceSave = async () => {
    lastSavedPayloadRef.current = '';
    setSyncStatus({ text: '☁️ Saving to Cloud & Server...', color: '#f59e0b' });
    await saveStateToStorage('force');
  };

  const handleForceRefresh = async () => {
    setSyncStatus({ text: '🔄 Fetching Latest Cloud Data...', color: '#f59e0b' });
    try {
      const { db } = getFirebaseServices();
      if (db) {
        const doc = await db.collection('teamData').doc('depthChartData').get();
        if (doc.exists) {
          applyRemoteState(doc.data(), 'manual_firestore_refresh');
          return;
        }
      }
      const serverRes = await fetchServerState();
      if (serverRes && serverRes.hasData && serverRes.state) {
        applyRemoteState(serverRes.state, 'manual_server_refresh', serverRes.version, serverRes.updatedAt);
        return;
      }
      setSyncStatus({ text: '✅ Up to Date', color: '#22c55e' });
    } catch (err) {
      console.warn('Manual refresh error:', err);
      setSyncStatus({ text: 'Sync Error', color: '#ef4444' });
    }
  };

  // Update root CSS variable for print font size
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--print-font-size',
      `${printFontSize}px`
    );
  }, [printFontSize]);

  // Global blur / focusout sync listener: whenever a coach clicks out of any input/box/dropdown,
  // immediately flush changes to Firestore & Server so other coaches see them instantly
  useEffect(() => {
    const handleGlobalFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        flushAndSaveStateToStorage('focusout');
      }
    };

    const handleBeforeUnload = () => {
      saveStateToStorage('beforeunload');
    };

    document.addEventListener('focusout', handleGlobalFocusOut);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('focusout', handleGlobalFocusOut);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Initial Server Persistence & Live Real-Time Multi-Coach Subscription
  useEffect(() => {
    let isMounted = true;

    async function initPersistence() {
      try {
        // 1. Check Firestore FIRST for existing cloud data
        const { db } = getFirebaseServices();
        let firestoreLoaded = false;
        if (db) {
          try {
            const doc = await db.collection('teamData').doc('depthChartData').get();
            if (!isMounted) return;
            if (doc && doc.exists) {
              const data = doc.data();
              if (data) {
                applyRemoteState(data, 'firestore_init');
                initialCloudLoadDoneRef.current = true;
                firestoreLoaded = true;
              }
            }
          } catch (fErr) {
            console.warn('Initial firestore fetch warning:', fErr);
          }
        }

        // 2. Fetch server state & locks
        const [serverRes, locksRes] = await Promise.all([
          fetchServerState(),
          fetchServerLocks(),
        ]);
        if (!isMounted) return;

        if (Array.isArray(locksRes)) {
          setActiveLocks(locksRes);
        }

        if (serverRes && serverRes.hasData && serverRes.state) {
          applyRemoteState(serverRes.state, 'server_init', serverRes.version, serverRes.updatedAt);
          initialCloudLoadDoneRef.current = true;
        } else if (!firestoreLoaded) {
          initialCloudLoadDoneRef.current = true;
        }
      } catch (err) {
        console.warn('Initial server state fetch warning:', err);
        initialCloudLoadDoneRef.current = true;
      }

      // 3. Subscribe to real-time multi-coach updates via SSE
      const unsubscribeSSE = subscribeServerEvents((eventData) => {
        if (!isMounted) return;
        if (eventData.type === 'connected' && Array.isArray(eventData.locks)) {
          setActiveLocks(eventData.locks);
        } else if (eventData.type === 'locks_update' && Array.isArray(eventData.locks)) {
          setActiveLocks(eventData.locks);
        } else if (eventData.type === 'sync' && eventData.state) {
          if (eventData.senderClientId === CLIENT_ID) return;
          applyRemoteState(eventData.state, 'sse_live_update', eventData.version, eventData.updatedAt);
        }
      });

      // 4. Resilient polling fallback every 4 seconds
      const pollInterval = setInterval(async () => {
        if (!isMounted) return;
        try {
          const [health, currentLocks] = await Promise.all([
            checkServerHealth(),
            fetchServerLocks(),
          ]);
          if (Array.isArray(currentLocks)) {
            setActiveLocks(currentLocks);
          }
          if (health && health.hasCachedState) {
            if (
              (typeof health.stateVersion === 'number' && health.stateVersion > localServerVersionRef.current) ||
              (typeof health.stateUpdatedAt === 'number' && health.stateUpdatedAt > localServerUpdatedAtRef.current)
            ) {
              const serverRes = await fetchServerState();
              if (serverRes && serverRes.hasData && serverRes.state) {
                applyRemoteState(serverRes.state, 'poll_sync', serverRes.version, serverRes.updatedAt);
              }
            }
          }
        } catch {
          // silent catch during polling
        }
      }, 4000);

      // 5. Check server & Firestore on window focus / tab visibility change
      const handleWindowFocus = async () => {
        if (!isMounted) return;
        try {
          const { db } = getFirebaseServices();
          if (db) {
            const doc = await db.collection('teamData').doc('depthChartData').get();
            if (doc && doc.exists) {
              const data = doc.data();
              if (data) {
                const dataJson = safeJSONStringify(data);
                if (dataJson !== lastSavedPayloadRef.current) {
                  applyRemoteState(data, 'focus_firestore_sync');
                }
              }
            }
          }
          const serverRes = await fetchServerState();
          if (serverRes && serverRes.hasData && serverRes.state) {
            if (
              (typeof serverRes.version === 'number' && serverRes.version > localServerVersionRef.current) ||
              (typeof serverRes.updatedAt === 'number' && serverRes.updatedAt > localServerUpdatedAtRef.current)
            ) {
              applyRemoteState(serverRes.state, 'focus_sync', serverRes.version, serverRes.updatedAt);
            }
          }
        } catch {}
      };

      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleWindowFocus);

      return () => {
        if (typeof unsubscribeSSE === 'function') unsubscribeSSE();
        clearInterval(pollInterval);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleWindowFocus);
      };
    }

    const unsubPromise = initPersistence();

    return () => {
      isMounted = false;
      unsubPromise.then((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, []);

  // Apply favorite team & start screen associated with the user login
  const applyUserPreferencesOnLogin = (email: string) => {
    if (!email) return;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check user-specific localStorage preference
    const savedUserPref = safeJSONParse('footballUserPref_' + cleanEmail, null);

    // 2. Check staff list / initial coaches entry
    const coachEntry =
      latestStateRef.current.staffList.find(
        (c) => c.email.toLowerCase().trim() === cleanEmail
      ) ||
      DEFAULT_TEAM_COACHES.find(
        (c) => c.email.toLowerCase().trim() === cleanEmail
      );

    const targetTeamId =
      savedUserPref?.favoriteTeamId ||
      coachEntry?.favoriteTeamId ||
      safeJSONParse('footballDefaultTeamId', null);

    const targetScreen =
      savedUserPref?.startScreen ||
      coachEntry?.startScreen ||
      safeJSONParse('footballDefaultScreen', null);

    const targetSubUnit =
      savedUserPref?.startDepthSubUnit ||
      coachEntry?.startDepthSubUnit ||
      safeJSONParse('footballDefaultDepthSubUnit', null);

    if (targetTeamId) {
      const existingTeam = latestStateRef.current.teams.find(
        (t) =>
          t.id === targetTeamId ||
          t.id.replace(/-/g, '_') === targetTeamId.replace(/-/g, '_')
      );
      const finalTeamId = existingTeam ? existingTeam.id : targetTeamId;
      setActiveTeamId(finalTeamId);
      setDefaultTeamId(finalTeamId);
      safeJSONSet('footballActiveTeamId', finalTeamId);
      safeJSONSet('footballDefaultTeamId', finalTeamId);
    }

    if (targetScreen) {
      setActiveUnit(targetScreen);
      setDefaultScreen(targetScreen);
      safeJSONSet('footballActiveUnit', targetScreen);
      safeJSONSet('footballDefaultScreen', targetScreen);
      if (targetSubUnit) {
        setDepthSubUnit(targetSubUnit);
        setDefaultDepthSubUnit(targetSubUnit);
        safeJSONSet('footballDefaultDepthSubUnit', targetSubUnit);
      }
    }
  };

  // Initial Firebase Auth Listener & Cloud Sync Subscription
  useEffect(() => {
    const { auth, db } = getFirebaseServices();

    if (auth) {
      // Process any pending redirect auth results from Google Sign-in
      auth
        .getRedirectResult()
        .then((result: any) => {
          if (result?.user) {
            setCurrentUser(result.user);
            setIsAuthModalOpen(false);
            applyUserPreferencesOnLogin(result.user.email);
          }
        })
        .catch((err: any) => {
          console.warn('Redirect auth result error:', err);
        });

      const unsubscribeAuth = auth.onAuthStateChanged(async (user: any) => {
        if (user) {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          applyUserPreferencesOnLogin(user.email);

          // On user login, immediately pull all live team data from Firestore
          if (db) {
            try {
              const doc = await db.collection('teamData').doc('depthChartData').get();
              if (doc && doc.exists) {
                const cloudData = doc.data();
                if (cloudData) {
                  applyRemoteState(cloudData, 'auth_login_pull');
                }
              }
            } catch (loginPullErr) {
              console.warn('Error pulling cloud data on login:', loginPullErr);
            }
          }

          // Check if coach is approved or master admin
          const cleanEmail = (user.email || '').toLowerCase().trim();
          const isDannySuperAdmin =
            cleanEmail.includes('dannym1010') ||
            cleanEmail === 'dannym1010@gmail.com';

          setStaffList((prevStaff) => {
            const isFirstUser = prevStaff.length === 0;
            const existingIdx = prevStaff.findIndex(
              (c) => c.email.toLowerCase().trim() === cleanEmail
            );
            if (isDannySuperAdmin) {
              if (existingIdx !== -1) {
                const copy = [...prevStaff];
                copy[existingIdx] = {
                  ...copy[existingIdx],
                  role: 'Master Super Admin',
                  status: 'Active',
                  assignedTeamIds: ['all'],
                };
                return copy;
              } else {
                return [
                  {
                    email: cleanEmail,
                    role: 'Master Super Admin',
                    status: 'Active',
                    assignedTeamIds: ['all'],
                  },
                  ...prevStaff,
                ];
              }
            } else if (existingIdx === -1 && cleanEmail) {
              const isMaster = isFirstUser || cleanEmail.includes('admin');
              const newEntry: StaffCoach = {
                email: cleanEmail,
                role: isMaster ? 'Head Coach (Admin)' : 'Assistant Coach',
                status: 'Active',
                assignedTeamIds: ['all'],
              };
              const updatedStaff = [...prevStaff, newEntry];
              if (db) {
                db.collection('teamData')
                  .doc('depthChartData')
                  .set({ staffList: updatedStaff }, { merge: true })
                  .catch((err: any) => console.warn('Staff update error:', err));
              }
              return updatedStaff;
            }
            return prevStaff;
          });

          const coachEntry = staffList.find(
            (c) => c.email.toLowerCase().trim() === cleanEmail
          );
          const isMaster =
            isDannySuperAdmin ||
            cleanEmail.includes('admin') ||
            coachEntry?.role?.toLowerCase().includes('head coach');

          setIsPendingApproval(false);
          const isHead =
            isDannySuperAdmin ||
            isMaster ||
            coachEntry?.role?.includes('Admin');
          setUserRole(isHead ? 'admin' : 'assistant');
          setSyncStatus({
            text: '✅ Live Multi-Coach Connected',
            color: '#22c55e',
          });
        } else {
          // If no auth yet, open login modal (user can also choose offline mode)
          setIsAuthModalOpen(true);
        }
      });

      // Real-time Firestore sync
      if (db) {
        const unsubscribeFirestore = db
          .collection('teamData')
          .doc('depthChartData')
          .onSnapshot(
            (doc: any) => {
              if (isImportingRef.current) {
                return;
              }
              if (doc && doc.exists) {
                if (doc.metadata && doc.metadata.hasPendingWrites) {
                  return;
                }
                const data = doc.data();
                if (!data) return;

                const remotePayloadJson = safeJSONStringify(data);
                if (remotePayloadJson === lastSavedPayloadRef.current) {
                  initialCloudLoadDoneRef.current = true;
                  return;
                }

                applyRemoteState(data, 'firestore_snapshot');
              } else {
                initialCloudLoadDoneRef.current = true;
              }
            },
            (err: any) => {
              console.warn('Firestore subscription error:', err);
              initialCloudLoadDoneRef.current = true;
            }
          );

        return () => {
          unsubscribeAuth();
          unsubscribeFirestore();
        };
      }
      return () => unsubscribeAuth();
    } else {
      // Offline mode
      setCurrentUser({ email: 'Local Coach (Offline)' });
    }
  }, []);

  // Initialize current practice & formations
  useEffect(() => {
    ensureWeekExists(currentWeek);

    const teamPractices = activeTeamPracticeData.length > 0 ? activeTeamPracticeData : practiceData;
    if (practiceData.length === 0) {
      const defaultPlan: PracticePlan = {
        id: 'prac_' + Date.now(),
        teamId: activeTeamId,
        year: '2026',
        weekFolder: currentWeek,
        title: 'Practice #1',
        date: new Date().toISOString().split('T')[0],
        day: getDayOfWeekForDate(new Date().toISOString().split('T')[0]),
        startTime: '17:05',
        lastEdited: Date.now(),
        plan: deepClone(DEFAULT_PRACTICE_TEMPLATES['Standard Practice'] || []),
      };
      setPracticeData([defaultPlan]);
      setCurrentPracticeId(defaultPlan.id);
      safeJSONSet('footballCurrentPracticeId', defaultPlan.id);
    } else {
      const isCurrentValid = teamPractices.some((p) => p && p.id === currentPracticeId);
      if (!isCurrentValid || !currentPracticeId) {
        const bestId = findBestActivePracticeId(teamPractices, currentPracticeId, currentWeek);
        if (bestId && bestId !== currentPracticeId) {
          setCurrentPracticeId(bestId);
          safeJSONSet('footballCurrentPracticeId', bestId);
        }
      }
    }
  }, [currentWeek, activeTeamId, practiceData.length]);

  // Auto-advance depth chart week after game score is entered or day after game is scheduled
  useEffect(() => {
    const auto = getAutoActiveWeek(scheduleEvents);
    if (auto.activeWeek) {
      const lastRecordedAutoWeek = safeJSONParse('footballLastAutoWeek', null);
      if (lastRecordedAutoWeek && auto.activeWeek !== lastRecordedAutoWeek) {
        safeJSONSet('footballLastAutoWeek', auto.activeWeek);
        setCurrentWeek(auto.activeWeek);
        ensureWeekExists(auto.activeWeek, auto.priorWeek);
      } else if (!lastRecordedAutoWeek) {
        safeJSONSet('footballLastAutoWeek', auto.activeWeek);
      }
    }
  }, [scheduleEvents]);

  // Sync state changes
  useEffect(() => {
    debouncedSave('all');
  }, [
    weeklyData,
    defaultFormations,
    practiceData,
    practiceTemplates,
    cascadingDrills,
    guideTree,
    guideOrder,
    savedCoaches,
    teamSavedCoaches,
    staffList,
    masterPlayLibrary,
    collapsedFolders,
    scheduleEvents,
    roster,
    teams,
    seasonConfig,
    attendanceLogs,
  ]);

  const currentScopedWeekKey = getScopedWeekKey(activeTeamId, currentWeek);
  const currentWeekState: WeekState = resolveWeekState(weeklyData, activeTeamId, currentWeek);
  const rawFormations = currentWeekState.formations;

  const currentFormations: FormationBoard[] = useMemo(() => {
    return (rawFormations || [])
      .filter((f): f is FormationBoard => Boolean(f && typeof f === 'object' && f.id))
      .map((f) => ({
        ...f,
        rows: (f.rows || []).map((r, rIdx) => {
          const rawPositions = Array.isArray(r.positions) ? r.positions : [];
          // Preserve valid position objects and nulls (empty spacing slots)
          const positions: (PositionSlot | null)[] = rawPositions.map((pos) =>
            pos && typeof pos === 'object' && pos.id && pos.name
              ? { id: String(pos.id), name: String(pos.name) }
              : null
          );
          const targetCount = Math.max(
            positions.length,
            typeof r.slotCount === 'number' ? r.slotCount : 0,
            1
          );
          while (positions.length < targetCount) {
            positions.push(null);
          }
          return {
            ...r,
            id: r.id || `row_${rIdx}`,
            label: r.label || `Level ${rIdx + 1}`,
            slotCount: positions.length,
            positions,
          };
        }),
      }));
  }, [rawFormations]);
  const currentDepthChart = currentWeekState.depthChart || {};
  const currentScrimmageChart = currentWeekState.scrimmageChart || {};

  // Check if current week needs prompt to copy players from previous week
  const depthChartCopyCandidate = useMemo(() => {
    if (dismissedCopyPrompts.has(currentWeek)) return null;
    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    const targetState = weeklyData[scopedKey] || weeklyData[currentWeek];
    const targetDepthCount = targetState?.depthChart
      ? Object.values(targetState.depthChart).reduce((acc, list) => acc + (list?.length || 0), 0)
      : 0;
    if (targetDepthCount > 0) return null;

    let srcWk = '0';
    const num = parseInt(currentWeek, 10);
    if (!isNaN(num) && num > 1) {
      srcWk = String(num - 1);
    } else if (currentWeek === '1') {
      srcWk = '0';
    } else if (currentWeek === 'playoffs') {
      srcWk = '8';
    } else if (currentWeek === '0') {
      return null;
    }

    const srcScopedKey = getScopedWeekKey(activeTeamId, srcWk);
    const srcState = weeklyData[srcScopedKey] || weeklyData[srcWk];
    const srcCount = srcState?.depthChart
      ? Object.values(srcState.depthChart).reduce((acc, list) => acc + (list?.length || 0), 0)
      : 0;

    if (srcCount > 0) {
      return {
        targetWeek: currentWeek,
        sourceWeek: srcWk,
        sourceCount: srcCount,
      };
    }
    return null;
  }, [weeklyData, activeTeamId, currentWeek, dismissedCopyPrompts]);

  // Team Access Control & Data Filtering
  const currentUserCoach = staffList.find(
    (c) => c.email.toLowerCase().trim() === (currentUser?.email || '').toLowerCase().trim()
  );

  const isMasterSuperAdminUser = (email?: string) => {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return clean.includes('dannym1010') || clean === 'dannym1010@gmail.com';
  };

  const accessibleTeams = React.useMemo(() => {
    // dannym1010 (Master Super Admin) ALWAYS has full access to ALL teams unconditionally
    if (isMasterSuperAdminUser(currentUser?.email)) {
      return teams;
    }

    // For all other Head Coaches and Assistant Coaches, strictly check allowed assignedTeamIds
    if (currentUserCoach) {
      const assigned = currentUserCoach.assignedTeamIds;
      if (assigned && assigned.length > 0) {
        if (assigned.includes('all')) return teams;
        const permitted = teams.filter((t) => assigned.includes(t.id));
        if (permitted.length > 0) return permitted;
      }
    }

    return teams.slice(0, 1);
  }, [teams, currentUserCoach, currentUser]);

  // Active Team Saved Practice Coaches (Per-Team Roster - strictly on this team only)
  const activeTeamSavedCoaches = React.useMemo(() => {
    if (teamSavedCoaches && teamSavedCoaches[activeTeamId] && Array.isArray(teamSavedCoaches[activeTeamId])) {
      return teamSavedCoaches[activeTeamId].filter(
        (c) => c && typeof c === 'string' && c.trim()
      );
    }
    return [];
  }, [teamSavedCoaches, activeTeamId]);

  // Ensure activeTeamId is within accessible teams
  useEffect(() => {
    if (accessibleTeams.length > 0 && !accessibleTeams.some((t) => t.id === activeTeamId)) {
      const fallback = accessibleTeams[0].id;
      setActiveTeamId(fallback);
      safeJSONSet('footballActiveTeamId', fallback);
    }
  }, [accessibleTeams, activeTeamId]);

  const currentActiveTeam = React.useMemo(() => {
    return (
      teams.find((t) => t.id === activeTeamId) ||
      accessibleTeams[0] ||
      teams[0] || { id: 'team-10u', name: '10U Youth Tackle', ageGroup: '10U', color: 'amber' }
    );
  }, [teams, accessibleTeams, activeTeamId]);

  // Filter roster, schedule events, and practice plans by active team (strictly isolated)
  const activeTeamRoster = React.useMemo(() => {
    return roster.filter((p) => {
      if (!p) return false;
      if (p.teamId) {
        return (
          p.teamId === activeTeamId ||
          (p.teamId === 'team_10u' && activeTeamId === 'team-10u') ||
          (p.teamId === 'team-10u' && activeTeamId === 'team_10u')
        );
      }
      return (
        activeTeamId === 'team_10u' ||
        activeTeamId === 'team-10u' ||
        activeTeamId === teams[0]?.id
      );
    });
  }, [roster, activeTeamId, teams]);

  const activeTeamScheduleEvents = React.useMemo(() => {
    return scheduleEvents.filter((e) => {
      if (!e) return false;
      if (e.teamId) {
        return (
          e.teamId === activeTeamId ||
          (e.teamId === 'team_10u' && activeTeamId === 'team-10u') ||
          (e.teamId === 'team-10u' && activeTeamId === 'team_10u')
        );
      }
      return (
        activeTeamId === 'team_10u' ||
        activeTeamId === 'team-10u' ||
        activeTeamId === teams[0]?.id
      );
    });
  }, [scheduleEvents, activeTeamId, teams]);

  const activeTeamPracticeData = React.useMemo(() => {
    return practiceData.filter((p) => {
      if (!p) return false;
      if (p.teamId) {
        return (
          p.teamId === activeTeamId ||
          (p.teamId === 'team_10u' && activeTeamId === 'team-10u') ||
          (p.teamId === 'team-10u' && activeTeamId === 'team_10u')
        );
      }
      return (
        activeTeamId === 'team_10u' ||
        activeTeamId === 'team-10u' ||
        activeTeamId === teams[0]?.id
      );
    });
  }, [practiceData, activeTeamId, teams]);

  // Team CRUD handlers
  const handleAddTeam = (newTeamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...newTeamData,
      id: 'team_' + Date.now(),
    };
    let updatedTeams: Team[] = [];
    setTeams((prev) => {
      updatedTeams = [...prev, newTeam];
      safeJSONSet('footballTeams', updatedTeams);
      latestStateRef.current.teams = updatedTeams;
      return updatedTeams;
    });

    // Seed default practice coaches for this new team with specific coaching staff
    let updatedCoaches: Record<string, string[]> = {};
    const baseCoaches = savedCoaches && savedCoaches.length > 0 ? savedCoaches : DEFAULT_SAVED_COACHES;
    setTeamSavedCoaches((prev) => {
      updatedCoaches = {
        ...prev,
        [newTeam.id]: [...baseCoaches],
      };
      safeJSONSet('footballTeamSavedCoaches', updatedCoaches);
      latestStateRef.current.teamSavedCoaches = updatedCoaches;
      return updatedCoaches;
    });

    setActiveTeamId(newTeam.id);
    safeJSONSet('footballActiveTeamId', newTeam.id);

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teams: updatedTeams,
            teamSavedCoaches: updatedCoaches,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore add team sync error:', err));
    }
  };

  const handleUpdateTeam = (teamId: string, updated: Partial<Team>) => {
    let updatedTeams: Team[] = [];
    setTeams((prev) => {
      updatedTeams = prev.map((t) => (t.id === teamId ? { ...t, ...updated } : t));
      safeJSONSet('footballTeams', updatedTeams);
      latestStateRef.current.teams = updatedTeams;
      return updatedTeams;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teams: updatedTeams,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore update team sync error:', err));
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    let finalTeams: Team[] = [];
    setTeams((prev) => {
      const remaining = prev.filter((t) => t.id !== teamId);
      finalTeams =
        remaining.length > 0
          ? remaining
          : [
              {
                id: 'team_' + Date.now(),
                name: '10U Youth Tackle',
                ageGroup: '10U',
                season: '2026 Season',
                color: 'amber',
                headCoachName: '',
                notes: 'Primary program team',
              },
            ];
      safeJSONSet('footballTeams', finalTeams);
      latestStateRef.current.teams = finalTeams;

      if (activeTeamId === teamId || !finalTeams.some((t) => t.id === activeTeamId)) {
        const nextId = finalTeams[0].id;
        setActiveTeamId(nextId);
        safeJSONSet('footballActiveTeamId', nextId);
      }
      return finalTeams;
    });

    // Clean up coach team assignments
    let updatedStaff: StaffCoach[] = [];
    setStaffList((prev) => {
      updatedStaff = prev.map((coach) => {
        if (!coach.assignedTeamIds) return coach;
        return {
          ...coach,
          assignedTeamIds: coach.assignedTeamIds.filter((id) => id !== teamId),
        };
      });
      safeJSONSet('footballTeamCoaches', updatedStaff);
      latestStateRef.current.staffList = updatedStaff;
      return updatedStaff;
    });

    // Clean up per-team saved coaches
    let updatedCoaches: Record<string, string[]> = {};
    setTeamSavedCoaches((prev) => {
      const copy = { ...prev };
      delete copy[teamId];
      updatedCoaches = copy;
      safeJSONSet('footballTeamSavedCoaches', copy);
      latestStateRef.current.teamSavedCoaches = copy;
      return copy;
    });

    // Direct instant Firestore write to permanently delete the team from the cloud
    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teams: finalTeams,
            staffList: updatedStaff,
            teamSavedCoaches: updatedCoaches,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore delete team sync error:', err));
    }
  };

  const handleUpdateStaffAssignedTeams = (idx: number, teamIds: string[]) => {
    let updated: StaffCoach[] = [];
    setStaffList((prev) => {
      updated = [...prev];
      updated[idx] = { ...updated[idx], assignedTeamIds: teamIds };
      safeJSONSet('footballTeamCoaches', updated);
      latestStateRef.current.staffList = updated;
      return updated;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set({ staffList: updated, updatedAt: Date.now() }, { merge: true })
        .catch((err: any) => console.warn('Firestore staff update sync error:', err));
    }
  };

  const handleSetDefaultTeam = (teamId: string) => {
    setDefaultTeamId(teamId);
    safeJSONSet('footballDefaultTeamId', teamId);
    setActiveTeamId(teamId);
    safeJSONSet('footballActiveTeamId', teamId);

    // Save to current user's preferences
    const cleanEmail = (currentUser?.email || 'dannym1010@gmail.com').toLowerCase().trim();
    if (cleanEmail) {
      const existingPref = safeJSONParse('footballUserPref_' + cleanEmail, {});
      const updatedPref = { ...existingPref, favoriteTeamId: teamId };
      safeJSONSet('footballUserPref_' + cleanEmail, updatedPref);

      // Also update in staffList so it syncs across devices/cloud
      setStaffList((prev) => {
        const idx = prev.findIndex((c) => c.email.toLowerCase().trim() === cleanEmail);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], favoriteTeamId: teamId };
          safeJSONSet('footballTeamCoaches', copy);
          latestStateRef.current.staffList = copy;
          return copy;
        }
        return prev;
      });
    }
  };

  const handleSetDefaultScreen = (
    screen: UnitType,
    subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage'
  ) => {
    setDefaultScreen(screen);
    safeJSONSet('footballDefaultScreen', screen);
    if (subUnit) {
      setDefaultDepthSubUnit(subUnit);
      safeJSONSet('footballDefaultDepthSubUnit', subUnit);
      setDepthSubUnit(subUnit);
    }
    setActiveUnit(screen);
    safeJSONSet('footballActiveUnit', screen);

    // Save to current user's preferences
    const cleanEmail = (currentUser?.email || 'dannym1010@gmail.com').toLowerCase().trim();
    if (cleanEmail) {
      const existingPref = safeJSONParse('footballUserPref_' + cleanEmail, {});
      const updatedPref = {
        ...existingPref,
        startScreen: screen,
        startDepthSubUnit: subUnit,
      };
      safeJSONSet('footballUserPref_' + cleanEmail, updatedPref);

      // Also update in staffList so it syncs across devices/cloud
      setStaffList((prev) => {
        const idx = prev.findIndex((c) => c.email.toLowerCase().trim() === cleanEmail);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            startScreen: screen,
            startDepthSubUnit: subUnit,
          };
          safeJSONSet('footballTeamCoaches', copy);
          latestStateRef.current.staffList = copy;
          return copy;
        }
        return prev;
      });
    }
  };

  const handleUpdateStaffPreferences = (
    idx: number,
    favoriteTeamId?: string,
    startScreen?: UnitType
  ) => {
    let updated: StaffCoach[] = [];
    setStaffList((prev) => {
      if (!prev[idx]) return prev;
      updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        ...(favoriteTeamId ? { favoriteTeamId } : {}),
        ...(startScreen ? { startScreen } : {}),
      };
      safeJSONSet('footballTeamCoaches', updated);
      latestStateRef.current.staffList = updated;

      const coachEmail = updated[idx].email.toLowerCase().trim();
      const currentPref = safeJSONParse('footballUserPref_' + coachEmail, {});
      safeJSONSet('footballUserPref_' + coachEmail, {
        ...currentPref,
        ...(favoriteTeamId ? { favoriteTeamId } : {}),
        ...(startScreen ? { startScreen } : {}),
      });

      // If updating the currently logged in coach, apply active changes
      const currentEmail = (currentUser?.email || '').toLowerCase().trim();
      if (coachEmail === currentEmail) {
        if (favoriteTeamId) {
          setDefaultTeamId(favoriteTeamId);
          setActiveTeamId(favoriteTeamId);
          safeJSONSet('footballDefaultTeamId', favoriteTeamId);
          safeJSONSet('footballActiveTeamId', favoriteTeamId);
        }
        if (startScreen) {
          setDefaultScreen(startScreen);
          setActiveUnit(startScreen);
          safeJSONSet('footballDefaultScreen', startScreen);
          safeJSONSet('footballActiveUnit', startScreen);
        }
      }

      return updated;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set({ staffList: updated, updatedAt: Date.now() }, { merge: true })
        .catch((err: any) => console.warn('Firestore staff pref update sync error:', err));
    }
  };

  const handleAddStaffCoach = (
    email: string,
    role: string = 'Assistant Coach',
    assignedTeamIds: string[] = [activeTeamId],
    favoriteTeamId: string = activeTeamId || 'team_10u',
    startScreen: UnitType = 'schedule'
  ) => {
    const cleanEmail = email.toLowerCase().trim();
    if (staffList.some((c) => c.email.toLowerCase().trim() === cleanEmail)) {
      alert('Coach email already in staff list.');
      return;
    }
    const newEntry: StaffCoach = {
      email: cleanEmail,
      role: role || 'Assistant Coach',
      status: 'Active',
      assignedTeamIds: assignedTeamIds && assignedTeamIds.length > 0 ? assignedTeamIds : [activeTeamId],
      favoriteTeamId,
      startScreen,
    };
    let updatedStaff: StaffCoach[] = [];
    setStaffList((prev) => {
      updatedStaff = [...prev, newEntry];
      safeJSONSet('footballTeamCoaches', updatedStaff);
      latestStateRef.current.staffList = updatedStaff;
      return updatedStaff;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set({ staffList: updatedStaff, updatedAt: Date.now() }, { merge: true })
        .catch((err: any) => console.warn('Firestore add staff sync error:', err));
    }
  };

  const handleAddNewSavedCoach = (rawName: string, targetTeamId?: string) => {
    if (!rawName || !rawName.trim()) return;
    const tid = targetTeamId || activeTeamId;
    const namesToAdd = rawName
      .split(/[,;\n]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (namesToAdd.length === 0) return;

    let updatedTeamCoaches: Record<string, string[]> = {};
    setTeamSavedCoaches((prev) => {
      const currentList = Array.isArray(prev[tid]) ? prev[tid] : [];
      const nextList = [...currentList];
      namesToAdd.forEach((name) => {
        if (!nextList.some((c) => c.toLowerCase() === name.toLowerCase())) {
          nextList.push(name);
        }
      });
      updatedTeamCoaches = {
        ...prev,
        [tid]: nextList,
      };
      safeJSONSet('footballTeamSavedCoaches', updatedTeamCoaches);
      latestStateRef.current.teamSavedCoaches = updatedTeamCoaches;
      return updatedTeamCoaches;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teamSavedCoaches: latestStateRef.current.teamSavedCoaches,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore add coach sync error:', err));
    }
  };

  const handleDeleteSavedCoach = (name: string, targetTeamId?: string) => {
    const tid = targetTeamId || activeTeamId;
    const normTarget = name.toLowerCase().trim();

    let updatedTeamCoaches: Record<string, string[]> = {};
    setTeamSavedCoaches((prev) => {
      const currentList = Array.isArray(prev[tid]) ? prev[tid] : [];
      updatedTeamCoaches = {
        ...prev,
        [tid]: currentList.filter((c) => c.toLowerCase().trim() !== normTarget),
      };
      safeJSONSet('footballTeamSavedCoaches', updatedTeamCoaches);
      latestStateRef.current.teamSavedCoaches = updatedTeamCoaches;
      return updatedTeamCoaches;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teamSavedCoaches: latestStateRef.current.teamSavedCoaches,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore delete coach sync error:', err));
    }
  };

  const handleCopyCoachesFromTeam = (sourceTeamId: string, targetTeamId: string) => {
    const sourceList = Array.isArray(teamSavedCoaches[sourceTeamId]) ? teamSavedCoaches[sourceTeamId] : [];
    let updatedTeamCoaches: Record<string, string[]> = {};
    setTeamSavedCoaches((prev) => {
      updatedTeamCoaches = {
        ...prev,
        [targetTeamId]: [...sourceList],
      };
      safeJSONSet('footballTeamSavedCoaches', updatedTeamCoaches);
      latestStateRef.current.teamSavedCoaches = updatedTeamCoaches;
      return updatedTeamCoaches;
    });

    const { db } = getFirebaseServices();
    if (db) {
      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            teamSavedCoaches: updatedTeamCoaches,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
        .catch((err: any) => console.warn('Firestore copy coaches sync error:', err));
    }
  };

  // Auto-select first formation if none selected
  useEffect(() => {
    const unitForms = currentFormations.filter((f) => f && f.unit === activeUnit);
    if (unitForms.length > 0) {
      if (
        !selectedFormationId ||
        !unitForms.some((f) => f.id === selectedFormationId)
      ) {
        setSelectedFormationId(unitForms[0].id);
      }
    }
  }, [activeUnit, currentFormations]);

  // Helper to update current week formations
  const updateCurrentWeekFormations = (
    newFormations: FormationBoard[],
    syncToDefaults = false
  ) => {
    lastLocalEditTimeRef.current = Date.now();
    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    setWeeklyData((prev) => {
      const existing = resolveWeekState(prev, activeTeamId, currentWeek);
      const updatedWeekState: WeekState = {
        ...existing,
        formations: newFormations,
      };
      const updatedAll = {
        ...prev,
        [scopedKey]: updatedWeekState,
        [currentWeek]: updatedWeekState,
      };
      safeJSONSet('footballWeeklyData', updatedAll);
      latestStateRef.current.weeklyData = updatedAll;
      return updatedAll;
    });
    if (syncToDefaults) {
      setDefaultFormations(newFormations);
      safeJSONSet('footballDefaultFormations', newFormations);
      latestStateRef.current.defaultFormations = newFormations;
    }
  };

  // Helper to update depth chart
  const updateCurrentWeekDepthChart = (
    newDepthChart: Record<string, PlacedPlayer[]>
  ) => {
    lastLocalEditTimeRef.current = Date.now();
    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    setWeeklyData((prev) => {
      const existing = resolveWeekState(prev, activeTeamId, currentWeek);
      const updatedWeekState: WeekState = {
        ...existing,
        depthChart: newDepthChart,
      };
      const updatedAll = {
        ...prev,
        [scopedKey]: updatedWeekState,
        [currentWeek]: updatedWeekState,
      };
      safeJSONSet('footballWeeklyData', updatedAll);
      latestStateRef.current.weeklyData = updatedAll;
      return updatedAll;
    });
  };

  // Helper to update scrimmage chart
  const updateCurrentWeekScrimmageChart = (
    newScrimChart: Record<string, PlacedPlayer[]>
  ) => {
    lastLocalEditTimeRef.current = Date.now();
    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    setWeeklyData((prev) => {
      const existing = resolveWeekState(prev, activeTeamId, currentWeek);
      const updatedWeekState: WeekState = {
        ...existing,
        scrimmageChart: newScrimChart,
      };
      const updatedAll = {
        ...prev,
        [scopedKey]: updatedWeekState,
        [currentWeek]: updatedWeekState,
      };
      safeJSONSet('footballWeeklyData', updatedAll);
      latestStateRef.current.weeklyData = updatedAll;
      return updatedAll;
    });
  };

  // Helper to copy formations from another team into active team
  const handleCopyFormationsFromTeam = (sourceTeamId: string) => {
    if (userRole !== 'admin') return;
    const sourceScopedKey = getScopedWeekKey(sourceTeamId, currentWeek);
    const sourceState = weeklyData[sourceScopedKey] || weeklyData[sourceTeamId] || weeklyData[currentWeek];
    const sourceFormations = sourceState?.formations || defaultFormations;
    if (!sourceFormations || sourceFormations.length === 0) {
      alert('Selected source team has no formations available to copy.');
      return;
    }
    const targetScopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    const clonedFormations = deepClone(sourceFormations);
    setWeeklyData((prev) => ({
      ...prev,
      [targetScopedKey]: {
        ...(prev[targetScopedKey] || prev[currentWeek] || {}),
        formations: clonedFormations,
      },
    }));
    alert(`Successfully cloned ${clonedFormations.length} formations to ${currentActiveTeam.name}!`);
  };

  /* =========================================================================
     DRAG AND DROP HANDLERS (PLAYERS & POSITION CARDS)
     ========================================================================= */
  const handleDragStartRosterPlayer = (
    e: React.DragEvent,
    player: RosterPlayer
  ) => {
    if (userRole !== 'admin') return;
    const rosterDisplayName = (player.rosterName || player.lastName || `${player.firstName} ${player.lastName}`).trim();
    draggedPlayerRef.current = {
      type: 'roster',
      name: rosterDisplayName,
      num: player.num,
    };
    e.dataTransfer.setData('text/plain', rosterDisplayName);
  };

  const handleDragStartPlacedPlayer = (
    e: React.DragEvent,
    posId: string,
    idx: number,
    player: PlacedPlayer
  ) => {
    if (userRole !== 'admin') return;
    draggedPlayerRef.current = {
      type: 'placed_player',
      name: player.name,
      num: player.num,
      sourcePosId: posId,
      sourceIndex: idx,
      isScrimmage: activeUnit === 'scrimmage',
    };
    e.dataTransfer.setData('text/plain', player.name);
    e.stopPropagation();
  };

  const handleDropPlayerOnCard = (
    targetPosId: string,
    targetFormId: string,
    targetRowId: string
  ) => {
    if (userRole !== 'admin' || !draggedPlayerRef.current) return;
    const dragged = draggedPlayerRef.current;
    const isScrimmage = dragged.isScrimmage || activeUnit === 'scrimmage';

    const chart = isScrimmage
      ? { ...currentScrimmageChart }
      : { ...currentDepthChart };

    if (!chart[targetPosId]) chart[targetPosId] = [];

    let playerObj: PlacedPlayer | null = null;

    if (dragged.type === 'placed_player' && dragged.sourcePosId !== undefined) {
      if (chart[dragged.sourcePosId] && dragged.sourceIndex !== undefined) {
        playerObj = chart[dragged.sourcePosId][dragged.sourceIndex];
        chart[dragged.sourcePosId].splice(dragged.sourceIndex, 1);
      }
    } else if (dragged.type === 'roster') {
      playerObj = { name: dragged.name, num: dragged.num };
    }

    if (playerObj) {
      chart[targetPosId].push(playerObj);
    }

    if (isScrimmage) {
      updateCurrentWeekScrimmageChart(chart);
    } else {
      updateCurrentWeekDepthChart(chart);
    }

    draggedPlayerRef.current = null;
    flushAndSaveStateToStorage('player_move');
  };

  const handleRemovePlayerFromCard = (posId: string, playerIndex: number) => {
    if (userRole !== 'admin') return;
    const isScrimmage = activeUnit === 'scrimmage';
    const chart = isScrimmage
      ? { ...currentScrimmageChart }
      : { ...currentDepthChart };

    if (chart[posId]) {
      chart[posId].splice(playerIndex, 1);
      if (isScrimmage) updateCurrentWeekScrimmageChart(chart);
      else updateCurrentWeekDepthChart(chart);
      flushAndSaveStateToStorage('player_remove');
    }
  };

  const handleAssignPlayerDirect = (
    posId: string,
    player: PlacedPlayer,
    targetIndex?: number
  ) => {
    if (userRole !== 'admin') return;
    const isScrimmage = activeUnit === 'scrimmage';
    const chart = isScrimmage
      ? { ...currentScrimmageChart }
      : { ...currentDepthChart };

    if (!chart[posId]) chart[posId] = [];

    // Remove player if already in this position to avoid duplicates
    const filtered = chart[posId].filter((p) => p.num.trim() !== player.num.trim());
    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= filtered.length) {
      filtered.splice(targetIndex, 0, player);
    } else {
      filtered.push(player);
    }
    chart[posId] = filtered;

    if (isScrimmage) {
      updateCurrentWeekScrimmageChart(chart);
    } else {
      updateCurrentWeekDepthChart(chart);
    }
    flushAndSaveStateToStorage('player_assign_direct');
  };

  const handleReorderDepthPlayer = (
    posId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    if (userRole !== 'admin') return;
    const isScrimmage = activeUnit === 'scrimmage';
    const chart = isScrimmage
      ? { ...currentScrimmageChart }
      : { ...currentDepthChart };

    if (!chart[posId] || !chart[posId][fromIndex]) return;
    const list = [...chart[posId]];
    const [moved] = list.splice(fromIndex, 1);
    const clampedToIndex = Math.max(0, Math.min(list.length, toIndex));
    list.splice(clampedToIndex, 0, moved);
    chart[posId] = list;

    if (isScrimmage) {
      updateCurrentWeekScrimmageChart(chart);
    } else {
      updateCurrentWeekDepthChart(chart);
    }
    flushAndSaveStateToStorage('player_reorder_depth');
  };

  // Drag and Drop Position Cards Across Rows & Slots
  const handlePositionCardDragStart = (
    e: React.DragEvent,
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    if (userRole !== 'admin') return;
    draggedPositionCardRef.current = { formId, rIdx, pIdx };
    draggedPlayerRef.current = null;
    e.dataTransfer.setData('text/plain', 'position_card');
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handlePositionCardDropOnSlot = (
    e: React.DragEvent,
    targetFormId: string,
    targetRIdx: number,
    targetPIdx: number
  ) => {
    if (userRole !== 'admin' || !draggedPositionCardRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const { formId: srcFormId, rIdx: srcRIdx, pIdx: srcPIdx } =
      draggedPositionCardRef.current;

    const forms = deepClone(currentFormations) as FormationBoard[];
    const srcForm = forms.find((f) => f.id === srcFormId);
    const targetForm = forms.find((f) => f.id === targetFormId);

    if (srcForm && targetForm) {
      const srcRow = srcForm.rows[srcRIdx];
      const targetRow = targetForm.rows[targetRIdx];

      if (srcRow && targetRow) {
        if (srcFormId === targetFormId && srcRIdx === targetRIdx && srcPIdx === targetPIdx) {
          draggedPositionCardRef.current = null;
          return;
        }

        const srcPos = srcRow.positions[srcPIdx];
        const targetPos = targetRow.positions[targetPIdx];

        srcRow.positions[srcPIdx] = targetPos || null;
        targetRow.positions[targetPIdx] = srcPos || null;

        updateCurrentWeekFormations(forms);
        flushAndSaveStateToStorage('position_card_move');
      }
    }
    draggedPositionCardRef.current = null;
  };

  /* =========================================================================
     FORMATION ACTIONS
     ========================================================================= */
  const handleSetRowSlots = (formId: string, rIdx: number, newCount: number) => {
    const safeCount = Math.max(1, Math.min(12, newCount));
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        let positions = [...rows[rIdx].positions];
        while (positions.length < safeCount) positions.push(null);
        if (safeCount < positions.length) positions = positions.slice(0, safeCount);
        rows[rIdx] = { ...rows[rIdx], slotCount: safeCount, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAddSlotToRow = (formId: string, rIdx: number) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]) return;
    const currentCount = form.rows[rIdx].positions.length;
    if (currentCount >= 12) return;
    handleSetRowSlots(formId, rIdx, currentCount + 1);
  };

  const handleRemoveSlotFromRow = (formId: string, rIdx: number, pIdx?: number) => {
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        let positions = [...rows[rIdx].positions];
        if (positions.length <= 1) return f;
        if (typeof pIdx === 'number' && pIdx >= 0 && pIdx < positions.length) {
          positions.splice(pIdx, 1);
        } else {
          const lastNullIdx = positions.lastIndexOf(null);
          if (lastNullIdx !== -1) {
            positions.splice(lastNullIdx, 1);
          } else {
            positions.pop();
          }
        }
        rows[rIdx] = { ...rows[rIdx], slotCount: positions.length, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleInsertSlotAt = (formId: string, rIdx: number, pIdx: number) => {
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        const positions = [...rows[rIdx].positions];
        if (positions.length >= 12) return f;
        const insertIdx = Math.max(0, Math.min(positions.length, pIdx));
        positions.splice(insertIdx, 0, null);
        rows[rIdx] = { ...rows[rIdx], slotCount: positions.length, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleClearPositionToEmpty = (formId: string, rIdx: number, pIdx: number) => {
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        const positions = [...rows[rIdx].positions];
        if (pIdx >= 0 && pIdx < positions.length) {
          positions[pIdx] = null;
        }
        rows[rIdx] = { ...rows[rIdx], positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAssignPositionToSlot = (
    formId: string,
    rIdx: number,
    pIdx: number,
    posName: string
  ) => {
    if (!posName || !posName.trim()) return;
    const cleanName = posName.trim();
    const newPosId = `${formId}-${cleanName}-${Date.now()}_${pIdx}`;
    const newPos: PositionSlot = { id: newPosId, name: cleanName };

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        const positions = [...rows[rIdx].positions];
        while (positions.length <= pIdx) {
          positions.push(null);
        }
        positions[pIdx] = newPos;
        rows[rIdx] = { ...rows[rIdx], slotCount: positions.length, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAddPositionDirect = (
    formId: string,
    rIdx: number,
    posName: string
  ) => {
    if (!posName || !posName.trim()) return;
    const cleanName = posName.trim();
    const newPosId = `${formId}-${cleanName}-${Date.now()}`;
    const newPos: PositionSlot = { id: newPosId, name: cleanName };

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        const positions = [...rows[rIdx].positions];
        const emptyIdx = positions.indexOf(null);
        if (emptyIdx !== -1) {
          positions[emptyIdx] = newPos;
        } else {
          positions.push(newPos);
        }
        rows[rIdx] = { ...rows[rIdx], slotCount: positions.length, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleRenamePositionDirect = (
    formId: string,
    rIdx: number,
    pIdx: number,
    newName: string
  ) => {
    if (!newName || !newName.trim()) return;
    const cleanName = newName.trim();
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]?.positions[pIdx]) return f;
        const positions = [...rows[rIdx].positions];
        positions[pIdx] = { ...positions[pIdx]!, name: cleanName };
        rows[rIdx] = { ...rows[rIdx], positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleRenameRowDirect = (
    formId: string,
    rIdx: number,
    newName: string
  ) => {
    if (!newName || !newName.trim()) return;
    const cleanName = newName.trim();
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        if (!rows[rIdx]) return f;
        rows[rIdx] = { ...rows[rIdx], label: cleanName };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAddRowDirect = (
    formId: string,
    label: string,
    slotCount: number = 7
  ) => {
    const cleanLabel = (label && label.trim()) || 'Secondary Level';
    const safeSlots = Math.max(1, Math.min(12, slotCount || 7));
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        return {
          ...f,
          rows: [
            ...f.rows,
            {
              id: `row_${Date.now()}_${f.rows.length}`,
              label: cleanLabel,
              slotCount: safeSlots,
              positions: Array(safeSlots).fill(null),
            },
          ],
        };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAddFormationDirect = (
    unit: 'offense' | 'defense' | 'st' | 'groups',
    name: string,
    templateKey?: string
  ) => {
    const cleanName = (name && name.trim()) || `New ${unit.toUpperCase()} Formation`;
    const newId = `form_${Date.now()}`;
    
    let initialRows: FormationRow[] = [
      {
        id: `row_${Date.now()}_0`,
        label: unit === 'offense' ? 'Offensive Line' : unit === 'defense' ? 'Defensive Line' : unit === 'st' ? 'Line / Coverage' : 'Level 1',
        slotCount: 7,
        positions: Array(7).fill(null),
      },
    ];

    if (templateKey === '11_offense' || (unit === 'offense' && cleanName.toLowerCase().includes('11'))) {
      initialRows = [
        {
          id: `row_${Date.now()}_0`,
          label: 'Offensive Line & TE (Y1)',
          slotCount: 7,
          positions: [
            { id: `${newId}-LT`, name: 'LT' },
            { id: `${newId}-LG`, name: 'LG' },
            { id: `${newId}-C`, name: 'C' },
            { id: `${newId}-RG`, name: 'RG' },
            { id: `${newId}-RT`, name: 'RT' },
            { id: `${newId}-Y1`, name: 'Y1' },
            null,
          ],
        },
        {
          id: `row_${Date.now()}_1`,
          label: 'Wide Receivers (X, W, Z)',
          slotCount: 7,
          positions: [
            { id: `${newId}-X`, name: 'X' },
            null,
            null,
            null,
            { id: `${newId}-W`, name: 'W' },
            null,
            { id: `${newId}-Z`, name: 'Z' },
          ],
        },
        {
          id: `row_${Date.now()}_2`,
          label: 'Backfield (1 - 4)',
          slotCount: 7,
          positions: [
            null,
            null,
            { id: `${newId}-1`, name: '1 (QB)' },
            null,
            { id: `${newId}-4`, name: '4 (RB)' },
            null,
            null,
          ],
        },
      ];
    } else if (templateKey === '44_defense' || (unit === 'defense' && cleanName.toLowerCase().includes('4-4'))) {
      initialRows = [
        {
          id: `row_${Date.now()}_0`,
          label: 'Defensive Line (DE, DT, NT, DE)',
          slotCount: 7,
          positions: [
            null,
            { id: `${newId}-LDE`, name: 'LDE' },
            { id: `${newId}-LDT`, name: 'LDT' },
            null,
            { id: `${newId}-RDT`, name: 'RDT' },
            { id: `${newId}-RDE`, name: 'RDE' },
            null,
          ],
        },
        {
          id: `row_${Date.now()}_1`,
          label: 'Linebackers (WLB, MLB, SLB, ROV)',
          slotCount: 7,
          positions: [
            { id: `${newId}-WLB`, name: 'WLB' },
            null,
            { id: `${newId}-MLB`, name: 'MLB' },
            null,
            { id: `${newId}-SLB`, name: 'SLB' },
            null,
            { id: `${newId}-ROV`, name: 'ROV' },
          ],
        },
        {
          id: `row_${Date.now()}_2`,
          label: 'Secondary (LCB, FS, SS, RCB)',
          slotCount: 7,
          positions: [
            { id: `${newId}-LCB`, name: 'LCB' },
            null,
            { id: `${newId}-FS`, name: 'FS' },
            null,
            { id: `${newId}-SS`, name: 'SS' },
            null,
            { id: `${newId}-RCB`, name: 'RCB' },
          ],
        },
      ];
    } else if (unit === 'defense') {
      initialRows = [
        {
          id: `row_${Date.now()}_0`,
          label: 'Defensive Line',
          slotCount: 7,
          positions: [
            null,
            { id: `${newId}-LDE`, name: 'LDE' },
            { id: `${newId}-DT1`, name: 'DT1' },
            null,
            { id: `${newId}-DT2`, name: 'DT2' },
            { id: `${newId}-RDE`, name: 'RDE' },
            null,
          ],
        },
        {
          id: `row_${Date.now()}_1`,
          label: 'Linebackers',
          slotCount: 7,
          positions: [
            null,
            { id: `${newId}-WLB`, name: 'WLB' },
            null,
            { id: `${newId}-MLB`, name: 'MLB' },
            null,
            { id: `${newId}-SLB`, name: 'SLB' },
            null,
          ],
        },
        {
          id: `row_${Date.now()}_2`,
          label: 'Secondary',
          slotCount: 7,
          positions: [
            { id: `${newId}-CB1`, name: 'CB1' },
            null,
            { id: `${newId}-FS`, name: 'FS' },
            null,
            { id: `${newId}-SS`, name: 'SS' },
            null,
            { id: `${newId}-CB2`, name: 'CB2' },
          ],
        },
      ];
    } else if (unit === 'st') {
      initialRows = [
        {
          id: `row_${Date.now()}_0`,
          label: 'Front Line & Coverage',
          slotCount: 7,
          positions: [
            { id: `${newId}-L1`, name: 'L1' },
            { id: `${newId}-L2`, name: 'L2' },
            { id: `${newId}-LS`, name: 'LS/C' },
            { id: `${newId}-R2`, name: 'R2' },
            { id: `${newId}-R1`, name: 'R1' },
            { id: `${newId}-GN1`, name: 'Gunner L' },
            { id: `${newId}-GN2`, name: 'Gunner R' },
          ],
        },
        {
          id: `row_${Date.now()}_1`,
          label: 'Specialists & Returners',
          slotCount: 7,
          positions: [
            null,
            { id: `${newId}-UP`, name: 'Upback' },
            null,
            { id: `${newId}-K`, name: 'K / P' },
            null,
            { id: `${newId}-RET`, name: 'Returner' },
            null,
          ],
        },
      ];
    }

    const newForm: FormationBoard = {
      id: newId,
      unit,
      name: cleanName,
      collapsed: false,
      rows: initialRows,
    };

    const updated = [...currentFormations, newForm];
    updateCurrentWeekFormations(updated, true);
    setSelectedFormationId(newId);
  };

  const handleRenameFormationDirect = (formId: string, newName: string) => {
    if (!newName || !newName.trim()) return;
    const clean = newName.trim();
    const updated = currentFormations.map((f) =>
      f.id === formId ? { ...f, name: clean } : f
    );
    updateCurrentWeekFormations(updated, true);
  };

  const handleDuplicateFormationDirect = (formId: string, newName: string) => {
    if (userRole !== 'admin') return;
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;
    const clean = (newName && newName.trim()) || `${form.name} (Copy)`;

    const newFormId = `form_${Date.now()}`;
    const dc = { ...currentDepthChart };
    const sc = { ...currentScrimmageChart };

    const clonedForm: FormationBoard = {
      id: newFormId,
      unit: form.unit,
      name: clean,
      collapsed: false,
      rows: form.rows.map((row, rIdx) => ({
        id: `row_${Date.now()}_${rIdx}`,
        label: row.label,
        slotCount: row.slotCount,
        positions: row.positions.map((pos, pIdx) => {
          if (pos) {
            const newPosId = `${newFormId}-${pos.name}-${Date.now()}_${pIdx}`;
            if (dc[pos.id]) dc[newPosId] = deepClone(dc[pos.id]);
            if (sc[pos.id]) sc[newPosId] = deepClone(sc[pos.id]);
            return { id: newPosId, name: pos.name };
          }
          return null;
        }),
      })),
    };

    const updated = [...currentFormations, clonedForm];
    updateCurrentWeekFormations(updated, true);
    updateCurrentWeekDepthChart(dc);
    updateCurrentWeekScrimmageChart(sc);
    setSelectedFormationId(newFormId);
  };

  const handleMovePositionDirect = (
    formId: string,
    srcRIdx: number,
    srcPIdx: number,
    targetRIdx: number
  ) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[srcRIdx]?.positions[srcPIdx]) return;
    const pos = form.rows[srcRIdx].positions[srcPIdx]!;
    if (targetRIdx < 0 || targetRIdx >= form.rows.length) return;

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = deepClone(f.rows);
        rows[srcRIdx].positions[srcPIdx] = null;
        const emptyIdx = rows[targetRIdx].positions.indexOf(null);
        if (emptyIdx !== -1) {
          rows[targetRIdx].positions[emptyIdx] = pos;
        } else {
          rows[targetRIdx].positions.push(pos);
          rows[targetRIdx].slotCount = rows[targetRIdx].positions.length;
        }
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleCopyPositionDirect = (
    formId: string,
    srcRIdx: number,
    srcPIdx: number,
    targetFormId: string
  ) => {
    const srcForm = currentFormations.find((f) => f.id === formId);
    if (!srcForm || !srcForm.rows[srcRIdx]?.positions[srcPIdx]) return;
    const pos = srcForm.rows[srcRIdx].positions[srcPIdx]!;

    const targetForm = currentFormations.find((f) => f.id === targetFormId);
    if (!targetForm) return;

    const newPosId = `${targetForm.id}-${pos.name}-${Date.now()}`;
    const newPos = { id: newPosId, name: pos.name };

    const forms = currentFormations.map((f) => {
      if (f.id === targetForm.id) {
        const rows = [...f.rows];
        rows[0].positions.push(newPos);
        rows[0].slotCount = rows[0].positions.length;
        return { ...f, rows };
      }
      return f;
    });

    const dc = { ...currentDepthChart };
    if (dc[pos.id]) dc[newPosId] = deepClone(dc[pos.id]);

    updateCurrentWeekFormations(forms, true);
    updateCurrentWeekDepthChart(dc);
  };

  const handleAddFormation = (unit: 'offense' | 'defense' | 'st' | 'groups') => {
    handleAddFormationDirect(unit, `New ${unit.toUpperCase()} Formation`);
  };

  const handleDuplicateFormation = (formId: string) => {
    handleDuplicateFormationDirect(formId, '');
  };

  const handleRenameFormation = (formId: string) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;
    handleRenameFormationDirect(formId, form.name);
  };

  const handleDeleteFormation = (formId: string) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;

    // Collect all position IDs in the deleted formation to clean up depthChart/scrimmageChart
    const deletedPosIds = new Set<string>();
    if (Array.isArray(form.rows)) {
      form.rows.forEach((r) => {
        if (r && Array.isArray(r.positions)) {
          r.positions.forEach((p) => {
            if (p && p.id) deletedPosIds.add(p.id);
          });
        }
      });
    }

    const updated = currentFormations.filter((f) => f.id !== formId);

    lastLocalEditTimeRef.current = Date.now();
    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
    setWeeklyData((prev) => {
      const existing = resolveWeekState(prev, activeTeamId, currentWeek);
      const newDepthChart = { ...(existing.depthChart || {}) };
      const newScrimmageChart = { ...(existing.scrimmageChart || {}) };
      deletedPosIds.forEach((posId) => {
        delete newDepthChart[posId];
        delete newScrimmageChart[posId];
      });

      const updatedWeekState: WeekState = {
        ...existing,
        formations: updated,
        depthChart: newDepthChart,
        scrimmageChart: newScrimmageChart,
      };

      const updatedAll = {
        ...prev,
        [scopedKey]: updatedWeekState,
        [currentWeek]: updatedWeekState,
      };
      safeJSONSet('footballWeeklyData', updatedAll);
      latestStateRef.current.weeklyData = updatedAll;
      return updatedAll;
    });

    setDefaultFormations(updated);
    safeJSONSet('footballDefaultFormations', updated);
    latestStateRef.current.defaultFormations = updated;
  };

  const handleMoveFormation = (formId: string, direction: number) => {
    const forms = [...currentFormations];
    const unitForms = forms.filter((f) => f.unit === activeUnit);
    const uIdx = unitForms.findIndex((f) => f.id === formId);
    if (uIdx === -1) return;
    const targetUIdx = uIdx + direction;
    if (targetUIdx < 0 || targetUIdx >= unitForms.length) return;

    const targetFormId = unitForms[targetUIdx].id;
    const gIdx1 = forms.findIndex((f) => f.id === formId);
    const gIdx2 = forms.findIndex((f) => f.id === targetFormId);
    if (gIdx1 !== -1 && gIdx2 !== -1) {
      const temp = forms[gIdx1];
      forms[gIdx1] = forms[gIdx2];
      forms[gIdx2] = temp;
      updateCurrentWeekFormations(forms, true);
    }
  };

  const handleAddRow = (formId: string) => {
    handleAddRowDirect(formId, 'Secondary Level', 7);
  };

  const handleEditRowName = (formId: string, rIdx: number) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]) return;
    handleRenameRowDirect(formId, rIdx, form.rows[rIdx].label);
  };

  const handleEditRowSlots = (formId: string, rIdx: number) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]) return;
    handleSetRowSlots(formId, rIdx, form.rows[rIdx].positions.length);
  };

  const handleDeleteRow = (formId: string, rIdx: number) => {
    if (!confirm('Delete this row?')) return;
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        rows.splice(rIdx, 1);
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  const handleAddPosition = (formId: string, rIdx: number) => {
    handleAddPositionDirect(formId, rIdx, 'Pos');
  };

  const handleEditPositionName = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]?.positions[pIdx]) return;
    handleRenamePositionDirect(formId, rIdx, pIdx, form.rows[rIdx].positions[pIdx]!.name);
  };

  const handleMovePositionRow = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]?.positions[pIdx]) return;
    handleMovePositionDirect(formId, rIdx, pIdx, (rIdx + 1) % form.rows.length);
  };

  const handleCopyPositionToOtherForm = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const otherForm = currentFormations.find((f) => f.id !== formId);
    if (otherForm) {
      handleCopyPositionDirect(formId, rIdx, pIdx, otherForm.id);
    }
  };

  const handleDeletePosition = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        rows[rIdx].positions.splice(pIdx, 1);
        rows[rIdx].slotCount = rows[rIdx].positions.length;
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms, true);
  };

  /* =========================================================================
     PRACTICE PLAN ACTIONS
     ========================================================================= */
  const updatePracticeDataAndSave = (
    updater: (prev: PracticePlan[]) => PracticePlan[]
  ) => {
    setPracticeData((prev) => {
      const updated = updater(prev);
      latestStateRef.current.practiceData = updated;
      safeJSONSet('footballPracticeData', updated);
      lastLocalEditTimeRef.current = Date.now();
      return updated;
    });
    debouncedSave('practice');
  };

  const handleOpenNewPracticeModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateStr = prompt('Enter Date (YYYY-MM-DD):', todayStr);
    if (!dateStr || !dateStr.trim()) return;

    const cleanDate = dateStr.trim();
    const dayOfWeek = getDayOfWeekForDate(cleanDate);
    const dayFolder = getFormattedDayFolder(cleanDate);
    const weekFolder = calculateWeekFolderForDate(cleanDate, scheduleEvents);

    // Calculate next sequential practice number among non-cancelled practices
    const activeCount = practiceData.filter((p) => !p.isCancelled).length;
    const defaultTitle = `Practice #${activeCount + 1} - ${dayOfWeek} (${weekFolder})`;
    const title = prompt('Enter Practice Title:', defaultTitle);
    if (!title || !title.trim()) return;

    const newPrac: PracticePlan = {
      id: `prac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      teamId: activeTeamId,
      year: cleanDate.includes('-') ? cleanDate.split('-')[0] : '2026',
      weekFolder: weekFolder,
      dayFolder: dayFolder,
      title: title.trim(),
      date: cleanDate,
      day: dayOfWeek,
      startTime: '17:05',
      endTime: '19:00',
      location: 'Crane Road',
      lastEdited: Date.now(),
      plan: deepClone(DEFAULT_PRACTICE_TEMPLATES['Standard Practice']),
    };

    updatePracticeDataAndSave((prev) => [...prev, newPrac]);
    setCurrentPracticeId(newPrac.id);
  };

  const handleEditPracticeDetails = () => {
    const cur = practiceData.find((p) => p.id === currentPracticeId);
    if (!cur) return;
    const yr = prompt('Edit Season Year:', cur.year || '2026');
    if (yr === null) return;
    const dt = prompt('Edit Date (YYYY-MM-DD):', cur.date);
    if (dt === null) return;

    const cleanDate = dt.trim();
    const autoWeek = calculateWeekFolderForDate(cleanDate, scheduleEvents);
    const autoDay = getDayOfWeekForDate(cleanDate);
    const autoDayFolder = getFormattedDayFolder(cleanDate);

    const wk = prompt('Edit Week Folder:', autoWeek || cur.weekFolder || 'Week 1');
    if (wk === null) return;
    const title = prompt('Edit Practice Title:', cur.title);
    if (title === null) return;

    updatePracticeDataAndSave((prev) =>
      prev.map((p) =>
        p.id === currentPracticeId
          ? {
              ...p,
              year: yr.trim(),
              weekFolder: wk.trim(),
              title: title.trim(),
              date: cleanDate,
              day: autoDay,
              dayFolder: autoDayFolder,
              lastEdited: Date.now(),
            }
          : p
      )
    );
  };

  const handleTogglePracticeCancelled = (
    practiceId: string,
    isCancelled?: boolean,
    reason?: string
  ) => {
    let targetDate = '';
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === practiceId) {
          targetDate = p.date || '';
          const newStatus = isCancelled !== undefined ? isCancelled : !p.isCancelled;
          return {
            ...p,
            isCancelled: newStatus,
            cancellationReason: reason !== undefined ? reason : (newStatus ? 'Cancelled' : ''),
            lastEdited: Date.now(),
          };
        }
        return p;
      })
    );

    // Also sync to matching ScheduleEvent if any
    setScheduleEvents((prev) => {
      const curPlan = practiceData.find((p) => p.id === practiceId);
      const next = prev.map((ev) => {
        if (
          ev.linkedPracticePlanId === practiceId ||
          (ev.date && targetDate && ev.date === targetDate && (ev.type === 'practice' || ev.type === 'scrimmage'))
        ) {
          const newStatus = isCancelled !== undefined ? isCancelled : !ev.isCancelled;
          return {
            ...ev,
            isCancelled: newStatus,
            cancellationReason: reason !== undefined ? reason : (curPlan?.cancellationReason || (newStatus ? 'Cancelled' : '')),
            lastEdited: Date.now(),
          };
        }
        return ev;
      });
      safeJSONSet('footballScheduleEvents', next);
      latestStateRef.current.scheduleEvents = next;
      return next;
    });
  };

  const handleQuickCreatePlanFromSchedule = (evt: ScheduleEvent) => {
    const planId = handleSyncPracticeToPlan(evt);
    const rawWeek = String(evt.week !== undefined ? evt.week : '1');
    const match = rawWeek.match(/Week\s*(\d+)/i);
    const weekNum = match ? match[1] : rawWeek.replace(/\D/g, '') || '1';
    ensureWeekExists(weekNum);
    setCurrentWeek(weekNum);
    setCurrentPracticeId(planId);
    setActiveUnit('practice');
  };

  const handleUpdateRoster = (newRoster: RosterPlayer[]) => {
    const normalized = normalizeRoster(newRoster, false);
    setRoster(normalized);
    safeJSONSet('footballRoster', normalized);
    latestStateRef.current.roster = normalized;

    // Build map of jersey number -> display name
    const nameMap = new Map<string, string>();
    normalized.forEach((p) => {
      const displayName = (p.rosterName || p.lastName || `${p.firstName} ${p.lastName}`).trim();
      nameMap.set(p.num.trim(), displayName);
    });

    // Cascade updated names to placed players in depth charts and scrimmage charts
    setWeeklyData((prev) => {
      let changed = false;
      const nextWeekly = { ...prev };
      Object.keys(nextWeekly).forEach((wKey) => {
        const wState = nextWeekly[wKey];
        if (!wState) return;
        let weekChanged = false;
        let newDC = wState.depthChart;
        let newSC = wState.scrimmageChart;

        if (newDC) {
          const updatedDC: Record<string, PlacedPlayer[]> = {};
          let dcChanged = false;
          Object.entries(newDC).forEach(([posId, players]) => {
            if (Array.isArray(players)) {
              let posChanged = false;
              const nextPlayers = players.map((p) => {
                if (p && p.num && nameMap.has(p.num.trim())) {
                  const mappedName = nameMap.get(p.num.trim())!;
                  if (p.name !== mappedName) {
                    posChanged = true;
                    return { ...p, name: mappedName };
                  }
                }
                return p;
              });
              if (posChanged) {
                dcChanged = true;
                updatedDC[posId] = nextPlayers;
              } else {
                updatedDC[posId] = players;
              }
            } else {
              updatedDC[posId] = players;
            }
          });
          if (dcChanged) {
            newDC = updatedDC;
            weekChanged = true;
          }
        }

        if (newSC) {
          const updatedSC: Record<string, PlacedPlayer[]> = {};
          let scChanged = false;
          Object.entries(newSC).forEach(([posId, players]) => {
            if (Array.isArray(players)) {
              let posChanged = false;
              const nextPlayers = players.map((p) => {
                if (p && p.num && nameMap.has(p.num.trim())) {
                  const mappedName = nameMap.get(p.num.trim())!;
                  if (p.name !== mappedName) {
                    posChanged = true;
                    return { ...p, name: mappedName };
                  }
                }
                return p;
              });
              if (posChanged) {
                scChanged = true;
                updatedSC[posId] = nextPlayers;
              } else {
                updatedSC[posId] = players;
              }
            } else {
              updatedSC[posId] = players;
            }
          });
          if (scChanged) {
            newSC = updatedSC;
            weekChanged = true;
          }
        }

        if (weekChanged) {
          changed = true;
          nextWeekly[wKey] = {
            ...wState,
            depthChart: newDC,
            scrimmageChart: newSC,
          };
        }
      });
      return changed ? nextWeekly : prev;
    });
  };

  const handleUpdatePlayerInRoster = (updatedPlayer: RosterPlayer) => {
    const next = roster.map((p) =>
      p.id === updatedPlayer.id || p.num === updatedPlayer.num ? updatedPlayer : p
    );
    handleUpdateRoster(next);
  };

  const handleAutoNumberPractices = () => {
    if (
      confirm(
        'Auto-number non-cancelled practice plans sequentially by date? (Cancelled practices will be excluded from the practice count and subsequent plans will be re-numbered)'
      )
    ) {
      updatePracticeDataAndSave((prev) => {
        // Sort chronologically
        const sorted = [...prev].sort((a, b) => {
          const dateA = a.date || '1970-01-01';
          const dateB = b.date || '1970-01-01';
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
        });

        let seqNum = 0;
        const newTitleMap: Record<string, string> = {};
        sorted.forEach((p) => {
          if (p.isCancelled) {
            newTitleMap[p.id] = p.title.startsWith('[Cancelled]')
              ? p.title
              : `[Cancelled] ${p.title.replace(/^Practice #\d+\s*[:-]?\s*/i, '')}`;
          } else {
            seqNum++;
            const dayName = p.day || getDayOfWeekForDate(p.date);
            const wk = p.weekFolder || calculateWeekFolderForDate(p.date, scheduleEvents);
            
            // Check if there is existing custom focus text in the title (after " - ")
            const dashIdx = p.title.indexOf(' - ');
            const hasCustomText =
              dashIdx !== -1 &&
              !p.title.substring(dashIdx + 3).startsWith('Practice #');
            const customFocus = hasCustomText
              ? p.title.substring(dashIdx + 3).trim()
              : `${dayName} (${wk})`;

            newTitleMap[p.id] = `Practice #${seqNum} - ${customFocus}`;
          }
        });

        return prev.map((p) => ({
          ...p,
          title: newTitleMap[p.id] || p.title,
          lastEdited: Date.now(),
        }));
      });
    }
  };

  const handleDeletePractice = () => {
    if (practiceData.length <= 1) {
      alert('Cannot delete the last practice plan.');
      return;
    }
    const planToDelete = practiceData.find((p) => p.id === currentPracticeId);
    if (!planToDelete) return;

    const matchingEvent = scheduleEvents.find(
      (e) =>
        e.linkedPracticePlanId === planToDelete.id ||
        (planToDelete.date && e.date === planToDelete.date && (e.type === 'practice' || e.type === 'scrimmage'))
    );

    const hasAttendance = attendanceLogs.some(
      (l) => planToDelete.date && l.date === planToDelete.date
    );

    let confirmPrompt = `Delete practice plan "${planToDelete.title || 'Current Practice'}"?`;
    if (matchingEvent || hasAttendance) {
      confirmPrompt += `\n\nThis will also remove this practice from the Schedule and Attendance Tracker.`;
    }

    if (confirm(confirmPrompt)) {
      const remaining = practiceData.filter((p) => p.id !== currentPracticeId);
      updatePracticeDataAndSave(() => remaining);
      setCurrentPracticeId(remaining[0]?.id || null);

      if (matchingEvent) {
        handleDeleteScheduleEvent(matchingEvent.id);
      } else if (hasAttendance && planToDelete.date) {
        // Clean up attendance logs for this date if no event
        const matchingLogs = attendanceLogs.filter((l) => l.date === planToDelete.date);
        if (matchingLogs.length > 0) {
          const matchingIds = new Set(matchingLogs.map((l) => l.id));
          const updatedLogs = attendanceLogs.filter((l) => !matchingIds.has(l.id));
          setAttendanceLogs(updatedLogs);
          safeJSONSet('footballAttendanceLogs', updatedLogs);
        }
      }
    }
  };

  const handleApplyPracticeTemplate = (templateName: string) => {
    const tmpl = practiceTemplates[templateName];
    if (!tmpl) {
      alert(`Template "${templateName}" not found.`);
      return;
    }
    const planToApply = Array.isArray(tmpl)
      ? tmpl
      : (tmpl as any).plan || (tmpl as any).periods;
    if (!Array.isArray(planToApply) || planToApply.length === 0) {
      alert(`Template "${templateName}" has no periods to apply.`);
      return;
    }
    if (
      confirm(
        `Apply template "${templateName}"? This will replace the periods in the active practice plan.`
      )
    ) {
      const activeList =
        activeTeamPracticeData.length > 0 ? activeTeamPracticeData : practiceData;
      const targetId =
        currentPracticeId ||
        findBestActivePracticeId(activeList) ||
        activeList[0]?.id;

      if (!targetId) {
        alert('Please create or select a practice plan first.');
        return;
      }

      updatePracticeDataAndSave((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? {
                ...p,
                plan: deepClone(planToApply),
                periods: deepClone(planToApply),
                lastEdited: Date.now(),
              }
            : p
        )
      );
      debouncedSave('practice');
    }
  };

  const handleSaveCurrentAsTemplate = (customName?: string) => {
    const activeList =
      activeTeamPracticeData.length > 0 ? activeTeamPracticeData : practiceData;
    const cur =
      activeList.find((p) => p && p.id === currentPracticeId) ||
      activeList.find((p) => p && p.id === findBestActivePracticeId(activeList)) ||
      activeList[0];

    const periodsToSave = cur
      ? Array.isArray(cur.plan) && cur.plan.length > 0
        ? cur.plan
        : Array.isArray(cur.periods) && cur.periods.length > 0
        ? cur.periods
        : []
      : [];

    if (!cur || periodsToSave.length === 0) {
      alert('No practice periods found in the active practice plan to save. Please add periods before saving as a template.');
      return;
    }

    const defaultName = cur.name ? `${cur.name} Template` : 'Standard Practice Template';
    const name =
      typeof customName === 'string' && customName.trim()
        ? customName.trim()
        : prompt('Enter a name for this practice template:', defaultName);

    if (name && name.trim()) {
      const trimmed = name.trim();
      const next = {
        ...practiceTemplates,
        [trimmed]: deepClone(periodsToSave),
      };
      setPracticeTemplates(next);
      latestStateRef.current.practiceTemplates = next;
      safeJSONSet('footballPracticeTemplates', next);
      debouncedSave('practice');

      const { db } = getFirebaseServices();
      if (db) {
        db.collection('teamData')
          .doc('depthChartData')
          .set({ practiceTemplates: next, updatedAt: Date.now() }, { merge: true })
          .catch((err: any) => console.warn('Firestore practice template save error:', err));
      }

      alert(`Practice Template "${trimmed}" saved! You can now apply it to any practice plan.`);
    }
  };

  const handleUpdatePracticeMeta = (
    field: keyof PracticePlan,
    value: any
  ) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const updated = { ...p, [field]: value, lastEdited: Date.now() };
          if (field === 'date' && value) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const parts = String(value).split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              const d = parseInt(parts[2], 10);
              if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                const dt = new Date(y, m - 1, d, 12, 0, 0);
                const dayOfWeek = dayNames[dt.getDay()];
                if (dayOfWeek) {
                  updated.day = dayOfWeek;
                  updated.dayFolder = dayOfWeek;
                }
              }
            }
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleAddPeriod = () => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const defaultCat =
            cascadingDrills[0]?.name || '⚡ (Warm-up, Agility and Conditioning)';
          return {
            ...p,
            lastEdited: Date.now(),
            plan: [
              ...p.plan,
              {
                time: 15,
                category: defaultCat,
                format: 'static',
                stations: [
                  {
                    name: 'New Station',
                    desc: 'Drill details...',
                    coach: 'Coach',
                    focus: 'Effort & technique',
                  },
                ],
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const handleRemovePeriod = (pIdx: number) => {
    if (confirm('Delete this period?')) {
      updatePracticeDataAndSave((prev) =>
        prev.map((p) => {
          if (p.id === currentPracticeId) {
            const plan = [...p.plan];
            plan.splice(pIdx, 1);
            return { ...p, plan, lastEdited: Date.now() };
          }
          return p;
        })
      );
    }
  };

  const handleMovePeriod = (pIdx: number, direction: number) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          const newIdx = pIdx + direction;
          if (newIdx < 0 || newIdx >= plan.length) return p;
          const [moved] = plan.splice(pIdx, 1);
          plan.splice(newIdx, 0, moved);
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodTime = (pIdx: number, time: number) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], time };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodCategory = (pIdx: number, category: string) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], category };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodFormat = (
    pIdx: number,
    format: 'static' | 'rotating'
  ) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], format };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleAddStationToPeriod = (pIdx: number) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = {
            ...plan[pIdx],
            stations: [
              ...plan[pIdx].stations,
              {
                name: 'New Station',
                desc: 'Drill details...',
                coach: '',
                focus: 'Execution',
              },
            ],
          };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleRemoveStationFromPeriod = (pIdx: number, sIdx: number) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          if (!plan[pIdx] || !plan[pIdx].stations) return p;
          const currentStations = plan[pIdx].stations;
          if (currentStations.length <= 1) {
            // Reset the single station to empty
            const stations = [
              {
                name: '',
                desc: '',
                coach: '',
                focus: '',
              },
            ];
            plan[pIdx] = { ...plan[pIdx], stations };
            return { ...p, plan, lastEdited: Date.now() };
          }
          const stations = [...currentStations];
          stations.splice(sIdx, 1);
          plan[pIdx] = { ...plan[pIdx], stations };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
    flushAndSaveStateToStorage('remove_station');
  };

  const handleUpdateStation = (
    pIdx: number,
    sIdx: number,
    field: keyof PracticeStation,
    value: string
  ) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          const stations = [...plan[pIdx].stations];
          stations[sIdx] = { ...stations[sIdx], [field]: value };
          plan[pIdx] = { ...plan[pIdx], stations };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  const handleSelectDrillForStation = (
    pIdx: number,
    sIdx: number,
    drill: DrillItem
  ) => {
    updatePracticeDataAndSave((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          const stations = [...plan[pIdx].stations];
          stations[sIdx] = {
            ...stations[sIdx],
            name: drill.name,
            desc: drill.desc,
            focus: drill.key,
          };
          plan[pIdx] = { ...plan[pIdx], stations };
          return { ...p, plan, lastEdited: Date.now() };
        }
        return p;
      })
    );
  };

  /* =========================================================================
     DRILL LIBRARY RECURSIVE ACTIONS
     ========================================================================= */
  const findFolderByPath = (
    list: DrillFolder[],
    pathKey: string
  ): DrillFolder | null => {
    for (let i = 0; i < list.length; i++) {
      const cur = String(i);
      if (cur === pathKey) return list[i];
      if (pathKey.startsWith(`${cur}_`)) {
        const sub = pathKey.substring(cur.length + 1);
        if (list[i].subfolders) {
          const found = findFolderByPath(list[i].subfolders, sub);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const updateCascadingDrillsAndSave = (
    updater: (prev: DrillFolder[]) => DrillFolder[]
  ) => {
    setCascadingDrills((prev) => {
      const updated = updater(prev);
      latestStateRef.current.cascadingDrills = updated;
      safeJSONSet('footballCascadingDrills', updated);
      lastLocalEditTimeRef.current = Date.now();
      return updated;
    });
    debouncedSave('drills');
  };

  const handleAddTopDrillFolder = () => {
    const name = prompt('Enter new Top-Level Folder Name (e.g. Special Teams):');
    if (name && name.trim()) {
      updateCascadingDrillsAndSave((prev) => [
        ...prev,
        { name: name.trim(), subfolders: [], drills: [] },
      ]);
    }
  };

  const handleAddSubfolder = (pathKey: string) => {
    const name = prompt('Enter Subfolder Name:');
    if (name && name.trim()) {
      updateCascadingDrillsAndSave((prev) => {
        const updated = deepClone(prev);
        const target = findFolderByPath(updated, pathKey);
        if (target) {
          if (!target.subfolders) target.subfolders = [];
          target.subfolders.push({
            name: name.trim(),
            subfolders: [],
            drills: [],
          });
        }
        return updated;
      });
    }
  };

  const handleAddDrill = (pathKey: string) => {
    const newDrillId = `drill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    updateCascadingDrillsAndSave((prev) => {
      const updated = deepClone(prev);
      const target = findFolderByPath(updated, pathKey);
      if (target) {
        if (!target.drills) target.drills = [];
        target.drills.push({
          id: newDrillId,
          name: 'New Drill',
          desc: '',
          key: '',
        });
      }
      return updated;
    });
  };

  const handleRenameDrillFolder = (pathKey: string) => {
    const target = findFolderByPath(cascadingDrills, pathKey);
    if (target) {
      const newName = prompt('Rename Folder:', target.name);
      if (newName && newName.trim()) {
        updateCascadingDrillsAndSave((prev) => {
          const updated = deepClone(prev);
          const t = findFolderByPath(updated, pathKey);
          if (t) {
            t.name = newName.trim();
          }
          return updated;
        });
      }
    }
  };

  const handleDeleteDrillFolder = (pathKey: string) => {
    if (!confirm('Delete this folder and all its drills?')) return;
    const parts = pathKey.split('_');
    const idx = parseInt(parts.pop()!, 10);
    const parentPath = parts.join('_');

    updateCascadingDrillsAndSave((prev) => {
      const updated = deepClone(prev);
      if (parentPath === '') {
        updated.splice(idx, 1);
      } else {
        const parent = findFolderByPath(updated, parentPath);
        if (parent && parent.subfolders) {
          parent.subfolders.splice(idx, 1);
        }
      }
      return updated;
    });
  };

  const handleMoveDrillFolder = (pathKey: string, direction: number) => {
    const parts = pathKey.split('_');
    const idx = parseInt(parts.pop()!, 10);
    const parentPath = parts.join('_');

    updateCascadingDrillsAndSave((prev) => {
      const updated = deepClone(prev);
      let list = updated;
      if (parentPath !== '') {
        const parent = findFolderByPath(updated, parentPath);
        if (parent && parent.subfolders) list = parent.subfolders;
      }

      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= list.length) return prev;
      const [moved] = list.splice(idx, 1);
      list.splice(newIdx, 0, moved);
      return updated;
    });
  };

  const handleUpdateDrill = (
    pathKey: string,
    drillIdx: number,
    field: keyof DrillItem,
    value: string
  ) => {
    updateCascadingDrillsAndSave((prev) => {
      const updated = deepClone(prev);
      const target = findFolderByPath(updated, pathKey);
      if (target && target.drills?.[drillIdx]) {
        target.drills[drillIdx][field] = value;
      }
      return updated;
    });
  };

  const handleDeleteDrill = (pathKey: string, drillIdx: number) => {
    if (confirm('Delete this drill?')) {
      updateCascadingDrillsAndSave((prev) => {
        const updated = deepClone(prev);
        const target = findFolderByPath(updated, pathKey);
        if (target && target.drills) {
          target.drills.splice(drillIdx, 1);
        }
        return updated;
      });
    }
  };

  const handleMoveDrillToFolder = (
    sourcePath: string,
    drillIdx: number,
    targetPath: string
  ) => {
    if (sourcePath === targetPath) return;
    updateCascadingDrillsAndSave((prev) => {
      const updated = deepClone(prev);
      const source = findFolderByPath(updated, sourcePath);
      const target = findFolderByPath(updated, targetPath);

      if (source && target && source.drills?.[drillIdx]) {
        const [movedDrill] = source.drills.splice(drillIdx, 1);
        if (!target.drills) target.drills = [];
        target.drills.push(movedDrill);
      }
      return updated;
    });
  };

  // CSV & JSON Drill Import / Export
  const handleExportDrillsCSV = () => {
    const rows: string[][] = [
      ['Top Folder', 'Subfolder', 'Drill Name', 'Setup & Instructions', 'Coaching Focus'],
    ];

    const traverse = (
      folders: DrillFolder[],
      topName = '',
      subName = ''
    ) => {
      folders.forEach((f) => {
        const curTop = topName || f.name;
        const curSub = topName ? (subName ? `${subName} > ${f.name}` : f.name) : '';
        (f.drills || []).forEach((d) => {
          rows.push([curTop, curSub, d.name || '', d.desc || '', d.key || '']);
        });
        if (f.subfolders?.length) {
          traverse(f.subfolders, curTop, curSub);
        }
      });
    };

    traverse(cascadingDrills);
    const csvContent = rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drills_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleImportDrillsCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsedRows = parseCSV(evt.target?.result as string);
        if (parsedRows.length < 2) {
          alert('CSV file empty or invalid.');
          return;
        }

        const newTree: DrillFolder[] = [];
        const getOrCreate = (tree: DrillFolder[], name: string) => {
          let found = tree.find(
            (item) => item.name.toLowerCase() === name.toLowerCase()
          );
          if (!found) {
            found = { name, subfolders: [], drills: [] };
            tree.push(found);
          }
          return found;
        };

        const startIdx = parsedRows[0][0]?.toLowerCase().includes('folder') ? 1 : 0;
        for (let i = startIdx; i < parsedRows.length; i++) {
          const r = parsedRows[i];
          if (!r || r.length < 3) continue;
          const topFolderName = (r[0] || 'General').trim() || 'General';
          const subfolderName = (r[1] || '').trim();
          const drillName = (r[2] || '').trim();
          const drillDesc = (r[3] || '').trim();
          const drillKey = (r[4] || '').trim();
          if (!drillName) continue;

          const topFolder = getOrCreate(newTree, topFolderName);
          let targetFolder = topFolder;
          if (subfolderName) {
            const subParts = subfolderName.split('>').map((s) => s.trim()).filter(Boolean);
            let curParent = topFolder;
            subParts.forEach((sp) => {
              curParent = getOrCreate(curParent.subfolders, sp);
            });
            targetFolder = curParent;
          }
          if (!targetFolder.drills) targetFolder.drills = [];
          targetFolder.drills.push({
            id: `drill_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
            name: drillName,
            desc: drillDesc,
            key: drillKey,
          });
        }

        if (newTree.length > 0) {
          updateCascadingDrillsAndSave(() => newTree);
          alert('Drills CSV imported successfully!');
        }
      } catch (err: any) {
        alert(`Error importing CSV: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportDrillsJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(safeJSONStringify(cascadingDrills, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `drills_folders_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportDrillsJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          const normalized = normalizeCascadingDrills(parsed);
          updateCascadingDrillsAndSave(() => normalized);
          alert('Drills JSON imported successfully!');
        }
      } catch (err: any) {
        alert(`Error parsing JSON: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  /* =========================================================================
     PLAYBOOKS & GUIDES ACTIONS
     ========================================================================= */
  const handleSaveGuideHtml = (main: string, sub: string, htmlContent: string) => {
    setGuideTree((prev) => {
      const next = {
        ...prev,
        [main]: {
          ...(prev[main] || {}),
          [sub]: htmlContent,
        },
      };
      latestStateRef.current.guideTree = next;
      safeJSONSet('footballPdfGuidesTree', next);
      return next;
    });
    flushAndSaveStateToStorage('guide_html_update');
  };

  const handleClearGuideDocument = (main: string, sub: string) => {
    setGuideTree((prev) => {
      const next = {
        ...prev,
        [main]: {
          ...(prev[main] || {}),
          [sub]: '',
        },
      };
      latestStateRef.current.guideTree = next;
      safeJSONSet('footballPdfGuidesTree', next);
      return next;
    });
    flushAndSaveStateToStorage('guide_clear');
  };

  const handleUploadGuideDocument = (
    main: string,
    sub: string,
    file: File
  ) => {
    const isHtmlFile =
      file.name.toLowerCase().endsWith('.html') ||
      file.name.toLowerCase().endsWith('.htm') ||
      file.type === 'text/html';

    if (isHtmlFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        handleSaveGuideHtml(main, sub, content);
      };
      reader.readAsText(file);
      return;
    }

    const { storage } = getFirebaseServices();
    if (storage) {
      const storageRef = storage.ref(`playbook_guides/${Date.now()}_${file.name}`);
      storageRef
        .put(file)
        .then((snapshot: any) => snapshot.ref.getDownloadURL())
        .then((downloadUrl: string) => {
          setGuideTree((prev) => {
            const next = {
              ...prev,
              [main]: {
                ...(prev[main] || {}),
                [sub]: downloadUrl,
              },
            };
            latestStateRef.current.guideTree = next;
            safeJSONSet('footballPdfGuidesTree', next);
            return next;
          });
          flushAndSaveStateToStorage('guide_upload');
        })
        .catch((err: any) => {
          console.warn('Storage upload error, falling back to local data URL:', err);
          const localUrl = URL.createObjectURL(file);
          setGuideTree((prev) => {
            const next = {
              ...prev,
              [main]: {
                ...(prev[main] || {}),
                [sub]: localUrl,
              },
            };
            latestStateRef.current.guideTree = next;
            safeJSONSet('footballPdfGuidesTree', next);
            return next;
          });
          flushAndSaveStateToStorage('guide_upload_local');
        });
    } else {
      const localUrl = URL.createObjectURL(file);
      setGuideTree((prev) => {
        const next = {
          ...prev,
          [main]: {
            ...(prev[main] || {}),
            [sub]: localUrl,
          },
        };
        latestStateRef.current.guideTree = next;
        safeJSONSet('footballPdfGuidesTree', next);
        return next;
      });
      flushAndSaveStateToStorage('guide_upload_local');
    }
  };

  /* =========================================================================
     BACKUP & IMPORT FULL APPLICATION STATE
     ========================================================================= */
  const handleExportFullBackup = () => {
    try {
      const fullBackup = {
        weeklyData,
        defaultFormations,
        practiceData,
        practiceTemplates,
        cascadingDrills,
        guideTree,
        guideOrder,
        savedCoaches,
        teamSavedCoaches,
        staffList,
        masterPlayLibrary,
        collapsedFolders,
        scheduleEvents,
        roster,
        teams,
        seasonConfig,
        attendanceLogs,
        exportedAt: new Date().toISOString(),
      };
      const jsonStr = safeJSONStringify(fullBackup, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `football_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err: any) {
      console.error('Backup export failed:', err);
      alert(`Export failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const applyImportDataObject = (
    parsed: any,
    selectedOptions?: Record<string, boolean>
  ) => {
    try {
      isImportingRef.current = true;
      const shouldImport = (key: string) => {
        if (!selectedOptions) return true;
        return Boolean(selectedOptions[key]);
      };

      const restoredList: string[] = [];

      const importedWeekly = shouldImport('weeklyData')
        ? parsed.weeklyData || (parsed['0'] && parsed['0'].depthChart ? parsed : null)
        : null;
      const importedDefaults = shouldImport('defaultFormations')
        ? parsed.defaultFormations || null
        : null;
      const importedPractice = shouldImport('practiceData')
        ? parsed.practiceData || null
        : null;
      const importedTemplates = shouldImport('practiceTemplates')
        ? parsed.practiceTemplates || null
        : null;
      const importedDrills = shouldImport('cascadingDrills')
        ? parsed.cascadingDrills || null
        : null;
      const importedGuideTree = shouldImport('guideTree')
        ? parsed.guideTree || parsed.pdfGuidesTree || null
        : null;
      const importedGuideOrder = shouldImport('guideTree')
        ? parsed.guideOrder || parsed.pdfGuidesOrder || null
        : null;
      const importedSavedCoaches = shouldImport('staffList')
        ? parsed.savedCoaches || parsed.savedCoachesList || null
        : null;
      const importedTeamSavedCoaches = shouldImport('staffList')
        ? parsed.teamSavedCoaches || null
        : null;
      const importedStaffList = shouldImport('staffList')
        ? parsed.staffList || parsed.teamCoachesList || null
        : null;
      const importedPlays = shouldImport('masterPlayLibrary')
        ? parsed.masterPlayLibrary || null
        : null;
      const importedCollapsed = shouldImport('cascadingDrills')
        ? parsed.collapsedFolders || {}
        : null;
      const importedSchedule = shouldImport('scheduleEvents')
        ? parsed.scheduleEvents || null
        : null;
      const importedRoster = shouldImport('roster') ? parsed.roster || null : null;
      const importedTeams = shouldImport('roster') ? parsed.teams || null : null;
      const importedSeasonConfig = shouldImport('scheduleEvents') ? parsed.seasonConfig || null : null;
      const importedAttendance = shouldImport('scheduleEvents') ? parsed.attendanceLogs || null : null;

      if (importedWeekly) {
        setWeeklyData(importedWeekly);
        safeJSONSet('footballWeeklyData', importedWeekly);
        restoredList.push('🏈 Game Plans & Depth Charts');
      }
      if (importedDefaults) {
        setDefaultFormations(importedDefaults);
        safeJSONSet('footballDefaultFormations', importedDefaults);
        restoredList.push('📐 Formations & Alignments');
      }
      if (importedPractice) {
        const sanitized = sanitizePracticePlans(
          importedPractice,
          importedSchedule || scheduleEvents
        );
        setPracticeData(sanitized);
        safeJSONSet('footballPracticeData', sanitized);
        restoredList.push('📋 Practice Plans');
      }
      if (importedTemplates) {
        const normalized = normalizePracticeTemplates(importedTemplates);
        setPracticeTemplates(normalized);
        safeJSONSet('footballPracticeTemplates', normalized);
        restoredList.push('⚡ Practice Templates');
      }
      if (importedDrills) {
        const normalizedDrills = normalizeCascadingDrills(importedDrills);
        setCascadingDrills(normalizedDrills);
        safeJSONSet('footballCascadingDrills', normalizedDrills);
        restoredList.push('💥 Drill Library');
      }
      if (importedGuideTree) {
        setGuideTree(importedGuideTree);
        safeJSONSet('footballPdfGuidesTree', importedGuideTree);
        restoredList.push('📖 Playbook Guides');
      }
      if (importedGuideOrder) {
        setGuideOrder(importedGuideOrder);
        safeJSONSet('footballPdfGuidesOrder', importedGuideOrder);
      }
      if (importedSavedCoaches) {
        setSavedCoaches(importedSavedCoaches);
        safeJSONSet('footballSavedCoaches', importedSavedCoaches);
        restoredList.push('🧢 Coaching Directory');
      }
      if (importedTeamSavedCoaches) {
        setTeamSavedCoaches(importedTeamSavedCoaches);
        safeJSONSet('footballTeamSavedCoaches', importedTeamSavedCoaches);
      }
      if (importedStaffList) {
        setStaffList(importedStaffList);
        safeJSONSet('footballTeamCoaches', importedStaffList);
      }
      if (importedPlays) {
        setMasterPlayLibrary(importedPlays);
        safeJSONSet('footballMasterPlays', importedPlays);
        restoredList.push('🎯 Play Library');
      }
      if (importedCollapsed) {
        setCollapsedFolders(importedCollapsed);
        safeJSONSet('footballCollapsedFolders', importedCollapsed);
      }
      if (importedSchedule) {
        setScheduleEvents(importedSchedule);
        safeJSONSet('footballScheduleEvents', importedSchedule);
        restoredList.push('📅 Season Calendar');
      }
      if (importedRoster) {
        setRoster(importedRoster);
        safeJSONSet('footballRoster', importedRoster);
        restoredList.push('👥 Team Roster');
      }
      if (importedTeams) {
        setTeams(importedTeams);
        safeJSONSet('footballTeams', importedTeams);
      }
      if (importedSeasonConfig) {
        setSeasonConfig(importedSeasonConfig);
        safeJSONSet('footballSeasonConfig', importedSeasonConfig);
      }
      if (importedAttendance) {
        setAttendanceLogs(importedAttendance);
        safeJSONSet('footballAttendanceLogs', importedAttendance);
      }

      // Direct synchronous push to Cloud Firestore keeping unselected fields intact
      const { db } = getFirebaseServices();
      if (db) {
        setSyncStatus({ text: '☁️ Uploading Restored Data to Cloud...', color: '#f59e0b' });
        const payload = deepClone({
          weeklyData: importedWeekly || weeklyData,
          defaultFormations: importedDefaults || defaultFormations,
          practiceData: importedPractice || practiceData,
          practiceTemplates: importedTemplates || practiceTemplates,
          cascadingDrills: importedDrills
            ? normalizeCascadingDrills(importedDrills)
            : cascadingDrills,
          guideTree: importedGuideTree || guideTree,
          guideOrder: importedGuideOrder || guideOrder,
          savedCoaches: importedSavedCoaches || savedCoaches,
          staffList: importedStaffList || staffList,
          masterPlayLibrary: importedPlays || masterPlayLibrary,
          collapsedFolders: importedCollapsed || collapsedFolders,
          scheduleEvents: importedSchedule || scheduleEvents,
        });

        db.collection('teamData')
          .doc('depthChartData')
          .set(
            {
              ...payload,
              updatedAt:
                window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
            },
            { merge: true }
          )
          .then(() => {
            setSyncStatus({ text: '✅ Live Cloud Synced', color: '#22c55e' });
            setTimeout(() => {
              isImportingRef.current = false;
            }, 3000);
          })
          .catch((err: any) => {
            console.warn('Direct cloud sync error:', err);
            setTimeout(() => {
              isImportingRef.current = false;
            }, 3000);
          });
      } else {
        setTimeout(() => {
          isImportingRef.current = false;
        }, 3000);
      }

      const summary =
        restoredList.length > 0 ? restoredList.join(', ') : 'Selected modules';
      alert(`Successfully restored: ${summary}\nAll changes saved and synchronized!`);
    } catch (err: any) {
      isImportingRef.current = false;
      alert(`Error importing backup: ${err.message}`);
    }
  };

  const handleImportFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        applyImportDataObject(parsed);
      } catch (err: any) {
        alert(`Error parsing JSON file: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handlePasteImport = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      applyImportDataObject(parsed);
    } catch (err: any) {
      alert(`Error parsing pasted JSON: ${err.message}`);
    }
  };

  const handleResetData = () => {
    if (confirm('Wipe all local team data and reset to default playbook?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 1-Click Copy Week Execution
  const handleExecuteCopyWeek = (
    srcWeek: string,
    targetWeek: string,
    copyModeOrPlayerSpots: 'both' | 'formations_only' | 'positions_only' | boolean = 'both',
    srcTeamIdParam?: string,
    showAlert: boolean = false
  ) => {
    const srcTeamId = srcTeamIdParam || activeTeamId;
    ensureWeekExists(srcWeek);
    ensureWeekExists(targetWeek);

    const srcScopedKey = getScopedWeekKey(srcTeamId, srcWeek);
    const targetScopedKey = getScopedWeekKey(activeTeamId, targetWeek);

    const src = weeklyData[srcScopedKey] || weeklyData[srcWeek] || {
      formations: defaultFormations,
      depthChart: {},
      scrimmageChart: {},
    };

    const targetExisting = weeklyData[targetScopedKey] || weeklyData[targetWeek] || {
      formations: defaultFormations,
      depthChart: {},
      scrimmageChart: {},
    };

    // Determine copy mode
    let mode: 'both' | 'formations_only' | 'positions_only' = 'both';
    if (typeof copyModeOrPlayerSpots === 'boolean') {
      mode = copyModeOrPlayerSpots ? 'both' : 'formations_only';
    } else if (copyModeOrPlayerSpots) {
      mode = copyModeOrPlayerSpots;
    }

    let updatedFormations = targetExisting.formations || defaultFormations;
    let updatedDepthChart = targetExisting.depthChart || {};
    let updatedScrimmageChart = targetExisting.scrimmageChart || {};

    if (mode === 'both') {
      updatedFormations = deepClone(src.formations || defaultFormations);
      updatedDepthChart = deepClone(src.depthChart || {});
      updatedScrimmageChart = deepClone(src.scrimmageChart || {});
    } else if (mode === 'formations_only') {
      updatedFormations = deepClone(src.formations || defaultFormations);
      updatedDepthChart = {};
      updatedScrimmageChart = {};
    } else if (mode === 'positions_only') {
      // Retain target formations layout, clone player assignments from source
      updatedDepthChart = deepClone(src.depthChart || {});
      updatedScrimmageChart = deepClone(src.scrimmageChart || {});
    }

    const updatedState: WeekState = {
      formations: updatedFormations,
      depthChart: updatedDepthChart,
      scrimmageChart: updatedScrimmageChart,
    };

    setWeeklyData((prev) => {
      const nextWeekly = {
        ...prev,
        [targetScopedKey]: updatedState,
        [targetWeek]: updatedState,
      };
      latestStateRef.current.weeklyData = nextWeekly;
      return nextWeekly;
    });

    setCurrentWeek(targetWeek);

    // Save and sync immediately to local and cloud
    saveStateToStorage('force');

    if (showAlert) {
      alert(
        `Successfully copied ${
          mode === 'both'
            ? 'formations and player depth chart assignments'
            : mode === 'formations_only'
            ? 'formations only'
            : 'player depth chart positions only'
        } from Week ${srcWeek} to Week ${targetWeek}!`
      );
    }
  };

  /* =========================================================================
     SEASON SCHEDULE & WORKFLOW SYNC HANDLERS
     ========================================================================= */
  const handleSyncGameToWeeklyData = (
    eventOrWeek: ScheduleEvent | string,
    opponentName?: string,
    dateStr?: string,
    timeStr?: string,
    locationStr?: string
  ) => {
    let weekKey = '1';
    let oppName = '';
    let gameDateTime = '';
    let location = 'Mahopac High School';

    if (typeof eventOrWeek === 'object') {
      weekKey = eventOrWeek.week || '1';
      oppName = eventOrWeek.opponent || eventOrWeek.title;
      gameDateTime = `${eventOrWeek.date} @ ${eventOrWeek.startTime || '10:00 AM'}`;
      location = eventOrWeek.location || 'Mahopac High School';
    } else {
      weekKey = eventOrWeek || '1';
      oppName = opponentName || '';
      gameDateTime = `${dateStr || ''} @ ${timeStr || '10:00 AM'}`.trim();
      location = locationStr || 'Mahopac High School';
    }

    ensureWeekExists(weekKey);

    setWeeklyData((prev) => {
      const scopedKey = getScopedWeekKey(activeTeamId, weekKey);
      const existingWeek = prev[scopedKey] || prev[weekKey] || {
        formations: deepClone(defaultFormations),
        depthChart: {},
        scrimmageChart: {},
        opponent: oppName,
        scouting: {
          year: '2026',
          week: `Week ${weekKey}`,
          opponent: oppName,
          gameDate: gameDateTime,
          gameLocation: location,
          teamOverview: '',
          offensiveTendencies: '',
          defensiveFronts: '',
          specialTeamsNotes: '',
          keysToVictory: [],
          keyPlayersList: [],
          coachNotes: [],
        },
      };

      const updatedWeekState = {
        ...existingWeek,
        opponent: oppName,
        scouting: {
          ...(existingWeek.scouting || {}),
          opponent: oppName,
          gameDate: gameDateTime,
          gameLocation: location,
          week: `Week ${weekKey}`,
          year: '2026',
        },
      };

      return {
        ...prev,
        [scopedKey]: updatedWeekState,
        [weekKey]: updatedWeekState,
      };
    });
  };

  const handleSyncPracticeToPlan = (event: ScheduleEvent, templateName?: string): string => {
    // 1. Calculate Day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dayOfWeek = event.dayOfWeek;
    if (!dayOfWeek && event.date) {
      const parts = event.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const dt = new Date(y, m - 1, d, 12, 0, 0);
          dayOfWeek = dayNames[dt.getDay()];
        }
      }
    }
    if (!dayOfWeek) dayOfWeek = 'Wednesday';

    // 2. Calculate Week Folder
    const rawWeek = String(event.week !== undefined ? event.week : '1').trim();
    let weekFolder = `Week ${rawWeek}`;
    if (rawWeek === '0' || rawWeek.toLowerCase().includes('pre-1') || rawWeek.toLowerCase().includes('pre1')) {
      weekFolder = 'Preseason Wk 1';
    } else if (rawWeek.toLowerCase().includes('pre-2') || rawWeek.toLowerCase().includes('pre2')) {
      weekFolder = 'Preseason Wk 2';
    } else if (rawWeek.toLowerCase().startsWith('week')) {
      weekFolder = rawWeek;
    } else if (rawWeek.toLowerCase().includes('pre')) {
      weekFolder = 'Preseason Wk 1';
    } else {
      weekFolder = `Week ${rawWeek}`;
    }

    // 3. Year, Time, Location & Title
    const year = event.date && event.date.includes('-') ? event.date.split('-')[0] : '2026';
    const startTime = event.startTime || event.time || '17:30';
    const endTime = event.endTime || '19:00';
    const location = event.location || 'Crane Road';
    const title = event.title || `${weekFolder} Practice`;

    // 4. Find existing practice plan
    let existing = event.linkedPracticePlanId
      ? practiceData.find((p) => p && p.id === event.linkedPracticePlanId)
      : undefined;

    if (!existing && event.date) {
      existing = practiceData.find((p) => p && p.date === event.date);
    }

    if (!existing) {
      existing = practiceData.find(
        (p) =>
          p &&
          (p.id === event.id ||
            (p.title &&
              event.title &&
              p.title.trim().toLowerCase() === event.title.trim().toLowerCase() &&
              (p.weekFolder === weekFolder || p.weekFolder === `Week ${event.week}`)))
      );
    }

    // Fallback: check DEFAULT_INITIAL_PRACTICES if not yet in state
    if (!existing && event.date) {
      const defaultInitial = DEFAULT_INITIAL_PRACTICES.find(
        (p) => p.date === event.date || p.id === event.linkedPracticePlanId || p.id === event.id
      );
      if (defaultInitial) {
        existing = defaultInitial;
      }
    }

    const formattedDayFolder = getFormattedDayFolder(event.date);

    if (existing) {
      const existingId = existing.id;
      const existingPlan = existing;
      updatePracticeDataAndSave((prev) => {
        const alreadyInList = prev.some((p) => p.id === existingId);
        if (alreadyInList) {
          return prev.map((p) =>
            p.id === existingId
              ? {
                  ...p,
                  teamId: p.teamId || event.teamId || activeTeamId || 'team_10u',
                  title: p.title || title,
                  date: event.date || p.date,
                  day: dayOfWeek,
                  dayFolder: p.dayFolder || formattedDayFolder,
                  startTime: startTime,
                  endTime: endTime,
                  weekFolder: weekFolder,
                  year: year,
                  location: location,
                  lastEdited: Date.now(),
                }
              : p
          );
        } else {
          return [
            ...prev,
            {
              ...existingPlan,
              teamId: existingPlan.teamId || event.teamId || activeTeamId || 'team_10u',
              date: event.date || existingPlan.date,
              day: dayOfWeek,
              dayFolder: existingPlan.dayFolder || formattedDayFolder,
              weekFolder: weekFolder,
              year: year,
              lastEdited: Date.now(),
            },
          ];
        }
      });

      if (event.linkedPracticePlanId !== existingId) {
        setScheduleEvents((prev) => {
          const next = prev.map((ev) =>
            ev.id === event.id ? { ...ev, linkedPracticePlanId: existingId } : ev
          );
          safeJSONSet('footballScheduleEvents', next);
          latestStateRef.current.scheduleEvents = next;
          return next;
        });
      }

      setCurrentPracticeId(existingId);
      return existingId;
    }

    // 5. Create new plan auto-populated with date, time, week folder, and day
    const newPracticeId = 'prac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const planTemplate =
      templateName && DEFAULT_PRACTICE_TEMPLATES[templateName]
        ? DEFAULT_PRACTICE_TEMPLATES[templateName]
        : DEFAULT_PRACTICE_TEMPLATES['Standard Practice'] || [];

    const newPlan: PracticePlan = {
      id: newPracticeId,
      teamId: event.teamId || activeTeamId,
      year: year,
      weekFolder: weekFolder,
      dayFolder: dayOfWeek,
      title: title,
      date: event.date || '',
      day: dayOfWeek,
      startTime: startTime,
      endTime: endTime,
      location: location,
      lastEdited: Date.now(),
      plan: deepClone(planTemplate),
    };

    updatePracticeDataAndSave((prev) => [...prev, newPlan]);

    setScheduleEvents((prev) => {
      const next = prev.map((ev) =>
        ev.id === event.id ? { ...ev, linkedPracticePlanId: newPracticeId } : ev
      );
      safeJSONSet('footballScheduleEvents', next);
      latestStateRef.current.scheduleEvents = next;
      return next;
    });

    setCurrentPracticeId(newPracticeId);
    return newPracticeId;
  };

  const handleAddScheduleEvent = (
    eventData: Omit<ScheduleEvent, 'id' | 'createdAt' | 'lastEdited'>
  ) => {
    const newId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newEvent: ScheduleEvent = {
      ...eventData,
      teamId: eventData.teamId || activeTeamId,
      id: newId,
      createdAt: Date.now(),
      lastEdited: Date.now(),
    };

    setScheduleEvents((prev) => {
      const updated = [...prev, newEvent];
      safeJSONSet('footballScheduleEvents', updated);
      return updated;
    });

    if (newEvent.type === 'game') {
      handleSyncGameToWeeklyData(newEvent);
    }
  };

  const handleUpdateScheduleEvent = (
    id: string,
    updates: Partial<ScheduleEvent>
  ) => {
    setScheduleEvents((prev) => {
      const updatedList = prev.map((ev) => {
        if (ev.id === id) {
          const updated = { ...ev, ...updates, lastEdited: Date.now() };
          if (updated.type === 'game') {
            handleSyncGameToWeeklyData(updated);
          }
          return updated;
        }
        return ev;
      });
      safeJSONSet('footballScheduleEvents', updatedList);
      return updatedList;
    });
  };

  const handleDeleteScheduleEvent = (id: string) => {
    // 1. Find event to delete
    const eventToDelete = scheduleEvents.find((ev) => ev.id === id);

    // 2. Remove from scheduleEvents
    const updatedEvents = scheduleEvents.filter((ev) => ev.id !== id);
    setScheduleEvents(updatedEvents);
    safeJSONSet('footballScheduleEvents', updatedEvents);

    // 3. Find and remove matching attendance logs
    // Check if any other practice/scrimmage still exists on this date
    const remainingPracticesOnDate = updatedEvents.filter(
      (e) => eventToDelete && e.date === eventToDelete.date && (e.type === 'practice' || e.type === 'scrimmage' || e.type === 'walkthrough')
    );

    const matchingLogs = attendanceLogs.filter((log) => {
      if (log.id === id || log.id === `att_${id}`) return true;
      if (log.scheduleEventId === id) return true;
      if (eventToDelete && log.date === eventToDelete.date) {
        if (!log.teamId || log.teamId === eventToDelete.teamId) {
          // If no other practice exists on this date, this log belonged to the deleted event
          if (remainingPracticesOnDate.length === 0) return true;
        }
      }
      return false;
    });

    if (matchingLogs.length > 0) {
      const matchingIds = new Set(matchingLogs.map((l) => l.id));
      const updatedLogs = attendanceLogs.filter((l) => !matchingIds.has(l.id));
      setAttendanceLogs(updatedLogs);
      safeJSONSet('footballAttendanceLogs', updatedLogs);

      // 4. Reverse hours credited to players from these deleted attendance logs
      setRoster((prevRoster) => {
        let changed = false;
        const newRoster = prevRoster.map((player) => {
          let pCopy = { ...player };
          matchingLogs.forEach((log) => {
            const wasPresent = log.presentPlayerNums?.includes(player.num);
            if (wasPresent && (log.hours || 0) > 0) {
              changed = true;
              const logWeek = log.week || '0';
              const curWeekly = pCopy.weeklyHours?.[logWeek] || 0;
              const newWeekly = Math.max(0, +(curWeekly - log.hours).toFixed(2));

              let newCond = pCopy.conditioningHours || 0;
              let newPadded = pCopy.paddedHours || 0;
              if (log.sessionType === 'conditioning') {
                newCond = Math.max(0, +(newCond - log.hours).toFixed(2));
              } else {
                newPadded = Math.max(0, +(newPadded - log.hours).toFixed(2));
              }

              pCopy = {
                ...pCopy,
                weeklyHours: {
                  ...pCopy.weeklyHours,
                  [logWeek]: newWeekly,
                },
                conditioningHours: newCond,
                paddedHours: newPadded,
              };
            }
          });
          return pCopy;
        });

        if (changed) {
          safeJSONSet('footballRoster', newRoster);
          return newRoster;
        }
        return prevRoster;
      });
    }

    saveStateToStorage('schedule');
  };

  const handleBulkAddScheduleEvents = (
    eventsList: Array<Omit<ScheduleEvent, 'id' | 'createdAt' | 'lastEdited'>>
  ) => {
    const created: ScheduleEvent[] = eventsList.map((e, idx) => ({
      ...e,
      teamId: e.teamId || activeTeamId,
      id: `evt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      lastEdited: Date.now(),
    }));

    setScheduleEvents((prev) => {
      const updated = [...prev, ...created];
      safeJSONSet('footballScheduleEvents', updated);
      return updated;
    });
  };

  const handleImportTeamSnapScheduleEvents = (
    newEvents: Omit<ScheduleEvent, 'id' | 'createdAt' | 'lastEdited'>[],
    replaceExisting?: boolean
  ) => {
    const created: ScheduleEvent[] = newEvents.map((e, idx) => ({
      ...e,
      teamId: e.teamId || activeTeamId,
      id: `evt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      lastEdited: Date.now(),
    }));

    setScheduleEvents((prev) => {
      let nextEvents: ScheduleEvent[];
      if (replaceExisting) {
        // Completely replace schedule for active team (accounting for team_10u / team-10u aliases)
        const isCurrentTeam = (tid?: string) =>
          !tid ||
          tid === activeTeamId ||
          (tid === 'team_10u' && (activeTeamId === 'team_10u' || activeTeamId === 'team-10u')) ||
          (tid === 'team-10u' && (activeTeamId === 'team_10u' || activeTeamId === 'team-10u'));

        nextEvents = [
          ...prev.filter((ev) => !isCurrentTeam(ev.teamId)),
          ...created,
        ];
      } else {
        nextEvents = [...prev, ...created];
      }
      safeJSONSet('footballScheduleEvents', nextEvents);
      return nextEvents;
    });

    // Auto-sync practice plans and games for imported events
    created.forEach((evt) => {
      if (evt.type === 'practice' || !evt.type) {
        handleSyncPracticeToPlan(evt);
      } else if (evt.type === 'game') {
        handleSyncGameToWeeklyData(evt);
      }
    });

    debouncedSave('all');
  };

  const handlePracticeWizardGenerate = (result: PracticeWizardGeneratedResult) => {
    if (result.practicePlans && result.practicePlans.length > 0) {
      const taggedPlans = result.practicePlans.map((p) => ({
        ...p,
        teamId: p.teamId || activeTeamId,
        lastEdited: Date.now(),
      }));
      updatePracticeDataAndSave((prev) => [...prev, ...taggedPlans]);
      if (taggedPlans[0]?.id) {
        setCurrentPracticeId(taggedPlans[0].id);
      }
    }

    if (result.scheduleEvents && result.scheduleEvents.length > 0) {
      const created: ScheduleEvent[] = result.scheduleEvents.map((e, idx) => ({
        ...e,
        teamId: e.teamId || activeTeamId,
        id: `evt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        lastEdited: Date.now(),
      }));
      setScheduleEvents((prev) => {
        const next = [...prev, ...created];
        safeJSONSet('footballScheduleEvents', next);
        latestStateRef.current.scheduleEvents = next;
        return next;
      });
    }

    debouncedSave('all');
  };

  const handleNavigateToWeek = (
    weekFolder: string,
    unit?: UnitType,
    practiceId?: string
  ) => {
    const match = weekFolder.match(/Week\s*(\d+)/i);
    const weekKey = match ? match[1] : weekFolder.replace(/\D/g, '') || '1';

    ensureWeekExists(weekKey);
    setCurrentWeek(weekKey);

    if (practiceId) {
      setCurrentPracticeId(practiceId);
    }

    if (unit) {
      setActiveUnit(unit);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] print:bg-white print:text-black flex flex-col font-sans text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Hidden File Inputs for Import */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportFullBackup}
      />
      <input
        type="file"
        ref={drillCsvInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleImportDrillsCSV}
      />
      <input
        type="file"
        ref={drillJsonInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportDrillsJSON}
      />

      {/* Main Athletic Header */}
      <Header
        currentWeek={currentWeek}
        onWeekChange={(wk) => {
          setCurrentWeek(wk);
          ensureWeekExists(wk);
        }}
        opponent={currentWeekState.opponent || ''}
        onOpponentChange={(opp) => {
          setWeeklyData((prev) => {
            const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
            const existingWeek = prev[scopedKey] || prev[currentWeek] || {
              formations: defaultFormations,
              depthChart: {},
              scrimmageChart: {},
              opponent: opp,
            };
            const updatedWeek = {
              ...existingWeek,
              opponent: opp,
              scouting: {
                ...(existingWeek.scouting || {}),
                opponent: opp,
              },
            };
            return {
              ...prev,
              [scopedKey]: updatedWeek,
              [currentWeek]: updatedWeek,
            };
          });
        }}
        scheduleEvents={activeTeamScheduleEvents}
        userEmail={currentUser?.email || 'Head Coach'}
        userRole={userRole}
        onRoleChange={setUserRole}
        syncStatus={syncStatus}
        activeUnit={activeUnit}
        onNavigateToSchedule={() => setActiveUnit('schedule')}
        onNavigateToMobileHub={() => setActiveUnit('mobile_hub')}
        onSignOut={() => {
          const { auth } = getFirebaseServices();
          if (auth) auth.signOut().then(() => window.location.reload());
          else window.location.reload();
        }}
        onToggleFullScreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            if (document.exitFullscreen) document.exitFullscreen();
          }
        }}
        onExportData={handleExportFullBackup}
        onImportClick={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        onOpenCopyWeekModal={() => setIsCopyWeekModalOpen(true)}
        seasonConfig={seasonConfig}
        onOpenSeasonConfigModal={() => setIsSeasonConfigModalOpen(true)}
        teams={teams}
        activeTeamId={activeTeamId}
        defaultTeamId={defaultTeamId}
        onSelectTeam={setActiveTeamId}
        onSetDefaultTeam={handleSetDefaultTeam}
        userAssignedTeamIds={currentUserCoach?.assignedTeamIds}
        onOpenManageTeams={() => setActiveUnit('users')}
        onOpenPreferencesModal={() => setIsPreferencesModalOpen(true)}
        onOpenThemeGallery={() => setIsThemeGalleryOpen(true)}
        onForceSave={handleForceSave}
        onForceRefresh={handleForceRefresh}
      />

      {/* Sticky Unit Navigation Tabs */}
      <NavigationTabs
        activeUnit={activeUnit}
        onSelectUnit={(unit) => {
          if (unit === 'depth_chart') {
            setActiveUnit(depthSubUnit || 'offense');
          } else {
            setActiveUnit(unit);
          }
        }}
        userRole={userRole}
        depthSubUnit={depthSubUnit}
        onSelectDepthSubUnit={(sub) => {
          setDepthSubUnit(sub);
          setActiveUnit(sub);
        }}
        defaultScreen={defaultScreen}
        onSetDefaultScreen={handleSetDefaultScreen}
        onOpenPreferencesModal={() => setIsPreferencesModalOpen(true)}
      />

      {/* Main Layout Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Board / Panel Column */}
          <div className="flex-1 min-w-0 w-full">
            {/* 0. Mobile Starting Screen & Coach Hub */}
            {activeUnit === 'mobile_hub' && (
              <MobileHubView
                activeTeam={currentActiveTeam}
                teams={teams}
                onSelectTeam={setActiveTeamId}
                currentWeek={currentWeek}
                onSelectWeek={(wk) => {
                  setCurrentWeek(wk);
                  ensureWeekExists(wk);
                }}
                userRole={userRole}
                roster={activeTeamRoster}
                scheduleEvents={activeTeamScheduleEvents}
                practicePlans={activeTeamPracticeData.length > 0 ? activeTeamPracticeData : practiceData}
                currentWeekState={currentWeekState}
                formations={currentFormations}
                depthChart={currentDepthChart}
                defaultScreen={defaultScreen}
                onSetDefaultScreen={handleSetDefaultScreen}
                onNavigateToUnit={(unit, subUnit) => {
                  if (unit === 'depth_chart') {
                    setDepthSubUnit(subUnit || 'offense');
                    setActiveUnit((subUnit || 'offense') as any);
                  } else {
                    setActiveUnit(unit);
                  }
                }}
                onQuickAttendanceSave={(rec) => {
                  setAttendanceLogs((prev) => {
                    // Update or prepend record for the date
                    const filtered = prev.filter((r) => r.id !== rec.id && r.date !== rec.date);
                    const updated = [rec, ...filtered];
                    safeJSONSet('footballAttendanceLogs', updated);
                    return updated;
                  });
                  saveStateToStorage('attendance');
                }}
                attendanceLogs={attendanceLogs}
                onSelectPractice={(id) => {
                  setCurrentPracticeId(id);
                  safeJSONSet('footballCurrentPracticeId', id);
                }}
                onOpenPreferencesModal={() => setIsPreferencesModalOpen(true)}
                onOpenScheduleModal={() => setActiveUnit('schedule')}
                onOpenThemeGallery={() => setIsThemeGalleryOpen(true)}
                guideTree={guideTree}
                guideOrder={guideOrder}
                activeGuideMain={activeGuideMain}
                activeGuideSub={activeGuideSub}
                onSelectGuideMain={setActiveGuideMain}
                onSelectGuideSub={setActiveGuideSub}
              />
            )}

            {/* Depth Chart Sub-Navigation Bar */}
            {['offense', 'defense', 'st', 'groups', 'scrimmage', 'depth_chart'].includes(
              activeUnit
            ) && (
              <div className="mb-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-md">
                <span className="px-3 py-1 text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 shrink-0">
                  <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Depth Chart:</span>
                </span>
                {[
                  { id: 'offense', label: 'Offense', icon: Zap },
                  { id: 'defense', label: 'Defense', icon: Shield },
                  { id: 'st', label: 'Special Teams', icon: Target },
                  { id: 'groups', label: 'Position Groups', icon: Users },
                  { id: 'scrimmage', label: 'Practice / Scrimmage', icon: Swords },
                ].map((sub) => {
                  const Icon = sub.icon;
                  const isActive =
                    activeUnit === sub.id ||
                    (activeUnit === 'depth_chart' && depthSubUnit === sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setDepthSubUnit(sub.id as any);
                        setActiveUnit(sub.id as any);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 1. Formations View (Offense, Defense, Special Teams, Depth Chart Groups) */}
            {['offense', 'defense', 'st', 'groups', 'depth_chart'].includes(activeUnit) && (
              <>
                {depthChartCopyCandidate && (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/50 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
                        <Copy className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                            ⚡ {formatWeekLabel(depthChartCopyCandidate.targetWeek)} Depth Chart Ready
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Formations Auto-Copied
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium mt-0.5">
                          Formations from <strong className="text-white font-bold">{formatWeekLabel(depthChartCopyCandidate.sourceWeek)}</strong> were automatically copied over. Would you like to copy all player depth chart spots ({depthChartCopyCandidate.sourceCount} player assignments) as well?
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          handleExecuteCopyWeek(
                            depthChartCopyCandidate.sourceWeek,
                            depthChartCopyCandidate.targetWeek,
                            'both',
                            undefined,
                            true
                          );
                          setDismissedCopyPrompts((prev) => new Set(prev).add(depthChartCopyCandidate.targetWeek));
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Copy Player Spots from {formatWeekLabel(depthChartCopyCandidate.sourceWeek)}</span>
                      </button>

                      <button
                        onClick={() => {
                          setDismissedCopyPrompts((prev) => new Set(prev).add(depthChartCopyCandidate.targetWeek));
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 active:scale-95 transition-all cursor-pointer"
                      >
                        Keep Formations Only (Fresh Lineup)
                      </button>
                    </div>
                  </div>
                )}

                <FormationsView
                unit={
                  activeUnit === 'depth_chart'
                    ? (depthSubUnit === 'scrimmage' ? 'offense' : (depthSubUnit || 'offense'))
                    : (activeUnit as 'offense' | 'defense' | 'st' | 'groups')
                }
                formations={currentFormations}
                depthChart={currentDepthChart}
                selectedFormationId={selectedFormationId}
                onSelectFormation={setSelectedFormationId}
                userRole={userRole}
                activeTeam={currentActiveTeam}
                teams={teams}
                onCopyFormationsFromTeam={handleCopyFormationsFromTeam}
                onAddFormation={handleAddFormation}
                onMoveFormation={handleMoveFormation}
                onDuplicateFormation={handleDuplicateFormation}
                onRenameFormation={handleRenameFormation}
                onDeleteFormation={handleDeleteFormation}
                onAddRow={handleAddRow}
                onEditRowName={handleEditRowName}
                onEditRowSlots={handleEditRowSlots}
                onDeleteRow={handleDeleteRow}
                onAddPosition={handleAddPosition}
                onEditPositionName={handleEditPositionName}
                onMovePositionRow={handleMovePositionRow}
                onCopyPositionToOtherForm={handleCopyPositionToOtherForm}
                onDeletePosition={handleDeletePosition}
                onDropPlayerOnCard={handleDropPlayerOnCard}
                onRemovePlayerFromCard={handleRemovePlayerFromCard}
                onOpenSelectivePrintModal={(unit) =>
                  setSelectivePrintUnit(unit)
                }
                onOpenCopyWeekModal={() => setIsCopyWeekModalOpen(true)}
                onDragStartPlacedPlayer={handleDragStartPlacedPlayer}
                onPositionCardDragStart={handlePositionCardDragStart}
                onPositionCardDropOnSlot={handlePositionCardDropOnSlot}
                onSetRowSlots={handleSetRowSlots}
                onAddSlotToRow={handleAddSlotToRow}
                onRemoveSlotFromRow={handleRemoveSlotFromRow}
                onInsertSlotAt={handleInsertSlotAt}
                onClearPositionToEmpty={handleClearPositionToEmpty}
                onAssignPositionToSlot={handleAssignPositionToSlot}
                onAddPositionDirect={handleAddPositionDirect}
                onRenamePositionDirect={handleRenamePositionDirect}
                onRenameRowDirect={handleRenameRowDirect}
                onAddRowDirect={handleAddRowDirect}
                onAddFormationDirect={handleAddFormationDirect}
                onRenameFormationDirect={handleRenameFormationDirect}
                onDuplicateFormationDirect={handleDuplicateFormationDirect}
                onMovePositionDirect={handleMovePositionDirect}
                onCopyPositionDirect={handleCopyPositionDirect}
                roster={roster.filter((p) => !p.teamId || p.teamId === activeTeamId)}
                onAssignPlayerDirect={handleAssignPlayerDirect}
                onReorderDepthPlayer={handleReorderDepthPlayer}
                isLockedByOther={isLockedByOther}
                lockHolderName={lockHolderName}
                lockHolderEmail={lockHolderEmail}
                isHeldByMe={isHeldByMe}
                onAcquireLock={() => handleAcquireLock(currentDepthUnit, currentWeek, false)}
                onReleaseLock={() => handleReleaseLock(currentDepthUnit, currentWeek)}
                onTakeOverLock={() => handleTakeOverLock(currentDepthUnit, currentWeek)}
              />
              </>
            )}

            {/* 2. Practice / Scrimmage Rotation */}
            {activeUnit === 'scrimmage' && (
              <ScrimmageView
                formations={currentFormations}
                scrimmageChart={currentScrimmageChart}
                scrimmageFilters={scrimmageFilters}
                userRole={userRole}
                activeTeam={currentActiveTeam}
                onOpenScrimmageFilterModal={() =>
                  setIsScrimmageFilterOpen(true)
                }
                onOpenScrimmagePrintModal={() => triggerPrint()}
                onDropPlayerOnScrimmageCard={handleDropPlayerOnCard}
                onRemovePlayerFromScrimmageCard={handleRemovePlayerFromCard}
                onDragStartPlacedPlayer={handleDragStartPlacedPlayer}
              />
            )}

            {/* 3. Wristband Builder */}
            {activeUnit === 'wristband' && (
              <WristbandView
                wristbandData={
                  currentWeekState.wristbandData || {
                    title: 'MAHOPAC 10U • PLAY CALLING INSERT',
                    rows: 16,
                    columns: [
                      { color: 'yellow', plays: [] },
                      { color: 'blue', plays: [] },
                    ],
                  }
                }
                userRole={userRole}
                masterPlayLibrary={masterPlayLibrary}
                onUpdateTitle={(title) => {
                  const wb = currentWeekState.wristbandData || {
                    rows: 16,
                    columns: [
                      { color: 'yellow', plays: [] },
                      { color: 'blue', plays: [] },
                    ],
                  };
                  setWeeklyData((prev) => ({
                    ...prev,
                    [currentWeek]: {
                      ...prev[currentWeek],
                      wristbandData: { ...wb, title },
                    },
                  }));
                }}
                onClearPlays={() => {
                  const wb = currentWeekState.wristbandData || {
                    rows: 16,
                    columns: [
                      { color: 'yellow', plays: [] },
                      { color: 'blue', plays: [] },
                    ],
                  };
                  setWeeklyData((prev) => ({
                    ...prev,
                    [currentWeek]: {
                      ...prev[currentWeek],
                      wristbandData: {
                        ...wb,
                        columns: [
                          { color: 'yellow', plays: Array(16).fill({ text: '' }) },
                          { color: 'blue', plays: Array(16).fill({ text: '' }) },
                        ],
                      },
                    },
                  }));
                }}
                onBulkFillPlays={(plays) => {
                  const wb = currentWeekState.wristbandData || {
                    rows: 16,
                    columns: [
                      { color: 'yellow', plays: [] },
                      { color: 'blue', plays: [] },
                    ],
                  };
                  const yellowPlays = plays.slice(0, 16).map((p) => ({ text: p }));
                  const bluePlays = plays.slice(16, 32).map((p) => ({ text: p }));
                  setWeeklyData((prev) => ({
                    ...prev,
                    [currentWeek]: {
                      ...prev[currentWeek],
                      wristbandData: {
                        ...wb,
                        columns: [
                          { color: 'yellow', plays: yellowPlays },
                          { color: 'blue', plays: bluePlays },
                        ],
                      },
                    },
                  }));
                }}
                onUpdatePlay={(colIdx, rowIdx, text) => {
                  const wb = currentWeekState.wristbandData || {
                    rows: 16,
                    columns: [
                      { color: 'yellow', plays: [] },
                      { color: 'blue', plays: [] },
                    ],
                  };
                  const cols = [...(wb.columns || [])];
                  if (!cols[0]) cols[0] = { color: 'yellow', plays: [] };
                  if (!cols[1]) cols[1] = { color: 'blue', plays: [] };

                  const targetCol = { ...cols[colIdx] };
                  const plays = [...(targetCol.plays || [])];
                  plays[rowIdx] = { text };
                  targetCol.plays = plays;
                  cols[colIdx] = targetCol;

                  setWeeklyData((prev) => ({
                    ...prev,
                    [currentWeek]: {
                      ...prev[currentWeek],
                      wristbandData: { ...wb, columns: cols },
                    },
                  }));
                }}
              />
            )}

            {/* 4. Scouting Report */}
            {activeUnit === 'scouting' && (
              <ScoutingView
                scouting={currentWeekState.scouting || {}}
                userRole={userRole}
                currentUser={currentUser}
                staffList={staffList}
                savedCoaches={savedCoaches}
                scheduleEvents={activeTeamScheduleEvents}
                currentWeek={currentWeek}
                onUpdateScouting={(field, val) => {
                  setWeeklyData((prev) => {
                    const scopedKey = getScopedWeekKey(activeTeamId, currentWeek);
                    const existingWeek = prev[scopedKey] || prev[currentWeek] || {
                      formations: defaultFormations,
                      depthChart: {},
                      scrimmageChart: {},
                      opponent: '',
                    };
                    const updatedScouting = {
                      ...(existingWeek.scouting || {}),
                      [field]: val,
                    };
                    const updatedWeek = {
                      ...existingWeek,
                      opponent: field === 'opponent' ? val : (existingWeek.opponent || ''),
                      scouting: updatedScouting,
                    };
                    return {
                      ...prev,
                      [scopedKey]: updatedWeek,
                      [currentWeek]: updatedWeek,
                    };
                  });
                }}
                onNavigateToSchedule={() => setActiveUnit('schedule')}
              />
            )}

            {/* 5. Playbooks & Guides */}
            {activeUnit === 'guide' && (
              <PlaybookGuidesView
                guideTree={guideTree}
                guideOrder={guideOrder}
                activeMain={activeGuideMain}
                activeSub={activeGuideSub}
                userRole={userRole}
                onSelectMain={setActiveGuideMain}
                onSelectSub={setActiveGuideSub}
                onUploadDocument={handleUploadGuideDocument}
                onSaveHtmlContent={handleSaveGuideHtml}
                onClearDocument={handleClearGuideDocument}
                onAddMainFolder={(name) => {
                  const updatedTree = { ...guideTree, [name]: { 'Full Playbook': '' } };
                  const updatedOrder = {
                    main: [...guideOrder.main, name],
                    sub: { ...guideOrder.sub, [name]: ['Full Playbook'] },
                  };
                  setGuideTree(updatedTree);
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  setActiveGuideMain(name);
                  setActiveGuideSub('Full Playbook');
                  flushAndSaveStateToStorage('playbook_add_main');
                }}
                onAddSubTab={(main, name) => {
                  const updatedTree = {
                    ...guideTree,
                    [main]: { ...(guideTree[main] || {}), [name]: '' },
                  };
                  const updatedOrder = {
                    ...guideOrder,
                    sub: {
                      ...guideOrder.sub,
                      [main]: [...(guideOrder.sub[main] || []), name],
                    },
                  };
                  setGuideTree(updatedTree);
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  setActiveGuideSub(name);
                  flushAndSaveStateToStorage('playbook_add_sub');
                }}
                onRenameMainFolder={(oldName, newName) => {
                  const updatedTree = { ...guideTree };
                  updatedTree[newName] = updatedTree[oldName];
                  delete updatedTree[oldName];
                  setGuideTree(updatedTree);

                  const updatedOrder = { ...guideOrder };
                  const mIdx = updatedOrder.main.indexOf(oldName);
                  if (mIdx !== -1) updatedOrder.main[mIdx] = newName;
                  if (updatedOrder.sub[oldName]) {
                    updatedOrder.sub[newName] = updatedOrder.sub[oldName];
                    delete updatedOrder.sub[oldName];
                  }
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  if (activeGuideMain === oldName) setActiveGuideMain(newName);
                  flushAndSaveStateToStorage('playbook_rename_main');
                }}
                onRenameSubTab={(main, oldName, newName) => {
                  const updatedTree = { ...guideTree };
                  if (updatedTree[main]) {
                    const val = updatedTree[main][oldName];
                    delete updatedTree[main][oldName];
                    updatedTree[main][newName] = val;
                    setGuideTree(updatedTree);
                  }

                  const updatedOrder = { ...guideOrder };
                  if (updatedOrder.sub[main]) {
                    const sIdx = updatedOrder.sub[main].indexOf(oldName);
                    if (sIdx !== -1) updatedOrder.sub[main][sIdx] = newName;
                    setGuideOrder(updatedOrder);
                  }
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  if (activeGuideSub === oldName) setActiveGuideSub(newName);
                  flushAndSaveStateToStorage('playbook_rename_sub');
                }}
                onDeleteMainFolder={(name) => {
                  const updatedTree = { ...guideTree };
                  delete updatedTree[name];
                  setGuideTree(updatedTree);

                  const updatedOrder = { ...guideOrder };
                  updatedOrder.main = updatedOrder.main.filter((m) => m !== name);
                  delete updatedOrder.sub[name];
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);

                  if (activeGuideMain === name) {
                    const nextMain = updatedOrder.main[0] || 'Offense';
                    setActiveGuideMain(nextMain);
                    setActiveGuideSub(
                      updatedOrder.sub[nextMain]?.[0] || 'Full Playbook'
                    );
                  }
                  flushAndSaveStateToStorage('playbook_delete_main');
                }}
                onDeleteSubTab={(main, name) => {
                  const updatedTree = { ...guideTree };
                  if (updatedTree[main]) {
                    delete updatedTree[main][name];
                    setGuideTree(updatedTree);
                  }

                  const updatedOrder = { ...guideOrder };
                  if (updatedOrder.sub[main]) {
                    updatedOrder.sub[main] = updatedOrder.sub[main].filter(
                      (s) => s !== name
                    );
                    setGuideOrder(updatedOrder);
                    if (activeGuideSub === name) {
                      setActiveGuideSub(updatedOrder.sub[main][0] || '');
                    }
                  }
                  latestStateRef.current.guideTree = updatedTree;
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesTree', updatedTree);
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  flushAndSaveStateToStorage('playbook_delete_sub');
                }}
                onMoveMainFolder={(name, direction) => {
                  const idx = guideOrder.main.indexOf(name);
                  if (idx === -1) return;
                  const newIdx = idx + direction;
                  if (newIdx < 0 || newIdx >= guideOrder.main.length) return;
                  const list = [...guideOrder.main];
                  const [moved] = list.splice(idx, 1);
                  list.splice(newIdx, 0, moved);
                  const updatedOrder = { ...guideOrder, main: list };
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  flushAndSaveStateToStorage('playbook_move_main');
                }}
                onMoveSubTab={(main, name, direction) => {
                  const subList = guideOrder.sub[main] || [];
                  const idx = subList.indexOf(name);
                  if (idx === -1) return;
                  const newIdx = idx + direction;
                  if (newIdx < 0 || newIdx >= subList.length) return;
                  const list = [...subList];
                  const [moved] = list.splice(idx, 1);
                  list.splice(newIdx, 0, moved);
                  const updatedOrder = {
                    ...guideOrder,
                    sub: { ...guideOrder.sub, [main]: list },
                  };
                  setGuideOrder(updatedOrder);
                  latestStateRef.current.guideOrder = updatedOrder;
                  safeJSONSet('footballPdfGuidesOrder', updatedOrder);
                  flushAndSaveStateToStorage('playbook_move_sub');
                }}
              />
            )}

            {/* 6. Drill Library */}
            {activeUnit === 'drills' && (
              <DrillLibraryView
                cascadingDrills={cascadingDrills}
                collapsedFolders={collapsedFolders}
                userRole={userRole}
                onToggleFolder={(pathKey) => {
                  setCollapsedFolders((prev) => ({
                    ...prev,
                    [pathKey]: !prev[pathKey],
                  }));
                }}
                onAddTopFolder={handleAddTopDrillFolder}
                onAddSubfolder={handleAddSubfolder}
                onAddDrill={handleAddDrill}
                onRenameFolder={handleRenameDrillFolder}
                onDeleteFolder={handleDeleteDrillFolder}
                onMoveFolder={handleMoveDrillFolder}
                onUpdateDrill={handleUpdateDrill}
                onDeleteDrill={handleDeleteDrill}
                onMoveDrillToFolder={handleMoveDrillToFolder}
                onExportCSV={handleExportDrillsCSV}
                onImportCSVClick={() => drillCsvInputRef.current?.click()}
                onExportJSON={handleExportDrillsJSON}
                onImportJSONClick={() => drillJsonInputRef.current?.click()}
                onForceSyncCloud={() => saveStateToStorage('all')}
                onResetDefaults={() => {
                  if (confirm('Reset Drill Library to default categories?')) {
                    updateCascadingDrillsAndSave(() => deepClone(DEFAULT_CASCADING_DRILLS));
                  }
                }}
              />
            )}

            {/* 7. Practice Plan Generator */}
            {activeUnit === 'practice' && (
              <PracticePlanView
                practices={activeTeamPracticeData.length > 0 ? activeTeamPracticeData : practiceData}
                currentPracticeId={currentPracticeId}
                practiceTemplates={practiceTemplates}
                cascadingDrills={cascadingDrills}
                savedCoaches={activeTeamSavedCoaches}
                printFontSize={printFontSize}
                userRole={userRole}
                scheduleEvents={activeTeamScheduleEvents}
                onQuickCreateFromSchedule={handleQuickCreatePlanFromSchedule}
                onSelectPractice={(id) => {
                  setCurrentPracticeId(id);
                  safeJSONSet('footballCurrentPracticeId', id);
                }}
                onOpenNewPracticeModal={handleOpenNewPracticeModal}
                onEditPracticeDetails={handleEditPracticeDetails}
                onAutoNumberPractices={handleAutoNumberPractices}
                onDeletePractice={handleDeletePractice}
                onApplyTemplate={handleApplyPracticeTemplate}
                onSaveCurrentAsTemplate={handleSaveCurrentAsTemplate}
                onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
                onUpdatePrintFontSize={(size) => {
                  setPrintFontSize(size);
                  safeJSONSet('footballPrintFontSize', size);
                }}
                onUpdateMeta={handleUpdatePracticeMeta}
                onAddPeriod={handleAddPeriod}
                onRemovePeriod={handleRemovePeriod}
                onMovePeriod={handleMovePeriod}
                onUpdatePeriodTime={handleUpdatePeriodTime}
                onUpdatePeriodCategory={handleUpdatePeriodCategory}
                onUpdatePeriodFormat={handleUpdatePeriodFormat}
                onAddStationToPeriod={handleAddStationToPeriod}
                onRemoveStationFromPeriod={handleRemoveStationFromPeriod}
                onUpdateStation={handleUpdateStation}
                onSelectDrillForStation={handleSelectDrillForStation}
                onAddNewSavedCoach={(name) => handleAddNewSavedCoach(name, activeTeamId)}
                onDeleteSavedCoach={(name) => handleDeleteSavedCoach(name, activeTeamId)}
                onNavigateToSchedule={() => setActiveUnit('schedule')}
                onPracticeWizardGenerate={handlePracticeWizardGenerate}
              />
            )}

            {/* 8. Staff & User Management */}
            {activeUnit === 'users' && userRole === 'admin' && (
              <StaffManagerView
                staffList={staffList}
                savedCoaches={activeTeamSavedCoaches}
                teamSavedCoaches={teamSavedCoaches}
                userRole={userRole}
                teams={teams}
                activeTeamId={activeTeamId}
                defaultTeamId={defaultTeamId}
                onSelectTeam={setActiveTeamId}
                onSetDefaultTeam={handleSetDefaultTeam}
                onAddTeam={handleAddTeam}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onAddStaffCoach={handleAddStaffCoach}
                onUpdateStaffRole={(idx, role) => {
                  setStaffList((prev) => {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], role };
                    safeJSONSet('footballTeamCoaches', updated);
                    return updated;
                  });
                }}
                onToggleStaffApproval={(idx) => {
                  setStaffList((prev) => {
                    const updated = [...prev];
                    updated[idx] = {
                      ...updated[idx],
                      status:
                        updated[idx].status === 'Active'
                          ? 'Pending'
                          : 'Active',
                    };
                    safeJSONSet('footballTeamCoaches', updated);
                    return updated;
                  });
                }}
                onRemoveStaffCoach={(idx) => {
                  const targetCoach = staffList[idx];
                  if (
                    idx === 0 &&
                    targetCoach.role.toLowerCase().includes('head coach')
                  ) {
                    alert('Cannot remove the primary Head Coach / Master Admin.');
                    return;
                  }
                  if (confirm(`Remove ${targetCoach.email}?`)) {
                    setStaffList((prev) => {
                      const updated = prev.filter((_, i) => i !== idx);
                      safeJSONSet('footballTeamCoaches', updated);
                      return updated;
                    });
                  }
                }}
                onUpdateStaffAssignedTeams={handleUpdateStaffAssignedTeams}
                onUpdateStaffPreferences={handleUpdateStaffPreferences}
                currentUserEmail={currentUser?.email || 'dannym1010@gmail.com'}
                onAddNewSavedCoach={handleAddNewSavedCoach}
                onDeleteSavedCoach={handleDeleteSavedCoach}
                onCopyCoachesFromTeam={handleCopyCoachesFromTeam}
              />
            )}

            {/* 9. Season Schedule & Games Hub */}
            {activeUnit === 'schedule' && (
              <ScheduleView
                scheduleEvents={activeTeamScheduleEvents}
                userRole={userRole}
                currentWeek={currentWeek}
                activeTeam={currentActiveTeam}
                practicePlans={practiceData}
                weeklyData={weeklyData}
                practiceTemplates={practiceTemplates}
                seasonConfig={seasonConfig}
                onOpenSeasonConfigModal={() => setIsSeasonConfigModalOpen(true)}
                onAddEvent={handleAddScheduleEvent}
                onUpdateEvent={handleUpdateScheduleEvent}
                onDeleteEvent={handleDeleteScheduleEvent}
                onBulkAddEvents={handleBulkAddScheduleEvents}
                onPracticeWizardGenerate={handlePracticeWizardGenerate}
                onSyncGameToWeeklyData={handleSyncGameToWeeklyData}
                onSyncPracticeToPlan={handleSyncPracticeToPlan}
                onNavigateToWeek={handleNavigateToWeek}
                onImportTeamSnapEvents={handleImportTeamSnapScheduleEvents}
                onUpdateTeam={handleUpdateTeam}
              />
            )}

            {/* 10. Practice Hours & Acclimatization Compliance */}
            {activeUnit === 'compliance' && (
              <PlayerHoursTracker
                roster={activeTeamRoster}
                userRole={userRole}
                currentWeek={currentWeek}
                scheduleEvents={activeTeamScheduleEvents}
                seasonConfig={seasonConfig}
                attendanceLogs={attendanceLogs}
                onUpdatePlayer={handleUpdatePlayerInRoster}
                onUpdateRoster={handleUpdateRoster}
                onAddScheduleEvent={handleAddScheduleEvent}
                onUpdateScheduleEvent={(event) => handleUpdateScheduleEvent(event.id, event)}
                onDeleteScheduleEvent={handleDeleteScheduleEvent}
                onOpenAddPlayerModal={() => {
                  setEditingPlayerForModal(null);
                  setIsRosterModalOpen(true);
                }}
                onOpenEditPlayerModal={(player) => {
                  setEditingPlayerForModal(player);
                  setIsRosterModalOpen(true);
                }}
                onOpenRosterManager={() => setIsRosterModalOpen(true)}
                onUpdateSeasonConfig={(cfg) => {
                  setSeasonConfig(cfg);
                  safeJSONSet('footballSeasonConfig', cfg);
                }}
                onUpdateAttendanceLogs={(logs) => {
                  setAttendanceLogs(logs);
                  safeJSONSet('footballAttendanceLogs', logs);
                }}
              />
            )}
          </div>

          {/* Master Roster Sidebar (Shown on Depth Charts, Scrimmage, Wristband) */}
          {!['mobile_hub', 'drills', 'scouting', 'guide', 'practice', 'users', 'schedule', 'compliance'].includes(
            activeUnit
          ) && (
            <RosterSidebar
              roster={activeTeamRoster}
              activeTeamName={currentActiveTeam.name}
              totalProgramPlayers={roster.length}
              onCopyFromMainTeam={() => {
                const sourceTeam = teams.find((t) => (t.id === 'team_10u' || t.id === 'team-10u')) || teams[0];
                if (!sourceTeam) return;
                const sourcePlayers = roster.filter(
                  (p) => (p.teamId || teams[0]?.id) === sourceTeam.id ||
                         (p.teamId === 'team_10u' && sourceTeam.id === 'team-10u') ||
                         (p.teamId === 'team-10u' && sourceTeam.id === 'team_10u')
                );
                if (sourcePlayers.length === 0) return;
                const cloned = sourcePlayers.map((p) => ({
                  ...p,
                  teamId: activeTeamId,
                }));
                const otherPlayers = roster.filter((p) => (p.teamId || teams[0]?.id) !== activeTeamId);
                const merged = [...otherPlayers, ...cloned];
                handleUpdateRoster(merged);
              }}
              onRestoreDefaultRoster={() => {
                handleUpdateRoster(MASTER_ROSTER);
              }}
              searchTerm={rosterSearchTerm}
              onSearchChange={setRosterSearchTerm}
              activeUnit={activeUnit}
              selectedFormationId={selectedFormationId}
              currentWeekState={currentWeekState}
              userRole={userRole}
              playLibrary={masterPlayLibrary}
              playSearchTerm={playSearchTerm}
              onPlaySearchChange={setPlaySearchTerm}
              onDragStartPlayer={handleDragStartRosterPlayer}
              onDragStartPlay={(e, play) => {
                e.dataTransfer.setData('text/plain', play);
              }}
              onOpenRosterManager={() => setIsRosterModalOpen(true)}
              onSelectPlayerForEdit={(p) => {
                setEditingPlayerForModal(p);
                setIsRosterModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Quick Launch Dock (Phone Viewports) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/80 px-2 py-1.5 flex items-center justify-around shadow-2xl print:hidden">
        <button
          onClick={() => setActiveUnit('mobile_hub')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeUnit === 'mobile_hub' ? 'text-indigo-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px]">Hub</span>
        </button>

        <button
          onClick={() => {
            setDepthSubUnit(depthSubUnit || 'offense');
            setActiveUnit(depthSubUnit || 'offense');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            ['offense', 'defense', 'st', 'groups', 'scrimmage', 'depth_chart'].includes(activeUnit)
              ? 'text-indigo-400 font-black'
              : 'text-slate-400 font-semibold'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Depth</span>
        </button>

        <button
          onClick={() => setActiveUnit('wristband')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeUnit === 'wristband' ? 'text-indigo-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Watch className="w-5 h-5" />
          <span className="text-[10px]">Plays</span>
        </button>

        <button
          onClick={() => setActiveUnit('practice')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeUnit === 'practice' ? 'text-indigo-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Plan</span>
        </button>

        <button
          onClick={() => setActiveUnit('schedule')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeUnit === 'schedule' ? 'text-indigo-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Schedule</span>
        </button>
      </nav>

      {/* Global Dialog Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        isPendingApproval={isPendingApproval}
        pendingEmail={currentUser?.email || ''}
        onEmailAuth={async (email, pass, isSignUp) => {
          const { auth } = getFirebaseServices();
          if (!auth) {
            setCurrentUser({ email });
            setIsAuthModalOpen(false);
            return;
          }
          if (isSignUp) {
            await auth.createUserWithEmailAndPassword(email, pass);
          } else {
            await auth.signInWithEmailAndPassword(email, pass);
          }
        }}
        onGoogleSignIn={async () => {
          const { auth } = getFirebaseServices();
          if (!auth) {
            setCurrentUser({ email: 'coach@google.com' });
            setIsAuthModalOpen(false);
            return;
          }
          const provider = new window.firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          const result = await auth.signInWithPopup(provider);
          if (result?.user) {
            setCurrentUser(result.user);
            setIsAuthModalOpen(false);
          }
        }}
        onGoogleSignInRedirect={async () => {
          const { auth } = getFirebaseServices();
          if (!auth) {
            setCurrentUser({ email: 'dannym1010@gmail.com', displayName: 'Administrator' });
            setIsAuthModalOpen(false);
            applyUserPreferencesOnLogin('dannym1010@gmail.com');
            return;
          }
          const provider = new window.firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await auth.signInWithRedirect(provider);
        }}
        staffList={staffList}
        teams={teams}
        onSelectQuickCoach={(coachEmail) => {
          const cleanEmail = coachEmail.toLowerCase().trim();
          const coach = staffList.find((c) => c.email.toLowerCase().trim() === cleanEmail);
          setCurrentUser({
            email: cleanEmail,
            displayName: coach?.role || 'Coach',
          });
          setIsAuthModalOpen(false);
          setIsPendingApproval(false);
          const isHead =
            cleanEmail.includes('dannym1010') ||
            coach?.role?.toLowerCase().includes('head coach') ||
            coach?.role?.toLowerCase().includes('admin');
          setUserRole(isHead ? 'admin' : 'assistant');
          applyUserPreferencesOnLogin(cleanEmail);
        }}
        onBypassLogin={() => {
          setCurrentUser({
            email: 'dannym1010@gmail.com',
            displayName: 'Program Admin (Offline)',
          });
          setIsAuthModalOpen(false);
          setIsPendingApproval(false);
          setUserRole('admin');
          applyUserPreferencesOnLogin('dannym1010@gmail.com');
        }}
        onSignOut={() => {
          const { auth } = getFirebaseServices();
          if (auth) auth.signOut().then(() => window.location.reload());
          else window.location.reload();
        }}
      />

      <CopyWeekModal
        isOpen={isCopyWeekModalOpen}
        currentWeek={currentWeek}
        activeTeamId={activeTeamId}
        teams={teams}
        seasonConfig={seasonConfig}
        scheduleEvents={scheduleEvents}
        weeklyData={weeklyData}
        onClose={() => setIsCopyWeekModalOpen(false)}
        onExecuteCopy={handleExecuteCopyWeek}
      />

      {selectivePrintUnit && (
        <SelectivePrintModal
          isOpen={Boolean(selectivePrintUnit)}
          unit={selectivePrintUnit}
          formations={currentFormations}
          onClose={() => setSelectivePrintUnit(null)}
          onPrintSelected={(selectedIds) => {
            // Close the modal dialog first so backdrop or dialog traps do not block the print spooler
            setSelectivePrintUnit(null);

            triggerPrint({
              beforePrint: () => {
                document
                  .querySelectorAll('.formation-container')
                  .forEach((card: any) => {
                    const fId = card.getAttribute('data-form-id');
                    if (fId && !selectedIds.includes(fId)) {
                      card.classList.add('hidden-print');
                    } else {
                      card.classList.remove('hidden-print');
                    }
                  });
              },
              afterPrint: () => {
                document
                  .querySelectorAll('.formation-container')
                  .forEach((card: any) => {
                    card.classList.remove('hidden-print');
                  });
              },
            });
          }}
        />
      )}

      <ScrimmageFilterModal
        isOpen={isScrimmageFilterOpen}
        formations={currentFormations}
        currentFilters={scrimmageFilters}
        onClose={() => setIsScrimmageFilterOpen(false)}
        onSaveFilters={(selectedIds) => {
          setScrimmageFilters(selectedIds);
          safeJSONSet('footballScrimmageFilters', selectedIds);
        }}
      />

      <TemplatesManagerModal
        isOpen={isTemplatesModalOpen}
        templates={practiceTemplates}
        onClose={() => setIsTemplatesModalOpen(false)}
        onRenameTemplate={(oldName, newName) => {
          setPracticeTemplates((prev) => {
            const updated = { ...prev };
            updated[newName] = updated[oldName];
            delete updated[oldName];
            safeJSONSet('footballPracticeTemplates', updated);
            latestStateRef.current.practiceTemplates = updated;
            debouncedSave('practice');
            const { db } = getFirebaseServices();
            if (db) {
              db.collection('teamData')
                .doc('depthChartData')
                .set({ practiceTemplates: updated, updatedAt: Date.now() }, { merge: true })
                .catch((err: any) => console.warn('Firestore template rename error:', err));
            }
            return updated;
          });
        }}
        onDeleteTemplate={(name) => {
          setPracticeTemplates((prev) => {
            const updated = { ...prev };
            delete updated[name];
            safeJSONSet('footballPracticeTemplates', updated);
            latestStateRef.current.practiceTemplates = updated;
            debouncedSave('practice');
            const { db } = getFirebaseServices();
            if (db) {
              db.collection('teamData')
                .doc('depthChartData')
                .set({ practiceTemplates: updated, updatedAt: Date.now() }, { merge: true })
                .catch((err: any) => console.warn('Firestore template delete error:', err));
            }
            return updated;
          });
        }}
        onSaveNewTemplate={(name) => {
          handleSaveCurrentAsTemplate(name);
        }}
      />

      <ImportBackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplySelectiveImport={(parsedData, selectedOptions) =>
          applyImportDataObject(parsedData, selectedOptions)
        }
      />

      <RosterManagerModal
        isOpen={isRosterModalOpen}
        onClose={() => {
          setIsRosterModalOpen(false);
          setEditingPlayerForModal(null);
        }}
        roster={roster}
        onUpdateRoster={handleUpdateRoster}
        userRole={userRole}
        editingPlayer={editingPlayerForModal}
        onClearEditingPlayer={() => setEditingPlayerForModal(null)}
        teams={teams}
        activeTeamId={activeTeamId}
        formations={currentFormations}
        depthChart={currentDepthChart}
      />

      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        teams={teams}
        activeTeamId={activeTeamId}
        defaultTeamId={defaultTeamId}
        onSetDefaultTeam={handleSetDefaultTeam}
        activeUnit={activeUnit}
        defaultScreen={defaultScreen}
        defaultDepthSubUnit={defaultDepthSubUnit}
        onSetDefaultScreen={handleSetDefaultScreen}
        userRole={userRole}
        currentUserEmail={currentUser?.email || 'dannym1010@gmail.com'}
        onOpenThemeGallery={() => setIsThemeGalleryOpen(true)}
        onOpenSeasonConfigModal={() => setIsSeasonConfigModalOpen(true)}
        onOpenManageTeams={() => setActiveUnit('users')}
        onOpenCopyWeekModal={() => setIsCopyWeekModalOpen(true)}
        onExportData={handleExportFullBackup}
        onImportClick={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        onForceSave={handleForceSave}
        onForceRefresh={handleForceRefresh}
      />

      <ThemeGalleryModal
        isOpen={isThemeGalleryOpen}
        onClose={() => setIsThemeGalleryOpen(false)}
        selectedThemeId={activeThemeId}
        onSelectTheme={(id) => {
          setActiveThemeId(id);
          safeJSONSet('footballActiveThemeId', id);
        }}
      />

      <SeasonConfigModal
        isOpen={isSeasonConfigModalOpen}
        onClose={() => setIsSeasonConfigModalOpen(false)}
        seasonConfig={seasonConfig}
        onSaveSeasonConfig={(newCfg) => {
          setSeasonConfig(newCfg);
          safeJSONSet('footballSeasonConfig', newCfg);
        }}
        scheduleEvents={scheduleEvents}
        activeTeamId={activeTeamId}
        teams={teams}
      />
    </div>
  );
}
