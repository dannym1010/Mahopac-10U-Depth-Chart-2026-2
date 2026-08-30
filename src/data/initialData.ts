import {
  RosterPlayer,
  FormationBoard,
  DrillFolder,
  PracticePlan,
  PracticePeriod,
  PlaybookGuideTree,
  PlaybookGuideOrder,
  StaffCoach,
} from '../types';

export const MASTER_ROSTER: RosterPlayer[] = [
  { num: "2", firstName: "Mohammed", lastName: "Ibrahim" },
  { num: "4", firstName: "Vincent", lastName: "Cambigianis" },
  { num: "6", firstName: "Andrew", lastName: "Henderson" },
  { num: "7", firstName: "Jayden", lastName: "Silva" },
  { num: "8", firstName: "James", lastName: "Kilkenny" },
  { num: "10", firstName: "Luke", lastName: "Mancini" },
  { num: "11", firstName: "Dorian", lastName: "Berish" },
  { num: "12", firstName: "Richard", lastName: "Barry" },
  { num: "13", firstName: "Landon", lastName: "Veto" },
  { num: "15", firstName: "Henry", lastName: "Swansen" },
  { num: "17", firstName: "David", lastName: "Dicob" },
  { num: "19", firstName: "Paul", lastName: "Nardella" },
  { num: "20", firstName: "Jack", lastName: "Furfaro" },
  { num: "21", firstName: "Nash", lastName: "Ward" },
  { num: "22", firstName: "Jaxson", lastName: "Pestone" },
  { num: "27", firstName: "Sean", lastName: "Lacerra" },
  { num: "33", firstName: "Michael", lastName: "Frascone" },
  { num: "34", firstName: "Eddie", lastName: "Flemming" },
  { num: "40", firstName: "Chris", lastName: "Sokol" },
  { num: "44", firstName: "Caden", lastName: "Jones" },
  { num: "48", firstName: "Michael", lastName: "Sweeny" },
  { num: "50", firstName: "Colin", lastName: "Convery" },
  { num: "52", firstName: "John", lastName: "Piqueras" },
  { num: "56", firstName: "Ryan", lastName: "Russell" },
  { num: "66", firstName: "Luca", lastName: "Mucciacciaro" },
  { num: "99", firstName: "Conrad", lastName: "Crean" }
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

