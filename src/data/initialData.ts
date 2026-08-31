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
    id: 'team_9u',
    name: '9U Youth Tackle',
    ageGroup: '9U',
    season: '2026 Season',
    color: 'sky',
    headCoachName: 'Head Coach',
    notes: 'Official 9U youth tackle football division',
  },
  {
    id: 'team_10u',
    name: '10U Youth Tackle',
    ageGroup: '10U',
    season: '2026 Season',
    color: 'indigo',
    headCoachName: 'Head Coach',
    notes: 'Official 10U tackle football division',
  },
  {
    id: 'team_12u',
    name: '12U Senior Tackle',
    ageGroup: '12U',
    season: '2026 Season',
    color: 'amber',
    headCoachName: 'Head Coach',
    notes: 'Senior youth tackle division',
  },
  {
    id: 'team_8u',
    name: '8U Rookie / Flag',
    ageGroup: '8U',
    season: '2026 Season',
    color: 'emerald',
    headCoachName: 'Head Coach',
    notes: 'Developmental rookie program',
  },
  {
    id: 'team_6u',
    name: '6U Flag Football',
    ageGroup: '6U',
    season: '2026 Season',
    color: 'purple',
    headCoachName: 'Head Coach',
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
          coach: "Head Coach",
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
          coach: "Conditioning Coach",
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
          coach: "Offensive Coach",
          focus: "Ball security & timing"
        },
        {
          name: "OL Drive & Reach Blocking",
          desc: "Pad leverage, gap steps, punch technique",
          coach: "Line Coach",
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
          coach: "Defensive Line Coach",
          focus: "Attack blocker, maintain gap"
        },
        {
          name: "LB / DB Zone Drops & Tackling",
          desc: "Cover-2 / Cover-3 pass drops & pursuit alleys",
          coach: "Defensive Backs Coach",
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
          coach: "Head Coach",
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
          coach: "Head Coach",
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
          coach: "Conditioning Coach",
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
          coach: "Offensive Coach",
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
          coach: "Defensive Coach",
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
  "Head Coach",
  "Offensive Coordinator",
  "Defensive Coordinator",
  "Line Coach",
  "Special Teams Coach"
];

export const DEFAULT_SAVED_COACHES_BY_TEAM: Record<string, string[]> = {
  team_10u: [
    "Head Coach",
    "Offensive Coordinator",
    "Defensive Coordinator",
    "Line Coach",
    "Special Teams Coach",
  ],
  team_12u: [
    "Head Coach",
    "Offensive Coordinator",
    "Defensive Coordinator",
    "Line Coach",
    "Special Teams Coach",
  ],
  team_8u: [
    "Head Coach",
    "Offensive Coordinator",
    "Defensive Coordinator",
    "Skill Coach",
  ],
};

export const DEFAULT_TEAM_COACHES: StaffCoach[] = [
  { email: "dannym1010@gmail.com", role: "Master Super Admin", status: "Active", assignedTeamIds: ["all"] },
  { email: "coach.johnson@example.com", role: "Head Coach (Admin)", status: "Active", assignedTeamIds: ["team_10u"] },
  { email: "coach.davis@example.com", role: "Assistant Coach", status: "Active", assignedTeamIds: ["team_10u"] },
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
    location: "Crane Road",
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
    location: "Crane Road",
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
    location: "Mahopac High School",
    locationType: "home",
    opponent: "Carmel Rams 10U",
    uniform: "Gold Practice Jerseys & White Pants",
    arrivalMinutesBefore: 45,
    focusOrNotes: "10 offensive plays each, rotating first & second string backfield groups.",
    createdAt: 1724800000000,
    lastEdited: 1724800000000,
  },
  {
    id: "evt_w1_p0",
    type: "practice",
    title: "Week 1 Prep - Monday Installation & Fundamentals",
    week: "1",
    date: "2026-08-31",
    startTime: "17:30",
    endTime: "19:00",
    location: "Crane Road",
    locationType: "home",
    arrivalMinutesBefore: 15,
    focusOrNotes: "Full Pads. Monday game-week install: Carmel defensive front keys, punt coverage lanes, 11-person offense wristband test.",
    linkedPracticePlanId: "p_pre_monday_831",
    createdAt: 1724900000000,
    lastEdited: 1724900000000,
  },
  {
    id: "evt_w1_p1",
    type: "practice",
    title: "Week 1 Prep - Inside Run & Carmel Schemes",
    week: "1",
    date: "2026-09-01",
    startTime: "17:30",
    endTime: "19:00",
    location: "Crane Road",
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
    location: "Crane Road",
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
    location: "Crane Road",
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
    location: "Crane Road",
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
    location: "Mahopac High School",
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
    location: "Crane Road",
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
    location: "Crane Road",
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
    location: "Mahopac High School",
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
    location: "Mahopac High School",
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

export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  preseasonWeeksCount: 4,
  preseasonWeekKeys: ['0', 'pre-1', 'pre-2', 'pre-3', 'pre-4'],
  regularSeasonWeeksCount: 8,
  customWeekLabels: {
    '0': 'Pre-Season • Wk 1 (Conditioning)',
    'pre-1': 'Pre-Season • Wk 1 (Conditioning)',
    'pre-2': 'Pre-Season • Wk 2 (Conditioning & Shells)',
    'pre-3': 'Pre-Season • Wk 3 (Pads & Fundamentals)',
    'pre-4': 'Pre-Season • Wk 4 (Pads & Scrimmage)',
    '1': 'Regular Season • Week 1',
    '2': 'Regular Season • Week 2',
    '3': 'Regular Season • Week 3',
    '4': 'Regular Season • Week 4',
    '5': 'Regular Season • Week 5',
    '6': 'Regular Season • Week 6',
    '7': 'Regular Season • Week 7',
    '8': 'Regular Season • Week 8',
    'playoffs': 'Post-Season • Playoffs',
    'championship': 'Championship / Bowl Game',
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
            coach: "Head Coach",
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
            coach: "Offensive Coach",
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
            coach: "Head Coach",
            focus: "Zero fumbles, secure top elbow pocket"
          },
          {
            name: "OL Stance, Get-Off & 6-Inch Power Step",
            desc: "3-point stance alignment, first 6-inch drive step into sled.",
            coach: "Line Coach",
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
            coach: "Defensive Coach",
            focus: "Eyes on ball, explosive hips"
          },
          {
            name: "LB / DB Stance & Lateral Shuffle",
            desc: "Athletic breakdown stance, downhill plant, mirror ball movement.",
            coach: "Special Teams Coach",
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
            coach: "Defensive Coach",
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
            coach: "Head Coach",
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
            coach: "Head Coach",
            focus: "Hitting the designated hole with speed"
          },
          {
            name: "Pass Protection & Footwork",
            desc: "Kick slide, punch timing, post-foot plant.",
            coach: "Line Coach",
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
            coach: "Defensive Coach",
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
            coach: "Head Coach",
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
            coach: "Head Coach",
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
            coach: "Defensive Coach",
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
            coach: "Head Coach",
            focus: "Rapid huddle break and clean handoff mesh"
          },
          {
            name: "Offensive Line Drive & Reach Blocks",
            desc: "Steps for gap control and seal blocks against Carmel 4-man front.",
            coach: "Line Coach",
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
            coach: "Defensive Coach",
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
            coach: "Special Teams Coach",
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
            coach: "Offensive Coach",
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
            coach: "Head Coach",
            focus: "Edge speed"
          },
          {
            name: "WR Stalk Blocking & Routes",
            desc: "Mirror DB, mirror hips, drive block on whistle.",
            coach: "Special Teams Coach",
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
            coach: "Defensive Coach",
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
            coach: "Special Teams Coach",
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
            coach: "Head Coach",
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
            coach: "Head Coach",
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
            coach: "Defensive Coach",
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
            coach: "All Coaches",
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
            coach: "Head Coach",
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
            coach: "Head Coach",
            focus: "Sell the fake run"
          },
          {
            name: "OL Trap Block Technique",
            desc: "Backside guard pull, trap 3-tech defensive tackle.",
            coach: "Line Coach",
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
            coach: "Defensive Coach",
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
            coach: "Special Teams Coach",
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
            coach: "Offensive Coach",
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
            coach: "Head Coach",
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
            coach: "Defensive Coach",
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
            coach: "Special Teams Coach",
            focus: "Accuracy and snap consistency"
          }
        ]
      }
    ]
  }
];



