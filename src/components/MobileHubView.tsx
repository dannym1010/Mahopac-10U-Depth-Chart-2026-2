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
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  FileCode,
  Layers,
  Printer,
} from 'lucide-react';
import {
  generatePlaybookGuidePrintHTML,
  printCleanHTML,
} from '../utils/printUtils';
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
  attendanceLogs?: AttendanceRecord[];
  onSelectPractice?: (id: string) => void;
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

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatFullDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
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
  attendanceLogs = [],
  onSelectPractice,
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
  
  // Starters state: Unit, Team String & Formation
  const [starterUnit, setStarterUnit] = useState<'offense' | 'defense' | 'st'>('offense');
  const [starterString, setStarterString] = useState<'black' | 'blue' | 'gold' | 'sub' | 'matrix'>('black');
  const [selectedFormationId, setSelectedFormationId] = useState<string>('');

  const [playerSearch, setPlayerSearch] = useState('');

  // Attendance Date state (defaults to today)
  const [attendanceDate, setAttendanceDate] = useState<string>(() => getLocalDateString());
  const [attendancePresent, setAttendancePresent] = useState<Set<string>>(() => {
    return new Set(roster.map((r) => r.num));
  });
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);
  const [attendanceToastMessage, setAttendanceToastMessage] = useState('');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<RosterPlayer | null>(null);

  // Mobile Practice Plan Viewer Modal state
  const [mobileViewingPlan, setMobileViewingPlan] = useState<PracticePlan | null>(null);
  const [activeRunningPeriodIdx, setActiveRunningPeriodIdx] = useState<number>(0);
  const [mobilePlanFontSize, setMobilePlanFontSize] = useState<'normal' | 'large'>('normal');
  const [selectedMobilePeriodFilter, setSelectedMobilePeriodFilter] = useState<number | 'all'>('all');

  // When attendanceDate changes, load existing log if available
  React.useEffect(() => {
    const existing = attendanceLogs.find(
      (log) => log.date === attendanceDate && (!log.teamId || log.teamId === activeTeam.id)
    );
    if (existing && Array.isArray(existing.presentPlayerNums)) {
      setAttendancePresent(new Set(existing.presentPlayerNums));
    } else {
      setAttendancePresent(new Set(roster.map((r) => r.num)));
    }
  }, [attendanceDate, attendanceLogs, activeTeam.id, roster]);

  // Guides section state
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<string>('all');
  const [guideSearchTerm, setGuideSearchTerm] = useState('');
  const [guideZoom, setGuideZoom] = useState<number>(100);
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

  // Flattened list of ALL available guides across categories
  const allGuidesList = useMemo(() => {
    const list: { category: string; name: string; content: string }[] = [];
    guideCategories.forEach((cat) => {
      const subs = (guideOrder?.sub && guideOrder.sub[cat]) || (guideTree[cat] ? Object.keys(guideTree[cat]) : []);
      subs.forEach((docName) => {
        list.push({
          category: cat,
          name: docName,
          content: guideTree[cat]?.[docName] || '',
        });
      });
    });
    return list;
  }, [guideCategories, guideOrder, guideTree]);

  // Documents under the selected category (or all if 'all' is selected), with search applied
  const currentCategoryDocs = useMemo(() => {
    let list: { category: string; name: string; content: string }[] = [];

    if (selectedGuideCategory === 'all') {
      list = allGuidesList;
    } else {
      const subs = (guideOrder?.sub && guideOrder.sub[selectedGuideCategory]) ||
        (guideTree[selectedGuideCategory] ? Object.keys(guideTree[selectedGuideCategory]) : []);
      list = subs.map((docName) => ({
        category: selectedGuideCategory,
        name: docName,
        content: guideTree[selectedGuideCategory]?.[docName] || '',
      }));
    }
    
    if (!guideSearchTerm.trim()) {
      return list;
    }

    // If search term is present, filter across name and category
    const term = guideSearchTerm.toLowerCase().trim();
    return allGuidesList.filter((doc) =>
      doc.name.toLowerCase().includes(term) || doc.category.toLowerCase().includes(term)
    );
  }, [selectedGuideCategory, allGuidesList, guideTree, guideOrder, guideSearchTerm]);

  // Total count of guides across all categories
  const totalGuidesCount = useMemo(() => {
    return allGuidesList.length;
  }, [allGuidesList]);

  // Helper to open a guide in the studio
  const handleOpenGuideInStudio = (category: string, docName: string) => {
    if (onSelectGuideMain) onSelectGuideMain(category);
    if (onSelectGuideSub) onSelectGuideSub(docName);
    onNavigateToUnit('guide');
  };

  // Helper to preview guide content in modal
  const handlePreviewGuide = (category: string, docName: string, content: string) => {
    setGuideZoom(100);
    setQuickViewGuideModal({
      title: docName,
      category,
      content,
      isStarterTemplate: false,
    });
  };

  // Helper to print a playbook guide
  const handlePrintGuide = (category: string, docName: string, content: string) => {
    const teamTitle = activeTeam?.name || 'Mahopac 10U Indians';
    const teamSeason = activeTeam?.season || activeTeam?.ageGroup || '10U Football';

    if (content && (content.startsWith('data:application/pdf') || content.endsWith('.pdf'))) {
      window.open(content, '_blank');
      return;
    }

    const html = generatePlaybookGuidePrintHTML({
      teamName: teamTitle,
      teamSeason,
      category,
      subTab: docName,
      content,
      inkFriendly: true,
    });

    printCleanHTML(html, `${teamTitle} - ${category} - ${docName}`);
  };

  // Helper to preview template
  const handlePreviewStarterTemplate = (tpl: typeof QUICK_GUIDE_TEMPLATES[0]) => {
    setGuideZoom(100);
    setQuickViewGuideModal({
      title: tpl.title,
      category: tpl.category,
      content: tpl.code,
      isStarterTemplate: true,
    });
  };

  // Helper to navigate prev/next inside the reader modal
  const handleNavigateReaderGuide = (direction: -1 | 1) => {
    if (!quickViewGuideModal) return;
    if (quickViewGuideModal.isStarterTemplate) return;

    const currentIdx = allGuidesList.findIndex(
      (g) => g.category === quickViewGuideModal.category && g.name === quickViewGuideModal.title
    );
    if (currentIdx === -1) return;

    let targetIdx = currentIdx + direction;
    if (targetIdx < 0) targetIdx = allGuidesList.length - 1;
    if (targetIdx >= allGuidesList.length) targetIdx = 0;

    const targetGuide = allGuidesList[targetIdx];
    if (targetGuide) {
      setQuickViewGuideModal({
        title: targetGuide.name,
        category: targetGuide.category,
        content: targetGuide.content,
        isStarterTemplate: false,
      });
    }
  };

  // Quick scheduled practice dates for attendance jump
  const scheduledPracticeDates = useMemo(() => {
    return (scheduleEvents || [])
      .filter((e) => e && e.date && e.type === 'practice' && !e.isCancelled && (!e.teamId || e.teamId === activeTeam.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [scheduleEvents, activeTeam.id]);

  const formatShortDateChip = (dateStr: string) => {
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      }
    } catch {}
    return dateStr;
  };

  // =========================================================================
  // 1. PRACTICE PLAN & CURRENT DAY SCHEDULE RESOLVER
  // "on the mobile hub instead of showing practice with directions can you current
  // days practice plan link(like the next up of the schedule). It should show this
  // until after the practice is over."
  // =========================================================================
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  const todayPracticeInfo = useMemo(() => {
    const now = new Date();

    // 1. Look for today's practice event in schedule
    const todayEvent = (scheduleEvents || []).find((e) => {
      if (!e || !e.date || e.isCancelled) return false;
      const cleanDate = e.date.split('T')[0];
      return cleanDate === todayStr && e.type === 'practice';
    });

    // 2. Look for today's practice plan
    const todayPlan = (practicePlans || []).find((p) => {
      if (!p || !p.date) return false;
      return p.date.split('T')[0] === todayStr;
    }) || (todayEvent?.linkedPracticePlanId 
      ? (practicePlans || []).find((p) => p.id === todayEvent.linkedPracticePlanId)
      : null);

    if (!todayEvent && !todayPlan) {
      return null;
    }

    // Determine start and end time
    const timeStr = todayEvent?.time || '5:30 PM';
    const durationMinutes = todayEvent?.durationMinutes || 90;

    let isOver = false;
    let isLiveNow = false;

    try {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridiem = (match[3] || '').toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;

        const startDt = new Date();
        startDt.setHours(hours, minutes, 0, 0);

        const endDt = new Date(startDt.getTime() + durationMinutes * 60 * 1000);

        if (now.getTime() > endDt.getTime()) {
          isOver = true;
        } else if (now.getTime() >= startDt.getTime() && now.getTime() <= endDt.getTime()) {
          isLiveNow = true;
        }
      }
    } catch {
      isOver = false;
    }

    const planToUse = todayPlan || (practicePlans.length > 0 ? practicePlans[0] : null);

    return {
      event: todayEvent,
      plan: planToUse,
      timeStr,
      durationMinutes,
      isOver,
      isLiveNow,
    };
  }, [scheduleEvents, practicePlans, todayStr]);

  // Determine Next / Upcoming Event for Active Team (fallback when today's practice is over or absent)
  const nextUpcomingEvent = useMemo(() => {
    if (!scheduleEvents || scheduleEvents.length === 0) return null;
    const now = new Date();
    const sorted = [...scheduleEvents]
      .filter((e) => e && e.date && !e.isCancelled)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const futureEvents = sorted.filter((e) => {
      const eDate = new Date(e.date + 'T23:59:59');
      return eDate.getTime() >= now.getTime();
    });

    if (futureEvents.length > 0) {
      // If today's practice is over, skip today's practice event
      if (todayPracticeInfo?.isOver) {
        const next = futureEvents.find((e) => e.date.split('T')[0] !== todayStr);
        if (next) return next;
      }
      return futureEvents[0];
    }

    return sorted[sorted.length - 1] || null;
  }, [scheduleEvents, todayPracticeInfo, todayStr]);

  // Handler to jump directly to a practice plan or open mobile reader
  const handleOpenPracticePlan = (planId?: string) => {
    let target = planId ? (practicePlans || []).find((p) => p.id === planId) : null;
    if (!target) {
      target = todayPracticeInfo?.plan || (practicePlans && practicePlans.length > 0 ? practicePlans[0] : null);
    }
    if (target) {
      if (planId && onSelectPractice) {
        onSelectPractice(planId);
      }
      setMobileViewingPlan(target);
      return;
    }
    if (planId && onSelectPractice) {
      onSelectPractice(planId);
    }
    onNavigateToUnit('practice');
  };

  // =========================================================================
  // 2. TEAM STARTERS BREAKDOWN (Black, Gold, Blue, and Sub Section)
  // =========================================================================
  const unitFormations = useMemo(() => {
    return formations.filter((f) => f && f.unit === starterUnit);
  }, [formations, starterUnit]);

  // Keep selected formation in sync with the current unit
  const activeFormation = useMemo(() => {
    if (selectedFormationId) {
      const found = unitFormations.find((f) => f.id === selectedFormationId);
      if (found) return found;
    }
    return unitFormations[0] || formations.find((f) => f.unit === starterUnit) || formations[0];
  }, [unitFormations, selectedFormationId, formations, starterUnit]);

  // Extract all position depth slots for the active formation
  const formationPositionsData = useMemo(() => {
    if (!activeFormation || !activeFormation.rows) return [];

    const list: {
      posId: string;
      posName: string;
      rowLabel?: string;
      blackPlayer: { num: string; name: string; player?: RosterPlayer } | null;
      goldPlayer: { num: string; name: string; player?: RosterPlayer } | null;
      bluePlayer: { num: string; name: string; player?: RosterPlayer } | null;
      subPlayers: { num: string; name: string; depthIdx: number; player?: RosterPlayer }[];
    }[] = [];

    activeFormation.rows.forEach((row) => {
      if (!row || !row.positions) return;
      row.positions.forEach((pos) => {
        if (!pos) return;
        const assigned = depthChart[pos.id] || [];

        const getPlayerDetails = (item: any) => {
          if (!item) return null;
          const num = typeof item === 'string' ? item : item.playerNum || item.num || '';
          if (!num) return null;
          const p = roster.find((r) => r.num === num);
          return {
            num,
            name: p ? getPlayerFullName(p) : `#${num}`,
            player: p,
          };
        };

        const blackPlayer = getPlayerDetails(assigned[0]);
        const goldPlayer = getPlayerDetails(assigned[1]);
        const bluePlayer = getPlayerDetails(assigned[2]);
        const subPlayers: { num: string; name: string; depthIdx: number; player?: RosterPlayer }[] = [];

        for (let i = 3; i < assigned.length; i++) {
          const detail = getPlayerDetails(assigned[i]);
          if (detail) {
            subPlayers.push({ ...detail, depthIdx: i });
          }
        }

        list.push({
          posId: pos.id,
          posName: pos.name,
          rowLabel: row.label,
          blackPlayer,
          goldPlayer,
          bluePlayer,
          subPlayers,
        });
      });
    });

    return list;
  }, [activeFormation, depthChart, roster]);

  // Counts of assigned players across teams/strings
  const stringCounts = useMemo(() => {
    let blackCount = 0;
    let goldCount = 0;
    let blueCount = 0;
    let subCount = 0;

    formationPositionsData.forEach((pos) => {
      if (pos.blackPlayer) blackCount++;
      if (pos.goldPlayer) goldCount++;
      if (pos.bluePlayer) blueCount++;
      subCount += pos.subPlayers.length;
    });

    return { blackCount, goldCount, blueCount, subCount, totalPositions: formationPositionsData.length };
  }, [formationPositionsData]);

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

  const handleToggleAttendance = (playerNum: string) => {
    setAttendancePresent((prev) => {
      const next = new Set(prev);
      if (next.has(playerNum)) {
        next.delete(playerNum);
      } else {
        next.add(playerNum);
      }
      return next;
    });
  };

  const handleSelectAllAttendance = () => {
    setAttendancePresent(new Set(roster.map((r) => r.num)));
  };

  const handleClearAllAttendance = () => {
    setAttendancePresent(new Set());
  };

  const handleShiftAttendanceDate = (days: number) => {
    try {
      const parts = attendanceDate.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setDate(d.getDate() + days);
      setAttendanceDate(getLocalDateString(d));
    } catch {
      // ignore
    }
  };

  const handleSaveAttendance = () => {
    if (!onQuickAttendanceSave) return;
    const presentNums = Array.from(attendancePresent);
    const absentNums = roster
      .map((r) => r.num)
      .filter((num) => !attendancePresent.has(num));

    const dateFormatted = formatFullDateLabel(attendanceDate);

    const matchingSchedEvent = (scheduleEvents || []).find(
      (e) =>
        e.date === attendanceDate &&
        (!e.teamId || e.teamId === activeTeam.id) &&
        (e.type === 'practice' || e.type === 'scrimmage' || e.type === 'walkthrough')
    );

    const record: AttendanceRecord = {
      id: `att_${attendanceDate}_${Date.now()}`,
      scheduleEventId: matchingSchedEvent?.id,
      date: attendanceDate,
      week: currentWeek,
      teamId: activeTeam.id,
      title: matchingSchedEvent?.title || `Practice Attendance • ${dateFormatted}`,
      sessionType: matchingSchedEvent?.focusOrNotes?.toLowerCase().includes('cond') ? 'conditioning' : 'padded',
      hours: matchingSchedEvent?.durationMinutes ? Math.round((matchingSchedEvent.durationMinutes / 60) * 10) / 10 : 1.5,
      presentPlayerNums: presentNums,
      absentPlayerNums: absentNums,
      timestamp: Date.now(),
      notes: `Mobile Quick Check-in (${presentNums.length}/${roster.length} present on ${attendanceDate})`,
    };

    onQuickAttendanceSave(record);
    setAttendanceToastMessage(`✓ Attendance logged for ${dateFormatted} (${presentNums.length}/${roster.length} Present)`);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3500);
  };

  const existingDateLog = useMemo(() => {
    return attendanceLogs.find(
      (log) => log.date === attendanceDate && (!log.teamId || log.teamId === activeTeam.id)
    );
  }, [attendanceLogs, attendanceDate, activeTeam.id]);

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-xl mx-auto text-slate-100">
      {/* =========================================================================
          1. PRACTICE PLAN / UPCOMING EVENT HERO CARD
          ========================================================================= */}
      {todayPracticeInfo && !todayPracticeInfo.isOver ? (
        // SHOW TODAY'S PRACTICE PLAN HERO (UNTIL PRACTICE IS OVER)
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 rounded-3xl border border-emerald-500/40 p-4 shadow-2xl relative overflow-hidden space-y-3">
          {/* Top Status Strip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-xs ${
                  todayPracticeInfo.isLiveNow
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {todayPracticeInfo.isLiveNow ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
                    <span>LIVE PRACTICE NOW</span>
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>TODAY&apos;S PRACTICE PLAN</span>
                  </>
                )}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {activeTeam.name}
              </span>
            </div>

            <div className="text-xs font-black text-amber-300 flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayPracticeInfo.timeStr}</span>
            </div>
          </div>

          {/* Practice Title & Info */}
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>{todayPracticeInfo.plan?.title || todayPracticeInfo.event?.title || `Practice • ${formatFullDateLabel(todayStr)}`}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mt-1 flex-wrap">
              <span className="text-emerald-400 font-bold">{formatFullDateLabel(todayStr)}</span>
              <span>&bull;</span>
              <span>{todayPracticeInfo.durationMinutes} Min Session</span>
              {todayPracticeInfo.event?.attireCategory && (
                <>
                  <span>&bull;</span>
                  <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] font-black text-amber-300 uppercase">
                    {todayPracticeInfo.event.attireCategory}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Drill Periods Summary if available */}
          {todayPracticeInfo.plan?.periods && todayPracticeInfo.plan.periods.length > 0 && (
            <div className="bg-slate-950/70 rounded-2xl p-2.5 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>{todayPracticeInfo.plan.periods.length} Planned Periods</span>
                <span className="text-emerald-400">
                  {todayPracticeInfo.plan.periods.reduce((sum, p) => sum + (p.durationMinutes || p.duration || 0), 0) || todayPracticeInfo.durationMinutes} Min Total
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {todayPracticeInfo.plan.periods.slice(0, 5).map((period, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-700/60 shrink-0"
                  >
                    {period.name || period.title || `Period ${pIdx + 1}`}
                  </span>
                ))}
                {todayPracticeInfo.plan.periods.length > 5 && (
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap px-1">
                    +{todayPracticeInfo.plan.periods.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Primary Action Button: Open Today's Practice Plan in Reader */}
          <button
            type="button"
            onClick={() => handleOpenPracticePlan(todayPracticeInfo.plan?.id)}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-emerald-400/40"
          >
            <Eye className="w-4 h-4" />
            <span>Open Today&apos;s Practice Plan (Sideline View)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Location details (without directions link) */}
          {todayPracticeInfo.event?.location && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-medium">{todayPracticeInfo.event.location}</span>
            </div>
          )}
        </div>
      ) : nextUpcomingEvent ? (
        // SHOW NEXT SCHEDULE EVENT (OR TODAY'S PRACTICE OVER NOTICE + NEXT EVENT)
        <div className="space-y-2.5">
          {todayPracticeInfo && todayPracticeInfo.isOver && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Today&apos;s Practice is Complete</div>
                  <div className="text-[10px] text-slate-400">{todayPracticeInfo.timeStr} Session Ended</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPracticePlan(todayPracticeInfo.plan?.id)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Review Plan</span>
              </button>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/80 rounded-3xl border border-indigo-500/30 p-4 shadow-xl relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wider uppercase flex items-center gap-1 ${
                    nextUpcomingEvent.type === 'game'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : nextUpcomingEvent.type === 'scrimmage'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {nextUpcomingEvent.type === 'game' ? '🏈 NEXT GAME' : nextUpcomingEvent.type === 'scrimmage' ? '⚡ NEXT SCRIMMAGE' : '📋 NEXT PRACTICE'}
                </span>
                {nextUpcomingEvent.locationType && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {nextUpcomingEvent.locationType}
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-amber-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{nextUpcomingEvent.time || '10:00 AM'}</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {nextUpcomingEvent.opponent ? `vs ${nextUpcomingEvent.opponent}` : nextUpcomingEvent.title}
              </h2>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {formatFullDateLabel(nextUpcomingEvent.date)}
              </p>
            </div>

            {/* Action button if practice */}
            {nextUpcomingEvent.type === 'practice' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenPracticePlan(nextUpcomingEvent.linkedPracticePlanId)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Practice Plan (Sideline View)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {nextUpcomingEvent.location && (
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-medium">{nextUpcomingEvent.location}</span>
                  </div>
                )}
              </div>
            ) : (
              nextUpcomingEvent.location && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 min-w-0 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-medium">{nextUpcomingEvent.location}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(nextUpcomingEvent.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-4 text-center space-y-1.5 shadow-lg">
          <p className="text-xs font-black text-indigo-300 uppercase tracking-wider">
            {activeTeam.name} • {formatWeekLabel(currentWeek)}
          </p>
          <p className="text-sm font-bold text-white">Ready for Practice &amp; Game Day</p>
          <button
            type="button"
            onClick={() => handleOpenPracticePlan()}
            className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-300 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Practice Plans</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          2. CORE LAUNCH PAD TILES (Depth Chart, Practice Plan, Call Sheet, Playbook Guides, Wristband)
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
          onClick={() => handleOpenPracticePlan(todayPracticeInfo?.plan?.id)}
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

        {/* 3. Call Sheet (NEW: Offense & Defense Sideline Call Sheet) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('call_sheet')}
          className="bg-gradient-to-br from-rose-950/90 via-slate-900 to-slate-900 border border-rose-500/40 hover:border-rose-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Interactive
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-rose-200">
            Call Sheet
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Situations, 2-Pt &amp; Timeouts
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
              Wristband
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-amber-200">
            Wristband Plays
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Color Grid &amp; Callout
          </div>
        </button>

        {/* 5. Playbook Guides (Replaces Drills on main HUD) */}
        <button
          type="button"
          onClick={() => onNavigateToUnit('guide')}
          className="bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 p-3.5 rounded-2xl text-left shadow-lg active:scale-98 transition-all group cursor-pointer relative overflow-hidden col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {totalGuidesCount} Docs
            </span>
          </div>
          <div className="text-sm font-black text-white group-hover:text-cyan-200">
            Playbook Guides
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Schemes, Plays &amp; Installs
          </div>
        </button>
      </div>

      {/* =========================================================================
          COACHING SHORTCUTS STRIP (Drills, Schedule, Hours, Scouting, Playbook Studio)
          ========================================================================= */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => onNavigateToUnit('drills')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 active:scale-95 transition-all cursor-pointer group shadow-xs"
        >
          <Dumbbell className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-300">Drills</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('schedule')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 active:scale-95 transition-all cursor-pointer group shadow-xs"
        >
          <Calendar className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-300">Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('compliance')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 active:scale-95 transition-all cursor-pointer group shadow-xs"
        >
          <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-300">Hours</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('scouting')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1 active:scale-95 transition-all cursor-pointer group shadow-xs"
        >
          <Target className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-300">Scouting</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToUnit('guide')}
          className="hidden sm:flex bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 p-2.5 rounded-2xl flex-col items-center text-center gap-1 active:scale-95 transition-all cursor-pointer group shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-300">Studio</span>
        </button>
      </div>

      {/* =========================================================================
          3. DEDICATED GUIDES SECTION (Playbooks, Scheme Cards & Installs)
          ========================================================================= */}
      <div className="bg-slate-850 rounded-3xl border border-cyan-500/30 p-3.5 sm:p-4 shadow-xl space-y-3.5 relative overflow-hidden">
        {/* Guides Section Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white tracking-tight">Playbook &amp; Guides</h2>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {totalGuidesCount} Docs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Schemes, Plays, Installs &amp; Assignment Cards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToUnit('guide')}
            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-cyan-600/30 cursor-pointer shrink-0"
          >
            <span>Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Switcher Tabs (Like Drills library) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* 'All' Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedGuideCategory('all');
              setGuideSearchTerm('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedGuideCategory === 'all' && !guideSearchTerm
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded-md font-mono ${
                selectedGuideCategory === 'all' && !guideSearchTerm
                  ? 'bg-cyan-700/80 text-cyan-100'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {totalGuidesCount}
            </span>
          </button>

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
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-md font-mono ${
                    isSelected ? 'bg-cyan-700/80 text-cyan-100' : 'bg-slate-800 text-slate-500'
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
            className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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

        {/* Document Cards List (Styled Like Drills Library) */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
          {currentCategoryDocs.length > 0 ? (
            currentCategoryDocs.map((doc) => {
              const hasContent = Boolean(doc.content && doc.content.trim().length > 0);
              const isPdf = Boolean(doc.content && (doc.content.startsWith('data:application/pdf') || doc.content.endsWith('.pdf')));
              
              return (
                <div
                  key={`${doc.category}_${doc.name}`}
                  className="bg-slate-900/95 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-xs"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        hasContent
                          ? isPdf
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-white truncate">{doc.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase tracking-wider">
                          {doc.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {hasContent ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                            {isPdf ? 'PDF Install Guide' : 'Interactive Schematic'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
                            Blank Section • Ready in Studio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Document */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handlePreviewGuide(doc.category, doc.name, doc.content)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/25 active:scale-95 cursor-pointer"
                      title="Open Fullscreen Reader"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read / View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintGuide(doc.category, doc.name, doc.content)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Print Playbook Guide"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGuideInStudio(doc.category, doc.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Open in Playbook Studio"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Studio</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1.5">
              <p className="text-xs font-bold text-slate-300">No guides matching filter</p>
              <p className="text-[11px] text-slate-500">
                Clear search query or create new sections in the Playbook Studio.
              </p>
            </div>
          )}
        </div>

        {/* Fast Starter Templates Strip */}
        <div className="pt-2.5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Scheme Reference Cards</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">1-Tap Preview</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
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

        {/* TAB CONTENT 1: STARTERS (BLACK, GOLD, BLUE, SUB SECTION) */}
        {hubTab === 'starters' && (
          <div className="space-y-3">
            {/* Unit Selector: Offense, Defense, Special Teams */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setStarterUnit('offense');
                    setSelectedFormationId('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    starterUnit === 'offense'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Offense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStarterUnit('defense');
                    setSelectedFormationId('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    starterUnit === 'defense'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Defense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStarterUnit('st');
                    setSelectedFormationId('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    starterUnit === 'st'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ST
                </button>
              </div>

              {/* Formation Dropdown if multiple formations exist */}
              {unitFormations.length > 1 && (
                <select
                  value={activeFormation?.id || ''}
                  onChange={(e) => setSelectedFormationId(e.target.value)}
                  aria-label="Select Formation"
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-2 py-1 focus:outline-none max-w-[130px] truncate"
                >
                  {unitFormations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => onNavigateToUnit('depth_chart', starterUnit as any)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>Full Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Team / String Breakdown Selector (Black, Blue, Gold, Sub Section, All Matrix) */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
              {/* 1. Black Team (1st String) */}
              <button
                type="button"
                onClick={() => setStarterString('black')}
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  starterString === 'black'
                    ? 'bg-slate-950 text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[11px] font-black leading-none">⬛ Black</span>
                <span className="text-[9px] font-bold opacity-80">1st ({stringCounts.blackCount})</span>
              </button>

              {/* 2. Blue Team (3rd / Blue String) */}
              <button
                type="button"
                onClick={() => setStarterString('blue')}
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  starterString === 'blue'
                    ? 'bg-blue-600 text-white font-black border border-blue-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[11px] font-black leading-none">🟦 Blue</span>
                <span className="text-[9px] font-bold opacity-80">Blue ({stringCounts.blueCount})</span>
              </button>

              {/* 3. Gold Team (2nd / Gold String) */}
              <button
                type="button"
                onClick={() => setStarterString('gold')}
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  starterString === 'gold'
                    ? 'bg-amber-400 text-slate-950 font-black border border-amber-500 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[11px] font-black leading-none">🟨 Gold</span>
                <span className="text-[9px] font-bold opacity-80">Gold ({stringCounts.goldCount})</span>
              </button>

              {/* 4. Sub Section (Reserves / Backups) */}
              <button
                type="button"
                onClick={() => setStarterString('sub')}
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  starterString === 'sub'
                    ? 'bg-purple-900/90 text-purple-200 font-black border border-purple-400/60 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[11px] font-black leading-none">🟪 Sub</span>
                <span className="text-[9px] font-bold opacity-80">Sub ({stringCounts.subCount})</span>
              </button>

              {/* 5. Matrix (All 4 Strings / Teams) */}
              <button
                type="button"
                onClick={() => setStarterString('matrix')}
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  starterString === 'matrix'
                    ? 'bg-indigo-600 text-white font-black border border-indigo-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[11px] font-black leading-none">📊 Matrix</span>
                <span className="text-[9px] font-bold opacity-80">All 4</span>
              </button>
            </div>

            {/* Active Formation Banner & Position Count */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">
                Scheme: <span className="text-white">{activeFormation?.name || 'Standard'}</span>
              </span>
              <span className="text-[10px] font-mono">
                {formationPositionsData.length} Positions on Field
              </span>
            </div>

            {/* POSITION CARDS DISPLAY */}
            {starterString !== 'matrix' ? (
              // SINGLE STRING VIEW (BLACK, GOLD, BLUE, OR SUB)
              <div className="grid grid-cols-2 gap-2">
                {formationPositionsData.map((pos) => {
                  let playerObj =
                    starterString === 'black'
                      ? pos.blackPlayer
                      : starterString === 'gold'
                      ? pos.goldPlayer
                      : starterString === 'blue'
                      ? pos.bluePlayer
                      : null;

                  const isSub = starterString === 'sub';
                  const subList = pos.subPlayers;

                  return (
                    <div
                      key={pos.posId}
                      className={`bg-slate-900/90 border rounded-2xl p-2.5 flex flex-col justify-between transition-all ${
                        starterString === 'black'
                          ? 'border-slate-800 hover:border-amber-400/40'
                          : starterString === 'gold'
                          ? 'border-slate-800 hover:border-amber-400/60'
                          : starterString === 'blue'
                          ? 'border-slate-800 hover:border-blue-500/60'
                          : 'border-slate-800 hover:border-purple-500/60'
                      }`}
                    >
                      {/* Position Tag Header */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-black text-indigo-300 uppercase tracking-tight">
                          {pos.posName}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            starterString === 'black'
                              ? 'bg-slate-950 text-amber-300 border border-amber-400/30'
                              : starterString === 'gold'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : starterString === 'blue'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                          }`}
                        >
                          {starterString === 'black'
                            ? '1st String'
                            : starterString === 'gold'
                            ? '2nd String'
                            : starterString === 'blue'
                            ? '3rd String'
                            : 'Sub / Backup'}
                        </span>
                      </div>

                      {/* Player Row or Sub List */}
                      {isSub ? (
                        subList.length > 0 ? (
                          <div className="space-y-1">
                            {subList.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                onClick={() => sub.player && setSelectedPlayerModal(sub.player)}
                                className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/60 border border-purple-500/20 cursor-pointer hover:bg-slate-800 transition-colors"
                              >
                                <div className="w-6 h-6 rounded bg-purple-950 text-purple-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-purple-700/60">
                                  #{sub.num}
                                </div>
                                <span className="text-xs font-bold text-slate-200 truncate">
                                  {sub.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2 text-center text-[10px] text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800/60">
                            No Subs Assigned
                          </div>
                        )
                      ) : playerObj ? (
                        <div
                          onClick={() => playerObj?.player && setSelectedPlayerModal(playerObj.player)}
                          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <div
                            className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 border ${
                              starterString === 'black'
                                ? 'bg-black text-amber-400 border-zinc-700'
                                : starterString === 'gold'
                                ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                                : 'bg-blue-600 text-white border-blue-400 font-black'
                            }`}
                          >
                            #{playerObj.num}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-slate-100 truncate">
                              {playerObj.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {playerObj.player ? getPlayerPos(playerObj.player) : 'ATH'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigateToUnit('depth_chart', starterUnit as any)}
                          className="p-2 text-center text-[10px] text-slate-500 hover:text-slate-300 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                        >
                          + Unassigned
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // ALL 4 STRINGS MATRIX VIEW (Dense Multi-tier cards)
              <div className="space-y-2">
                {formationPositionsData.map((pos) => (
                  <div
                    key={pos.posId}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-tight">
                        {pos.posName}
                      </span>
                      {pos.rowLabel && (
                        <span className="text-[10px] font-bold text-slate-500">{pos.rowLabel}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                      {/* Black */}
                      <div
                        onClick={() => pos.blackPlayer?.player && setSelectedPlayerModal(pos.blackPlayer.player)}
                        className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${
                          pos.blackPlayer
                            ? 'bg-slate-950 border-amber-400/30 text-slate-200 cursor-pointer hover:border-amber-400'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-black text-amber-400 font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-zinc-700">
                          {pos.blackPlayer ? `#${pos.blackPlayer.num}` : '-'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-black text-amber-400 uppercase leading-none">Black (1st)</div>
                          <div className="text-[11px] font-bold truncate">
                            {pos.blackPlayer ? pos.blackPlayer.name : 'None'}
                          </div>
                        </div>
                      </div>

                      {/* Blue */}
                      <div
                        onClick={() => pos.bluePlayer?.player && setSelectedPlayerModal(pos.bluePlayer.player)}
                        className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${
                          pos.bluePlayer
                            ? 'bg-blue-950/40 border-blue-500/40 text-slate-200 cursor-pointer hover:border-blue-400'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-blue-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {pos.bluePlayer ? `#${pos.bluePlayer.num}` : '-'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-black text-blue-300 uppercase leading-none">Blue (3rd)</div>
                          <div className="text-[11px] font-bold truncate">
                            {pos.bluePlayer ? pos.bluePlayer.name : 'None'}
                          </div>
                        </div>
                      </div>

                      {/* Gold */}
                      <div
                        onClick={() => pos.goldPlayer?.player && setSelectedPlayerModal(pos.goldPlayer.player)}
                        className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${
                          pos.goldPlayer
                            ? 'bg-amber-950/40 border-amber-500/40 text-slate-200 cursor-pointer hover:border-amber-400'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {pos.goldPlayer ? `#${pos.goldPlayer.num}` : '-'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-black text-amber-300 uppercase leading-none">Gold (2nd)</div>
                          <div className="text-[11px] font-bold truncate">
                            {pos.goldPlayer ? pos.goldPlayer.name : 'None'}
                          </div>
                        </div>
                      </div>

                      {/* Sub */}
                      <div
                        className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${
                          pos.subPlayers.length > 0
                            ? 'bg-purple-950/40 border-purple-500/40 text-slate-200'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-purple-900 text-purple-200 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {pos.subPlayers.length > 0 ? `${pos.subPlayers.length}` : '0'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-black text-purple-300 uppercase leading-none">Sub / Res</div>
                          <div className="text-[11px] font-bold truncate">
                            {pos.subPlayers.length > 0
                              ? pos.subPlayers.map((s) => `#${s.num}`).join(', ')
                              : 'None'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  No players matched &quot;{playerSearch}&quot;.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: QUICK ATTENDANCE */}
        {hubTab === 'attendance' && (
          <div className="space-y-3">
            {/* 1. ATTENDANCE DATE CONTROLLER BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-3 space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ATTENDANCE SESSION DATE</span>
                  </div>
                  <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                    <span>{formatFullDateLabel(attendanceDate)}</span>
                    {attendanceDate === todayStr ? (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        TODAY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        PAST / CUSTOM DATE
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAttendanceDate(todayStr)}
                  disabled={attendanceDate === todayStr}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    attendanceDate === todayStr
                      ? 'opacity-40 text-slate-500 bg-slate-800 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-xs'
                  }`}
                >
                  Jump to Today
                </button>
              </div>

              {/* Interactive Date Change Controls */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleShiftAttendanceDate(-1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Day</span>
                </button>

                <div className="flex-1 max-w-[170px]">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => {
                      if (e.target.value) setAttendanceDate(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-center text-indigo-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleShiftAttendanceDate(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="Next Day"
                >
                  <span>Next Day</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Scheduled Practice Chips if available */}
              {scheduledPracticeDates.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Jump to Scheduled Practice Date:
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                    {scheduledPracticeDates.map((evt) => (
                      <button
                        key={evt.id || evt.date}
                        type="button"
                        onClick={() => setAttendanceDate(evt.date.split('T')[0])}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                          attendanceDate === evt.date.split('T')[0]
                            ? 'bg-indigo-600 text-white border-indigo-400 font-black shadow-xs'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {formatShortDateChip(evt.date)} ({evt.time || 'Practice'})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notice if existing log is loaded */}
              {existingDateLog && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] font-bold text-emerald-300 text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Recorded for this date: {existingDateLog.presentPlayerNums?.length || 0} Present,{' '}
                    {existingDateLog.absentPlayerNums?.length || 0} Absent. Saving will update this log.
                  </span>
                </div>
              )}
            </div>

            {/* 2. Action Bar */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="text-xs font-black text-slate-200">
                <span className="text-emerald-400">{attendancePresent.size}</span> / <span>{roster.length} Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllAttendance}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700 cursor-pointer active:scale-95"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={handleClearAllAttendance}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-300 hover:text-white border border-slate-700 cursor-pointer active:scale-95"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 3. Player Grid for Quick Tap */}
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
              {roster.map((player) => {
                const isPresent = attendancePresent.has(player.num);
                const fullName = getPlayerFullName(player);
                const pos = getPlayerPos(player);

                return (
                  <button
                    key={player.id || player.num}
                    type="button"
                    onClick={() => handleToggleAttendance(player.num)}
                    className={`p-2 rounded-xl text-left flex items-center justify-between gap-1.5 border transition-all cursor-pointer active:scale-98 ${
                      isPresent
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white shadow-xs'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-black text-xs shrink-0 text-amber-300">
                        #{player.num}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {fullName}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">
                          {pos}
                        </div>
                      </div>
                    </div>
                    {isPresent ? (
                      <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-slate-800 text-slate-600 border border-slate-700 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 4. Save Attendance Button */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 border border-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Attendance for {formatFullDateLabel(attendanceDate)}</span>
            </button>

            {attendanceSavedToast && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 text-center animate-in fade-in">
                {attendanceToastMessage || `✓ Attendance logged successfully for ${formatFullDateLabel(attendanceDate)}!`}
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
          6. STATE-OF-THE-ART FULL-SCREEN SIDELINE GUIDE READER MODAL
          ========================================================================= */}
      {quickViewGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-screen h-[100dvh] overflow-hidden animate-in fade-in">
          {/* Reader Top Command Bar */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 shadow-lg z-10">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setQuickViewGuideModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 text-xs font-bold"
                title="Back to Mobile Hub"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                    {quickViewGuideModal.title}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {quickViewGuideModal.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">
                  {quickViewGuideModal.isStarterTemplate
                    ? 'Starter Reference Card'
                    : 'Sideline Document & Scheme Reader'}
                </p>
              </div>
            </div>

            {/* Center: Prev / Next Guide Navigator */}
            {!quickViewGuideModal.isStarterTemplate && allGuidesList.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigateReaderGuide(-1)}
                  className="p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-0.5 cursor-pointer active:scale-95"
                  title="Previous Guide"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Prev</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono px-1">
                  {allGuidesList.findIndex(
                    (g) =>
                      g.category === quickViewGuideModal.category &&
                      g.name === quickViewGuideModal.title
                  ) + 1}{' '}
                  / {allGuidesList.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateReaderGuide(1)}
                  className="p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-0.5 cursor-pointer active:scale-95"
                  title="Next Guide"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right: Controls & Studio Link */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setGuideZoom((z) => Math.max(75, z - 25))}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-300 px-1 font-bold min-w-[36px] text-center">
                  {guideZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setGuideZoom((z) => Math.min(175, z + 25))}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {guideZoom !== 100 && (
                  <button
                    type="button"
                    onClick={() => setGuideZoom(100)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Print Guide Button */}
              <button
                type="button"
                onClick={() => {
                  handlePrintGuide(
                    quickViewGuideModal.category,
                    quickViewGuideModal.title,
                    quickViewGuideModal.content
                  );
                }}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Print this playbook guide"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Open in Studio Button */}
              <button
                type="button"
                onClick={() => {
                  const cat = quickViewGuideModal.category;
                  const doc = quickViewGuideModal.title;
                  setQuickViewGuideModal(null);
                  handleOpenGuideInStudio(cat, doc);
                }}
                className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Edit in Playbook Studio"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Studio</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setQuickViewGuideModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body / Full Screen Viewer */}
          <div className="flex-1 w-full bg-slate-950 overflow-auto relative p-2 sm:p-4 flex flex-col items-center">
            {quickViewGuideModal.content && quickViewGuideModal.content.trim().length > 0 ? (
              quickViewGuideModal.content.startsWith('data:application/pdf') ||
              quickViewGuideModal.content.endsWith('.pdf') ? (
                <div className="w-full h-full max-w-5xl flex-1 flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <div className="p-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs px-3">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>PDF Document</span>
                    </span>
                    <a
                      href={quickViewGuideModal.content}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>Open in Full Browser Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <iframe
                    src={quickViewGuideModal.content}
                    title={quickViewGuideModal.title}
                    className="w-full flex-1 border-0 bg-slate-900"
                  />
                </div>
              ) : (
                <div className="w-full h-full max-w-5xl flex-1 flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <div
                    className="w-full flex-1 overflow-auto bg-slate-950 transition-transform duration-200"
                    style={{
                      transform: guideZoom !== 100 ? `scale(${guideZoom / 100})` : undefined,
                      transformOrigin: 'top center',
                    }}
                  >
                    <iframe
                      srcDoc={quickViewGuideModal.content}
                      title={quickViewGuideModal.title}
                      className="w-full h-full min-h-[75vh] border-0 bg-transparent"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="max-w-md w-full my-auto p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mx-auto flex items-center justify-center">
                  <FileCode className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-white">No Schematic Document Yet</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This section ({quickViewGuideModal.category} &bull; {quickViewGuideModal.title}) is currently empty. Open in the Playbook Studio to create custom HTML schematics, upload PDF install sheets, or apply standard starter schemes.
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
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open in Playbook Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick-Jump Floating Bottom Bar */}
          {!quickViewGuideModal.isStarterTemplate && (
            <div className="p-2 sm:p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 shrink-0 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Jump:</span>
              </span>

              {allGuidesList.map((g) => {
                const isActive =
                  g.category === quickViewGuideModal.category && g.name === quickViewGuideModal.title;
                return (
                  <button
                    key={`${g.category}_${g.name}`}
                    type="button"
                    onClick={() => {
                      setQuickViewGuideModal({
                        title: g.name,
                        category: g.category,
                        content: g.content,
                        isStarterTemplate: false,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-[9px] opacity-75">{g.category}:</span>
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MOBILE PRACTICE PLAN VIEWER MODAL (READING & SIDELINE FOCUSED)
          "When i mobile view can you make it so its easier to see the practice plan.
          This view is more about viewing it and not editing it"
          ========================================================================= */}
      {mobileViewingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileViewingPlan(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
                title="Close Viewer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Sideline View
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {formatFullDateLabel(mobileViewingPlan.date || todayStr)}
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                  {mobileViewingPlan.title || 'Practice Plan'}
                </h1>
              </div>
            </div>

            {/* Quick Actions Header: Font Zoom & Full Editor */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobilePlanFontSize((prev) => (prev === 'normal' ? 'large' : 'normal'))}
                className={`px-2 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                  mobilePlanFontSize === 'large'
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
                title="Toggle font size for field readability"
              >
                <span className="text-[10px]">Text:</span>
                <span>{mobilePlanFontSize === 'large' ? 'Large' : 'Normal'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectPractice) onSelectPractice(mobileViewingPlan.id);
                  onNavigateToUnit('practice');
                  setMobileViewingPlan(null);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Open in full practice editor"
              >
                <Code className="w-3.5 h-3.5 hidden sm:inline" />
                <span>Full Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Session Summary Pill Strip */}
          <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400 font-medium">Session:</span>
              <span className="font-black text-emerald-400">
                {(mobileViewingPlan.periods || mobileViewingPlan.plan || []).reduce(
                  (sum, p) => sum + (p.durationMinutes || p.duration || p.time || 0),
                  0
                )}{' '}
                Minutes Total
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-slate-300">
                {(mobileViewingPlan.periods || mobileViewingPlan.plan || []).length} Periods
              </span>
            </div>

            {mobileViewingPlan.startTime && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 shrink-0">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{mobileViewingPlan.startTime} Start</span>
              </div>
            )}
          </div>

          {/* Quick Period Filter Tabs */}
          <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setSelectedMobilePeriodFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                selectedMobilePeriodFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Periods
            </button>
            {(mobileViewingPlan.periods || mobileViewingPlan.plan || []).map((p, pIdx) => {
              const isActiveRunning = activeRunningPeriodIdx === pIdx;
              const isSelected = selectedMobilePeriodFilter === pIdx;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setSelectedMobilePeriodFilter(pIdx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                      : isActiveRunning
                      ? 'bg-slate-800 text-amber-300 border-amber-400/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>P{pIdx + 1}</span>
                  <span className="text-[10px] opacity-80">({p.durationMinutes || p.duration || p.time || 0}m)</span>
                </button>
              );
            })}
          </div>

          {/* Practice Content Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* Live Sideline Progress Tracker Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-700/80 p-3 shadow-md flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE SIDELINE TRACKER</span>
                </div>
                <div className="text-xs font-black text-white truncate mt-0.5">
                  Active Period: #
                  {activeRunningPeriodIdx + 1} &bull;{' '}
                  {(mobileViewingPlan.periods || mobileViewingPlan.plan || [])[activeRunningPeriodIdx]?.name ||
                    (mobileViewingPlan.periods || mobileViewingPlan.plan || [])[activeRunningPeriodIdx]?.title ||
                    'Select Period'}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={activeRunningPeriodIdx <= 0}
                  onClick={() => setActiveRunningPeriodIdx((prev) => Math.max(0, prev - 1))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  &larr; Prev
                </button>
                <button
                  type="button"
                  disabled={
                    activeRunningPeriodIdx >=
                    (mobileViewingPlan.periods || mobileViewingPlan.plan || []).length - 1
                  }
                  onClick={() =>
                    setActiveRunningPeriodIdx((prev) =>
                      Math.min((mobileViewingPlan.periods || mobileViewingPlan.plan || []).length - 1, prev + 1)
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-xs font-black rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  Next Period &rarr;
                </button>
              </div>
            </div>

            {/* List of Periods */}
            {(mobileViewingPlan.periods || mobileViewingPlan.plan || [])
              .map((period, pIdx) => ({ period, pIdx }))
              .filter(({ pIdx }) => selectedMobilePeriodFilter === 'all' || selectedMobilePeriodFilter === pIdx)
              .map(({ period, pIdx }) => {
                const isRunning = activeRunningPeriodIdx === pIdx;
                const duration = period.durationMinutes || period.duration || period.time || 0;
                const stations = period.stations || [];

                return (
                  <div
                    key={pIdx}
                    className={`rounded-2xl border transition-all p-3.5 space-y-3 ${
                      isRunning
                        ? 'bg-slate-900/95 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    {/* Period Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isRunning
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-indigo-300 border border-slate-700'
                          }`}
                        >
                          Period {pIdx + 1}
                        </span>

                        {period.category && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-800/90 text-amber-300 border border-slate-700">
                            {period.category}
                          </span>
                        )}

                        {period.format && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-slate-800 text-slate-400">
                            {period.format}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                          {duration} min
                        </span>
                        {!isRunning && (
                          <button
                            type="button"
                            onClick={() => setActiveRunningPeriodIdx(pIdx)}
                            className="text-[10px] font-bold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Period Title */}
                    <h3
                      className={`font-black text-white tracking-tight ${
                        mobilePlanFontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base'
                      }`}
                    >
                      {period.name || period.title || `Period ${pIdx + 1}`}
                    </h3>

                    {/* Stations / Drills Display */}
                    {stations.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {stations.map((stn, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-950/80 rounded-xl border border-slate-800 p-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-indigo-300">
                                {stn.name || `Station ${sIdx + 1}`}
                              </span>
                              {stn.coach && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                                  👤 {stn.coach}
                                </span>
                              )}
                            </div>

                            {stn.desc && (
                              <p
                                className={`text-slate-200 font-semibold leading-relaxed ${
                                  mobilePlanFontSize === 'large' ? 'text-sm' : 'text-xs'
                                }`}
                              >
                                {stn.desc}
                              </p>
                            )}

                            {stn.focus && (
                              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-amber-300/90 font-medium">
                                <span className="font-bold shrink-0 text-amber-400">Key Focus:</span>
                                <span>{stn.focus}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        Full-team period with no station rotations.
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Bottom spacer */}
            <div className="h-6" />
          </div>
        </div>
      )}
    </div>
  );
};
