import {
  RosterPlayer,
  FormationBoard,
  DrillFolder,
  PracticePlan,
  PracticePeriod,
  PlaybookGuideTree,
  PlaybookGuideOrder,
  StaffCoach,
  ScheduleEvent,
} from '../types';

export const MASTER_ROSTER: RosterPlayer[] = [
  { num: "2", firstName: "Mohammed", lastName: "Ibrahim", primaryPosition: "RB", secondaryPosition: "CB", offensivePosition: "4 (RB)", defensivePosition: "LCB", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "4", firstName: "Vincent", lastName: "Cambigianis", primaryPosition: "WR", secondaryPosition: "CB", offensivePosition: "X (WR)", defensivePosition: "RCB", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "6", firstName: "Andrew", lastName: "Henderson", primaryPosition: "TE", secondaryPosition: "DE", offensivePosition: "Y1 (TE)", defensivePosition: "E9 (DE)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "7", firstName: "Jayden", lastName: "Silva", primaryPosition: "RB", secondaryPosition: "OLB", offensivePosition: "4 (RB)", defensivePosition: "S (OLB)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "8", firstName: "James", lastName: "Kilkenny", primaryPosition: "WR", secondaryPosition: "FS", offensivePosition: "Z (WR)", defensivePosition: "FS", conditioningHours: 10, paddedHours: 8.5, weeklyHours: { '0': 5, '1': 4.5, '2': 3 } },
  { num: "10", firstName: "Luke", lastName: "Mancini", primaryPosition: "QB", secondaryPosition: "FS", offensivePosition: "1 (QB)", defensivePosition: "FS", conditioningHours: 10, paddedHours: 10, isCaptain: true, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "11", firstName: "Dorian", lastName: "Berish", primaryPosition: "WR", secondaryPosition: "CB", offensivePosition: "W (WR)", defensivePosition: "LCB", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "12", firstName: "Richard", lastName: "Barry", primaryPosition: "WR", secondaryPosition: "SS", offensivePosition: "X (WR)", defensivePosition: "R (OLB)", conditioningHours: 10, paddedHours: 7.5, weeklyHours: { '0': 5, '1': 4.5, '2': 3 } },
  { num: "13", firstName: "Landon", lastName: "Veto", primaryPosition: "RB", secondaryPosition: "MLB", offensivePosition: "4 (RB)", defensivePosition: "M (MLB)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "15", firstName: "Henry", lastName: "Swansen", primaryPosition: "TE", secondaryPosition: "DE", offensivePosition: "Y1 (TE)", defensivePosition: "E5 (DE)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "17", firstName: "David", lastName: "Dicob", primaryPosition: "OL", secondaryPosition: "DT", offensivePosition: "RG", defensivePosition: "T3 (DT)", conditioningHours: 10, paddedHours: 6.0, weeklyHours: { '0': 5, '1': 3.5, '2': 3 } },
  { num: "19", firstName: "Paul", lastName: "Nardella", primaryPosition: "QB", secondaryPosition: "CB", offensivePosition: "1 (QB)", defensivePosition: "RCB", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "20", firstName: "Jack", lastName: "Furfaro", primaryPosition: "WR", secondaryPosition: "FS", offensivePosition: "Z (WR)", defensivePosition: "FS", conditioningHours: 10, paddedHours: 10, isCaptain: true, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "21", firstName: "Nash", lastName: "Ward", primaryPosition: "RB", secondaryPosition: "OLB", offensivePosition: "4 (RB)", defensivePosition: "W (OLB)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "22", firstName: "Jaxson", lastName: "Pestone", primaryPosition: "WR", secondaryPosition: "CB", offensivePosition: "W (WR)", defensivePosition: "LCB", conditioningHours: 8.5, paddedHours: 0, weeklyHours: { '0': 4.5, '1': 4.0, '2': 0 } },
  { num: "27", firstName: "Sean", lastName: "Lacerra", primaryPosition: "RB", secondaryPosition: "MLB", offensivePosition: "4 (RB)", defensivePosition: "M (MLB)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "33", firstName: "Michael", lastName: "Frascone", primaryPosition: "TE", secondaryPosition: "DE", offensivePosition: "Y1 (TE)", defensivePosition: "E9 (DE)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "34", firstName: "Eddie", lastName: "Flemming", primaryPosition: "FB", secondaryPosition: "DT", offensivePosition: "4 (RB)", defensivePosition: "T1 (DT)", conditioningHours: 10, paddedHours: 9.0, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "40", firstName: "Chris", lastName: "Sokol", primaryPosition: "FB", secondaryPosition: "MLB", offensivePosition: "4 (RB)", defensivePosition: "W (OLB)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "44", firstName: "Caden", lastName: "Jones", primaryPosition: "OL", secondaryPosition: "DT", offensivePosition: "RT", defensivePosition: "T3 (DT)", conditioningHours: 6.0, paddedHours: 0, weeklyHours: { '0': 3.0, '1': 3.0, '2': 0 } },
  { num: "48", firstName: "Michael", lastName: "Sweeny", primaryPosition: "C", secondaryPosition: "DT", offensivePosition: "C", defensivePosition: "T1 (DT)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "50", firstName: "Colin", lastName: "Convery", primaryPosition: "C", secondaryPosition: "DT", offensivePosition: "C", defensivePosition: "T1 (DT)", conditioningHours: 10, paddedHours: 10, isCaptain: true, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "52", firstName: "John", lastName: "Piqueras", primaryPosition: "RG", secondaryPosition: "DT", offensivePosition: "RG", defensivePosition: "T3 (DT)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "56", firstName: "Ryan", lastName: "Russell", primaryPosition: "LT", secondaryPosition: "DE", offensivePosition: "LT", defensivePosition: "E5 (DE)", conditioningHours: 10, paddedHours: 10, isCaptain: true, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } },
  { num: "66", firstName: "Luca", lastName: "Mucciacciaro", primaryPosition: "LG", secondaryPosition: "DT", offensivePosition: "LG", defensivePosition: "T1 (DT)", conditioningHours: 10, paddedHours: 8.0, weeklyHours: { '0': 5, '1': 4.5, '2': 3.5 } },
  { num: "99", firstName: "Conrad", lastName: "Crean", primaryPosition: "RT", secondaryPosition: "DT", offensivePosition: "RT", defensivePosition: "T3 (DT)", conditioningHours: 10, paddedHours: 10, weeklyHours: { '0': 5, '1': 4.5, '2': 4.5 } }
];

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
          coach: "Coach Danny",
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
          coach: "Coach Mike",
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
          coach: "Coach Danny",
          focus: "Ball security & timing"
        },
        {
          name: "OL Drive & Reach Blocking",
          desc: "Pad leverage, gap steps, punch technique",
          coach: "Coach John",
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
          coach: "Coach Dave",
          focus: "Attack blocker, maintain gap"
        },
        {
          name: "LB / DB Zone Drops & Tackling",
          desc: "Cover-2 / Cover-3 pass drops & pursuit alleys",
          coach: "Coach Mike",
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
          coach: "All Coaches",
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
          coach: "Head Coach Danny",
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
          coach: "Coach Danny",
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
          coach: "Coach Mike",
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
          coach: "Coach Danny",
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
          coach: "Coach John",
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

export const DEFAULT_SAVED_COACHES: string[] = [
  "Coach Danny",
  "Coach Mike",
  "Coach John",
  "Coach Dave",
  "Coach Tony",
  "Coach Steve"
];

export const DEFAULT_TEAM_COACHES: StaffCoach[] = [
  { email: "dannym1010@gmail.com", role: "Head Coach (Admin)", status: "Active" },
  { email: "coachmike@mahopacfootball.org", role: "Assistant Coach", status: "Active" }
];

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
    id: "evt_pre_p1",
    type: "practice",
    title: "Pre-Season Conditioning & Base Alignments",
    week: "0",
    date: "2026-08-25",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Track Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Helmets & Cleats. Conditioning, stance & starts, 11-person defensive alignments.",
    createdAt: 1724600000000,
    lastEdited: 1724600000000,
  },
  {
    id: "evt_pre_p2",
    type: "practice",
    title: "Tackling Fundamentals & Pursuit Angles",
    week: "0",
    date: "2026-08-27",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Full Pads. Hawk tackling circuit, pursuit drill, goal-line stance.",
    createdAt: 1724700000000,
    lastEdited: 1724700000000,
  },
  {
    id: "evt_pre_scr",
    type: "scrimmage",
    title: "Pre-Season Controlled Scrimmage",
    week: "0",
    date: "2026-08-29",
    startTime: "10:00",
    endTime: "12:00",
    location: "Mahopac High School - Turf Stadium",
    locationType: "home",
    opponent: "Carmel Rams 10U",
    uniform: "Gold Practice Jerseys & White Pants",
    arrivalMinutesBefore: 45,
    focusOrNotes: "10 offensive plays each, rotating first & second string backfield groups.",
    createdAt: 1724800000000,
    lastEdited: 1724800000000,
  },
  {
    id: "evt_w1_p1",
    type: "practice",
    title: "Week 1 Prep - Inside Run & Carmel Schemes",
    week: "1",
    date: "2026-09-01",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Focus on 24 Dive, 25 Trap, and DL gap penetration keys.",
    createdAt: 1725000000000,
    lastEdited: 1725000000000,
  },
  {
    id: "evt_w1_p2",
    type: "practice",
    title: "Week 1 - Walkthrough, Specials & Signals",
    week: "1",
    date: "2026-09-03",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Shells. Wristband speed test, kickoff coverage, field goal block.",
    createdAt: 1725100000000,
    lastEdited: 1725100000000,
  },
  {
    id: "evt_w1_game",
    type: "game",
    title: "Season Opener @ Carmel Rams",
    week: "1",
    date: "2026-09-05",
    startTime: "10:00",
    endTime: "12:00",
    location: "Carmel High School Athletic Stadium",
    locationType: "away",
    opponent: "Carmel Rams 10U",
    uniform: "Gold Jerseys & White Game Pants",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Arrive by 9:00 AM for dynamic warmup & team taping. Watch for #24 sweep.",
    createdAt: 1725200000000,
    lastEdited: 1725200000000,
  },
  {
    id: "evt_w2_p1",
    type: "practice",
    title: "Week 2 - Somers Wing-T Contain & Tackling",
    week: "2",
    date: "2026-09-08",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Full Pads. Contain drills against buck sweep & dive options.",
    createdAt: 1725300000000,
    lastEdited: 1725300000000,
  },
  {
    id: "evt_w2_p2",
    type: "practice",
    title: "Week 2 - Redzone Execution & 2-Pt Plays",
    week: "2",
    date: "2026-09-10",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Goal line offense, tight formations, 2-minute drill hurry up.",
    createdAt: 1725400000000,
    lastEdited: 1725400000000,
  },
  {
    id: "evt_w2_game",
    type: "game",
    title: "Week 2 Game vs Somers Tuskers",
    week: "2",
    date: "2026-09-12",
    startTime: "11:30",
    endTime: "13:30",
    location: "Mahopac High School - Turf Stadium",
    locationType: "home",
    opponent: "Somers Tuskers 10U",
    uniform: "Gold Home Jerseys & Gold Socks",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Home opener! Arrive at 10:30 AM for warmups and team stretch.",
    createdAt: 1725500000000,
    lastEdited: 1725500000000,
  },
  {
    id: "evt_w3_p1",
    type: "practice",
    title: "Week 3 - Yorktown Spread Defense & Blitzing",
    week: "3",
    date: "2026-09-15",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Secondary zone coverage, A-gap blitz pickup by running backs.",
    createdAt: 1725600000000,
    lastEdited: 1725600000000,
  },
  {
    id: "evt_w3_p2",
    type: "practice",
    title: "Week 3 - Situational 2-Minute Drill & Goal Line",
    week: "3",
    date: "2026-09-17",
    startTime: "17:30",
    endTime: "19:00",
    location: "Mahopac High School - Turf Field",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Wristband calling rhythm, clock management, victory formation.",
    createdAt: 1725700000000,
    lastEdited: 1725700000000,
  },
  {
    id: "evt_w3_game",
    type: "game",
    title: "Week 3 Game @ Yorktown Huskers",
    week: "3",
    date: "2026-09-19",
    startTime: "10:00",
    endTime: "12:00",
    location: "Yorktown High School - Charlie Murphy Field",
    locationType: "away",
    opponent: "Yorktown Huskers 10U",
    uniform: "White Away Jerseys & White Pants",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Arrive at 9:00 AM. Key matchup against physical defensive line.",
    createdAt: 1725800000000,
    lastEdited: 1725800000000,
  },
  {
    id: "evt_w4_game",
    type: "game",
    title: "Week 4 Homecoming Game vs Brewster Bears",
    week: "4",
    date: "2026-09-26",
    startTime: "13:00",
    endTime: "15:00",
    location: "Mahopac High School - Turf Stadium",
    locationType: "home",
    opponent: "Brewster Bears 10U",
    uniform: "Gold Home Jerseys & Gold Helmets",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Homecoming Weekend! Arrive at 12:00 PM for pregame team photo.",
    createdAt: 1725900000000,
    lastEdited: 1725900000000,
  },
  {
    id: "evt_w5_game",
    type: "game",
    title: "Week 5 Game @ John Jay Patriots",
    week: "5",
    date: "2026-10-03",
    startTime: "10:00",
    endTime: "12:00",
    location: "John Jay Cross River High School Turf",
    locationType: "away",
    opponent: "John Jay Patriots 10U",
    uniform: "White Away Jerseys",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Arrive at 9:00 AM sharp for team prep.",
    createdAt: 1726000000000,
    lastEdited: 1726000000000,
  },
  {
    id: "evt_w6_game",
    type: "game",
    title: "Week 6 Senior Night vs Lakeland Hornets",
    week: "6",
    date: "2026-10-10",
    startTime: "11:30",
    endTime: "13:30",
    location: "Mahopac High School - Turf Stadium",
    locationType: "home",
    opponent: "Lakeland Hornets 10U",
    uniform: "Gold Home Jerseys",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Senior Recognition at halftime.",
    createdAt: 1726100000000,
    lastEdited: 1726100000000,
  },
  {
    id: "evt_w7_game",
    type: "game",
    title: "Week 7 Regular Season Finale @ Arlington Admirals",
    week: "7",
    date: "2026-10-17",
    startTime: "10:00",
    endTime: "12:00",
    location: "Arlington High School Stadium",
    locationType: "away",
    opponent: "Arlington Admirals 10U",
    uniform: "White Away Jerseys",
    arrivalMinutesBefore: 60,
    focusOrNotes: "Playoff seeding on the line. Arrive by 9:00 AM.",
    createdAt: 1726200000000,
    lastEdited: 1726200000000,
  },
  {
    id: "evt_w8_game",
    type: "tournament",
    title: "Hudson Valley 10U Championship Playoffs Round 1",
    week: "8",
    date: "2026-10-24",
    startTime: "12:00",
    endTime: "14:00",
    location: "Hudson Valley Neutral Turf Field",
    locationType: "neutral",
    opponent: "TBD Playoff Opponent",
    uniform: "Gold Home / White Away (TBD)",
    arrivalMinutesBefore: 75,
    focusOrNotes: "Playoff Opening Round. Winner advances to Championship Bowl.",
    createdAt: 1726300000000,
    lastEdited: 1726300000000,
  }
];


