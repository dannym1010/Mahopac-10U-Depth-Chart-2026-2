import { AttendanceRecord, RosterPlayer, SeasonConfig, WeekOption } from '../types';
import { isDateInWeek, getSeasonWeekList } from './seasonWeekUtils';

export interface CalculatedPlayerHours {
  conditioningHours: number;
  paddedHours: number;
  weeklyHours: Record<string, number>;
  totalSeasonHours: number;
  thisWeekHours: number;
  attendedCount: number;
  totalSessionsCount: number;
  attendanceRate: number;
}

/**
 * Normalizes legacy or non-standard week keys:
 * e.g., '0' -> 'pre-1', 'week 1' -> '1', etc.
 */
export function normalizeWeekKey(rawWeekKey?: string, dateStr?: string): string {
  if (!rawWeekKey && !dateStr) return 'pre-1';

  const clean = (rawWeekKey || '').toLowerCase().trim().replace(/^week\s+/i, '');
  if (clean === '0' || clean === 'preseason-1' || clean === 'pre1') return 'pre-1';
  if (clean === 'preseason-2' || clean === 'pre2') return 'pre-2';
  if (clean === 'preseason-3' || clean === 'pre3') return 'pre-3';
  if (clean === 'preseason-4' || clean === 'pre4') return 'pre-4';

  if (clean) return clean;

  // If week key is missing, derive from date
  if (dateStr) {
    if (isDateInWeek(dateStr, 'pre-1')) return 'pre-1';
    if (isDateInWeek(dateStr, 'pre-2')) return 'pre-2';
    if (isDateInWeek(dateStr, 'pre-3')) return 'pre-3';
    if (isDateInWeek(dateStr, 'pre-4')) return 'pre-4';
    for (let w = 1; w <= 8; w++) {
      if (isDateInWeek(dateStr, String(w))) return String(w);
    }
    if (isDateInWeek(dateStr, 'playoffs')) return 'playoffs';
    if (isDateInWeek(dateStr, 'championship')) return 'championship';
  }

  return 'pre-1';
}

/**
 * Authoritative, deterministic calculation of a player's practice hours,
 * conditioning hours, padded hours, and weekly breakdown directly from attendance logs.
 *
 * Guaranteed invariants:
 * 1. Total Season Hours === Sum of all weeklyHours.
 * 2. Pre-Season Total === conditioningHours + paddedHours.
 * 3. No ghost week '0' hours leaking into calculations.
 * 4. No compounding or double-counting on checkbox toggles.
 */
export function calculatePlayerHours(
  player: RosterPlayer,
  allLogs: AttendanceRecord[],
  selectedWeekKey: string = 'pre-1',
  seasonConfig?: SeasonConfig
): CalculatedPlayerHours {
  const playerNum = String(player.num).trim();
  const cleanSelectedWeek = normalizeWeekKey(selectedWeekKey);

  let condSum = 0;
  let padSum = 0;
  let attendedCount = 0;
  const weeklyHoursMap: Record<string, number> = {};

  // Standardize week keys from weekList
  const validWeeks = getSeasonWeekList(seasonConfig).map((w) => w.key);
  validWeeks.forEach((wk) => {
    weeklyHoursMap[wk] = 0;
  });

  // Calculate from attendance logs
  (allLogs || []).forEach((log) => {
    if (!log || typeof log !== 'object') return;
    const isPresent = Array.isArray(log.presentPlayerNums) && log.presentPlayerNums.includes(playerNum);
    const sessionHours = Number(log.hours || 0);

    if (isPresent && sessionHours > 0) {
      attendedCount++;
      const attire = log.playerSessionTypes?.[playerNum] || log.sessionType || 'conditioning';
      if (attire === 'conditioning') {
        condSum += sessionHours;
      } else {
        padSum += sessionHours;
      }

      const wk = normalizeWeekKey(log.week, log.date);
      weeklyHoursMap[wk] = Math.round(((weeklyHoursMap[wk] || 0) + sessionHours) * 10) / 10;
    }
  });

  // Check if player has baseline hours not covered by logs (e.g. manual entry or transfer)
  // If there are zero attendance logs in the app, we preserve the player's initial static values
  if ((allLogs || []).length === 0) {
    condSum = Number(player.conditioningHours || 0);
    padSum = Number(player.paddedHours || 0);
    if (player.weeklyHours && typeof player.weeklyHours === 'object') {
      Object.entries(player.weeklyHours).forEach(([wk, val]) => {
        const cleanWk = normalizeWeekKey(wk);
        weeklyHoursMap[cleanWk] = Number(val || 0);
      });
    }
  }

  // Round values cleanly to 1 decimal place
  const finalCond = Math.round(condSum * 10) / 10;
  const finalPadded = Math.round(padSum * 10) / 10;

  // Total season hours is strictly the sum of all valid weekly hours
  const totalSeasonHours = Math.round(
    Object.values(weeklyHoursMap).reduce((acc, h) => acc + Number(h || 0), 0) * 10
  ) / 10;

  const thisWeekHours = Math.round(Number(weeklyHoursMap[cleanSelectedWeek] || 0) * 10) / 10;
  const totalSessionsCount = (allLogs || []).length;
  const attendanceRate =
    totalSessionsCount > 0 ? Math.round((attendedCount / totalSessionsCount) * 100) : 100;

  return {
    conditioningHours: finalCond,
    paddedHours: finalPadded,
    weeklyHours: weeklyHoursMap,
    totalSeasonHours,
    thisWeekHours,
    attendedCount,
    totalSessionsCount,
    attendanceRate,
  };
}

/**
 * Batch calculates and updates the entire roster based on current attendance logs.
 */
export function syncEntireRosterWithLogs(
  roster: RosterPlayer[],
  attendanceLogs: AttendanceRecord[],
  selectedWeekKey: string = 'pre-1',
  seasonConfig?: SeasonConfig
): RosterPlayer[] {
  return roster.map((player) => {
    const calc = calculatePlayerHours(player, attendanceLogs, selectedWeekKey, seasonConfig);
    return {
      ...player,
      conditioningHours: calc.conditioningHours,
      paddedHours: calc.paddedHours,
      weeklyHours: calc.weeklyHours,
    };
  });
}
