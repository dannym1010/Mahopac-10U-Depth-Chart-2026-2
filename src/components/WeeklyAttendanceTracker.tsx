import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Plus,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Printer,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  Trash2,
  Edit2,
  Sliders,
  Award,
} from 'lucide-react';
import {
  RosterPlayer,
  UserRole,
  ScheduleEvent,
  SeasonConfig,
  AttendanceRecord,
  formatWeekLabel,
  calculatePlayerCompliance,
  CONDITIONING_HOURS_REQUIRED,
  PADDED_HOURS_REQUIRED,
} from '../types';
import { getSeasonWeekList, isDateInWeek } from '../utils/seasonWeekUtils';
import { triggerPrint } from '../utils/printUtils';

export interface WeeklyPracticeSession {
  id: string;
  scheduleEventId?: string;
  date: string;
  dayOfWeek: string;
  title: string;
  timeStr: string;
  hours: number;
  sessionType: 'conditioning' | 'padded';
  location?: string;
  notes?: string;
}

interface WeeklyAttendanceTrackerProps {
  roster: RosterPlayer[];
  userRole: UserRole;
  currentWeek: string;
  scheduleEvents?: ScheduleEvent[];
  seasonConfig?: SeasonConfig;
  attendanceLogs?: AttendanceRecord[];
  onUpdateRoster: (updatedRoster: RosterPlayer[]) => void;
  onUpdateAttendanceLogs?: (logs: AttendanceRecord[]) => void;
  onAddScheduleEvent?: (event: ScheduleEvent) => void;
  onUpdateScheduleEvent?: (event: ScheduleEvent) => void;
  onDeleteScheduleEvent?: (id: string) => void;
}

// Helper to format date into readable day and date: e.g. "Tue 8/25"
function formatShortDate(dateStr: string): { dayName: string; shortDate: string } {
  if (!dateStr) return { dayName: 'TBD', shortDate: '' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dt = new Date(year, month, day, 12, 0, 0);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
      const shortDate = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      return { dayName, shortDate };
    }
    const d = new Date(dateStr + 'T12:00:00');
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      shortDate: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    };
  } catch {
    return { dayName: 'Practice', shortDate: dateStr };
  }
}

// Helper to parse practice duration (e.g. 2.0, 2.5) from schedule event
function parseScheduleDurationHours(evt: ScheduleEvent): number {
  if (evt.durationMinutes && evt.durationMinutes > 0) {
    return Math.round((evt.durationMinutes / 60) * 10) / 10;
  }
  if (evt.startTime && evt.endTime) {
    try {
      const parseMinutes = (timeStr: string): number => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!match) return 0;
        let hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        const meridiem = (match[3] || '').toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return hours * 60 + mins;
      };

      const startMins = parseMinutes(evt.startTime);
      const endMins = parseMinutes(evt.endTime);
      if (endMins > startMins) {
        const diffMins = endMins - startMins;
        return Math.round((diffMins / 60) * 10) / 10;
      }
    } catch {
      // fallback
    }
  }
  return 2.0; // standard default
}

export const WeeklyAttendanceTracker: React.FC<WeeklyAttendanceTrackerProps> = ({
  roster,
  userRole,
  currentWeek,
  scheduleEvents = [],
  seasonConfig,
  attendanceLogs = [],
  onUpdateRoster,
  onUpdateAttendanceLogs,
  onAddScheduleEvent,
  onUpdateScheduleEvent,
  onDeleteScheduleEvent,
}) => {
  // Selected week for weekly tracking
  const [selectedWeek, setSelectedWeek] = useState<string>(currentWeek || '0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_conditioning' | 'needs_pads' | 'cleared'>('all');
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  const [showAddPracticeModal, setShowAddPracticeModal] = useState<boolean>(false);
  const [showSeasonSummaryModal, setShowSeasonSummaryModal] = useState<boolean>(false);

  // New Practice Modal Form state
  const [newPracticeDate, setNewPracticeDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newPracticeTitle, setNewPracticeTitle] = useState<string>('Practice Session');
  const [newPracticeTime, setNewPracticeTime] = useState<string>('5:30 PM - 7:30 PM');
  const [newPracticeHours, setNewPracticeHours] = useState<number>(2.0);
  const [newPracticeType, setNewPracticeType] = useState<'conditioning' | 'padded'>('conditioning');

  // Week list from config
  const weekList = useMemo(() => getSeasonWeekList(seasonConfig), [seasonConfig]);
  const currentWeekOption = useMemo(
    () => weekList.find((w) => w.key === selectedWeek) || weekList[0],
    [weekList, selectedWeek]
  );

  // Check if current week is pre-season
  const isPreSeason = useMemo(() => {
    return (
      selectedWeek === '0' ||
      selectedWeek.startsWith('pre-') ||
      currentWeekOption?.phase === 'preseason'
    );
  }, [selectedWeek, currentWeekOption]);

  // Flash auto-save indicator
  const triggerSaveToast = (msg: string) => {
    setSaveIndicator(msg);
    setTimeout(() => setSaveIndicator(null), 2500);
  };

  // Compile unified practice sessions for the selected week from scheduleEvents and attendanceLogs
  const weekSessions = useMemo<WeeklyPracticeSession[]>(() => {
    const sessionsMap = new Map<string, WeeklyPracticeSession>();

    // 1. From Schedule Events: filter practices/scrimmages for selectedWeek
    scheduleEvents
      .filter((e) => {
        if (!e || e.isCancelled) return false;
        const isPracticeType = e.type === 'practice' || e.type === 'scrimmage' || e.type === 'walkthrough';
        if (!isPracticeType) return false;
        
        // Exact Monday-to-Sunday date range match
        if (e.date && isDateInWeek(e.date, selectedWeek)) return true;

        // Fallback to week key matching
        const evWeek = (e.week || '').replace(/^Week\s+/i, '').trim().toLowerCase();
        const curWeek = selectedWeek.replace(/^Week\s+/i, '').trim().toLowerCase();
        if (evWeek === curWeek) return true;
        return false;
      })
      .forEach((evt) => {
        const hours = parseScheduleDurationHours(evt);
        const { dayName, shortDate } = formatShortDate(evt.date);
        const isCond =
          evt.title?.toLowerCase().includes('cond') ||
          evt.focusOrNotes?.toLowerCase().includes('cond') ||
          (isPreSeason && !evt.title?.toLowerCase().includes('pad'));

        sessionsMap.set(evt.id, {
          id: evt.id,
          scheduleEventId: evt.id,
          date: evt.date,
          dayOfWeek: dayName,
          title: evt.title || `Practice (${shortDate})`,
          timeStr: evt.startTime && evt.endTime ? `${evt.startTime} - ${evt.endTime}` : evt.time || '5:30 PM',
          hours,
          sessionType: isCond ? 'conditioning' : 'padded',
          location: evt.location,
          notes: evt.focusOrNotes,
        });
      });

    // 2. From Attendance Logs: enrich existing scheduled sessions with logged metadata
    attendanceLogs
      .filter((log) => {
        if (!log) return false;
        if (log.date && isDateInWeek(log.date, selectedWeek)) return true;
        const logWeek = (log.week || '').replace(/^Week\s+/i, '').trim().toLowerCase();
        const curWeek = selectedWeek.replace(/^Week\s+/i, '').trim().toLowerCase();
        if (logWeek === curWeek) return true;
        return false;
      })
      .forEach((log) => {
        const existingKey = Array.from(sessionsMap.keys()).find((k) => {
          const s = sessionsMap.get(k);
          return s && (s.id === log.id || s.scheduleEventId === log.scheduleEventId || s.date === log.date);
        });

        if (existingKey) {
          // Merge/update existing session with logged metadata
          const existing = sessionsMap.get(existingKey)!;
          sessionsMap.set(existingKey, {
            ...existing,
            hours: log.hours || existing.hours,
            sessionType: log.sessionType || existing.sessionType,
            title: log.title || existing.title,
          });
        }
      });

    // Sort chronologically by date
    return Array.from(sessionsMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [scheduleEvents, attendanceLogs, selectedWeek, isPreSeason]);

  // Attendance lookup: Map of `${sessionId}_${playerNum}` -> boolean (present)
  const attendanceLookup = useMemo(() => {
    const map = new Map<string, boolean>();

    weekSessions.forEach((session) => {
      // Find matching attendance record
      const record = attendanceLogs.find(
        (l) =>
          l.date === session.date ||
          l.id === session.id ||
          (session.scheduleEventId && l.scheduleEventId === session.scheduleEventId)
      );

      if (record) {
        const presentList = Array.isArray(record.presentPlayerNums)
          ? record.presentPlayerNums
          : [];
        presentList.forEach((num) => {
          map.set(`${session.id}_${num}`, true);
        });
      }
    });

    return map;
  }, [weekSessions, attendanceLogs]);

  // Recalculate roster hours based on attendance logs and direct changes
  const syncRosterHoursFromLogs = useCallback(
    (currentRoster: RosterPlayer[], updatedLogs: AttendanceRecord[]) => {
      return currentRoster.map((player) => {
        let newCondHours = 0;
        let newPaddedHours = 0;
        const newWeeklyHours: Record<string, number> = { ...(player.weeklyHours || {}) };

        // Recalculate this selected week hours cleanly from zero
        let activeWeekHours = 0;

        // Sum across all logs for this player
        updatedLogs.forEach((log) => {
          const isPresent = log.presentPlayerNums?.includes(player.num);
          if (isPresent) {
            const h = Number(log.hours || 0);
            if (log.sessionType === 'conditioning') {
              newCondHours += h;
            } else if (log.sessionType === 'padded') {
              newPaddedHours += h;
            }

            if (log.week === selectedWeek || (log.date && isDateInWeek(log.date, selectedWeek))) {
              activeWeekHours += h;
            } else if (log.week) {
              newWeeklyHours[log.week] = Math.round(((newWeeklyHours[log.week] || 0) + h) * 10) / 10;
            }
          }
        });

        newWeeklyHours[selectedWeek] = Math.round(activeWeekHours * 10) / 10;

        // Ensure we don't zero out historical pre-season base hours if baseline existed
        const baseCond = Math.max(newCondHours, Number(player.conditioningHours || 0));
        const basePadded = Math.max(newPaddedHours, Number(player.paddedHours || 0));

        return {
          ...player,
          conditioningHours: Math.round(baseCond * 10) / 10,
          paddedHours: Math.round(basePadded * 10) / 10,
          weeklyHours: newWeeklyHours,
        };
      });
    },
    [selectedWeek]
  );

  // Toggle single attendance checkmark for (session x player)
  const handleToggleAttendance = (session: WeeklyPracticeSession, playerNum: string) => {
    if (userRole !== 'admin') return;

    const isCurrentlyPresent = Boolean(attendanceLookup.get(`${session.id}_${playerNum}`));
    const willBePresent = !isCurrentlyPresent;

    // Find or create AttendanceRecord for this session
    let existingLog = attendanceLogs.find(
      (l) => l.date === session.date || l.id === session.id
    );

    let updatedLogs: AttendanceRecord[];

    if (existingLog) {
      const currentPresent = new Set(existingLog.presentPlayerNums || []);
      const currentAbsent = new Set(existingLog.absentPlayerNums || []);

      if (willBePresent) {
        currentPresent.add(playerNum);
        currentAbsent.delete(playerNum);
      } else {
        currentPresent.delete(playerNum);
        currentAbsent.add(playerNum);
      }

      const updatedRecord: AttendanceRecord = {
        ...existingLog,
        week: selectedWeek,
        hours: session.hours,
        sessionType: session.sessionType,
        presentPlayerNums: Array.from(currentPresent),
        absentPlayerNums: Array.from(currentAbsent),
        timestamp: Date.now(),
      };

      updatedLogs = attendanceLogs.map((l) =>
        l.id === existingLog!.id ? updatedRecord : l
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: session.id.startsWith('att_') ? session.id : `att_${Date.now()}_${session.date}`,
        date: session.date,
        week: selectedWeek,
        title: session.title,
        sessionType: session.sessionType,
        hours: session.hours,
        location: session.location || 'Crane Road',
        presentPlayerNums: willBePresent ? [playerNum] : [],
        absentPlayerNums: willBePresent ? [] : [playerNum],
        timestamp: Date.now(),
      };
      updatedLogs = [newRecord, ...attendanceLogs];
    }

    // Update Attendance Logs state
    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs(updatedLogs);
    }

    // Recalculate roster hours directly from attendance logs
    const updatedRoster = syncRosterHoursFromLogs(roster, updatedLogs);
    onUpdateRoster(updatedRoster);
    triggerSaveToast(`✓ Saved: #${playerNum} ${willBePresent ? 'Attended (+' + session.hours + 'h)' : 'Absent'}`);
  };

  // Mark all players present for a practice column
  const handleCheckAllForSession = (session: WeeklyPracticeSession) => {
    if (userRole !== 'admin') return;

    const allNums = roster.map((p) => p.num);
    let existingLog = attendanceLogs.find(
      (l) => l.date === session.date || l.id === session.id || (session.scheduleEventId && l.scheduleEventId === session.scheduleEventId)
    );

    let updatedLogs: AttendanceRecord[];
    if (existingLog) {
      updatedLogs = attendanceLogs.map((l) =>
        l.id === existingLog!.id
          ? {
              ...l,
              week: selectedWeek,
              hours: session.hours,
              sessionType: session.sessionType,
              presentPlayerNums: allNums,
              absentPlayerNums: [],
              timestamp: Date.now(),
            }
          : l
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: session.id.startsWith('att_') ? session.id : `att_${Date.now()}_${session.date}`,
        date: session.date,
        week: selectedWeek,
        title: session.title,
        sessionType: session.sessionType,
        hours: session.hours,
        location: session.location || 'Crane Road',
        presentPlayerNums: allNums,
        absentPlayerNums: [],
        timestamp: Date.now(),
      };
      updatedLogs = [newRecord, ...attendanceLogs];
    }

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs(updatedLogs);
    }

    const updatedRoster = syncRosterHoursFromLogs(roster, updatedLogs);
    onUpdateRoster(updatedRoster);
    triggerSaveToast(`✓ All ${roster.length} players marked present for ${session.title} (${session.hours}h credited)`);
  };

  // Clear all checks for a practice column
  const handleClearAllForSession = (session: WeeklyPracticeSession) => {
    if (userRole !== 'admin') return;

    const allNums = roster.map((p) => p.num);
    let existingLog = attendanceLogs.find(
      (l) => l.date === session.date || l.id === session.id || (session.scheduleEventId && l.scheduleEventId === session.scheduleEventId)
    );

    let updatedLogs: AttendanceRecord[];
    if (existingLog) {
      updatedLogs = attendanceLogs.map((l) =>
        l.id === existingLog!.id
          ? {
              ...l,
              presentPlayerNums: [],
              absentPlayerNums: allNums,
              timestamp: Date.now(),
            }
          : l
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: session.id.startsWith('att_') ? session.id : `att_${Date.now()}_${session.date}`,
        date: session.date,
        week: selectedWeek,
        title: session.title,
        sessionType: session.sessionType,
        hours: session.hours,
        location: session.location || 'Crane Road',
        presentPlayerNums: [],
        absentPlayerNums: allNums,
        timestamp: Date.now(),
      };
      updatedLogs = [newRecord, ...attendanceLogs];
    }

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs(updatedLogs);
    }

    const updatedRoster = syncRosterHoursFromLogs(roster, updatedLogs);
    onUpdateRoster(updatedRoster);
    triggerSaveToast(`✕ Cleared attendance for ${session.title}`);
  };

  // Quick toggle practice duration (e.g. 2.0h -> 2.5h) for a session
  const handleChangeSessionHours = (session: WeeklyPracticeSession, newHours: number) => {
    if (userRole !== 'admin' || newHours === session.hours) return;

    const oldHours = session.hours;
    const diff = newHours - oldHours;

    // Update attendance log
    let existingLog = attendanceLogs.find(
      (l) => l.date === session.date || l.id === session.id
    );

    let updatedLogs: AttendanceRecord[];
    if (existingLog) {
      updatedLogs = attendanceLogs.map((l) =>
        l.id === existingLog!.id ? { ...l, hours: newHours } : l
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: session.id.startsWith('att_') ? session.id : `att_${Date.now()}_${session.date}`,
        date: session.date,
        week: selectedWeek,
        title: session.title,
        sessionType: session.sessionType,
        hours: newHours,
        presentPlayerNums: [],
        absentPlayerNums: [],
        timestamp: Date.now(),
      };
      updatedLogs = [newRecord, ...attendanceLogs];
    }

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs(updatedLogs);
    }

    // Update matching schedule event duration if present
    if (session.scheduleEventId && onUpdateScheduleEvent) {
      const evt = scheduleEvents.find((e) => e.id === session.scheduleEventId);
      if (evt) {
        onUpdateScheduleEvent({
          ...evt,
          durationMinutes: Math.round(newHours * 60),
        });
      }
    }

    // Adjust roster hours for all players who are marked present
    const updatedRoster = roster.map((p) => {
      const isPresent = Boolean(attendanceLookup.get(`${session.id}_${p.num}`));
      if (!isPresent) return p;

      const currentWeekly = { ...(p.weeklyHours || {}) };
      const currentVal = Number(currentWeekly[selectedWeek] || 0);
      currentWeekly[selectedWeek] = Math.max(0, Math.round((currentVal + diff) * 10) / 10);

      let newCond = Number(p.conditioningHours || 0);
      let newPadded = Number(p.paddedHours || 0);
      if (session.sessionType === 'conditioning') {
        newCond = Math.max(0, Math.round((newCond + diff) * 10) / 10);
      } else {
        newPadded = Math.max(0, Math.round((newPadded + diff) * 10) / 10);
      }

      return {
        ...p,
        weeklyHours: currentWeekly,
        conditioningHours: newCond,
        paddedHours: newPadded,
      };
    });

    onUpdateRoster(updatedRoster);
    triggerSaveToast(`✓ Updated practice duration to ${newHours}h`);
  };

  // Toggle session attire: Conditioning vs Padded
  const handleToggleSessionAttire = (session: WeeklyPracticeSession) => {
    if (userRole !== 'admin') return;

    const newType: 'conditioning' | 'padded' =
      session.sessionType === 'conditioning' ? 'padded' : 'conditioning';

    let existingLog = attendanceLogs.find(
      (l) => l.date === session.date || l.id === session.id
    );

    let updatedLogs: AttendanceRecord[];
    if (existingLog) {
      updatedLogs = attendanceLogs.map((l) =>
        l.id === existingLog!.id ? { ...l, sessionType: newType } : l
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: session.id.startsWith('att_') ? session.id : `att_${Date.now()}_${session.date}`,
        date: session.date,
        week: selectedWeek,
        title: session.title,
        sessionType: newType,
        hours: session.hours,
        presentPlayerNums: [],
        absentPlayerNums: [],
        timestamp: Date.now(),
      };
      updatedLogs = [newRecord, ...attendanceLogs];
    }

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs(updatedLogs);
    }

    // Re-attribute hours in roster for players present
    const updatedRoster = roster.map((p) => {
      const isPresent = Boolean(attendanceLookup.get(`${session.id}_${p.num}`));
      if (!isPresent) return p;

      let newCond = Number(p.conditioningHours || 0);
      let newPadded = Number(p.paddedHours || 0);

      if (newType === 'padded') {
        // Shifted from conditioning to padded
        newCond = Math.max(0, Math.round((newCond - session.hours) * 10) / 10);
        newPadded = Math.round((newPadded + session.hours) * 10) / 10;
      } else {
        // Shifted from padded to conditioning
        newPadded = Math.max(0, Math.round((newPadded - session.hours) * 10) / 10);
        newCond = Math.round((newCond + session.hours) * 10) / 10;
      }

      return {
        ...p,
        conditioningHours: newCond,
        paddedHours: newPadded,
      };
    });

    onUpdateRoster(updatedRoster);
    triggerSaveToast(`✓ Switched category to ${newType === 'conditioning' ? '⚡ Conditioning' : '🛡️ Padded'}`);
  };

  // Add a new scheduled practice session for this week
  const handleAddNewPracticeSession = () => {
    if (userRole !== 'admin') return;

    const newSessionId = `evt_prac_${Date.now()}`;
    const newLogId = `att_${Date.now()}`;

    // Add to schedule events if handler available
    if (onAddScheduleEvent) {
      const newEvent: ScheduleEvent = {
        id: newSessionId,
        teamId: 'team_10u',
        type: 'practice',
        title: newPracticeTitle || 'Practice Session',
        week: selectedWeek,
        date: newPracticeDate,
        startTime: newPracticeTime.split('-')[0]?.trim() || '5:30 PM',
        endTime: newPracticeTime.split('-')[1]?.trim() || '7:30 PM',
        durationMinutes: Math.round(newPracticeHours * 60),
        location: 'Crane Road Field',
        focusOrNotes: `${newPracticeType === 'conditioning' ? 'Conditioning Acclimatization' : 'Full Pads Practice'} (${newPracticeHours}h)`,
        createdAt: Date.now(),
        lastEdited: Date.now(),
      };
      onAddScheduleEvent(newEvent);
    }

    // Add corresponding attendance record
    const newRecord: AttendanceRecord = {
      id: newLogId,
      scheduleEventId: newSessionId,
      date: newPracticeDate,
      week: selectedWeek,
      title: newPracticeTitle || 'Practice Session',
      sessionType: newPracticeType,
      hours: newPracticeHours,
      location: 'Crane Road Field',
      presentPlayerNums: [],
      absentPlayerNums: [],
      timestamp: Date.now(),
    };

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs([newRecord, ...attendanceLogs]);
    }

    setShowAddPracticeModal(false);
    triggerSaveToast(`✓ Added Practice on ${newPracticeDate} (${newPracticeHours}h)`);
  };

  // Auto-generate 3 standard practice sessions for this week
  const handleAutoGenerateStandardWeek = () => {
    if (userRole !== 'admin') return;

    // Generate dates for Tue (2.0h), Thu (2.0h), Sat (2.5h) based on current date or week
    const now = new Date();
    // find upcoming or current Tuesday
    const getNextDayOfWeek = (date: Date, dayOfWeek: number) => {
      const resultDate = new Date(date.getTime());
      resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7));
      return resultDate;
    };

    const tue = getNextDayOfWeek(now, 2);
    const thu = new Date(tue.getTime() + 2 * 24 * 60 * 60 * 1000);
    const sat = new Date(tue.getTime() + 4 * 24 * 60 * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const defaultSessions = [
      {
        date: toIso(tue),
        title: isPreSeason ? 'Pre-Season Conditioning & Stances' : 'Offense Install & Team Run',
        time: '5:30 PM - 7:30 PM',
        hours: 2.0,
        type: (isPreSeason ? 'conditioning' : 'padded') as 'conditioning' | 'padded',
      },
      {
        date: toIso(thu),
        title: isPreSeason ? 'Conditioning, Agility & Pursuit' : 'Defense Fit, Blitz & 7-on-7',
        time: '5:30 PM - 7:30 PM',
        hours: 2.0,
        type: (isPreSeason ? 'conditioning' : 'padded') as 'conditioning' | 'padded',
      },
      {
        date: toIso(sat),
        title: isPreSeason ? 'Comprehensive Team Conditioning & Pads' : 'Game Situational Scrimmage & ST',
        time: '9:00 AM - 11:30 AM',
        hours: 2.5,
        type: 'padded' as 'conditioning' | 'padded',
      },
    ];

    const newLogs: AttendanceRecord[] = [];

    defaultSessions.forEach((s, idx) => {
      const sId = `evt_auto_${Date.now()}_${idx}`;
      if (onAddScheduleEvent) {
        onAddScheduleEvent({
          id: sId,
          teamId: 'team_10u',
          type: 'practice',
          title: s.title,
          week: selectedWeek,
          date: s.date,
          startTime: s.time.split('-')[0]?.trim() || '5:30 PM',
          endTime: s.time.split('-')[1]?.trim() || '7:30 PM',
          durationMinutes: Math.round(s.hours * 60),
          location: 'Crane Road Field',
          createdAt: Date.now(),
          lastEdited: Date.now(),
        });
      }

      newLogs.push({
        id: `att_auto_${Date.now()}_${idx}`,
        scheduleEventId: sId,
        date: s.date,
        week: selectedWeek,
        title: s.title,
        sessionType: s.type,
        hours: s.hours,
        location: 'Crane Road Field',
        presentPlayerNums: [],
        absentPlayerNums: [],
        timestamp: Date.now() + idx,
      });
    });

    if (onUpdateAttendanceLogs) {
      onUpdateAttendanceLogs([...newLogs, ...attendanceLogs]);
    }

    triggerSaveToast(`✓ Generated 3 weekly practice dates (Tue 2.0h, Thu 2.0h, Sat 2.5h)`);
  };

  // Delete a practice session from both the attendance tracker and the schedule
  const handleDeleteSession = (session: WeeklyPracticeSession) => {
    if (userRole !== 'admin') return;
    const { shortDate } = formatShortDate(session.date);
    if (
      !window.confirm(
        `Are you sure you want to delete practice "${session.title}" (${shortDate})?\n\nThis will remove it from both the Attendance Tracker and the Schedule, and reverse credited hours.`
      )
    ) {
      return;
    }

    // 1. Identify matching attendance logs
    const matchingLogs = attendanceLogs.filter(
      (l) =>
        l.id === session.id ||
        l.scheduleEventId === session.id ||
        (session.scheduleEventId && l.scheduleEventId === session.scheduleEventId) ||
        (l.date === session.date && (!l.week || l.week === selectedWeek))
    );

    // 2. Deduct credited hours from roster players
    if (matchingLogs.length > 0 && onUpdateRoster) {
      const updatedRoster = roster.map((player) => {
        let pCopy = { ...player };
        matchingLogs.forEach((log) => {
          const wasPresent = log.presentPlayerNums?.includes(player.num);
          if (wasPresent && (log.hours || 0) > 0) {
            const logWeek = log.week || selectedWeek;
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
      onUpdateRoster(updatedRoster);

      // 3. Remove attendance logs
      const matchingIds = new Set(matchingLogs.map((l) => l.id));
      const remainingLogs = attendanceLogs.filter((l) => !matchingIds.has(l.id));
      if (onUpdateAttendanceLogs) {
        onUpdateAttendanceLogs(remainingLogs);
      }
    }

    // 4. Delete matching schedule event
    const eventIdToDelete = session.scheduleEventId || session.id;
    if (onDeleteScheduleEvent) {
      onDeleteScheduleEvent(eventIdToDelete);
    }

    triggerSaveToast(`✓ Deleted practice "${session.title}" (${shortDate})`);
  };

  // Auto-cleanup orphaned empty attendance logs whose schedule events were deleted
  React.useEffect(() => {
    if (!onUpdateAttendanceLogs || attendanceLogs.length === 0) return;
    const activeDates = new Set(scheduleEvents.map((e) => e.date));
    const orphanedEmptyLogs = attendanceLogs.filter(
      (l) =>
        (!l.presentPlayerNums || l.presentPlayerNums.length === 0) &&
        !activeDates.has(l.date)
    );
    if (orphanedEmptyLogs.length > 0) {
      const orphanIds = new Set(orphanedEmptyLogs.map((l) => l.id));
      const cleaned = attendanceLogs.filter((l) => !orphanIds.has(l.id));
      onUpdateAttendanceLogs(cleaned);
    }
  }, [scheduleEvents, attendanceLogs, onUpdateAttendanceLogs]);

  // Shift selected week backward/forward
  const handleShiftWeek = (direction: number) => {
    const currentIndex = weekList.findIndex((w) => w.key === selectedWeek);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < weekList.length) {
      setSelectedWeek(weekList[nextIndex].key);
    }
  };

  // Filter roster by name/number and status filter
  const filteredRoster = useMemo(() => {
    return roster.filter((player) => {
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchesName = `${player.firstName} ${player.lastName}`.toLowerCase().includes(term);
        const matchesNum = player.num.includes(term);
        const matchesPos =
          (player.primaryPosition || '').toLowerCase().includes(term) ||
          (player.offensivePosition || '').toLowerCase().includes(term) ||
          (player.defensivePosition || '').toLowerCase().includes(term);
        if (!matchesName && !matchesNum && !matchesPos) return false;
      }

      const comp = calculatePlayerCompliance(player);
      if (statusFilter === 'needs_conditioning' && comp.isConditioningCleared) return false;
      if (statusFilter === 'needs_pads' && (!comp.isConditioningCleared || comp.isScrimmageCleared))
        return false;
      if (statusFilter === 'cleared' && !comp.isScrimmageCleared) return false;

      return true;
    });
  }, [roster, searchTerm, statusFilter]);

  // Compute stats for current week
  const weekStats = useMemo(() => {
    const totalPossibleSessions = weekSessions.length;
    let totalCheckmarks = 0;
    let totalPlayerHoursThisWeek = 0;

    roster.forEach((p) => {
      let pHours = 0;
      weekSessions.forEach((s) => {
        if (attendanceLookup.get(`${s.id}_${p.num}`)) {
          totalCheckmarks++;
          pHours += s.hours;
        }
      });
      totalPlayerHoursThisWeek += pHours;
    });

    const maxChecks = roster.length * (totalPossibleSessions || 1);
    const overallRate = maxChecks > 0 ? Math.round((totalCheckmarks / maxChecks) * 100) : 0;
    const weekScheduledHours = weekSessions.reduce((sum, s) => sum + s.hours, 0);

    return {
      sessionsCount: weekSessions.length,
      scheduledHours: (Math.round(weekScheduledHours * 10) / 10).toFixed(1),
      totalCheckmarks,
      overallRate,
      totalPlayerHoursThisWeek: (Math.round(totalPlayerHoursThisWeek * 10) / 10).toFixed(1),
    };
  }, [weekSessions, roster, attendanceLookup]);

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & WEEK CONTROLLER BAR */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Title & Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400/40 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isPreSeason
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}
                >
                  {isPreSeason ? '⚡ Pre-Season Acclimatization' : '🏆 Regular Season Practice'}
                </span>

                {saveIndicator && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-in fade-in">
                    {saveIndicator}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleShiftWeek(-1)}
                  disabled={weekList.findIndex((w) => w.key === selectedWeek) <= 0}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-slate-950 border border-slate-700 hover:border-amber-400/60 rounded-xl px-3 py-1.5 text-sm md:text-base font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer"
                >
                  {weekList.map((w) => (
                    <option key={w.key} value={w.key}>
                      {w.label} {w.phase === 'preseason' ? '⚡ (Acclimatization)' : '🏈'}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleShiftWeek(1)}
                  disabled={weekList.findIndex((w) => w.key === selectedWeek) >= weekList.length - 1}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-2xl flex items-center gap-3">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Practices Scheduled</div>
                <div className="text-sm font-black text-slate-100 font-mono">
                  {weekStats.sessionsCount} Days • {weekStats.scheduledHours} hrs
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Attendance Rate</div>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  {weekStats.overallRate}%
                </div>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPracticeModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Practice Date</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSeasonSummaryModal(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="View Season Hours Breakdown across all weeks"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Season Hours Matrix</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerPrint()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Print Weekly Attendance Sheet"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Acclimatization Rule Guide Banner if in Pre-Season */}
        {isPreSeason ? (
          <div className="p-3 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-black text-amber-300">
                Pre-Season Acclimatization Hours Mandate (10h Conditioning + 10h Padded)
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Athletes must complete <strong className="text-amber-200 font-bold">10 hours of conditioning</strong> in helmets and shorts before donning full pads, and an additional <strong className="text-sky-200 font-bold">10 hours of padded contact</strong> before interscholastic scrimmages or games. Checking attendance below automatically credits the scheduled practice duration (e.g. 2.0h or 2.5h) to each player.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-black text-indigo-300">
                Regular Season Weekly Volume Tracking
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Tracking weekly hours during the season ensures recovery balance and compliance with weekly on-field practice maximums. Check marks pull duration directly from scheduled practices (2.0h, 2.5h) and calculate weekly &amp; cumulative season hours.
              </p>
            </div>
          </div>
        )}

        {/* Roster Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter roster by name, #, or position..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-1 shrink-0">Filter:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All ({roster.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('needs_conditioning')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                statusFilter === 'needs_conditioning'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ⚡ Needs Cond
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('needs_pads')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                statusFilter === 'needs_pads'
                  ? 'bg-sky-500/30 text-sky-300 border border-sky-500'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🛡️ Needs Pads
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cleared')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                statusFilter === 'cleared'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ✓ Cleared
            </button>
          </div>
        </div>
      </div>

      {/* 2. WEEKLY ATTENDANCE MATRIX TABLE */}
      {weekSessions.length === 0 ? (
        /* Empty State when no practices are scheduled for this week yet */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100">
              No Practices Scheduled for {formatWeekLabel(selectedWeek, seasonConfig)}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Add scheduled practice days for this week to track attendance, credit 2.0h or 2.5h session times, and compute acclimatization &amp; season hours.
            </p>
          </div>

          {userRole === 'admin' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAutoGenerateStandardWeek}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Standard Week Practices (Tue 2.0h, Thu 2.0h, Sat 2.5h)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddPracticeModal(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Single Custom Practice</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Interactive Weekly Attendance Spreadsheet Grid */
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              {/* Table Column Headers */}
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs">
                  {/* Fixed Roster Column */}
                  <th className="p-3.5 font-black text-slate-300 w-64 sticky left-0 z-20 bg-slate-950 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-200 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Roster Player</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {filteredRoster.length} Athletes
                      </span>
                    </div>
                  </th>

                  {/* Pre-Season or Season Hours Progress Summary Columns */}
                  {isPreSeason ? (
                    <>
                      <th className="p-3 font-black text-amber-300 text-center w-28 bg-slate-950 border-r border-slate-800/80">
                        <div className="text-[10px] uppercase font-bold text-amber-400/80">Conditioning</div>
                        <div className="text-xs font-mono font-black">/ 10.0 hrs</div>
                      </th>
                      <th className="p-3 font-black text-sky-300 text-center w-28 bg-slate-950 border-r border-slate-800/80">
                        <div className="text-[10px] uppercase font-bold text-sky-400/80">Padded Contact</div>
                        <div className="text-xs font-mono font-black">/ 10.0 hrs</div>
                      </th>
                      <th className="p-3 font-black text-slate-300 text-center w-24 bg-slate-950 border-r border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Pre-Season</div>
                        <div className="text-xs font-mono font-black text-slate-200">Total Hours</div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="p-3 font-black text-indigo-300 text-center w-24 bg-slate-950 border-r border-slate-800/80">
                        <div className="text-[10px] uppercase font-bold text-indigo-400/80">This Week</div>
                        <div className="text-xs font-mono font-black">Hours</div>
                      </th>
                      <th className="p-3 font-black text-emerald-300 text-center w-24 bg-slate-950 border-r border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-emerald-400/80">Season Total</div>
                        <div className="text-xs font-mono font-black">Hours</div>
                      </th>
                    </>
                  )}

                  {/* Practice Scheduled Date Columns */}
                  {weekSessions.map((session) => {
                    // Count present for this column
                    const presentCount = roster.filter((p) =>
                      attendanceLookup.get(`${session.id}_${p.num}`)
                    ).length;
                    const presentPct = Math.round((presentCount / (roster.length || 1)) * 100);

                    return (
                      <th
                        key={session.id}
                        className="p-3 text-center border-r border-slate-800/80 min-w-[155px] max-w-[190px] bg-slate-950/90 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="space-y-1.5">
                          {/* Date & Day Header */}
                          <div>
                            <div className="text-xs font-black text-slate-100 flex items-center justify-center gap-1">
                              <span className="text-amber-400 font-mono font-black">{session.dayOfWeek}</span>
                              <span>{formatShortDate(session.date).shortDate}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-300 truncate max-w-[170px] mx-auto" title={session.title}>
                              {session.title}
                            </div>
                          </div>

                          {/* Time & Duration Pill (Pulled from schedule) */}
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono font-black text-amber-300">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{session.hours} hrs</span>
                            </div>

                            {/* Attire Category Badge (Click to toggle) */}
                            <button
                              type="button"
                              onClick={() => handleToggleSessionAttire(session)}
                              title="Click to toggle between Conditioning and Padded Contact"
                              className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border transition-all cursor-pointer ${
                                session.sessionType === 'conditioning'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                              }`}
                            >
                              {session.sessionType === 'conditioning' ? '⚡ Cond' : '🛡️ Pads'}
                            </button>
                          </div>

                          {/* Quick Duration Preset Selector: 1.5h, 2.0h, 2.5h */}
                          {userRole === 'admin' && (
                            <div className="flex items-center justify-center gap-1 text-[9px] font-bold">
                              {[1.5, 2.0, 2.5].map((h) => (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => handleChangeSessionHours(session, h)}
                                  className={`px-1.5 py-0.5 rounded transition-colors ${
                                    session.hours === h
                                      ? 'bg-amber-400 text-slate-950 font-black'
                                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  {h}h
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Column Attendance Status & Quick Actions */}
                          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-mono font-bold text-emerald-400">
                              {presentCount}/{roster.length} ({presentPct}%)
                            </span>

                            {userRole === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCheckAllForSession(session)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold"
                                  title="Check All Present"
                                >
                                  ✓ All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleClearAllForSession(session)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-bold"
                                  title="Clear All"
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSession(session)}
                                  className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold flex items-center gap-0.5"
                                  title={`Delete practice "${session.title}" from schedule and attendance tracker`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span>Del</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Rows: Each Roster Player */}
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredRoster.map((player) => {
                  const comp = calculatePlayerCompliance(player);
                  const thisWeekHours = Math.round(
                    weekSessions
                      .filter((s) => Boolean(attendanceLookup.get(`${s.id}_${player.num}`)))
                      .reduce((sum, s) => sum + s.hours, 0) * 10
                  ) / 10;

                  // Calculate total season hours
                  const totalSeasonHours = Object.values(player.weeklyHours || {}).reduce(
                    (sum, val) => sum + Number(val || 0),
                    0
                  );

                  const preSeasonTotal = (comp.conditioningHours + comp.paddedHours).toFixed(1);

                  return (
                    <tr
                      key={player.num}
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Fixed Left Column: Player Identity */}
                      <td className="p-3 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0">
                              #{player.num}
                            </span>
                            <div className="min-w-0">
                              <div className="font-black text-slate-100 text-xs truncate flex items-center gap-1">
                                <span>{player.firstName} {player.lastName}</span>
                                {player.isCaptain && (
                                  <span className="px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black">
                                    C
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold truncate">
                                {player.primaryPosition || 'ATH'}
                                {player.offensivePosition ? ` • ${player.offensivePosition}` : ''}
                                {player.defensivePosition ? ` / ${player.defensivePosition}` : ''}
                              </div>
                            </div>
                          </div>

                          {/* Mini Compliance Indicator Badge */}
                          {isPreSeason && (
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                comp.isScrimmageCleared
                                  ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                                  : comp.isPadsCleared
                                  ? 'bg-sky-400 ring-2 ring-sky-400/30'
                                  : 'bg-amber-400 ring-2 ring-amber-400/30'
                              }`}
                              title={
                                comp.isScrimmageCleared
                                  ? 'Scrimmage Cleared (10h cond + 10h pads)'
                                  : comp.isPadsCleared
                                  ? `Pads Cleared (${comp.paddedRemaining.toFixed(1)}h left for scrimmage)`
                                  : `Conditioning (${comp.conditioningRemaining.toFixed(1)}h left for pads)`
                              }
                            />
                          )}
                        </div>
                      </td>

                      {/* Summary Columns based on Season Phase */}
                      {isPreSeason ? (
                        <>
                          {/* Conditioning Hours (Target 10h) */}
                          <td className="p-2.5 text-center font-mono border-r border-slate-800/80 bg-slate-950/30">
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className={`text-xs font-black ${
                                  comp.conditioningHours >= CONDITIONING_HOURS_REQUIRED
                                    ? 'text-emerald-400'
                                    : 'text-amber-300'
                                }`}
                              >
                                {comp.conditioningHours.toFixed(1)}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${
                                    comp.conditioningHours >= CONDITIONING_HOURS_REQUIRED
                                      ? 'bg-emerald-400'
                                      : 'bg-amber-400'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (comp.conditioningHours / CONDITIONING_HOURS_REQUIRED) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Padded Hours (Target 10h) */}
                          <td className="p-2.5 text-center font-mono border-r border-slate-800/80 bg-slate-950/30">
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className={`text-xs font-black ${
                                  comp.paddedHours >= PADDED_HOURS_REQUIRED
                                    ? 'text-emerald-400'
                                    : 'text-sky-300'
                                }`}
                              >
                                {comp.paddedHours.toFixed(1)}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${
                                    comp.paddedHours >= PADDED_HOURS_REQUIRED
                                      ? 'bg-emerald-400'
                                      : 'bg-sky-400'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (comp.paddedHours / PADDED_HOURS_REQUIRED) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Pre-Season Total */}
                          <td className="p-2.5 text-center font-mono border-r border-slate-800 bg-slate-950/40">
                            <span className="text-xs font-black text-slate-200">
                              {preSeasonTotal} hrs
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Regular Season: This Week Hours */}
                          <td className="p-2.5 text-center font-mono border-r border-slate-800/80 bg-slate-950/30">
                            <span className="text-xs font-black text-indigo-300">
                              {thisWeekHours.toFixed(1)} hrs
                            </span>
                          </td>

                          {/* Regular Season: Cumulative Total */}
                          <td className="p-2.5 text-center font-mono border-r border-slate-800 bg-slate-950/40">
                            <span className="text-xs font-black text-emerald-400">
                              {totalSeasonHours.toFixed(1)} hrs
                            </span>
                          </td>
                        </>
                      )}

                      {/* Interactive Attendance Checkboxes per Practice Date Column */}
                      {weekSessions.map((session) => {
                        const isAttended = Boolean(
                          attendanceLookup.get(`${session.id}_${player.num}`)
                        );

                        return (
                          <td
                            key={session.id}
                            className="p-2 text-center border-r border-slate-800/60"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(session, player.num)}
                              disabled={userRole !== 'admin'}
                              className={`w-full py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all font-mono font-bold cursor-pointer active:scale-95 ${
                                isAttended
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 shadow-xs'
                                  : 'bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                              title={`Click to mark #${player.num} ${isAttended ? 'absent' : 'present'} for ${session.title}`}
                            >
                              {isAttended ? (
                                <>
                                  <div className="w-4 h-4 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                  <span className="text-[11px] font-black">{session.hours}h</span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-600 font-bold">—</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats Summary */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-4">
              <span>Roster Shown: <strong className="text-slate-200">{filteredRoster.length}</strong></span>
              <span>•</span>
              <span>Practices in Grid: <strong className="text-amber-300 font-mono">{weekSessions.length}</strong></span>
              <span>•</span>
              <span>Scheduled Week Hours: <strong className="text-amber-300 font-mono">{weekStats.scheduledHours} hrs</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                Tip: Click any checkmark to toggle attendance; hours auto-credit immediately.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD PRACTICE SESSION */}
      {showAddPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-100 text-sm">
                  Add Practice Session for {formatWeekLabel(selectedWeek, seasonConfig)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPracticeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Practice Title / Theme:</label>
                <input
                  type="text"
                  value={newPracticeTitle}
                  onChange={(e) => setNewPracticeTitle(e.target.value)}
                  placeholder="e.g. Offense Install & Conditioning"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date:</label>
                  <input
                    type="date"
                    value={newPracticeDate}
                    onChange={(e) => setNewPracticeDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Scheduled Hours:</label>
                  <select
                    value={newPracticeHours}
                    onChange={(e) => setNewPracticeHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value={1.0}>1.0 Hour (60 mins)</option>
                    <option value={1.5}>1.5 Hours (90 mins)</option>
                    <option value={2.0}>2.0 Hours (120 mins - Standard)</option>
                    <option value={2.5}>2.5 Hours (150 mins - Long/Scrimmage)</option>
                    <option value={3.0}>3.0 Hours (180 mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Scheduled Time Window:</label>
                <input
                  type="text"
                  value={newPracticeTime}
                  onChange={(e) => setNewPracticeTime(e.target.value)}
                  placeholder="e.g. 5:30 PM - 7:30 PM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Acclimatization Category:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewPracticeType('conditioning')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPracticeType === 'conditioning'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">⚡ Conditioning</div>
                    <div className="text-[10px] text-slate-400">Helmets, tees &amp; shorts</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPracticeType('padded')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPracticeType === 'padded'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">🛡️ Full Pads</div>
                    <div className="text-[10px] text-slate-400">Padded contact drills</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPracticeModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewPracticeSession}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Practice Column</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: FULL SEASON HOURS BREAKDOWN MATRIX */}
      {showSeasonSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-base">Full Season Hours Matrix &amp; Weekly Tracking</h3>
                  <p className="text-xs text-slate-400">Comprehensive audit of hours logged across pre-season and regular season weeks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSeasonSummaryModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-2.5 font-black text-slate-200 sticky left-0 z-10 bg-slate-950">Player</th>
                    <th className="p-2 text-center text-amber-300 font-bold">Cond (10h)</th>
                    <th className="p-2 text-center text-sky-300 font-bold">Pads (10h)</th>
                    {weekList.map((w) => (
                      <th key={w.key} className="p-2 text-center text-slate-300 font-mono font-bold">
                        {w.label.replace('Pre-Season ', 'Pre-').replace('Regular Season • ', '')}
                      </th>
                    ))}
                    <th className="p-2 text-center text-emerald-400 font-black">Season Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {roster.map((player) => {
                    const comp = calculatePlayerCompliance(player);
                    const totalHours = Object.values(player.weeklyHours || {}).reduce(
                      (acc, v) => acc + Number(v || 0),
                      0
                    );

                    return (
                      <tr key={player.num} className="hover:bg-slate-850 transition-colors">
                        <td className="p-2.5 font-sans font-bold text-slate-100 sticky left-0 bg-slate-900">
                          <span className="font-mono text-indigo-400 font-black mr-1.5">#{player.num}</span>
                          {player.firstName} {player.lastName}
                        </td>
                        <td className="p-2 text-center text-amber-300 font-bold">
                          {comp.conditioningHours.toFixed(1)}h
                        </td>
                        <td className="p-2 text-center text-sky-300 font-bold">
                          {comp.paddedHours.toFixed(1)}h
                        </td>
                        {weekList.map((w) => {
                          const h = player.weeklyHours?.[w.key] || 0;
                          return (
                            <td key={w.key} className="p-2 text-center text-slate-300">
                              {h > 0 ? `${Number(h).toFixed(1)}h` : '—'}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-black text-emerald-400">
                          {totalHours.toFixed(1)} hrs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">
                Total Roster Size: {roster.length} athletes
              </span>
              <button
                type="button"
                onClick={() => setShowSeasonSummaryModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
