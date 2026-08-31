import {
  Team,
  RosterPlayer,
  FormationBoard,
  DrillFolder,
  PracticePlan,
  PracticePeriod,
  PlaybookGuideTree,
  PlaybookGuideOrder,
  StaffCoach,
  ScheduleEvent,
  SeasonConfig,
  AttendanceRecord,
} from '../types';

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team_10u',
    name: '10U Youth Tackle',
    ageGroup: '10U',
    season: '2026 Season',
    color: 'indigo',
    headCoachName: '',
    calendarUrl: 'http://ical-cdn.teamsnap.com/team_schedule/8a8fa840-7ecc-4756-8e56-cf0913c39beb.ics',
    notes: 'Official 10U tackle football division',
  },
  {
    id: 'team_9u',
    name: '9U Youth Tackle',
    ageGroup: '9U',
    season: '2026 Season',
    color: 'sky',
    headCoachName: '',
    notes: 'Official 9U youth tackle football division',
  },
  {
    id: 'team_12u',
    name: '12U Senior Tackle',
    ageGroup: '12U',
    season: '2026 Season',
    color: 'amber',
    headCoachName: '',
    notes: 'Senior youth tackle division',
  },
  {
    id: 'team_8u',
    name: '8U Rookie / Flag',
    ageGroup: '8U',
    season: '2026 Season',
    color: 'emerald',
    headCoachName: '',
    notes: 'Developmental rookie program',
  },
  {
    id: 'team_6u',
    name: '6U Flag Football',
    ageGroup: '6U',
    season: '2026 Season',
    color: 'purple',
    headCoachName: '',
    notes: 'Introductory flag division',
  },
];

export const MASTER_ROSTER: RosterPlayer[] = [];

export const INITIAL_DEFAULT_FORMATIONS: FormationBoard[] = [
  {
    id: "form_11",
    unit: "offense",
    name: "11 Offense",
    collapsed: false,
    rows: [
      {
        id: "row_11_ol",
        label: "Offensive Line & TE (Y1)",
        slotCount: 7,
        positions: [
          { id: "11-LT", name: "LT" },
          { id: "11-LG", name: "LG" },
          { id: "11-C", name: "C" },
          { id: "11-RG", name: "RG" },
          { id: "11-RT", name: "RT" },
          { id: "11-Y1", name: "Y1" },
          null
        ]
      },
      {
        id: "row_11_wr",
        label: "Wide Receivers (X, W, Z)",
        slotCount: 7,
        positions: [
          { id: "11-X", name: "X" },
          null,
          null,
          null,
          { id: "11-W", name: "W" },
          null,
          { id: "11-Z", name: "Z" }
        ]
      },
      {
        id: "row_11_bk",
        label: "Backfield (1 - 4)",
        slotCount: 7,
        positions: [
          null,
          null,
          { id: "11-1", name: "1 (QB)" },
          null,
          { id: "11-4", name: "4 (RB)" },
          null,
          null
        ]
      }
    ]
  },
  {
    id: "form_44_base",
    unit: "defense",
    name: "4-4 Base Defense",
    collapsed: false,
    rows: [
      {
        id: "row_44_dl",
        label: "Defensive Line (E9, T3, T1, E5)",
        slotCount: 7,
        positions: [
          { id: "def-e9", name: "E9" },
          { id: "def-t3", name: "T3" },
          { id: "def-t1", name: "T1" },
          { id: "def-e5", name: "E5" },
          null,
          null,
          null
        ]
      },
      {
        id: "row_44_lb",
        label: "Linebackers (M, W, S, R)",
        slotCount: 7,
        positions: [
          { id: "def-m", name: "M" },
          { id: "def-w", name: "W" },
          { id: "def-s", name: "S" },
          { id: "def-r", name: "R" },
          null,
          null,
          null
        ]
      },
      {
        id: "row_44_sec",
        label: "Secondary (CB, FS)",
        slotCount: 7,
        positions: [
          { id: "def-lcb", name: "LCB" },
          { id: "def-fs", name: "FS" },
          { id: "def-rcb", name: "RCB" },
          null,
          null,
          null,
          null
        ]
      }
    ]
  },
  {
    id: "form_st_base",
    unit: "st",
    name: "Kickoff Return / Coverage",
    collapsed: false,
    rows: [
      {
        id: "row_st_unit",
        label: "Special Teams Positions",
        slotCount: 10,
        positions: [
          { id: "st-k", name: "K" },
          { id: "st-p", name: "P" },
          { id: "st-ls", name: "LS" },
          { id: "st-h", name: "H" },
          { id: "st-ret", name: "RET" },
          null,
          null,
          null,
          null,
          null
        ]
      }
    ]
  },
  {
    id: "form_groups_base",
    unit: "groups",
    name: "Depth Chart Groups",
    collapsed: false,
    rows: [
      {
        id: "row_group_qb",
        label: "Quarterbacks",
        slotCount: 5,
        positions: [
          { id: "grp-qb1", name: "QB1" },
          { id: "grp-qb2", name: "QB2" },
          null,
          null,
          null
        ]
      },
      {
        id: "row_group_rb",
        label: "Running Backs",
        slotCount: 5,
        positions: [
          { id: "grp-rb1", name: "Tailback" },
          { id: "grp-rb2", name: "Fullback" },
          null,
          null,
          null
        ]
      }
    ]
  }
];

export const DEFAULT_CASCADING_DRILLS: DrillFolder[] = [
  {
    name: "📋 General",
    subfolders: [],
    drills: [
      {
        name: "General: Team Install (Chalk Talk)",
        desc: "Coaches review weekly game plan, formations, audibles, and opponent defensive/offensive tendencies on whiteboard.",
        key: "Keep whiteboard sessions brief and engaging for 10U."
      },
      {
        name: "General: Mandatory Water Break",
        desc: "Blow whistle twice. Players remove helmets and jog to water stations.",
        key: "Emphasize fast hydration and hustling back with positive energy."
      }
    ]
  },
  {
    name: "⚡ (Warm-up, Agility and Conditioning)",
    subfolders: [
      {
        name: "Warm-Up",
        subfolders: [],
        drills: [
          {
            name: "Warm-Up: Dynamic Progression 1",
            desc: "5 lines spaced 5 yards apart. Feet-Sink-Holsters, Jumping Jacks, High Knees, Butt Kickers, Carioca.",
            key: "Ensure proper knee drive, athletic stance, and synchronized cadence."
          },
          {
            name: "Agility Ladder Footwork",
            desc: "Ickey Shuffle, 2-in-2-out, lateral hops through speed agility ladder followed by 5-yard burst.",
            key: "Fast light feet, low center of gravity, head up eyes forward."
          }
        ]
      }
    ],
    drills: []
  },
  {
    name: "🏈 Offense",
    subfolders: [
      {
        name: "Quarterbacks (QB)",
        subfolders: [],
        drills: [
          {
            name: "Offense QB: Under Center Snap & Drop",
            desc: "Center snaps to QB. QB executes 3-step or 5-step drop on air, plant back foot, throw to target.",
            key: "Master snap exchange without fumbling, clean footwork rhythm."
          },
          {
            name: "QB / RB Mesh & Hand-off",
            desc: "QB opens at 4 o'clock or 8 o'clock, seats ball deep in RB belly pocket. RB clamps top arm down.",
            key: "Zero fumbles, eyes on defensive end / linebacker read."
          }
        ]
      },
      {
        name: "Offensive Line (OL)",
        subfolders: [],
        drills: [
          {
            name: "OL: Drive Block Progression",
            desc: "6-inch power step, thumbs up under breastplates, leg drive on heavy bags or sled.",
            key: "Flat back, wide base, strike on rising plane."
          },
          {
            name: "OL: Combo / Zone Reach Blocking",
            desc: "Tackle & Guard double team 3-tech defensive tackle up to backside linebacker.",
            key: "Shoulder to shoulder seal, peel off to second level on linebacker flow."
          }
        ]
      }
    ],
    drills: []
  },
  {
    name: "🛡️ Defense",
    subfolders: [
      {
        name: "Defensive Line & Linebackers",
        subfolders: [],
        drills: [
          {
            name: "DL: 6-Point Shed & Tackle",
            desc: "Fire off on snap ball movement, punch chest plate of blocker, shed outside shoulder, wrap tackle dummy.",
            key: "Explosive hips, violent hand shock, maintain outside contain."
          },
          {
            name: "LB: Scrape & Fill Drill",
            desc: "Mirror offensive guard pull, downhill shuffle, square shoulders, explode through running lane.",
            key: "Read guards not backfield eye candy, fill with inside shoulder."
          }
        ]
      }
    ],
    drills: []
  },
  {
    name: "💥 Tackling",
    subfolders: [],
    drills: [
      {
        name: "Seahawk / Heads-Up Form Tackling Circuit",
        desc: "Step 1: Breakdown athletic stance. Step 2: Buzz feet & near foot strike. Step 3: Eyes through numbers, wrap arms tightly, drive legs.",
        key: "Head up and to the side, safety-first leverage tackling."
      },
      {
        name: "Angle Pursuit & Open Field Alley Tackle",
        desc: "Ball carrier runs along numbers, defender takes proper pursuit angle to cut off sideline turn.",
        key: "Never guess back's cut, aim for inside hip, leverage to sideline."
      }
    ]
  }
];

export const DEFAULT_PRACTICE_TEMPLATES: Record<string, PracticePeriod[]> = {
  "Standard Practice": [
    {
      time: 10,
      category: "📋 General",
      format: "static",
      stations: [
        {
          name: "Team Stretch & Dynamic Warm-Up",
          desc: "Dynamic stretching, knee tucks, bounding, calisthenics",
          coach: "",
          focus: "Flexibility, energy & focus"
        }
      ]
    },
    {
      time: 15,
      category: "⚡ (Warm-up, Agility and Conditioning)",
      format: "static",
      stations: [
        {
          name: "Agility Ladder & Footwork Circuit",
          desc: "Quick feet, shuffle, 5-yard sprints",
          coach: "",
          focus: "Speed & foot placement"
        }
      ]
    },
    {
      time: 20,
      category: "🏈 Offense",
      format: "rotating",
      stations: [
        {
          name: "QB / RB Mesh & Pass Routes",
          desc: "Hand-off timing, quick slant & out routes",
          coach: "",
          focus: "Ball security & timing"
        },
        {
          name: "OL Drive & Reach Blocking",
          desc: "Pad leverage, gap steps, punch technique",
          coach: "",
          focus: "First 6-inch step & pad level"
        }
      ]
    },
    {
      time: 20,
      category: "🛡️ Defense",
      format: "rotating",
      stations: [
        {
          name: "DL Shed & Pursuit Angles",
          desc: "Get-off, rip/swim moves, bag tackle",
          coach: "",
          focus: "Attack blocker, maintain gap"
        },
        {
          name: "LB / DB Zone Drops & Tackling",
          desc: "Cover-2 / Cover-3 pass drops & pursuit alleys",
          coach: "",
          focus: "Eyes on QB, break on throw"
        }
      ]
    },
    {
      time: 20,
      category: "💥 Tackling",
      format: "static",
      stations: [
        {
          name: "Form Tackling Circuit",
          desc: "Breakdown, near-foot strike, wrap & roll finish",
          coach: "",
          focus: "Safety, head placement & leg drive"
        }
      ]
    },
    {
      time: 25,
      category: "🏈 Offense",
      format: "static",
      stations: [
        {
          name: "Team 11-on-11 Scrimmage / Script Install",
          desc: "Live script install vs scout defense, two-minute drill",
          coach: "",
          focus: "Huddle speed, pre-snap alignment & execution"
        }
      ]
    }
  ],
  "Walkthrough / Light": [
    {
      time: 10,
      category: "📋 General",
      format: "static",
      stations: [
        {
          name: "Chalk Talk & Script Review",
          desc: "Whiteboard walk-through of weekly opponent tendencies",
          coach: "",
          focus: "Mental assignments & checks"
        }
      ]
    },
    {
      time: 20,
      category: "⚡ (Warm-up, Agility and Conditioning)",
      format: "static",
      stations: [
        {
          name: "Light Stretch & Footwork",
          desc: "No pads dynamic warm-up and foam rolling",
          coach: "",
          focus: "Mobility & recovery"
        }
      ]
    },
    {
      time: 30,
      category: "🏈 Offense",
      format: "static",
      stations: [
        {
          name: "Offensive Walkthrough vs Air",
          desc: "Slow speed install, motion timing, cadence calls",
          coach: "",
          focus: "Zero false starts, clean mesh"
        }
      ]
    },
    {
      time: 30,
      category: "🛡️ Defense",
      format: "static",
      stations: [
        {
          name: "Defensive Alignment Walkthrough",
          desc: "Gap fits, motion adjustment, secondary rotation",
          coach: "",
          focus: "Proper pre-snap communication"
        }
      ]
    }
  ]
};

export const DEFAULT_GUIDES_TREE: PlaybookGuideTree = {
  "Offense": {
    "Full Playbook": "",
    "Quarterbacks": "",
    "Running Backs": "",
    "Wide Receivers": "",
    "Offensive Line": ""
  },
  "Defense": {
    "Full Playbook": "",
    "Defensive Line": "",
    "Linebackers": "",
    "Secondary": ""
  },
  "Specials": {
    "Special Teams": "",
    "Kicking & Punting": ""
  }
};

export const DEFAULT_GUIDES_ORDER: PlaybookGuideOrder = {
  main: ["Offense", "Defense", "Specials"],
  sub: {
    "Offense": ["Full Playbook", "Quarterbacks", "Running Backs", "Wide Receivers", "Offensive Line"],
    "Defense": ["Full Playbook", "Defensive Line", "Linebackers", "Secondary"],
    "Specials": ["Special Teams", "Kicking & Punting"]
  }
};

export const DEFAULT_SAVED_COACHES: string[] = [];

export const DEFAULT_SAVED_COACHES_BY_TEAM: Record<string, string[]> = {};

export const DEFAULT_TEAM_COACHES: StaffCoach[] = [];

export const MASTER_PLAY_LIBRARY: string[] = [
  "24 Dive",
  "25 Trap",
  "Sweep Right",
  "Bootleg Pass",
  "Screen Pass",
  "12 Dive (Lead Right)",
  "13 Dive (Lead Left)",
  "Sweep 28 Right",
  "Sweep 29 Left",
  "Iso Power 36",
  "Counter 21 Reverse"
];

export const DEFAULT_SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "ts_evt_1",
    teamId: "team_10u",
    type: "practice",
    title: "Free Clinic w/ Coach Gangemi",
    week: "pre-1",
    date: "2026-07-16",
    startTime: "18:00",
    endTime: "19:30",
    location: "Middle School Grass (between High School and Middle School) Baseball Outfield",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Arrival Time: 5:45 PM. Free clinic fundamentals & skills.",
    createdAt: 1721100000000,
    lastEdited: 1721100000000,
  },
  {
    id: "ts_evt_2",
    teamId: "team_10u",
    type: "practice",
    title: "First Day of Practice",
    week: "pre-2",
    date: "2026-08-03",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Arrival Time: 5:15 PM. First official day of summer practice.",
    createdAt: 1722700000000,
    lastEdited: 1722700000000,
  },
  {
    id: "ts_evt_3",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-2",
    date: "2026-08-04",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1722800000000,
    lastEdited: 1722800000000,
  },
  {
    id: "ts_evt_4",
    teamId: "team_10u",
    type: "practice",
    title: "DeMatteo Clinic",
    week: "pre-2",
    date: "2026-08-05",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Stadium Turf",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Arrival Time: 5:15 PM @ Mahopac High School Turf.",
    createdAt: 1722900000000,
    lastEdited: 1722900000000,
  },
  {
    id: "ts_evt_5",
    teamId: "team_10u",
    type: "meeting",
    title: "Equipment Pick Up",
    week: "pre-2",
    date: "2026-08-06",
    startTime: "16:00",
    endTime: "17:00",
    location: "Mahopac High School - EQUIPMENT TRAILERS (in back)",
    locationType: "home",
    arrivalMinutesBefore: 0,
    focusOrNotes: "Please make sure to bring check so you can pick up your equipment!",
    createdAt: 1723000000000,
    lastEdited: 1723000000000,
  },
  {
    id: "ts_evt_6",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-2",
    date: "2026-08-06",
    startTime: "18:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723010000000,
    lastEdited: 1723010000000,
  },
  {
    id: "ts_evt_7",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-3",
    date: "2026-08-10",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723300000000,
    lastEdited: 1723300000000,
  },
  {
    id: "ts_evt_8",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-3",
    date: "2026-08-11",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723400000000,
    lastEdited: 1723400000000,
  },
  {
    id: "ts_evt_9",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-3",
    date: "2026-08-12",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723500000000,
    lastEdited: 1723500000000,
  },
  {
    id: "ts_evt_10",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-3",
    date: "2026-08-13",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723600000000,
    lastEdited: 1723600000000,
  },
  {
    id: "ts_evt_11",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-4",
    date: "2026-08-17",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1723900000000,
    lastEdited: 1723900000000,
  },
  {
    id: "ts_evt_12",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-4",
    date: "2026-08-18",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1724000000000,
    lastEdited: 1724000000000,
  },
  {
    id: "ts_evt_13",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "pre-4",
    date: "2026-08-19",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1724100000000,
    lastEdited: 1724100000000,
  },
  {
    id: "ts_evt_14",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "0",
    date: "2026-08-24",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1724500000000,
    lastEdited: 1724500000000,
  },
  {
    id: "evt_pre_p1",
    teamId: "team_10u",
    type: "practice",
    title: "Preseason Conditioning & Stance Starts #1",
    week: "0",
    date: "2026-08-25",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_pre_1",
    focusOrNotes: "Arrival Time: 5:15 PM. Conditioning, stance & starts, 11-person alignments.",
    createdAt: 1724600000000,
    lastEdited: 1724600000000,
  },
  {
    id: "ts_evt_15",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "0",
    date: "2026-08-26",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1724700000000,
    lastEdited: 1724700000000,
  },
  {
    id: "evt_pre_p2",
    teamId: "team_10u",
    type: "practice",
    title: "Pursuit Angles & Base Offensive Install",
    week: "0",
    date: "2026-08-27",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_pre_2",
    focusOrNotes: "Arrival Time: 5:15 PM. Tackling circuit, pursuit angles, offensive install.",
    createdAt: 1724750000000,
    lastEdited: 1724750000000,
  },
  {
    id: "evt_ts_scr_metlife",
    teamId: "team_10u",
    type: "scrimmage",
    title: "Scrimmage @ MetLife Stadium vs Brewster",
    week: "0",
    date: "2026-08-28",
    startTime: "14:30",
    endTime: "16:30",
    location: "MetLife Stadium",
    locationType: "neutral",
    opponent: "Brewster",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Scrimmage vs. Brewster. Must Check-in @ Moody's Gate at 2:00 PM (Arrival 1:30 PM).",
    createdAt: 1724800000000,
    lastEdited: 1724800000000,
  },
  {
    id: "evt_w1_p0",
    teamId: "team_10u",
    type: "practice",
    title: "Week 1 Prep - Monday Installation & Fundamentals",
    week: "1",
    date: "2026-08-31",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Full Pads. Monday game-week install: Suffern front keys, punt coverage lanes, 11-person offense wristband test.",
    linkedPracticePlanId: "p_pre_monday_831",
    createdAt: 1724900000000,
    lastEdited: 1724900000000,
  },
  {
    id: "evt_w1_p1",
    teamId: "team_10u",
    type: "practice",
    title: "Week 1 Shells & Fundamentals / Redzone Prep",
    week: "1",
    date: "2026-09-01",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_pre_3",
    focusOrNotes: "Focus on 24 Dive, 25 Trap, and DL gap penetration keys vs Suffern.",
    createdAt: 1725000000000,
    lastEdited: 1725000000000,
  },
  {
    id: "ts_evt_16",
    teamId: "team_10u",
    type: "practice",
    title: "Practice",
    week: "1",
    date: "2026-09-02",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    createdAt: 1725050000000,
    lastEdited: 1725050000000,
  },
  {
    id: "evt_w1_p2",
    teamId: "team_10u",
    type: "practice",
    title: "Week 1 Full Padded Scrimmage Dress Rehearsal",
    week: "1",
    date: "2026-09-03",
    startTime: "17:30",
    endTime: "20:00",
    location: "Jimmy McDonough Memorial Park (Crane Rd) - Upper Field Behind the Skate Park",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_pre_4",
    focusOrNotes: "Full Pads. Wristband speed test, kickoff coverage, field goal block.",
    createdAt: 1725100000000,
    lastEdited: 1725100000000,
  },
  {
    id: "evt_g1",
    teamId: "team_10u",
    type: "game",
    title: "Game #1 @ Suffern",
    week: "1",
    date: "2026-09-06",
    startTime: "12:00",
    endTime: "14:15",
    location: "Suffern Middle School (80 Hemion Rd, Suffern NY)",
    locationType: "away",
    opponent: "Suffern",
    uniform: "White Away Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Regular Season Opener! Arrival Time: 10:30 AM at Suffern Middle School.",
    createdAt: 1725200000000,
    lastEdited: 1725200000000,
  },
  {
    id: "evt_w2_p1",
    teamId: "team_10u",
    type: "practice",
    title: "Week 2 - Yorktown Defense & Tackling",
    week: "2",
    date: "2026-09-08",
    startTime: "17:30",
    endTime: "19:00",
    location: "Crane Road",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_w2_1",
    focusOrNotes: "Full Pads. Contain drills and tackling vs Yorktown.",
    createdAt: 1725300000000,
    lastEdited: 1725300000000,
  },
  {
    id: "evt_w2_p2",
    teamId: "team_10u",
    type: "practice",
    title: "Week 2 - Redzone Execution & 2-Pt Plays",
    week: "2",
    date: "2026-09-10",
    startTime: "17:30",
    endTime: "19:00",
    location: "Crane Road",
    locationType: "home",
    arrivalMinutesBefore: 15,
    linkedPracticePlanId: "p_w2_2",
    focusOrNotes: "Goal line offense, tight formations, 2-minute drill hurry up.",
    createdAt: 1725400000000,
    lastEdited: 1725400000000,
  },
  {
    id: "evt_g2",
    teamId: "team_10u",
    type: "game",
    title: "Game #2 vs Yorktown Huskers",
    week: "2",
    date: "2026-09-13",
    startTime: "12:00",
    endTime: "14:15",
    location: "Mahopac High School - Stadium Turf",
    locationType: "home",
    opponent: "Yorktown Huskers",
    uniform: "Gold Home Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Home Opener! Arrival Time: 10:30 AM at Mahopac High School Stadium Turf.",
    createdAt: 1725500000000,
    lastEdited: 1725500000000,
  },
  {
    id: "evt_g3",
    teamId: "team_10u",
    type: "game",
    title: "Game #3 vs Shrub Oak",
    week: "3",
    date: "2026-09-20",
    startTime: "12:00",
    endTime: "14:15",
    location: "Mahopac High School - Stadium Turf",
    locationType: "home",
    opponent: "Shrub Oak",
    uniform: "Gold Home Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Arrival Time: 10:30 AM at Mahopac High School Stadium Turf.",
    createdAt: 1725600000000,
    lastEdited: 1725600000000,
  },
  {
    id: "evt_g4",
    teamId: "team_10u",
    type: "game",
    title: "Game #4 @ Carmel Rams",
    week: "4",
    date: "2026-09-27",
    startTime: "13:00",
    endTime: "15:15",
    location: "Carmel High School (30 Fair St, Carmel NY)",
    locationType: "away",
    opponent: "Carmel Rams",
    uniform: "White Away Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Arrival Time: 11:30 AM at Carmel High School.",
    createdAt: 1725700000000,
    lastEdited: 1725700000000,
  },
  {
    id: "evt_g5",
    teamId: "team_10u",
    type: "game",
    title: "Game #5 vs Wappingers Wildcats",
    week: "5",
    date: "2026-10-04",
    startTime: "15:00",
    endTime: "17:15",
    location: "Mahopac High School - Stadium Turf",
    locationType: "home",
    opponent: "Wappingers Wildcats",
    uniform: "Gold Home Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Arrival Time: 1:30 PM at Mahopac High School Stadium Turf.",
    createdAt: 1725800000000,
    lastEdited: 1725800000000,
  },
  {
    id: "evt_g6",
    teamId: "team_10u",
    type: "game",
    title: "Game #6 @ Brewster",
    week: "6",
    date: "2026-10-11",
    startTime: "15:00",
    endTime: "17:15",
    location: "Brewster High School Field (50 Foggintown Rd, Brewster NY)",
    locationType: "away",
    opponent: "Brewster",
    uniform: "White Away Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Arrival Time: 1:30 PM at Brewster High School Field.",
    createdAt: 1725900000000,
    lastEdited: 1725900000000,
  },
  {
    id: "evt_g7",
    teamId: "team_10u",
    type: "game",
    title: "Game #7 vs Somers Tuskers",
    week: "7",
    date: "2026-10-18",
    startTime: "14:00",
    endTime: "16:15",
    location: "Mahopac High School - Stadium Turf",
    locationType: "home",
    opponent: "Somers Tuskers",
    uniform: "Gold Home Jerseys",
    arrivalMinutesBefore: 90,
    focusOrNotes: "Arrival Time: 12:30 PM at Mahopac High School Stadium Turf.",
    createdAt: 1726000000000,
    lastEdited: 1726000000000,
  },
  {
    id: "evt_g8",
    teamId: "team_10u",
    type: "game",
    title: "Game #8 vs TBD",
    week: "8",
    date: "2026-10-25",
    startTime: "15:20",
    endTime: "17:30",
    location: "TBD",
    locationType: "home",
    opponent: "TBD",
    uniform: "Gold Home / White Away (TBD)",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Arrival Time: 3:20 PM.",
    createdAt: 1726100000000,
    lastEdited: 1726100000000,
  }
];

export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  preseasonWeeksCount: 4,
  preseasonWeekKeys: ['0', 'pre-1', 'pre-2', 'pre-3', 'pre-4'],
  regularSeasonWeeksCount: 8,
  hasPlayoffs: true,
  hasChampionship: true,
  customWeekLabels: {
    '0': 'Pre-Season Week 1',
    'pre-1': 'Pre-Season Week 1',
    'pre-2': 'Pre-Season Week 2',
    'pre-3': 'Pre-Season Week 3',
    'pre-4': 'Pre-Season Week 4',
    '1': 'Week 1',
    '2': 'Week 2',
    '3': 'Week 3',
    '4': 'Week 4',
    '5': 'Week 5',
    '6': 'Week 6',
    '7': 'Week 7',
    '8': 'Week 8',
    'playoffs': 'Playoffs',
    'championship': 'Championship',
  }
};

export const DEFAULT_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: "att_pre_1",
    date: "2026-08-25",
    week: "0",
    title: "Preseason Conditioning Practice #1",
    sessionType: "conditioning",
    hours: 1.5,
    location: "Main Field",
    presentPlayerNums: [],
    absentPlayerNums: [],
    notes: "Mandatory Heat & Acclimatization conditioning. Helmets, tees & shorts only.",
    timestamp: 1724600000000,
  }
];

export const DEFAULT_INITIAL_PRACTICES: PracticePlan[] = [
  {
    id: "p_pre_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Preseason Wk 1",
    dayFolder: "Tuesday 8/25",
    date: "2026-08-25",
    title: "Preseason Conditioning & Stance Starts #1",
    location: "Crane Road",
    periods: [
      {
        time: 10,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Team Dynamic Warm-Up & Stretches",
            desc: "High knees, butt kicks, carioca, ankle mobility, team cheer.",
            coach: "",
            focus: "Energy, team cadence, flexibility"
          }
        ]
      },
      {
        time: 20,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Agility Ladder & 5-10-5 Pro Shuttle",
            desc: "2-in-2-out, icky shuffle, quick deceleration and change of direction.",
            coach: "",
            focus: "Low center of gravity, light fast feet"
          }
        ]
      },
      {
        time: 20,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "QB & RB Snap / Mesh Exchange",
            desc: "Under center snap mechanics, 3-step drop, secure mesh handoff.",
            coach: "",
            focus: "Zero fumbles, secure top elbow pocket"
          },
          {
            name: "OL Stance, Get-Off & 6-Inch Power Step",
            desc: "3-point stance alignment, first 6-inch drive step into sled.",
            coach: "",
            focus: "Wide base, low pads, thumbs up punch"
          }
        ]
      },
      {
        time: 20,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "DL Stance & First Step Get-Off",
            desc: "Explode on ball movement, strike bag with inside hands, maintain gap integrity.",
            coach: "",
            focus: "Eyes on ball, explosive hips"
          },
          {
            name: "LB / DB Stance & Lateral Shuffle",
            desc: "Athletic breakdown stance, downhill plant, mirror ball movement.",
            coach: "",
            focus: "Square shoulders, avoid crossing feet"
          }
        ]
      },
      {
        time: 20,
        category: "💥 Tackling",
        format: "static",
        stations: [
          {
            name: "Heads-Up / Seahawk Leverage Form Circuit",
            desc: "Breakdown -> Buzz feet -> Near foot strike -> Wrap & squeeze dummy to ground.",
            coach: "",
            focus: "Safety first: head out of the tackle, eyes up"
          }
        ]
      }
    ]
  },
  {
    id: "p_pre_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Preseason Wk 1",
    dayFolder: "Thursday 8/27",
    date: "2026-08-27",
    title: "Pursuit Angles & Base Offensive Install",
    location: "Crane Road",
    periods: [
      {
        time: 10,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Team Dynamic Warm-Up",
            desc: "Progressive running, leg swings, arm circles, team break.",
            coach: "",
            focus: "Focus and tempo"
          }
        ]
      },
      {
        time: 25,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Inside Zone / 24 Dive Timing",
            desc: "FB kick-out block, RB patience and cut off guard's hip.",
            coach: "",
            focus: "Hitting the designated hole with speed"
          },
          {
            name: "Pass Protection & Footwork",
            desc: "Kick slide, punch timing, post-foot plant.",
            coach: "",
            focus: "Balance and posture"
          }
        ]
      },
      {
        time: 25,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Defense Pursuit Drill (Alley Runs)",
            desc: "All 11 players break on ball flight, take proper outside/inside pursuit lanes.",
            coach: "",
            focus: "Containment and relentless hustle"
          }
        ]
      },
      {
        time: 30,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Team Offense 11-on-Air Script Review",
            desc: "Run 10 core plays on air with cadence, shift motions, and huddle break.",
            coach: "",
            focus: "Zero pre-snap penalties, crisp execution"
          }
        ]
      }
    ]
  },
  {
    id: "p_pre_monday_831",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 1",
    dayFolder: "Monday 8/31",
    date: "2026-08-31",
    title: "Week 1 Monday Installation & Base Fundamentals",
    location: "Crane Road",
    periods: [
      {
        time: 10,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Dynamic Warmup & Team Breakdown",
            desc: "High knees, hip openers, form runs, kickoff team cadence call.",
            coach: "",
            focus: "High tempo, focus, team discipline"
          }
        ]
      },
      {
        time: 20,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Foot Fire & Reaction Tackling Pad",
            desc: "Quick chop feet into rapid strike on padded shield with proper leverage.",
            coach: "",
            focus: "Eyes up, shoulder strike, wrap and squeeze"
          }
        ]
      },
      {
        time: 25,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "11-Person Base Scheme & Wristband Installation",
            desc: "24 Dive, 25 Trap, and Sweep installation with wristband number checks.",
            coach: "",
            focus: "Rapid huddle break and clean handoff mesh"
          },
          {
            name: "Offensive Line Drive & Reach Blocks",
            desc: "Steps for gap control and seal blocks against Carmel 4-man front.",
            coach: "",
            focus: "Wide base, low pad level, hand placement"
          }
        ]
      },
      {
        time: 20,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "DL & LB Gap Integrity & Pursuit Flow",
            desc: "Keying guards, shooting correct gaps, outside containment.",
            coach: "",
            focus: "Never lose outside leverage, fast lateral flow"
          }
        ]
      },
      {
        time: 15,
        category: "🏈 Special Teams",
        format: "static",
        stations: [
          {
            name: "Punt Coverage Lanes & Specialist Timing",
            desc: "Gunner release off line, lane discipline, secure snap-to-kick in 2.0s.",
            coach: "",
            focus: "Sprint to returner, breakdown inside 5 yards"
          }
        ]
      }
    ]
  },
  {
    id: "p_pre_3",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 1",
    dayFolder: "Tuesday 9/01",
    date: "2026-09-01",
    title: "Week 1 Shells & Fundamentals / Redzone Prep",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Dynamic Stretch & Foot Fire",
            desc: "Fast feet reaction drill on whistle.",
            coach: "",
            focus: "Reaction time"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Sweep 28 Right & Reach Blocks",
            desc: "PST reach block, guard seal, RB accelerate to sideline numbers.",
            coach: "",
            focus: "Edge speed"
          },
          {
            name: "WR Stalk Blocking & Routes",
            desc: "Mirror DB, mirror hips, drive block on whistle.",
            coach: "",
            focus: "Effort without holding"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Cover 2 & Cover 3 Zone Drops",
            desc: "DBs backpedal to deep third/half, rally on thrown football.",
            coach: "",
            focus: "Eye on QB, break on release"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Kickoff & Kickoff Return Alignment",
            desc: "Lanes coverage, avoid wedge block, safety touchback protocol.",
            coach: "",
            focus: "Stay in designated running lane"
          }
        ]
      }
    ]
  },
  {
    id: "p_pre_4",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 1",
    dayFolder: "Thursday 9/03",
    date: "2026-09-03",
    title: "Week 1 Full Padded Scrimmage Dress Rehearsal",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Team Warmup & Calisthenics",
            desc: "Full pre-game warm-up progression.",
            coach: "",
            focus: "Game day tempo"
          }
        ]
      },
      {
        time: 25,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Goal Line & Short Yardage Package",
            desc: "I-Formation Heavy, Power 36, Wedge 0.",
            coach: "",
            focus: "Low pad level, push the pile"
          }
        ]
      },
      {
        time: 25,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Goal Line Stand & Blitz Package",
            desc: "A-gap blitz, pinch tackles, prevent push.",
            coach: "",
            focus: "Penetration and secure tackle"
          }
        ]
      },
      {
        time: 25,
        category: "⚔️ Practice / Scrimmage",
        format: "static",
        stations: [
          {
            name: "Live 11-on-11 Controlled Scrimmage",
            desc: "Offense vs Defense 15-play situational scrimmage with referee whistle.",
            coach: "",
            focus: "Game speed execution and player rotations"
          }
        ]
      }
    ]
  },
  {
    id: "p_w2_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 2",
    dayFolder: "Tuesday 9/08",
    date: "2026-09-08",
    title: "Week 2 - Somers Wing-T Contain & Tackling",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Chalk Talk & Defensive Scouting",
            desc: "Review opponent 5-3 defense and blitz tendencies.",
            coach: "",
            focus: "Blocking assignments"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Counter 21 Reverse & Bootleg Pass Install",
            desc: "Misdirection footwork, tight end drag route.",
            coach: "",
            focus: "Sell the fake run"
          },
          {
            name: "OL Trap Block Technique",
            desc: "Backside guard pull, trap 3-tech defensive tackle.",
            coach: "",
            focus: "Tight pull line, head in hole"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Defending the Wing-T / Sweep",
            desc: "Force outside run back inside, linebackers scrape downhill.",
            coach: "",
            focus: "Set edge firmly"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Punt & Punt Protection Team",
            desc: "Shield punt wall, long snap consistency, 40-yard sprint gunners.",
            coach: "",
            focus: "Zero blocked punts, fair catch awareness"
          }
        ]
      }
    ]
  },
  {
    id: "p_w2_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 2",
    dayFolder: "Thursday 9/10",
    date: "2026-09-10",
    title: "Week 2 - Redzone Execution & 2-Pt Plays",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Dynamic Warmup & Agility",
            desc: "Ladder drills and hip mobility.",
            coach: "",
            focus: "Agility and foot quickness"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Redzone & 2-Point Conversion Package",
            desc: "Goal line execution: Power 36, TE Pop, Wedge.",
            coach: "",
            focus: "Score from 3 yards out"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Goal Line Defense & Blitz Check",
            desc: "Gap fills and stopping interior push.",
            coach: "",
            focus: "No gain at the goal line"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Extra Point & Field Goal Team",
            desc: "Snap, hold, kick timing in 1.3 seconds.",
            coach: "",
            focus: "Accuracy and snap consistency"
          }
        ]
      }
    ]
  },
  {
    id: "p_w3_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 3",
    dayFolder: "Tuesday 9/15",
    date: "2026-09-15",
    title: "Week 3 - Yorktown Spread Defense & Option",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Team Dynamic Warm-Up & Footwork",
            desc: "Cone drills, 5-10-5 shuttle, rapid hip turn.",
            coach: "",
            focus: "Change of direction and pad level"
          }
        ]
      },
      {
        time: 25,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Option & Pitch Timing (Sweep 29)",
            desc: "QB mesh with fullback, pitch to tailback on perimeter.",
            coach: "",
            focus: "Pitch on outside shoulder"
          },
          {
            name: "OL Reach & Seal on Yorktown 4-4",
            desc: "Reach block defensive end, climb to inside linebacker.",
            coach: "",
            focus: "Wide base and sustained hand punch"
          }
        ]
      },
      {
        time: 25,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Contain & Option Assignment",
            desc: "DE takes QB dive, OLB takes pitch, CB forces inside.",
            coach: "",
            focus: "Discipline on option reads"
          },
          {
            name: "Pass Coverage & Deep Thirds",
            desc: "Cover-3 zone drop, rally to flats on throw.",
            coach: "",
            focus: "Backpedal speed and break on ball"
          }
        ]
      },
      {
        time: 25,
        category: "⚔️ Practice / Scrimmage",
        format: "static",
        stations: [
          {
            name: "11-on-11 Situational Scrimmage vs Spread",
            desc: "Offense script vs Defense scout team, 3rd & long conversions.",
            coach: "",
            focus: "Game tempo and quick huddle breaks"
          }
        ]
      }
    ]
  },
  {
    id: "p_w3_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 3",
    dayFolder: "Thursday 9/17",
    date: "2026-09-17",
    title: "Week 3 - Situational 2-Minute & Scrimmage",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Special Teams Walkthrough & Pregame Routine",
            desc: "Kickoff, Kick Return, Punt Protection, Onside recovery.",
            coach: "",
            focus: "Assignment clarity and lane integrity"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "2-Minute Drill & Hurried Cadence",
            desc: "Hurry up offense, out routes, clock management.",
            coach: "",
            focus: "Get out of bounds, snap in 8 seconds"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Prevent Defense & Redzone Lock",
            desc: "No big plays over top, secure form tackle in field of play.",
            coach: "",
            focus: "Tackle in bounds to keep clock running"
          }
        ]
      },
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "4th Quarter Conditioning Sprints",
            desc: "Four 40-yard sprints with perfect starting stance.",
            coach: "",
            focus: "Mental toughness and finishing strong"
          }
        ]
      }
    ]
  },
  {
    id: "p_w4_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 4",
    dayFolder: "Tuesday 9/22",
    date: "2026-09-22",
    title: "Week 4 - Brewster Power Run Defense & Counter",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Agility Ladder & Form Tackling",
            desc: "Speed ladder into near-foot form wrap on tackle wheel.",
            coach: "",
            focus: "Clean wrap and leg drive"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Counter 21 Reverse & Bootleg Pass",
            desc: "Fake dive, guard pull, bootleg throw to tight end.",
            coach: "",
            focus: "Sell the fake run completely"
          },
          {
            name: "OL Guard Pull & Trap Footwork",
            desc: "Open step, scrape the center's hip, trap defensive tackle.",
            coach: "",
            focus: "Pad level and explosive shoulder contact"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Stopping Brewster Power I & Iso",
            desc: "LB fill A & B gaps, meet fullback in hole at line of scrimmage.",
            coach: "",
            focus: "No yards after contact"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Punt Team & Fake Punt Package",
            desc: "Punt formation, gunner releases, fake punt pass option.",
            coach: "",
            focus: "100% protection execution"
          }
        ]
      }
    ]
  },
  {
    id: "p_w4_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 4",
    dayFolder: "Thursday 9/24",
    date: "2026-09-24",
    title: "Week 4 - Homecoming Redzone & Special Teams",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Pregame Warm-Up Progression",
            desc: "Full pre-game routine, calisthenics, specialist kicks.",
            coach: "",
            focus: "High energy, Homecoming focus"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Goal Line Heavy & Redzone Script",
            desc: "Heavy I-Formation, Wedge, Power 36, TE Pop pass.",
            coach: "",
            focus: "Touchdowns inside the 10 yard line"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Goal Line Stand & Blitz Exits",
            desc: "6-2 goal line front, zero pass coverage, A-gap blitz.",
            coach: "",
            focus: "Penetration and force fumble"
          }
        ]
      },
      {
        time: 15,
        category: "⚔️ Practice / Scrimmage",
        format: "static",
        stations: [
          {
            name: "Live Redzone 4-Play Series",
            desc: "Offense vs Defense 1st & goal from the 5-yard line.",
            coach: "",
            focus: "Game speed competitive finish"
          }
        ]
      }
    ]
  },
  {
    id: "p_w5_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 5",
    dayFolder: "Tuesday 9/29",
    date: "2026-09-29",
    title: "Week 5 - John Jay 5-3 Defense & Trap Blocking",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Dynamic Warm-Up & Pursuit Angles",
            desc: "Lateral shuffles and angled sprint pursuit.",
            coach: "",
            focus: "Speed and body control"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "25 Trap & Inside Zone vs 5-3 Front",
            desc: "Trap nose guard, seal middle linebacker with center.",
            coach: "",
            focus: "Timing and quick burst through hole"
          },
          {
            name: "OL Zone Combination Blocks",
            desc: "Guard & Tackle double-team down lineman to backside LB.",
            coach: "",
            focus: "Maintain hip-to-hip contact"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "DL Nose & Tackle Sheds vs Double Teams",
            desc: "Split double team, fight pressure with pressure.",
            coach: "",
            focus: "Hold the line of scrimmage"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Kick Return Wedge & Return Left/Right",
            desc: "Front line drop, form 3-man wedge, RB burst.",
            coach: "",
            focus: "Set up return wall cleanly"
          }
        ]
      }
    ]
  },
  {
    id: "p_w5_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 5",
    dayFolder: "Thursday 10/01",
    date: "2026-10-01",
    title: "Week 5 - Goal Line Stand & Pass Rush",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Chalk Talk & John Jay Scouting Review",
            desc: "Defensive signals, cadence calls, wristband check.",
            coach: "",
            focus: "Mental preparation"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "11-on-Air Offensive Script Installation",
            desc: "Run first 15 offensive plays with game day wristbands.",
            coach: "",
            focus: "Zero alignment errors"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Pass Rush & Secondary Interception Drill",
            desc: "DE speed rush, DB high-point catch on football.",
            coach: "",
            focus: "Create turnovers"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Field Goal & Extra Point Live Reps",
            desc: "10 live field goal reps from left/right hash.",
            coach: "",
            focus: "Snap-hold-kick rhythm in under 1.4 seconds"
          }
        ]
      }
    ]
  },
  {
    id: "p_w6_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 6",
    dayFolder: "Tuesday 10/06",
    date: "2026-10-06",
    title: "Week 6 - Lakeland Blitz Pickup & Screen Pass",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Warm-Up & Agility Shuttle",
            desc: "Dynamic warmup, ladder agility, fast footwork.",
            coach: "",
            focus: "Speed and pad level"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "RB Screen Pass & Quick Slants",
            desc: "Let defensive line rush, dump pass behind line, OL lead wall.",
            coach: "",
            focus: "Patience and timing on screen"
          },
          {
            name: "Blitz Pickup & Pass Protection",
            desc: "FB and RB identify blitzing linebackers and step up in A/B gap.",
            coach: "",
            focus: "Eyes on linebacker, maintain pocket"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Corner Blitz & Fire Zone Coverage",
            desc: "CB off the edge, safety rotates over top, DL slant away.",
            coach: "",
            focus: "Disguise pre-snap, explode on snap"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Punt Coverage & Fair Catch Enforcement",
            desc: "Gunners sprint to returner, call fair catch signal.",
            coach: "",
            focus: "Down the ball inside the 10 yard line"
          }
        ]
      }
    ]
  },
  {
    id: "p_w6_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 6",
    dayFolder: "Thursday 10/08",
    date: "2026-10-08",
    title: "Week 6 - Senior Night Scrimmage & 2-Minute",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Senior Night Preparation & Chalk Talk",
            desc: "Review Lakeland defense, player leadership recognition.",
            coach: "",
            focus: "Focus and pride"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Redzone & Trick Play Installation",
            desc: "Halfback pass, reverse pass, hook and lateral.",
            coach: "",
            focus: "Ball security on trick plays"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Redzone Goal Line Defense & Turnover Circuit",
            desc: "Strip the football, scoop and score, goal line stands.",
            coach: "",
            focus: "Turnovers win championships"
          }
        ]
      },
      {
        time: 15,
        category: "⚔️ Practice / Scrimmage",
        format: "static",
        stations: [
          {
            name: "Controlled 11-on-11 Scrimmage",
            desc: "15 plays game tempo with game uniforms check.",
            coach: "",
            focus: "High tempo and zero penalties"
          }
        ]
      }
    ]
  },
  {
    id: "p_w7_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 7",
    dayFolder: "Tuesday 10/13",
    date: "2026-10-13",
    title: "Week 7 - Arlington Contain & Form Tackling",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Dynamic Warm-Up & Footwork",
            desc: "Speed ladder, high knees, agility bags.",
            coach: "",
            focus: "Speed and agility"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Power 36 Iso & 24 Dive Execution",
            desc: "FB lead through 6 hole, RB follow hip and accelerate.",
            coach: "",
            focus: "North-south running style"
          },
          {
            name: "OL Drive Block & Stance Alignment",
            desc: "Pound the sled, strike on rising plane, leg drive.",
            coach: "",
            focus: "Move the defensive line off the ball"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Arlington Outside Sweep Contain",
            desc: "Force everything back inside to pursuing linebackers.",
            coach: "",
            focus: "Do not let ball carrier get outside numbers"
          }
        ]
      },
      {
        time: 15,
        category: "💥 Tackling",
        format: "static",
        stations: [
          {
            name: "Open Field Form Tackling Circuit",
            desc: "Eyes on belt buckle, wrap and drive through contact.",
            coach: "",
            focus: "Head safe form tackling"
          }
        ]
      }
    ]
  },
  {
    id: "p_w7_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 7",
    dayFolder: "Thursday 10/15",
    date: "2026-10-15",
    title: "Week 7 - Season Finale Polish & Redzone Execution",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Chalk Talk & Season Finale Game Plan",
            desc: "Review Arlington tendencies, special teams assignments.",
            coach: "",
            focus: "Sharp focus"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Full Offensive Script on Air",
            desc: "20 plays on air with fast tempo and pristine execution.",
            coach: "",
            focus: "Sharp route cuts and timing"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Defensive Alignment & Scramble Drill",
            desc: "Cover receivers on QB scramble, rally to ball.",
            coach: "",
            focus: "Never give up on the play"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Special Teams Final Check",
            desc: "Kickoff, Kick Return, Punt, FG, Onside Defense.",
            coach: "",
            focus: "100% assignment execution"
          }
        ]
      }
    ]
  },
  {
    id: "p_w8_1",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 8",
    dayFolder: "Tuesday 10/20",
    date: "2026-10-20",
    title: "Playoffs Round 1 - Situational & Special Teams",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "⚡ (Warm-up, Agility and Conditioning)",
        format: "static",
        stations: [
          {
            name: "Playoff Dynamic Warm-Up & High Intensity Sprints",
            desc: "Playoff tempo, agility ladders, and lateral shuffles.",
            coach: "",
            focus: "Playoff intensity from whistle to whistle"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "rotating",
        stations: [
          {
            name: "Playoff Core Plays & 3rd Down Conversions",
            desc: "24 Dive, Sweep 28, Counter 21 on 3rd & short / 3rd & medium.",
            coach: "",
            focus: "Move the chains"
          },
          {
            name: "OL Goal Line Drive Blocks",
            desc: "6-inch power step, tight splits, push the pile.",
            coach: "",
            focus: "Score from 1 yard out"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "rotating",
        stations: [
          {
            name: "Playoff Turnover Circuit & Tackle Leverage",
            desc: "Strip ball, scoop and score, 2-man gang tackling.",
            coach: "",
            focus: "Turnovers decide playoff games"
          }
        ]
      },
      {
        time: 15,
        category: "🎯 Special Teams",
        format: "static",
        stations: [
          {
            name: "Punt & Field Goal Mastery",
            desc: "Punt execution, no blocks, reliable extra points.",
            coach: "",
            focus: "Flawless special teams execution"
          }
        ]
      }
    ]
  },
  {
    id: "p_w8_2",
    teamId: "team_10u",
    year: "2026",
    weekFolder: "Week 8",
    dayFolder: "Thursday 10/22",
    date: "2026-10-22",
    title: "Playoffs Round 1 - Full Script Dress Rehearsal",
    location: "Crane Road",
    periods: [
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Chalk Talk & Playoff Game Plan Review",
            desc: "Playoff keys to victory, mental focus, assignments.",
            coach: "",
            focus: "Execute under pressure"
          }
        ]
      },
      {
        time: 30,
        category: "🏈 Offense",
        format: "static",
        stations: [
          {
            name: "Playoff 11-on-11 Scrimmage Script",
            desc: "Offense vs Defense 20-play live dress rehearsal.",
            coach: "",
            focus: "Zero turnovers, high tempo execution"
          }
        ]
      },
      {
        time: 30,
        category: "🛡️ Defense",
        format: "static",
        stations: [
          {
            name: "Goal Line & 2-Minute Playoff Defense",
            desc: "Prevent big plays, secure redzone stop, celebrate team stops.",
            coach: "",
            focus: "Pitch a shutout"
          }
        ]
      },
      {
        time: 15,
        category: "📋 General",
        format: "static",
        stations: [
          {
            name: "Team Huddle & Championship Focus",
            desc: "Team cheer, final wristband inspection, game day reminder.",
            coach: "",
            focus: "Mahopac Pride & Brotherhood"
          }
        ]
      }
    ]
  }
];



