import { UnitType } from '../types';
import { DefensivePositionCategory } from '../components/whiteboard/whiteboardDrillData';

export const VALID_UNITS: Set<string> = new Set([
  'mobile_hub',
  'game_day',
  'depth_chart',
  'offense',
  'defense',
  'st',
  'groups',
  'scrimmage',
  'wristband',
  'call_sheet',
  'schedule',
  'scouting',
  'tendencies',
  'html_tendencies',
  'practice',
  'drills',
  'compliance',
  'guide',
  'whiteboard',
  'users',
]);

export interface RouteState {
  unit: UnitType | null;
  subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
  drillId?: string;
  drillCategory?: DefensivePositionCategory | 'ALL';
  practiceId?: string;
}

/**
 * Parses current URL hash into route state.
 * e.g.: #whiteboard?drill=krausko-blitz-master&cat=LB
 *       #practice?practice=plan_1
 *       #mobile_hub
 */
export function parseRouteHash(hashStr: string): RouteState {
  if (!hashStr || !hashStr.startsWith('#')) {
    return { unit: null };
  }

  const raw = hashStr.slice(1);
  const [pathPart, queryPart] = raw.split('?');
  const unit = VALID_UNITS.has(pathPart) ? (pathPart as UnitType) : null;
  if (!unit) return { unit: null };

  const result: RouteState = { unit };

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const sub = params.get('sub');
    if (sub && ['offense', 'defense', 'st', 'groups', 'scrimmage'].includes(sub)) {
      result.subUnit = sub as 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
    }
    const drill = params.get('drill');
    if (drill) result.drillId = drill;
    const cat = params.get('cat');
    if (cat) result.drillCategory = cat as DefensivePositionCategory | 'ALL';
    const practice = params.get('practice') || params.get('id');
    if (practice) result.practiceId = practice;
  }

  if (['offense', 'defense', 'st', 'groups', 'scrimmage'].includes(unit)) {
    result.subUnit = unit as 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
  }

  return result;
}

/**
 * Constructs a browser URL hash from unit and optional state parameters.
 */
export function buildRouteHash(
  unit: UnitType,
  options?: {
    subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
    drillId?: string;
    drillCategory?: DefensivePositionCategory | 'ALL';
    practiceId?: string;
  }
): string {
  let hash = `#${unit}`;
  const params = new URLSearchParams();

  if (options?.subUnit && unit === 'depth_chart') {
    params.set('sub', options.subUnit);
  }
  if (options?.drillId && (unit === 'whiteboard' || unit === 'drills')) {
    params.set('drill', options.drillId);
  }
  if (options?.drillCategory && (unit === 'whiteboard' || unit === 'drills')) {
    params.set('cat', options.drillCategory);
  }
  if (options?.practiceId && unit === 'practice') {
    params.set('practice', options.practiceId);
  }

  const qs = params.toString();
  if (qs) hash += `?${qs}`;
  return hash;
}
