import { FormationBoard, PlacedPlayer, RosterPlayer } from '../types';
import { MASTER_ROSTER } from '../data/initialData';
import { deepClone } from '../services/storageService';

/**
 * Ensures roster array is valid, populated with required fields,
 * has default team assignments, and falls back to MASTER_ROSTER if empty.
 */
export function normalizeRoster(
  rawRoster: any[] | null | undefined,
  fallbackToMaster: boolean = true
): RosterPlayer[] {
  if (!rawRoster || !Array.isArray(rawRoster) || rawRoster.length === 0) {
    return fallbackToMaster ? deepClone(MASTER_ROSTER) : [];
  }

  const cleanList: RosterPlayer[] = rawRoster
    .filter((p) => Boolean(p && typeof p === 'object' && (p.num !== undefined && p.num !== null)))
    .map((p) => {
      const cleanNum = String(p.num).trim();
      const fName = (p.firstName || '').trim();
      const lName = (p.lastName || '').trim();
      const rName = (p.rosterName || lName || fName || '').trim();
      const team = (p.teamId || 'team_10u').trim();

      // Sanitize weeklyHours and migrate any legacy '0' week key to 'pre-1'
      const rawWeekly =
        p.weeklyHours && typeof p.weeklyHours === 'object' ? { ...p.weeklyHours } : {};
      if (rawWeekly['0'] !== undefined) {
        if (rawWeekly['pre-1'] === undefined) {
          rawWeekly['pre-1'] = rawWeekly['0'];
        }
        delete rawWeekly['0'];
      }

      return {
        num: cleanNum,
        firstName: fName,
        lastName: lName,
        rosterName: rName,
        teamId: team,
        primaryPosition: (p.primaryPosition || '').trim(),
        secondaryPosition: (p.secondaryPosition || '').trim(),
        offensivePosition: (p.offensivePosition || p.primaryPosition || '').trim(),
        defensivePosition: (p.defensivePosition || p.secondaryPosition || '').trim(),
        specialTeamsPosition: (p.specialTeamsPosition || '').trim(),
        conditioningHours: typeof p.conditioningHours === 'number' ? p.conditioningHours : 10,
        paddedHours: typeof p.paddedHours === 'number' ? p.paddedHours : 10,
        isCaptain: Boolean(p.isCaptain),
        notes: (p.notes || '').trim(),
        weeklyHours: Object.keys(rawWeekly).length > 0 ? rawWeekly : { 'pre-1': 0 },
      };
    });

  if (cleanList.length === 0 && fallbackToMaster) {
    return deepClone(MASTER_ROSTER);
  }

  return cleanList;
}

export interface PlayerDepthChartAssignment {
  positionName: string; // e.g. "QB", "MLB", "LT", "CB"
  unit: 'offense' | 'defense' | 'st' | 'groups';
  formationName: string;
  depthString: number; // 1 = Starter/1st string, 2 = 2nd string, etc.
  slotId: string;
}

export interface PlayerDerivedPositions {
  playerNum: string;
  playerName: string;
  assignments: PlayerDepthChartAssignment[];
  primaryOffense?: string;
  primaryDefense?: string;
  primarySpecialTeams?: string;
  suggestedPrimary: string;
  suggestedSecondary: string;
  summaryBadge: string; // e.g. "QB1 • FS2"
}

/**
 * Scans all active formation boards and depth chart player placements to calculate
 * the exact positions and depth strings for every player on the roster.
 */
export function getPlayerPositionsFromDepthChart(
  formations: FormationBoard[],
  depthChart: Record<string, PlacedPlayer[]>
): Map<string, PlayerDerivedPositions> {
  const playerMap = new Map<string, PlayerDerivedPositions>();

  if (!formations || !depthChart) return playerMap;

  // Build a lookup of position slot ID -> { positionName, unit, formationName }
  const slotLookup = new Map<
    string,
    { positionName: string; unit: 'offense' | 'defense' | 'st' | 'groups'; formationName: string }
  >();

  formations.forEach((form) => {
    if (!form || !form.rows) return;
    form.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (pos && pos.id && pos.name) {
          slotLookup.set(pos.id, {
            positionName: pos.name.trim(),
            unit: form.unit,
            formationName: form.name,
          });
        }
      });
    });
  });

  // Now inspect all placed players in depthChart
  Object.entries(depthChart).forEach(([posId, placedPlayers]) => {
    const slotInfo = slotLookup.get(posId);
    if (!slotInfo || !Array.isArray(placedPlayers)) return;

    placedPlayers.forEach((player, idx) => {
      if (!player || !player.num) return;
      const numKey = player.num.trim();
      const depthString = idx + 1; // 1st string, 2nd string, etc.

      let record = playerMap.get(numKey);
      if (!record) {
        record = {
          playerNum: numKey,
          playerName: player.name || '',
          assignments: [],
          suggestedPrimary: '',
          suggestedSecondary: '',
          summaryBadge: '',
        };
        playerMap.set(numKey, record);
      }

      record.assignments.push({
        positionName: slotInfo.positionName,
        unit: slotInfo.unit,
        formationName: slotInfo.formationName,
        depthString,
        slotId: posId,
      });

      // Update unit-specific primary positions (prefer 1st string)
      if (slotInfo.unit === 'offense') {
        if (!record.primaryOffense || depthString === 1) {
          record.primaryOffense = slotInfo.positionName;
        }
      } else if (slotInfo.unit === 'defense') {
        if (!record.primaryDefense || depthString === 1) {
          record.primaryDefense = slotInfo.positionName;
        }
      } else if (slotInfo.unit === 'st') {
        if (!record.primarySpecialTeams || depthString === 1) {
          record.primarySpecialTeams = slotInfo.positionName;
        }
      }
    });
  });

  // Calculate final suggested primary, secondary, and summary badges
  playerMap.forEach((rec) => {
    // Sort assignments: 1st string first, then offense/defense over ST
    rec.assignments.sort((a, b) => {
      if (a.depthString !== b.depthString) return a.depthString - b.depthString;
      const unitWeight = (u: string) => (u === 'offense' ? 3 : u === 'defense' ? 2 : 1);
      return unitWeight(b.unit) - unitWeight(a.unit);
    });

    const off1st = rec.assignments.find((a) => a.unit === 'offense' && a.depthString === 1);
    const def1st = rec.assignments.find((a) => a.unit === 'defense' && a.depthString === 1);
    const offAny = rec.assignments.find((a) => a.unit === 'offense');
    const defAny = rec.assignments.find((a) => a.unit === 'defense');

    rec.suggestedPrimary =
      off1st?.positionName ||
      def1st?.positionName ||
      rec.primaryOffense ||
      rec.primaryDefense ||
      rec.assignments[0]?.positionName ||
      'ATH';

    // Secondary is the other side of the ball or next assignment
    if (off1st && def1st) {
      rec.suggestedSecondary = def1st.positionName;
    } else if (off1st && defAny) {
      rec.suggestedSecondary = defAny.positionName;
    } else if (def1st && offAny) {
      rec.suggestedSecondary = offAny.positionName;
    } else {
      const remaining = rec.assignments.find((a) => a.positionName !== rec.suggestedPrimary);
      rec.suggestedSecondary = remaining?.positionName || rec.primaryDefense || rec.primarySpecialTeams || 'ATH';
    }

    // Build concise summary badge (e.g. "QB1 • FS2" or "LT1")
    const topBadges = rec.assignments.slice(0, 2).map((a) => `${a.positionName}${a.depthString}`);
    rec.summaryBadge = topBadges.join(' • ');
  });

  return playerMap;
}

/**
 * Bulk updates a list of roster players by applying positions directly from the active depth chart.
 */
export function syncRosterPositionsFromDepthChart(
  roster: RosterPlayer[],
  formations: FormationBoard[],
  depthChart: Record<string, PlacedPlayer[]>,
  options: { overwriteAll?: boolean; targetTeamId?: string } = {}
): { updatedRoster: RosterPlayer[]; countUpdated: number } {
  const derivedMap = getPlayerPositionsFromDepthChart(formations, depthChart);
  let countUpdated = 0;

  const updatedRoster = roster.map((player) => {
    if (options.targetTeamId && options.targetTeamId !== 'all' && player.teamId && player.teamId !== options.targetTeamId) {
      return player;
    }

    const derived = derivedMap.get(player.num.trim());
    if (!derived || derived.assignments.length === 0) {
      return player;
    }

    const newOffPos = derived.primaryOffense || player.offensivePosition || player.primaryPosition;
    const newDefPos = derived.primaryDefense || player.defensivePosition || player.secondaryPosition;
    const newPrimary = derived.suggestedPrimary || player.primaryPosition || 'ATH';
    const newSecondary = derived.suggestedSecondary || player.secondaryPosition || 'ATH';

    const hasChanged =
      player.primaryPosition !== newPrimary ||
      player.secondaryPosition !== newSecondary ||
      player.offensivePosition !== newOffPos ||
      player.defensivePosition !== newDefPos;

    if (hasChanged) {
      countUpdated++;
      return {
        ...player,
        primaryPosition: newPrimary,
        secondaryPosition: newSecondary,
        offensivePosition: newOffPos,
        defensivePosition: newDefPos,
        specialTeamsPosition: derived.primarySpecialTeams || player.specialTeamsPosition,
      };
    }

    return player;
  });

  return { updatedRoster, countUpdated };
}
