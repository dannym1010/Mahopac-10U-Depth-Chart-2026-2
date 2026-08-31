import { PracticePlan, ScheduleEvent } from '../types';

/**
 * Derives the standard day of week name from a 'YYYY-MM-DD' date string.
 */
export function getDayOfWeekForDate(dateStr?: string): string {
  if (!dateStr) return 'Wednesday';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 'Wednesday';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 'Wednesday';

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  return dayNames[dt.getDay()] || 'Wednesday';
}

/**
 * Returns formatted short day folder e.g. "Monday 8/31", "Tuesday 9/01"
 */
export function getFormattedDayFolder(dateStr?: string): string {
  if (!dateStr) return 'Day 1';
  const dayName = getDayOfWeekForDate(dateStr);
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const padD = d < 10 ? `0${d}` : `${d}`;
    return `${dayName} ${m}/${padD}`;
  }
  return dayName;
}

/**
 * Accurate Week Folder calculation based on 2026 Youth Football Season Calendar:
 * - Preseason Wk 1: Dates before August 31, 2026 (e.g. 8/25, 8/27, 8/29 Scrimmage)
 * - Week 1: August 31 to September 6, 2026 (Game 1 vs Carmel on 9/05)
 * - Week 2: September 7 to September 13, 2026 (Game 2 vs Somers on 9/12)
 * - Week 3: September 14 to September 20, 2026 (Game 3 vs Yorktown on 9/19)
 * - Week 4: September 21 to September 27, 2026 (Homecoming vs Brewster on 9/26)
 * - Week 5: September 28 to October 4, 2026 (Game 5 vs John Jay on 10/03)
 * - Week 6: October 5 to October 11, 2026 (Senior Night vs Lakeland on 10/10)
 * - Week 7: October 12 to October 18, 2026 (Season Finale vs Arlington on 10/17)
 * - Week 8: October 19 to October 25, 2026 (Playoffs Round 1 on 10/24)
 * - Post-Season: After October 25, 2026 (Championship Bowl)
 */
export function calculateWeekFolderForDate(
  dateStr?: string,
  scheduleEvents?: ScheduleEvent[]
): string {
  if (!dateStr) return 'Week 1';

  // 1. Check if there's a scheduled game or practice with an explicit week on this exact date
  if (scheduleEvents && scheduleEvents.length > 0) {
    const matchEvent = scheduleEvents.find((e) => e && e.date === dateStr);
    if (matchEvent && matchEvent.week !== undefined) {
      const rawWk = String(matchEvent.week).trim();
      if (rawWk === '0' || rawWk.toLowerCase().includes('pre-1') || rawWk.toLowerCase().includes('pre1')) {
        return 'Preseason Wk 1';
      }
      if (rawWk.toLowerCase().includes('pre-2') || rawWk.toLowerCase().includes('pre2')) {
        return 'Preseason Wk 2';
      }
      if (rawWk.toLowerCase().startsWith('week')) {
        return rawWk;
      }
      if (rawWk.toLowerCase().includes('playoff')) {
        return 'Week 8';
      }
      if (rawWk.toLowerCase().includes('championship')) {
        return 'Championship';
      }
      if (!isNaN(parseInt(rawWk, 10))) {
        return `Week ${parseInt(rawWk, 10)}`;
      }
    }
  }

  // 2. Canonical 2026 dates boundary check
  const cleanDate = dateStr.trim();
  if (cleanDate < '2026-08-31') {
    return 'Preseason Wk 1';
  }
  if (cleanDate >= '2026-08-31' && cleanDate <= '2026-09-06') {
    return 'Week 1';
  }
  if (cleanDate >= '2026-09-07' && cleanDate <= '2026-09-13') {
    return 'Week 2';
  }
  if (cleanDate >= '2026-09-14' && cleanDate <= '2026-09-20') {
    return 'Week 3';
  }
  if (cleanDate >= '2026-09-21' && cleanDate <= '2026-09-27') {
    return 'Week 4';
  }
  if (cleanDate >= '2026-09-28' && cleanDate <= '2026-10-04') {
    return 'Week 5';
  }
  if (cleanDate >= '2026-10-05' && cleanDate <= '2026-10-11') {
    return 'Week 6';
  }
  if (cleanDate >= '2026-10-12' && cleanDate <= '2026-10-18') {
    return 'Week 7';
  }
  if (cleanDate >= '2026-10-19' && cleanDate <= '2026-10-25') {
    return 'Week 8';
  }
  if (cleanDate > '2026-10-25') {
    return 'Championship';
  }

  // Generic fallback for future years: Monday-Sunday week based calculation
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      // Base date: first Monday of August
      const baseYear = dt.getFullYear();
      const seasonStart = new Date(baseYear, 7, 24); // Aug 24
      const diffDays = Math.floor((dt.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return 'Preseason Wk 1';
      const weekNum = Math.floor(diffDays / 7);
      return `Week ${Math.min(weekNum, 10)}`;
    }
  } catch (e) {
    // Ignore fallback errors
  }

  return 'Week 1';
}

export interface PracticeSequenceInfo {
  practiceNumber: number | null; // 1-based sequential number among held/active practices, or null if cancelled
  isCancelled: boolean;
  totalActivePractices: number;
  totalCancelledPractices: number;
  isPast: boolean;
  displayDayLabel: string; // e.g. "Day 1", "Day 2", "Cancelled"
  fullBadgeLabel: string; // e.g. "Practice Day #2", "Cancelled (Not Counted)"
}

/**
 * Calculates real-time dynamic practice numbering across all practice plans.
 * - Non-cancelled practices are sorted chronologically by date and assigned sequential numbers: 1, 2, 3, ...
 * - Cancelled practices (past, present, or future) are excluded from the sequence count.
 * - If any practice is cancelled, all subsequent practices automatically re-number consecutively.
 */
export function getPracticeSequenceMap(
  practices: PracticePlan[],
  todayStr: string = new Date().toISOString().split('T')[0]
): Record<string, PracticeSequenceInfo> {
  const result: Record<string, PracticeSequenceInfo> = {};

  // Sort all practices chronologically: date asc, then time asc, then id
  const sorted = [...practices].sort((a, b) => {
    const dateA = a.date || '1970-01-01';
    const dateB = b.date || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return (a.id || '').localeCompare(b.id || '');
  });

  let activeCount = 0;
  let cancelledCount = 0;

  // First pass: count totals
  sorted.forEach((p) => {
    if (p.isCancelled) {
      cancelledCount++;
    } else {
      activeCount++;
    }
  });

  let currentSequence = 0;

  sorted.forEach((p) => {
    const isCancelled = Boolean(p.isCancelled);
    const dateStr = p.date || '';
    const isPast = Boolean(dateStr && dateStr < todayStr);

    if (isCancelled) {
      result[p.id] = {
        practiceNumber: null,
        isCancelled: true,
        totalActivePractices: activeCount,
        totalCancelledPractices: cancelledCount,
        isPast,
        displayDayLabel: 'Cancelled',
        fullBadgeLabel: 'Cancelled (Excluded from Count)',
      };
    } else {
      currentSequence++;
      const num = currentSequence;
      result[p.id] = {
        practiceNumber: num,
        isCancelled: false,
        totalActivePractices: activeCount,
        totalCancelledPractices: cancelledCount,
        isPast,
        displayDayLabel: `Day ${num}`,
        fullBadgeLabel: `Practice Day #${num}`,
      };
    }
  });

  return result;
}

const GENERIC_COACH_MAP: Record<string, string> = {
  'head coach': 'Coach Danny',
  'offensive coordinator': 'Coach Gangemi',
  'defensive coordinator': 'Coach DeMatteo',
  'line coach': 'Coach Mike',
  'special teams coach': 'Coach Ryan',
  'skills coach': 'Coach Ryan',
  'coach': 'Coach Danny',
  'coach / assistant': 'Coach Gangemi',
  'all coaches': 'Coach Danny & Staff',
  'staff': 'Coach Danny & Staff',
  'coaching staff': 'Coach Danny & Staff',
};

function normalizeCoachName(coach?: string): string {
  if (!coach) return 'Coach Danny';
  const clean = coach.trim();
  const lower = clean.toLowerCase();
  if (GENERIC_COACH_MAP[lower]) return GENERIC_COACH_MAP[lower];
  if (lower === 'head coach' || lower === 'hc') return 'Coach Danny';
  if (lower.includes('line coach') || lower.includes('ol/dl')) return 'Coach Mike';
  if (lower.includes('defensive coord') || lower.includes('dc')) return 'Coach DeMatteo';
  if (lower.includes('offensive coord') || lower.includes('oc')) return 'Coach Gangemi';
  if (lower.includes('special teams') || lower.includes('st')) return 'Coach Ryan';
  return clean;
}

/**
 * Sanitizes and repairs practice plan entries so that:
 * 1. Dates match their true weekFolder (e.g. 2026-08-31 -> Week 1)
 * 2. Days of week match the actual calendar date
 * 3. Day folders match format "Day M/DD"
 * 4. Generic coach names are replaced with actual coaching staff
 */
export function sanitizePracticePlans(
  plans: PracticePlan[],
  scheduleEvents?: ScheduleEvent[]
): PracticePlan[] {
  return plans.map((p) => {
    if (!p) return p;
    const dateStr = p.date || '';
    const correctDay = getDayOfWeekForDate(dateStr);
    const correctWeek = calculateWeekFolderForDate(dateStr, scheduleEvents);
    const correctDayFolder = getFormattedDayFolder(dateStr);

    const rawPeriods = Array.isArray(p.plan) && p.plan.length > 0
      ? p.plan
      : Array.isArray(p.periods) && p.periods.length > 0
      ? p.periods
      : [];

    const sanitizedPeriods = rawPeriods.map((period) => ({
      ...period,
      stations: Array.isArray(period.stations)
        ? period.stations.map((st) => ({
            ...st,
            coach: normalizeCoachName(st.coach),
          }))
        : [],
    }));

    return {
      ...p,
      teamId: p.teamId === 'team-10u' ? 'team_10u' : (p.teamId || 'team_10u'),
      day: correctDay,
      dayFolder: correctDayFolder,
      weekFolder: correctWeek,
      plan: sanitizedPeriods,
      periods: sanitizedPeriods,
    };
  });
}
