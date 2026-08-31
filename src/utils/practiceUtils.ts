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

function normalizeCoachName(coach?: string): string {
  if (!coach) return '';
  return coach.trim();
}

/**
 * Sanitizes and repairs practice plan entries so that:
 * 1. Dates match their true weekFolder (e.g. 2026-08-31 -> Week 1)
 * 2. Days of week match the actual calendar date
 * 3. Day folders match format "Day M/DD"
 */
export function sanitizePracticePlans(
  plans: PracticePlan[],
  scheduleEvents?: ScheduleEvent[]
): PracticePlan[] {
  if (!Array.isArray(plans)) return [];
  return plans
    .filter((p): p is PracticePlan => Boolean(p && typeof p === 'object'))
    .map((p) => {
      const dateStr = p.date || '';
      const correctDay = dateStr ? getDayOfWeekForDate(dateStr) : (p.day || 'Wednesday');
      const correctWeek = dateStr ? calculateWeekFolderForDate(dateStr, scheduleEvents) : (p.weekFolder || 'Week 1');
      const correctDayFolder = dateStr ? getFormattedDayFolder(dateStr) : (p.dayFolder || p.day || 'Day 1');

      const rawPeriods = Array.isArray(p.plan) && p.plan.length > 0
        ? p.plan
        : Array.isArray(p.periods) && p.periods.length > 0
        ? p.periods
        : [];

      const sanitizedPeriods = rawPeriods
        .filter((period) => Boolean(period && typeof period === 'object'))
        .map((period) => {
          const rawStations = Array.isArray(period.stations) ? period.stations : [];
          const validStations = rawStations
            .filter((st) => Boolean(st && typeof st === 'object'))
            .map((st) => ({
              name: st?.name || '',
              desc: st?.desc || '',
              focus: st?.focus || '',
              coach: (st?.coach || '').trim(),
            }));

          return {
            ...period,
            time: Number(period.time) || 0,
            category: period.category || '',
            format: period.format || 'static',
            stations: validStations.length > 0 ? validStations : [{ name: '', desc: '', coach: '', focus: '' }],
          };
        });

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

/**
 * Intelligently finds the most relevant/active practice plan ID to display:
 * 1. Matches requested preferredId if present in list
 * 2. Matches exact practice on Today's date
 * 3. Most recently edited practice plan (highest lastEdited timestamp in the last 7 days)
 * 4. Closest upcoming practice plan (date >= today)
 * 5. Practice in the active week folder
 * 6. Latest created/chronological practice plan (never falls back to an arbitrary ancient index 0)
 */
export function findBestActivePracticeId(
  practices: PracticePlan[],
  preferredId?: string | null,
  currentWeekFolder?: string
): string | null {
  if (!Array.isArray(practices) || practices.length === 0) return null;

  // 1. If preferredId is provided and exists in the practice list, use it
  if (preferredId) {
    const found = practices.find((p) => p && p.id === preferredId);
    if (found) return found.id;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Check if there is an exact practice plan for Today's date
  const todayPlan = practices.find((p) => p && p.date === todayStr && !p.isCancelled);
  if (todayPlan) return todayPlan.id;

  // 3. Check for the most recently edited practice plan
  const sortedByRecentEdit = [...practices]
    .filter((p) => p && typeof p.lastEdited === 'number' && p.lastEdited > 0)
    .sort((a, b) => (b.lastEdited || 0) - (a.lastEdited || 0));

  if (sortedByRecentEdit.length > 0) {
    const mostRecent = sortedByRecentEdit[0];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if ((mostRecent.lastEdited || 0) > sevenDaysAgo) {
      return mostRecent.id;
    }
  }

  // 4. Check for the closest upcoming practice (date >= today)
  const upcomingPractices = practices
    .filter((p) => p && p.date && p.date >= todayStr && !p.isCancelled)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  if (upcomingPractices.length > 0) {
    return upcomingPractices[0].id;
  }

  // 5. Check if there's a practice in currentWeekFolder
  if (currentWeekFolder) {
    const weekPlans = practices
      .filter((p) => p && p.weekFolder === currentWeekFolder && !p.isCancelled)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (weekPlans.length > 0) {
      return weekPlans[0].id;
    }
  }

  // 6. If any recent edit exists at all, use it
  if (sortedByRecentEdit.length > 0) {
    return sortedByRecentEdit[0].id;
  }

  // 7. Otherwise, latest chronological date first
  const sortedChronological = [...practices].sort((a, b) => {
    const dA = a.date || '0000-00-00';
    const dB = b.date || '0000-00-00';
    return dB.localeCompare(dA);
  });

  return sortedChronological[0]?.id || practices[0]?.id || null;
}

