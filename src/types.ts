export type UnitType = 
  | 'depth_chart'
  | 'offense' 
  | 'defense' 
  | 'st' 
  | 'groups' 
  | 'scrimmage' 
  | 'wristband' 
  | 'schedule'
  | 'scouting' 
  | 'practice'
  | 'drills' 
  | 'compliance'
  | 'guide' 
  | 'users';

export type UserRole = 'admin' | 'assistant';

export interface Team {
  id: string;
  name: string;
  ageGroup?: string; // e.g. "10U", "12U", "8U", "Flag"
  season?: string; // e.g. "2026", "Fall 2026"
  color?: string; // e.g. "indigo", "amber", "emerald", "sky", "rose", "purple"
  headCoachName?: string;
  calendarUrl?: string; // Team-specific TeamSnap / iCal schedule feed URL
  notes?: string;
}

export interface SeasonConfig {
  preseasonWeeksCount: number; // e.g. 4 (first 4 weeks are preseason)
  preseasonWeekKeys?: string[]; // e.g. ["0", "pre-2", "pre-3", "pre-4"] or ["1", "2", "3", "4"]
  regularSeasonWeeksCount: number; // e.g. 8
  customWeekLabels?: Record<string, string>;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  week: string;
  title: string;
  sessionType: 'conditioning' | 'padded';
  hours: number;
  location?: string;
  presentPlayerNums: string[];
  absentPlayerNums: string[];
  excusedPlayerNums?: string[];
  notes?: string;
  timestamp: number;
}

export type ScheduleEventType =
  | 'game'
  | 'practice'
  | 'scrimmage'
  | 'meeting'
  | 'walkthrough'
  | 'tournament';

export interface ScheduleEvent {
  id: string;
  teamId?: string; // Links event to a specific team
  type: ScheduleEventType;
  title: string;
  week: string; // e.g. "pre-1", "pre-2", "0", "1", "2", "3", "playoffs"
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00" or "17:30"
  time?: string; // alias for startTime
  dayOfWeek?: string;
  endTime?: string; // e.g. "11:00" or "19:00"
  location: string; // e.g. "Mahopac High School - Turf Field"
  locationType?: 'home' | 'away' | 'neutral';
  opponent?: string; // e.g. "Carmel Rams 10U" (for games/scrimmages)
  uniform?: string; // e.g. "Gold Jerseys (Home)", "White / Blue (Away)"
  attireCategory?: 'conditioning' | 'padded' | 'helmets_only' | 'shells' | 'full_pads' | 'walkthrough';
  arrivalMinutesBefore?: number; // e.g. 60 min before game, 15 min before practice
  focusOrNotes?: string;
  linkedPracticePlanId?: string; // Links directly to a PracticePlan.id
  isCancelled?: boolean;
  cancellationReason?: string;
  result?: {
    teamScore?: number;
    opponentScore?: number;
    outcome?: 'W' | 'L' | 'T';
    recapNotes?: string;
  };
  createdAt: number;
  lastEdited: number;
}

export interface RosterPlayer {
  id?: string;
  teamId?: string; // Links player to a specific team
  num: string;
  firstName: string;
  lastName: string;
  primaryPosition?: string; // e.g. "QB", "RB", "WR", "TE", "C", "LT", "DE", "MLB", etc.
  secondaryPosition?: string; // e.g. "FS", "CB", "DT", "OLB", etc.
  offensivePosition?: string;
  defensivePosition?: string;
  specialTeamsPosition?: string;
  conditioningHours?: number; // Target: 10 hrs required before allowed in full pads
  paddedHours?: number; // Target: 10 hrs in pads required before playing in scrimmage/games
  weeklyHours?: Record<string, number>; // week key -> hours logged
  notes?: string;
  isCaptain?: boolean;
}

// Youth Football Acclimatization Compliance Rules
export const CONDITIONING_HOURS_REQUIRED = 10;
export const PADDED_HOURS_REQUIRED = 10;

export interface PlayerComplianceStatus {
  conditioningHours: number;
  paddedHours: number;
  totalHours: number;
  isConditioningCleared: boolean; // >= 10 hrs
  conditioningRemaining: number;
  isPadsCleared: boolean; // Can wear pads
  isScrimmageCleared: boolean; // >= 10 hrs in pads
  paddedRemaining: number;
  complianceStage: 'conditioning_only' | 'pads_cleared' | 'scrimmage_cleared';
  statusText: string;
  badgeColor: string;
}

export function calculatePlayerCompliance(player: Partial<RosterPlayer>): PlayerComplianceStatus {
  const conditioning = Number(player.conditioningHours || 0);
  const padded = Number(player.paddedHours || 0);
  const total = conditioning + padded;

  const isConditioningCleared = conditioning >= CONDITIONING_HOURS_REQUIRED;
  const conditioningRemaining = Math.max(0, CONDITIONING_HOURS_REQUIRED - conditioning);

  const isPadsCleared = isConditioningCleared;
  const isScrimmageCleared = isPadsCleared && padded >= PADDED_HOURS_REQUIRED;
  const paddedRemaining = Math.max(0, PADDED_HOURS_REQUIRED - padded);

  let complianceStage: 'conditioning_only' | 'pads_cleared' | 'scrimmage_cleared' = 'conditioning_only';
  let statusText = `Conditioning Only (${conditioning.toFixed(1)}/10 hrs • ${conditioningRemaining.toFixed(1)}h to Pads)`;
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

  if (isScrimmageCleared) {
    complianceStage = 'scrimmage_cleared';
    statusText = `Fully Cleared for Scrimmages & Games (${conditioning.toFixed(1)}h Cond + ${padded.toFixed(1)}h Pads)`;
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  } else if (isPadsCleared) {
    complianceStage = 'pads_cleared';
    statusText = `Pads Cleared (${padded.toFixed(1)}/10 hrs Pads • ${paddedRemaining.toFixed(1)}h to Scrimmage)`;
    badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
  }

  return {
    conditioningHours: conditioning,
    paddedHours: padded,
    totalHours: total,
    isConditioningCleared,
    conditioningRemaining,
    isPadsCleared,
    isScrimmageCleared,
    paddedRemaining,
    complianceStage,
    statusText,
    badgeColor,
  };
}

export function formatWeekLabel(weekKey: string, config?: SeasonConfig): string {
  if (!weekKey) return 'Regular Season • Week 1';
  const clean = weekKey.toLowerCase().trim();
  
  if (config?.customWeekLabels && config.customWeekLabels[weekKey]) {
    return config.customWeekLabels[weekKey];
  }

  if (clean === '0' || clean === 'pre-1' || clean === 'pre1' || clean === 'preseason-1') {
    return 'Pre-Season • Wk 1 (Conditioning)';
  }
  if (clean === 'pre-2' || clean === 'pre2' || clean === 'preseason-2') {
    return 'Pre-Season • Wk 2 (Conditioning & Shells)';
  }
  if (clean === 'pre-3' || clean === 'pre3' || clean === 'preseason-3') {
    return 'Pre-Season • Wk 3 (Pads & Fundamentals)';
  }
  if (clean === 'pre-4' || clean === 'pre4' || clean === 'preseason-4') {
    return 'Pre-Season • Wk 4 (Pads & Scrimmage)';
  }
  if (clean === 'playoffs' || clean === 'playoff' || clean === 'post') {
    return 'Post-Season • Playoffs';
  }
  if (clean === 'championship') {
    return 'Super Bowl / Championship';
  }

  const numeric = parseInt(clean.replace(/\D/g, ''), 10);
  if (!isNaN(numeric)) {
    if (clean.startsWith('pre')) {
      return `Pre-Season • Wk ${numeric}`;
    }
    return `Regular Season • Week ${numeric}`;
  }
  return `Week ${weekKey}`;
}

export interface PlacedPlayer {
  name: string;
  num: string;
}

export interface PositionSlot {
  id: string;
  name: string;
}

export interface FormationRow {
  id: string;
  label: string;
  slotCount: number;
  positions: (PositionSlot | null)[];
}

export interface FormationBoard {
  id: string;
  unit: 'offense' | 'defense' | 'st' | 'groups';
  name: string;
  collapsed?: boolean;
  rows: FormationRow[];
}

export interface WristbandPlay {
  text: string;
}

export interface WristbandColumn {
  color: string;
  plays: WristbandPlay[];
}

export interface WristbandData {
  title?: string;
  rows?: number;
  columns?: WristbandColumn[];
  copiesPerPage?: number;
}

export interface CoachScoutingNote {
  id: string;
  coachEmail?: string;
  coachName?: string;
  author?: string;
  authorRole?: string;
  category?: string; // e.g. "Defense & Fronts", "Offense & Plays", "Special Teams", "O-Line & Blocking", "QB Reads", "Adjustments", "General"
  title: string;
  content: string;
  createdAt?: number;
  timestamp?: number;
  lastEdited?: number;
  lastEditedBy?: string;
}

export interface OpponentKeyPlayer {
  id: string;
  num?: string;
  jersey?: string;
  name: string;
  pos?: string;
  position?: string;
  threatLevel: 'High' | 'Medium' | 'Low';
  notes: string;
}

export interface ScoutingData {
  year?: string;
  week?: string;
  opponent?: string;
  gameDate?: string;
  gameLocation?: string;
  overviewNotes?: string;
  teamOverview?: string;
  offensiveTendencies?: string;
  offenseTendencies?: string;
  offenseFormations?: string;
  runPassRatio?: string;
  gameplanDefense?: string;
  defensiveFronts?: string;
  defenseFront?: string;
  defenseCoverage?: string;
  defenseTendencies?: string;
  gameplanOffense?: string;
  specialTeamsNotes?: string;
  keysToVictory?: string[];
  keyPlayersList?: OpponentKeyPlayer[];
  keyPlayers?: any;
  coachNotes?: CoachScoutingNote[];
}

export interface WeekState {
  formations?: FormationBoard[];
  depthChart?: Record<string, PlacedPlayer[]>;
  scrimmageChart?: Record<string, PlacedPlayer[]>;
  opponent?: string;
  wristbandData?: WristbandData;
  scouting?: ScoutingData;
}

export interface DrillItem {
  name: string;
  desc: string;
  key: string;
}

export interface DrillFolder {
  name: string;
  subfolders: DrillFolder[];
  drills: DrillItem[];
}

export interface PracticeStation {
  name: string;
  desc: string;
  coach: string;
  focus: string;
}

export interface PracticePeriod {
  time: number;
  category: string;
  format: 'static' | 'rotating';
  stations: PracticeStation[];
}

export interface PracticePlan {
  id: string;
  teamId?: string; // Links practice plan to a specific team
  year: string;
  weekFolder: string;
  dayFolder?: string;
  title: string;
  date: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isCancelled?: boolean; // When true, excluded from practice number/held count
  cancellationReason?: string;
  lastEdited?: number;
  plan?: PracticePeriod[];
  periods?: PracticePeriod[];
}

export interface PracticeTemplate {
  name: string;
  periods: PracticePeriod[];
}

export interface StaffCoach {
  email: string;
  role: string;
  status: 'Active' | 'Pending';
  assignedTeamIds?: string[]; // IDs of teams this coach has access to. If undefined or includes 'all', coach has access to all teams.
}

export interface PlaybookGuideTree {
  [mainCategory: string]: {
    [subTab: string]: string; // URL / data URI
  };
}

export interface PlaybookGuideOrder {
  main: string[];
  sub: Record<string, string[]>;
}
