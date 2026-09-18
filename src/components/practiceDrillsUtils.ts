import {
  LiveDrillGroup,
  LiveDrillFormat,
  LiveDrillPosition,
  PlacedPlayer,
  RosterPlayer,
  FormationBoard,
} from '../types';

// ============================================================================
// 1. TEAM COLORS SYSTEM
// ============================================================================
export interface TeamColorConfig {
  id: string;
  label: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  bgLightClass: string;
  ringClass: string;
  headerGrad: string;
  chipBg: string;
  chipText: string;
  printBorder: string;
}

export const TEAM_COLOR_OPTIONS: TeamColorConfig[] = [
  {
    id: 'gold',
    label: 'Gold / Yellow',
    hex: '#f59e0b',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950',
    borderClass: 'border-amber-400 dark:border-amber-500/70',
    bgLightClass: 'bg-amber-500/10 dark:bg-amber-500/15',
    ringClass: 'ring-amber-400',
    headerGrad: 'from-amber-500/20 to-amber-500/5',
    chipBg: 'bg-amber-500',
    chipText: 'text-slate-950 font-black',
    printBorder: 'border-amber-500',
  },
  {
    id: 'blue',
    label: 'Royal Blue',
    hex: '#2563eb',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    borderClass: 'border-blue-500 dark:border-blue-500/70',
    bgLightClass: 'bg-blue-500/10 dark:bg-blue-500/15',
    ringClass: 'ring-blue-500',
    headerGrad: 'from-blue-600/20 to-blue-600/5',
    chipBg: 'bg-blue-600',
    chipText: 'text-white font-black',
    printBorder: 'border-blue-600',
  },
  {
    id: 'navy',
    label: 'Navy Blue',
    hex: '#1e1b4b',
    badgeBg: 'bg-indigo-950',
    badgeText: 'text-white border border-indigo-700',
    borderClass: 'border-indigo-800 dark:border-indigo-600/70',
    bgLightClass: 'bg-indigo-900/15 dark:bg-indigo-900/25',
    ringClass: 'ring-indigo-600',
    headerGrad: 'from-indigo-900/30 to-indigo-900/10',
    chipBg: 'bg-indigo-900',
    chipText: 'text-white font-black',
    printBorder: 'border-indigo-900',
  },
  {
    id: 'red',
    label: 'Cardinal / Red',
    hex: '#e11d48',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    borderClass: 'border-rose-500 dark:border-rose-500/70',
    bgLightClass: 'bg-rose-500/10 dark:bg-rose-500/15',
    ringClass: 'ring-rose-500',
    headerGrad: 'from-rose-600/20 to-rose-600/5',
    chipBg: 'bg-rose-600',
    chipText: 'text-white font-black',
    printBorder: 'border-rose-600',
  },
  {
    id: 'green',
    label: 'Kelly / Forest Green',
    hex: '#059669',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    borderClass: 'border-emerald-500 dark:border-emerald-500/70',
    bgLightClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    ringClass: 'ring-emerald-500',
    headerGrad: 'from-emerald-600/20 to-emerald-600/5',
    chipBg: 'bg-emerald-600',
    chipText: 'text-white font-black',
    printBorder: 'border-emerald-600',
  },
  {
    id: 'black',
    label: 'Black / Stealth',
    hex: '#0f172a',
    badgeBg: 'bg-slate-950',
    badgeText: 'text-white border border-slate-700',
    borderClass: 'border-slate-800 dark:border-slate-600',
    bgLightClass: 'bg-slate-900/10 dark:bg-slate-800/50',
    ringClass: 'ring-slate-400',
    headerGrad: 'from-slate-900/30 to-slate-900/10',
    chipBg: 'bg-slate-900',
    chipText: 'text-white font-black',
    printBorder: 'border-slate-900',
  },
  {
    id: 'white',
    label: 'White / Silver',
    hex: '#f1f5f9',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-900 border border-slate-300',
    borderClass: 'border-slate-300 dark:border-slate-600',
    bgLightClass: 'bg-slate-100/80 dark:bg-slate-800/40',
    ringClass: 'ring-slate-300',
    headerGrad: 'from-slate-200/50 to-slate-100/20',
    chipBg: 'bg-slate-200 dark:bg-slate-700',
    chipText: 'text-slate-900 dark:text-white font-black',
    printBorder: 'border-slate-400',
  },
  {
    id: 'orange',
    label: 'Orange / Blaze',
    hex: '#ea580c',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    borderClass: 'border-orange-500 dark:border-orange-500/70',
    bgLightClass: 'bg-orange-500/10 dark:bg-orange-500/15',
    ringClass: 'ring-orange-500',
    headerGrad: 'from-orange-500/20 to-orange-500/5',
    chipBg: 'bg-orange-500',
    chipText: 'text-white font-black',
    printBorder: 'border-orange-500',
  },
  {
    id: 'purple',
    label: 'Purple',
    hex: '#9333ea',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    borderClass: 'border-purple-500 dark:border-purple-500/70',
    bgLightClass: 'bg-purple-500/10 dark:bg-purple-500/15',
    ringClass: 'ring-purple-500',
    headerGrad: 'from-purple-600/20 to-purple-600/5',
    chipBg: 'bg-purple-600',
    chipText: 'text-white font-black',
    printBorder: 'border-purple-600',
  },
  {
    id: 'cyan',
    label: 'Teal / Aqua',
    hex: '#0891b2',
    badgeBg: 'bg-cyan-600',
    badgeText: 'text-white',
    borderClass: 'border-cyan-500 dark:border-cyan-500/70',
    bgLightClass: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    ringClass: 'ring-cyan-500',
    headerGrad: 'from-cyan-600/20 to-cyan-600/5',
    chipBg: 'bg-cyan-600',
    chipText: 'text-white font-black',
    printBorder: 'border-cyan-600',
  },
];

export const TEAM_COLOR_MAP: Record<string, TeamColorConfig> = TEAM_COLOR_OPTIONS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, TeamColorConfig>
);

export function getTeamColorConfig(colorId?: string, fallback: 'gold' | 'blue' = 'gold'): TeamColorConfig {
  if (colorId && TEAM_COLOR_MAP[colorId]) {
    return TEAM_COLOR_MAP[colorId];
  }
  return TEAM_COLOR_MAP[fallback] || TEAM_COLOR_OPTIONS[0];
}

// Preset color matchups
export const COLOR_MATCHUP_PRESETS = [
  { label: 'Gold vs Blue (Home Scrimmage)', offense: 'gold', defense: 'blue' },
  { label: 'White vs Blue (Game Simulation)', offense: 'white', defense: 'blue' },
  { label: 'Red vs White (Varsity vs Scout)', offense: 'red', defense: 'white' },
  { label: 'Black vs Gold (Under the Lights)', offense: 'black', defense: 'gold' },
  { label: 'Green vs White (Spring Game)', offense: 'green', defense: 'white' },
  { label: 'Navy vs Orange (Bears / Broncos)', offense: 'navy', defense: 'orange' },
];

// ============================================================================
// 2. QUICK GROUP LABELS PRESETS
// ============================================================================
export const OFFENSE_LABEL_PRESETS = [
  '1st Team Offense (Gold)',
  '2nd Team Offense (Blue)',
  'Varsity Offense',
  'JV Offense',
  'Scout Offense (Opponent Look)',
  'Red Zone Offense',
  '2-Minute Offense',
  'Goal Line Offense',
  'Heavy / Short Yardage',
  'Empty / 5-Wide',
];

export const DEFENSE_LABEL_PRESETS = [
  '1st Team Defense (Blue)',
  '2nd Team Defense (Gold)',
  'Varsity Defense',
  'JV Defense',
  'Scout Defense (Opponent Look)',
  'Lockdown Defense',
  'Goal Line Defense',
  'Nickel Package (Passing Downs)',
  'Dime Package',
  'Prevent / 2-Minute Defense',
];

// Suggested position buttons for adding slots
export const SUGGESTED_OFFENSE_TAGS = [
  'QB', 'RB', 'FB', 'WR (X)', 'WR (Z)', 'Slot (W)', 'H / Slot', 'TE (Y)',
  'LT', 'LG', 'C', 'RG', 'RT', 'TE 2', 'WR 3', 'Wing',
];

export const SUGGESTED_DEFENSE_TAGS = [
  'CB1', 'CB2', 'FS', 'SS', 'MLB', 'WLB', 'SLB', 'Nickel / DB',
  'LDE', 'LDT', 'RDT', 'RDE', 'NT', 'Rover', 'Edge', 'Dime DB',
];

// ============================================================================
// 3. DEFAULT DRILL POSITIONS GENERATOR
// ============================================================================
export function generateDefaultPositions(format: LiveDrillFormat): {
  offense: LiveDrillPosition[];
  defense: LiveDrillPosition[];
} {
  const ts = Date.now();
  if (format === '7v7') {
    return {
      offense: [
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
        { id: `off_x_${ts}`, name: 'WR (X)', unit: 'offense' },
        { id: `off_z_${ts}`, name: 'WR (Z)', unit: 'offense' },
        { id: `off_w_${ts}`, name: 'Slot (W)', unit: 'offense' },
        { id: `off_y_${ts}`, name: 'TE (Y)', unit: 'offense' },
        { id: `off_h_${ts}`, name: 'H / Slot', unit: 'offense' },
      ],
      defense: [
        { id: `def_cb1_${ts}`, name: 'CB1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB2', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB / Nickel', unit: 'defense' },
      ],
    };
  }

  if (format === '11v11') {
    return {
      offense: [
        { id: `off_lt_${ts}`, name: 'LT', unit: 'offense' },
        { id: `off_lg_${ts}`, name: 'LG', unit: 'offense' },
        { id: `off_c_${ts}`, name: 'C', unit: 'offense' },
        { id: `off_rg_${ts}`, name: 'RG', unit: 'offense' },
        { id: `off_rt_${ts}`, name: 'RT', unit: 'offense' },
        { id: `off_te_${ts}`, name: 'TE (Y)', unit: 'offense' },
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
        { id: `off_x_${ts}`, name: 'WR (X)', unit: 'offense' },
        { id: `off_z_${ts}`, name: 'WR (Z)', unit: 'offense' },
        { id: `off_w_${ts}`, name: 'Slot (W)', unit: 'offense' },
      ],
      defense: [
        { id: `def_lde_${ts}`, name: 'LDE', unit: 'defense' },
        { id: `def_ldt_${ts}`, name: 'LDT', unit: 'defense' },
        { id: `def_rdt_${ts}`, name: 'RDT', unit: 'defense' },
        { id: `def_rde_${ts}`, name: 'RDE', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB', unit: 'defense' },
        { id: `def_cb1_${ts}`, name: 'CB1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB2', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
      ],
    };
  }

  if (format === '9v9') {
    return {
      offense: [
        { id: `off_lt_${ts}`, name: 'LT', unit: 'offense' },
        { id: `off_lg_${ts}`, name: 'LG', unit: 'offense' },
        { id: `off_c_${ts}`, name: 'C', unit: 'offense' },
        { id: `off_rg_${ts}`, name: 'RG', unit: 'offense' },
        { id: `off_rt_${ts}`, name: 'RT', unit: 'offense' },
        { id: `off_te_${ts}`, name: 'TE (Y)', unit: 'offense' },
        { id: `off_qb_${ts}`, name: 'QB', unit: 'offense' },
        { id: `off_fb_${ts}`, name: 'FB', unit: 'offense' },
        { id: `off_rb_${ts}`, name: 'RB', unit: 'offense' },
      ],
      defense: [
        { id: `def_lde_${ts}`, name: 'LDE', unit: 'defense' },
        { id: `def_ldt_${ts}`, name: 'LDT', unit: 'defense' },
        { id: `def_rdt_${ts}`, name: 'RDT', unit: 'defense' },
        { id: `def_rde_${ts}`, name: 'RDE', unit: 'defense' },
        { id: `def_wlb_${ts}`, name: 'WLB', unit: 'defense' },
        { id: `def_mlb_${ts}`, name: 'MLB', unit: 'defense' },
        { id: `def_slb_${ts}`, name: 'SLB', unit: 'defense' },
        { id: `def_fs_${ts}`, name: 'FS', unit: 'defense' },
        { id: `def_ss_${ts}`, name: 'SS', unit: 'defense' },
      ],
    };
  }

  if (format === '1v1') {
    return {
      offense: [
        { id: `off_wr1_${ts}`, name: 'WR 1', unit: 'offense' },
        { id: `off_wr2_${ts}`, name: 'WR 2', unit: 'offense' },
        { id: `off_wr3_${ts}`, name: 'WR 3', unit: 'offense' },
        { id: `off_te1_${ts}`, name: 'TE (Y)', unit: 'offense' },
      ],
      defense: [
        { id: `def_cb1_${ts}`, name: 'CB 1', unit: 'defense' },
        { id: `def_cb2_${ts}`, name: 'CB 2', unit: 'defense' },
        { id: `def_nb1_${ts}`, name: 'Nickel / DB', unit: 'defense' },
        { id: `def_s1_${ts}`, name: 'Safety', unit: 'defense' },
      ],
    };
  }

  // Custom default (5v5 Trenches / Linemen)
  return {
    offense: [
      { id: `off_lt_${ts}`, name: 'LT', unit: 'offense' },
      { id: `off_lg_${ts}`, name: 'LG', unit: 'offense' },
      { id: `off_c_${ts}`, name: 'C', unit: 'offense' },
      { id: `off_rg_${ts}`, name: 'RG', unit: 'offense' },
      { id: `off_rt_${ts}`, name: 'RT', unit: 'offense' },
    ],
    defense: [
      { id: `def_lde_${ts}`, name: 'LDE', unit: 'defense' },
      { id: `def_ldt_${ts}`, name: 'LDT', unit: 'defense' },
      { id: `def_nt_${ts}`, name: 'NT', unit: 'defense' },
      { id: `def_rdt_${ts}`, name: 'RDT', unit: 'defense' },
      { id: `def_rde_${ts}`, name: 'RDE', unit: 'defense' },
    ],
  };
}

export function createInitialPracticeDrillGroups(): LiveDrillGroup[] {
  const g7 = generateDefaultPositions('7v7');
  const g11 = generateDefaultPositions('11v11');

  return [
    {
      id: `live_group_7v7_${Date.now()}`,
      name: 'Period 4: 7v7 Pass Skeleton',
      format: '7v7',
      offenseLabel: '1st Team Offense (Gold)',
      defenseLabel: '1st Team Defense (Blue)',
      offenseColor: 'gold',
      defenseColor: 'blue',
      notes: 'Focus on 3-step & 5-step pass drops. Defense in Cover 3 match.',
      offensePositions: g7.offense,
      defensePositions: g7.defense,
      lineup: {},
      createdAt: Date.now(),
    },
    {
      id: `live_group_11v11_${Date.now() + 1}`,
      name: 'Period 6: 11v11 Team Live',
      format: '11v11',
      offenseLabel: 'Varsity Offense',
      defenseLabel: 'Varsity Defense',
      offenseColor: 'gold',
      defenseColor: 'blue',
      notes: 'Full team live 11v11 script with offensive & defensive rotations.',
      offensePositions: g11.offense,
      defensePositions: g11.defense,
      lineup: {},
      createdAt: Date.now() + 1,
    },
  ];
}

// ============================================================================
// 4. SMART POSITION MATCHING & AUTO-FILL ENGINE
// ============================================================================

/**
 * Normalizes text for position comparisons (lowercased, alphanumeric only)
 */
export function normalizePositionToken(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Maps common football synonyms to position keys
 */
const POSITION_SYNONYMS: Record<string, string[]> = {
  qb: ['qb', '1', '1qb', 'quarterback', 'passer', 'grpqb', '211'],
  rb: ['rb', 'hb', 'fb', '3hb', '2fb', '4rb', 'halfback', 'tailback', 'fullback', 'runningback', 'grprb', 'grpfb', '212', '213'],
  fb: ['fb', '2fb', 'fullback', 'hback', 'grpfb', '212'],
  wr_x: ['x', 'wrx', 'wr1', 'wideout1', 'splitend', 'grpx', '21x'],
  wr_z: ['z', 'wrz', 'wr2', 'flanker', 'grpz', '21z'],
  wr_w: ['w', 'slotw', 'slot', 'h', 'wr3', 'slot1', 'hslot', 'slot2'],
  te_y: ['y', 'y1', 'y2', 'te', 'tey', 'tes', 'tightend', 'grptes', '21y1'],
  lt: ['lt', 'lefttackle', 'ot1', 'ot', 't1', 'grplt', '21lt'],
  lg: ['lg', 'leftguard', 'og1', 'og', 'g1', 'grplg', '21lg'],
  c: ['c', 'center', 'grpc', '21c'],
  rg: ['rg', 'rightguard', 'og2', 'og', 'g2', 'grprg', '21rg'],
  rt: ['rt', 'righttackle', 'ot2', 'ot', 't2', 'grprt', '21rt'],
  lde: ['lde', 'de1', 'wde', 'le', 'de', 'edge', 'defensiveend1', '53de1', '44wde'],
  rde: ['rde', 'de2', 'sde', 're', 'de', 'edge', 'defensiveend2', '53de2', '44sde'],
  ldt: ['ldt', 'dt1', 'dt', 'defensivetackle1', 'tackle1', '53dt1', '44dt1'],
  rdt: ['rdt', 'dt2', 'nt', 'nosetackle', 'nose', 'dt', 'defensivetackle2', '53dt2', '44dt2'],
  nt: ['nt', 'nose', 'nosetackle', 'dt1', 'dt2', '53nt'],
  mlb: ['mlb', 'mike', 'middlelinebacker', 'ilb', 'lb1', 'grpmike', '53mike', '44mike'],
  wlb: ['wlb', 'will', 'weaklinebacker', 'olb1', 'lb2', 'grpwill', '53will', '44will'],
  slb: ['slb', 'sam', 'stronglinebacker', 'olb2', 'lb3', 'rover', 'grpsam', '53sam', '44sam', '44rover'],
  cb1: ['cb1', 'cb', 'corner1', 'lcb', 'cornerback1', 'grpcb1', '53cb2', '44cb1'],
  cb2: ['cb2', 'cb', 'corner2', 'rcb', 'cornerback2', 'grpcb2', '53cb1', '44cb2'],
  fs: ['fs', 'freesafety', 'safety1', 'fsafety', 'grpfs', '53fs', '44fs', 'safety'],
  ss: ['ss', 'strongsafety', 'rover', 'safety2', 'ssafety', 'grprover', '44rover', 'nickel', 'safety'],
  nickel: ['nickel', 'nb', 'slotdb', 'db', 'rover', 'slb', 'ss', 'cb'],
};

/**
 * Checks if target position name matches a candidate position name or ID
 */
export function isPositionMatch(targetName: string, candidateName: string, candidateId: string = ''): boolean {
  const cleanTarget = normalizePositionToken(targetName);
  const cleanCandName = normalizePositionToken(candidateName);
  const cleanCandId = normalizePositionToken(candidateId);

  // Exact match
  if (cleanTarget === cleanCandName || cleanTarget === cleanCandId) {
    return true;
  }

  // Check synonym groupings
  for (const [key, synonyms] of Object.entries(POSITION_SYNONYMS)) {
    const targetMatchesGroup = synonyms.some(
      (s) => cleanTarget === s || cleanTarget.includes(s) || s.includes(cleanTarget)
    );
    if (targetMatchesGroup) {
      const candMatchesGroup = synonyms.some(
        (s) => cleanCandName === s || cleanCandName.includes(s) || cleanCandId === s || cleanCandId.includes(s)
      );
      if (candMatchesGroup) {
        return true;
      }
    }
  }

  // Substring inclusion fallback for clear tokens
  if (cleanTarget.length >= 2) {
    if (cleanCandName.includes(cleanTarget) || cleanTarget.includes(cleanCandName)) {
      return true;
    }
  }

  return false;
}

export interface AutoFillSummary {
  filledOffense: number;
  totalOffense: number;
  filledDefense: number;
  totalDefense: number;
  sourceDescription: string;
}

/**
 * High-powered, intelligent auto-fill for drill positions
 * 1. Checks Depth Chart across ALL formations (Offense, Defense, Groups)
 * 2. Checks Scrimmage Chart
 * 3. Falls back to Active Roster by Primary Position
 * 4. Ensures no duplicate assignments within the same string
 */
export function executeIntelligentAutoFill(params: {
  group: LiveDrillGroup;
  formations: FormationBoard[];
  depthChart: Record<string, PlacedPlayer[]>;
  scrimmageChart?: Record<string, PlacedPlayer[]>;
  roster: RosterPlayer[];
  targetString?: 1 | 2; // 1 = Starters, 2 = Backups
  fillUnit?: 'both' | 'offense' | 'defense';
}): { nextLineup: Record<string, PlacedPlayer[]>; summary: AutoFillSummary } {
  const {
    group,
    formations = [],
    depthChart = {},
    scrimmageChart = {},
    roster = [],
    targetString = 1,
    fillUnit = 'both',
  } = params;

  const nextLineup: Record<string, PlacedPlayer[]> = { ...group.lineup };

  let filledOffense = 0;
  let filledDefense = 0;

  // Track used players per unit to prevent placing the same kid in 3 slots
  const usedOffenseNums = new Set<string>();
  const usedDefenseNums = new Set<string>();

  // If preserving existing starters when filling backups or vice versa:
  // For targetString === 1, we replace or set slot[0]
  // For targetString === 2, we replace or append slot[1]

  // Collect all depth chart candidates across all formations
  const depthCandidates: { posName: string; posId: string; players: PlacedPlayer[] }[] = [];
  for (const form of formations) {
    for (const row of form.rows || []) {
      for (const p of row.positions || []) {
        if (!p) continue;
        const players = depthChart[p.id] || [];
        if (players.length > 0) {
          depthCandidates.push({ posName: p.name, posId: p.id, players });
        }
      }
    }
  }

  // Also include scrimmage chart candidates
  const scrimmageCandidates: { posId: string; players: PlacedPlayer[] }[] = [];
  for (const [posId, players] of Object.entries(scrimmageChart)) {
    if (players && players.length > 0) {
      scrimmageCandidates.push({ posId, players });
    }
  }

  // Helper to find best player for a position slot
  const findBestPlayerForSlot = (
    pos: LiveDrillPosition,
    unit: 'offense' | 'defense',
    usedNums: Set<string>
  ): PlacedPlayer | null => {
    // 1. Check Depth Chart candidates
    for (const cand of depthCandidates) {
      if (isPositionMatch(pos.name, cand.posName, cand.posId)) {
        // Look for target string player, or fallback to first unused
        const desiredIdx = targetString - 1;
        const targetPlayer = cand.players[desiredIdx] || cand.players[0];
        if (targetPlayer && !usedNums.has(String(targetPlayer.num))) {
          return targetPlayer;
        }
        // If target was already used, try any other player in that depth slot
        for (const p of cand.players) {
          if (!usedNums.has(String(p.num))) {
            return p;
          }
        }
      }
    }

    // 2. Check Scrimmage Chart candidates
    for (const cand of scrimmageCandidates) {
      if (isPositionMatch(pos.name, cand.posId, cand.posId)) {
        for (const p of cand.players) {
          if (!usedNums.has(String(p.num))) {
            return p;
          }
        }
      }
    }

    // 3. Fallback: Search active Roster by primary position
    const cleanPos = normalizePositionToken(pos.name);
    const matchingRoster = roster.filter((r) => {
      const rPos = normalizePositionToken(r.primaryPosition || '');
      return (
        !usedNums.has(String(r.num)) &&
        (isPositionMatch(pos.name, rPos, '') || (rPos && cleanPos.includes(rPos)))
      );
    });

    if (matchingRoster.length > 0) {
      // Pick based on target string (1st candidate for starters, 2nd for backups)
      const pickedRoster =
        targetString === 2 && matchingRoster.length > 1 ? matchingRoster[1] : matchingRoster[0];
      return {
        num: pickedRoster.num,
        name: `${pickedRoster.firstName} ${pickedRoster.lastName}`.trim() || pickedRoster.rosterName,
      };
    }

    // 4. Last-ditch: if starters still need a player and this is high-priority slot (QB, C, MLB, etc.),
    // find any available unused athlete from roster
    const generalAthletes = roster.filter((r) => !usedNums.has(String(r.num)));
    if (generalAthletes.length > 0 && targetString === 1) {
      const athlete = generalAthletes[0];
      return {
        num: athlete.num,
        name: `${athlete.firstName} ${athlete.lastName}`.trim() || athlete.rosterName,
      };
    }

    return null;
  };

  // Process Offense
  if (fillUnit === 'both' || fillUnit === 'offense') {
    group.offensePositions.forEach((pos) => {
      const player = findBestPlayerForSlot(pos, 'offense', usedOffenseNums);
      if (player) {
        usedOffenseNums.add(String(player.num));
        filledOffense++;

        const currentList = nextLineup[pos.id] || [];
        if (targetString === 1) {
          // Set as starter (index 0)
          const remaining = currentList.filter((p) => String(p.num) !== String(player.num));
          nextLineup[pos.id] = [player, ...remaining];
        } else {
          // Set as backup (index 1)
          const starter = currentList[0];
          const filtered = currentList.filter(
            (p, idx) => idx > 0 && String(p.num) !== String(player.num)
          );
          if (starter) {
            nextLineup[pos.id] = [starter, player, ...filtered];
          } else {
            nextLineup[pos.id] = [player, ...filtered];
          }
        }
      }
    });
  }

  // Process Defense
  if (fillUnit === 'both' || fillUnit === 'defense') {
    group.defensePositions.forEach((pos) => {
      const player = findBestPlayerForSlot(pos, 'defense', usedDefenseNums);
      if (player) {
        usedDefenseNums.add(String(player.num));
        filledDefense++;

        const currentList = nextLineup[pos.id] || [];
        if (targetString === 1) {
          const remaining = currentList.filter((p) => String(p.num) !== String(player.num));
          nextLineup[pos.id] = [player, ...remaining];
        } else {
          const starter = currentList[0];
          const filtered = currentList.filter(
            (p, idx) => idx > 0 && String(p.num) !== String(player.num)
          );
          if (starter) {
            nextLineup[pos.id] = [starter, player, ...filtered];
          } else {
            nextLineup[pos.id] = [player, ...filtered];
          }
        }
      }
    });
  }

  const stringName = targetString === 1 ? '1st String Starters' : '2nd String Backups';

  return {
    nextLineup,
    summary: {
      filledOffense,
      totalOffense: group.offensePositions.length,
      filledDefense,
      totalDefense: group.defensePositions.length,
      sourceDescription: `${stringName} from Depth Chart & Roster`,
    },
  };
}
