import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCw, Video, Printer, PenTool } from 'lucide-react';
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

    // Trigger impact shockwave pulse on action/middle phases
    const isActionPhase = activeIdx === 1 || (phases.length === 2 && activeIdx === 1) || activeIdx === Math.floor(phases.length / 2);
    if (isActionPhase) {
      setIsImpactActive(true);
      const impactTimer = setTimeout(() => setIsImpactActive(false), 700);
      return () => clearTimeout(impactTimer);
    } else {
      setIsImpactActive(false);
    }

    // Timing delay: give coach ample time to observe alignment and movements
    const delay = activeIdx === 0 ? 2200 : activeIdx === phases.length - 1 ? 2600 : 2000;

    timerRef.current = setTimeout(() => {
      if (activeIdx >= phases.length - 1) {
        if (autoCycle) {
          const nextIdx = 0;
          setInternalPhaseIdx(nextIdx);
          onPhaseChange?.(nextIdx);
        } else {
          setIsRunning(false);
        }
      } else {
        const nextIdx = activeIdx + 1;
        setInternalPhaseIdx(nextIdx);
        onPhaseChange?.(nextIdx);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, activeIdx, phases.length, autoCycle, onPhaseChange]);

  const handleSelectPhase = (idx: number) => {
    setInternalPhaseIdx(idx);
    onPhaseChange?.(idx);
    setIsImpactActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleToggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  // Compute bounding box and auto-center offset so drill is centered on the 880x670 SVG canvas
  const { shiftX, shiftY, primaryFocalPoint } = useMemo(() => {
    const allTokens = phases.flatMap((p) => p.tokens || []);
    if (allTokens.length === 0) {
      return { shiftX: 0, shiftY: 0, primaryFocalPoint: { x: 440, y: 280 } };
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

    const drillCenterX = (minX + maxX) / 2;
    const drillCenterY = (minY + maxY) / 2;

    // Field canvas center target: x = 440, y = 280
    const rawShiftX = 440 - drillCenterX;
    const rawShiftY = 280 - drillCenterY;

    // Clamp shifts to keep items safely within the visible board boundary
    const clampedShiftX = Math.max(-200, Math.min(200, Math.round(rawShiftX)));
    const clampedShiftY = Math.max(-100, Math.min(100, Math.round(rawShiftY)));

    // Find primary collision/focal point for shockwave ring
    let focalX = 440;
    let focalY = 280;

    // Check arrows for contact/block target
    const currentArrows = currentPhase.arrows || [];
    if (currentArrows.length > 0) {
      const primaryArrow = currentArrows.find((a) => a.type === 'block' || a.type === 'blitz') || currentArrows[0];
      focalX = primaryArrow.endX + clampedShiftX;
      focalY = primaryArrow.endY + clampedShiftY;
    } else {
      // Find middle defender or bag
      const focalToken = currentPhase.tokens.find((t) => t.type === 'bag' || t.type === 'square' || t.type === 'X') || currentPhase.tokens[0];
      if (focalToken) {
        focalX = focalToken.x + clampedShiftX;
        focalY = focalToken.y + clampedShiftY;
      }
    }

    return {
      shiftX: clampedShiftX,
      shiftY: clampedShiftY,
      primaryFocalPoint: { x: focalX, y: focalY },
    };
  }, [phases, currentPhase]);

  // Color schemes for phase badges
  const phaseColors = [
    { border: '#0958d9', bg: '#e6f4ff', text: '#0958d9', title: 'Base Alignment & Read' },
    { border: '#cf1322', bg: '#fff1f0', text: '#cf1322', title: 'Explode & Strike' },
    { border: '#389e0d', bg: '#f6ffed', text: '#389e0d', title: 'Shed & Finish' },
    { border: '#722ed1', bg: '#f9f0ff', text: '#722ed1', title: 'Reset & Rep' },
  ];
  const activeColor = phaseColors[activeIdx % phaseColors.length];

  // Derive callout badge text for active phase
  const actionBadgeText = useMemo(() => {
    if (activeIdx === 0) {
      return '🎯 PRE-SNAP ALIGNMENT & EYE DISCIPLINE';
    }
    // Check if an arrow has a label in current phase
    const labeledArrow = currentPhase.arrows.find((a) => a.label);
    if (labeledArrow?.label) {
      return `💥 ${labeledArrow.label.toUpperCase()}`;
    }
    if (activeIdx === 1) {
      return '💥 EXPLOSIVE PUNCH & LOCKOUT';
    }
    return '🏁 VIOLENT SHED & SPRINT FINISH';
  }, [activeIdx, currentPhase.arrows]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* =========================================================================
          ALUMINUM WHITEBOARD FRAME WITH CORNER BOLTS
          ========================================================================= */}
      <div className="w-full max-w-5xl xl:max-w-6xl bg-gradient-to-br from-[#d8dce1] via-[#adb2ba] to-[#8c919a] dark:from-[#334155] dark:via-[#1e293b] dark:to-[#0f172a] p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl relative border border-[#c0c5cc]/80">
        {/* Corner Rivet Screws */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-radial from-[#444] to-[#777] shadow-xs" />

        {/* =========================================================================
            WHITEBOARD SURFACE
            ========================================================================= */}
        <div
          className="bg-[#fbfcfd] dark:bg-slate-950 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-inner border border-[#d2d6dc] relative flex flex-col items-center overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* TOP HUD BAR: DRILL METRICS, VIDEO & CONTROLS */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb] dark:border-slate-800">
            {/* Left: Drill Title & Category Tag */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase bg-[#e6f4ff] text-[#0958d9] rounded-md border border-[#91caff]">
                  {drill.categoryLabel || drill.category} PROGRESSION
                </span>
                {drill.videoUrl && (
                  <a
                    href={drill.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                  >
                    <Video className="w-3 h-3" />
                    <span>Watch Video</span>
                  </a>
                )}
                {drill.hudlPlaybookName && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-md border border-indigo-200">
                    Hudl: {drill.hudlPlaybookName}
                  </span>
                )}
              </div>
              <h2
                className="text-xl sm:text-2xl font-black text-[#1f2937] dark:text-white tracking-tight uppercase mt-0.5"
                style={{ fontFamily: "'Permanent Marker', cursive, sans-serif" }}
              >
                {drill.title}
              </h2>
              <p className="text-xs text-[#4b5563] dark:text-slate-400 font-medium italic">
                {drill.subtitle} — {currentPhase.name}
              </p>
            </div>

            {/* Right: Interactive Animated Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={handleToggleRunning}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRunning
                    ? 'bg-[#cf1322] hover:bg-[#a8071a] text-white animate-pulse'
                    : 'bg-[#0958d9] hover:bg-[#003eb3] text-white'
                }`}
                title={isRunning ? 'Pause animated execution' : 'Play animated loop'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isRunning ? 'Pause' : 'Play Drill'}</span>
              </button>

              {/* Phase Progression Stepper Buttons */}
              <div className="flex items-center bg-[#f0f2f5] dark:bg-slate-900 p-1 rounded-xl border border-[#d9d9d9] dark:border-slate-800 gap-1 flex-wrap">
                {phases.map((phase, idx) => (
                  <button
                    key={phase.name || idx}
                    type="button"
                    onClick={() => handleSelectPhase(idx)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeIdx === idx
                        ? 'bg-white dark:bg-slate-800 text-[#0958d9] dark:text-sky-300 shadow-sm border border-[#91caff]'
                        : 'text-[#595959] dark:text-slate-400 hover:text-[#262626] dark:hover:text-white'
                    }`}
                    title={phase.description || phase.name}
                  >
                    Phase {idx + 1}
                  </button>
                ))}
              </div>

              {/* Auto-Cycle Toggle */}
              <button
                type="button"
                onClick={() => setAutoCycle(!autoCycle)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                  autoCycle
                    ? 'bg-[#e6f4ff] text-[#0958d9] border-[#91caff]'
                    : 'bg-[#f5f5f5] dark:bg-slate-800 text-[#8c8c8c] border-[#d9d9d9] dark:border-slate-700'
                }`}
                title="Continuous loop through all phases"
              >
                <RotateCw className="w-3 h-3" />
                <span className="hidden sm:inline">Auto-Cycle: {autoCycle ? 'ON' : 'OFF'}</span>
              </button>

              {/* Print Drill Sheet */}
              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Print this isolated drill sheet"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  <span>Print</span>
                </button>
              )}

              {/* Chalkboard Draw / Edit Toggle */}
              {onOpenCustomChalkboard && (
                <button
                  type="button"
                  onClick={onOpenCustomChalkboard}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-300 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open custom chalkboard to draw freehand or customize tokens"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chalkboard Draw</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              SVG GRAPHIC ANIMATION CANVAS
              ========================================================================= */}
          <div className="w-full flex justify-center py-2 overflow-x-auto">
            <svg
              viewBox="0 0 880 670"
              className="w-full max-w-[880px] h-auto rounded-lg"
              style={{ minHeight: '520px' }}
            >
              <defs>
                {/* Flow dashed animation */}
                <style>
                  {`
                    @keyframes flowDashAnim {
                      to { stroke-dashoffset: -12; }
                    }
                    .flow-path-anim {
                      stroke-dasharray: 6, 6;
                      animation: flowDashAnim 0.8s linear infinite;
                    }
                    .field-element-transition {
                      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                    }
                    @keyframes pulseRingAnim {
                      0% { transform: scale(0.3); opacity: 0.95; stroke-width: 8; }
                      100% { transform: scale(1.85); opacity: 0; stroke-width: 1; }
                    }
                    .impact-active-pulse {
                      transform-origin: center;
                      animation: pulseRingAnim 0.65s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
                    }
                  `}
                </style>

                {/* Arrow markers */}
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
                  id="arrow-green"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#389e0d" />
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
                  id="t-bar"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                >
                  <line x1="5" y1="0" x2="5" y2="10" stroke="#262626" strokeWidth="3" />
                </marker>
              </defs>

              {/* Field Perimeter & Background Yard Lines */}
              <rect
                x="20"
                y="15"
                width="840"
                height="565"
                rx="16"
                fill="#ffffff"
                stroke="#e5e7eb"
                strokeWidth="2"
              />

              {/* Tactical Yard Lines / Field Stripes */}
              <line x1="30" y1="130" x2="850" y2="130" stroke="#f0f2f5" strokeWidth="1.5" />
              <line x1="30" y1="240" x2="850" y2="240" stroke="#e6f4ff" strokeWidth="2" strokeDasharray="6,6" />
              <line x1="30" y1="350" x2="850" y2="350" stroke="#f0f2f5" strokeWidth="1.5" />
              <line x1="30" y1="460" x2="850" y2="460" stroke="#f0f2f5" strokeWidth="1.5" />

              {/* Hash Marks across middle */}
              <g stroke="#d9d9d9" strokeWidth="1.5">
                <line x1="360" y1="125" x2="360" y2="135" />
                <line x1="520" y1="125" x2="520" y2="135" />
                <line x1="360" y1="235" x2="360" y2="245" />
                <line x1="520" y1="235" x2="520" y2="245" />
                <line x1="360" y1="345" x2="360" y2="355" />
                <line x1="520" y1="345" x2="520" y2="355" />
                <line x1="360" y1="455" x2="360" y2="465" />
                <line x1="520" y1="455" x2="520" y2="465" />
              </g>

              {/* ================= ZONES ================= */}
              {(currentPhase.zones || []).map((z) => {
                const zx = z.cx + shiftX;
                const zy = z.cy + shiftY;
                const color = z.color || '#0958d9';
                return (
                  <g key={z.id}>
                    <ellipse
                      cx={zx}
                      cy={zy}
                      rx={z.rx}
                      ry={z.ry}
                      fill={color}
                      fillOpacity={0.08}
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />
                    {z.name && (
                      <g transform={`translate(${zx}, ${zy - z.ry - 10})`}>
                        <rect
                          x={-Math.max(z.name.length * 4.5 + 10, 32)}
                          y="-9"
                          width={Math.max(z.name.length * 9 + 20, 64)}
                          height="18"
                          rx="4"
                          fill="#ffffff"
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="3.5"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill={color}
                          textAnchor="middle"
                        >
                          {z.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ================= ARROWS (ANIMATED FLOW PATHS) ================= */}
              {(currentPhase.arrows || []).map((a) => {
                const sx = a.startX + shiftX;
                const sy = a.startY + shiftY;
                const ex = a.endX + shiftX;
                const ey = a.endY + shiftY;

                let d = '';
                if (a.type === 'curved' && a.controlX !== undefined && a.controlY !== undefined) {
                  const cx = a.controlX + shiftX;
                  const cy = a.controlY + shiftY;
                  d = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
                } else if (a.type === 'blitz') {
                  const midX = (sx + ex) / 2 + 15;
                  const midY = (sy + ey) / 2 - 10;
                  d = `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`;
                } else {
                  d = `M ${sx} ${sy} L ${ex} ${ey}`;
                }

                // Marker id selection
                const color = a.color || '#0958d9';
                let markerUrl = 'url(#arrow-blue)';
                if (a.type === 'block') markerUrl = 'url(#t-bar)';
                else if (color === '#cf1322' || color === '#dc2626' || color === '#d91b24') markerUrl = 'url(#arrow-red)';
                else if (color === '#389e0d' || color === '#16a34a' || color === '#058538') markerUrl = 'url(#arrow-green)';
                else if (color === '#722ed1' || color === '#7c3aed') markerUrl = 'url(#arrow-purple)';
                else if (color === '#d46b08' || color === '#ea580c') markerUrl = 'url(#arrow-orange)';
                else if (color === '#262626' || color === '#1a1a24') markerUrl = 'url(#arrow-blk)';

                const isDashed = a.dashed || a.type === 'drop';
                const midX = (sx + ex) / 2;
                const midY = (sy + ey) / 2;

                return (
                  <g key={a.id}>
                    {/* Animated moving dashed path */}
                    <path
                      className={isDashed || isRunning ? 'flow-path-anim' : undefined}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth="3.2"
                      strokeDasharray={isDashed ? '5,4' : '6,6'}
                      markerEnd={markerUrl}
                    />

                    {/* Arrow Label Badge */}
                    {a.label && (
                      <g transform={`translate(${midX}, ${midY - 10})`}>
                        <rect
                          x={-Math.max(a.label.length * 4.5 + 10, 30)}
                          y="-9"
                          width={Math.max(a.label.length * 9 + 20, 60)}
                          height="18"
                          rx="4"
                          fill="#ffffff"
                          stroke={color}
                          strokeWidth="1.2"
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                        />
                        <text
                          x="0"
                          y="3.5"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill={color}
                          textAnchor="middle"
                        >
                          {a.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ================= TOKENS ================= */}
              {(currentPhase.tokens || []).map((t) => {
                const posX = t.x + shiftX;
                const posY = t.y + shiftY;
                const isBag = t.type === 'bag';
                const isCone = t.type === 'cone';
                const isBall = t.type === 'ball';
                const isBlocker = t.type === 'square' || t.isSquare || (t.type === 'O' && ['C', 'G', 'T', 'OL', 'B1', 'B2', 'B3'].includes(t.label.toUpperCase()));
                const isBallCarrier = t.id.includes('bc') || t.id.includes('rb') || t.label.toUpperCase() === 'RB' || (t.subLabel && t.subLabel.toLowerCase().includes('ball'));
                const isCoach = t.label.toUpperCase() === 'COACH' || t.id.includes('c-') || t.color === '#722ed1' || t.color === '#1a1a24';
                const isDefender = !isCoach && !isBallCarrier && !isBlocker && !isBag && !isCone && !isBall;

                return (
                  <g
                    key={t.id}
                    className="field-element-transition"
                    style={{ transform: `translate(${posX}px, ${posY}px)` }}
                  >
                    {/* 1. BALL CARRIER */}
                    {isBallCarrier && (
                      <g>
                        <circle cx="0" cy="0" r="18" fill="#ffccc7" stroke="#cf1322" strokeWidth="3" />
                        <text x="0" y="5" fontSize="12" fontWeight="900" fill="#cf1322" textAnchor="middle">
                          {t.label || 'RB'}
                        </text>
                        {/* Football at hip */}
                        <ellipse
                          cx="14"
                          cy="4"
                          rx="7"
                          ry="4.5"
                          fill="#8B4513"
                          stroke="#fff"
                          strokeWidth="0.8"
                          transform="rotate(25 14 4)"
                        />
                        <text x="0" y="32" fontSize="10" fontWeight="bold" fill="#cf1322" textAnchor="middle">
                          {t.subLabel || 'Ball Carrier'}
                        </text>
                      </g>
                    )}

                    {/* 2. BLOCKER / OFFENSIVE LINEMAN */}
                    {isBlocker && (
                      <g>
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
                        <text x="0" y="5" fontSize="12" fontWeight="900" fill="#262626" textAnchor="middle">
                          {t.label || 'OL'}
                        </text>
                        {t.subLabel && (
                          <text x="0" y="28" fontSize="9.5" fontWeight="bold" fill="#555" textAnchor="middle">
                            {t.subLabel}
                          </text>
                        )}
                      </g>
                    )}

                    {/* 3. DEFENDER (WITH ATHLETIC FEET) */}
                    {isDefender && (
                      <g>
                        {/* Stance Cleats / Feet */}
                        <rect
                          x="-18"
                          y="13"
                          width="11"
                          height="20"
                          rx="4"
                          fill={t.color === '#0958d9' ? '#0958d9' : '#91caff'}
                          stroke="#0958d9"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="7"
                          y="13"
                          width="11"
                          height="20"
                          rx="4"
                          fill="#0958d9"
                          stroke="#0958d9"
                          strokeWidth="1.5"
                        />
                        <circle cx="0" cy="0" r="20" fill="#bae0ff" stroke="#0958d9" strokeWidth="3.2" />
                        <text x="0" y="5" fontSize="12" fontWeight="900" fill="#0958d9" textAnchor="middle">
                          {t.label || 'DEF'}
                        </text>
                        {t.subLabel && (
                          <text x="0" y="44" fontSize="10" fontWeight="bold" fill="#0958d9" textAnchor="middle">
                            {t.subLabel}
                          </text>
                        )}
                      </g>
                    )}

                    {/* 4. COACH */}
                    {isCoach && (
                      <g>
                        <circle cx="0" cy="0" r="19" fill="#ffffff" stroke="#722ed1" strokeWidth="3" />
                        <text x="0" y="4.5" fontSize="10.5" fontWeight="900" fill="#722ed1" textAnchor="middle">
                          {t.label || 'COACH'}
                        </text>
                        {t.subLabel && (
                          <text x="0" y="30" fontSize="9" fontWeight="bold" fill="#722ed1" textAnchor="middle">
                            {t.subLabel}
                          </text>
                        )}
                      </g>
                    )}

                    {/* 5. TACKLE BAG / STAND-UP DUMMY */}
                    {isBag && (
                      <g>
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
                        <text x="0" y="5" fontSize="10" fontWeight="900" fill="#cf1322" textAnchor="middle">
                          {t.label || 'BAG'}
                        </text>
                        {t.subLabel && (
                          <text x="0" y="34" fontSize="9" fontWeight="bold" fill="#cf1322" textAnchor="middle">
                            {t.subLabel}
                          </text>
                        )}
                      </g>
                    )}

                    {/* 6. CONES */}
                    {isCone && (
                      <g>
                        <polygon points="0,-12 -11,8 11,8" fill="#d46b08" stroke="#ad4e00" strokeWidth="1.5" />
                        <ellipse cx="0" cy="8" rx="10" ry="3" fill="#ad4e00" />
                        {t.label && t.label !== 'Cone' && (
                          <text x="16" y="5" fontSize="10" fontWeight="bold" fill="#d46b08">
                            {t.label}
                          </text>
                        )}
                      </g>
                    )}

                    {/* 7. FOOTBALL */}
                    {isBall && (
                      <g>
                        <ellipse
                          cx="0"
                          cy="0"
                          rx="13"
                          ry="8"
                          fill="#8B4513"
                          stroke="#ffffff"
                          strokeWidth="1"
                          transform="rotate(-20)"
                        />
                        <line x1="-5" y1="0" x2="5" y2="0" stroke="#ffffff" strokeWidth="1.2" />
                        {t.label && (
                          <text x="18" y="4" fontSize="10" fontWeight="bold" fill="#8B4513">
                            {t.label}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Shockwave Ring on Contact / Climax */}
              {isImpactActive && (
                <circle
                  className="impact-active-pulse"
                  cx={primaryFocalPoint.x}
                  cy={primaryFocalPoint.y}
                  r="36"
                  fill="none"
                  stroke="#cf1322"
                  strokeWidth="4"
                />
              )}

              {/* Action Callout Badge */}
              <g
                className="field-element-transition"
                transform={`translate(${primaryFocalPoint.x}, ${Math.max(50, primaryFocalPoint.y - 50)})`}
              >
                <rect
                  x={-Math.max(actionBadgeText.length * 4.5 + 16, 110)}
                  y="-15"
                  width={Math.max(actionBadgeText.length * 9 + 32, 220)}
                  height="30"
                  rx="6"
                  fill={activeColor.bg}
                  stroke={activeColor.border}
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                />
                <text
                  x="0"
                  y="5"
                  fontSize="11"
                  fontWeight="bold"
                  fill={activeColor.text}
                  textAnchor="middle"
                >
                  {actionBadgeText}
                </text>
              </g>

              {/* Live Coaching Banner */}
              <text
                x="440"
                y="568"
                fontSize="13"
                fontWeight="bold"
                fill={activeColor.border}
                textAnchor="middle"
              >
                PHASE {activeIdx + 1}: {currentPhase.name} — {currentPhase.description || drill.objective}
              </text>

              {/* Whiteboard Footer Notes */}
              <line
                x1="30"
                y1="590"
                x2="850"
                y2="590"
                stroke="#cfd6df"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <g transform="translate(35, 610)" fontSize="10.5" fill="#262626">
                <text x="0" y="0" fontWeight="bold" fill="#722ed1">
                  COACHING KEYS:
                </text>
                <text x="135" y="0">
                  1. <tspan fontWeight="bold">Setup &amp; Alignment:</tspan> {drill.setup || drill.objective}
                </text>
                <text x="135" y="16">
                  2. <tspan fontWeight="bold">Primary Cues:</tspan>{' '}
                  {drill.cues && drill.cues.length > 0
                    ? drill.cues.slice(0, 2).join(' • ')
                    : 'Explode on movement, maintain pad level, strike with heels of palms.'}
                </text>
                <text x="135" y="32">
                  3. <tspan fontWeight="bold">Equipment &amp; Faults:</tspan>{' '}
                  {drill.equipment || 'Standard football gear'}
                  {drill.faults && drill.faults.length > 0 ? ` (Avoid: ${drill.faults[0]})` : ''}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* MARKER TRAY WITH 4 DRY-ERASE PENS AND FELT ERASER */}
        <div className="mt-3.5 h-3 bg-gradient-to-b from-[#8a8f96] to-[#63676e] rounded-xs relative flex justify-center items-center shadow-inner">
          <div className="absolute -top-2 flex gap-4 items-center">
            <div className="w-11 h-2 rounded-xs bg-[#222] shadow-xs" title="Black Dry-Erase Marker" />
            <div className="w-11 h-2 rounded-xs bg-[#0958d9] shadow-xs" title="Blue Dry-Erase Marker" />
            <div className="w-11 h-2 rounded-xs bg-[#cf1322] shadow-xs" title="Red Dry-Erase Marker" />
            <div className="w-11 h-2 rounded-xs bg-[#d46b08] shadow-xs" title="Orange Dry-Erase Marker" />
            <div
              className="w-14 h-2.5 bg-[#363738] rounded-xs border-b-2 border-[#555] shadow-xs"
              title="Felt Eraser"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
