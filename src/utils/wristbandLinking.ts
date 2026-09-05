import { PlayDatabaseEntry, CallSheetFullData, CallSheetSection, CallSheetPlay } from '../types/callSheet';
import { WristbandData, SingleWristband } from '../types';

export interface WristbandSlotMatch {
  wristbandId: string;
  wristbandTitle: string;
  wristbandShort: string; // e.g. "WB1", "WB2"
  columnName: string;
  colIdx: number;
  rowIdx: number;
  slotLabel: string; // e.g. "1", "14"
  wristbandNum: number;
  playText: string;
  numberBgColor: string;
  rowBgColor?: string;
  highlightTarget: 'number_only' | 'full_row';
}

/**
 * Normalizes football play names for fuzzy lookup:
 * removes trailing spaces, punctuation, lowercase.
 */
export function normalizePlayName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove special chars
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determines or normalizes the personnel group of a play.
 * Uses play.personnel if present, or parses standard football nomenclature from the name/formation.
 */
export function extractPersonnel(play: {
  personnel?: string;
  name: string;
  formation?: string;
  unit?: string;
}): string {
  if (play.personnel && play.personnel.trim()) {
    const raw = play.personnel.trim();
    // Normalize variants
    if (raw.startsWith('21')) return '21 Personnel';
    if (raw.startsWith('32')) return '32 Personnel';
    if (raw.startsWith('11')) return '11 Personnel';
    if (raw.startsWith('12')) return '12 Personnel';
    if (raw.startsWith('10')) return '10 Spread';
    if (raw.startsWith('22')) return '22 Heavy';
    if (raw.startsWith('20')) return '20 Pistol';
    if (raw.toLowerCase().includes('jumbo') || raw.startsWith('23')) return 'Jumbo / Heavy';
    if (raw.toLowerCase().includes('nickel')) return 'Nickel';
    if (raw.toLowerCase().includes('dime')) return 'Dime';
    if (raw.toLowerCase().includes('base')) return 'Base 4-3 / 3-4';
    if (raw.toLowerCase().includes('goal line') || raw.toLowerCase().includes('goaline')) return 'Goal Line';
    if (raw.toLowerCase().includes('prevent')) return 'Prevent';
    return raw;
  }

  const nameUpper = (play.name || '').toUpperCase();
  const formUpper = (play.formation || '').toUpperCase();
  const combined = `${nameUpper} ${formUpper}`;

  // Offense standard prefixes
  if (combined.startsWith('21 ') || combined.includes('21 L') || combined.includes('21 R')) {
    return '21 Personnel';
  }
  if (combined.startsWith('32 ') || combined.includes('32 L') || combined.includes('32 R')) {
    return '32 Personnel';
  }
  if (combined.startsWith('11 ') || combined.includes('11 L') || combined.includes('11 R')) {
    return '11 Personnel';
  }
  if (combined.startsWith('12 ') || combined.includes('12 L') || combined.includes('12 R')) {
    return '12 Personnel';
  }
  if (combined.startsWith('10 ') || combined.includes('10 SPREAD') || combined.includes('EMPTY')) {
    return '10 Spread';
  }
  if (combined.startsWith('22 ') || combined.includes('22 HEAVY')) {
    return '22 Heavy';
  }
  if (combined.startsWith('20 ')) {
    return '20 Pistol';
  }
  if (combined.includes('JUMBO') || combined.startsWith('23 ')) {
    return 'Jumbo / Heavy';
  }

  // Defense standard
  if (combined.includes('NICKEL')) return 'Nickel';
  if (combined.includes('DIME')) return 'Dime';
  if (combined.includes('BASE') || combined.includes('4-3') || combined.includes('3-4')) return 'Base 4-3 / 3-4';
  if (combined.includes('GOAL LINE') || combined.includes('GOALINE') || combined.includes('6-2') || combined.includes('6-3')) {
    return 'Goal Line';
  }
  if (combined.includes('PREVENT')) return 'Prevent';

  return play.unit === 'defense' ? 'Base Defense' : 'Standard / Base';
}

export interface PersonnelSubTab {
  id: string;
  label: string;
  count: number;
}

/**
 * Builds the sub-tab breakdown list for plays grouped by personnel.
 */
export function getPersonnelSubTabs(
  plays: PlayDatabaseEntry[],
  unit: 'offense' | 'defense'
): PersonnelSubTab[] {
  const unitPlays = plays.filter((p) => p.unit === unit);
  const countsMap = new Map<string, number>();

  unitPlays.forEach((p) => {
    const pkg = extractPersonnel(p);
    countsMap.set(pkg, (countsMap.get(pkg) || 0) + 1);
  });

  // Pre-sorted preferred order
  const preferredOffense = [
    '21 Personnel',
    '32 Personnel',
    '11 Personnel',
    '12 Personnel',
    '10 Spread',
    '22 Heavy',
    '20 Pistol',
    'Jumbo / Heavy',
    'Standard / Base',
  ];

  const preferredDefense = [
    'Base 4-3 / 3-4',
    'Nickel',
    'Dime',
    'Goal Line',
    'Prevent',
    'Base Defense',
  ];

  const preferred = unit === 'offense' ? preferredOffense : preferredDefense;
  const tabs: PersonnelSubTab[] = [
    { id: 'all', label: 'All Plays', count: unitPlays.length },
  ];

  preferred.forEach((label) => {
    const count = countsMap.get(label);
    if (count !== undefined && count > 0) {
      tabs.push({ id: label, label, count });
      countsMap.delete(label);
    }
  });

  // Any remaining custom personnel
  Array.from(countsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      tabs.push({ id: label, label, count });
    });

  return tabs;
}

/**
 * Builds a fast lookup index of every play placed on active wristbands.
 */
export function buildWristbandIndex(
  wristbandData?: WristbandData
): Map<string, WristbandSlotMatch> {
  const index = new Map<string, WristbandSlotMatch>();
  if (!wristbandData || !wristbandData.wristbands) return index;

  wristbandData.wristbands.forEach((wb, wbIdx) => {
    const wbShort = `WB${wbIdx + 1}`;
    const rows = wb.rowsCount || 13;
    const highlightTarget = wb.highlightTarget || 'number_only';

    (wb.columns || []).forEach((col, cIdx) => {
      (col.plays || []).forEach((play, rIdx) => {
        if (!play.text || !play.text.trim()) return;

        // Slot number / label
        let slotLabel = `${rIdx + 1}`;
        let wbNum = rIdx + 1;
        if (play.customLabel) {
          slotLabel = play.customLabel;
          const parsed = parseInt(play.customLabel.replace(/[^\d]/g, ''), 10);
          if (!isNaN(parsed)) wbNum = parsed;
        } else if (wb.labelingMode === 'same_per_card') {
          wbNum = cIdx * rows + rIdx + 1;
          slotLabel = String(wbNum);
        } else if (wb.labelingMode === 'continuous') {
          const base = (wb.startNumber || 1) + wbIdx * (rows * (wb.columns?.length || 2));
          wbNum = base + cIdx * rows + rIdx;
          slotLabel = String(wbNum);
        } else if (wb.labelingMode === 'letter_num') {
          const letter = cIdx === 0 ? 'A' : cIdx === 1 ? 'B' : 'C';
          slotLabel = `${letter}${rIdx + 1}`;
          wbNum = cIdx * rows + rIdx + 1;
        }

        // Color resolution
        const numberBgColor =
          play.numberHighlightColor ||
          col.numberBgColor ||
          col.color ||
          '#facc15';

        const match: WristbandSlotMatch = {
          wristbandId: wb.id,
          wristbandTitle: wb.title || `Wristband ${wbIdx + 1}`,
          wristbandShort: wbShort,
          columnName: col.name || `Column ${cIdx + 1}`,
          colIdx: cIdx,
          rowIdx: rIdx,
          slotLabel,
          wristbandNum: wbNum,
          playText: play.text.trim(),
          numberBgColor,
          rowBgColor: play.highlightColor,
          highlightTarget,
        };

        // Index by normalized name
        const norm = normalizePlayName(play.text);
        if (norm && !index.has(norm)) {
          index.set(norm, match);
        }
      });
    });
  });

  return index;
}

/**
 * Looks up wristband slot info for a given play name.
 */
export function lookupWristbandPlay(
  playName: string,
  index: Map<string, WristbandSlotMatch>
): WristbandSlotMatch | undefined {
  if (!playName) return undefined;
  const norm = normalizePlayName(playName);
  return index.get(norm);
}

/**
 * Automatically syncs all call sheet plays with their wristband counterparts.
 * Updates wristbandNum, wristbandLabel, wristbandNumberColor, etc.
 */
export function syncCallSheetWithWristbands(
  callSheetData: CallSheetFullData,
  wristbandData?: WristbandData
): { updatedCallSheet: CallSheetFullData; matchedCount: number } {
  const index = buildWristbandIndex(wristbandData);
  let matchedCount = 0;

  const syncPlay = (play: CallSheetPlay | null): CallSheetPlay | null => {
    if (!play || !play.name) return play;
    const match = lookupWristbandPlay(play.name, index);
    if (!match) return play;

    matchedCount++;
    return {
      ...play,
      wristbandNum: match.wristbandNum,
      wristbandLabel: match.slotLabel,
      wristbandId: match.wristbandId,
      wristbandTitle: match.wristbandTitle,
      wristbandNumberColor: match.numberBgColor,
      wristbandRowColor: match.rowBgColor,
      wristbandHighlightTarget: match.highlightTarget,
      wristbandColor: match.numberBgColor,
    };
  };

  const updatedOffense = callSheetData.offenseSections.map((sec) => ({
    ...sec,
    plays: sec.plays.map(syncPlay),
  }));

  const updatedDefense = callSheetData.defenseSections.map((sec) => ({
    ...sec,
    plays: sec.plays.map(syncPlay),
  }));

  const updatedOffenseScript = callSheetData.offenseScript.map(syncPlay);
  const updatedDefenseScript = callSheetData.defenseScript.map(syncPlay);

  return {
    updatedCallSheet: {
      ...callSheetData,
      offenseSections: updatedOffense,
      defenseSections: updatedDefense,
      offenseScript: updatedOffenseScript,
      defenseScript: updatedDefenseScript,
    },
    matchedCount,
  };
}

/**
 * Creates a brand new Call Sheet Section from a SingleWristband insert.
 */
export function createSectionFromWristband(
  wb: SingleWristband,
  group: CallSheetSection['group'] = 'custom'
): CallSheetSection {
  const rows = wb.rowsCount || 13;
  const cols = wb.columns || [];
  const highlightTarget = wb.highlightTarget || 'number_only';

  const playsList: (CallSheetPlay | null)[] = [];

  cols.forEach((col, cIdx) => {
    (col.plays || []).forEach((p, rIdx) => {
      let slotLabel = `${rIdx + 1}`;
      let wbNum = rIdx + 1;
      if (p.customLabel) {
        slotLabel = p.customLabel;
        const parsed = parseInt(p.customLabel.replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsed)) wbNum = parsed;
      } else if (wb.labelingMode === 'same_per_card') {
        wbNum = cIdx * rows + rIdx + 1;
        slotLabel = String(wbNum);
      } else if (wb.labelingMode === 'continuous') {
        wbNum = (wb.startNumber || 1) + cIdx * rows + rIdx;
        slotLabel = String(wbNum);
      } else if (wb.labelingMode === 'letter_num') {
        const letter = cIdx === 0 ? 'A' : cIdx === 1 ? 'B' : 'C';
        slotLabel = `${letter}${rIdx + 1}`;
        wbNum = cIdx * rows + rIdx + 1;
      }

      const numberBgColor =
        p.numberHighlightColor ||
        col.numberBgColor ||
        col.color ||
        '#facc15';

      if (p.text && p.text.trim()) {
        const personnel = extractPersonnel({ name: p.text });
        playsList.push({
          id: `wb_sec_${wb.id}_${cIdx}_${rIdx}_${Date.now()}`,
          name: p.text.trim(),
          type: 'run',
          wristbandNum: wbNum,
          wristbandLabel: slotLabel,
          wristbandId: wb.id,
          wristbandTitle: wb.title,
          wristbandNumberColor: numberBgColor,
          wristbandRowColor: p.highlightColor,
          wristbandHighlightTarget: highlightTarget,
          wristbandColor: numberBgColor,
          personnel,
        });
      } else {
        playsList.push(null);
      }
    });
  });

  return {
    id: `sec_wb_${wb.id}_${Date.now()}`,
    title: wb.title ? `⌚ ${wb.title.toUpperCase()}` : '⌚ WRISTBAND INSERT PLAYS',
    subtitle: wb.subtitle || `Cards 1 - ${playsList.length}`,
    headerBgColor: '#09090b',
    headerTextColor: '#ffffff',
    targetUnit: 'offense',
    group,
    slotsCount: playsList.length,
    columnsCount: cols.length > 1 ? 2 : 1,
    highlightEnabled: true,
    highlightColor: 'yellow',
    plays: playsList,
  };
}
