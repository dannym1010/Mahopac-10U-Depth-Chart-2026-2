import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardToken, WhiteboardArrow, WhiteboardZoneBubble } from '../../types';
import { Trash2, Edit2, RotateCw } from 'lucide-react';

interface WhiteboardCanvasProps {
  tokens: WhiteboardToken[];
  arrows: WhiteboardArrow[];
  zones: WhiteboardZoneBubble[];
  isDrawingMode: boolean;
  penColor: string;
  penWidth: number;
  stampMode: 'none' | 'O' | 'X' | 'blitz' | 'zone';
  stampLabel: string;
  onUpdateTokens: (tokens: WhiteboardToken[]) => void;
  onUpdateArrows: (arrows: WhiteboardArrow[]) => void;
  onUpdateZones: (zones: WhiteboardZoneBubble[]) => void;
  onSelectElement: (type: 'token' | 'arrow' | 'zone' | null, id: string | null) => void;
  selectedId: string | null;
  selectedType: 'token' | 'arrow' | 'zone' | null;
  sketchPadRef: React.RefObject<HTMLCanvasElement | null>;
  diagramKeys?: { text: string; isHighlight?: boolean }[];
  showCoachingInset?: boolean;
  showLabels?: boolean;
  zoneShadeMode?: 'dim' | 'soft' | 'outline' | 'standard';
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  tokens,
  arrows,
  zones,
  isDrawingMode,
  penColor,
  penWidth,
  stampMode,
  stampLabel,
  onUpdateTokens,
  onUpdateArrows,
  onUpdateZones,
  onSelectElement,
  selectedId,
  selectedType,
  sketchPadRef,
  diagramKeys,
  showCoachingInset = false,
  showLabels = true,
  zoneShadeMode = 'dim',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dragging state
  const [dragState, setDragState] = useState<{
    type: 'token' | 'arrow-start' | 'arrow-end' | 'arrow-control' | 'arrow-whole' | 'zone-body' | 'zone-resize';
    id: string;
    offsetX: number;
    offsetY: number;
    initialData?: any;
  } | null>(null);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);

  // Helper to get SVG coordinates from mouse or touch
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      return {
        x: Math.round(Math.max(20, Math.min(680, svgP.x))),
        y: Math.round(Math.max(20, Math.min(480, svgP.y))),
      };
    },
    []
  );

  // Handle Canvas Resize for Sketch Pad
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !sketchPadRef.current) return;
      const canvas = sketchPadRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        // Save current canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx && canvas.width > 0 && canvas.height > 0) {
          tempCtx.drawImage(canvas, 0, 0);
        }
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        if (ctx && tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sketchPadRef]);

  // Canvas Drawing Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !sketchPadRef.current) return;
    const canvas = sketchPadRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !sketchPadRef.current) return;
    const canvas = sketchPadRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !sketchPadRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const canvas = sketchPadRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !sketchPadRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const canvas = sketchPadRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stamp click on SVG field
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawingMode) return;
    if (stampMode === 'none') {
      // Deselect if clicking on empty field
      if (e.target === svgRef.current || (e.target as HTMLElement).id === 'fieldBackground') {
        onSelectElement(null, null);
      }
      return;
    }

    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    if (stampMode === 'O') {
      const newToken: WhiteboardToken = {
        id: `o-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'O',
        label: stampLabel || 'O',
        x,
        y,
        color: '#1a1a24',
      };
      onUpdateTokens([...tokens, newToken]);
      onSelectElement('token', newToken.id);
    } else if (stampMode === 'X') {
      const newToken: WhiteboardToken = {
        id: `x-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'X',
        label: stampLabel || 'X',
        x,
        y,
        color: '#0052cc',
      };
      onUpdateTokens([...tokens, newToken]);
      onSelectElement('token', newToken.id);
    } else if (stampMode === 'blitz') {
      const newArrow: WhiteboardArrow = {
        id: `arrow-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'blitz',
        startX: x,
        startY: y,
        endX: x,
        endY: Math.max(40, y - 80),
        color: '#d91b24',
        label: 'BLITZ',
      };
      onUpdateArrows([...arrows, newArrow]);
      onSelectElement('arrow', newArrow.id);
    } else if (stampMode === 'zone') {
      const newZone: WhiteboardZoneBubble = {
        id: `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: stampLabel || 'ZONE',
        cx: x,
        cy: y,
        rx: 70,
        ry: 35,
        color: '#0284c7',
        opacity: 0.22,
      };
      onUpdateZones([...zones, newZone]);
      onSelectElement('zone', newZone.id);
    }
  };

  // Pointer move during drag
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState) return;

    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    if (dragState.type === 'token') {
      onUpdateTokens(
        tokens.map((t) =>
          t.id === dragState.id
            ? { ...t, x: Math.round(x - dragState.offsetX), y: Math.round(y - dragState.offsetY) }
            : t
        )
      );
    } else if (dragState.type === 'arrow-start') {
      onUpdateArrows(
        arrows.map((a) => (a.id === dragState.id ? { ...a, startX: x, startY: y } : a))
      );
    } else if (dragState.type === 'arrow-end') {
      onUpdateArrows(
        arrows.map((a) => (a.id === dragState.id ? { ...a, endX: x, endY: y } : a))
      );
    } else if (dragState.type === 'arrow-control') {
      onUpdateArrows(
        arrows.map((a) => (a.id === dragState.id ? { ...a, controlX: x, controlY: y } : a))
      );
    } else if (dragState.type === 'arrow-whole') {
      const dx = x - dragState.initialData.mouseX;
      const dy = y - dragState.initialData.mouseY;
      onUpdateArrows(
        arrows.map((a) => {
          if (a.id !== dragState.id) return a;
          const init = dragState.initialData;
          return {
            ...a,
            startX: Math.round(init.startX + dx),
            startY: Math.round(init.startY + dy),
            endX: Math.round(init.endX + dx),
            endY: Math.round(init.endY + dy),
            controlX: a.controlX !== undefined ? Math.round(init.controlX + dx) : undefined,
            controlY: a.controlY !== undefined ? Math.round(init.controlY + dy) : undefined,
          };
        })
      );
    } else if (dragState.type === 'zone-body') {
      onUpdateZones(
        zones.map((z) =>
          z.id === dragState.id
            ? { ...z, cx: Math.round(x - dragState.offsetX), cy: Math.round(y - dragState.offsetY) }
            : z
        )
      );
    } else if (dragState.type === 'zone-resize') {
      const zone = zones.find((z) => z.id === dragState.id);
      if (zone) {
        const newRx = Math.max(25, Math.abs(x - zone.cx));
        const newRy = Math.max(18, Math.abs(y - zone.cy));
        onUpdateZones(
          zones.map((z) => (z.id === dragState.id ? { ...z, rx: newRx, ry: newRy } : z))
        );
      }
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] select-none overflow-hidden bg-slate-50 rounded-lg shadow-inner"
      style={{
        background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #f4f6f9 80%, #eaecf1 100%)',
      }}
    >
      {/* Freehand Sketch Canvas Layer */}
      <canvas
        ref={sketchPadRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasMouseUp}
        className={`absolute inset-0 z-20 w-full h-full ${
          isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
        }`}
      />

      {/* Main Interactive SVG Field Board */}
      <svg
        ref={svgRef}
        viewBox="0 0 700 500"
        className="w-full h-full block z-10"
        onClick={handleSvgClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <filter id="wbMarkerGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Marker Arrowheads */}
          <marker id="arrowhead-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d91b24" />
          </marker>
          <marker id="arrowhead-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0052cc" />
          </marker>
          <marker id="arrowhead-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#058538" />
          </marker>
          <marker id="arrowhead-black" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1a1a24" />
          </marker>
          <marker id="arrowhead-orange" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#e06c00" />
          </marker>
          <marker id="arrowhead-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
          </marker>

          {/* Blocker T-Bar */}
          <marker id="t-bar-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <line x1="5" y1="0" x2="5" y2="10" stroke="#1a1a24" strokeWidth="3" strokeLinecap="round" />
          </marker>
        </defs>

        {/* Clickable transparent background */}
        <rect id="fieldBackground" x="0" y="0" width="700" height="500" fill="transparent" />

        {/* Yard Lines & Hash Marks */}
        <g id="fieldLines" opacity="0.6">
          <line x1="30" y1="80" x2="670" y2="80" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="8,6" />
          <line x1="30" y1="160" x2="670" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="8,6" />
          {/* LOS Line of Scrimmage */}
          <line x1="30" y1="240" x2="670" y2="240" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="30" y1="320" x2="670" y2="320" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="8,6" />
          <line x1="30" y1="400" x2="670" y2="400" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="8,6" />

          {/* Hash Marks */}
          <line x1="280" y1="60" x2="280" y2="440" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,8" />
          <line x1="420" y1="60" x2="420" y2="440" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,8" />

          {/* Yard Numbers on the field like authentic playbooks */}
          <text x="560" y="168" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="900" fill="#cbd5e1" opacity="0.65">
            10
          </text>
          <text x="560" y="328" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="900" fill="#cbd5e1" opacity="0.65">
            20
          </text>
          <text x="130" y="408" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="900" fill="#cbd5e1" opacity="0.65">
            30
          </text>

          <text x="40" y="232" fontFamily="'Space Grotesk', sans-serif" fontSize="12" fontWeight="800" fill="#2563eb">
            LOS
          </text>
          <text x="635" y="232" fontFamily="'Space Grotesk', sans-serif" fontSize="12" fontWeight="800" fill="#2563eb">
            LOS
          </text>
        </g>

        {/* Optional Diagram Inset Coaching Card (Can be toggled via Coach Tools) */}
        {showCoachingInset && diagramKeys && diagramKeys.length > 0 && (
          <g id="diagramCoachingInset" transform="translate(40, 365)" className="select-none pointer-events-none">
            <rect x="0" y="0" width="245" height={Math.min(diagramKeys.length * 20 + 20, 100)} rx="8" fill="#ffffff" fillOpacity="0.96" stroke="#cbd5e1" strokeWidth="1.5" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
            {diagramKeys.slice(0, 4).map((k, idx) => (
              <text
                key={idx}
                x="12"
                y={18 + idx * 19}
                fontFamily="'Space Grotesk', -apple-system, sans-serif"
                fontSize="9.5"
                fontWeight={k.isHighlight ? '900' : '600'}
                fill={k.isHighlight ? '#b91c1c' : '#1e293b'}
              >
                • {k.text}
              </text>
            ))}
          </g>
        )}

        {/* 1. Zone Coverage Bubbles Layer */}
        <g id="zoneBubblesLayer">
          {zones.map((zone) => {
            const isSelected = selectedType === 'zone' && selectedId === zone.id;
            return (
              <g
                key={zone.id}
                className="cursor-move"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectElement('zone', zone.id);
                  const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                  setDragState({
                    type: 'zone-body',
                    id: zone.id,
                    offsetX: x - zone.cx,
                    offsetY: y - zone.cy,
                  });
                }}
              >
                {/* Translucent Zone Fill - Dimmed shade per user request */}
                {(() => {
                  let fillOp = 0.06;
                  if (zoneShadeMode === 'outline') {
                    fillOp = 0.01;
                  } else if (zoneShadeMode === 'soft') {
                    fillOp = Math.min((zone.opacity || 0.16) * 0.6, 0.12);
                  } else if (zoneShadeMode === 'standard') {
                    fillOp = zone.opacity || 0.20;
                  } else {
                    // Default 'dim': ultra-light, crystal-clear wash (dimmed shade)
                    fillOp = Math.max(0.04, Math.min((zone.opacity || 0.18) * 0.35, 0.07));
                  }

                  return (
                    <ellipse
                      cx={zone.cx}
                      cy={zone.cy}
                      rx={zone.rx}
                      ry={zone.ry}
                      fill={zone.color}
                      fillOpacity={fillOp}
                      stroke={zone.color}
                      strokeWidth={isSelected ? 3 : 1.8}
                      strokeDasharray="6,4"
                      filter="url(#wbMarkerGlow)"
                    />
                  );
                })()}

                {/* Perimeter Label Pill Badge: Smart collision avoidance so it NEVER collides with players */}
                {showLabels && zone.name && (
                  (() => {
                    const badgeWidth = Math.max(zone.name.length * 6.6 + 14, 40);
                    const badgeHeight = 16;

                    // Candidates for label placement around the zone boundary
                    const candidates = [
                      { x: zone.cx, y: zone.cy - zone.ry - 12, name: 'top' },
                      { x: zone.cx, y: zone.cy + zone.ry + 12, name: 'bottom' },
                      { x: zone.cx + zone.rx + badgeWidth / 2 + 10, y: zone.cy, name: 'right' },
                      { x: zone.cx - zone.rx - badgeWidth / 2 - 10, y: zone.cy, name: 'left' },
                      { x: zone.cx + zone.rx * 0.75 + badgeWidth / 2 + 4, y: zone.cy - zone.ry * 0.75 - 6, name: 'top-right' },
                      { x: zone.cx + zone.rx * 0.75 + badgeWidth / 2 + 4, y: zone.cy + zone.ry * 0.75 + 6, name: 'bottom-right' },
                    ];

                    const testCollision = (bx: number, by: number) => {
                      // Boundary check
                      if (
                        bx - badgeWidth / 2 < 20 ||
                        bx + badgeWidth / 2 > 680 ||
                        by - badgeHeight / 2 < 20 ||
                        by + badgeHeight / 2 > 480
                      ) {
                        return 9999;
                      }

                      let penalty = 0;
                      for (const t of tokens) {
                        const tTop = t.y - 18;
                        const tBottom = t.y + (t.subLabel ? 38 : 18);
                        const tLeft = t.x - 22;
                        const tRight = t.x + 22;

                        const bTop = by - badgeHeight / 2 - 4;
                        const bBottom = by + badgeHeight / 2 + 4;
                        const bLeft = bx - badgeWidth / 2 - 6;
                        const bRight = bx + badgeWidth / 2 + 6;

                        const overlaps = !(bRight < tLeft || bLeft > tRight || bBottom < tTop || bTop > tBottom);
                        if (overlaps) {
                          penalty += 1000;
                        } else {
                          const dist = Math.hypot(t.x - bx, t.y - by);
                          if (dist < 38) {
                            penalty += (38 - dist) * 10;
                          }
                        }
                      }
                      return penalty;
                    };

                    let bestCand = candidates[0];
                    let minPenalty = Infinity;

                    for (const cand of candidates) {
                      const penalty = testCollision(cand.x, cand.y);
                      if (penalty < minPenalty) {
                        minPenalty = penalty;
                        bestCand = cand;
                      }
                      if (penalty === 0) {
                        bestCand = cand;
                        break;
                      }
                    }

                    return (
                      <g transform={`translate(${bestCand.x}, ${bestCand.y})`} className="pointer-events-none select-none">
                        <rect
                          x={-badgeWidth / 2}
                          y={-8}
                          width={badgeWidth}
                          height={16}
                          rx={5}
                          fill="#ffffff"
                          fillOpacity="0.97"
                          stroke={zone.color}
                          strokeWidth="1.3"
                          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.18))"
                        />
                        <text
                          x="0"
                          y="3.5"
                          fontFamily="'Space Grotesk', -apple-system, sans-serif"
                          fontSize="9"
                          fontWeight="800"
                          textAnchor="middle"
                          fill={zone.color}
                        >
                          {zone.name}
                        </text>
                      </g>
                    );
                  })()
                )}

                {/* Resize Handle when selected */}
                {isSelected && (
                  <circle
                    cx={zone.cx + zone.rx}
                    cy={zone.cy}
                    r="7"
                    fill="#ffffff"
                    stroke={zone.color}
                    strokeWidth="2.5"
                    className="cursor-ew-resize"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDragState({
                        type: 'zone-resize',
                        id: zone.id,
                        offsetX: 0,
                        offsetY: 0,
                      });
                    }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* 2. Arrows and Lines for Blitz / Stunts / Blocks */}
        <g id="arrowsLayer">
          {arrows.map((arrow) => {
            const isSelected = selectedType === 'arrow' && selectedId === arrow.id;
            const markerColor =
              arrow.color === '#d91b24'
                ? 'arrowhead-red'
                : arrow.color === '#0052cc' || arrow.color === '#2563eb' || arrow.color === '#3b82f6'
                ? 'arrowhead-blue'
                : arrow.color === '#058538' || arrow.color === '#16a34a'
                ? 'arrowhead-green'
                : arrow.color === '#e06c00' || arrow.color === '#ea580c'
                ? 'arrowhead-orange'
                : arrow.color === '#7c3aed' || arrow.color === '#8b5cf6' || arrow.dashed || arrow.type === 'drop'
                ? 'arrowhead-purple'
                : 'arrowhead-black';

            let pathD = '';
            if (arrow.type === 'curved' && arrow.controlX !== undefined && arrow.controlY !== undefined) {
              pathD = `M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`;
            } else if (arrow.type === 'blitz') {
              // Blitz arrow can have a dynamic lightning angle or curved path
              const midX = (arrow.startX + arrow.endX) / 2 + (arrow.controlX ? arrow.controlX - arrow.startX : 0);
              const midY = (arrow.startY + arrow.endY) / 2 + (arrow.controlY ? arrow.controlY - arrow.startY : 0);
              pathD = `M ${arrow.startX} ${arrow.startY} Q ${midX} ${midY} ${arrow.endX} ${arrow.endY}`;
            } else {
              pathD = `M ${arrow.startX} ${arrow.startY} L ${arrow.endX} ${arrow.endY}`;
            }

            const markerEnd =
              arrow.type === 'block'
                ? 'url(#t-bar-end)'
                : `url(#${markerColor})`;

            return (
              <g key={arrow.id}>
                {/* Thick invisible hit area for easy selection/drag */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-move"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelectElement('arrow', arrow.id);
                    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                    setDragState({
                      type: 'arrow-whole',
                      id: arrow.id,
                      offsetX: 0,
                      offsetY: 0,
                      initialData: {
                        mouseX: x,
                        mouseY: y,
                        startX: arrow.startX,
                        startY: arrow.startY,
                        endX: arrow.endX,
                        endY: arrow.endY,
                        controlX: arrow.controlX,
                        controlY: arrow.controlY,
                      },
                    });
                  }}
                />

                {/* Visible Line / Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arrow.color}
                  strokeWidth={isSelected ? 4 : 3}
                  strokeDasharray={arrow.dashed || arrow.type === 'drop' ? '6,4' : undefined}
                  markerEnd={markerEnd}
                  filter="url(#wbMarkerGlow)"
                  className="pointer-events-none"
                />

                {/* Label if present: High contrast pill badge with intelligent collision avoidance */}
                {showLabels && arrow.label && (
                  (() => {
                    const isCurved = arrow.controlX !== undefined && arrow.controlY !== undefined;
                    const midX = isCurved
                      ? (arrow.startX + (arrow.controlX || arrow.startX) * 2 + arrow.endX) / 4
                      : (arrow.startX + arrow.endX) / 2;
                    const midY = isCurved
                      ? (arrow.startY + (arrow.controlY || arrow.startY) * 2 + arrow.endY) / 4
                      : (arrow.startY + arrow.endY) / 2;
                    
                    const arrowIdx = arrows.indexOf(arrow);
                    const dx = arrow.endX - arrow.startX;
                    const dy = arrow.endY - arrow.startY;
                    const isPredominantlyVertical = Math.abs(dy) > Math.abs(dx);
                    const badgeWidth = Math.max(arrow.label.length * 6.4 + 14, 34);

                    // Alternate preference based on index so adjacent arrows naturally stagger
                    const altSign = arrowIdx % 2 === 0 ? 1 : -1;

                    // Candidate positions for the label badge
                    const candidatePositions = isPredominantlyVertical
                      ? [
                          { x: midX + 38 * altSign, y: midY },
                          { x: midX - 38 * altSign, y: midY },
                          { x: midX + 50 * altSign, y: midY + 8 * altSign },
                          { x: midX - 50 * altSign, y: midY - 8 * altSign },
                          { x: midX, y: midY + 18 },
                          { x: midX, y: midY - 18 },
                        ]
                      : [
                          { x: midX, y: midY - 16 * altSign },
                          { x: midX, y: midY + 16 * altSign },
                          { x: midX + 28, y: midY - 16 },
                          { x: midX - 28, y: midY - 16 },
                          { x: midX + 36 * altSign, y: midY },
                        ];

                    let bestPos = candidatePositions[0];
                    let maxClearance = -1;

                    for (const pos of candidatePositions) {
                      // Boundary check
                      if (
                        pos.x - badgeWidth / 2 < 20 ||
                        pos.x + badgeWidth / 2 > 680 ||
                        pos.y < 20 ||
                        pos.y > 480
                      ) {
                        continue;
                      }

                      // Find minimum distance to any token center
                      const minTokenDist = tokens.reduce((minD, t) => {
                        return Math.min(minD, Math.hypot(t.x - pos.x, t.y - pos.y));
                      }, 9999);

                      // Distance to other arrows' midpoints to prevent arrow-on-arrow label collisions
                      const minArrowDist = arrows.reduce((minD, otherA) => {
                        if (otherA.id === arrow.id) return minD;
                        const otherMidX = (otherA.startX + otherA.endX) / 2;
                        const otherMidY = (otherA.startY + otherA.endY) / 2;
                        return Math.min(minD, Math.hypot(otherMidX - pos.x, otherMidY - pos.y));
                      }, 9999);

                      const combinedClearance = Math.min(minTokenDist, minArrowDist * 0.9);

                      if (combinedClearance > maxClearance) {
                        maxClearance = combinedClearance;
                        bestPos = pos;
                      }
                      if (combinedClearance > 42) {
                        bestPos = pos;
                        break;
                      }
                    }

                    return (
                      <g transform={`translate(${bestPos.x}, ${bestPos.y})`} className="pointer-events-none select-none">
                        <rect
                          x={-badgeWidth / 2}
                          y={-8}
                          width={badgeWidth}
                          height={16}
                          rx={5}
                          fill="#ffffff"
                          fillOpacity="0.97"
                          stroke={arrow.color}
                          strokeWidth="1.2"
                          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.18))"
                        />
                        <text
                          x={0}
                          y={3.5}
                          fontFamily="'Space Grotesk', -apple-system, sans-serif"
                          fontSize="9"
                          fontWeight="800"
                          textAnchor="middle"
                          fill={arrow.color}
                        >
                          {arrow.label}
                        </text>
                      </g>
                    );
                  })()
                )}

                {/* Handles when selected */}
                {isSelected && (
                  <>
                    {/* Start Handle */}
                    <circle
                      cx={arrow.startX}
                      cy={arrow.startY}
                      r="6"
                      fill="#ffffff"
                      stroke={arrow.color}
                      strokeWidth="2.5"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'arrow-start',
                          id: arrow.id,
                          offsetX: 0,
                          offsetY: 0,
                        });
                      }}
                    />

                    {/* End Handle */}
                    <circle
                      cx={arrow.endX}
                      cy={arrow.endY}
                      r="6"
                      fill="#ffffff"
                      stroke={arrow.color}
                      strokeWidth="2.5"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'arrow-end',
                          id: arrow.id,
                          offsetX: 0,
                          offsetY: 0,
                        });
                      }}
                    />

                    {/* Curve / Control Handle */}
                    <circle
                      cx={
                        arrow.controlX !== undefined
                          ? arrow.controlX
                          : (arrow.startX + arrow.endX) / 2
                      }
                      cy={
                        arrow.controlY !== undefined
                          ? arrow.controlY
                          : (arrow.startY + arrow.endY) / 2 - 20
                      }
                      r="5"
                      fill="#fef08a"
                      stroke="#ca8a04"
                      strokeWidth="2"
                      className="cursor-crosshair"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'arrow-control',
                          id: arrow.id,
                          offsetX: 0,
                          offsetY: 0,
                        });
                      }}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* 3. X's and O's (Tokens) Layer */}
        <g id="tokensLayer">
          {tokens.map((token) => {
            const isSelected = selectedType === 'token' && selectedId === token.id;

            return (
              <g
                key={token.id}
                transform={`translate(${token.x}, ${token.y})`}
                className="cursor-grab active:cursor-grabbing select-none"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectElement('token', token.id);
                  const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                  setDragState({
                    type: 'token',
                    id: token.id,
                    offsetX: x - token.x,
                    offsetY: y - token.y,
                  });
                }}
              >
                {/* Selected Indicator Ring */}
                {isSelected && (
                  <circle cx="0" cy="0" r="23" fill="none" stroke="#e06c00" strokeWidth="2" strokeDasharray="4,3" />
                )}

                {/* Token Render by Type */}
                {token.type === 'square' || token.isSquare || (token.type === 'O' && token.label === 'C') ? (
                  // Center / Square Token (as seen in playbook)
                  <g>
                    <rect
                      x="-15"
                      y="-15"
                      width="30"
                      height="30"
                      rx="2"
                      fill="#ffffff"
                      stroke={token.color || '#1a1a24'}
                      strokeWidth="2.8"
                      filter="url(#wbMarkerGlow)"
                    />
                    <text
                      x="0"
                      y="5"
                      fontFamily="'Space Grotesk', sans-serif"
                      fontSize="13"
                      fontWeight="900"
                      textAnchor="middle"
                      fill={token.color || '#1a1a24'}
                      className="pointer-events-none"
                    >
                      {token.label || 'C'}
                    </text>
                  </g>
                ) : token.type === 'letter' ? (
                  // Direct Bold Letter Token (M, W, S, R, C, FS) with solid backing disc
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="#ffffff"
                      stroke={token.color || '#0f172a'}
                      strokeWidth="2.8"
                      filter="url(#wbMarkerGlow)"
                    />
                    <text
                      x="0"
                      y="5.5"
                      fontFamily="'Space Grotesk', -apple-system, sans-serif"
                      fontSize={token.label.length > 2 ? '11' : token.label.length === 2 ? '13' : '16'}
                      fontWeight="900"
                      textAnchor="middle"
                      fill={token.color || '#0f172a'}
                      className="pointer-events-none select-none"
                    >
                      {token.label}
                    </text>
                  </g>
                ) : token.type === 'O' ? (
                  // Offensive O Token or Linemen Circle with Technique Number
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="#ffffff"
                      stroke={token.color || '#1a1a24'}
                      strokeWidth="2.8"
                      filter="url(#wbMarkerGlow)"
                    />
                    {token.label.trim() && (
                      <text
                        x="0"
                        y="5"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontSize={token.label.length > 2 ? '10' : '12'}
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={token.color || '#1a1a24'}
                        className="pointer-events-none"
                      >
                        {token.label}
                      </text>
                    )}
                  </g>
                ) : token.type === 'X' ? (
                  // Defensive Token: Position label inside circle, or X
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill={token.color || '#0052cc'}
                      stroke="#1a1a24"
                      strokeWidth="2.5"
                      filter="url(#wbMarkerGlow)"
                    />
                    {token.label && token.label !== 'X' ? (
                      <text
                        x="0"
                        y="5"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontSize={token.label.length > 2 ? '10' : '12'}
                        fontWeight="900"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="pointer-events-none select-none"
                      >
                        {token.label}
                      </text>
                    ) : (
                      <>
                        {/* Inner Whiteboard X lines */}
                        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="6" y1="-6" x2="-6" y2="6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                      </>
                    )}
                  </g>
                ) : token.type === 'ball' ? (
                  // Football / Coach Token
                  <g>
                    <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#1a1a24" strokeWidth="2.5" />
                    <text x="0" y="5" fontFamily="'Permanent Marker'" fontSize="10" textAnchor="middle" fill="#1a1a24">
                      {token.label}
                    </text>
                    <line x1="0" y1="0" x2="-60" y2="50" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx="-60" cy="50" rx="12" ry="8" fill="#92400e" stroke="#451a03" strokeWidth="2" transform="rotate(-30 -60 50)" />
                    <line x1="-65" y1="50" x2="-55" y2="50" stroke="#fff" strokeWidth="1.5" transform="rotate(-30 -60 50)" />
                  </g>
                ) : token.type === 'bag' ? (
                  // Agile Bag / Dummy
                  <g>
                    <rect x="-18" y="-32" width="36" height="64" rx="12" fill={token.color || '#ef4444'} stroke="#991b1b" strokeWidth="2.5" />
                    <text x="0" y="4" fontFamily="'Permanent Marker'" fontSize="10" textAnchor="middle" fill="#fff">
                      {token.label}
                    </text>
                  </g>
                ) : (
                  // Cone / Pylon
                  <g>
                    <polygon points="0,-14 10,10 -10,10" fill={token.color || '#f97316'} stroke="#c2410c" strokeWidth="2" />
                    <text x="14" y="4" fontFamily="'Architects Daughter'" fontSize="11" fill="#c2410c">
                      {token.label}
                    </text>
                  </g>
                )}

                {/* SubLabel pill badge with drop shadow: intelligent placement prevents collision with teammates below */}
                {showLabels && token.subLabel && (
                  (() => {
                    const hasTokenDirectlyBelow = tokens.some(
                      (other) =>
                        other.id !== token.id &&
                        Math.abs(other.x - token.x) < 34 &&
                        other.y > token.y &&
                        other.y < token.y + 54
                    );
                    const subLabelY = hasTokenDirectlyBelow ? -26 : 27;
                    const pillWidth = Math.max(token.subLabel.length * 6.2 + 12, 28);

                    return (
                      <g transform={`translate(0, ${subLabelY})`} className="pointer-events-none select-none">
                        <rect
                          x={-pillWidth / 2}
                          y={-8}
                          width={pillWidth}
                          height={16}
                          rx={5}
                          fill="#ffffff"
                          fillOpacity="0.98"
                          stroke="#cbd5e1"
                          strokeWidth="1.2"
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.14))"
                        />
                        <text
                          x="0"
                          y="3.5"
                          fontFamily="'Space Grotesk', sans-serif"
                          fontSize="9"
                          fontWeight="800"
                          textAnchor="middle"
                          fill="#0f172a"
                        >
                          {token.subLabel}
                        </text>
                      </g>
                    );
                  })()
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
