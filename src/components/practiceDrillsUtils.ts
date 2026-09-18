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
  {
    id: 'maroon',
    label: 'Maroon / Crimson',
    hex: '#881337',
    badgeBg: 'bg-rose-900',
    badgeText: 'text-white',
    borderClass: 'border-rose-900 dark:border-rose-800',
    bgLightClass: 'bg-rose-900/15 dark:bg-rose-900/25',
    ringClass: 'ring-rose-800',
    headerGrad: 'from-rose-950/30 to-rose-900/10',
    chipBg: 'bg-rose-900',
    chipText: 'text-white font-black',
    printBorder: 'border-rose-900',
  },
  {
    id: 'charcoal',
    label: 'Charcoal / Steel',
    hex: '#334155',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-white',
    borderClass: 'border-slate-600 dark:border-slate-500',
    bgLightClass: 'bg-slate-700/15 dark:bg-slate-700/25',
    ringClass: 'ring-slate-500',
    headerGrad: 'from-slate-700/20 to-slate-700/5',
    chipBg: 'bg-slate-700',
    chipText: 'text-white font-black',
    printBorder: 'border-slate-700',
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
  if (!colorId) {
    return TEAM_COLOR_MAP[fallback] || TEAM_COLOR_OPTIONS[0];
  }

  // Known preset
  if (TEAM_COLOR_MAP[colorId]) {
    return TEAM_COLOR_MAP[colorId];
  }

  // Support arbitrary custom HEX color codes (e.g. "#8b0000", "#ff6600")
  if (colorId.startsWith('#') || /^[0-9a-fA-F]{6}$/.test(colorId)) {
    const rawHex = colorId.startsWith('#') ? colorId : `#${colorId}`;
    const cleanHex = rawHex.replace('#', '');
    let r = 0;
    let g = 0;
    let b = 0;
    if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16) || 0;
      g = parseInt(cleanHex.substring(2, 4), 16) || 0;
      b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    } else if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
      g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
      b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
    }
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const isLight = yiq >= 150;

    return {
      id: rawHex,
      label: rawHex.toUpperCase(),
      hex: rawHex,
      badgeBg: 'bg-slate-800',
      badgeText: isLight ? 'text-slate-950 font-black' : 'text-white font-black',
      borderClass: 'border-slate-300 dark:border-slate-650',
      bgLightClass: 'bg-slate-100/60 dark:bg-slate-800/40',
      ringClass: 'ring-slate-400',
      headerGrad: 'from-slate-500/20 to-slate-500/5',
      chipBg: 'bg-slate-800',
      chipText: isLight ? 'text-slate-950 font-black' : 'text-white font-black',
      printBorder: 'border-slate-800',
    };
  }

  return TEAM_COLOR_MAP[fallback] || TEAM_COLOR_OPTIONS[0];
}

// Preset color matchups
export const COLOR_MATCHUP_PRESETS = [
  { label: 'Gold vs Blue', offense: 'gold', defense: 'blue' },
  { label: 'White vs Blue', offense: 'white', defense: 'blue' },
  { label: 'Red vs White', offense: 'red', defense: 'white' },
  { label: 'Black vs Gold', offense: 'black', defense: 'gold' },
  { label: 'Green vs White', offense: 'green', defense: 'white' },
  { label: 'Navy vs Orange', offense: 'navy', defense: 'orange' },
];

// ============================================================================
// 2. DEFAULT GROUP LABELS (Clean, customizable, no hardcoded colors)
// ============================================================================
export const DEFAULT_OFFENSE_LABELS: string[] = [
  '1st Team Offense',
  '2nd Team Offense',
  'Varsity Offense',
  'JV Offense',
  'Scout Offense',
  'Red Zone Offense',
];

export const DEFAULT_DEFENSE_LABELS: string[] = [
  '1st Team Defense',
  '2nd Team Defense',
  'Varsity Defense',
  'JV Defense',
  'Scout Defense',
  'Goal Line Defense',
];

// Backward-compatibility aliases
export const OFFENSE_LABEL_PRESETS = DEFAULT_OFFENSE_LABELS;
export const DEFENSE_LABEL_PRESETS = DEFAULT_DEFENSE_LABELS;

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
      offenseLabel: '1st Team Offense',
      defenseLabel: '1st Team Defense',
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
  rb: ['rb', 'hb', 'fb', '3hb', '2fb', '4rb', 'halfback', 'tailback', 'fullback', 'runningback', 'grprb', 'grpfb', '212', '213', 'back'],
  fb: ['fb', '2fb', 'fullback', 'hback', 'grpfb', '212', 'rb'],
  wr: ['wr', 'wideout', 'receiver', 'widereceiver', 'x', 'z', 'w', 'h', 'slot', 'wr1', 'wr2', 'wr3', 'wr4', 'wrx', 'wrz', 'splitend', 'flanker', 'wr(x)', 'wr(z)', 'slot(h)', 'slot(w)'],
  wr_x: ['x', 'wrx', 'wr1', 'wr', 'wideout1', 'splitend', 'grpx', '21x', 'wideout', 'receiver', 'wr(x)'],
  wr_z: ['z', 'wrz', 'wr2', 'wr', 'flanker', 'grpz', '21z', 'wideout', 'receiver', 'wr(z)'],
  wr_w: ['w', 'slotw', 'slot', 'h', 'wr3', 'slot1', 'hslot', 'slot2', 'wr', 'wideout', 'receiver', 'slot(w)'],
  te_y: ['y', 'y1', 'y2', 'te', 'tey', 'tes', 'tightend', 'grptes', '21y1', 'te(y)'],
  lt: ['lt', 'lefttackle', 'ot1', 'ot', 't1', 'grplt', '21lt', 'ol', 'tackle', 't'],
  lg: ['lg', 'leftguard', 'og1', 'og', 'g1', 'grplg', '21lg', 'ol', 'guard', 'g'],
  c: ['c', 'center', 'grpc', '21c', 'ol'],
  rg: ['rg', 'rightguard', 'og2', 'og', 'g2', 'grprg', '21rg', 'ol', 'guard', 'g'],
  rt: ['rt', 'righttackle', 'ot2', 'ot', 't2', 'grprt', '21rt', 'ol', 'tackle', 't'],
  ol: ['ol', 'ot', 'og', 'c', 'lt', 'lg', 'rg', 'rt', 'lineman', 'offensiveline', 'tackle', 'guard', 'center'],
  lde: ['lde', 'de1', 'wde', 'le', 'de', 'edge', 'defensiveend1', '53de1', '44wde', 'dl', 'end'],
  rde: ['rde', 'de2', 'sde', 're', 'de', 'edge', 'defensiveend2', '53de2', '44sde', 'dl', 'end'],
  ldt: ['ldt', 'dt1', 'dt', 'defensivetackle1', 'tackle1', '53dt1', '44dt1', 'dl', 'nose', 'nt'],
  rdt: ['rdt', 'dt2', 'nt', 'nosetackle', 'nose', 'dt', 'defensivetackle2', '53dt2', '44dt2', 'dl'],
  nt: ['nt', 'nose', 'nosetackle', 'dt1', 'dt2', '53nt', 'dt', 'dl'],
  dl: ['dl', 'de', 'dt', 'nt', 'lde', 'rde', 'ldt', 'rdt', 'edge', 'defensiveline', 'defensiveend', 'defensivetackle'],
  mlb: ['mlb', 'mike', 'middlelinebacker', 'ilb', 'lb1', 'grpmike', '53mike', '44mike', 'lb', 'linebacker', 'mlb(mike)'],
  wlb: ['wlb', 'will', 'weaklinebacker', 'olb1', 'lb2', 'grpwill', '53will', '44will', 'lb', 'linebacker', 'olb', 'wlb(will)'],
  slb: ['slb', 'sam', 'stronglinebacker', 'olb2', 'lb3', 'rover', 'grpsam', '53sam', '44sam', '44rover', 'lb', 'linebacker', 'olb', 'slb(sam)'],
  lb: ['lb', 'linebacker', 'mlb', 'wlb', 'slb', 'ilb', 'olb', 'mike', 'will', 'sam'],
  cb1: ['cb1', 'cb', 'corner1', 'lcb', 'cornerback1', 'grpcb1', '53cb2', '44cb1', 'db', 'corner'],
  cb2: ['cb2', 'cb', 'corner2', 'rcb', 'cornerback2', 'grpcb2', '53cb1', '44cb2', 'db', 'corner'],
  cb: ['cb', 'cornerback', 'corner', 'lcb', 'rcb', 'cb1', 'cb2', 'db'],
  fs: ['fs', 'freesafety', 'safety1', 'fsafety', 'grpfs', '53fs', '44fs', 'safety', 'db', 's'],
  ss: ['ss', 'strongsafety', 'rover', 'safety2', 'ssafety', 'grprover', '44rover', 'nickel', 'safety', 'db', 's'],
  s: ['s', 'safety', 'fs', 'ss', 'db'],
  nickel: ['nickel', 'nb', 'slotdb', 'db', 'rover', 'slb', 'ss', 'cb', 'safety'],
  db: ['db', 'defensiveback', 'cb', 'fs', 'ss', 's', 'nickel', 'nb', 'corner', 'safety'],
};

/**
 * Checks if target position name matches a candidate position name or ID
 */
export function isPositionMatch(targetName: string, candidateName: string, candidateId: string = ''): boolean {
  const cleanTarget = normalizePositionToken(targetName);
  const cleanCandName = normalizePositionToken(candidateName);
  const cleanCandId = normalizePositionToken(candidateId);

  // Exact match
  if (cleanTarget && (cleanTarget === cleanCandName || cleanTarget === cleanCandId)) {
    return true;
  }

  // Broad football unit/position overlap checks
  if (cleanTarget.startsWith('wr') && (cleanCandName.startsWith('wr') || cleanCandName === 'x' || cleanCandName === 'z' || cleanCandName === 'slot')) return true;
  if (cleanTarget.startsWith('cb') && (cleanCandName.startsWith('cb') || cleanCandName === 'db' || cleanCandName === 'corner')) return true;
  if (cleanTarget.startsWith('de') && (cleanCandName.startsWith('de') || cleanCandName === 'dl' || cleanCandName === 'edge')) return true;
  if (cleanTarget.startsWith('dt') && (cleanCandName.startsWith('dt') || cleanCandName === 'dl' || cleanCandName === 'nt')) return true;
  if (cleanTarget.endsWith('lb') && (cleanCandName.endsWith('lb') || cleanCandName === 'mike' || cleanCandName === 'will' || cleanCandName === 'sam')) return true;

  // Check synonym groupings
  for (const [key, synonyms] of Object.entries(POSITION_SYNONYMS)) {
    const targetMatchesGroup = synonyms.some(
      (s) => cleanTarget === s || cleanTarget.includes(s) || s.includes(cleanTarget)
    );
    if (targetMatchesGroup) {
      const candMatchesGroup = synonyms.some(
        (s) => cleanCandName === s || cleanCandName.includes(s) || s.includes(cleanCandName) ||
               cleanCandId === s || cleanCandId.includes(s) || s.includes(cleanCandId)
      );
      if (candMatchesGroup) {
        return true;
      }
    }
  }

  // Substring inclusion fallback for clear tokens
  if (cleanTarget.length >= 2) {
    if (cleanCandName.includes(cleanTarget) || cleanTarget.includes(cleanCandName) ||
        cleanCandId.includes(cleanTarget) || cleanTarget.includes(cleanCandId)) {
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
 * 1. Checks Depth Chart across ALL formations & direct depth chart entries
 * 2. Checks Scrimmage Chart
 * 3. Falls back to Active Roster by Primary / Secondary Position & Category
 * 4. Ensures no duplicate assignments within the same string
 */
export function executeIntelligentAutoFill(params: {
  group: LiveDrillGroup;
  formations: FormationBoard[];
  depthChart: Record<string, PlacedPlayer[]>;
  scrimmageChart?: Record<string, PlacedPlayer[]>;
  roster: RosterPlayer[];
  targetString?: 1 | 2 | 3 | 'all'; // 1 = Starters, 2 = 2nd Team, 3 = 3rd Team, 'all' = All 3
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

  let nextLineup: Record<string, PlacedPlayer[]> = { ...group.lineup };

  let filledOffense = 0;
  let filledDefense = 0;

  // 1. Collect all depth chart candidates across all formations
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

  // Also collect direct depthChart keys
  for (const [key, players] of Object.entries(depthChart)) {
    if (players && players.length > 0) {
      depthCandidates.push({ posName: key, posId: key, players });
    }
  }

  // 2. Also include scrimmage chart candidates
  const scrimmageCandidates: { posId: string; players: PlacedPlayer[] }[] = [];
  for (const [posId, players] of Object.entries(scrimmageChart)) {
    if (players && players.length > 0) {
      scrimmageCandidates.push({ posId, players });
    }
  }

  // Helper to find best player for a position slot given desired string index (0 = 1st, 1 = 2nd, 2 = 3rd)
  const findBestPlayerForSlot = (
    pos: LiveDrillPosition,
    unit: 'offense' | 'defense',
    usedNums: Set<string>,
    desiredIdx: number
  ): PlacedPlayer | null => {
    // 1. Check Depth Chart candidates
    for (const cand of depthCandidates) {
      if (isPositionMatch(pos.name, cand.posName, cand.posId)) {
        const targetPlayer = cand.players[desiredIdx] || cand.players[0];
        if (targetPlayer && !usedNums.has(String(targetPlayer.num))) {
          return targetPlayer;
        }
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

    // 3. Search active Roster by primary or secondary position
    const cleanPos = normalizePositionToken(pos.name);
    const matchingRoster = roster.filter((r) => {
      if (usedNums.has(String(r.num))) return false;
      const rPos = normalizePositionToken(r.primaryPosition || '');
      const secPos = normalizePositionToken(r.secondaryPosition || '');
      return (
        isPositionMatch(pos.name, rPos, '') ||
        isPositionMatch(pos.name, secPos, '') ||
        (rPos && cleanPos.includes(rPos)) ||
        (secPos && cleanPos.includes(secPos))
      );
    });

    if (matchingRoster.length > 0) {
      const pickedRoster =
        desiredIdx > 0 && matchingRoster.length > desiredIdx
          ? matchingRoster[desiredIdx]
          : matchingRoster[0];
      return {
        num: pickedRoster.num,
        name: `${pickedRoster.firstName} ${pickedRoster.lastName}`.trim() || pickedRoster.rosterName,
      };
    }

    // 4. Broader category match from Roster (OL, DL, LB, DB, WR, RB)
    const isOL = ['lt', 'lg', 'c', 'rg', 'rt', 'ol', 'ot', 'og'].some((k) => cleanPos.includes(k));
    const isDL = ['lde', 'rde', 'ldt', 'rdt', 'nt', 'dl', 'de', 'dt', 'edge'].some((k) => cleanPos.includes(k));
    const isDB = ['cb', 'fs', 'ss', 'nickel', 'db', 'safety', 'corner'].some((k) => cleanPos.includes(k));
    const isWR = ['wr', 'slot', 'x', 'z', 'w', 'h', 'wideout'].some((k) => cleanPos.includes(k));
    const isLB = ['lb', 'mike', 'will', 'sam', 'mlb', 'wlb', 'slb'].some((k) => cleanPos.includes(k));
    const isRB = ['rb', 'fb', 'hb', 'back'].some((k) => cleanPos.includes(k));
    const isQB = cleanPos.includes('qb') || cleanPos.includes('passer');

    const categoryRoster = roster.filter((r) => {
      if (usedNums.has(String(r.num))) return false;
      const posText = `${r.primaryPosition || ''} ${r.secondaryPosition || ''}`.toLowerCase();
      if (isQB && (posText.includes('qb') || posText.includes('quarter'))) return true;
      if (isRB && (posText.includes('rb') || posText.includes('hb') || posText.includes('fb') || posText.includes('back'))) return true;
      if (isOL && (posText.includes('ol') || posText.includes('t') || posText.includes('g') || posText.includes('c') || posText.includes('line'))) return true;
      if (isDL && (posText.includes('dl') || posText.includes('de') || posText.includes('dt') || posText.includes('edge') || posText.includes('nose') || posText.includes('d-line'))) return true;
      if (isDB && (posText.includes('db') || posText.includes('cb') || posText.includes('s') || posText.includes('safety') || posText.includes('corner'))) return true;
      if (isWR && (posText.includes('wr') || posText.includes('slot') || posText.includes('rec') || posText.includes('wide') || posText.includes('te'))) return true;
      if (isLB && (posText.includes('lb') || posText.includes('backer') || posText.includes('mike') || posText.includes('will') || posText.includes('sam'))) return true;
      return false;
    });

    if (categoryRoster.length > 0) {
      const picked =
        desiredIdx > 0 && categoryRoster.length > desiredIdx
          ? categoryRoster[desiredIdx]
          : categoryRoster[0];
      return {
        num: picked.num,
        name: `${picked.firstName} ${picked.lastName}`.trim() || picked.rosterName,
      };
    }

    // 5. Final fallback: Any unused player from roster to guarantee complete 7v7 or 11v11 staffing
    const generalAthletes = roster.filter((r) => !usedNums.has(String(r.num)));
    if (generalAthletes.length > 0) {
      const athlete = generalAthletes[0];
      return {
        num: athlete.num,
        name: `${athlete.firstName} ${athlete.lastName}`.trim() || athlete.rosterName,
      };
    }

    return null;
  };

  const fillSingleString = (strNum: 1 | 2 | 3) => {
    const desiredIdx = strNum - 1;
    const usedOffenseNums = new Set<string>();
    const usedDefenseNums = new Set<string>();

    // Process Offense
    if (fillUnit === 'both' || fillUnit === 'offense') {
      group.offensePositions.forEach((pos) => {
        const player = findBestPlayerForSlot(pos, 'offense', usedOffenseNums, desiredIdx);
        if (player) {
          usedOffenseNums.add(String(player.num));
          filledOffense++;

          const currentList = nextLineup[pos.id] || [];
          const updated = [...currentList];
          // Ensure slots exist up to desiredIdx
          while (updated.length < desiredIdx) {
            updated.push({ num: '?', name: 'TBD' });
          }
          // Remove if player already in list elsewhere
          const filtered = updated.filter(
            (p, idx) => idx === desiredIdx || String(p.num) !== String(player.num)
          );
          filtered[desiredIdx] = player;
          nextLineup[pos.id] = filtered;
        }
      });
    }

    // Process Defense
    if (fillUnit === 'both' || fillUnit === 'defense') {
      group.defensePositions.forEach((pos) => {
        const player = findBestPlayerForSlot(pos, 'defense', usedDefenseNums, desiredIdx);
        if (player) {
          usedDefenseNums.add(String(player.num));
          filledDefense++;

          const currentList = nextLineup[pos.id] || [];
          const updated = [...currentList];
          while (updated.length < desiredIdx) {
            updated.push({ num: '?', name: 'TBD' });
          }
          const filtered = updated.filter(
            (p, idx) => idx === desiredIdx || String(p.num) !== String(player.num)
          );
          filtered[desiredIdx] = player;
          nextLineup[pos.id] = filtered;
        }
      });
    }
  };

  if (targetString === 'all') {
    fillSingleString(1);
    fillSingleString(2);
    fillSingleString(3);
  } else {
    fillSingleString(targetString);
  }

  const stringName =
    targetString === 'all'
      ? 'All 3 Teams (1st, 2nd & 3rd Strings)'
      : targetString === 1
        ? '1st Team Starters'
        : targetString === 2
          ? '2nd Team Backups'
          : '3rd Team Depth';

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
