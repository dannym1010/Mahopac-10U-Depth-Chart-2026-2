import { WhiteboardDrill } from '../components/whiteboard/whiteboardDrillData';
import { WhiteboardToken, WhiteboardArrow, WhiteboardZoneBubble, WhiteboardTextElement, PlayResponsibility } from '../types';

export const HUDL_DEFENSIVE_BASE_NOTES: string[] = [
  '-Flow = direction of the ball',
  '-We are a Pursuing Gap responsible defense',
  '-something goes away something is coming back.',
  '11 guys on the tackle every play',
];

export const HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS: WhiteboardTextElement[] = [
  {
    id: 'txt-flow-notes',
    text: '-Flow = direction of the ball\n-We are a Pursuing Gap responsible defense\n-something goes away something is coming back.\n11 guys on the tackle every play',
    x: 35,
    y: 350,
    fontSize: 10.5,
    color: '#1e293b',
    fontWeight: '700',
    align: 'left',
  },
];

export const BASE_44_RESPONSIBILITIES: PlayResponsibility[] = [
  {
    position: 'FS',
    alignment: '10-12 Yards Back',
    runResponsibility: 'Inside-Out (Roof/Cleaner)',
    passResponsibility: 'Deep middle 1/3',
  },
  {
    position: 'S',
    alignment: '2X2 Yards Back',
    runResponsibility:
      'Setting the Hard Edge: The OLB plays outside-in, setting a firm edge so the ball carrier cannot turn the corner.\n\nClosing the Trap: Once the ball carrier is squeezed between the ILB\'s inside-out pursuit and the OLB\'s outside force, the ball carrier is effectively trapped in a vice.\n\nMaking the Tackle: Because the ILB takes away all interior lanes and absorbs/spills the primary pulling guards or fullbacks, the OLB gets clean, unblocked angles to collapse downhill and finish the play.',
    passResponsibility:
      'Curl-to-Flat (out to the numbers/sideline, 10–12 yards deep)\n\nOn pass read, drop to 10–12 yards at a 45-degree angle toward the sideline\n\nWall the Seam: If the #2 receiver releases vertical, open inside, re-reroute/collision him, and don\'t let him get a free line up the seam.\n\nDrive the Flat: Only break downhill on a flat route or swing pass by the RB once the ball is thrown or the QB moves his non-throwing hand off the ball\n\nThe "Reroute" Mandate: In both Cover 3 and Cover 1, LBs must make physical contact with any receiver crossing their drop zone. Never let a Tight End or Slot receiver run a route unimpeded through the linebackers',
  },
  {
    position: 'M',
    alignment: '4-5 Yards Back',
    runResponsibility:
      'Maintain the Inside Hip: The ILB pursues the ball carrier from the inside out, never over-scraping or over-running the play.\n\nDeny the Cutback: By holding inside leverage, the ILB eliminates the A and B gap cutback lanes.\n\nSpill or Funnel: If a blocker meets the ILB in the alley, the ILB attacks with their inside shoulder to spill the play wide toward the sideline—right into the waiting OLB.',
    passResponsibility:
      'Hook-to-Curl (hash marks to the mid-line, 8–10 yards deep)\n\nKey Read: Triangle read through the Guard/Center to the RB/QB eyes\n\nOpen & Cross-Face: Drop to the hook zone (around 8–10 yards deep on the hash).\n\nEyes on QB / Feel #3: Eyes are on the QB\'s shoulders, but feel any crossers or shallow routes coming through the middle (digs, slants, shallow drags).\n\nRobot / Match Crossers: Do not drop into dead grass. If a receiver crosses your zone, carry him across until you pass him off to the opposite ILB',
  },
  {
    position: 'W',
    alignment: '4-5 Yards Back',
    runResponsibility:
      'Maintain the Inside Hip: The ILB pursues the ball carrier from the inside out, never over-scraping or over-running the play.\n\nDeny the Cutback: By holding inside leverage, the ILB eliminates the A and B gap cutback lanes.\n\nSpill or Funnel: If a blocker meets the ILB in the alley, the ILB attacks with their inside shoulder to spill the play wide toward the sideline—right into the waiting OLB.',
    passResponsibility:
      'Primary Zone: Hook-to-Curl\n\nOpen & Cross-Face: Drop to the hook zone (around 8–10 yards deep on the hash).\n\nEyes on QB / Feel #3: Eyes are on the QB\'s shoulders, but feel any crossers or shallow routes coming through the middle (digs, slants, shallow drags).\n\nRobot / Match Crossers: Do not drop into dead grass. If a receiver crosses your zone, carry him across until you pass him off to the opposite ILB',
  },
  {
    position: 'R',
    alignment: '2X2 Yards Back',
    runResponsibility:
      'Setting the Hard Edge: The OLB plays outside-in, setting a firm edge so the ball carrier cannot turn the corner.\n\nClosing the Trap: Once the ball carrier is squeezed between the ILB\'s inside-out pursuit and the OLB\'s outside force, the ball carrier is effectively trapped in a vice.\n\nMaking the Tackle: Because the ILB takes away all interior lanes and absorbs/spills the primary pulling guards or fullbacks, the OLB gets clean, unblocked angles to collapse downhill and finish the play.',
    passResponsibility:
      'Curl-to-Flat (out to the numbers/sideline, 10–12 yards deep)\n\nOn pass read, drop to 10–12 yards at a 45-degree angle toward the sideline\n\nWall the Seam: If the #2 receiver releases vertical, open inside, re-reroute/collision him, and don\'t let him get a free line up the seam.\n\nDrive the Flat: Only break downhill on a flat route or swing pass by the RB once the ball is thrown or the QB moves his non-throwing hand off the ball\n\nThe "Reroute" Mandate: In both Cover 3 and Cover 1, LBs must make physical contact with any receiver crossing their drop zone. Never let a Tight End or Slot receiver run a route unimpeded through the linebackers',
  },
  {
    position: 'T3',
    alignment: 'Outside shoulder of Guard',
    runResponsibility:
      'RRR RIP READ REACT\nthese guys are here to cause problems on the line, get into the backfield and love to tackle from behind',
    passResponsibility: 'Rush QB / Collapse interior pocket',
  },
  {
    position: 'T1',
    alignment: 'Outside Shoulder of Center (The Shade)',
    runResponsibility:
      'RRR RIP READ REACT\nthese guys are here to cause problems on the line, get into the backfield and love to tackle from behind',
    passResponsibility: 'Rush QB / Collapse interior pocket',
  },
  {
    position: 'E9',
    alignment: 'Outside shoulder of TE',
    runResponsibility:
      'RRR plays through the outside shoulder outside hand free he contains the box but plays downhill',
    passResponsibility: 'Edge contain / Pass rush',
  },
  {
    position: 'E5',
    alignment: 'Outside shoulder of T',
    runResponsibility:
      'RRR plays through the outside shoulder outside hand free he contains the box but plays downhill',
    passResponsibility: 'Edge contain / Pass rush',
  },
  {
    position: 'C',
    alignment: '2-3 Yards Out, 6 Yards Back',
    runResponsibility: 'Secondary outside Force',
    passResponsibility: 'Deep 1/3',
  },
  {
    position: 'C',
    alignment: '2-3 Yards Out, 6 Yards Back',
    runResponsibility: 'Secondary outside Force',
    passResponsibility: 'Deep 1/3',
  },
];

export const HUDL_10U_DEFENSE_INSTALL_PLAYS: WhiteboardDrill[] = [
  {
    id: 'hudl-44-stack-liz-vs-21l',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK LIZ',
    subtitle: 'vs 21 L',
    objective:
      'Base 4-4 Stack defense against 21 Personnel Pro-I Left. Sound containment on edges, A/B gap interior spills, fast flow linebackers, and 1/3 boundary zone integrity.',
    setup: 'Offense in 21 Personnel Pro-I Left. Line of Scrimmage at 20-yard line (y: 200). 11 guys pursuing gap responsibility.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: '21 L',
    cues: [
      '"Flow = direction of the ball!"',
      '"We are a Pursuing Gap responsible defense!"',
      '"Something goes away, something is coming back!"',
      '"11 GUYS ON THE TACKLE EVERY PLAY!"',
    ],
    faults: [
      'Edge rushers losing outside contain and letting the sweep turn upfield.',
      'Linebackers jumping out of their assigned gap on counter action.',
      'Safeties biting on play-action before confirming run commit.',
    ],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Base Alignment & Assignment',
        description: 'Front 4 aligned in 9, 3, 1, 5 techniques. Stack linebackers at 4-5 yards. Free safety 10-12 yards deep.',
        tokens: [
          // Offense (21 L): Center (square), LG, RG, LT, RT, TE left (Y), WR left (Z), WR right (X), QB, FB, TB
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-fb', type: 'O', label: '', x: 350, y: 115, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 70, color: '#0f172a' },

          // Defense: DL (E9, T3, T1, E5)
          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          // Linebackers: S, M, W, R
          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 310, y: 275, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 365, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 445, y: 255, color: '#0f172a' },

          // Secondary: Corners and Free Safety
          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-rip-vs-21r',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK RIP',
    subtitle: 'vs 21 R',
    objective: '4-4 Stack aligned to strength Right (TE to right side). E5 weak, T1 shade, T3 strong B, E9 strong edge.',
    setup: 'Offense in 21 Personnel Pro-I Right (TE right side). Call RIP. Defense shifts alignment accordingly.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: '21 R',
    cues: ['"Call Rip! Set strength Right!"', '"Stack linebackers flow downhill inside-out!"'],
    faults: ['Weak side rover biting too deep inside and abandoning contain.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Base Alignment',
        description: 'Strength Right (Rip). DL aligned E5 (left weak), T1, T3, E9 (right strong).',
        tokens: [
          // Offense (21 R): Y right, X left, Z right
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: 'Y', x: 440, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: 'X', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: 'Z', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: 'Q', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-fb', type: 'O', label: '2', x: 350, y: 115, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '3', x: 350, y: 70, color: '#0f172a' },

          // Defense: DL (E5, T1, T3, E9)
          { id: 'def-e5', type: 'letter', label: 'E5', x: 275, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 335, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 390, y: 220, color: '#0f172a' },
          { id: 'def-e9', type: 'letter', label: 'E9', x: 455, y: 220, color: '#0f172a' },

          // Linebackers: R (weak), W, M, S (strong)
          { id: 'def-r', type: 'letter', label: 'R', x: 255, y: 255, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 335, y: 275, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 390, y: 275, color: '#0f172a' },
          { id: 'def-s', type: 'letter', label: 'S', x: 475, y: 255, color: '#0f172a' },

          // Secondary
          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-rip-vs-22twins-r',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK RIP',
    subtitle: 'vs 22 TWINS R',
    objective: '4-4 Stack defense against 22 Twins Right personnel. Strong side overhang and safety adjustment.',
    setup: 'Offense shows 22 Twins Right. Defense checks Rip, apexes Sam linebacker over the twin receivers.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: '22 Twins R',
    cues: ['"Sam apex the #2 receiver!"', '"Corner maintain outside leverage!"'],
    faults: ['Failing to re-route the slot receiver on vertical release.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Alignment vs 22 Twins R',
        description: 'Twins to the right. Sam apexed between tackle and slot.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: 'Y', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-slot-z', type: 'O', label: 'Z', x: 500, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: 'X', x: 580, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '1', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-fb', type: 'O', label: '2', x: 280, y: 165, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '3', x: 350, y: 100, color: '#0f172a' },

          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 310, y: 275, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 365, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 475, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 580, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-rip-vs-11-trips-laser',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK RIP',
    subtitle: 'vs 11 TRICK TRIPS R LASER',
    objective: 'Coverage check against 3x1 Trips Right. Laser call tags the boundary overhang to bracket the #3 receiver.',
    setup: 'Offense in 11 Trips Right (Laser). Rover and Safety bump over to outnumber the 3-receiver surface.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: '11 Trips R',
    cues: ['"Laser! Laser! Trips Right!"', '"Free safety shade hash to Trips side!"'],
    faults: ['Letting the #3 receiver cross the formation un-leveraged.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Trips Alignment & Bracket',
        description: 'Trips formation to the right. Rover widens over #3, Safety shades right hash.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te-y', type: 'O', label: 'Y', x: 230, y: 160, color: '#0f172a' },
          { id: 'off-slot-z', type: 'O', label: 'Z', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: 'X', x: 580, y: 195, color: '#0f172a' },
          { id: 'off-rb-2', type: 'O', label: '2', x: 175, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '1', x: 350, y: 130, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '3', x: 350, y: 80, color: '#0f172a' },

          { id: 'def-e5', type: 'letter', label: 'E5', x: 275, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 335, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 390, y: 220, color: '#0f172a' },
          { id: 'def-e9', type: 'letter', label: 'E9', x: 455, y: 220, color: '#0f172a' },

          { id: 'def-w', type: 'letter', label: 'W', x: 265, y: 275, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 375, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 190, y: 255, color: '#0f172a' },
          { id: 'def-s', type: 'letter', label: 'S', x: 460, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 80, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 580, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-blow-sting-liz',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK BLOW STING LIZ',
    subtitle: 'Blitz & Stunt • Man Coverage',
    objective:
      'Edge pressure blitz. Sam loops outside to set the hard contain, E9 crashes inside A/B gap ("YOU / ME" call). Mike & Will plug gaps downhill.',
    setup: 'Call Blow Sting Liz. Front executes twist stunt on strong side. Secondary plays lock-down Man-to-Man.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: 'Blitz Package',
    cues: [
      '"YOU / ME Call: S calls ME (has outside contain) or YOU (DE has contain)!"',
      '"Corners lock up Man-to-Man on boundary!"',
      '"Safety take TE Man-to-Man!"',
    ],
    faults: ['Both E9 and S crashing the same gap and giving up outside contain.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: [
      { position: 'FS', alignment: '10-12 Yards Back', runResponsibility: 'TE Man to Man', passResponsibility: 'TE Man to Man' },
      {
        position: 'S',
        alignment: '2X2 Yards Back',
        runResponsibility: 'Give call to DE: ME - OLB has outside contain; YOU - DE has outside contain',
        passResponsibility: 'Outside contain rush / Man match',
      },
      { position: 'M', alignment: '4-5 Yards Back', runResponsibility: 'Backs Man to Man', passResponsibility: 'Backs Man to Man' },
      { position: 'W', alignment: '4-5 Yards Back', runResponsibility: 'Backs Man to Man', passResponsibility: 'Backs Man to Man' },
      { position: 'R', alignment: '2X2 Yards Back', runResponsibility: 'C-Gap Pressure / Backside contain', passResponsibility: 'Backs Man to Man' },
      { position: 'T3', alignment: 'Outside shoulder of Guard', runResponsibility: 'A-Gap interior punch', passResponsibility: 'Rush QB' },
      { position: 'T1', alignment: 'Outside shoulder of Center', runResponsibility: 'A-Gap nose guard shade', passResponsibility: 'Rush QB' },
      { position: 'E9', alignment: 'Outside shoulder of TE', runResponsibility: 'Execute stunt with Sam (Crash inside or contain)', passResponsibility: 'Rush QB' },
      { position: 'E5', alignment: 'Outside shoulder of T', runResponsibility: 'Edge contain', passResponsibility: 'Rush QB' },
      { position: 'C', alignment: '2-3 Yards Out, 6 Yards Back', runResponsibility: 'Man to Man', passResponsibility: 'Man to Man' },
      { position: 'C', alignment: '2-3 Yards Out, 6 Yards Back', runResponsibility: 'Man to Man', passResponsibility: 'Man to Man' },
    ],
    phases: [
      {
        name: 'Blow Sting Blitz Paths',
        description: 'Sam loops outside, E9 crashes inside, Mike & Will plug downhill.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 90, color: '#0f172a' },

          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 310, y: 275, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 365, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 445, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [
          // E9 loop inside
          { id: 'arr-e9', type: 'curved', startX: 245, startY: 220, endX: 280, endY: 180, controlX: 270, controlY: 195, color: '#0f172a' },
          // S loop outside
          { id: 'arr-s', type: 'curved', startX: 225, startY: 255, endX: 210, endY: 180, controlX: 200, controlY: 215, color: '#0f172a' },
          // T3 punch
          { id: 'arr-t3', type: 'straight', startX: 310, startY: 220, endX: 310, endY: 185, color: '#0f172a' },
          // T1 punch
          { id: 'arr-t1', type: 'straight', startX: 365, startY: 220, endX: 365, endY: 185, color: '#0f172a' },
          // E5 punch
          { id: 'arr-e5', type: 'curved', startX: 425, startY: 220, endX: 415, endY: 180, controlX: 430, controlY: 195, color: '#0f172a' },
          // Rover rush
          { id: 'arr-r', type: 'curved', startX: 445, startY: 255, endX: 460, endY: 185, controlX: 460, controlY: 220, color: '#0f172a' },
        ],
        zones: [],
        textElements: [
          { id: 'txt-you', text: 'You', x: 190, y: 255, fontSize: 11, color: '#0f172a', fontWeight: '800' },
          { id: 'txt-me', text: 'Me', x: 470, y: 265, fontSize: 11, color: '#0f172a', fontWeight: '800' },
          ...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS,
        ],
      },
    ],
  },
  {
    id: 'hudl-44-stack-double-dog-0-liz',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STACK DOUBLE DOG 0 LIZ',
    subtitle: 'A-Gap ILB Blitz • Cover 0',
    objective:
      'Aggressive interior double blitz: Both Mike and Will blitz the A-gaps. Down linemen hold C & B gaps. Corners and Safeties in Cover 0 lock-down man coverage.',
    setup: 'Double Dog call: Mike and Will creep to 3 yards and fire downhill on the snap.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: 'Double Dog 0',
    cues: ['"Double Dog: Mike and Will blow through the A-Gaps!"', '"Corners inside leverage man on man!"'],
    faults: ['Linebacker delaying at the line rather than exploding through the snap.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Double Dog Blitz Paths',
        description: 'Both inside linebackers fire through the A-gaps. Man to Man across the board.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 90, color: '#0f172a' },

          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 330, y: 270, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 370, y: 270, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 445, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [
          // Mike A-gap blitz
          { id: 'arr-m-blitz', type: 'straight', startX: 330, startY: 270, endX: 335, endY: 180, color: '#0f172a' },
          // Will A-gap blitz
          { id: 'arr-w-blitz', type: 'straight', startX: 370, startY: 270, endX: 365, endY: 180, color: '#0f172a' },
          // E9 contain
          { id: 'arr-e9', type: 'curved', startX: 245, startY: 220, endX: 225, endY: 180, controlX: 230, controlY: 195, color: '#0f172a' },
          // E5 contain
          { id: 'arr-e5', type: 'curved', startX: 425, startY: 220, endX: 435, endY: 180, controlX: 435, controlY: 195, color: '#0f172a' },
          // T3 punch B gap
          { id: 'arr-t3', type: 'straight', startX: 310, startY: 220, endX: 305, endY: 180, color: '#0f172a' },
          // T1 punch B gap
          { id: 'arr-t1', type: 'straight', startX: 365, startY: 220, endX: 395, endY: 180, color: '#0f172a' },
        ],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-stunts-cross-liz',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STUNTS CROSS LIZ',
    subtitle: 'Interior DL Twist / Cross Stunt',
    objective:
      'Interior stunt to disrupt pulling guards and center reach blocks. T1 slants across center face, T3 loops behind into the opposite A-gap.',
    setup: 'Front executes "Cross Liz" call. Tackles cross gap responsibilities on the snap.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: 'Cross Stunt',
    cues: ['"T1 penetrate first across the nose!"', '"T3 scrape tightly behind T1 into the opposite A-gap!"'],
    faults: ['Looper taking too wide an angle and getting washed by the guard.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Cross Stunt Execution',
        description: 'T1 crosses face of center; T3 wraps behind into opposite A gap.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 90, color: '#0f172a' },

          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 310, y: 275, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 365, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 445, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [
          // T1 cross left
          { id: 'arr-t1-cross', type: 'straight', startX: 365, startY: 220, endX: 330, endY: 180, color: '#0f172a' },
          // T3 cross right
          { id: 'arr-t3-cross', type: 'curved', startX: 310, startY: 220, endX: 375, endY: 180, controlX: 340, controlY: 225, color: '#0f172a' },
          // E9 contain
          { id: 'arr-e9', type: 'straight', startX: 245, startY: 220, endX: 240, endY: 180, color: '#0f172a' },
          // E5 contain
          { id: 'arr-e5', type: 'straight', startX: 425, startY: 220, endX: 430, endY: 180, color: '#0f172a' },
          // Mike downhill
          { id: 'arr-m-down', type: 'straight', startX: 310, startY: 275, endX: 305, endY: 235, color: '#0f172a' },
          // Will downhill
          { id: 'arr-w-down', type: 'straight', startX: 365, startY: 275, endX: 370, endY: 235, color: '#0f172a' },
        ],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-stunts-fan-liz',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STUNTS FAN LIZ',
    subtitle: 'Tackles Fan Out • Linebackers Plug A-Gaps',
    objective:
      'Fan stunt: Both DTs fire outward into the B-gaps, occupying offensive guards and tackles. Both inside linebackers fire straight downhill into the vacated A-gaps.',
    setup: 'Call Fan Liz. DTs rip outside on ball snap.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: 'Fan Stunt',
    cues: ['"DTs fan out violently to B-gaps!"', '"ILBs strike downhill through A-gaps!"'],
    faults: ['DTs playing too high and getting washed out of their assigned lanes.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Fan Stunt Execution',
        description: 'T3 and T1 slant outward into B-gaps; Mike and Will punch A-gaps.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 90, color: '#0f172a' },

          { id: 'def-e9', type: 'letter', label: 'E9', x: 245, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 310, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 365, y: 220, color: '#0f172a' },
          { id: 'def-e5', type: 'letter', label: 'E5', x: 425, y: 220, color: '#0f172a' },

          { id: 'def-s', type: 'letter', label: 'S', x: 225, y: 255, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 310, y: 275, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 365, y: 275, color: '#0f172a' },
          { id: 'def-r', type: 'letter', label: 'R', x: 445, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [
          // T3 fan out to B gap
          { id: 'arr-t3-fan', type: 'straight', startX: 310, startY: 220, endX: 295, endY: 180, color: '#0f172a' },
          // T1 fan out to B gap
          { id: 'arr-t1-fan', type: 'straight', startX: 365, startY: 220, endX: 385, endY: 180, color: '#0f172a' },
          // Mike plug A gap
          { id: 'arr-m-fan', type: 'straight', startX: 310, startY: 275, endX: 340, endY: 215, color: '#0f172a' },
          // Will plug A gap
          { id: 'arr-w-fan', type: 'straight', startX: 365, startY: 275, endX: 360, endY: 215, color: '#0f172a' },
          // E9 contain
          { id: 'arr-e9', type: 'straight', startX: 245, startY: 220, endX: 240, endY: 180, color: '#0f172a' },
          // E5 contain
          { id: 'arr-e5', type: 'straight', startX: 425, startY: 220, endX: 430, endY: 180, color: '#0f172a' },
        ],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-44-stack-stunts-pinch-rip',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '4-4 BASE STUNTS PINCH RIP',
    subtitle: 'Interior Collapse • Forcing Plays to Sideline',
    objective:
      'Pinch stunt to choke off interior runs: Ends and tackles collapse all A & B gaps, spilling the ball carrier into waiting Sam and Rover in the alley.',
    setup: 'Call Pinch Rip. DL penetrates down and inside.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: 'Pinch Stunt',
    cues: ['"Pinch: Crash inside gaps with low pads!"', '"Sam and Rover squeeze the alley from outside-in!"'],
    faults: ['OLB losing containment leverage when the play bounces.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: 'Pinch Stunt Execution',
        description: 'Ends and tackles pinch inside, forcing ball to outside edge.',
        tokens: [
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te', type: 'O', label: '', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 120, y: 195, color: '#0f172a' },
          { id: 'off-wr-x', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '', x: 350, y: 155, color: '#0f172a' },
          { id: 'off-tb', type: 'O', label: '', x: 350, y: 90, color: '#0f172a' },

          { id: 'def-e5', type: 'letter', label: 'E5', x: 275, y: 220, color: '#0f172a' },
          { id: 'def-t1', type: 'letter', label: 'T1', x: 335, y: 220, color: '#0f172a' },
          { id: 'def-t3', type: 'letter', label: 'T3', x: 390, y: 220, color: '#0f172a' },
          { id: 'def-e9', type: 'letter', label: 'E9', x: 455, y: 220, color: '#0f172a' },

          { id: 'def-r', type: 'letter', label: 'R', x: 255, y: 255, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 335, y: 275, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 390, y: 275, color: '#0f172a' },
          { id: 'def-s', type: 'letter', label: 'S', x: 475, y: 255, color: '#0f172a' },

          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 350, y: 355, color: '#0f172a' },
        ],
        arrows: [
          // E5 pinch inside
          { id: 'arr-e5-pinch', type: 'straight', startX: 275, startY: 220, endX: 295, endY: 185, color: '#0f172a' },
          // T1 pinch A gap
          { id: 'arr-t1-pinch', type: 'straight', startX: 335, startY: 220, endX: 345, endY: 185, color: '#0f172a' },
          // T3 pinch A gap
          { id: 'arr-t3-pinch', type: 'straight', startX: 390, startY: 220, endX: 355, endY: 185, color: '#0f172a' },
          // E9 pinch inside
          { id: 'arr-e9-pinch', type: 'straight', startX: 455, startY: 220, endX: 430, endY: 185, color: '#0f172a' },
          // Rover scrape
          { id: 'arr-r-scrape', type: 'curved', startX: 255, startY: 255, endX: 235, endY: 195, controlX: 230, controlY: 225, color: '#0f172a' },
          // Will scrape
          { id: 'arr-w-scrape', type: 'straight', startX: 335, startY: 275, endX: 320, endY: 230, color: '#0f172a' },
          // Mike scrape
          { id: 'arr-m-scrape', type: 'straight', startX: 390, startY: 275, endX: 410, endY: 230, color: '#0f172a' },
        ],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
  {
    id: 'hudl-53-overshift-liz-vs-32-stong-gun',
    category: 'SCHEME',
    categoryLabel: 'Hudl Install • 10U Defense',
    title: '5-3 OVERSHIFT LIZ',
    subtitle: 'vs 32 STONG GUN',
    objective:
      'Heavy 5-3 overshift against 32 Personnel heavy strong shotgun formation. 5 down linemen choke off gaps, 3 linebackers scrape, Rover rolled up.',
    setup: 'Offense shows 32 Strong Gun. Check Overshift Liz.',
    hudlPlaybookName: '10U Defense • Mahopac Indians',
    formationName: '32 Strong Gun',
    cues: ['"5-man wall up front!"', '"Linebackers stay on inside hips!"'],
    faults: ['Allowing weak-side bootleg without containing the QB.'],
    notes: HUDL_DEFENSIVE_BASE_NOTES,
    responsibilities: BASE_44_RESPONSIBILITIES,
    phases: [
      {
        name: '5-3 Overshift Alignment',
        description: '5 down linemen (E, T, T, E, R), 3 linebackers (S, M, W), Corners and FS deep.',
        tokens: [
          // Offense (32 Strong Gun)
          { id: 'off-c', type: 'square', label: 'C', x: 350, y: 195, color: '#0f172a', isSquare: true },
          { id: 'off-lg', type: 'O', label: '', x: 320, y: 195, color: '#0f172a' },
          { id: 'off-rg', type: 'O', label: '', x: 380, y: 195, color: '#0f172a' },
          { id: 'off-lt', type: 'O', label: '', x: 290, y: 195, color: '#0f172a' },
          { id: 'off-rt', type: 'O', label: '', x: 410, y: 195, color: '#0f172a' },
          { id: 'off-te1', type: 'O', label: 'Y', x: 260, y: 195, color: '#0f172a' },
          { id: 'off-te2', type: 'O', label: 'Y2', x: 230, y: 195, color: '#0f172a' },
          { id: 'off-wr-z', type: 'O', label: '', x: 570, y: 195, color: '#0f172a' },
          { id: 'off-qb', type: 'O', label: '1', x: 350, y: 140, color: '#0f172a' },
          { id: 'off-rb1', type: 'O', label: '4', x: 245, y: 160, color: '#0f172a' },
          { id: 'off-rb2', type: 'O', label: '2', x: 280, y: 160, color: '#0f172a' },
          { id: 'off-rb3', type: 'O', label: '3', x: 310, y: 160, color: '#0f172a' },

          // Defense: 5 down linemen (E, T, T, E, R)
          { id: 'def-e-left', type: 'letter', label: 'E', x: 215, y: 220, color: '#0f172a' },
          { id: 'def-t-left', type: 'letter', label: 'T', x: 280, y: 220, color: '#0f172a' },
          { id: 'def-t-mid', type: 'letter', label: 'T', x: 345, y: 220, color: '#0f172a' },
          { id: 'def-e-mid', type: 'letter', label: 'E', x: 395, y: 220, color: '#0f172a' },
          { id: 'def-r-edge', type: 'letter', label: 'R', x: 450, y: 220, color: '#0f172a' },

          // Linebackers: S, M, W
          { id: 'def-s', type: 'letter', label: 'S', x: 255, y: 260, color: '#0f172a' },
          { id: 'def-m', type: 'letter', label: 'M', x: 330, y: 265, color: '#0f172a' },
          { id: 'def-w', type: 'letter', label: 'W', x: 415, y: 265, color: '#0f172a' },

          // Secondary
          { id: 'def-cl', type: 'letter', label: 'C', x: 120, y: 250, color: '#0f172a' },
          { id: 'def-cr', type: 'letter', label: 'C', x: 570, y: 250, color: '#0f172a' },
          { id: 'def-fs', type: 'letter', label: 'FS', x: 290, y: 340, color: '#0f172a' },
        ],
        arrows: [],
        zones: [],
        textElements: [...HUDL_DEFENSIVE_BASE_TEXT_ELEMENTS],
      },
    ],
  },
];
