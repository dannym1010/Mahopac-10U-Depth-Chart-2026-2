import { WhiteboardDrill } from './whiteboardDrillData';
import { printCleanHTML } from '../../utils/printUtils';
import { spreadDiagramElements } from './whiteboardSpreadHelper';

/**
 * Generates an isolated, professional, high-contrast 1-page printable coaching sheet
 * containing ONLY the selected drill or scheme.
 */
export function generateDrillPrintHTML(drill: WhiteboardDrill, activePhaseIndex: number = 0): string {
  const rawPhase = drill.phases[activePhaseIndex] || drill.phases[0] || {
    name: 'BASE ALIGNMENT',
    description: drill.objective,
    tokens: [],
    arrows: [],
    zones: [],
  };

  // Automatically spread out elements so they never collide on the printed paper
  const spreadElements = spreadDiagramElements(rawPhase.tokens, rawPhase.arrows, rawPhase.zones, 'spread');
  const currentPhase = {
    ...rawPhase,
    tokens: spreadElements.tokens,
    arrows: spreadElements.arrows,
    zones: spreadElements.zones,
  };

  // Helper for arrow SVG
  const arrowSvg = currentPhase.arrows
    .map((a) => {
      let d = '';
      if (a.type === 'curved' && a.controlX !== undefined && a.controlY !== undefined) {
        d = `M ${a.startX} ${a.startY} Q ${a.controlX} ${a.controlY} ${a.endX} ${a.endY}`;
      } else if (a.type === 'blitz') {
        const midX = (a.startX + a.endX) / 2 + (a.controlX ? a.controlX - a.startX : 0);
        const midY = (a.startY + a.endY) / 2 + (a.controlY ? a.controlY - a.startY : 0);
        d = `M ${a.startX} ${a.startY} Q ${midX} ${midY} ${a.endX} ${a.endY}`;
      } else {
        d = `M ${a.startX} ${a.startY} L ${a.endX} ${a.endY}`;
      }
      const markerId =
        a.type === 'block'
          ? 'url(#t-bar)'
          : a.color === '#7c3aed' || a.color === '#8b5cf6' || a.dashed || a.type === 'drop'
          ? 'url(#arrow-purple)'
          : a.color === '#d91b24'
          ? 'url(#arrow-red)'
          : a.color === '#058538'
          ? 'url(#arrow-green)'
          : 'url(#arrow-blue)';

      const isDashed = a.dashed || a.type === 'drop';
      const labelW = a.label ? Math.max(a.label.length * 6 + 14, 34) : 0;
      const midX = (a.startX + a.endX) / 2;
      const midY = (a.startY + a.endY) / 2;
      const dx = a.endX - a.startX;
      const dy = a.endY - a.startY;
      const isVertical = Math.abs(dy) > Math.abs(dx);
      const labelX = isVertical ? midX + (midX > 540 ? -28 : 28) : midX;
      const labelY = isVertical ? midY : midY - 12;

      return `
        <path d="${d}" fill="none" stroke="${a.color || '#2563eb'}" stroke-width="2.8" ${
        isDashed ? 'stroke-dasharray="5,4"' : ''
      } marker-end="${markerId}" />
        ${
          a.label
            ? `
            <g transform="translate(${labelX}, ${labelY})">
              <rect x="${-labelW / 2}" y="-8" width="${labelW}" height="16" rx="4" fill="#ffffff" stroke="${a.color || '#2563eb'}" stroke-width="1.2" />
              <text x="0" y="3" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="${a.color || '#1e293b'}" text-anchor="middle">${a.label}</text>
            </g>
          `
            : ''
        }
      `;
    })
    .join('');

  // Helper for zone SVG (dimmed shade and smart collision avoidance)
  const zoneSvg = currentPhase.zones
    .map((z) => {
      const badgeW = Math.max(z.name.length * 6.5 + 14, 38);
      const dimmedFill = Math.max(0.04, Math.min((z.opacity || 0.18) * 0.35, 0.08));

      // Candidates
      const candTop = { x: z.cx, y: z.cy - z.ry - 10 };
      const candBottom = { x: z.cx, y: z.cy + z.ry + 10 };
      const candRight = { x: z.cx + z.rx + badgeW / 2 + 8, y: z.cy };

      const collidesWithToken = (pos: { x: number; y: number }) =>
        currentPhase.tokens.some((t) => Math.hypot(t.x - pos.x, t.y - pos.y) < 36);

      let bestPos = candTop;
      if (collidesWithToken(candTop) || candTop.y < 20) {
        bestPos = !collidesWithToken(candBottom) && candBottom.y < 480 ? candBottom : candRight;
      }

      return `
        <ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" fill="${z.color}" fill-opacity="${dimmedFill}" stroke="${z.color}" stroke-width="1.8" stroke-dasharray="5,3" />
        <g transform="translate(${bestPos.x}, ${bestPos.y})">
          <rect x="${-badgeW / 2}" y="-8" width="${badgeW}" height="16" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="${z.color}" stroke-width="1.2" />
          <text x="0" y="3.5" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="${z.color}" text-anchor="middle">${z.name}</text>
        </g>
      `;
    })
    .join('');

  // Helper for tokens SVG
  const tokenSvg = currentPhase.tokens
    .map((t) => {
      const isSquare = t.isSquare || t.type === 'square' || (t.type === 'O' && t.label === 'C');
      const isLetter = t.type === 'letter';

      if (isSquare) {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <rect x="-14" y="-14" width="28" height="28" rx="2" fill="#ffffff" stroke="#1e293b" stroke-width="2.4" />
            <text x="0" y="4.5" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="#1e293b">${
              t.label || 'C'
            }</text>
            ${
              t.subLabel
                ? `
                <g transform="translate(0, 24)">
                  <rect x="${-Math.max(t.subLabel.length * 5.5 + 10, 26) / 2}" y="-7" width="${Math.max(t.subLabel.length * 5.5 + 10, 26)}" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
                  <text x="0" y="3.5" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">${t.subLabel}</text>
                </g>
              `
                : ''
            }
          </g>
        `;
      }

      if (isLetter) {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="${t.color || '#0f172a'}" stroke-width="2.4" />
            <text x="0" y="4.5" font-family="sans-serif" font-size="${
              t.label.length > 2 ? '10' : '13'
            }" font-weight="900" text-anchor="middle" fill="${t.color || '#0f172a'}">${t.label}</text>
            ${
              t.subLabel
                ? `
                <g transform="translate(0, 24)">
                  <rect x="${-Math.max(t.subLabel.length * 5.5 + 10, 26) / 2}" y="-7" width="${Math.max(t.subLabel.length * 5.5 + 10, 26)}" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
                  <text x="0" y="3.5" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">${t.subLabel}</text>
                </g>
              `
                : ''
            }
          </g>
        `;
      }

      if (t.type === 'O') {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="${t.color || '#1e293b'}" stroke-width="2.4" />
            ${
              t.label.trim()
                ? `<text x="0" y="4" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="${
                    t.color || '#1e293b'
                  }">${t.label}</text>`
                : ''
            }
            ${
              t.subLabel
                ? `
                <g transform="translate(0, 24)">
                  <rect x="${-Math.max(t.subLabel.length * 5.5 + 10, 26) / 2}" y="-7" width="${Math.max(t.subLabel.length * 5.5 + 10, 26)}" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
                  <text x="0" y="3.5" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">${t.subLabel}</text>
                </g>
              `
                : ''
            }
          </g>
        `;
      }

      if (t.type === 'X') {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <circle cx="0" cy="0" r="14" fill="${t.color || '#2563eb'}" stroke="#0f172a" stroke-width="2" />
            ${
              t.label && t.label !== 'X'
                ? `<text x="0" y="4" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="middle" fill="#ffffff">${t.label}</text>`
                : `
                <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
              `
            }
            ${
              t.subLabel
                ? `
                <g transform="translate(0, 24)">
                  <rect x="${-Math.max(t.subLabel.length * 5.5 + 10, 26) / 2}" y="-7" width="${Math.max(t.subLabel.length * 5.5 + 10, 26)}" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
                  <text x="0" y="3.5" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">${t.subLabel}</text>
                </g>
              `
                : ''
            }
          </g>
        `;
      }

      if (t.type === 'bag') {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <rect x="-14" y="-24" width="28" height="48" rx="8" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
            <text x="0" y="4" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#ffffff">${t.label}</text>
          </g>
        `;
      }

      if (t.type === 'cone') {
        return `
          <g transform="translate(${t.x}, ${t.y})">
            <polygon points="0,-12 9,9 -9,9" fill="#f97316" stroke="#c2410c" stroke-width="1.8" />
            <text x="12" y="4" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c2410c">${t.label}</text>
          </g>
        `;
      }

      // Ball / Coach
      return `
        <g transform="translate(${t.x}, ${t.y})">
          <circle cx="0" cy="0" r="14" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
          <text x="0" y="4" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#1e293b">${t.label}</text>
        </g>
      `;
    })
    .join('');

  // Diagram Inset Coaching Card (Only rendered if specifically defined for scheme)
  const insetSvg =
    drill.diagramKeys && drill.diagramKeys.length > 0
      ? `
    <g transform="translate(40, 370)">
      <rect x="0" y="0" width="240" height="${Math.min(drill.diagramKeys.length * 20 + 16, 92)}" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      ${drill.diagramKeys
        .slice(0, 4)
        .map(
          (k, i) => `
        <text x="12" y="${20 + i * 19}" font-family="sans-serif" font-size="9" font-weight="${
            k.isHighlight ? '900' : '600'
          }" fill="${k.isHighlight ? '#b91c1c' : '#1e293b'}">
          • ${k.text}
        </text>
      `
        )
        .join('')}
    </g>
  `
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${drill.title} - Mahopac 10U Defensive Playbook</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.3in 0.35in;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.35;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-card {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .title-group h1 {
      font-size: 21px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .title-group .sub {
      font-size: 11px;
      color: #475569;
      font-weight: 700;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-group {
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      border-radius: 4px;
      margin-bottom: 3px;
    }
    .badge-blue {
      background: #1e3a8a;
      color: #ffffff;
    }
    .badge-gray {
      background: #e2e8f0;
      color: #1e293b;
      font-weight: 800;
    }
    .objective-box {
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 10.5px;
    }
    .objective-box strong {
      color: #1e3a8a;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .diagram-container {
      width: 100%;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 8px;
      position: relative;
    }
    .diagram-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      padding: 4px 10px;
      font-size: 9.5px;
      font-weight: 800;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
    }
    .diagram-svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    .info-box {
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 9px;
      background: #ffffff;
    }
    .box-green {
      border-color: #86efac;
      background: #f0fdf4;
    }
    .box-red {
      border-color: #fca5a5;
      background: #fef2f2;
    }
    .box-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .title-green { color: #15803d; }
    .title-red { color: #b91c1c; }
    .box-list {
      list-style-type: none;
      padding-left: 0;
    }
    .box-list li {
      position: relative;
      padding-left: 12px;
      margin-bottom: 3px;
      font-size: 10px;
      line-height: 1.3;
    }
    .box-list li::before {
      content: "•";
      position: absolute;
      left: 2px;
      font-weight: bold;
    }
    .box-green li::before { color: #16a34a; }
    .box-red li::before { color: #dc2626; }

    .instructions-strip {
      border: 1.5px solid #fed7aa;
      border-radius: 6px;
      padding: 6px 9px;
      background: #fffaf5;
      margin-bottom: 8px;
    }
    .instructions-strip h3 {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      color: #9a3412;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .instructions-list {
      list-style-type: decimal;
      padding-left: 18px;
      margin: 0;
    }
    .instructions-list li {
      font-size: 9.5px;
      line-height: 1.35;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .phases-strip {
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 9px;
      background: #f8fafc;
      margin-bottom: 8px;
    }
    .phases-strip h3 {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .phases-grid {
      display: grid;
      grid-template-columns: repeat(${Math.min(drill.phases.length, 3)}, 1fr);
      gap: 6px;
    }
    .phase-cell {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px 7px;
    }
    .phase-cell-active {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .phase-name {
      font-size: 9px;
      font-weight: 900;
      color: #1e3a8a;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .phase-desc {
      font-size: 8.5px;
      color: #475569;
      line-height: 1.25;
    }

    .footer-notes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .setup-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 9.5px;
      color: #475569;
    }
    .notes-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 8px;
      min-height: 42px;
    }
    .notes-box-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 3px;
    }
    .notes-line {
      border-bottom: 1px dotted #cbd5e1;
      height: 14px;
    }
  </style>
</head>
<body>
  <div class="print-card">
    <!-- Header -->
    <div class="header-bar">
      <div class="title-group">
        <h1>${drill.title}</h1>
        <div class="sub">${drill.subtitle} &nbsp;•&nbsp; ${drill.categoryLabel}</div>
      </div>
      <div class="badge-group">
        <div class="badge badge-blue">MAHOPAC 10U DEFENSE</div><br>
        <div class="badge badge-gray">YOUTH 10U TACTICAL DRILL</div>
      </div>
    </div>

    <!-- Objective & Setup -->
    <div class="objective-box">
      <strong>Core Objective:</strong> ${drill.objective}
      ${drill.setup ? `<div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1;"><strong style="color: #4338ca;">Field Setup:</strong> ${drill.setup}</div>` : ''}
    </div>

    <!-- Diagram -->
    <div class="diagram-container">
      <div class="diagram-caption">
        <span>Active Diagram: <strong>${currentPhase.name}</strong></span>
        <span>${currentPhase.tokens.length} Players / Markers</span>
      </div>
      <svg viewBox="0 0 700 500" class="diagram-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
          </marker>
          <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d91b24" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#058538" />
          </marker>
          <marker id="t-bar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <line x1="5" y1="0" x2="5" y2="10" stroke="#1a1a24" stroke-width="2.5" />
          </marker>
        </defs>

        <!-- Pure White Field Surface -->
        <rect x="0" y="0" width="700" height="500" fill="#ffffff" />

        <!-- Yard Lines & Numbers matching playbook style -->
        <g opacity="0.6">
          <line x1="30" y1="80" x2="670" y2="80" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="6,4" />
          <line x1="30" y1="160" x2="670" y2="160" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="6,4" />
          <!-- LOS Solid Blue Line -->
          <line x1="30" y1="240" x2="670" y2="240" stroke="#2563eb" stroke-width="2.5" />
          <line x1="30" y1="320" x2="670" y2="320" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="6,4" />
          <line x1="30" y1="400" x2="670" y2="400" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="6,4" />

          <!-- Hash Marks -->
          <line x1="280" y1="60" x2="280" y2="440" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,6" />
          <line x1="420" y1="60" x2="420" y2="440" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,6" />

          <!-- Yard line numbers -->
          <text x="560" y="168" font-family="sans-serif" font-size="30" font-weight="900" fill="#cbd5e1" opacity="0.75">10</text>
          <text x="560" y="328" font-family="sans-serif" font-size="30" font-weight="900" fill="#cbd5e1" opacity="0.75">20</text>
          <text x="140" y="408" font-family="sans-serif" font-size="30" font-weight="900" fill="#cbd5e1" opacity="0.75">30</text>
        </g>

        <!-- Diagram Inset Card -->
        ${insetSvg}

        <!-- Zones Layer -->
        <g id="zonesLayer">${zoneSvg}</g>

        <!-- Arrows Layer -->
        <g id="arrowsLayer">${arrowSvg}</g>

        <!-- Tokens Layer -->
        <g id="tokensLayer">${tokenSvg}</g>
      </svg>
    </div>

    <!-- Phase Progression -->
    ${
      drill.phases && drill.phases.length > 0
        ? `
      <div class="phases-strip">
        <h3>Step-by-Step Phase Progression</h3>
        <div class="phases-grid">
          ${drill.phases
            .map(
              (p, idx) => `
            <div class="phase-cell ${idx === activePhaseIndex ? 'phase-cell-active' : ''}">
              <div class="phase-name">${p.name}</div>
              <div class="phase-desc">${p.description}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    <!-- Step-by-Step Execution Instructions -->
    ${
      drill.instructions && drill.instructions.length > 0
        ? `
      <div class="instructions-strip">
        <h3>Drill Execution & Instructions</h3>
        <ol class="instructions-list">
          ${drill.instructions.map((inst) => `<li>${inst}</li>`).join('')}
        </ol>
      </div>
    `
        : ''
    }

    <!-- Coaching Cues & Critical Faults -->
    <div class="info-grid">
      <div class="info-box box-green">
        <div class="box-title title-green">10U Practice Coaching Cues</div>
        <ul class="box-list box-green">
          ${drill.cues.map((c) => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div class="info-box box-red">
        <div class="box-title title-red">DO NOT DO THIS! (Critical Faults)</div>
        <ul class="box-list box-red">
          ${drill.faults.map((f) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Bottom Setup and Handwritten Notes -->
    <div class="footer-notes">
      <div class="setup-box">
        <strong>Field & Equipment Setup:</strong><br>
        ${drill.equipment || 'Cones at 5yd intervals, blocking hand shields, whistle, football on a stick.'}
      </div>
      <div class="notes-box">
        <div class="notes-box-title">Game-Day / Practice Rep Adjustments:</div>
        <div class="notes-line"></div>
        <div class="notes-line"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers clean print of the selected drill using an isolated iframe.
 */
export function printDrillSheet(drill: WhiteboardDrill, activePhaseIndex: number = 0): void {
  const html = generateDrillPrintHTML(drill, activePhaseIndex);
  printCleanHTML(html, `${drill.title} - Mahopac 10U Defensive Playbook`);
}

/**
 * Extracts the drill stylesheet rules for inclusion in multi-page packages.
 */
export function extractDrillPrintStyles(drill: WhiteboardDrill): string {
  const full = generateDrillPrintHTML(drill, 0);
  const sStart = full.indexOf('<style>');
  const sEnd = full.indexOf('</style>');
  if (sStart !== -1 && sEnd !== -1) {
    return full.substring(sStart + 7, sEnd);
  }
  return '';
}

/**
 * Extracts the inner card markup for a drill to embed in multi-page practice plans.
 */
export function extractDrillCardMarkup(drill: WhiteboardDrill, activePhaseIndex: number = 0): string {
  const full = generateDrillPrintHTML(drill, activePhaseIndex);
  const start = full.indexOf('<div class="print-card">');
  const end = full.lastIndexOf('</div>');
  if (start !== -1 && end !== -1) {
    return full.substring(start, end + 6);
  }
  return '';
}

