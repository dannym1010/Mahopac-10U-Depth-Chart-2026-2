import { ScheduleEvent, FormationBoard, PlacedPlayer, WeekState } from '../types';

export interface AutoWeekResult {
  activeWeek: string;
  reason: string;
  priorWeek?: string;
  isAutoCalculated: boolean;
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
  let reason = `Week 1 Active (Lead-up to Game 1 vs ${firstGame.opponent || firstGame.title || 'Carmel'})`;
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
