import React, { useState, useEffect, useRef } from 'react';
import {
  UnitType,
  UserRole,
  RosterPlayer,
  PlacedPlayer,
  FormationBoard,
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
} from './types';
import {
  MASTER_ROSTER,
  INITIAL_DEFAULT_FORMATIONS,
  DEFAULT_CASCADING_DRILLS,
  DEFAULT_PRACTICE_TEMPLATES,
  DEFAULT_GUIDES_TREE,
  DEFAULT_GUIDES_ORDER,
  DEFAULT_SAVED_COACHES,
  DEFAULT_TEAM_COACHES,
  MASTER_PLAY_LIBRARY,
} from './data/initialData';
import {
  safeJSONParse,
  safeJSONSet,
  deepClone,
  safeJSONStringify,
  getFirebaseServices,
  parseCSV,
  escapeCSV,
} from './services/storageService';

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
    safeJSONParse('footballWeeklyData', {})
  );
  const [defaultFormations, setDefaultFormations] = useState<FormationBoard[]>(
    () => safeJSONParse('footballDefaultFormations', INITIAL_DEFAULT_FORMATIONS)
  );
  const [practiceData, setPracticeData] = useState<PracticePlan[]>(() =>
    safeJSONParse('footballPracticeData', [])
  );
  const [practiceTemplates, setPracticeTemplates] = useState<
    Record<string, PracticePeriod[]>
  >(() =>
    safeJSONParse('footballPracticeTemplates', DEFAULT_PRACTICE_TEMPLATES)
  );
  const [cascadingDrills, setCascadingDrills] = useState<DrillFolder[]>(() =>
    safeJSONParse('footballCascadingDrills', DEFAULT_CASCADING_DRILLS)
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
  const [staffList, setStaffList] = useState<StaffCoach[]>(() =>
    safeJSONParse('footballTeamCoaches', DEFAULT_TEAM_COACHES)
  );
  const [masterPlayLibrary, setMasterPlayLibrary] = useState<string[]>(() =>
    safeJSONParse('footballMasterPlays', MASTER_PLAY_LIBRARY)
  );

  // App Navigation & Session States
  const [currentWeek, setCurrentWeek] = useState<string>(() =>
    safeJSONParse('footballCurrentWeek', '0')
  );
  const [activeUnit, setActiveUnit] = useState<UnitType>(() =>
    safeJSONParse('footballActiveUnit', 'offense')
  );
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(
    null
  );
  const [currentPracticeId, setCurrentPracticeId] = useState<string | null>(
    null
  );
  const [activeGuideMain, setActiveGuideMain] = useState<string>('Offense');
  const [activeGuideSub, setActiveGuideSub] = useState<string>('Full Playbook');
  const [printFontSize, setPrintFontSize] = useState<string>(() =>
    safeJSONParse('footballPrintFontSize', '10')
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

  // Modal Dialog States
  const [isCopyWeekModalOpen, setIsCopyWeekModalOpen] = useState(false);
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

  // Ensure current week object exists
  const ensureWeekExists = (week: string) => {
    setWeeklyData((prev) => {
      if (prev[week] && prev[week].formations?.length) return prev;

      const templateForms =
        prev['0']?.formations && prev['0'].formations.length > 0
          ? prev['0'].formations
          : defaultFormations;

      return {
        ...prev,
        [week]: {
          formations: deepClone(templateForms),
          depthChart: prev[week]?.depthChart || {},
          scrimmageChart: prev[week]?.scrimmageChart || {},
          opponent: prev[week]?.opponent || '',
          wristbandData: prev[week]?.wristbandData || {
            rows: 10,
            columns: [{ color: 'blue', plays: [] }],
          },
          scouting: prev[week]?.scouting || {
            year: '2026',
            week: `Week ${week}`,
            opponent: '',
            teamOverview: '',
            keyPlayers: '',
          },
        },
      };
    });
  };

  // Trigger Save to LocalStorage and Firestore (if available)
  const saveStateToStorage = (scope: string = 'all') => {
    safeJSONSet('footballWeeklyData', weeklyData);
    safeJSONSet('footballDefaultFormations', defaultFormations);
    safeJSONSet('footballPracticeData', practiceData);
    safeJSONSet('footballPracticeTemplates', practiceTemplates);
    safeJSONSet('footballCascadingDrills', cascadingDrills);
    safeJSONSet('footballPdfGuidesTree', guideTree);
    safeJSONSet('footballPdfGuidesOrder', guideOrder);
    safeJSONSet('footballSavedCoaches', savedCoaches);
    safeJSONSet('footballTeamCoaches', staffList);
    safeJSONSet('footballMasterPlays', masterPlayLibrary);
    safeJSONSet('footballCollapsedFolders', collapsedFolders);

    const { db } = getFirebaseServices();
    if (db) {
      setSyncStatus({ text: '☁️ Saving to Cloud...', color: '#f59e0b' });
      const payload = deepClone({
        weeklyData,
        defaultFormations,
        practiceData,
        practiceTemplates,
        cascadingDrills,
        guideTree,
        guideOrder,
        savedCoaches,
        staffList,
        masterPlayLibrary,
        collapsedFolders,
      });

      db.collection('teamData')
        .doc('depthChartData')
        .set(
          {
            ...payload,
            updatedAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
          },
          { merge: true }
        )
        .then(() => {
          setSyncStatus({ text: '✅ Live Cloud Synced', color: '#22c55e' });
        })
        .catch((err: any) => {
          console.warn('Firestore sync warning:', err);
          setSyncStatus({ text: 'Local Mode (Cloud offline)', color: '#22c55e' });
        });
    }
  };

  const debouncedSave = (scope: string = 'all') => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToStorage(scope);
    }, 400);
  };

  // Update root CSS variable for print font size
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--print-font-size',
      `${printFontSize}px`
    );
  }, [printFontSize]);

  // Initial Firebase Auth Listener & Cloud Sync Subscription
  useEffect(() => {
    const { auth, db } = getFirebaseServices();

    if (auth) {
      // Process any pending redirect auth results from Google Sign-in
      auth.getRedirectResult().then((result: any) => {
        if (result?.user) {
          setCurrentUser(result.user);
          setIsAuthModalOpen(false);
        }
      }).catch((err: any) => {
        console.warn('Redirect auth result error:', err);
      });

      const unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
        if (user) {
          setCurrentUser(user);
          setIsAuthModalOpen(false);

          // Check if coach is approved or master admin
          const cleanEmail = (user.email || '').toLowerCase().trim();
          const isMaster = cleanEmail === 'dannym1010@gmail.com';
          
          setStaffList((prevStaff) => {
            const exists = prevStaff.some(
              (c) => c.email.toLowerCase().trim() === cleanEmail
            );
            if (!exists && cleanEmail) {
              const newEntry: StaffCoach = {
                email: cleanEmail,
                role: isMaster ? 'Head Coach / Admin' : 'Assistant Coach',
                status: isMaster ? 'Active' : 'Pending',
              };
              const updatedStaff = [...prevStaff, newEntry];
              // Save to Firestore
              if (db) {
                db.collection('teamData').doc('depthChartData').set(
                  { staffList: updatedStaff },
                  { merge: true }
                ).catch((err: any) => console.warn('Staff update error:', err));
              }
              return updatedStaff;
            }
            return prevStaff;
          });

          const coachEntry = staffList.find(
            (c) => c.email.toLowerCase().trim() === cleanEmail
          );

          if (isMaster || coachEntry?.status === 'Active') {
            setIsPendingApproval(false);
            const isHead = isMaster || coachEntry?.role?.includes('Admin');
            setUserRole(isHead ? 'admin' : 'assistant');
            setSyncStatus({ text: '✅ Live Cloud Synced', color: '#22c55e' });
          } else {
            setIsPendingApproval(true);
            setSyncStatus({ text: 'Approval Pending', color: '#f59e0b' });
          }
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
                // Ignore incoming snapshot during active local backup import
                return;
              }
              if (doc && doc.exists) {
                const data = doc.data();
                if (data.weeklyData && Object.keys(data.weeklyData).length > 0) {
                  setWeeklyData(data.weeklyData);
                }
                if (data.defaultFormations && Array.isArray(data.defaultFormations) && data.defaultFormations.length > 0) {
                  setDefaultFormations(data.defaultFormations);
                }
                if (data.practiceData && Array.isArray(data.practiceData)) {
                  setPracticeData(data.practiceData);
                }
                if (data.practiceTemplates) {
                  setPracticeTemplates(data.practiceTemplates);
                }
                if (data.cascadingDrills) {
                  setCascadingDrills(data.cascadingDrills);
                }
                if (data.guideTree) {
                  setGuideTree(data.guideTree);
                }
                if (data.guideOrder) {
                  setGuideOrder(data.guideOrder);
                }
                if (data.savedCoaches) {
                  setSavedCoaches(data.savedCoaches);
                }
                if (data.staffList) {
                  setStaffList(data.staffList);
                }
                if (data.masterPlayLibrary) {
                  setMasterPlayLibrary(data.masterPlayLibrary);
                }
                initialCloudLoadDoneRef.current = true;
                setSyncStatus({ text: '✅ Live Cloud Synced', color: '#22c55e' });
              } else {
                // First time ever on this Firebase project - seed cloud with local data
                initialCloudLoadDoneRef.current = true;
                saveStateToStorage('all');
              }
            },
            (err: any) => {
              console.warn('Firestore subscription error:', err);
              initialCloudLoadDoneRef.current = true;
              setSyncStatus({ text: '⚠️ Cloud Sync Error (Check Rules)', color: '#f59e0b' });
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

    if (practiceData.length === 0) {
      const defaultPlan: PracticePlan = {
        id: 'prac_' + Date.now(),
        year: '2026',
        weekFolder: 'Week 1',
        title: 'Practice #1',
        date: new Date().toISOString().split('T')[0],
        day: 'Wednesday',
        startTime: '17:05',
        lastEdited: Date.now(),
        plan: deepClone(DEFAULT_PRACTICE_TEMPLATES['Standard Practice']),
      };
      setPracticeData([defaultPlan]);
      setCurrentPracticeId(defaultPlan.id);
    } else if (!currentPracticeId && practiceData.length > 0) {
      setCurrentPracticeId(practiceData[0].id);
    }
  }, [currentWeek]);

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
    staffList,
    masterPlayLibrary,
    collapsedFolders,
  ]);

  const currentWeekState: WeekState = weeklyData[currentWeek] || {
    formations: defaultFormations,
    depthChart: {},
    scrimmageChart: {},
    opponent: '',
  };

  const currentFormations = currentWeekState.formations || defaultFormations;
  const currentDepthChart = currentWeekState.depthChart || {};
  const currentScrimmageChart = currentWeekState.scrimmageChart || {};

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
    setWeeklyData((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        formations: newFormations,
      },
    }));
    if (syncToDefaults) {
      setDefaultFormations(newFormations);
    }
  };

  // Helper to update depth chart
  const updateCurrentWeekDepthChart = (
    newDepthChart: Record<string, PlacedPlayer[]>
  ) => {
    setWeeklyData((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        depthChart: newDepthChart,
      },
    }));
  };

  // Helper to update scrimmage chart
  const updateCurrentWeekScrimmageChart = (
    newScrimChart: Record<string, PlacedPlayer[]>
  ) => {
    setWeeklyData((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        scrimmageChart: newScrimChart,
      },
    }));
  };

  /* =========================================================================
     DRAG AND DROP HANDLERS (PLAYERS & POSITION CARDS)
     ========================================================================= */
  const handleDragStartRosterPlayer = (
    e: React.DragEvent,
    player: RosterPlayer
  ) => {
    if (userRole !== 'admin') return;
    draggedPlayerRef.current = {
      type: 'roster',
      name: `${player.firstName} ${player.lastName}`.trim(),
      num: player.num,
    };
    e.dataTransfer.setData('text/plain', player.lastName || player.firstName);
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
    }
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
      }
    }
    draggedPositionCardRef.current = null;
  };

  /* =========================================================================
     FORMATION ACTIONS
     ========================================================================= */
  const handleAddFormation = (unit: 'offense' | 'defense' | 'st' | 'groups') => {
    const name = prompt(
      `Enter ${unit.toUpperCase()} Formation Name (e.g. 11 Shotgun / 5-3 Defense):`
    );
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const newId = `form_${Date.now()}`;

    const newForm: FormationBoard = {
      id: newId,
      unit,
      name: cleanName,
      collapsed: false,
      rows: [
        {
          id: `row_${Date.now()}`,
          label: 'Main Level',
          slotCount: 7,
          positions: Array(7).fill(null),
        },
      ],
    };

    const updated = [...currentFormations, newForm];
    updateCurrentWeekFormations(updated, true);
    setSelectedFormationId(newId);
  };

  const handleDuplicateFormation = (formId: string) => {
    if (userRole !== 'admin') return;
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;

    const newName = prompt(
      'Enter name for duplicated formation:',
      `${form.name} (Copy)`
    );
    if (!newName || !newName.trim()) return;

    const newFormId = `form_${Date.now()}`;
    const dc = { ...currentDepthChart };
    const sc = { ...currentScrimmageChart };

    const clonedForm: FormationBoard = {
      id: newFormId,
      unit: form.unit,
      name: newName.trim(),
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
    updateCurrentWeekFormations(updated);
    updateCurrentWeekDepthChart(dc);
    updateCurrentWeekScrimmageChart(sc);
    setSelectedFormationId(newFormId);
  };

  const handleRenameFormation = (formId: string) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;
    const newName = prompt('Rename Formation:', form.name);
    if (newName && newName.trim()) {
      const updated = currentFormations.map((f) =>
        f.id === formId ? { ...f, name: newName.trim() } : f
      );
      updateCurrentWeekFormations(updated, true);
    }
  };

  const handleDeleteFormation = (formId: string) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form) return;
    if (confirm(`Delete formation "${form.name}"?`)) {
      const updated = currentFormations.filter((f) => f.id !== formId);
      updateCurrentWeekFormations(updated, true);
    }
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
      updateCurrentWeekFormations(forms);
    }
  };

  const handleAddRow = (formId: string) => {
    const label = prompt('Enter Row Level Label (e.g. Backfield, Linebackers):', 'Secondary Level');
    if (!label) return;
    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        return {
          ...f,
          rows: [
            ...f.rows,
            {
              id: `row_${Date.now()}`,
              label: label.trim(),
              slotCount: 7,
              positions: Array(7).fill(null),
            },
          ],
        };
      }
      return f;
    });
    updateCurrentWeekFormations(forms);
  };

  const handleEditRowName = (formId: string, rIdx: number) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]) return;
    const newName = prompt('Edit Row Name:', form.rows[rIdx].label);
    if (newName && newName.trim()) {
      const forms = currentFormations.map((f) => {
        if (f.id === formId) {
          const rows = [...f.rows];
          rows[rIdx] = { ...rows[rIdx], label: newName.trim() };
          return { ...f, rows };
        }
        return f;
      });
      updateCurrentWeekFormations(forms);
    }
  };

  const handleEditRowSlots = (formId: string, rIdx: number) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]) return;
    const currentCount = form.rows[rIdx].positions.length;
    const countStr = prompt('Enter number of slots (1 to 10):', String(currentCount));
    const newCount = parseInt(countStr || '', 10);
    if (isNaN(newCount) || newCount < 1 || newCount > 10) return;

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        let positions = [...rows[rIdx].positions];
        while (positions.length < newCount) positions.push(null);
        if (newCount < positions.length) positions = positions.slice(0, newCount);
        rows[rIdx] = { ...rows[rIdx], slotCount: newCount, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms);
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
    updateCurrentWeekFormations(forms);
  };

  const handleAddPosition = (formId: string, rIdx: number) => {
    const posName = prompt('Enter Position Label (e.g. QB, MLB, LT):');
    if (!posName || !posName.trim()) return;
    const cleanName = posName.trim();
    const newPosId = `${formId}-${cleanName}-${Date.now()}`;

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = [...f.rows];
        const row = rows[rIdx];
        const emptyIdx = row.positions.indexOf(null);
        const positions = [...row.positions];
        if (emptyIdx !== -1) {
          positions[emptyIdx] = { id: newPosId, name: cleanName };
        } else {
          positions.push({ id: newPosId, name: cleanName });
        }
        rows[rIdx] = { ...row, slotCount: positions.length, positions };
        return { ...f, rows };
      }
      return f;
    });
    updateCurrentWeekFormations(forms);
  };

  const handleEditPositionName = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]?.positions[pIdx]) return;
    const currentName = form.rows[rIdx].positions[pIdx]!.name;
    const newName = prompt('Edit Position Name:', currentName);
    if (newName && newName.trim()) {
      const forms = currentFormations.map((f) => {
        if (f.id === formId) {
          const rows = [...f.rows];
          const positions = [...rows[rIdx].positions];
          positions[pIdx] = { ...positions[pIdx]!, name: newName.trim() };
          rows[rIdx] = { ...rows[rIdx], positions };
          return { ...f, rows };
        }
        return f;
      });
      updateCurrentWeekFormations(forms);
    }
  };

  const handleMovePositionRow = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const form = currentFormations.find((f) => f.id === formId);
    if (!form || !form.rows[rIdx]?.positions[pIdx]) return;
    const pos = form.rows[rIdx].positions[pIdx]!;

    const rowOptions = form.rows.map((r, i) => `${i}: ${r.label}`).join('\n');
    const targetIdxStr = prompt(
      `Move [${pos.name}] to which row level?\n\n${rowOptions}\n\nEnter row number:`
    );
    const targetRIdx = parseInt(targetIdxStr || '', 10);
    if (isNaN(targetRIdx) || targetRIdx < 0 || targetRIdx >= form.rows.length)
      return;

    const forms = currentFormations.map((f) => {
      if (f.id === formId) {
        const rows = deepClone(f.rows);
        rows[rIdx].positions[pIdx] = null;
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
    updateCurrentWeekFormations(forms);
  };

  const handleCopyPositionToOtherForm = (
    formId: string,
    rIdx: number,
    pIdx: number
  ) => {
    const srcForm = currentFormations.find((f) => f.id === formId);
    if (!srcForm || !srcForm.rows[rIdx]?.positions[pIdx]) return;
    const pos = srcForm.rows[rIdx].positions[pIdx]!;

    const otherForms = currentFormations.filter((f) => f.id !== formId);
    if (otherForms.length === 0) {
      alert('No other formations available.');
      return;
    }

    const options = otherForms.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
    const choiceStr = prompt(
      `Copy position [${pos.name}] to:\n\n${options}\n\nEnter number:`
    );
    const choiceIdx = parseInt(choiceStr || '', 10) - 1;
    if (isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= otherForms.length)
      return;

    const targetForm = otherForms[choiceIdx];
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

    updateCurrentWeekFormations(forms);
    updateCurrentWeekDepthChart(dc);
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
    updateCurrentWeekFormations(forms);
  };

  /* =========================================================================
     PRACTICE PLAN ACTIONS
     ========================================================================= */
  const handleOpenNewPracticeModal = () => {
    const title = prompt('Enter Practice Title (e.g. Practice #2 - Game Prep):', `Practice #${practiceData.length + 1}`);
    if (!title || !title.trim()) return;
    const dateStr = prompt('Enter Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);

    const newPrac: PracticePlan = {
      id: `prac_${Date.now()}`,
      year: '2026',
      weekFolder: `Week ${currentWeek}`,
      title: title.trim(),
      date: dateStr || new Date().toISOString().split('T')[0],
      day: 'Wednesday',
      startTime: '17:05',
      lastEdited: Date.now(),
      plan: deepClone(DEFAULT_PRACTICE_TEMPLATES['Standard Practice']),
    };

    setPracticeData((prev) => [...prev, newPrac]);
    setCurrentPracticeId(newPrac.id);
  };

  const handleEditPracticeDetails = () => {
    const cur = practiceData.find((p) => p.id === currentPracticeId);
    if (!cur) return;
    const yr = prompt('Edit Season Year:', cur.year || '2026');
    if (yr === null) return;
    const wk = prompt('Edit Week Folder:', cur.weekFolder || 'Week 1');
    if (wk === null) return;
    const title = prompt('Edit Practice Title:', cur.title);
    if (title === null) return;
    const dt = prompt('Edit Date (YYYY-MM-DD):', cur.date);
    if (dt === null) return;

    setPracticeData((prev) =>
      prev.map((p) =>
        p.id === currentPracticeId
          ? {
              ...p,
              year: yr.trim(),
              weekFolder: wk.trim(),
              title: title.trim(),
              date: dt.trim(),
            }
          : p
      )
    );
  };

  const handleAutoNumberPractices = () => {
    if (confirm('Auto-number practice plans sequentially?')) {
      setPracticeData((prev) =>
        prev.map((p, idx) => ({ ...p, title: `Practice #${idx + 1}` }))
      );
    }
  };

  const handleDeletePractice = () => {
    if (practiceData.length <= 1) {
      alert('Cannot delete the last practice plan.');
      return;
    }
    if (confirm('Delete current practice plan?')) {
      const remaining = practiceData.filter((p) => p.id !== currentPracticeId);
      setPracticeData(remaining);
      setCurrentPracticeId(remaining[0].id);
    }
  };

  const handleApplyPracticeTemplate = (templateName: string) => {
    if (!practiceTemplates[templateName]) return;
    if (
      confirm(
        `Apply template "${templateName}"? This will replace current practice periods.`
      )
    ) {
      setPracticeData((prev) =>
        prev.map((p) =>
          p.id === currentPracticeId
            ? {
                ...p,
                plan: deepClone(practiceTemplates[templateName]),
              }
            : p
        )
      );
    }
  };

  const handleSaveCurrentAsTemplate = () => {
    const cur = practiceData.find((p) => p.id === currentPracticeId);
    if (!cur || !cur.plan?.length) {
      alert('No practice periods to save.');
      return;
    }
    const name = prompt('Enter a name for this practice template:');
    if (name && name.trim()) {
      setPracticeTemplates((prev) => ({
        ...prev,
        [name.trim()]: deepClone(cur.plan),
      }));
      alert(`Template "${name.trim()}" saved!`);
    }
  };

  const handleUpdatePracticeMeta = (
    field: keyof PracticePlan,
    value: any
  ) => {
    setPracticeData((prev) =>
      prev.map((p) =>
        p.id === currentPracticeId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleAddPeriod = () => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const defaultCat =
            cascadingDrills[0]?.name || '⚡ (Warm-up, Agility and Conditioning)';
          return {
            ...p,
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
                    coach: 'Coach Danny',
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
      setPracticeData((prev) =>
        prev.map((p) => {
          if (p.id === currentPracticeId) {
            const plan = [...p.plan];
            plan.splice(pIdx, 1);
            return { ...p, plan };
          }
          return p;
        })
      );
    }
  };

  const handleMovePeriod = (pIdx: number, direction: number) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          const newIdx = pIdx + direction;
          if (newIdx < 0 || newIdx >= plan.length) return p;
          const [moved] = plan.splice(pIdx, 1);
          plan.splice(newIdx, 0, moved);
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodTime = (pIdx: number, time: number) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], time };
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodCategory = (pIdx: number, category: string) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], category };
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleUpdatePeriodFormat = (
    pIdx: number,
    format: 'static' | 'rotating'
  ) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          plan[pIdx] = { ...plan[pIdx], format };
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleAddStationToPeriod = (pIdx: number) => {
    setPracticeData((prev) =>
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
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleRemoveStationFromPeriod = (pIdx: number, sIdx: number) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          if (plan[pIdx].stations.length <= 1) {
            alert('Period must have at least one station.');
            return p;
          }
          const stations = [...plan[pIdx].stations];
          stations.splice(sIdx, 1);
          plan[pIdx] = { ...plan[pIdx], stations };
          return { ...p, plan };
        }
        return p;
      })
    );
  };

  const handleUpdateStation = (
    pIdx: number,
    sIdx: number,
    field: keyof PracticeStation,
    value: string
  ) => {
    setPracticeData((prev) =>
      prev.map((p) => {
        if (p.id === currentPracticeId) {
          const plan = [...p.plan];
          const stations = [...plan[pIdx].stations];
          stations[sIdx] = { ...stations[sIdx], [field]: value };
          plan[pIdx] = { ...plan[pIdx], stations };
          return { ...p, plan };
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
    setPracticeData((prev) =>
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
          return { ...p, plan };
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

  const handleAddTopDrillFolder = () => {
    const name = prompt('Enter new Top-Level Folder Name (e.g. Special Teams):');
    if (name && name.trim()) {
      setCascadingDrills((prev) => [
        ...prev,
        { name: name.trim(), subfolders: [], drills: [] },
      ]);
    }
  };

  const handleAddSubfolder = (pathKey: string) => {
    const name = prompt('Enter Subfolder Name:');
    if (name && name.trim()) {
      const updated = deepClone(cascadingDrills);
      const target = findFolderByPath(updated, pathKey);
      if (target) {
        if (!target.subfolders) target.subfolders = [];
        target.subfolders.push({
          name: name.trim(),
          subfolders: [],
          drills: [],
        });
        setCascadingDrills(updated);
      }
    }
  };

  const handleAddDrill = (pathKey: string) => {
    const updated = deepClone(cascadingDrills);
    const target = findFolderByPath(updated, pathKey);
    if (target) {
      if (!target.drills) target.drills = [];
      target.drills.push({
        name: 'New Drill',
        desc: 'Instructions and setup...',
        key: 'Coaching key...',
      });
      setCascadingDrills(updated);
    }
  };

  const handleRenameDrillFolder = (pathKey: string) => {
    const updated = deepClone(cascadingDrills);
    const target = findFolderByPath(updated, pathKey);
    if (target) {
      const newName = prompt('Rename Folder:', target.name);
      if (newName && newName.trim()) {
        target.name = newName.trim();
        setCascadingDrills(updated);
      }
    }
  };

  const handleDeleteDrillFolder = (pathKey: string) => {
    if (!confirm('Delete this folder and all its drills?')) return;
    const parts = pathKey.split('_');
    const idx = parseInt(parts.pop()!, 10);
    const parentPath = parts.join('_');

    const updated = deepClone(cascadingDrills);
    if (parentPath === '') {
      updated.splice(idx, 1);
    } else {
      const parent = findFolderByPath(updated, parentPath);
      if (parent && parent.subfolders) {
        parent.subfolders.splice(idx, 1);
      }
    }
    setCascadingDrills(updated);
  };

  const handleMoveDrillFolder = (pathKey: string, direction: number) => {
    const parts = pathKey.split('_');
    const idx = parseInt(parts.pop()!, 10);
    const parentPath = parts.join('_');

    const updated = deepClone(cascadingDrills);
    let list = updated;
    if (parentPath !== '') {
      const parent = findFolderByPath(updated, parentPath);
      if (parent && parent.subfolders) list = parent.subfolders;
    }

    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= list.length) return;
    const [moved] = list.splice(idx, 1);
    list.splice(newIdx, 0, moved);
    setCascadingDrills(updated);
  };

  const handleUpdateDrill = (
    pathKey: string,
    drillIdx: number,
    field: keyof DrillItem,
    value: string
  ) => {
    const updated = deepClone(cascadingDrills);
    const target = findFolderByPath(updated, pathKey);
    if (target && target.drills?.[drillIdx]) {
      target.drills[drillIdx][field] = value;
      setCascadingDrills(updated);
    }
  };

  const handleDeleteDrill = (pathKey: string, drillIdx: number) => {
    if (confirm('Delete this drill?')) {
      const updated = deepClone(cascadingDrills);
      const target = findFolderByPath(updated, pathKey);
      if (target && target.drills) {
        target.drills.splice(drillIdx, 1);
        setCascadingDrills(updated);
      }
    }
  };

  const handleMoveDrillToFolder = (
    sourcePath: string,
    drillIdx: number,
    targetPath: string
  ) => {
    if (sourcePath === targetPath) return;
    const updated = deepClone(cascadingDrills);
    const source = findFolderByPath(updated, sourcePath);
    const target = findFolderByPath(updated, targetPath);

    if (source && target && source.drills?.[drillIdx]) {
      const [movedDrill] = source.drills.splice(drillIdx, 1);
      if (!target.drills) target.drills = [];
      target.drills.push(movedDrill);
      setCascadingDrills(updated);
    }
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
            name: drillName,
            desc: drillDesc,
            key: drillKey,
          });
        }

        if (newTree.length > 0) {
          setCascadingDrills(newTree);
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
          setCascadingDrills(parsed);
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
  const handleUploadGuideDocument = (
    main: string,
    sub: string,
    file: File
  ) => {
    const { storage } = getFirebaseServices();
    if (storage) {
      const storageRef = storage.ref(`playbook_guides/${Date.now()}_${file.name}`);
      storageRef
        .put(file)
        .then((snapshot: any) => snapshot.ref.getDownloadURL())
        .then((downloadUrl: string) => {
          setGuideTree((prev) => ({
            ...prev,
            [main]: {
              ...(prev[main] || {}),
              [sub]: downloadUrl,
            },
          }));
          alert('Document uploaded and live in cloud storage!');
        })
        .catch((err: any) => {
          console.warn('Storage upload error, falling back to local data URL:', err);
          const localUrl = URL.createObjectURL(file);
          setGuideTree((prev) => ({
            ...prev,
            [main]: {
              ...(prev[main] || {}),
              [sub]: localUrl,
            },
          }));
        });
    } else {
      const localUrl = URL.createObjectURL(file);
      setGuideTree((prev) => ({
        ...prev,
        [main]: {
          ...(prev[main] || {}),
          [sub]: localUrl,
        },
      }));
    }
  };

  /* =========================================================================
     BACKUP & IMPORT FULL APPLICATION STATE
     ========================================================================= */
  const handleExportFullBackup = () => {
    const fullBackup = {
      weeklyData,
      defaultFormations,
      practiceData,
      practiceTemplates,
      cascadingDrills,
      guideTree,
      guideOrder,
      savedCoaches,
      staffList,
      masterPlayLibrary,
      collapsedFolders,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(safeJSONStringify(fullBackup, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `mahopac10u_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const applyImportDataObject = (parsed: any) => {
    try {
      isImportingRef.current = true;

      const importedWeekly = parsed.weeklyData || (parsed['0'] && parsed['0'].depthChart ? parsed : null);
      const importedDefaults = parsed.defaultFormations || null;
      const importedPractice = parsed.practiceData || null;
      const importedTemplates = parsed.practiceTemplates || null;
      const importedDrills = parsed.cascadingDrills || null;
      const importedGuideTree = parsed.guideTree || parsed.pdfGuidesTree || null;
      const importedGuideOrder = parsed.guideOrder || parsed.pdfGuidesOrder || null;
      const importedSavedCoaches = parsed.savedCoaches || parsed.savedCoachesList || null;
      const importedStaffList = parsed.staffList || parsed.teamCoachesList || null;
      const importedPlays = parsed.masterPlayLibrary || null;
      const importedCollapsed = parsed.collapsedFolders || {};

      if (importedWeekly) {
        setWeeklyData(importedWeekly);
        safeJSONSet('footballWeeklyData', importedWeekly);
      }
      if (importedDefaults) {
        setDefaultFormations(importedDefaults);
        safeJSONSet('footballDefaultFormations', importedDefaults);
      }
      if (importedPractice) {
        setPracticeData(importedPractice);
        safeJSONSet('footballPracticeData', importedPractice);
      }
      if (importedTemplates) {
        setPracticeTemplates(importedTemplates);
        safeJSONSet('footballPracticeTemplates', importedTemplates);
      }
      if (importedDrills) {
        setCascadingDrills(importedDrills);
        safeJSONSet('footballCascadingDrills', importedDrills);
      }
      if (importedGuideTree) {
        setGuideTree(importedGuideTree);
        safeJSONSet('footballPdfGuidesTree', importedGuideTree);
      }
      if (importedGuideOrder) {
        setGuideOrder(importedGuideOrder);
        safeJSONSet('footballPdfGuidesOrder', importedGuideOrder);
      }
      if (importedSavedCoaches) {
        setSavedCoaches(importedSavedCoaches);
        safeJSONSet('footballSavedCoaches', importedSavedCoaches);
      }
      if (importedStaffList) {
        setStaffList(importedStaffList);
        safeJSONSet('footballTeamCoaches', importedStaffList);
      }
      if (importedPlays) {
        setMasterPlayLibrary(importedPlays);
        safeJSONSet('footballMasterPlays', importedPlays);
      }
      if (importedCollapsed) {
        setCollapsedFolders(importedCollapsed);
        safeJSONSet('footballCollapsedFolders', importedCollapsed);
      }

      // Direct synchronous push to Cloud Firestore
      const { db } = getFirebaseServices();
      if (db) {
        setSyncStatus({ text: '☁️ Uploading Backup to Cloud...', color: '#f59e0b' });
        const payload = deepClone({
          weeklyData: importedWeekly || weeklyData,
          defaultFormations: importedDefaults || defaultFormations,
          practiceData: importedPractice || practiceData,
          practiceTemplates: importedTemplates || practiceTemplates,
          cascadingDrills: importedDrills || cascadingDrills,
          guideTree: importedGuideTree || guideTree,
          guideOrder: importedGuideOrder || guideOrder,
          savedCoaches: importedSavedCoaches || savedCoaches,
          staffList: importedStaffList || staffList,
          masterPlayLibrary: importedPlays || masterPlayLibrary,
          collapsedFolders: importedCollapsed,
        });

        db.collection('teamData')
          .doc('depthChartData')
          .set(
            {
              ...payload,
              updatedAt: window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
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

      alert('Complete team backup imported and saved to cloud successfully!');
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
  const handleExecuteCopyWeek = (srcWeek: string, targetWeek: string) => {
    ensureWeekExists(srcWeek);
    ensureWeekExists(targetWeek);

    const src = weeklyData[srcWeek] || {
      formations: defaultFormations,
      depthChart: {},
      scrimmageChart: {},
    };

    setWeeklyData((prev) => ({
      ...prev,
      [targetWeek]: {
        ...prev[targetWeek],
        formations: deepClone(src.formations || defaultFormations),
        depthChart: deepClone(src.depthChart || {}),
        scrimmageChart: deepClone(src.scrimmageChart || {}),
      },
    }));

    setCurrentWeek(targetWeek);
    alert(
      `Successfully copied all formations and starter/sub depth chart assignments from Week ${srcWeek} to Week ${targetWeek}!`
    );
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
          setWeeklyData((prev) => ({
            ...prev,
            [currentWeek]: {
              ...prev[currentWeek],
              opponent: opp,
            },
          }));
        }}
        userEmail={currentUser?.email || 'Head Coach Danny'}
        userRole={userRole}
        onRoleChange={setUserRole}
        syncStatus={syncStatus}
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
      />

      {/* Sticky Unit Navigation Tabs */}
      <NavigationTabs
        activeUnit={activeUnit}
        onSelectUnit={setActiveUnit}
        userRole={userRole}
      />

      {/* Main Layout Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Board / Panel Column */}
          <div className="flex-1 min-w-0 w-full">
            {/* 1. Formations View (Offense, Defense, Special Teams, Depth Chart Groups) */}
            {['offense', 'defense', 'st', 'groups'].includes(activeUnit) && (
              <FormationsView
                unit={activeUnit as 'offense' | 'defense' | 'st' | 'groups'}
                formations={currentFormations}
                depthChart={currentDepthChart}
                selectedFormationId={selectedFormationId}
                onSelectFormation={setSelectedFormationId}
                userRole={userRole}
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
                onDragStartPlacedPlayer={handleDragStartPlacedPlayer}
                onPositionCardDragStart={handlePositionCardDragStart}
                onPositionCardDropOnSlot={handlePositionCardDropOnSlot}
              />
            )}

            {/* 2. Practice / Scrimmage Rotation */}
            {activeUnit === 'scrimmage' && (
              <ScrimmageView
                formations={currentFormations}
                scrimmageChart={currentScrimmageChart}
                scrimmageFilters={scrimmageFilters}
                userRole={userRole}
                onOpenScrimmageFilterModal={() =>
                  setIsScrimmageFilterOpen(true)
                }
                onOpenScrimmagePrintModal={() => window.print()}
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
                onUpdateScouting={(field, val) => {
                  setWeeklyData((prev) => ({
                    ...prev,
                    [currentWeek]: {
                      ...prev[currentWeek],
                      scouting: {
                        ...(prev[currentWeek]?.scouting || {}),
                        [field]: val,
                      },
                    },
                  }));
                }}
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
                onAddMainFolder={(name) => {
                  setGuideTree((prev) => ({ ...prev, [name]: { 'Full Playbook': '' } }));
                  setGuideOrder((prev) => ({
                    main: [...prev.main, name],
                    sub: { ...prev.sub, [name]: ['Full Playbook'] },
                  }));
                  setActiveGuideMain(name);
                  setActiveGuideSub('Full Playbook');
                }}
                onAddSubTab={(main, name) => {
                  setGuideTree((prev) => ({
                    ...prev,
                    [main]: { ...(prev[main] || {}), [name]: '' },
                  }));
                  setGuideOrder((prev) => ({
                    ...prev,
                    sub: {
                      ...prev.sub,
                      [main]: [...(prev.sub[main] || []), name],
                    },
                  }));
                  setActiveGuideSub(name);
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
                  if (activeGuideMain === oldName) setActiveGuideMain(newName);
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
                  if (activeGuideSub === oldName) setActiveGuideSub(newName);
                }}
                onDeleteMainFolder={(name) => {
                  const updatedTree = { ...guideTree };
                  delete updatedTree[name];
                  setGuideTree(updatedTree);

                  const updatedOrder = { ...guideOrder };
                  updatedOrder.main = updatedOrder.main.filter((m) => m !== name);
                  delete updatedOrder.sub[name];
                  setGuideOrder(updatedOrder);

                  if (activeGuideMain === name) {
                    setActiveGuideMain(updatedOrder.main[0] || 'Offense');
                    setActiveGuideSub(
                      updatedOrder.sub[updatedOrder.main[0]]?.[0] || ''
                    );
                  }
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
                }}
                onMoveMainFolder={(name, direction) => {
                  const idx = guideOrder.main.indexOf(name);
                  if (idx === -1) return;
                  const newIdx = idx + direction;
                  if (newIdx < 0 || newIdx >= guideOrder.main.length) return;
                  const list = [...guideOrder.main];
                  const [moved] = list.splice(idx, 1);
                  list.splice(newIdx, 0, moved);
                  setGuideOrder({ ...guideOrder, main: list });
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
                  setGuideOrder({
                    ...guideOrder,
                    sub: { ...guideOrder.sub, [main]: list },
                  });
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
                    setCascadingDrills(DEFAULT_CASCADING_DRILLS);
                  }
                }}
              />
            )}

            {/* 7. Practice Plan Generator */}
            {activeUnit === 'practice' && (
              <PracticePlanView
                practices={practiceData}
                currentPracticeId={currentPracticeId}
                practiceTemplates={practiceTemplates}
                cascadingDrills={cascadingDrills}
                savedCoaches={savedCoaches}
                printFontSize={printFontSize}
                userRole={userRole}
                onSelectPractice={setCurrentPracticeId}
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
                onAddNewSavedCoach={(name) => {
                  if (!savedCoaches.includes(name)) {
                    setSavedCoaches((prev) => [...prev, name].sort());
                  }
                }}
                onDeleteSavedCoach={(name) => {
                  setSavedCoaches((prev) => prev.filter((c) => c !== name));
                }}
              />
            )}

            {/* 8. Staff & User Management */}
            {activeUnit === 'users' && userRole === 'admin' && (
              <StaffManagerView
                staffList={staffList}
                savedCoaches={savedCoaches}
                userRole={userRole}
                onAddStaffCoach={(email) => {
                  if (
                    staffList.some(
                      (c) => c.email.toLowerCase() === email.toLowerCase()
                    )
                  ) {
                    alert('Coach email already in staff list.');
                    return;
                  }
                  setStaffList((prev) => [
                    ...prev,
                    { email, role: 'Assistant Coach', status: 'Active' },
                  ]);
                }}
                onUpdateStaffRole={(idx, role) => {
                  setStaffList((prev) => {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], role };
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
                    return updated;
                  });
                }}
                onRemoveStaffCoach={(idx) => {
                  if (
                    staffList[idx].email.toLowerCase() ===
                    'dannym1010@gmail.com'
                  ) {
                    alert('Cannot remove Master Admin.');
                    return;
                  }
                  if (confirm(`Remove ${staffList[idx].email}?`)) {
                    setStaffList((prev) => prev.filter((_, i) => i !== idx));
                  }
                }}
                onAddNewSavedCoach={(name) => {
                  if (!savedCoaches.includes(name)) {
                    setSavedCoaches((prev) => [...prev, name].sort());
                  }
                }}
                onDeleteSavedCoach={(name) => {
                  setSavedCoaches((prev) => prev.filter((c) => c !== name));
                }}
              />
            )}
          </div>

          {/* Master Roster Sidebar (Shown on Depth Charts, Scrimmage, Wristband) */}
          {!['drills', 'scouting', 'guide', 'practice', 'users'].includes(
            activeUnit
          ) && (
            <RosterSidebar
              roster={MASTER_ROSTER}
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
            />
          )}
        </div>
      </main>

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
            setCurrentUser({ email: 'coach@google.com' });
            setIsAuthModalOpen(false);
            return;
          }
          const provider = new window.firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await auth.signInWithRedirect(provider);
        }}
        onBypassLogin={() => {
          setCurrentUser({ email: 'Head Coach (Offline)' });
          setIsAuthModalOpen(false);
          setIsPendingApproval(false);
          setUserRole('admin');
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
            // Temporarily mark non-selected boards as hidden during print
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

            const cleanup = () => {
              document
                .querySelectorAll('.formation-container')
                .forEach((card: any) => {
                  card.classList.remove('hidden-print');
                });
              window.removeEventListener('afterprint', cleanup);
            };

            window.addEventListener('afterprint', cleanup);
            setTimeout(() => {
              window.print();
              setTimeout(cleanup, 2500);
            }, 200);
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
            return updated;
          });
        }}
        onDeleteTemplate={(name) => {
          setPracticeTemplates((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        }}
      />

      <ImportBackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSelectFile={() => fileInputRef.current?.click()}
        onPasteImport={handlePasteImport}
      />
    </div>
  );
}
