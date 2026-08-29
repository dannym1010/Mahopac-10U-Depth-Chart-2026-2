export type UnitType = 
  | 'offense' 
  | 'defense' 
  | 'st' 
  | 'groups' 
  | 'scrimmage' 
  | 'wristband' 
  | 'scouting' 
  | 'guide' 
  | 'drills' 
  | 'practice' 
  | 'users';

export type UserRole = 'admin' | 'assistant';

export interface RosterPlayer {
  num: string;
  firstName: string;
  lastName: string;
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
  rows: number;
  columns: WristbandColumn[];
}

export interface ScoutingData {
  year?: string;
  week?: string;
  opponent?: string;
  teamOverview?: string;
  keyPlayers?: string;
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
  year: string;
  weekFolder: string;
  title: string;
  date: string;
  day: string;
  startTime: string;
  endTime?: string;
  lastEdited: number;
  plan: PracticePeriod[];
}

export interface PracticeTemplate {
  name: string;
  periods: PracticePeriod[];
}

export interface StaffCoach {
  email: string;
  role: string;
  status: 'Active' | 'Pending';
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
