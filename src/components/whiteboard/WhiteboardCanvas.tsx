import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardToken, WhiteboardArrow, WhiteboardZoneBubble, WhiteboardTextElement } from '../../types';
import { Trash2, Edit2, Move, Type, Plus, Check, X } from 'lucide-react';

interface WhiteboardCanvasProps {
  tokens: WhiteboardToken[];
  arrows: WhiteboardArrow[];
  zones: WhiteboardZoneBubble[];
  textElements?: WhiteboardTextElement[];
  isDrawingMode: boolean;
  penColor: string;
  penWidth: number;
  stampMode: 'none' | 'O' | 'X' | 'letter' | 'blitz' | 'zone' | 'text' | 'square';
  stampLabel: string;
  onUpdateTokens: (tokens: WhiteboardToken[]) => void;
  onUpdateArrows: (arrows: WhiteboardArrow[]) => void;
  onUpdateZones: (zones: WhiteboardZoneBubble[]) => void;
  onUpdateTextElements?: (texts: WhiteboardTextElement[]) => void;
  onSelectElement: (type: 'token' | 'arrow' | 'zone' | 'text' | null, id: string | null) => void;
  selectedId: string | null;
  selectedType: 'token' | 'arrow' | 'zone' | 'text' | null;
  sketchPadRef: React.RefObject<HTMLCanvasElement | null>;
  diagramKeys?: { text: string; isHighlight?: boolean }[];
  showCoachingInset?: boolean;
  showLabels?: boolean;
  zoneShadeMode?: 'dim' | 'soft' | 'outline' | 'standard';
  fieldTheme?: 'professional_hudl' | 'classic_chalk' | 'grass';
  readOnly?: boolean;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  tokens,
  arrows,
  zones,
  textElements = [],
  isDrawingMode,
  penColor,
  penWidth,
  stampMode,
  stampLabel,
  onUpdateTokens,
  onUpdateArrows,
  onUpdateZones,
  onUpdateTextElements,
  onSelectElement,
  selectedId,
  selectedType,
  sketchPadRef,
  diagramKeys,
  showCoachingInset = false,
  showLabels = true,
  zoneShadeMode = 'dim',
  readOnly = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Editing text inline
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');

  // Dragging state supporting tokens, text elements, arrow parts, and zone parts
  const [dragState, setDragState] = useState<{
    type:
      | 'token'
      | 'text'
      | 'arrow-start'
      | 'arrow-end'
      | 'arrow-control'
      | 'arrow-whole'
      | 'arrow-label'
      | 'zone-body'
      | 'zone-resize'
      | 'zone-label';
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
        x: Math.round(Math.max(10, Math.min(690, svgP.x))),
        y: Math.round(Math.max(10, Math.min(490, svgP.y))),
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
    if (!isDrawingMode || !sketchPadRef.current || readOnly) return;
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
    if (!isDrawing || !isDrawingMode || !sketchPadRef.current || readOnly) return;
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
    if (!isDrawingMode || !sketchPadRef.current || e.touches.length === 0 || readOnly) return;
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
    if (!isDrawing || !isDrawingMode || !sketchPadRef.current || e.touches.length === 0 || readOnly) return;
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
    if (isDrawingMode || readOnly) return;
    if (stampMode === 'none') {
      // Deselect if clicking on empty field background
      if (e.target === svgRef.current || (e.target as HTMLElement).id === 'fieldBackground') {
        onSelectElement(null, null);
        setEditingTextId(null);
      }
      return;
    }

    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    if (stampMode === 'O') {
      const newToken: WhiteboardToken = {
        id: `o-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'O',
        label: stampLabel || '',
        x,
        y,
        color: '#0f172a',
      };
      onUpdateTokens([...tokens, newToken]);
      onSelectElement('token', newToken.id);
    } else if (stampMode === 'square') {
      const newToken: WhiteboardToken = {
        id: `sq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'square',
        label: stampLabel || 'C',
        x,
        y,
        color: '#0f172a',
        isSquare: true,
      };
      onUpdateTokens([...tokens, newToken]);
      onSelectElement('token', newToken.id);
    } else if (stampMode === 'letter' || stampMode === 'X') {
      const newToken: WhiteboardToken = {
        id: `def-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'letter',
        label: stampLabel || 'M',
        x,
        y,
        color: '#0f172a',
      };
      onUpdateTokens([...tokens, newToken]);
      onSelectElement('token', newToken.id);
    } else if (stampMode === 'text') {
      const newText: WhiteboardTextElement = {
        id: `txt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: stampLabel || 'Coaching Note',
        x,
        y,
        fontSize: 11,
        color: '#0f172a',
        fontWeight: '700',
        align: 'left',
      };
      if (onUpdateTextElements) {
        onUpdateTextElements([...textElements, newText]);
      }
      onSelectElement('text', newText.id);
    } else if (stampMode === 'blitz') {
      const newArrow: WhiteboardArrow = {
        id: `arrow-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'blitz',
        startX: x,
        startY: y,
        endX: x,
        endY: Math.max(40, y - 70),
        color: '#0f172a',
        label: stampLabel || '',
      };
      onUpdateArrows([...arrows, newArrow]);
      onSelectElement('arrow', newArrow.id);
    } else if (stampMode === 'zone') {
      const newZone: WhiteboardZoneBubble = {
        id: `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: stampLabel || 'DEEP 1/3',
        cx: x,
        cy: y,
        rx: 75,
        ry: 35,
        color: '#0284c7',
        opacity: 0.18,
      };
      onUpdateZones([...zones, newZone]);
      onSelectElement('zone', newZone.id);
    }
  };

  // Pointer move during drag
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState || readOnly) return;

    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    if (dragState.type === 'token') {
      onUpdateTokens(
        tokens.map((t) =>
          t.id === dragState.id
            ? { ...t, x: Math.round(x - dragState.offsetX), y: Math.round(y - dragState.offsetY) }
            : t
        )
      );
    } else if (dragState.type === 'text') {
      if (onUpdateTextElements) {
        onUpdateTextElements(
          textElements.map((txt) =>
            txt.id === dragState.id
              ? { ...txt, x: Math.round(x - dragState.offsetX), y: Math.round(y - dragState.offsetY) }
              : txt
          )
        );
      }
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
    } else if (dragState.type === 'arrow-label') {
      onUpdateArrows(
        arrows.map((a) => (a.id === dragState.id ? { ...a, labelX: x, labelY: y } : a))
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
            labelX: a.labelX !== undefined ? Math.round(init.labelX + dx) : undefined,
            labelY: a.labelY !== undefined ? Math.round(init.labelY + dy) : undefined,
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
    } else if (dragState.type === 'zone-label') {
      onUpdateZones(
        zones.map((z) => (z.id === dragState.id ? { ...z, labelX: x, labelY: y } : z))
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

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    if (selectedType === 'token') {
      onUpdateTokens(tokens.filter((t) => t.id !== selectedId));
    } else if (selectedType === 'arrow') {
      onUpdateArrows(arrows.filter((a) => a.id !== selectedId));
    } else if (selectedType === 'zone') {
      onUpdateZones(zones.filter((z) => z.id !== selectedId));
    } else if (selectedType === 'text' && onUpdateTextElements) {
      onUpdateTextElements(textElements.filter((txt) => txt.id !== selectedId));
    }
    onSelectElement(null, null);
  };

  // Save edited text
  const handleSaveTextEdit = () => {
    if (!editingTextId || !onUpdateTextElements) return;
    onUpdateTextElements(
      textElements.map((txt) => (txt.id === editingTextId ? { ...txt, text: editingTextValue } : txt))
    );
    setEditingTextId(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] select-none overflow-hidden bg-slate-50 rounded-xl shadow-inner border border-slate-300"
      style={{
        background: '#ffffff',
      }}
    >
      {/* Floating Action Controls on Canvas for Selected Item */}
      {selectedId && !readOnly && !isDrawingMode && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm border border-slate-700 text-xs animate-in fade-in">
          <span className="font-semibold text-slate-300 capitalize text-[11px] mr-1">
            {selectedType}:
          </span>
          {selectedType === 'text' && (
            <button
              onClick={() => {
                const targetText = textElements.find((t) => t.id === selectedId);
                if (targetText) {
                  setEditingTextId(targetText.id);
                  setEditingTextValue(targetText.text);
                }
              }}
              title="Edit text content"
              className="p-1 rounded hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDeleteSelected}
            title="Delete element"
            className="p-1 rounded hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* Main Professional Football Field SVG Layer */}
      <svg
        ref={svgRef}
        viewBox="0 0 700 500"
        className="w-full h-full block relative z-10"
        onClick={handleSvgClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <filter id="wbMarkerGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="0.2" result="blur" />
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f172a" />
          </marker>
          <marker id="arrowhead-orange" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#e06c00" />
          </marker>
          <marker id="arrowhead-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
          </marker>

          {/* Blocker T-Bar */}
          <marker id="t-bar-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <line x1="5" y1="0" x2="5" y2="10" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
          </marker>
        </defs>

        {/* Clickable field background */}
        <rect id="fieldBackground" x="0" y="0" width="700" height="500" fill="#ffffff" />

        {/* Professional Football Field Markings - Grid Lines, Hashes & Numbers */}
        <g id="fieldLines" className="select-none pointer-events-none">
          {/* Subtle Outer Boundary Box */}
          <rect x="25" y="20" width="650" height="460" rx="4" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Subtle 5-yard grid lines */}
          <line x1="25" y1="60" x2="675" y2="60" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="25" y1="100" x2="675" y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="25" y1="140" x2="675" y2="140" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="25" y1="180" x2="675" y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

          {/* Blue Line of Scrimmage (LOS) at y: 200 */}
          <line x1="25" y1="200" x2="675" y2="200" stroke="#2563eb" strokeWidth="2.5" />

          {/* Defensive Backfield Yard Lines */}
          <line x1="25" y1="240" x2="675" y2="240" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="25" y1="280" x2="675" y2="280" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="25" y1="320" x2="675" y2="320" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="25" y1="360" x2="675" y2="360" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="25" y1="400" x2="675" y2="400" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="25" y1="440" x2="675" y2="440" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

          {/* Hash Marks Columns - Left and Right Hashes across the field */}
          <line x1="270" y1="25" x2="270" y2="475" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,7" />
          <line x1="430" y1="25" x2="430" y2="475" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,7" />

          {/* Sideline Hash Ticks */}
          {[40, 60, 80, 100, 120, 140, 160, 180, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460].map(
            (yVal) => (
              <g key={`hash-${yVal}`}>
                <line x1="25" y1={yVal} x2="33" y2={yVal} stroke="#94a3b8" strokeWidth="1" />
                <line x1="667" y1={yVal} x2="675" y2={yVal} stroke="#94a3b8" strokeWidth="1" />
                <line x1="266" y1={yVal} x2="274" y2={yVal} stroke="#cbd5e1" strokeWidth="1" />
                <line x1="426" y1={yVal} x2="434" y2={yVal} stroke="#cbd5e1" strokeWidth="1" />
              </g>
            )
          )}

          {/* Authentic College/Pro Sideline Numbers (Watermarked) */}
          <g transform="translate(642, 100) rotate(90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              10
            </text>
          </g>
          <g transform="translate(58, 100) rotate(-90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              10
            </text>
          </g>

          <g transform="translate(642, 280) rotate(90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              10
            </text>
          </g>
          <g transform="translate(58, 280) rotate(-90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              10
            </text>
          </g>

          <g transform="translate(642, 360) rotate(90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              20
            </text>
          </g>
          <g transform="translate(58, 360) rotate(-90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              20
            </text>
          </g>

          <g transform="translate(642, 440) rotate(90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              30
            </text>
          </g>
          <g transform="translate(58, 440) rotate(-90)" opacity="0.35">
            <text fontFamily="'Space Grotesk', sans-serif" fontSize="18" fontWeight="800" fill="#64748b" textAnchor="middle">
              30
            </text>
          </g>

          {/* High-Contrast LOS Badges */}
          <g>
            <rect x="25" y="189" width="34" height="22" rx="4" fill="#2563eb" />
            <text x="42" y="204" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="900" fill="#ffffff" textAnchor="middle">
              LOS
            </text>
          </g>
          <g>
            <rect x="641" y="189" width="34" height="22" rx="4" fill="#2563eb" />
            <text x="658" y="204" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="900" fill="#ffffff" textAnchor="middle">
              LOS
            </text>
          </g>
        </g>

        {/* 1. Zone Coverage Bubbles Layer */}
        <g id="zoneBubblesLayer">
          {zones.map((zone) => {
            const isSelected = selectedType === 'zone' && selectedId === zone.id;
            const labelX = zone.labelX !== undefined ? zone.labelX : zone.cx;
            const labelY = zone.labelY !== undefined ? zone.labelY : zone.cy - zone.ry - 12;

            return (
              <g key={zone.id}>
                {/* Main Zone Ellipse */}
                <ellipse
                  cx={zone.cx}
                  cy={zone.cy}
                  rx={zone.rx}
                  ry={zone.ry}
                  fill={zone.color}
                  fillOpacity={zoneShadeMode === 'outline' ? 0.04 : zone.opacity || 0.18}
                  stroke={zone.color}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray="6,4"
                  className={readOnly ? 'pointer-events-none' : 'cursor-move'}
                  onPointerDown={(e) => {
                    if (readOnly) return;
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
                />

                {/* Movable Zone Label Badge */}
                {showLabels && zone.name && (
                  <g
                    transform={`translate(${labelX}, ${labelY})`}
                    className={readOnly ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing select-none'}
                    onPointerDown={(e) => {
                      if (readOnly) return;
                      e.stopPropagation();
                      onSelectElement('zone', zone.id);
                      const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                      setDragState({
                        type: 'zone-label',
                        id: zone.id,
                        offsetX: x - labelX,
                        offsetY: y - labelY,
                      });
                    }}
                  >
                    <rect
                      x={-(zone.name.length * 4.5 + 10)}
                      y="-10"
                      width={zone.name.length * 9 + 20}
                      height="20"
                      rx="6"
                      fill="#ffffff"
                      stroke={zone.color}
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
                    />
                    <text
                      x="0"
                      y="4"
                      fontFamily="'Space Grotesk', sans-serif"
                      fontSize="9.5"
                      fontWeight="800"
                      textAnchor="middle"
                      fill={zone.color}
                    >
                      {zone.name}
                    </text>
                  </g>
                )}

                {/* Resize Handle when selected */}
                {isSelected && !readOnly && (
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

        {/* 2. Arrows Layer (Blitz / Stunts / Scrapes) */}
        <g id="arrowsLayer">
          {arrows.map((arrow) => {
            const isSelected = selectedType === 'arrow' && selectedId === arrow.id;
            const markerColor =
              arrow.color === '#d91b24' || arrow.color === '#dc2626'
                ? 'arrowhead-red'
                : arrow.color === '#0052cc' || arrow.color === '#2563eb' || arrow.color === '#3b82f6'
                ? 'arrowhead-blue'
                : arrow.color === '#058538' || arrow.color === '#16a34a'
                ? 'arrowhead-green'
                : arrow.color === '#e06c00' || arrow.color === '#ea580c'
                ? 'arrowhead-orange'
                : arrow.color === '#7c3aed' || arrow.color === '#8b5cf6' || arrow.dashed
                ? 'arrowhead-purple'
                : 'arrowhead-black';

            let pathD = '';
            if (arrow.type === 'curved' && arrow.controlX !== undefined && arrow.controlY !== undefined) {
              pathD = `M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`;
            } else if (arrow.type === 'blitz') {
              const midX = (arrow.startX + arrow.endX) / 2 + (arrow.controlX ? arrow.controlX - arrow.startX : 0);
              const midY = (arrow.startY + arrow.endY) / 2 + (arrow.controlY ? arrow.controlY - arrow.startY : 0);
              pathD = `M ${arrow.startX} ${arrow.startY} Q ${midX} ${midY} ${arrow.endX} ${arrow.endY}`;
            } else {
              pathD = `M ${arrow.startX} ${arrow.startY} L ${arrow.endX} ${arrow.endY}`;
            }

            const markerEnd = arrow.type === 'block' ? 'url(#t-bar-end)' : `url(#${markerColor})`;

            // Calculate label coordinates (movable)
            const defaultLabelX =
              arrow.type === 'curved' && arrow.controlX !== undefined
                ? (arrow.startX + arrow.controlX * 2 + arrow.endX) / 4
                : (arrow.startX + arrow.endX) / 2;
            const defaultLabelY =
              arrow.type === 'curved' && arrow.controlY !== undefined
                ? (arrow.startY + arrow.controlY * 2 + arrow.endY) / 4
                : (arrow.startY + arrow.endY) / 2 - 12;

            const labelX = arrow.labelX !== undefined ? arrow.labelX : defaultLabelX;
            const labelY = arrow.labelY !== undefined ? arrow.labelY : defaultLabelY;

            return (
              <g key={arrow.id}>
                {/* Thick hit area for easy drag of the whole arrow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  className={readOnly ? 'pointer-events-none' : 'cursor-move'}
                  onPointerDown={(e) => {
                    if (readOnly) return;
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
                        labelX: arrow.labelX,
                        labelY: arrow.labelY,
                      },
                    });
                  }}
                />

                {/* Visible Arrow Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arrow.color || '#0f172a'}
                  strokeWidth={isSelected ? 3.8 : 2.8}
                  strokeDasharray={arrow.dashed || arrow.type === 'drop' ? '6,4' : undefined}
                  markerEnd={markerEnd}
                  className="pointer-events-none"
                />

                {/* Movable Arrow Label */}
                {showLabels && arrow.label && (
                  <g
                    transform={`translate(${labelX}, ${labelY})`}
                    className={readOnly ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing select-none'}
                    onPointerDown={(e) => {
                      if (readOnly) return;
                      e.stopPropagation();
                      onSelectElement('arrow', arrow.id);
                      const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                      setDragState({
                        type: 'arrow-label',
                        id: arrow.id,
                        offsetX: x - labelX,
                        offsetY: y - labelY,
                      });
                    }}
                  >
                    <rect
                      x={-(arrow.label.length * 4 + 8)}
                      y="-9"
                      width={arrow.label.length * 8 + 16}
                      height="18"
                      rx="5"
                      fill="#ffffff"
                      stroke={arrow.color || '#0f172a'}
                      strokeWidth="1.2"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.18))"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fontFamily="'Space Grotesk', sans-serif"
                      fontSize="9"
                      fontWeight="800"
                      textAnchor="middle"
                      fill={arrow.color || '#0f172a'}
                    >
                      {arrow.label}
                    </text>
                  </g>
                )}

                {/* Interactive Endpoint Handles when Selected */}
                {isSelected && !readOnly && (
                  <>
                    <circle
                      cx={arrow.startX}
                      cy={arrow.startY}
                      r="6.5"
                      fill="#ffffff"
                      stroke={arrow.color || '#0f172a'}
                      strokeWidth="2.5"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({ type: 'arrow-start', id: arrow.id, offsetX: 0, offsetY: 0 });
                      }}
                    />
                    <circle
                      cx={arrow.endX}
                      cy={arrow.endY}
                      r="6.5"
                      fill="#ffffff"
                      stroke={arrow.color || '#0f172a'}
                      strokeWidth="2.5"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({ type: 'arrow-end', id: arrow.id, offsetX: 0, offsetY: 0 });
                      }}
                    />
                    <circle
                      cx={arrow.controlX !== undefined ? arrow.controlX : (arrow.startX + arrow.endX) / 2}
                      cy={arrow.controlY !== undefined ? arrow.controlY : (arrow.startY + arrow.endY) / 2 - 20}
                      r="5.5"
                      fill="#fef08a"
                      stroke="#ca8a04"
                      strokeWidth="2"
                      className="cursor-crosshair"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragState({ type: 'arrow-control', id: arrow.id, offsetX: 0, offsetY: 0 });
                      }}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* 3. Player Tokens & Symbols Layer (Offense, Defense, Linemen, Backs) */}
        <g id="tokensLayer">
          {tokens.map((token) => {
            const isSelected = selectedType === 'token' && selectedId === token.id;

            return (
              <g
                key={token.id}
                transform={`translate(${token.x}, ${token.y})`}
                className={readOnly ? 'pointer-events-none select-none' : 'cursor-grab active:cursor-grabbing select-none'}
                onPointerDown={(e) => {
                  if (readOnly) return;
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
                {/* Selected Halo Ring */}
                {isSelected && (
                  <circle cx="0" cy="0" r="21" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4,3" />
                )}

                {/* Token Render by Football Archetype */}
                {token.type === 'square' || token.isSquare || (token.type === 'O' && token.label === 'C') ? (
                  // Offensive Center: Crisp Square right on the LOS
                  <g>
                    <rect
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      rx="3"
                      fill="#ffffff"
                      stroke={token.color || '#0f172a'}
                      strokeWidth="2.6"
                      filter="url(#wbMarkerGlow)"
                    />
                    <text
                      x="0"
                      y="5"
                      fontFamily="'Space Grotesk', -apple-system, sans-serif"
                      fontSize="13"
                      fontWeight="900"
                      textAnchor="middle"
                      fill={token.color || '#0f172a'}
                      className="pointer-events-none"
                    >
                      {token.label || 'C'}
                    </text>
                  </g>
                ) : token.type === 'letter' ? (
                  // Defensive Player Tokens: Crisp Bold Typography (E9, T3, T1, E5, S, M, W, R, C, FS)
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
                      fontSize={token.label.length > 2 ? '11' : token.label.length === 2 ? '13' : '15'}
                      fontWeight="900"
                      textAnchor="middle"
                      fill={token.color || '#0f172a'}
                      className="pointer-events-none select-none"
                    >
                      {token.label}
                    </text>
                  </g>
                ) : token.type === 'O' ? (
                  // Offensive Players / Linemen Circles
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
                    {token.label && token.label.trim() && (
                      <text
                        x="0"
                        y="5"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontSize={token.label.length > 2 ? '10' : '12'}
                        fontWeight="900"
                        textAnchor="middle"
                        fill={token.color || '#0f172a'}
                        className="pointer-events-none"
                      >
                        {token.label}
                      </text>
                    )}
                  </g>
                ) : token.type === 'X' ? (
                  // X Token
                  <g>
                    <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
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
                        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
                        <line x1="6" y1="-6" x2="-6" y2="6" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
                      </>
                    )}
                  </g>
                ) : token.type === 'ball' ? (
                  // Football / Coach Token
                  <g>
                    <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
                    <text x="0" y="5" fontFamily="'Space Grotesk', sans-serif" fontSize="10" textAnchor="middle" fill="#0f172a">
                      {token.label}
                    </text>
                    <line x1="0" y1="0" x2="-45" y2="35" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx="-45" cy="35" rx="11" ry="7" fill="#92400e" stroke="#451a03" strokeWidth="1.8" transform="rotate(-30 -45 35)" />
                  </g>
                ) : token.type === 'bag' ? (
                  // Agile Dummy / Bag
                  <g>
                    <rect x="-16" y="-28" width="32" height="56" rx="10" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
                    <text x="0" y="4" fontFamily="'Space Grotesk', sans-serif" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">
                      {token.label}
                    </text>
                  </g>
                ) : (
                  // Cone / Pylon
                  <g>
                    <polygon points="0,-14 10,10 -10,10" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
                    <text x="14" y="4" fontFamily="'Space Grotesk', sans-serif" fontSize="11" fill="#c2410c" fontWeight="bold">
                      {token.label}
                    </text>
                  </g>
                )}

                {/* SubLabel pill badge */}
                {showLabels && token.subLabel && (
                  <g transform="translate(0, 27)" className="pointer-events-none select-none">
                    <rect
                      x={-(token.subLabel.length * 3.5 + 8)}
                      y="-8"
                      width={token.subLabel.length * 7 + 16}
                      height="16"
                      rx="5"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
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
                )}
              </g>
            );
          })}
        </g>

        {/* 4. MOVABLE TEXT & COACHING NOTES LAYER (Critical User Requirement) */}
        <g id="textElementsLayer">
          {textElements.map((txt) => {
            const isSelected = selectedType === 'text' && selectedId === txt.id;
            const isEditing = editingTextId === txt.id;
            const lines = txt.text.split('\n');
            const fontSize = txt.fontSize || 11;
            const lineHeight = fontSize * 1.35;
            const longestLineLength = Math.max(...lines.map((l) => l.length), 10);
            const boxWidth = Math.max(longestLineLength * (fontSize * 0.58) + 16, 80);
            const boxHeight = lines.length * lineHeight + 12;

            return (
              <g
                key={txt.id}
                transform={`translate(${txt.x}, ${txt.y})`}
                className={readOnly ? 'pointer-events-none select-none' : 'cursor-grab active:cursor-grabbing select-none'}
                onPointerDown={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  onSelectElement('text', txt.id);
                  const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
                  setDragState({
                    type: 'text',
                    id: txt.id,
                    offsetX: x - txt.x,
                    offsetY: y - txt.y,
                  });
                }}
                onDoubleClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  setEditingTextId(txt.id);
                  setEditingTextValue(txt.text);
                }}
              >
                {/* Subtle Box Background with crisp border */}
                <rect
                  x="-6"
                  y="-4"
                  width={boxWidth}
                  height={boxHeight}
                  rx="6"
                  fill={isSelected ? '#eff6ff' : txt.backgroundColor || '#ffffff'}
                  fillOpacity="0.94"
                  stroke={isSelected ? '#2563eb' : txt.isBoxed ? '#94a3b8' : 'transparent'}
                  strokeWidth={isSelected ? 1.8 : 1}
                  strokeDasharray={isSelected ? '4,3' : undefined}
                  filter="drop-shadow(0 1px 3px rgba(0,0,0,0.12))"
                />

                {/* Multiline text rendering */}
                {lines.map((line, idx) => (
                  <text
                    key={idx}
                    x="2"
                    y={fontSize + idx * lineHeight}
                    fontFamily="'Space Grotesk', -apple-system, sans-serif"
                    fontSize={fontSize}
                    fontWeight={txt.fontWeight || '700'}
                    fill={txt.color || '#0f172a'}
                    textAnchor="start"
                    className="pointer-events-none select-none"
                  >
                    {line}
                  </text>
                ))}

                {/* Movable Handle badge when selected */}
                {isSelected && !readOnly && (
                  <g transform={`translate(${boxWidth - 10}, -10)`}>
                    <circle r="7" fill="#2563eb" />
                    <text x="0" y="3" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">
                      ⋮⋮
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Inline Text Editor Overlay when double-clicked */}
      {editingTextId && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-2xl p-4 border border-slate-300 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                Edit Coaching Note / Whiteboard Text
              </span>
              <button
                onClick={() => setEditingTextId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter text..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditingTextId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextEdit}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
