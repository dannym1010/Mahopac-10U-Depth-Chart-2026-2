import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCw, Video, Printer, PenTool, ExternalLink } from 'lucide-react';
import { WhiteboardDrill } from './whiteboardDrillData';
import { WhiteboardToken, WhiteboardArrow, WhiteboardZoneBubble } from '../../types';

export interface GenericAnimatedWhiteboardProps {
  drill: WhiteboardDrill;
  activePhaseIdx?: number;
  onPhaseChange?: (idx: number) => void;
  onOpenCustomChalkboard?: () => void;
  onPrint?: () => void;
}

export const GenericAnimatedWhiteboard: React.FC<GenericAnimatedWhiteboardProps> = ({
  drill,
  activePhaseIdx: controlledPhaseIdx,
  onPhaseChange,
  onOpenCustomChalkboard,
  onPrint,
}) => {
  const phases = useMemo(() => {
    if (drill.phases && drill.phases.length > 0) return drill.phases;
    return [
      {
        name: 'BASE SETUP',
        description: drill.objective,
        tokens: [],
        arrows: [],
        zones: [],
      },
    ];
  }, [drill.phases, drill.objective]);

  const [internalPhaseIdx, setInternalPhaseIdx] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [autoCycle, setAutoCycle] = useState<boolean>(true);
  const [isImpactActive, setIsImpactActive] = useState<boolean>(false);

  const activeIdx = controlledPhaseIdx !== undefined ? controlledPhaseIdx : internalPhaseIdx;
  const currentPhase = phases[activeIdx] || phases[0];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal phase if controlled changes
  useEffect(() => {
    if (controlledPhaseIdx !== undefined) {
      setInternalPhaseIdx(controlledPhaseIdx);
    }
  }, [controlledPhaseIdx]);

  // Phase transition and animation sequencer
  useEffect(() => {
    if (!isRunning || phases.length <= 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const isActionPhase =
      activeIdx === 1 ||
      (phases.length === 2 && activeIdx === 1) ||
      activeIdx === Math.floor(phases.length / 2);

    if (isActionPhase) {
      setIsImpactActive(true);
      const impactTimer = setTimeout(() => {
        setIsImpactActive(false);
      }, 700);
      return () => clearTimeout(impactTimer);
    } else {
      setIsImpactActive(false);
    }

    if (!autoCycle) return;

    // Step duration: 2.6s for standard phases, 3.2s for action/climax
    const stepDuration = isActionPhase ? 3200 : 2600;

    timerRef.current = setTimeout(() => {
      const nextIdx = (activeIdx + 1) % phases.length;
      if (onPhaseChange) {
        onPhaseChange(nextIdx);
      } else {
        setInternalPhaseIdx(nextIdx);
      }
    }, stepDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, autoCycle, activeIdx, phases.length, onPhaseChange]);

  const handleToggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  const handleSelectPhase = (idx: number) => {
    if (onPhaseChange) {
      onPhaseChange(idx);
    } else {
      setInternalPhaseIdx(idx);
    }
  };

  // Collect all tokens across all phases to compute high-fidelity scaled bounding box
  const allTokens = useMemo(() => {
    const list: WhiteboardToken[] = [];
    phases.forEach((p) => {
      if (p.tokens) list.push(...p.tokens);
    });
    return list;
  }, [phases]);

  // Calculate coordinates bounds & scale so all drills fill the whiteboard canvas cleanly
  const bounds = useMemo(() => {
    if (allTokens.length === 0) {
      return {
        minX: 180,
        maxX: 700,
        minY: 120,
        maxY: 460,
        centerX: 440,
        centerY: 290,
        scale: 1,
      };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    allTokens.forEach((t) => {
      if (t.x < minX) minX = t.x;
      if (t.x > maxX) maxX = t.x;
      if (t.y < minY) minY = t.y;
      if (t.y > maxY) maxY = t.y;
    });

    const w = Math.max(maxX - minX, 150);
    const h = Math.max(maxY - minY, 130);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Target width ~520, target height ~350 centered at (440, 290)
    const scaleX = 520 / w;
    const scaleY = 350 / h;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.95), 1.6);

    return { minX, maxX, minY, maxY, centerX, centerY, scale };
  }, [allTokens]);

  // Transform coordinates into the 880x670 Linebacker Triangle layout canvas
  const transformCoord = (rawX: number, rawY: number) => {
    const cx = 440;
    const cy = 290;
    const nx = cx + (rawX - bounds.centerX) * bounds.scale;
    const ny = cy + (rawY - bounds.centerY) * bounds.scale;
    return {
      x: Math.round(Math.max(90, Math.min(790, nx))),
      y: Math.round(Math.max(80, Math.min(520, ny))),
    };
  };

  // Derive the tactical formation zone & watermark name (e.g. FIT TRIANGLE, TACKLE BOX, etc.)
  const tacticalZone = useMemo(() => {
    if (allTokens.length === 0) {
      return {
        points: '440,110 180,430 700,430',
        label: 'FIT TRIANGLE',
        midX: 440,
        midY: 310,
        left: 180,
        right: 700,
        top: 110,
        bottom: 430,
      };
    }

    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;

    allTokens.forEach((t) => {
      const tc = transformCoord(t.x, t.y);
      if (tc.x < left) left = tc.x;
      if (tc.x > right) right = tc.x;
      if (tc.y < top) top = tc.y;
      if (tc.y > bottom) bottom = tc.y;
    });

    const padX = 55;
    const padY = 45;
    left = Math.max(110, left - padX);
    right = Math.min(770, right + padX);
    top = Math.max(85, top - padY);
    bottom = Math.min(515, bottom + padY);

    const midX = (left + right) / 2;
    const midY = (top + bottom) / 2;

    // Derive authentic tactical watermark label matching the Linebacker Triangle style
    let label = drill.formationName || '';
    if (!label) {
      const upperT = drill.title.toUpperCase();
      if (upperT.includes('TRIANGLE')) label = 'FIT TRIANGLE';
      else if (upperT.includes('GET-OFF') || upperT.includes('STICK')) label = 'GET-OFF & EXPLOSION CHUTE';
      else if (upperT.includes('STRIKE') || upperT.includes('LOCK') || upperT.includes('SHED')) label = 'STRIKE & SEPARATION ZONE';
      else if (upperT.includes('SPILL') || upperT.includes('CONTAIN')) label = 'SPILL & CONTAIN CORRIDOR';
      else if (upperT.includes('SHUFFLE') || upperT.includes('SCRAPE')) label = 'READ & SCRAPE ALLEY';
      else if (upperT.includes('PEDAL') || upperT.includes('PLANT')) label = 'SECONDARY WEAVE & BREAK SECTOR';
      else if (upperT.includes('TRAIL') || upperT.includes('COVER')) label = 'PASS DISRUPTION POCKET';
      else if (upperT.includes('TACKLE') || upperT.includes('PROFILE')) label = 'PROFILE TACKLE CORRIDOR';
      else if (upperT.includes('GATOR') || upperT.includes('ROLL')) label = 'TURNOVER STRIP SECTOR';
      else if (upperT.includes('BLOCK') || upperT.includes('DRIVE')) label = 'DRIVE BLOCK CHUTE';
      else if (upperT.includes('REACH') || upperT.includes('CLIMB')) label = 'ZONE REACH TRACK';
      else if (upperT.includes('SLED')) label = 'SLED EXPLOSION CORRIDOR';
      else if (upperT.includes('SCHEME') || upperT.includes('COVER 4') || upperT.includes('3-4')) label = 'FORMATION ALIGNMENT SHELL';
      else {
        switch (drill.category) {
          case 'DL':
          case 'DE':
            label = 'LINE OF SCRIMMAGE / GET-OFF ALLEY';
            break;
          case 'LB':
            label = 'TACKLE BOX / FIT TRIANGLE';
            break;
          case 'DB':
            label = 'SECONDARY COVERAGE CORRIDOR';
            break;
          case 'TACKLE':
          case 'TEAM':
            label = 'FORM FIT TACKLE ALLEY';
            break;
          case 'BLOCKING':
            label = 'OFFENSIVE LINE RUN CHUTE';
            break;
          default:
            label = 'TACTICAL REACTION ZONE';
            break;
        }
      }
    }

    return {
      left,
      right,
      top,
      bottom,
      midX,
      midY,
      label: label.toUpperCase(),
      points: `${midX},${top} ${left},${bottom} ${right},${bottom}`,
    };
  }, [allTokens, bounds, drill]);

  // Find primary focal point of action (where collision shockwave and strike callout appear)
  const focalPoint = useMemo(() => {
    if (!currentPhase.tokens || currentPhase.tokens.length === 0) {
      return { x: 440, y: 240 };
    }
    // Check if there is an engagement between an offensive player/bag and defender
    const def = currentPhase.tokens.find(
      (t) =>
        t.type === 'X' ||
        ['LB', 'DL', 'DE', 'DB', 'CB', 'FS', 'SS', 'MIKE', 'WILL', 'SAM'].includes(
          (t.label || '').toUpperCase()
        )
    );
    const target = currentPhase.tokens.find(
      (t) =>
        t.type === 'bag' ||
        t.type === 'O' ||
        ['RB', 'BC', 'OL', 'C', 'G', 'T', 'B1', 'B2', 'B3'].includes((t.label || '').toUpperCase())
    );

    if (def && target) {
      const dt = transformCoord(def.x, def.y);
      const tt = transformCoord(target.x, target.y);
      return { x: Math.round((dt.x + tt.x) / 2), y: Math.round((dt.y + tt.y) / 2) };
    }
    if (def) {
      return transformCoord(def.x, def.y);
    }
    return transformCoord(currentPhase.tokens[0].x, currentPhase.tokens[0].y);
  }, [currentPhase, bounds]);

  // Check if drill already has an explicit Coach token
  const hasExplicitCoach = useMemo(() => {
    return allTokens.some(
      (t) =>
        (t.label || '').toUpperCase().includes('COACH') ||
        (t.subLabel || '').toUpperCase().includes('COACH')
    );
  }, [allTokens]);

  // Dynamic coaching action callout badge text
  const strikeBadgeText = useMemo(() => {
    const titleUpper = drill.title.toUpperCase();
    if (titleUpper.includes('TRIANGLE')) return '💥 POP-OFF! LOCK OUT (NO CLOTH)';
    if (titleUpper.includes('GET-OFF')) return '💥 EXPLOSIVE GET-OFF & VIOLENT PUNCH!';
    if (titleUpper.includes('STRIKE') || titleUpper.includes('LOCK')) return '💥 BREASTPLATE STRIKE & LOCKOUT!';
    if (titleUpper.includes('SPILL')) return '💥 WRONG-ARM SPILL (INSIDE HIP)!';
    if (titleUpper.includes('SHUFFLE')) return '💥 SHUFFLE, READ & DOWNHILL STRIKE!';
    if (titleUpper.includes('PEDAL') || titleUpper.includes('PLANT')) return '⚡ T-STEP PLANT & DRIVE DOWNHILL!';
    if (titleUpper.includes('TRAIL')) return '🦅 UNDER-CONTROL TRAIL & BALL STRIP!';
    if (titleUpper.includes('PROFILE') || titleUpper.includes('TACKLE')) return '🎯 NEAR-FOOT, NEAR-SHOULDER PROFILE FIT!';
    if (titleUpper.includes('GATOR')) return '🥋 CLAMP, WRAP & VIOLENT GATOR ROLL!';
    if (titleUpper.includes('BLOCK')) return '🧱 6" POWER STEP & COILED HIP DRIVE!';
    return '💥 VIOLENT POP STRIKE & LOCKOUT!';
  }, [drill.title]);

  const tackleBadgeText = useMemo(() => {
    const titleUpper = drill.title.toUpperCase();
    if (titleUpper.includes('TRIANGLE')) return '🎯 TACKLE FIT (NEAR SHOULDER)';
    if (titleUpper.includes('GET-OFF')) return '🎯 SHED BAG & BURST THROUGH FINISH';
    if (titleUpper.includes('STRIKE') || titleUpper.includes('SHED')) return '🎯 RIP ARM, SHED & WRAP BALLCARRIER';
    if (titleUpper.includes('SPILL')) return '🎯 FUNNEL RUNNER TO SCRAPING LB';
    if (titleUpper.includes('PEDAL')) return '🎯 CATCH AT HIGHEST POINT';
    if (titleUpper.includes('TACKLE')) return '🎯 CLAMP THIGHS & DRIVE 3 YARDS';
    return '🎯 ACCELERATE, WRAP & DRIVE';
  }, [drill.title]);

  // Status banner text and color
  const bannerText = useMemo(() => {
    const phaseName = currentPhase.name || `PHASE ${activeIdx + 1}`;
    const desc = currentPhase.description || drill.objective;
    return `${phaseName}: ${desc}`;
  }, [currentPhase, activeIdx, drill.objective]);

  const bannerColor = useMemo(() => {
    if (activeIdx === 0) return '#722ed1';
    if (activeIdx === 1 || activeIdx === Math.floor(phases.length / 2)) return '#cf1322';
    return '#0958d9';
  }, [activeIdx, phases.length]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* WHITEBOARD ALUMINUM FRAME */}
      <div className="w-full max-w-[960px] bg-gradient-to-br from-[#d8dce1] via-[#adb2ba] to-[#8c919a] dark:from-[#334155] dark:via-[#1e293b] dark:to-[#0f172a] p-3 sm:p-4 pb-5 rounded-2xl shadow-2xl relative border border-slate-300 dark:border-slate-700/80">
        {/* Corner Bolts */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs"></div>
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs"></div>
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs"></div>
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs"></div>

        {/* WHITEBOARD SURFACE */}
        <div
          className="w-full bg-[#fcfdfe] rounded-xl shadow-inner p-3 sm:p-5 overflow-hidden border border-slate-200/90"
          style={{
            backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* TOP HUD BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b-2 border-dashed border-[#cfd6df]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-600/30 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                  {drill.categoryLabel || `${drill.category} Drill Progression`}
                </span>
                {drill.videoUrl && (
                  <a
                    href={drill.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs"
                  >
                    <Video className="w-3 h-3 text-indigo-600" />
                    <span>Watch Coaching Film</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-black text-[#1f2328] uppercase tracking-tight mt-0.5">
                {drill.title}
              </h1>
              <p className="text-xs text-[#57606a] italic font-medium">
                {drill.subtitle || drill.objective}
              </p>
            </div>

            {/* CONTROLS GROUP */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleToggleRunning}
                className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 cursor-pointer transition-all shadow-xs flex items-center gap-1.5 ${
                  isRunning
                    ? 'bg-white border-[#2b3036] text-[#2b3036] hover:bg-slate-50'
                    : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-500'
                }`}
                title={isRunning ? 'Pause Animation' : 'Start Animation'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>PLAY REEL</span>
                  </>
                )}
              </button>

              {/* Phase Action Buttons (Linebacker Triangle button format) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
                {phases.map((p, idx) => {
                  const isActive = activeIdx === idx;
                  const shortName = p.name.replace(/^PHASE \d+:\s*/i, '');
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPhase(idx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#e6f4ff] border border-[#0958d9] text-[#0958d9] shadow-xs'
                          : 'bg-white border border-transparent text-slate-700 hover:text-slate-950'
                      }`}
                      title={p.description}
                    >
                      {shortName.length > 18 ? `Step ${idx + 1}` : shortName}
                    </button>
                  );
                })}
              </div>

              {/* Auto Cycle Toggle */}
              <button
                type="button"
                onClick={() => setAutoCycle((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all shadow-2xs flex items-center gap-1 ${
                  autoCycle
                    ? 'bg-[#e6f4ff] border-[#0958d9] text-[#0958d9]'
                    : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                }`}
                title="Toggle continuous progression cycle"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoCycle && isRunning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto-Cycle</span>
              </button>

              {/* Print Drill Sheet */}
              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Print official coaching drill sheet"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline">Print Drill</span>
                </button>
              )}

              {/* Chalkboard Mode Toggle */}
              {onOpenCustomChalkboard && (
                <button
                  type="button"
                  onClick={onOpenCustomChalkboard}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Switch to chalkboard sketch & custom drawing canvas"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">Draw Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* SVG WHITEBOARD CANVAS (Linebacker Triangle layout style & dimensions) */}
          <div className="w-full relative flex justify-center items-center select-none overflow-x-auto">
            <svg
              viewBox="0 0 880 670"
              className="w-full h-auto max-h-[640px] drop-shadow-xs"
              style={{ minWidth: '600px' }}
            >
              <defs>
                <marker
                  id="arrow-red"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cf1322" />
                </marker>
                <marker
                  id="arrow-blue"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0958d9" />
                </marker>
                <marker
                  id="arrow-blk"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#262626" />
                </marker>
                <marker
                  id="arrow-purple"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#722ed1" />
                </marker>
                <marker
                  id="arrow-green"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16a34a" />
                </marker>
                <marker
                  id="arrow-orange"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d46b08" />
                </marker>
                <marker
                  id="t-bar"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <line x1="5" y1="0" x2="5" y2="10" stroke="#262626" strokeWidth="2.5" />
                </marker>
                <style>
                  {`
                    @keyframes flowDashAnim {
                      to {
                        stroke-dashoffset: -24;
                      }
                    }
                    .flow-path-anim {
                      stroke-dasharray: 6, 6;
                      animation: flowDashAnim 0.8s linear infinite;
                    }
                    .field-element-transition {
                      transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
                    }
                    @keyframes pulseRingAnim {
                      0% { r: 18px; opacity: 0.9; stroke-width: 4px; }
                      100% { r: 46px; opacity: 0; stroke-width: 1px; }
                    }
                    .impact-active-pulse {
                      transform-origin: center;
                      animation: pulseRingAnim 0.65s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
                    }
                  `}
                </style>
              </defs>

              {/* 1. TACTICAL FORMATION ZONE FOOTPRINT (matching Triangle Drill's Fit Triangle) */}
              <g id="tactical-field-backdrop">
                <polygon
                  points={tacticalZone.points}
                  fill="#f4f8ff"
                  stroke="#adc6ff"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                {/* Big watermark title */}
                <text
                  x="440"
                  y={tacticalZone.midY + 12}
                  textAnchor="middle"
                  fill="#adc6ff"
                  fontSize="32"
                  fontWeight="900"
                  letterSpacing="5"
                  opacity="0.32"
                >
                  {tacticalZone.label}
                </text>
              </g>

              {/* 2. THREE-DIMENSIONAL BOUNDARY CONES (matching Triangle Drill orange cones) */}
              <g id="perimeter-cones">
                {/* Top Center Cone */}
                <g transform={`translate(${tacticalZone.midX}, ${tacticalZone.top})`}>
                  <polygon
                    points="0,-8 -8,9 8,9"
                    fill="#fa8c16"
                    stroke="#d46b08"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="0" cy="9" rx="8" ry="3" fill="#d46b08" />
                </g>
                {/* Bottom Left Cone */}
                <g transform={`translate(${tacticalZone.left}, ${tacticalZone.bottom})`}>
                  <polygon
                    points="0,-8 -8,9 8,9"
                    fill="#fa8c16"
                    stroke="#d46b08"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="0" cy="9" rx="8" ry="3" fill="#d46b08" />
                </g>
                {/* Bottom Right Cone */}
                <g transform={`translate(${tacticalZone.right}, ${tacticalZone.bottom})`}>
                  <polygon
                    points="0,-8 -8,9 8,9"
                    fill="#fa8c16"
                    stroke="#d46b08"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="0" cy="9" rx="8" ry="3" fill="#d46b08" />
                </g>
              </g>

              {/* 3. STATIC GUIDE TRACKS (all drill pathways shown with pale dashed guide lines) */}
              <g id="static-guide-tracks" opacity="0.65">
                {phases.flatMap((p, pIdx) =>
                  (p.arrows || []).map((arrow, aIdx) => {
                    const start = transformCoord(arrow.startX, arrow.startY);
                    const end = transformCoord(arrow.endX, arrow.endY);
                    let d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                    if (arrow.type === 'curved' && arrow.controlX && arrow.controlY) {
                      const ctrl = transformCoord(arrow.controlX, arrow.controlY);
                      d = `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
                    }
                    return (
                      <path
                        key={`guide-${pIdx}-${aIdx}`}
                        d={d}
                        fill="none"
                        stroke="#ffd591"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    );
                  })
                )}
              </g>

              {/* 4. ACTIVE FLOW PATHS & ARROWS FOR THE CURRENT PHASE */}
              <g id="active-flow-paths">
                {(currentPhase.arrows || []).map((arrow, idx) => {
                  const start = transformCoord(arrow.startX, arrow.startY);
                  const end = transformCoord(arrow.endX, arrow.endY);
                  let d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                  if (arrow.type === 'curved' && arrow.controlX && arrow.controlY) {
                    const ctrl = transformCoord(arrow.controlX, arrow.controlY);
                    d = `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
                  }

                  const strokeColor =
                    arrow.color === '#d91b24' || arrow.color === '#cf1322'
                      ? '#cf1322'
                      : arrow.color === '#058538' || arrow.color === '#16a34a'
                      ? '#16a34a'
                      : arrow.color === '#7c3aed' || arrow.color === '#722ed1'
                      ? '#722ed1'
                      : arrow.color === '#e06c00' || arrow.color === '#fa8c16'
                      ? '#d46b08'
                      : '#0958d9';

                  const markerId =
                    arrow.type === 'block'
                      ? 'url(#t-bar)'
                      : strokeColor === '#cf1322'
                      ? 'url(#arrow-red)'
                      : strokeColor === '#16a34a'
                      ? 'url(#arrow-green)'
                      : strokeColor === '#722ed1'
                      ? 'url(#arrow-purple)'
                      : strokeColor === '#d46b08'
                      ? 'url(#arrow-orange)'
                      : 'url(#arrow-blue)';

                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2;

                  return (
                    <g key={arrow.id || idx}>
                      <path
                        d={d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3.5"
                        markerEnd={markerId}
                        className="flow-path-anim"
                      />
                      {arrow.label && (
                        <g transform={`translate(${midX}, ${midY - 14})`}>
                          <rect
                            x="-65"
                            y="-9"
                            width="130"
                            height="18"
                            rx="4"
                            fill="#ffffff"
                            stroke={strokeColor}
                            strokeWidth="1.2"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
                          />
                          <text
                            x="0"
                            y="4"
                            fontSize="9"
                            fontWeight="bold"
                            fill={strokeColor}
                            textAnchor="middle"
                          >
                            {arrow.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 5. DEFENSIVE & OFFENSIVE TOKENS (Rendered with the exact Linebacker Triangle visual engine) */}
              <g id="field-players">
                {(currentPhase.tokens || []).map((t, idx) => {
                  const pos = transformCoord(t.x, t.y);
                  const upperLabel = (t.label || '').toUpperCase().trim();
                  const upperSub = (t.subLabel || '').toUpperCase().trim();

                  const isBallCarrier =
                    upperLabel === 'RB' ||
                    upperLabel === 'TB' ||
                    upperLabel === 'FB' ||
                    upperLabel === 'HB' ||
                    upperLabel === 'WR' ||
                    upperLabel === 'BC' ||
                    upperLabel.includes('BALL') ||
                    upperLabel.includes('CARRIER') ||
                    upperSub.includes('BALL') ||
                    upperSub.includes('CARRIER') ||
                    upperSub.includes('RUNNER');

                  const isBlocker =
                    t.isSquare ||
                    t.type === 'square' ||
                    (t.type === 'O' && !isBallCarrier) ||
                    upperLabel.startsWith('B') ||
                    ['OL', 'C', 'G', 'T', 'TE', 'LT', 'RT', 'LG', 'RG', 'SHIELD'].includes(
                      upperLabel
                    );

                  const isCoach =
                    upperLabel.includes('COACH') ||
                    upperSub.includes('COACH') ||
                    (t.type === 'ball' && upperLabel.includes('COACH'));

                  const isBag = t.type === 'bag' || upperLabel.includes('BAG') || upperLabel.includes('DUMMY');
                  const isCone = t.type === 'cone' || upperLabel.includes('CONE') || upperSub.includes('CONE');

                  const isDefender =
                    t.type === 'X' ||
                    (!isBlocker &&
                      !isBallCarrier &&
                      !isCoach &&
                      !isBag &&
                      !isCone &&
                      [
                        'LB',
                        'DL',
                        'DE',
                        'DT',
                        'NT',
                        'DB',
                        'CB',
                        'FS',
                        'SS',
                        'MIKE',
                        'WILL',
                        'SAM',
                        'DEF',
                        'ROV',
                        'ROVER',
                        'TACKLE',
                      ].includes(upperLabel));

                  // A. Ball Carrier (with angled 3D football at hip)
                  if (isBallCarrier) {
                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        <circle cx="0" cy="0" r="18" fill="#ffccc7" stroke="#cf1322" strokeWidth="3" />
                        <text
                          x="0"
                          y="5"
                          fontSize="13"
                          fontWeight="900"
                          fill="#cf1322"
                          textAnchor="middle"
                        >
                          {t.label || 'RB'}
                        </text>
                        {/* 3D Brown Football with white laces at hip */}
                        <ellipse
                          cx="14"
                          cy="4"
                          rx="7"
                          ry="4.5"
                          fill="#8B4513"
                          stroke="#ffffff"
                          strokeWidth="0.8"
                          transform="rotate(25 14 4)"
                        />
                        <text
                          x="28"
                          y="5"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#cf1322"
                          filter="drop-shadow(0 1px 1px #fff)"
                        >
                          {t.subLabel || 'Ball Carrier'}
                        </text>
                      </g>
                    );
                  }

                  // B. Offensive Blocker (Metallic Square Shield)
                  if (isBlocker) {
                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        <rect
                          x="-17"
                          y="-17"
                          width="34"
                          height="34"
                          rx="4"
                          fill="#e8e8e8"
                          stroke="#262626"
                          strokeWidth="3"
                        />
                        <text
                          x="0"
                          y="5"
                          fontSize="13"
                          fontWeight="900"
                          fill="#262626"
                          textAnchor="middle"
                        >
                          {t.label || 'OL'}
                        </text>
                        <text
                          x="-24"
                          y="5"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#555"
                          textAnchor="end"
                        >
                          {t.subLabel || 'Blocker'}
                        </text>
                      </g>
                    );
                  }

                  // C. Primary Defender with Athletic Cleats / Dual Feet
                  if (isDefender) {
                    // Calculate lead foot based on phase direction
                    const movingRight = (currentPhase.arrows || []).some(
                      (a) => a.startX < a.endX && Math.abs(a.endX - a.startX) > 20
                    );
                    const movingLeft = (currentPhase.arrows || []).some(
                      (a) => a.startX > a.endX && Math.abs(a.startX - a.endX) > 20
                    );

                    let footLY = 2;
                    let footRY = 2;
                    let leadLeft = false;
                    let leadRight = false;
                    let footLabel = 'SQUARE BASE (NO BENT NAILS)';

                    if (movingLeft) {
                      footRY = -6;
                      footLY = 8;
                      leadRight = true;
                      footLabel = 'RIGHT LEAD (ATTACK LEFT)';
                    } else if (movingRight) {
                      footLY = -6;
                      footRY = 8;
                      leadLeft = true;
                      footLabel = 'LEFT LEAD (ATTACK RIGHT)';
                    } else if (activeIdx >= 1) {
                      footLabel = 'POP-OFF STRIKE & LOCKOUT';
                    }

                    if (activeIdx === phases.length - 1 && phases.length > 2) {
                      footLabel = 'SHED & ACCELERATE TO BALL';
                    }

                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        {/* Dual athletic cleats / stance indicators */}
                        <rect
                          x="-18"
                          y={footLY}
                          width="11"
                          height="22"
                          rx="4"
                          fill={leadLeft ? '#0958d9' : '#69b1ff'}
                          stroke="#0958d9"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="7"
                          y={footRY}
                          width="11"
                          height="22"
                          rx="4"
                          fill={leadRight ? '#0958d9' : '#69b1ff'}
                          stroke="#0958d9"
                          strokeWidth="1.5"
                        />
                        {/* Main circular token */}
                        <circle cx="0" cy="0" r="22" fill="#bae0ff" stroke="#0958d9" strokeWidth="3.5" />
                        <text
                          x="0"
                          y="5"
                          fontSize="14"
                          fontWeight="bold"
                          fill="#0958d9"
                          textAnchor="middle"
                        >
                          {t.label || 'LB'}
                        </text>
                        {/* Stance / Foot Lead Technique Badge */}
                        <text
                          x="0"
                          y="44"
                          fontSize="10.5"
                          fontWeight="bold"
                          fill="#0958d9"
                          textAnchor="middle"
                        >
                          {footLabel}
                        </text>
                      </g>
                    );
                  }

                  // D. Tackle Bag / Stand-Up Dummy
                  if (isBag) {
                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        <rect
                          x="-16"
                          y="-24"
                          width="32"
                          height="48"
                          rx="8"
                          fill="#fee2e2"
                          stroke="#cf1322"
                          strokeWidth="2.5"
                        />
                        <circle cx="0" cy="-14" r="5" fill="#ffffff" opacity="0.8" />
                        <text
                          x="0"
                          y="5"
                          fontSize="10"
                          fontWeight="900"
                          fill="#cf1322"
                          textAnchor="middle"
                        >
                          {t.label || 'BAG'}
                        </text>
                        {t.subLabel && (
                          <text
                            x="0"
                            y="34"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#cf1322"
                            textAnchor="middle"
                          >
                            {t.subLabel}
                          </text>
                        )}
                      </g>
                    );
                  }

                  // E. Field Cone
                  if (isCone) {
                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        <polygon
                          points="0,-8 -8,9 8,9"
                          fill="#fa8c16"
                          stroke="#d46b08"
                          strokeWidth="1.5"
                        />
                        <ellipse cx="0" cy="9" rx="8" ry="3" fill="#d46b08" />
                        {t.label && (
                          <text
                            x="12"
                            y="5"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#d46b08"
                          >
                            {t.label}
                          </text>
                        )}
                      </g>
                    );
                  }

                  // F. Coach Token
                  if (isCoach) {
                    return (
                      <g
                        key={t.id || idx}
                        className="field-element-transition"
                        transform={`translate(${pos.x}, ${pos.y})`}
                      >
                        <circle cx="0" cy="0" r="21" fill="#ffffff" stroke="#722ed1" strokeWidth="3" />
                        <text
                          x="0"
                          y="5"
                          fontSize="11"
                          fontWeight="900"
                          fill="#722ed1"
                          textAnchor="middle"
                        >
                          COACH
                        </text>
                        <text
                          x="0"
                          y="32"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#722ed1"
                          textAnchor="middle"
                        >
                          (CUE &amp; SIGNAL)
                        </text>
                        <text
                          x="-28"
                          y="2"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#0958d9"
                          textAnchor="end"
                        >
                          🗣️ {drill.cues[0] || '“Fire with low hips!”'}
                        </text>
                      </g>
                    );
                  }

                  // G. Default Clean Athlete Token
                  return (
                    <g
                      key={t.id || idx}
                      className="field-element-transition"
                      transform={`translate(${pos.x}, ${pos.y})`}
                    >
                      <circle cx="0" cy="0" r="18" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
                      <text
                        x="0"
                        y="5"
                        fontSize="12"
                        fontWeight="900"
                        fill="#0f172a"
                        textAnchor="middle"
                      >
                        {t.label}
                      </text>
                      {t.subLabel && (
                        <text
                          x="0"
                          y="28"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill="#475569"
                          textAnchor="middle"
                        >
                          {t.subLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 6. COACH BEHIND SETUP (Rendered if drill does not have an explicit coach token) */}
              {!hasExplicitCoach && (
                <g id="coach-behind-setup">
                  <g
                    className="field-element-transition"
                    transform="translate(440, 520)"
                  >
                    <circle cx="0" cy="0" r="21" fill="#ffffff" stroke="#722ed1" strokeWidth="3" />
                    <text
                      x="0"
                      y="5"
                      fontSize="11"
                      fontWeight="900"
                      fill="#722ed1"
                      textAnchor="middle"
                    >
                      COACH
                    </text>
                    <text
                      x="0"
                      y="32"
                      fontSize="10.5"
                      fontWeight="bold"
                      fill="#722ed1"
                      textAnchor="middle"
                    >
                      (BEHIND / SIGNALS)
                    </text>
                    {/* Coach verbal callout bubble */}
                    <text
                      x="-30"
                      y="2"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#0958d9"
                      textAnchor="end"
                    >
                      🗣️ {drill.cues[0] || '“Thumbs Up, Elbows Glued!”'}
                    </text>
                  </g>
                  {/* Coach purple hand-signal trajectory path */}
                  <path
                    d={`M 440 495 L ${focalPoint.x} ${Math.max(220, focalPoint.y + 40)}`}
                    fill="none"
                    stroke="#722ed1"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    markerEnd="url(#arrow-purple)"
                  />
                  <text
                    x="450"
                    y="480"
                    fontSize="10.5"
                    fontWeight="bold"
                    fill="#722ed1"
                  >
                    COACH HAND SIGNAL / CUE
                  </text>
                </g>
              )}

              {/* 7. CONTACT IMPACT SHOCKWAVE (Ring pulsing on collision / climax) */}
              {isImpactActive && (
                <circle
                  className="impact-active-pulse"
                  cx={focalPoint.x}
                  cy={focalPoint.y}
                  r="34"
                  fill="none"
                  stroke="#cf1322"
                  strokeWidth="4"
                />
              )}

              {/* 8. ELEVATED ACTION CALLOUT BADGE (Matching Linebacker Triangle strike/tackle badges) */}
              {activeIdx >= 1 && (
                <g
                  className="field-element-transition"
                  transform={`translate(${focalPoint.x}, ${focalPoint.y - 48})`}
                >
                  <rect
                    x="-135"
                    y="-16"
                    width="270"
                    height="32"
                    rx="6"
                    fill={activeIdx === phases.length - 1 ? '#e6f4ff' : '#fff1f0'}
                    stroke={activeIdx === phases.length - 1 ? '#0958d9' : '#cf1322'}
                    strokeWidth="2"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))"
                  />
                  <text
                    x="0"
                    y="5"
                    fontSize="11"
                    fontWeight="bold"
                    fill={activeIdx === phases.length - 1 ? '#0958d9' : '#cf1322'}
                    textAnchor="middle"
                  >
                    {activeIdx === phases.length - 1 ? tackleBadgeText : strikeBadgeText}
                  </text>
                </g>
              )}

              {/* 9. LIVE COACHING BANNER */}
              <text
                x="440"
                y="575"
                fontSize="13.5"
                fontWeight="bold"
                fill={bannerColor}
                textAnchor="middle"
              >
                {bannerText}
              </text>

              {/* 10. WHITEBOARD FOOTER NOTES (Archie McDaniel / Coaching keys section) */}
              <line
                x1="30"
                y1="595"
                x2="850"
                y2="595"
                stroke="#cfd6df"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <g transform="translate(35, 616)" fontSize="11" fill="#262626">
                <text x="0" y="0" fontWeight="bold" fill="#722ed1">
                  COACHING KEYS:
                </text>
                <text x="135" y="0">
                  1. <tspan fontWeight="bold">Setup &amp; Stance:</tspan>{' '}
                  {drill.setup || 'Keep hips coiled low, center of gravity forward over cleats.'}
                </text>
                <text x="135" y="16">
                  2. <tspan fontWeight="bold">Primary Cue:</tspan>{' '}
                  {drill.cues && drill.cues[0] ? drill.cues[0] : 'Explode on movement; maintain inside hand leverage.'}
                </text>
                <text x="135" y="32">
                  3. <tspan fontWeight="bold">Eliminate Fault:</tspan>{' '}
                  {drill.faults && drill.faults[0] ? drill.faults[0] : 'Never pop helmet up before hips fire forward.'}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* MARKER TRAY (4 dry-erase markers & felt eraser) */}
        <div className="mt-3.5 h-3 bg-gradient-to-b from-[#8a8f96] to-[#63676e] rounded-xs relative flex justify-center items-center shadow-inner">
          <div className="absolute -top-2 flex gap-4 items-center">
            <div className="w-11 h-2 rounded-xs bg-[#222] shadow-xs" title="Black Dry-Erase Marker"></div>
            <div className="w-11 h-2 rounded-xs bg-[#0958d9] shadow-xs" title="Blue Dry-Erase Marker"></div>
            <div className="w-11 h-2 rounded-xs bg-[#cf1322] shadow-xs" title="Red Dry-Erase Marker"></div>
            <div className="w-11 h-2 rounded-xs bg-[#d46b08] shadow-xs" title="Orange Dry-Erase Marker"></div>
            <div
              className="w-14 h-2.5 bg-[#363738] rounded-xs border-b-2 border-[#555] shadow-xs"
              title="Felt Eraser"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
