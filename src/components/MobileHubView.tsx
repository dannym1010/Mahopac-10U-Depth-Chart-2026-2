import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Shield,
  Zap,
  Target,
  Swords,
  Watch,
  FileSpreadsheet,
  BookOpen,
  Dumbbell,
  ClipboardList,
  Calendar,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  MessageSquare,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Settings,
  Plus,
  ArrowRight,
  Check,
  X,
  Play,
  FileText,
  Eye,
  Code,
  Maximize2,
  FileCode,
  Layers,
} from 'lucide-react';
import {
  Team,
  UnitType,
  UserRole,
  RosterPlayer,
  ScheduleEvent,
  PracticePlan,
  WeekState,
  FormationBoard,
  formatWeekLabel,
  AttendanceRecord,
  PlaybookGuideTree,
  PlaybookGuideOrder,
} from '../types';

// Built-in starter templates for quick sideline & playbook reference
const QUICK_GUIDE_TEMPLATES = [
  {
    id: 'play_card',
    title: 'Play Scheme & Assignment Card',
    category: 'Offense',
    tag: 'Schematic',
    desc: 'Gun Trips Right 62 Smash route tree & player assignments',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 16px; }
    .card { background: #1e293b; border-radius: 14px; border: 1px solid #334155; padding: 18px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 20px; color: #facc15; }
    .badge { background: #3b82f6; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; }
    .diagram-box { background: #022c22; border: 2px dashed #10b981; border-radius: 10px; height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 16px; text-align: center; color: #6ee7b7; position: relative; }
    .diagram-title { font-weight: 800; font-size: 15px; margin-bottom: 4px; }
    .diagram-sub { font-size: 11px; color: #a7f3d0; }
    .assignments-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    .assignments-table th { background: #0f172a; color: #94a3b8; text-align: left; padding: 8px 10px; text-transform: uppercase; border-bottom: 1px solid #334155; }
    .assignments-table td { padding: 8px 10px; border-bottom: 1px solid #334155; }
    .pos-tag { background: #334155; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace; }
    .notes-box { margin-top: 14px; background: #0f172a; border-left: 3px solid #facc15; padding: 10px 12px; border-radius: 0 6px 6px 0; font-size: 12px; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>GUN TRIPS RIGHT - 62 SMASH</h1>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">11 Personnel (1 RB, 1 TE, 3 WR)</div>
      </div>
      <span class="badge">Red Zone / Pass</span>
    </div>
    <div class="diagram-box">
      <div class="diagram-title">🏈 PLAY FIELD SCHEMATIC</div>
      <div class="diagram-sub">Progression: 1. Corner (CB bite) &rarr; 2. Hitch (Underneath) &rarr; 3. Backside Dig</div>
    </div>
    <table class="assignments-table">
      <thead>
        <tr><th>Pos</th><th>Alignment</th><th>Assignment &amp; Key Read</th></tr>
      </thead>
      <tbody>
        <tr><td><span class="pos-tag">QB</span></td><td>Gun (5 yds)</td><td>3-step drop. Read boundary CB. If CB squats on hitch, throw corner route over top.</td></tr>
        <tr><td><span class="pos-tag">X</span></td><td>Split Left</td><td>12-yard Dig across hash. Settle between inside linebackers.</td></tr>
        <tr><td><span class="pos-tag">H</span></td><td>Slot Right</td><td>Corner route (10 yds stem, break at 45&deg; toward pylon). High point catch.</td></tr>
        <tr><td><span class="pos-tag">Z</span></td><td>Wide Right</td><td>5-yard Hitch. Sell vertical drive, plant outside foot, show numbers.</td></tr>
        <tr><td><span class="pos-tag">RB</span></td><td>Weakside Offset</td><td>Check-release to flat. Block weakside edge blitz first.</td></tr>
        <tr><td><span class="pos-tag">OL</span></td><td>Balanced</td><td>Half-slide protection left. Center declares Mike LB. Firm interior pocket.</td></tr>
      </tbody>
    </table>
    <div class="notes-box">
      <strong>Coaching Key:</strong> Against Cover 2, the Corner route opens behind the CB and under safety. Against Cover 3, take 5-yd hitch immediately.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'wristband_insert',
    title: '3-Column Wristband Grid Sheet',
    category: 'Specials',
    tag: 'Call Sheet',
    desc: 'Formatted sideline wristband sheet with color-coded play calls',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: 'Arial Black', Arial, sans-serif; background: #0f172a; color: #000; margin: 0; padding: 12px; }
    .wristband-header { text-align: center; font-size: 15px; font-weight: 900; margin-bottom: 10px; color: #f8fafc; text-transform: uppercase; }
    .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .column { border: 2px solid #334155; border-radius: 8px; overflow: hidden; background: #ffffff; }
    .col-title { color: #fff; padding: 6px; text-align: center; font-size: 11px; font-weight: 900; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    td { padding: 4px 6px; border-bottom: 1px solid #ddd; }
    .num { width: 22px; font-weight: 900; background: #f0f0f0; text-align: center; border-right: 1px solid #ccc; }
    .play { font-weight: bold; }
    .tag-run { background: #e0f2fe; color: #0369a1; }
    .tag-pass { background: #fef3c7; color: #b45309; }
    .tag-screen { background: #dcfce7; color: #15803d; }
  </style>
</head>
<body>
  <div class="wristband-header">Sideline Wristband Play Sheet</div>
  <div class="grid-container">
    <div class="column">
      <div class="col-title" style="background:#1e3a8a;">CARD 1: BASE RUNS</div>
      <table>
        <tr class="tag-run"><td class="num">1</td><td class="play">Gun Inside Zone Rt</td></tr>
        <tr class="tag-run"><td class="num">2</td><td class="play">Gun Stretch Lt</td></tr>
        <tr class="tag-run"><td class="num">3</td><td class="play">Counter Tre Solid</td></tr>
        <tr class="tag-run"><td class="num">4</td><td class="play">Power G Weak</td></tr>
        <tr class="tag-run"><td class="num">5</td><td class="play">QB Draw Trap</td></tr>
        <tr class="tag-run"><td class="num">6</td><td class="play">Split Zone Slice</td></tr>
      </table>
    </div>
    <div class="column">
      <div class="col-title" style="background:#991b1b;">CARD 2: QUICK PASS</div>
      <table>
        <tr class="tag-pass"><td class="num">7</td><td class="play">Trips Quick Slants</td></tr>
        <tr class="tag-pass"><td class="num">8</td><td class="play">Smash Out Concept</td></tr>
        <tr class="tag-pass"><td class="num">9</td><td class="play">Mesh Shallow Cross</td></tr>
        <tr class="tag-screen"><td class="num">10</td><td class="play">Tunnel Screen Rt</td></tr>
        <tr class="tag-screen"><td class="num">11</td><td class="play">RB Middle Screen</td></tr>
        <tr class="tag-pass"><td class="num">12</td><td class="play">Double Post Deep</td></tr>
      </table>
    </div>
    <div class="column">
      <div class="col-title" style="background:#14532d;">CARD 3: SPECIALS</div>
      <table>
        <tr class="tag-pass"><td class="num">13</td><td class="play">Philly Special</td></tr>
        <tr class="tag-pass"><td class="num">14</td><td class="play">TE Pop Pass Seam</td></tr>
        <tr class="tag-run"><td class="num">15</td><td class="play">Goal-Line Wedge</td></tr>
        <tr class="tag-pass"><td class="num">16</td><td class="play">Fade Out Red Zone</td></tr>
        <tr class="tag-run"><td class="num">17</td><td class="play">Jet Sweep Reverse</td></tr>
        <tr class="tag-run"><td class="num">18</td><td class="play">Victory Knee</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'install_rules',
    title: 'Pass Protection & Blitz Rules Matrix',
    category: 'Defense',
    tag: 'Install Matrix',
    desc: 'Structured rules for front fronts, offensive line slides and LB blitz fits',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 16px; }
    .box { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 16px; max-width: 800px; margin: 0 auto; }
    h2 { color: #38bdf8; margin-top: 0; font-size: 17px; border-bottom: 2px solid #334155; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #0284c7; color: #fff; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #334155; }
    tr:nth-child(even) { background: rgba(255,255,255,0.02); }
  </style>
</head>
<body>
  <div class="box">
    <h2>🛡️ PASS PROTECTION RULES &amp; BLITZ ALERTS</h2>
    <table>
      <thead>
        <tr><th>Call</th><th>Type</th><th>OL Responsibility</th><th>RB Responsibility</th><th>Hot Answer</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>50 BASE</strong></td><td>5-Man Slide</td><td>Center slides to Call side; Tackles lock man-on-man</td><td>Dual read Mike to Will LB</td><td>Slot Quick Out</td></tr>
        <tr><td><strong>60 BOB</strong></td><td>Big On Big</td><td>Guards &amp; Tackles take 4 down; Center on 0/1 Tech</td><td>Check-release A-gap</td><td>RB hook checkdown</td></tr>
        <tr><td><strong>MAX PRO</strong></td><td>7-Man Max</td><td>Full slide to call, TE locks strong edge</td><td>RB blocks weak edge</td><td>Vertical double move</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`,
  },
];

interface MobileHubViewProps {
  activeTeam: Team;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  currentWeek: string;
  onSelectWeek: (week: string) => void;
  userRole: UserRole;
  roster: RosterPlayer[];
  scheduleEvents: ScheduleEvent[];
  practicePlans: PracticePlan[];
  currentWeekState: WeekState;
  formations: FormationBoard[];
  depthChart: Record<string, any>;
  defaultScreen: UnitType;
  onSetDefaultScreen: (screen: UnitType) => void;
  onNavigateToUnit: (unit: UnitType, subUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage') => void;
  onQuickAttendanceSave?: (record: AttendanceRecord) => void;
  onOpenPreferencesModal?: () => void;
  onOpenScheduleModal?: () => void;
  onOpenThemeGallery?: () => void;
  // Guides & Playbook integration
  guideTree?: PlaybookGuideTree;
  guideOrder?: PlaybookGuideOrder;
  activeGuideMain?: string;
  activeGuideSub?: string;
  onSelectGuideMain?: (main: string) => void;
  onSelectGuideSub?: (sub: string) => void;
}

const getPlayerFullName = (p: RosterPlayer): string => {
  if (p.rosterName) return p.rosterName;
  if (p.firstName || p.lastName) {
    return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  }
  return `#${p.num}`;
};

const getPlayerPos = (p: RosterPlayer): string => {
  return p.primaryPosition || p.offensivePosition || p.defensivePosition || 'ATH';
};

export const MobileHubView: React.FC<MobileHubViewProps> = ({
  activeTeam,
  teams,
  onSelectTeam,
  currentWeek,
  onSelectWeek,
  userRole,
  roster,
  scheduleEvents,
  practicePlans,
  currentWeekState,
  formations,
  depthChart,
  defaultScreen,
  onSetDefaultScreen,
  onNavigateToUnit,
  onQuickAttendanceSave,
  onOpenPreferencesModal,
  onOpenScheduleModal,
  onOpenThemeGallery,
  guideTree = {
    Offense: { 'Full Playbook': '', Quarterbacks: '', 'Running Backs': '', 'Wide Receivers': '', 'Offensive Line': '' },
    Defense: { 'Full Playbook': '', 'Defensive Line': '', Linebackers: '', Secondary: '' },
    Specials: { 'Special Teams': '', 'Kicking & Punting': '' },
  },
  guideOrder = {
    main: ['Offense', 'Defense', 'Specials'],
    sub: {
      Offense: ['Full Playbook', 'Quarterbacks', 'Running Backs', 'Wide Receivers', 'Offensive Line'],
      Defense: ['Full Playbook', 'Defensive Line', 'Linebackers', 'Secondary'],
      Specials: ['Special Teams', 'Kicking & Punting'],
    },
  },
  activeGuideMain = 'Offense',
  activeGuideSub = 'Full Playbook',
  onSelectGuideMain,
  onSelectGuideSub,
}) => {
  // Mobile Hub active tab: 'starters' | 'roster' | 'attendance'
  const [hubTab, setHubTab] = useState<'starters' | 'roster' | 'attendance'>('starters');
  const [starterUnit, setStarterUnit] = useState<'offense' | 'defense'>('offense');
  const [playerSearch, setPlayerSearch] = useState('');
  const [attendancePresent, setAttendancePresent] = useState<Set<string>>(() => {
    return new Set(roster.map((r) => r.id || r.num));
  });
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<RosterPlayer | null>(null);

  // Guides section state
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<string>(() => {
    return activeGuideMain || (guideOrder.main && guideOrder.main[0]) || 'Offense';
  });
  const [guideSearchTerm, setGuideSearchTerm] = useState('');
  const [quickViewGuideModal, setQuickViewGuideModal] = useState<{
    title: string;
    category: string;
    content: string;
    isStarterTemplate?: boolean;
  } | null>(null);

  // Available categories in Guide tree
  const guideCategories = useMemo(() => {
    if (guideOrder && Array.isArray(guideOrder.main) && guideOrder.main.length > 0) {
      return guideOrder.main;
    }
    return Object.keys(guideTree || {});
  }, [guideOrder, guideTree]);

  // Documents under the selected category (or filtered by search term)
  const currentCategoryDocs = useMemo(() => {
    const list = (guideOrder?.sub && guideOrder.sub[selectedGuideCategory]) ||
      (guideTree[selectedGuideCategory] ? Object.keys(guideTree[selectedGuideCategory]) : []);
    
    if (!guideSearchTerm.trim()) {
      return list.map((docName) => ({
        category: selectedGuideCategory,
        name: docName,
        content: guideTree[selectedGuideCategory]?.[docName] || '',
      }));
    }

    // If search term is present, search across all categories
    const term = guideSearchTerm.toLowerCase().trim();
    const results: { category: string; name: string; content: string }[] = [];
    guideCategories.forEach((cat) => {
      const subs = (guideOrder?.sub && guideOrder.sub[cat]) || (guideTree[cat] ? Object.keys(guideTree[cat]) : []);
      subs.forEach((docName) => {
        if (docName.toLowerCase().includes(term) || cat.toLowerCase().includes(term)) {
          results.push({
            category: cat,
            name: docName,
            content: guideTree[cat]?.[docName] || '',
          });
        }
      });
    });
    return results;
  }, [selectedGuideCategory, guideTree, guideOrder, guideSearchTerm, guideCategories]);

  // Total count of guides across all categories
  const totalGuidesCount = useMemo(() => {
    let count = 0;
    guideCategories.forEach((cat) => {
      const subs = (guideOrder?.sub && guideOrder.sub[cat]) || (guideTree[cat] ? Object.keys(guideTree[cat]) : []);
      count += subs.length;
    });
    return count;
  }, [guideCategories, guideOrder, guideTree]);

  // Helper to open a guide in the studio
  const handleOpenGuideInStudio = (category: string, docName: string) => {
    if (onSelectGuideMain) onSelectGuideMain(category);
    if (onSelectGuideSub) onSelectGuideSub(docName);
    onNavigateToUnit('guide');
  };

  // Helper to preview guide content in modal
  const handlePreviewGuide = (category: string, docName: string, content: string) => {
    setQuickViewGuideModal({
      title: docName,
      category,
      content,
      isStarterTemplate: false,
    });
  };

  // Helper to preview template
  const handlePreviewStarterTemplate = (tpl: typeof QUICK_GUIDE_TEMPLATES[0]) => {
    setQuickViewGuideModal({
      title: tpl.title,
      category: tpl.category,
      content: tpl.code,
      isStarterTemplate: true,
    });
  };

  // Determine Next / Upcoming Event for Active Team
  const upcomingEvent = useMemo(() => {
    if (!scheduleEvents || scheduleEvents.length === 0) return null;
    const now = new Date();
    const sorted = [...scheduleEvents]
      .filter((e) => e && e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cleanWk = currentWeek.replace(/^Week\s+/i, '').trim();
    const currentWeekEvent = sorted.find((e) => {
      const eWk = (e.week || '').replace(/^Week\s+/i, '').trim();
      return eWk === cleanWk;
    });
    if (currentWeekEvent) return currentWeekEvent;

    const future = sorted.find((e) => new Date(e.date + 'T23:59:59').getTime() >= now.getTime());
    return future || sorted[0];
  }, [scheduleEvents, currentWeek]);

  // Starters preview calculation for Offense & Defense
  const offensiveFormation = useMemo(() => {
    return formations.find((f) => f && f.unit === 'offense') || formations[0];
  }, [formations]);

  const defensiveFormation = useMemo(() => {
    return formations.find((f) => f && f.unit === 'defense') || formations[1];
  }, [formations]);

  const offenseStarters = useMemo(() => {
    if (!offensiveFormation || !offensiveFormation.rows) return [];
    const starters: { posName: string; playerName: string; playerNum: string }[] = [];
    offensiveFormation.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (!pos) return;
        const assigned = depthChart[pos.id] || [];
        const topItem = assigned[0];
        const topNum = typeof topItem === 'string' ? topItem : topItem?.playerNum || topItem?.num || '';
        if (topNum) {
          const p = roster.find((r) => r.num === topNum);
          starters.push({
            posName: pos.name,
            playerName: p ? getPlayerFullName(p) : `#${topNum}`,
            playerNum: topNum,
          });
        }
      });
    });
    return starters;
  }, [offensiveFormation, depthChart, roster]);

  const defenseStarters = useMemo(() => {
    if (!defensiveFormation || !defensiveFormation.rows) return [];
    const starters: { posName: string; playerName: string; playerNum: string }[] = [];
    defensiveFormation.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (!pos) return;
        const assigned = depthChart[pos.id] || [];
        const topItem = assigned[0];
        const topNum = typeof topItem === 'string' ? topItem : topItem?.playerNum || topItem?.num || '';
        if (topNum) {
          const p = roster.find((r) => r.num === topNum);
          starters.push({
            posName: pos.name,
            playerName: p ? getPlayerFullName(p) : `#${topNum}`,
            playerNum: topNum,
          });
        }
      });
    });
    return starters;
  }, [defensiveFormation, depthChart, roster]);

  // Filtered Roster for Quick Search
  const filteredRoster = useMemo(() => {
    if (!playerSearch.trim()) return roster;
    const q = playerSearch.toLowerCase().trim();
    return roster.filter((p) => {
      const fullName = getPlayerFullName(p).toLowerCase();
      const pos = getPlayerPos(p).toLowerCase();
      return (
        fullName.includes(q) ||
        p.num.toLowerCase().includes(q) ||
        pos.includes(q)
      );
    });
  }, [roster, playerSearch]);

  const handleToggleAttendance = (playerId: string) => {
    setAttendancePresent((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSelectAllAttendance = () => {
    setAttendancePresent(new Set(roster.map((r) => r.id || r.num)));
  };

  const handleClearAllAttendance = () => {
    setAttendancePresent(new Set());
  };

  const handleSaveAttendance = () => {
    if (!onQuickAttendanceSave) return;
    const presentNums = Array.from(attendancePresent);
    const absentNums = roster
      .map((r) => r.num)
      .filter((num) => !attendancePresent.has(num));

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      week: currentWeek,
      title: `Practice Attendance (${formatWeekLabel(currentWeek)})`,
      sessionType: 'padded',
      hours: 1.5,
      presentPlayerNums: presentNums,
      absentPlayerNums: absentNums,
      timestamp: Date.now(),
      notes: `Mobile Quick Check-in (${presentNums.length}/${roster.length} present)`,
    };
    onQuickAttendanceSave(record);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
  };

  const currentStartersList = starterUnit === 'offense' ? offenseStarters : defenseStarters;

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-xl mx-auto text-slate-100">
      {/* =========================================================================
          1. UPCOMING EVENT / GAME DAY HERO CARD
          ========================================================================= */}
      {upcomingEvent ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/80 rounded-3xl border border-indigo-500/30 p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wider uppercase flex items-center gap-1 ${
                  upcomingEvent.type === 'game'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : upcomingEvent.type === 'scrimmage'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {upcomingEvent.type === 'game' ? '🏈 GAME' : upcomingEvent.type === 'scrimmage' ? '⚡ SCRIMMAGE' : '📋 PRACTICE'}
              </span>
              {upcomingEvent.locationType && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {upcomingEvent.locationType}
                </span>
              )}
            </div>
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{upcomingEvent.time || '10:00 AM'}</span>
            </span>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-black text-white tracking-tight">
              {upcomingEvent.opponent ? `vs ${upcomingEvent.opponent}` : upcomingEvent.title}
            </h2>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              {upcomingEvent.date}
            </p>
          </div>

          {/* Location & Directions */}
          {upcomingEvent.location && (
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5 min-w-0 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate font-medium">{upcomingEvent.location}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(upcomingEvent.location)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
              >
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-4 text-center space-y-1 shadow-lg">
          <p className="text-xs font-black text-indigo-300 uppercase tracking-wider">
            {activeTeam.name} • {formatWeekLabel(currentWeek)}
          </p>
          <p className="text-sm font-bold text-white">Ready for Practice &amp; Game Day</p>
        </div>
      )}

      {/* =========================================================================
          2. CORE LAUNCH PAD TILES (Depth Chart, Practice Plan, Drills Library, Wristband)
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Depth Chart (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('depth_chart', 'offense')}
          className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-indigo-200">
            Depth Chart
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Pocket Chart &amp; Matrix
          </div>
        </button>

        {/* 2. Practice Plan (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('practice')}
          className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-emerald-200">
            Practice Plan
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Periods, Stations &amp; Timer
          </div>
        </button>

        {/* 3. Drills Library (Mobile View) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('drills')}
          className="bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Mobile View
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-cyan-200">
            Drills Library
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Technique &amp; Catalog
          </div>
        </button>

        {/* 4. Wristband Plays */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('wristband')}
          className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Watch className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Call Sheet
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-amber-200">
            Wristband Plays
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Color Grid &amp; Callout
          </div>
        </button>
      </div>

      {/* =========================================================================
          3. DEDICATED GUIDES SECTION (Playbooks, Scheme Cards & Installs)
          ========================================================================= */}
      <div className="bg-slate-850 rounded-3xl border border-indigo-500/30 p-3.5 shadow-xl space-y-3 relative overflow-hidden">
        {/* Guides Section Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white tracking-tight">Guides</h2>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {totalGuidesCount} Docs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Playbooks, Schemes &amp; Install Sheets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToUnit('guide')}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
          >
            <span>Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {guideCategories.map((cat) => {
            const isSelected = selectedGuideCategory === cat && !guideSearchTerm;
            const subCount = (guideOrder?.sub && guideOrder.sub[cat]?.length) ||
              (guideTree[cat] ? Object.keys(guideTree[cat]).length : 0);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedGuideCategory(cat);
                  setGuideSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-md font-mono ${
                    isSelected ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {subCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar for Guides */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search playbooks, schemes &amp; guides..."
            value={guideSearchTerm}
            onChange={(e) => setGuideSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {guideSearchTerm && (
            <button
              type="button"
              onClick={() => setGuideSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Document Cards List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
          {currentCategoryDocs.length > 0 ? (
            currentCategoryDocs.map((doc) => {
              const hasContent = Boolean(doc.content && doc.content.trim().length > 0);
              const isPdf = Boolean(doc.content && (doc.content.startsWith('data:application/pdf') || doc.content.endsWith('.pdf')));
              
              return (
                <div
                  key={`${doc.category}_${doc.name}`}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        hasContent
                          ? isPdf
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {doc.category === 'Offense' ? (
                        <Zap className="w-4 h-4" />
                      ) : doc.category === 'Defense' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{doc.name}</span>
                        {guideSearchTerm && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {doc.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {hasContent ? (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                            {isPdf ? 'PDF Guide' : 'HTML Schematic'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Template Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Document */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePreviewGuide(doc.category, doc.name, doc.content)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Quick Read / View"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Read</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGuideInStudio(doc.category, doc.name)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 transition-all active:scale-95 cursor-pointer"
                      title="Open in Playbook Studio"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1">
              <p className="text-xs font-bold text-slate-300">No guides matching search</p>
              <p className="text-[11px] text-slate-500">
                Clear filter or add new guide sections in the Studio.
              </p>
            </div>
          )}
        </div>

        {/* Fast Starter Templates Strip */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Scheme Templates</span>
            </span>
            <span className="text-[10px] text-slate-500">Tap to preview</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_GUIDE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handlePreviewStarterTemplate(tpl)}
                className="p-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all active:scale-95 cursor-pointer group"
              >
                <div className="text-[10px] font-black text-indigo-300 group-hover:text-indigo-200 truncate">
                  {tpl.tag}
                </div>
                <div className="text-[11px] font-bold text-white truncate mt-0.5">
                  {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1] || ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. SEGMENTED COACH COMMAND HUB (Tabs: Starters | Roster | Attendance)
          ========================================================================= */}
      <div className="bg-slate-850 rounded-3xl border border-slate-700/80 p-3.5 shadow-xl space-y-3">
        {/* Segmented Tab Bar */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setHubTab('starters')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'starters'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Starters</span>
          </button>
          <button
            type="button"
            onClick={() => setHubTab('roster')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setHubTab('attendance')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              hubTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>
        </div>

        {/* TAB CONTENT 1: STARTERS */}
        {hubTab === 'starters' && (
          <div className="space-y-3">
            {/* Unit Sub-Toggle (Offense vs Defense) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStarterUnit('offense')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    starterUnit === 'offense'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Offense ({offenseStarters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStarterUnit('defense')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    starterUnit === 'defense'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Defense ({defenseStarters.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToUnit('depth_chart', starterUnit)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Starters Grid */}
            <div className="grid grid-cols-2 gap-2">
              {currentStartersList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-black text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-zinc-700">
                    #{item.playerNum}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-indigo-300 uppercase tracking-tight">
                      {item.posName}
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {item.playerName}
                    </div>
                  </div>
                </div>
              ))}
              {currentStartersList.length === 0 && (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                  No starters assigned yet in this unit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ROSTER DIRECTORY */}
        {hubTab === 'roster' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name, #, or position..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {playerSearch && (
                <button
                  type="button"
                  onClick={() => setPlayerSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Roster List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {filteredRoster.map((player) => {
                const fullName = getPlayerFullName(player);
                const pos = getPlayerPos(player);

                return (
                  <div
                    key={player.id || player.num}
                    onClick={() => setSelectedPlayerModal(player)}
                    className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono font-black text-xs text-amber-300 flex items-center justify-center shrink-0">
                        #{player.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">
                          {fullName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          Pos: {pos}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {player.isCaptain && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Captain
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
              {filteredRoster.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                  No players matched "{playerSearch}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: QUICK ATTENDANCE */}
        {hubTab === 'attendance' && (
          <div className="space-y-3">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-black text-slate-200">
                <span>{attendancePresent.size}</span> / <span>{roster.length} Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllAttendance}
                  className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllAttendance}
                  className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Player Grid for Quick Tap */}
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
              {roster.map((player) => {
                const pid = player.id || player.num;
                const isPresent = attendancePresent.has(pid);
                const fullName = getPlayerFullName(player);

                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => handleToggleAttendance(pid)}
                    className={`p-2 rounded-xl text-left flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-black text-xs shrink-0 text-amber-300">
                        #{player.num}
                      </span>
                      <span className="text-xs font-bold truncate">
                        {fullName}
                      </span>
                    </div>
                    {isPresent ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Save Attendance Button */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 border border-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Practice Attendance</span>
            </button>

            {attendanceSavedToast && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 text-center animate-in fade-in">
                ✓ Attendance logged successfully for {formatWeekLabel(currentWeek)}!
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. COACHING SHORTCUTS STRIP
          ========================================================================= */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onNavigateToUnit('schedule')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-bold text-slate-300">Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('compliance')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-300">Hours</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('scouting')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Target className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] font-bold text-slate-300">Scouting</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('guide')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-300">Playbook</span>
        </button>
      </div>

      {/* =========================================================================
          5. THEME SCHEME SHOWCASE BANNER
          ========================================================================= */}
      {onOpenThemeGallery && (
        <button
          type="button"
          onClick={onOpenThemeGallery}
          className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-left shadow-lg active:scale-98 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-indigo-200 flex items-center gap-1.5">
                <span>Visual Theme Schemes</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  5 Presets
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Preview Volt Neon, Championship Gold, Cyber Cobalt &amp; more
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
        </button>
      )}

      {/* =========================================================================
          5. PLAYER DETAIL MODAL
          ========================================================================= */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm flex items-center justify-center">
                  #{selectedPlayerModal.num}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {getPlayerFullName(selectedPlayerModal)}
                  </h3>
                  <p className="text-xs text-indigo-300 font-bold">
                    {getPlayerPos(selectedPlayerModal)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlayerModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400">Position Profile</div>
                <div className="text-slate-200">
                  <span className="font-bold">Primary:</span> {selectedPlayerModal.primaryPosition || 'None'}
                </div>
                {selectedPlayerModal.offensivePosition && (
                  <div className="text-emerald-300">
                    <span className="font-bold">Offense:</span> {selectedPlayerModal.offensivePosition}
                  </div>
                )}
                {selectedPlayerModal.defensivePosition && (
                  <div className="text-blue-300">
                    <span className="font-bold">Defense:</span> {selectedPlayerModal.defensivePosition}
                  </div>
                )}
              </div>

              {selectedPlayerModal.notes && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Coach Notes</div>
                  <p className="text-slate-300 italic">{selectedPlayerModal.notes}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlayerModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. QUICK VIEW PLAYBOOK & GUIDE MODAL
          ========================================================================= */}
      {quickViewGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-slate-850 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-black text-white truncate">
                      {quickViewGuideModal.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {quickViewGuideModal.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {quickViewGuideModal.isStarterTemplate
                      ? 'Starter Scheme Reference Card'
                      : 'Sideline Document & Playbook Viewer'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const cat = quickViewGuideModal.category;
                    const doc = quickViewGuideModal.title;
                    setQuickViewGuideModal(null);
                    handleOpenGuideInStudio(cat, doc);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in</span> Studio
                </button>
                <button
                  type="button"
                  onClick={() => setQuickViewGuideModal(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="p-3 sm:p-4 flex-1 overflow-y-auto bg-slate-950 space-y-3">
              {quickViewGuideModal.content && quickViewGuideModal.content.trim().length > 0 ? (
                quickViewGuideModal.content.startsWith('data:application/pdf') ||
                quickViewGuideModal.content.endsWith('.pdf') ? (
                  <div className="w-full h-[60vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                    <iframe
                      src={quickViewGuideModal.content}
                      title={quickViewGuideModal.title}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full min-h-[50vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                    <iframe
                      srcDoc={quickViewGuideModal.content}
                      title={quickViewGuideModal.title}
                      className="w-full h-[60vh] border-0 bg-transparent"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                )
              ) : (
                <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3 my-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mx-auto flex items-center justify-center">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-sm font-black text-white">No Schematic Document Yet</h4>
                    <p className="text-xs text-slate-400">
                      This playbook section is currently blank. Open in the Studio to write custom HTML schematics, upload PDF install packs, or paste template cards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cat = quickViewGuideModal.category;
                      const doc = quickViewGuideModal.title;
                      setQuickViewGuideModal(null);
                      handleOpenGuideInStudio(cat, doc);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Open in Playbook Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">
                {quickViewGuideModal.category} &bull; {quickViewGuideModal.title}
              </span>
              <button
                type="button"
                onClick={() => setQuickViewGuideModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
