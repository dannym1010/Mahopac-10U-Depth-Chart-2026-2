import { ScheduleEvent, FormationBoard, PlacedPlayer, WeekState, SeasonConfig, WeekOption, formatWeekLabel } from '../types';
import { INITIAL_DEFAULT_FORMATIONS } from '../data/initialData';

export interface AutoWeekResult {
  activeWeek: string;
  reason: string;
  priorWeek?: string;
  isAutoCalculated: boolean;
}

/**
 * Normalizes weeklyData across both legacy unscoped week keys ('0', '1', ...)
 * and team-scoped keys ('team_10u__week_0', ...), guaranteeing that depth charts,
 * formations, scrimmage charts, scouting, and opponent details are preserved and synced.
 */
export function normalizeWeeklyData(
  wData: Record<string, WeekState> | undefined,
  defaultForms: FormationBoard[] = INITIAL_DEFAULT_FORMATIONS
): Record<string, WeekState> {
  if (!wData || typeof wData !== 'object') return {};
  const result: Record<string, WeekState> = { ...wData };

  const allWeeks = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8',
    'pre-1', 'pre-2', 'pre-3', 'pre-4', 'playoffs', 'championship'
  ];

  const getDcCount = (dc?: Record<string, PlacedPlayer[]>) => {
    if (!dc) return 0;
    return Object.values(dc).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  };

  const deepClone = <T>(obj: T): T => {
    if (!obj) return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  };

  allWeeks.forEach((wk) => {
    const unKey = wk;
    const team10uKey = `team_10u__week_${wk}`;
    const un = result[unKey];
    const sc = result[team10uKey];

    const unDc = getDcCount(un?.depthChart);
    const scDc = getDcCount(sc?.depthChart);
    const unForms = un?.formations?.length || 0;
    const scForms = sc?.formations?.length || 0;

    // Pick formations: non-empty formations, fallback to Week 0 or defaults
    const bestForms =
      (scForms > 0 ? sc?.formations : null) ||
      (unForms > 0 ? un?.formations : null) ||
      (result['0']?.formations?.length ? result['0'].formations : null) ||
      (result['team_10u__week_0']?.formations?.length ? result['team_10u__week_0'].formations : null) ||
      (defaultForms.length > 0 ? defaultForms : INITIAL_DEFAULT_FORMATIONS);

    // Pick depthChart: prefer the one with more placed players
    const bestDc =
      (scDc >= unDc && scDc > 0 ? sc?.depthChart : null) ||
      (unDc > 0 ? un?.depthChart : null) ||
      sc?.depthChart ||
      un?.depthChart ||
      {};

    // Pick scrimmageChart: prefer the one with placements
    const scScrimCount = getDcCount(sc?.scrimmageChart);
    const unScrimCount = getDcCount(un?.scrimmageChart);
    const bestScrim =
      (scScrimCount >= unScrimCount && scScrimCount > 0 ? sc?.scrimmageChart : null) ||
      (unScrimCount > 0 ? un?.scrimmageChart : null) ||
      sc?.scrimmageChart ||
      un?.scrimmageChart ||
      {};

    const bestOpponent = sc?.opponent || un?.opponent || '';
    const bestWristband = sc?.wristbandData || un?.wristbandData;
    const bestScouting = sc?.scouting || un?.scouting;

    const mergedWeek: WeekState = {
      formations: deepClone(bestForms),
      depthChart: deepClone(bestDc),
      scrimmageChart: deepClone(bestScrim),
      opponent: bestOpponent,
      wristbandData: bestWristband,
      scouting: bestScouting,
    };

    if (un || sc || unDc > 0 || scDc > 0 || unForms > 0 || scForms > 0) {
      result[unKey] = mergedWeek;
      result[team10uKey] = mergedWeek;
    }
  });

  return result;
}

/**
 * Returns the list of season weeks based on SeasonConfig or standard defaults:
 * Pre-season weeks (e.g. Pre-Season Week 1, 2, 3, 4), Regular season weeks (Week 1, 2, 3, 4, 5, 6, 7, 8), Playoffs, Championship
 */
export function getSeasonWeekList(config?: SeasonConfig): WeekOption[] {
  if (config?.customWeeks && config.customWeeks.length > 0) {
    return config.customWeeks.map((w) => ({
      ...w,
      label: config.customWeekLabels?.[w.key] || w.label || formatWeekLabel(w.key, config),
    }));
  }

  const preCount = config?.preseasonWeeksCount ?? 4;
  const regCount = config?.regularSeasonWeeksCount ?? 8;
  const list: WeekOption[] = [];

  // Pre-season weeks
  for (let i = 1; i <= preCount; i++) {
    const key = i === 1 ? '0' : `pre-${i}`;
    const defaultLabel = `Pre-Season Week ${i}`;
    list.push({
      key,
      label: config?.customWeekLabels?.[key] || defaultLabel,
      phase: 'preseason',
    });
  }

  // Regular season weeks
  for (let i = 1; i <= regCount; i++) {
    const key = String(i);
    const defaultLabel = `Week ${i}`;
    list.push({
      key,
      label: config?.customWeekLabels?.[key] || defaultLabel,
      phase: 'regular',
    });
  }

  // Post season weeks
  if (config?.hasPlayoffs !== false) {
    list.push({
      key: 'playoffs',
      label: config?.customWeekLabels?.['playoffs'] || 'Playoffs',
      phase: 'postseason',
    });
  }
  if (config?.hasChampionship !== false) {
    list.push({
      key: 'championship',
      label: config?.customWeekLabels?.['championship'] || 'Championship',
      phase: 'postseason',
    });
  }

  return list;
}

/**
 * Returns dropdown label dynamically displaying the scheduled opponent if one is scheduled for this week & team
 */
export function getWeekDisplayLabelWithOpponent(
  weekKey: string,
  baseLabel: string,
  scheduleEvents?: ScheduleEvent[],
  activeTeamId?: string
): string {
  if (!scheduleEvents || scheduleEvents.length === 0) return baseLabel;

  const cleanKey = weekKey.replace(/^Week\s+/i, '').trim();
  const game = scheduleEvents.find((e) => {
    if (activeTeamId && e.teamId && e.teamId !== activeTeamId && activeTeamId !== 'all') {
      return false;
    }
    if (e.type !== 'game' && e.type !== 'scrimmage') return false;
    const evWeek = (e.week || '').replace(/^Week\s+/i, '').trim();
    if (evWeek === cleanKey) return true;
    if (cleanKey === '0' && (evWeek.startsWith('pre') || evWeek === '0')) return true;
    if (cleanKey === 'playoffs' && (evWeek === 'playoffs' || evWeek === 'post')) return true;
    return false;
  });

  if (game) {
    const rawOpp = game.opponent || game.title || '';
    if (rawOpp) {
      const isAway = game.locationType === 'away' || rawOpp.trim().startsWith('@');
      const cleanOpp = rawOpp.replace(/^vs\.?\s*/i, '').replace(/^@\s*/i, '').trim();
      const symbol = isAway ? '@' : 'vs';
      return `${baseLabel} (${symbol} ${cleanOpp})`;
    }
  }

  return baseLabel;
}

/**
 * Calculates the current active depth chart / season week automatically:
 * 1. Week 1 starts the Monday before the 1st regular season game (Aug 31, 2026).
 * 2. Before that date, it is Pre-Season (Week 0).
 * 3. A week advances to the next week immediately after:
 *    - The game score is recorded (result is entered), OR
 *    - Today's date is after the scheduled game date (day after the game).
 * 4. After all regular season games, it advances to Playoffs / Post-Season.
 */
export function getAutoActiveWeek(
  scheduleEvents: ScheduleEvent[] = [],
  currentDateStr?: string
): AutoWeekResult {
  const today = currentDateStr || new Date().toISOString().split('T')[0];

  // Find all games sorted by date
  const games = (scheduleEvents || [])
    .filter((e) => e && (e.type === 'game' || (e.title && e.title.toLowerCase().includes('game'))))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (games.length === 0) {
    return {
      activeWeek: '1',
      reason: 'Week 1 Active (Default Season Schedule)',
      priorWeek: '0',
      isAutoCalculated: true,
    };
  }

  const firstGame = games[0];
  let week1Monday = '2026-08-31';

  if (firstGame.date) {
    const parts = firstGame.date.split('-');
    if (parts.length === 3) {
      const gYear = parseInt(parts[0], 10);
      const gMonth = parseInt(parts[1], 10);
      const gDay = parseInt(parts[2], 10);
      if (!isNaN(gYear) && !isNaN(gMonth) && !isNaN(gDay)) {
        const gDate = new Date(gYear, gMonth - 1, gDay, 12, 0, 0);
        const dayOfWeek = gDate.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
        // Days back to previous Monday (if Sunday: 6 days, if Saturday: 5 days, if Monday: 0 days)
        const daysBack = (dayOfWeek + 6) % 7;
        const monDate = new Date(gDate);
        monDate.setDate(gDate.getDate() - daysBack);
        const m = monDate.getMonth() + 1;
        const d = monDate.getDate();
        week1Monday = `${monDate.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      }
    }
  }

  // 1. If today is strictly before Week 1 Monday, we are in Pre-Season
  if (today < week1Monday) {
    return {
      activeWeek: '0',
      reason: `Pre-Season Active (Week 1 begins Monday ${week1Monday})`,
      priorWeek: undefined,
      isAutoCalculated: true,
    };
  }

  // 2. Iterate through each game sequentially
  let determinedWeek = String(firstGame.week || '1');
  const firstGameOpponent = firstGame.opponent || firstGame.title || 'Game 1';
  let reason = `Week 1 Active (Lead-up to Game 1 vs ${firstGameOpponent})`;
  let priorWeek: string | undefined = '0';

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const hasScore = Boolean(
      g.result &&
      g.result.teamScore !== undefined &&
      g.result.opponentScore !== undefined &&
      g.result.teamScore !== null &&
      g.result.opponentScore !== null
    );
    const isPastGameDate = Boolean(g.date && today > g.date);
    const isCompleted = hasScore || isPastGameDate;

    if (isCompleted) {
      if (i + 1 < games.length) {
        const nextGame = games[i + 1];
        priorWeek = String(g.week || (i + 1));
        determinedWeek = String(nextGame.week || (i + 2));
        const cause = hasScore
          ? `Game ${i + 1} score entered (${g.result?.outcome} ${g.result?.teamScore}-${g.result?.opponentScore})`
          : `Day after scheduled Game ${i + 1} (${g.date})`;
        reason = `Week ${determinedWeek} Active (${cause})`;
      } else {
        priorWeek = String(g.week || games.length);
        determinedWeek = 'playoffs';
        reason = 'Playoffs / Post-Season Active (Regular season completed)';
      }
    } else {
      determinedWeek = String(g.week || (i + 1));
      priorWeek = i > 0 ? String(games[i - 1].week || i) : '0';
      const oppLabel = g.opponent ? `vs ${g.opponent}` : g.title;
      reason = `Week ${determinedWeek} Active (${oppLabel} on ${g.date || 'TBD'})`;
      break;
    }
  }

  return {
    activeWeek: determinedWeek,
    reason,
    priorWeek,
    isAutoCalculated: true,
  };
}

/**
 * Checks if a week needs player depth chart copying from a previous week:
 * Returns true if target week has formations but empty depthChart, and source week has depthChart entries.
 */
export function checkNeedsDepthChartCopy(
  weeklyData: Record<string, WeekState>,
  targetWeek: string,
  sourceWeek?: string
): { needsCopy: boolean; sourceWeek: string; sourcePlayerCount: number } {
  if (!targetWeek) return { needsCopy: false, sourceWeek: '', sourcePlayerCount: 0 };

  const targetState = weeklyData[targetWeek];
  const targetDepthCount = targetState?.depthChart
    ? Object.values(targetState.depthChart).reduce((acc, list) => acc + (list?.length || 0), 0)
    : 0;

  if (targetDepthCount > 0) {
    return { needsCopy: false, sourceWeek: '', sourcePlayerCount: 0 };
  }

  // Determine candidate source week (defaulting to previous numeric week or '0')
  let srcWk = sourceWeek;
  if (!srcWk) {
    const num = parseInt(targetWeek, 10);
    if (!isNaN(num) && num > 1) {
      srcWk = String(num - 1);
    } else if (targetWeek === '1') {
      srcWk = '0';
    } else if (targetWeek === 'playoffs') {
      srcWk = '8';
    } else if (targetWeek === 'championship') {
      srcWk = 'playoffs';
    } else {
      srcWk = '0';
    }
  }

  const srcState = weeklyData[srcWk];
  const srcPlayerCount = srcState?.depthChart
    ? Object.values(srcState.depthChart).reduce((acc, list) => acc + (list?.length || 0), 0)
    : 0;

  return {
    needsCopy: srcPlayerCount > 0,
    sourceWeek: srcWk,
    sourcePlayerCount: srcPlayerCount,
  };
}
