/**
 * Bulletproof Print Engine for Football Manager
 * Handles practice plans, depth charts, wristbands, and schedules.
 * Supports direct window printing, clean standalone iframe printing, and new tab printable view.
 */

import { PracticePlan, PracticePeriod, RosterPlayer, AttendanceRecord, SeasonConfig, calculatePlayerCompliance, SingleWristband, WristbandPlay } from '../types';
import { calculatePlayerHours, getPlayerHoursBreakdown } from './hoursCalculation';
import { formatWeekLabel } from './seasonWeekUtils';
import { getWristbandStartNumber } from './wristbandLinking';

export interface PrintOptions {
  beforePrint?: () => void;
  afterPrint?: () => void;
  targetElementSelector?: string;
  documentTitle?: string;
}

/**
 * Standard direct window print with robust cleanup and immediate trigger.
 */
export function triggerPrint(options?: PrintOptions) {
  if (typeof window === 'undefined') return;

  const { beforePrint, afterPrint } = options || {};

  if (beforePrint) {
    try {
      beforePrint();
    } catch (err) {
      console.warn('Error in beforePrint:', err);
    }
  }

  document.documentElement.classList.add('is-printing');
  document.body.classList.add('is-printing');

  let cleanedUp = false;
  const doCleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.documentElement.classList.remove('is-printing');
    document.body.classList.remove('is-printing');
    window.removeEventListener('afterprint', doCleanup);
    window.removeEventListener('focus', onFocusReturn);
    if (afterPrint) {
      try {
        afterPrint();
      } catch (err) {
        console.warn('Error in afterPrint:', err);
      }
    }
  };

  const onFocusReturn = () => {
    setTimeout(doCleanup, 300);
  };

  window.addEventListener('afterprint', doCleanup, { once: true });
  window.addEventListener('focus', onFocusReturn, { once: true });

  try {
    window.focus();
    window.print();
  } catch (err) {
    console.error('Direct window.print() failed:', err);
    doCleanup();
  }
}

/**
 * Generate clean, self-contained HTML for a Practice Plan
 */
export function generatePracticePlanHTML(
  plan: PracticePlan | null,
  periods: PracticePeriod[],
  seqInfo?: { practiceNumber?: number; isCancelled?: boolean } | null,
  fontSize: number = 12
): string {
  const title = plan?.title || 'Practice Plan';
  const date = plan?.date || '';
  const day = plan?.day || '';
  const startTime = plan?.startTime || '5:05 PM';
  const endTime = plan?.endTime || '';
  const location = plan?.location || 'Crane Road';
  const weekFolder = plan?.weekFolder || 'Week 1';
  const isCancelled = Boolean(seqInfo?.isCancelled || plan?.isCancelled);
  const pracNum = seqInfo?.practiceNumber ? `Day #${seqInfo.practiceNumber} (Prac #${seqInfo.practiceNumber})` : '';

  let currentStartMinutes = 305; // 5:05 PM
  if (startTime) {
    const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hrs = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const ampm = (match[3] || 'PM').toUpperCase();
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      currentStartMinutes = hrs * 60 + mins;
    }
  }

  const formatTime = (min: number) => {
    let h = Math.floor(min / 60) % 24;
    const m = min % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  let rowsHtml = '';
  periods.forEach((period) => {
    const duration = Number(period.time) || 0;
    const periodEndMin = currentStartMinutes + duration;
    const timeStr = `${formatTime(currentStartMinutes)} - ${formatTime(periodEndMin)}`;
    const isRotating = period.format === 'rotating';
    const stations = Array.isArray(period.stations) && period.stations.length > 0
      ? period.stations
      : [{ name: '', desc: '', coach: '', focus: '' }];

    stations.forEach((st, sIdx) => {
      const isFirst = sIdx === 0;
      const numStations = stations.length;

      let timeCol = '';
      let catCol = '';

      if (isFirst) {
        timeCol = `
          <td rowspan="${numStations}" style="width: 14%; border: 1.2px solid #000; padding: 4px 6px; vertical-align: top; font-weight: 800; background: #fff; line-height: 1.25;">
            <div style="font-size: ${fontSize + 1}px; font-weight: 900; color: #000;">${timeStr}</div>
            <div style="font-size: ${fontSize - 1}px; color: #475569; font-weight: 700; margin-top: 2px;">${duration} min ${isRotating ? '• ROTATING' : ''}</div>
          </td>
        `;
        catCol = `
          <td rowspan="${numStations}" style="width: 12%; border: 1.2px solid #000; padding: 4px 6px; vertical-align: top; background: #fff;">
            <span style="display: inline-block; font-size: ${fontSize - 1}px; font-weight: 900; text-transform: uppercase; color: #000; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; padding: 2px 5px;">
              ${period.category || 'General'}
            </span>
          </td>
        `;
      }

      rowsHtml += `
        <tr style="page-break-inside: avoid; break-inside: avoid;">
          ${timeCol}
          ${catCol}
          <td style="width: 46%; border: 1.2px solid #000; padding: 4px 6px; vertical-align: top; background: #fff;">
            <div style="font-size: ${fontSize + 1}px; font-weight: 900; text-transform: uppercase; color: #000;">
              ${st.name || 'Station / Drill'}
            </div>
            ${st.desc ? `<div style="font-size: ${fontSize}px; color: #0f172a; margin-top: 2px; white-space: pre-wrap; line-height: 1.35;">${st.desc}</div>` : ''}
          </td>
          <td style="width: 13%; border: 1.2px solid #000; padding: 4px 6px; vertical-align: top; font-weight: 700; font-size: ${fontSize}px; color: #000; background: #fff; word-break: break-word;">
            ${st.coach || '—'}
          </td>
          <td style="width: 15%; border: 1.2px solid #000; padding: 4px 6px; vertical-align: top; font-size: ${fontSize}px; color: #000; background: #fff; white-space: pre-wrap; line-height: 1.3;">
            ${st.focus || '—'}
          </td>
        </tr>
      `;
    });

    currentStartMinutes = periodEndMin;
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Mahopac 10U Practice Plan - ${title}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.25in;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background-color: #ffffff;
            color: #000000;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: ${fontSize}px;
          }
          .header {
            border-bottom: 2.5px solid #000000;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }
          .title {
            font-size: 16pt;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            margin: 0;
            color: #000;
          }
          .sub-badge {
            font-size: 11pt;
            font-weight: 900;
            color: #000;
          }
          .header-meta {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            font-weight: 700;
            color: #1e293b;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin: 0;
          }
          thead {
            display: table-header-group;
          }
          th {
            background-color: #f1f5f9;
            color: #000000;
            border: 1.5px solid #000000;
            border-bottom: 2.5px solid #000000;
            padding: 5px 6px;
            font-size: ${fontSize}px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            text-align: left;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-top">
            <h1 class="title">Mahopac 10U Practice Plan</h1>
            <div class="sub-badge">
              ${isCancelled ? '[CANCELLED SESSION] • ' : ''}${pracNum ? pracNum + ' • ' : ''}${title}
            </div>
          </div>
          <div class="header-meta">
            <span>Date: ${date} (${day}) • Time: ${startTime}${endTime ? ` - ${endTime}` : ''} • Location: ${location}</span>
            <span>${weekFolder}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 14%;">Time / Period</th>
              <th style="width: 12%;">Category</th>
              <th style="width: 46%;">Stations / Drills</th>
              <th style="width: 13%;">Coaches</th>
              <th style="width: 15%;">Focus / Cues</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

/**
 * Print clean standalone HTML via a dedicated isolated hidden iframe.
 * If iframe fails or is blocked by sandbox, falls back to new window popup or direct print.
 */
export function printCleanHTML(htmlString: string, documentTitle?: string) {
  if (typeof window === 'undefined') return;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '8.5in';
    iframe.style.height = '11in';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      openCleanPrintTab(htmlString, documentTitle);
      return;
    }

    doc.open();
    doc.write(htmlString);
    doc.close();

    const cleanup = () => {
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch {}
    };

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked, opening standalone print tab:', err);
        openCleanPrintTab(htmlString, documentTitle);
      } finally {
        setTimeout(cleanup, 2000);
      }
    }, 150);
  } catch (err) {
    console.warn('Print iframe creation error, falling back to clean tab:', err);
    openCleanPrintTab(htmlString, documentTitle);
  }
}

/**
 * Opens a clean printable sheet in a new tab/window and triggers print.
 * Guaranteed to bypass iframe restrictions and hardware spooler hangs.
 */
export function openCleanPrintTab(htmlString: string, documentTitle?: string) {
  if (typeof window === 'undefined') return;

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        ${htmlString}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 200);
          };
        </script>
      `);
      printWindow.document.close();
      return;
    }
  } catch (e) {
    console.warn('Popup blocked, falling back to direct print:', e);
  }

  triggerPrint();
}

export interface SinglePlaybookPrintOptions {
  teamName?: string;
  teamSeason?: string;
  category: string;
  subTab: string;
  content: string;
  inkFriendly?: boolean;
}

export interface PlaybookBinderSection {
  category: string;
  subTab: string;
  content: string;
}

export interface PlaybookBinderPrintOptions {
  teamName?: string;
  teamSeason?: string;
  headCoachName?: string;
  title?: string;
  sections: PlaybookBinderSection[];
  inkFriendly?: boolean;
  includeCoverPage?: boolean;
}

/**
 * Common print CSS rules for ink-friendly high-contrast output
 */
const INK_FRIENDLY_PLAYBOOK_CSS = `
  @page {
    size: letter portrait;
    margin: 0.4in;
  }
  *, *:before, *:after {
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body, html {
    display: block !important;
    width: 100% !important;
    float: none !important;
    background: #ffffff !important;
    color: #0f172a !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 9.5pt !important;
    line-height: 1.35 !important;
  }
  .playbook-container {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .top-nav, .bottom-nav, select, button, .action-btn, .play-nav {
    display: none !important;
  }
  .field-wrap {
    margin: 8px 0 !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    background: #ffffff !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  svg {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    max-height: 4.6in !important;
  }
  .meta-bar {
    display: block !important;
    padding: 8px 12px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    background: #f8fafc !important;
    margin: 8px 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .concepts-text {
    font-size: 8.5pt !important;
    color: #334155 !important;
    line-height: 1.4 !important;
  }
  .table-section {
    padding: 8px 0 12px 0 !important;
    overflow: visible !important;
    width: 100% !important;
  }
  .table-section table, table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 8.5pt !important;
    text-align: left !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
  }
  .table-section thead th, thead th, th {
    padding: 6px 8px !important;
    font-size: 8pt !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    color: #334155 !important;
    border: 1px solid #cbd5e1 !important;
    background: #f1f5f9 !important;
  }
  .table-section tbody td, tbody td, td {
    padding: 6px 8px !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    vertical-align: top !important;
    line-height: 1.35 !important;
    font-size: 8pt !important;
  }
  .card, .wrapper, .box, .container, [class*="card"] {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    box-shadow: none !important;
    padding: 10px 14px !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #0f172a !important;
    margin-top: 0 !important;
    font-weight: 800 !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .header {
    border-bottom: 2px solid #0f172a !important;
    padding-bottom: 6px !important;
    margin-bottom: 10px !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .badge {
    background: #0284c7 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    padding: 2px 8px !important;
    font-size: 8pt !important;
    font-weight: bold !important;
  }
  .diagram-box {
    background: #f8fafc !important;
    border: 1.5px dashed #0f766e !important;
    border-radius: 6px !important;
    height: 195px !important;
    max-height: 205px !important;
    color: #042f2e !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 10px !important;
    position: relative !important;
    overflow: hidden !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .grid-lines {
    position: absolute !important;
    width: 100% !important;
    height: 100% !important;
    background-size: 20px 20px !important;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px) !important;
  }
  .diagram-title {
    z-index: 1 !important;
    font-weight: 900 !important;
    font-size: 11pt !important;
    color: #042f2e !important;
  }
  .diagram-sub {
    z-index: 1 !important;
    font-size: 8.5pt !important;
    color: #0f766e !important;
    font-weight: 600 !important;
  }
  table, .assignments-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 8px !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
  thead {
    display: table-header-group !important;
  }
  th, .assignments-table th {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border: 1px solid #94a3b8 !important;
    padding: 5px 8px !important;
    font-size: 8pt !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
  }
  td, .assignments-table td {
    border: 1px solid #cbd5e1 !important;
    color: #0f172a !important;
    padding: 5px 8px !important;
    font-size: 8pt !important;
    line-height: 1.25 !important;
  }
  tr, .tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .pos-tag {
    background: #e2e8f0 !important;
    color: #0369a1 !important;
    border: 1px solid #cbd5e1 !important;
    padding: 1px 5px !important;
    border-radius: 4px !important;
    font-weight: 800 !important;
    font-family: monospace !important;
    display: inline-block !important;
    font-size: 7.5pt !important;
  }
  .notes-box, .notes {
    background: #f8fafc !important;
    border-left: 3.5px solid #d97706 !important;
    border-top: 1px solid #e2e8f0 !important;
    border-right: 1px solid #e2e8f0 !important;
    border-bottom: 1px solid #e2e8f0 !important;
    color: #334155 !important;
    padding: 8px 12px !important;
    margin-top: 10px !important;
    border-radius: 0 4px 4px 0 !important;
    font-size: 8pt !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  /* Normalize dark utility backgrounds */
  [class*="bg-slate-"], [class*="bg-zinc-"], [class*="bg-neutral-"], [class*="bg-gray-"] {
    background: #ffffff !important;
    color: #0f172a !important;
  }
  [class*="text-slate-100"], [class*="text-slate-200"], [class*="text-white"], [class*="text-slate-300"] {
    color: #0f172a !important;
  }
  [class*="text-slate-400"], [class*="text-slate-500"] {
    color: #475569 !important;
  }
  [class*="border-slate-"] {
    border-color: #cbd5e1 !important;
  }
`;

/**
 * Generate a blank playbook install worksheet if the section has no content
 */
function generateBlankPlaybookWorksheet(category: string, subTab: string): string {
  return `
    <div class="card">
      <div class="header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 16pt;">${subTab.toUpperCase()}</h1>
          <div style="font-size: 9pt; color: #475569; margin-top: 3px;">Category: ${category} • Formation & Scheme Install Worksheet</div>
        </div>
        <span class="badge">${category.toUpperCase()}</span>
      </div>

      <div class="diagram-box">
        <div class="grid-lines"></div>
        <div class="diagram-title">🏈 PLAY SCHEMATIC & FIELD DIAGRAM</div>
        <div class="diagram-sub">Sketch Formation, Motion & Route Trees / Defensive Gap Fits</div>
      </div>

      <table class="assignments-table">
        <thead>
          <tr>
            <th style="width: 80px;">Pos</th>
            <th style="width: 140px;">Alignment</th>
            <th>Assignment & Key Read</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pos-tag">QB</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">RB</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">X / WR1</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">Z / WR2</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">H / Slot</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">TE</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td><span class="pos-tag">OL</span></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>

      <div class="notes-box">
        <strong>Coaching Points & Scheme Rules:</strong>
        <div style="height: 48px; border-bottom: 1px dotted #cbd5e1; margin-top: 6px;"></div>
      </div>
    </div>
  `;
}

/**
 * Safely extracts, cleans, and sanitizes playbook HTML content for printing.
 * - Extracts body content if it is a full HTML document (even if unclosed)
 * - Strips any web navigation controls (.top-nav, .bottom-nav, select dropdowns, action buttons)
 * - Neutralizes any embedded <style> tags that define global `body { display: flex }` or `*` rules
 * - Automatically repairs unclosed tags to prevent section bleed/nesting in multi-page documents
 */
export function extractAndSanitizePlaybookHtml(
  rawContent: string | undefined,
  category: string,
  subTab: string
): string {
  if (!rawContent || !rawContent.trim()) {
    return generateBlankPlaybookWorksheet(category, subTab);
  }

  const trimmed = rawContent.trim();

  // If it is an image data URI or image link
  if (trimmed.startsWith('data:image/') || trimmed.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
    return `
      <div class="card" style="text-align: center; padding: 14px;">
        <div class="header">
          <h1 style="margin: 0; font-size: 15pt;">${subTab.toUpperCase()}</h1>
          <div style="font-size: 9pt; color: #475569; margin-top: 3px;">Category: ${category}</div>
        </div>
        <img src="${trimmed}" alt="${subTab}" style="max-width: 100%; max-height: 8.2in; object-fit: contain; margin: 12px auto; display: block;" />
      </div>
    `;
  }

  // Use DOMParser in browser for resilient HTML tree parsing & auto-closing of unclosed tags
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'text/html');

      // 1. Remove non-printable web UI interactive controls and dropdowns
      doc.querySelectorAll('.top-nav, .bottom-nav, select, .play-nav, button.action-btn, button').forEach((el) => {
        el.remove();
      });

      // 2. Remove script and link tags
      doc.querySelectorAll('script, link').forEach((el) => el.remove());

      // 3. Neutralize any global style rules (e.g. body { display: flex }) so they don't break the outer document
      doc.querySelectorAll('style').forEach((styleEl) => {
        let css = styleEl.textContent || '';
        css = css.replace(/(^|[,\s}])\s*(body|html)\s*\{/gi, '$1 .playbook-main-content {');
        css = css.replace(/(^|[,\s}])\s*\*\s*\{/gi, '$1 .playbook-main-content * {');
        styleEl.textContent = css;
      });

      const bodyHtml = doc.body ? doc.body.innerHTML.trim() : '';
      if (bodyHtml) {
        return bodyHtml;
      }
    } catch (err) {
      console.warn('DOMParser extraction warning, falling back to regex sanitizer:', err);
    }
  }

  // Regex fallback
  let bodyContent = trimmed;
  if (bodyContent.includes('<body') || bodyContent.includes('<BODY')) {
    const match = bodyContent.match(/<body[^>]*>([\s\S]*?)(?:<\/body>|$)/i);
    if (match && match[1]) {
      bodyContent = match[1];
    }
  } else if (bodyContent.includes('<head') || bodyContent.includes('<HEAD')) {
    bodyContent = bodyContent.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  }

  // Strip scripts, links, and web navigation elements
  bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  bodyContent = bodyContent.replace(/<link[^>]*>/gi, '');
  bodyContent = bodyContent.replace(/<div class="top-nav">[\s\S]*?<\/div>/gi, '');
  bodyContent = bodyContent.replace(/<div class="bottom-nav">[\s\S]*?<\/div>/gi, '');
  bodyContent = bodyContent.replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '');
  bodyContent = bodyContent.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');

  // Strip doc tags
  bodyContent = bodyContent.replace(/<\/?(html|head|body)[^>]*>/gi, '');
  bodyContent = bodyContent.replace(/<!DOCTYPE[^>]*>/gi, '');

  // Neutralize global body/html style selectors
  bodyContent = bodyContent.replace(/(^|[,\s}])\s*(body|html)\s*\{/gi, '$1 .playbook-main-content {');

  return bodyContent;
}

/**
 * Generate self-contained HTML for a single Playbook Guide
 */
export function generatePlaybookGuidePrintHTML(options: SinglePlaybookPrintOptions): string {
  const {
    teamName = 'Mahopac Indians',
    teamSeason = '10U Football',
    category,
    subTab,
    content,
    inkFriendly = true,
  } = options;

  const bodyContent = extractAndSanitizePlaybookHtml(content, category, subTab);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${teamName} - ${category} - ${subTab}</title>
  <style>
    ${inkFriendly ? INK_FRIENDLY_PLAYBOOK_CSS : `
      @page { size: letter portrait; margin: 0.4in; }
      html, body {
        display: block !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        float: none !important;
        background: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .playbook-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .top-nav, .bottom-nav, select, button, .action-btn, .play-nav {
        display: none !important;
      }
      .field-wrap {
        margin: 8px 0 !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        background: #ffffff !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      svg {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-height: 4.6in !important;
      }
      .meta-bar {
        display: block !important;
        padding: 8px 12px !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        background: #f8fafc !important;
        margin: 8px 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .concepts-text {
        font-size: 8.5pt !important;
        color: #334155 !important;
        line-height: 1.4 !important;
      }
      .table-section {
        padding: 8px 0 12px 0 !important;
        overflow: visible !important;
        width: 100% !important;
      }
      .table-section table, table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 8.5pt !important;
        text-align: left !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .table-section thead th, thead th, th {
        padding: 6px 8px !important;
        font-size: 8pt !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: #334155 !important;
        border: 1px solid #cbd5e1 !important;
        background: #f1f5f9 !important;
      }
      .table-section tbody td, tbody td, td {
        padding: 6px 8px !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        vertical-align: top !important;
        line-height: 1.35 !important;
        font-size: 8pt !important;
      }
      .pos-name {
        font-weight: 800 !important;
        color: #0f172a !important;
        white-space: nowrap !important;
      }
      .pos-desc {
        font-weight: normal !important;
        color: #64748b !important;
        font-size: 7.5pt !important;
        display: block !important;
      }
      .tag-contain { color: #0284c7 !important; font-weight: 700 !important; }
      .tag-blitz { color: #dc2626 !important; font-weight: 700 !important; }
      .tag-cover { color: #7c3aed !important; font-weight: 700 !important; }
      .tag-stunt { color: #d97706 !important; font-weight: 700 !important; }
    `}
    .playbook-section {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      page-break-inside: auto !important;
      break-inside: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .playbook-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 14px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
    .playbook-top-bar .team-brand {
      color: #0f172a;
      font-size: 10.5pt;
      font-weight: 900;
    }
    .playbook-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 14px;
      font-size: 7.5pt;
      color: #64748b;
      break-before: avoid !important;
      page-break-before: avoid !important;
    }
    tr, .tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .diagram-box, figure, img, svg { page-break-inside: avoid !important; break-inside: avoid !important; }
    .notes-box, .notes { page-break-inside: avoid !important; break-inside: avoid !important; }
    thead { display: table-header-group !important; }
  </style>
</head>
<body>
  <section class="playbook-section">
    <div class="playbook-top-bar">
      <span class="team-brand">🏈 ${teamName} &bull; ${teamSeason}</span>
      <span>${category} &gt; ${subTab}</span>
      <span>Printed: ${currentDate}</span>
    </div>

    <div class="playbook-main-content">
      ${bodyContent}
    </div>

    <div class="playbook-bottom-bar">
      <span>CONFIDENTIAL TEAM INSTALL SHEET &bull; PROPERTY OF ${teamName.toUpperCase()}</span>
      <span>Playbook &amp; Position Install Guides</span>
    </div>
  </section>
</body>
</html>`;
}

/**
 * Generate self-contained HTML for a multi-page Playbook Binder (Category or Full Team)
 */
export function generatePlaybookBinderPrintHTML(options: PlaybookBinderPrintOptions): string {
  const {
    teamName = 'Mahopac Indians',
    teamSeason = '10U Football',
    headCoachName = '',
    title = 'Team Playbook & Positional Install Binder',
    sections,
    inkFriendly = true,
    includeCoverPage = true,
  } = options;

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Group sections by category for Table of Contents
  const categoriesMap: Record<string, { sec: PlaybookBinderSection; globalIndex: number }[]> = {};
  sections.forEach((sec, idx) => {
    if (!categoriesMap[sec.category]) categoriesMap[sec.category] = [];
    categoriesMap[sec.category].push({ sec, globalIndex: idx + 1 });
  });

  let tocHtml = '';
  Object.keys(categoriesMap).forEach((cat) => {
    tocHtml += `
      <div style="margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid;">
        <div style="font-weight: 900; font-size: 9.5pt; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 4px;">
          ${cat} (${categoriesMap[cat].length} Sections)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
    `;
    categoriesMap[cat].forEach(({ sec, globalIndex }) => {
      tocHtml += `
        <tr>
          <td style="padding: 2px 4px; font-weight: 700; color: #1e293b; width: 75%; border: none;">&bull; ${sec.subTab}</td>
          <td style="padding: 2px 4px; text-align: right; color: #64748b; border: none; font-family: monospace; font-size: 8pt; font-weight: 700;">Section ${globalIndex}</td>
        </tr>
      `;
    });
    tocHtml += `</table></div>`;
  });

  // Build section pages
  let pagesHtml = '';
  sections.forEach((sec, sIdx) => {
    const secBody = extractAndSanitizePlaybookHtml(sec.content, sec.category, sec.subTab);

    pagesHtml += `
      <section class="playbook-section" data-section="${sec.category}-${sec.subTab}">
        <div class="playbook-top-bar">
          <span class="team-brand">🏈 ${teamName} &bull; ${teamSeason}</span>
          <span class="section-title">${sec.category} &gt; ${sec.subTab}</span>
          <span class="section-count">Section ${sIdx + 1} of ${sections.length}</span>
        </div>

        <div class="playbook-main-content">
          ${secBody}
        </div>

        <div class="playbook-bottom-bar">
          <span>CONFIDENTIAL TEAM PLAYBOOK &bull; PROPERTY OF ${teamName.toUpperCase()}</span>
          <span>${sec.category} &gt; ${sec.subTab} &bull; Section ${sIdx + 1} of ${sections.length}</span>
        </div>
      </section>
    `;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${teamName} - ${title}</title>
  <style>
    ${inkFriendly ? INK_FRIENDLY_PLAYBOOK_CSS : `
      @page { size: letter portrait; margin: 0.4in; }
      html, body {
        display: block !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        float: none !important;
        background: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .playbook-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .top-nav, .bottom-nav, select, button, .action-btn, .play-nav {
        display: none !important;
      }
      .field-wrap {
        margin: 8px 0 !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        background: #ffffff !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      svg {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-height: 4.6in !important;
      }
      .meta-bar {
        display: block !important;
        padding: 8px 12px !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        background: #f8fafc !important;
        margin: 8px 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .concepts-text {
        font-size: 8.5pt !important;
        color: #334155 !important;
        line-height: 1.4 !important;
      }
      .table-section {
        padding: 8px 0 12px 0 !important;
        overflow: visible !important;
        width: 100% !important;
      }
      .table-section table, table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 8.5pt !important;
        text-align: left !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .table-section thead th, thead th, th {
        padding: 6px 8px !important;
        font-size: 8pt !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: #334155 !important;
        border: 1px solid #cbd5e1 !important;
        background: #f1f5f9 !important;
      }
      .table-section tbody td, tbody td, td {
        padding: 6px 8px !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        vertical-align: top !important;
        line-height: 1.35 !important;
        font-size: 8pt !important;
      }
      .pos-name {
        font-weight: 800 !important;
        color: #0f172a !important;
        white-space: nowrap !important;
      }
      .pos-desc {
        font-weight: normal !important;
        color: #64748b !important;
        font-size: 7.5pt !important;
        display: block !important;
      }
      .tag-contain { color: #0284c7 !important; font-weight: 700 !important; }
      .tag-blitz { color: #dc2626 !important; font-weight: 700 !important; }
      .tag-cover { color: #7c3aed !important; font-weight: 700 !important; }
      .tag-stunt { color: #d97706 !important; font-weight: 700 !important; }
    `}

    /* =========================================================
       CRITICAL PAGINATION RULES:
       1. Each section starts on its own fresh page
       2. Long sections naturally flow to a 2nd page without cutting off
       3. Following section ALWAYS breaks to a new page
       ========================================================= */
    .cover-page {
      border: 4px double #0f172a;
      border-radius: 12px;
      padding: 28px 24px;
      min-height: 9.8in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-before: avoid !important;
      break-before: avoid !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-sizing: border-box;
      background: #ffffff;
      margin-bottom: 0;
    }

    .playbook-section {
      /* Block display allows standard fragment rendering across page breaks */
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 100% !important;
      box-sizing: border-box !important;
      clear: both !important;
      float: none !important;
      position: relative !important;

      /* When the section ends, the NEXT section MUST start on its own fresh page! */
      page-break-before: auto !important;
      break-before: auto !important;
      page-break-after: always !important;
      break-after: page !important;

      /* Crucial: If a section has extensive content, it flows naturally onto a 2nd page! */
      page-break-inside: auto !important;
      break-inside: auto !important;

      margin: 0 0 24px 0 !important;
      padding: 0 !important;
    }

    /* Last section doesn't force a trailing blank sheet */
    .playbook-section:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
      margin-bottom: 0 !important;
    }

    .playbook-main-content {
      display: block !important;
      width: 100% !important;
      clear: both !important;
      overflow: visible !important;
    }

    /* Sub-element break rules to keep assignments and diagrams intact */
    tr, .tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .diagram-box, figure, img, svg, .field-diagram, .field-wrap {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .notes-box, .notes, .meta-bar {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .playbook-top-bar, .header, h1, h2, h3 {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .playbook-bottom-bar {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    table, .assignments-table {
      page-break-inside: auto !important;
      break-inside: auto !important;
    }

    thead {
      display: table-header-group !important;
    }

    .card, [class*="card"], .box, .container, .playbook-container {
      page-break-inside: auto !important;
      break-inside: auto !important;
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
      width: 100% !important;
      max-width: 100% !important;
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .playbook-top-bar {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-bottom: 2px solid #0f172a !important;
      padding-bottom: 5px !important;
      margin-bottom: 12px !important;
      font-size: 8.5pt !important;
      font-weight: 700 !important;
      color: #334155 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
    .playbook-top-bar .team-brand {
      color: #0f172a !important;
      font-size: 10pt !important;
      font-weight: 900 !important;
    }
    .playbook-bottom-bar {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-top: 1px solid #cbd5e1 !important;
      padding-top: 5px !important;
      margin-top: 12px !important;
      font-size: 7.5pt !important;
      color: #64748b !important;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        width: 100% !important;
        float: none !important;
      }
      .cover-page, .playbook-section {
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
        clear: both !important;
        float: none !important;
      }
      .cover-page {
        border: 4px double #0f172a !important;
        padding: 0.25in !important;
        min-height: 9.6in !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .playbook-section {
        border: none !important;
        padding: 0 !important;
        page-break-before: always !important;
        break-before: page !important;
        page-break-after: always !important;
        break-after: page !important;
        display: block !important;
        clear: both !important;
      }
      .playbook-section:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .top-nav, .bottom-nav, select, button, .action-btn, .play-nav {
        display: none !important;
      }
    }

    @media screen {
      body {
        background: #0f172a;
        padding: 24px 12px;
        margin: 0;
        display: block !important;
      }
      .cover-page, .playbook-section {
        background: #ffffff;
        color: #0f172a;
        width: 8.5in;
        max-width: 8.5in;
        margin: 0 auto 32px auto !important;
        padding: 0.4in 0.45in !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        border-radius: 8px;
        min-height: 10.5in;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body>
  ${includeCoverPage ? `
  <!-- COVER PAGE -->
  <div class="cover-page">
    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px;">
      <div style="font-size: 13pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #1e3a8a;">
        🏈 ${teamName} &bull; ${teamSeason}
      </div>
      <h1 style="font-size: 24pt; font-weight: 950; margin: 8px 0 4px 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.02em;">
        ${title}
      </h1>
      <div style="font-size: 10pt; font-weight: 700; color: #475569;">
        Official Team Schemes, Alignment Rules, Route Trees &amp; Player Assignments
      </div>
      ${headCoachName ? `<div style="font-size: 9.5pt; font-weight: 700; color: #1e3a8a; margin-top: 4px;">Head Coach: ${headCoachName}</div>` : ''}
    </div>

    <!-- Table of Contents -->
    <div style="margin: 20px 0; flex: 1;">
      <div style="font-size: 11pt; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em;">
        📋 Table of Contents &amp; Section Index:
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${tocHtml}
      </div>
    </div>

    <!-- Footer Tenets -->
    <div style="border-top: 2px solid #0f172a; padding-top: 12px; text-align: center;">
      <div style="font-size: 10pt; font-weight: 900; color: #0f172a; letter-spacing: 0.08em; text-transform: uppercase;">
        ALIGNMENT &bull; ASSIGNMENT &bull; TECHNIQUE &bull; EFFORT
      </div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 4px;">
        Assembled &amp; Printed on ${currentDate} &bull; Confidential &bull; For Team &amp; Coaching Staff Use Only
      </div>
    </div>
  </div>
  ` : ''}

  <!-- SECTION PAGES -->
  ${pagesHtml}
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// PRACTICE HOUR & ACCLIMATIZATION COMPLIANCE REPORT PRINT ENGINE
// -----------------------------------------------------------------------------

export interface PracticeHourReportOptions {
  teamName?: string;
  seasonName?: string;
  seasonConfig?: SeasonConfig;
  roster: RosterPlayer[];
  attendanceLogs: AttendanceRecord[];
  filterType?: 'all' | 'needs_scrimmage' | 'needs_conditioning' | 'needs_pads' | 'cleared';
  notes?: string;
  certifiedCoachName?: string;
}

export function generatePracticeHourReportHTML(options: PracticeHourReportOptions): string {
  const {
    teamName = 'Mahopac 10U Youth Football',
    seasonName = '2026 Fall Youth Season',
    seasonConfig,
    roster,
    attendanceLogs,
    filterType = 'all',
    notes = '',
    certifiedCoachName = 'Head Coach',
  } = options;

  const generatedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const generatedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate compliance and hours for each player
  const playerStats = roster.map((player) => {
    const comp = calculatePlayerCompliance(player);
    const hours = calculatePlayerHours(player, attendanceLogs, 'pre-1', seasonConfig);
    return {
      player,
      comp,
      hours,
    };
  });

  // Filter based on filterType
  const filteredStats = playerStats.filter(({ comp }) => {
    if (filterType === 'needs_scrimmage') return !comp.isScrimmageCleared;
    if (filterType === 'needs_conditioning') return !comp.isConditioningCleared;
    if (filterType === 'needs_pads') return comp.isConditioningCleared && !comp.isScrimmageCleared;
    if (filterType === 'cleared') return comp.isScrimmageCleared;
    return true;
  });

  // Aggregate stats
  const totalRoster = roster.length;
  const scrimmageClearedCount = playerStats.filter((p) => p.comp.isScrimmageCleared).length;
  const needsScrimmageCount = totalRoster - scrimmageClearedCount;
  const needsCondCount = playerStats.filter((p) => !p.comp.isConditioningCleared).length;
  const needsPadsCount = playerStats.filter(
    (p) => p.comp.isConditioningCleared && !p.comp.isScrimmageCleared
  ).length;

  const isFiltered = filterType !== 'all';
  const reportTitle =
    filterType === 'needs_scrimmage'
      ? 'OFFICIAL SCRIMMAGE ELIGIBILITY DEFICIENCY REPORT'
      : isFiltered
      ? `OFFICIAL PRACTICE HOURS REPORT (${filterType.toUpperCase().replace('_', ' ')})`
      : 'OFFICIAL PRACTICE HOUR & ACCLIMATIZATION COMPLIANCE REPORT';

  const reportSubtitle =
    filterType === 'needs_scrimmage'
      ? 'Roster of athletes currently needing conditioning or padded contact hours before participating in live scrimmages'
      : 'Mandatory 10-Hour Conditioning & 10-Hour Padded Contact Acclimatization Verification Log';

  // Build preseason week columns (Pre-1 to Pre-4)
  const preseasonCount = seasonConfig?.preseasonWeeksCount || 4;
  const preWeekKeys = seasonConfig?.preseasonWeekKeys || ['pre-1', 'pre-2', 'pre-3', 'pre-4'].slice(0, preseasonCount);

  let rowsHtml = '';
  filteredStats.forEach(({ player, comp, hours }, index) => {
    const isCleared = comp.isScrimmageCleared;
    const condCapped = Math.min(10, comp.conditioningHours);
    const padCapped = Math.min(10, comp.paddedHours);
    const isCondMet = comp.conditioningHours >= 10;
    const isPadMet = comp.paddedHours >= 10;

    let scrimmageStatusBadge = '';
    if (isCleared) {
      scrimmageStatusBadge = `
        <span style="display: inline-block; padding: 3px 8px; font-size: 8.5pt; font-weight: 900; color: #065f46; background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; text-transform: uppercase;">
          CLEARED ✓ (Good)
        </span>
      `;
    } else if (!comp.isConditioningCleared) {
      scrimmageStatusBadge = `
        <span style="display: inline-block; padding: 3px 8px; font-size: 8.5pt; font-weight: 900; color: #991b1b; background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; text-transform: uppercase;">
          NEEDS COND (${(10 - condCapped).toFixed(1)}h left)
        </span>
      `;
    } else {
      scrimmageStatusBadge = `
        <span style="display: inline-block; padding: 3px 8px; font-size: 8.5pt; font-weight: 900; color: #991b1b; background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; text-transform: uppercase;">
          NEEDS PADS (${(10 - padCapped).toFixed(1)}h left)
        </span>
      `;
    }

    const condCell = isCondMet
      ? `<span style="font-weight: 800; color: #065f46;">${condCapped.toFixed(1)} / 10.0h</span> <span style="font-size: 7.5pt; background: #d1fae5; color: #065f46; padding: 1px 4px; border-radius: 4px; font-weight: 900;">MET ✓</span>`
      : `<span style="font-weight: 800; color: #991b1b;">${condCapped.toFixed(1)} / 10.0h</span> <span style="font-size: 7.5pt; background: #fee2e2; color: #991b1b; padding: 1px 4px; border-radius: 4px; font-weight: 900;">-${(10 - condCapped).toFixed(1)}h</span>`;

    const padCell = isPadMet
      ? `<span style="font-weight: 800; color: #065f46;">${padCapped.toFixed(1)} / 10.0h</span> <span style="font-size: 7.5pt; background: #d1fae5; color: #065f46; padding: 1px 4px; border-radius: 4px; font-weight: 900;">MET ✓</span>`
      : `<span style="font-weight: 800; color: #991b1b;">${padCapped.toFixed(1)} / 10.0h</span> <span style="font-size: 7.5pt; background: #fee2e2; color: #991b1b; padding: 1px 4px; border-radius: 4px; font-weight: 900;">-${(10 - padCapped).toFixed(1)}h</span>`;

    const preSeasonTotal = (condCapped + padCapped).toFixed(1);

    // Preseason week hours
    const preWeekCells = preWeekKeys
      .map((key) => {
        const h = hours.weeklyHours[key] || 0;
        return `<td style="text-align: center; font-family: monospace; font-size: 8.5pt; color: ${h > 0 ? '#0f172a' : '#94a3b8'};">${h > 0 ? h.toFixed(1) + 'h' : '-'}</td>`;
      })
      .join('');

    const positions = [player.offensivePosition || player.primaryPosition, player.defensivePosition || player.secondaryPosition]
      .filter(Boolean)
      .join(' / ') || player.primaryPosition || '-';

    const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

    rowsHtml += `
      <tr style="background: ${rowBg}; border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 5px 6px; font-family: monospace; font-weight: 900; text-align: center; color: #0f172a; font-size: 9pt;">
          #${player.num}
        </td>
        <td style="padding: 5px 8px; font-weight: 800; color: #0f172a; font-size: 9pt;">
          ${player.firstName} ${player.lastName}
          ${player.isCaptain ? '<span style="font-size: 7.5pt; color: #d97706; font-weight: 900; margin-left: 4px;">[C]</span>' : ''}
        </td>
        <td style="padding: 5px 6px; font-size: 8pt; color: #475569; font-weight: 700;">
          ${positions}
        </td>
        <td style="padding: 5px 6px; text-align: center; font-size: 8.5pt;">
          ${condCell}
        </td>
        <td style="padding: 5px 6px; text-align: center; font-size: 8.5pt;">
          ${padCell}
        </td>
        <td style="padding: 5px 6px; text-align: center; font-family: monospace; font-size: 9pt; font-weight: 800; color: #0f172a; background: #f1f5f9;">
          ${preSeasonTotal}h
        </td>
        ${preWeekCells}
        <td style="padding: 5px 6px; text-align: center; font-family: monospace; font-size: 9pt; font-weight: 900; color: #0f172a;">
          ${hours.totalSeasonHours.toFixed(1)}h
        </td>
        <td style="padding: 5px 6px; text-align: center;">
          ${scrimmageStatusBadge}
        </td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - ${teamName}</title>
  <style>
    @page {
      size: landscape;
      margin: 0.35in;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 9pt;
      line-height: 1.3;
    }
    .report-container {
      width: 100%;
      max-width: 100%;
    }
    .header-bar {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title {
      font-size: 16pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      color: #0f172a;
      margin: 0;
    }
    .header-sub {
      font-size: 8.5pt;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }
    .header-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 8pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 4px;
      margin-bottom: 4px;
      background: #0f172a;
      color: #ffffff;
    }
    .meta-box {
      text-align: right;
      font-size: 8pt;
      color: #475569;
      line-height: 1.4;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .summary-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px 10px;
      background: #f8fafc;
    }
    .summary-card.alert {
      border-color: #f87171;
      background: #fef2f2;
    }
    .summary-card.success {
      border-color: #34d399;
      background: #ecfdf5;
    }
    .summary-title {
      font-size: 7.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }
    .summary-value {
      font-size: 14pt;
      font-weight: 900;
      color: #0f172a;
      margin-top: 1px;
    }
    .summary-desc {
      font-size: 7pt;
      color: #64748b;
      margin-top: 1px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 10px;
    }
    thead {
      display: table-header-group;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      padding: 5px 6px;
      font-size: 8pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: center;
      border: 1px solid #0f172a;
    }
    th.left-align {
      text-align: left;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .mandate-callout {
      border: 1.5px dashed #94a3b8;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 7.5pt;
      color: #334155;
      line-height: 1.35;
    }
    .mandate-callout strong {
      color: #0f172a;
    }
    .signoff-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1.5px solid #cbd5e1;
      font-size: 8pt;
    }
    .sign-line {
      border-bottom: 1px solid #0f172a;
      height: 24px;
      margin-top: 20px;
    }
    .sign-label {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="header-badge">${teamName} &bull; ${seasonName}</div>
        <h1 class="header-title">${reportTitle}</h1>
        <div class="header-sub">${reportSubtitle}</div>
      </div>
      <div class="meta-box">
        <div><strong>Date:</strong> ${generatedDate} at ${generatedTime}</div>
        <div><strong>Scope:</strong> ${isFiltered ? `${filteredStats.length} Athlete(s) Filtered` : `Full Roster (${totalRoster} Athletes)`}</div>
        <div><strong>Acclimatization Rule:</strong> 10.0h Cond + 10.0h Pads Required</div>
      </div>
    </div>

    <!-- Executive Summary Grid -->
    <div class="summary-grid">
      <div class="summary-card success">
        <div class="summary-title" style="color: #065f46;">Full Scrimmage Cleared</div>
        <div class="summary-value" style="color: #065f46;">${scrimmageClearedCount} <span style="font-size: 9pt; font-weight: 700;">/ ${totalRoster}</span></div>
        <div class="summary-desc" style="color: #047857;">${Math.round((scrimmageClearedCount / (totalRoster || 1)) * 100)}% roster met 10h Cond + 10h Pads</div>
      </div>

      <div class="summary-card ${needsScrimmageCount > 0 ? 'alert' : ''}">
        <div class="summary-title" style="color: ${needsScrimmageCount > 0 ? '#991b1b' : '#64748b'};">Needs Scrimmage Hours</div>
        <div class="summary-value" style="color: ${needsScrimmageCount > 0 ? '#991b1b' : '#0f172a'};">${needsScrimmageCount}</div>
        <div class="summary-desc" style="color: ${needsScrimmageCount > 0 ? '#b91c1c' : '#64748b'};">Athletes ineligible for live contact scrimmages</div>
      </div>

      <div class="summary-card ${needsPadsCount > 0 ? 'alert' : ''}">
        <div class="summary-title" style="color: ${needsPadsCount > 0 ? '#991b1b' : '#64748b'};">Needs Padded Hours</div>
        <div class="summary-value" style="color: ${needsPadsCount > 0 ? '#991b1b' : '#0f172a'};">${needsPadsCount}</div>
        <div class="summary-desc" style="color: ${needsPadsCount > 0 ? '#b91c1c' : '#64748b'};">Wearing pads; working toward 10.0h padded</div>
      </div>

      <div class="summary-card ${needsCondCount > 0 ? 'alert' : ''}">
        <div class="summary-title" style="color: ${needsCondCount > 0 ? '#991b1b' : '#64748b'};">Needs Conditioning</div>
        <div class="summary-value" style="color: ${needsCondCount > 0 ? '#991b1b' : '#0f172a'};">${needsCondCount}</div>
        <div class="summary-desc" style="color: ${needsCondCount > 0 ? '#b91c1c' : '#64748b'};">Tee &amp; shorts; needs 10.0h conditioning</div>
      </div>
    </div>

    <!-- Mandatory Acclimatization Notice Callout -->
    <div class="mandate-callout">
      <strong>MANDATORY YOUTH ACCLIMATIZATION PROTOCOL (NYSPHSAA / USA FOOTBALL):</strong>
      Athletes must strictly complete <strong>10.0 hours of conditioning</strong> (helmets and shorts only) before being permitted to wear full contact pads. Subsequently, athletes must log a minimum of <strong>10.0 hours in full contact pads</strong> before participating in any inter-squad scrimmage, live scrimmage, or league competition (20.0 total pre-scrimmage hours). All acclimatization phase hours are capped at 10.0h maximum.
    </div>

    <!-- Player Hours Roster Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 4%;">#</th>
          <th class="left-align" style="width: 18%;">Athlete Name</th>
          <th class="left-align" style="width: 11%;">Position(s)</th>
          <th style="width: 14%;">Conditioning (Max 10h)</th>
          <th style="width: 14%;">Padded Contact (Max 10h)</th>
          <th style="width: 7%;">Pre-Season</th>
          ${preWeekKeys.map((k) => `<th style="width: 4.5%; font-size: 7.5pt;">${formatWeekLabel(k, seasonConfig)}</th>`).join('')}
          <th style="width: 6.5%;">Season</th>
          <th style="width: 14%;">Scrimmage Clearance</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${notes ? `<div style="margin-bottom: 8px; font-size: 8pt; color: #475569; font-style: italic;"><strong>Coach Notes:</strong> ${notes}</div>` : ''}

    <!-- Official Sign-off & Certification Lines -->
    <div class="signoff-section">
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">Head Coach Signature &bull; Date</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">League Compliance Officer / Athletic Director &bull; Date</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">Safety &amp; Equipment Coordinator &bull; Date</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function printPracticeHourReport(options: PracticeHourReportOptions) {
  const html = generatePracticeHourReportHTML(options);
  const title = options.filterType === 'needs_scrimmage'
    ? 'Scrimmage_Eligibility_Deficiency_Report'
    : 'Practice_Hour_Compliance_Report';
  printCleanHTML(html, title);
}

// -----------------------------------------------------------------------------
// SINGLE PLAYER OFFICIAL PRACTICE ATTENDANCE CERTIFICATE
// -----------------------------------------------------------------------------

export interface SinglePlayerHourReportOptions {
  teamName?: string;
  seasonName?: string;
  seasonConfig?: SeasonConfig;
  player: RosterPlayer;
  attendanceLogs: AttendanceRecord[];
  scope?: 'season' | 'preseason';
  notes?: string;
}

export function generateSinglePlayerHourReportHTML(options: SinglePlayerHourReportOptions): string {
  const {
    teamName = 'Mahopac 10U Youth Football',
    seasonName = '2026 Fall Youth Season',
    seasonConfig,
    player,
    attendanceLogs,
    scope = 'preseason',
  } = options;

  const breakdown = getPlayerHoursBreakdown(player, attendanceLogs, scope, 'pre-1', seasonConfig);
  const comp = calculatePlayerCompliance(player);

  const generatedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const condCapped = Math.min(10, breakdown.conditioningHours);
  const padCapped = Math.min(10, breakdown.paddedHours);
  const isCondMet = breakdown.conditioningHours >= 10;
  const isPadMet = breakdown.paddedHours >= 10;
  const isCleared = comp.isScrimmageCleared;

  let practiceRowsHtml = '';
  breakdown.days.forEach((d, idx) => {
    practiceRowsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; text-align: center; font-family: monospace; font-weight: 700;">#${idx + 1}</td>
        <td style="padding: 6px 8px; font-weight: 700;">${d.formattedDate}</td>
        <td style="padding: 6px 8px; color: #475569; font-size: 8.5pt;">${d.weekLabel}</td>
        <td style="padding: 6px 8px; font-weight: 700;">${d.title}</td>
        <td style="padding: 6px 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; font-size: 7.5pt; font-weight: 800; border-radius: 4px; text-transform: uppercase; ${
            d.playerAttire === 'conditioning'
              ? 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;'
              : 'background: #e0f2fe; color: #0369a1; border: 1px solid #38bdf8;'
          }">
            ${d.playerAttire === 'conditioning' ? '⚡ Conditioning' : '🛡️ Full Pads'}
          </span>
        </td>
        <td style="padding: 6px 8px; text-align: center; font-family: monospace; font-weight: 700;">${d.hours.toFixed(1)} hrs</td>
        <td style="padding: 6px 8px; text-align: center;">
          ${
            d.wasPresent
              ? '<span style="color: #065f46; font-weight: 900;">✓ Present</span>'
              : '<span style="color: #991b1b; font-weight: 900;">✗ Absent</span>'
          }
        </td>
        <td style="padding: 6px 8px; text-align: center; font-family: monospace; font-weight: 900; background: #f1f5f9;">
          ${d.runningTotal.toFixed(1)} hrs
        </td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practice Attendance Certificate - #${player.num} ${player.firstName} ${player.lastName}</title>
  <style>
    @page { size: portrait; margin: 0.4in; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; font-size: 9.5pt; line-height: 1.35; }
    .header { border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 16pt; font-weight: 900; text-transform: uppercase; margin: 0; }
    .sub { font-size: 9pt; color: #475569; margin-top: 2px; }
    .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .status-card { border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #f8fafc; }
    .status-card.good { border-color: #34d399; background: #ecfdf5; }
    .status-card.need { border-color: #f87171; background: #fef2f2; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
    th { background: #0f172a; color: #fff; padding: 6px 8px; text-align: left; font-size: 8pt; font-weight: 900; text-transform: uppercase; }
    .sign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; border-top: 1.5px solid #cbd5e1; padding-top: 14px; }
    .line { border-bottom: 1px solid #0f172a; height: 26px; }
    .lbl { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size: 8.5pt; font-weight: 900; text-transform: uppercase; color: #475569;">${teamName} &bull; ${seasonName}</div>
      <h1 class="title">Official Practice Attendance &amp; Acclimatization Record</h1>
      <div class="sub">Individual Player Compliance Verification Certificate</div>
    </div>
    <div style="text-align: right; font-size: 8.5pt; color: #475569;">
      <div><strong>Date:</strong> ${generatedDate}</div>
      <div><strong>Roster Status:</strong> Active 10U Athlete</div>
    </div>
  </div>

  <div style="background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 18pt; font-weight: 900; font-family: monospace; background: #0f172a; color: #fff; padding: 4px 12px; border-radius: 6px;">#${player.num}</span>
      <div>
        <div style="font-size: 14pt; font-weight: 900; color: #0f172a;">${player.firstName} ${player.lastName}</div>
        <div style="font-size: 8.5pt; color: #475569; font-weight: 700;">
          Position: ${player.primaryPosition || '-'} ${player.secondaryPosition ? `&bull; ${player.secondaryPosition}` : ''}
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 8pt; font-weight: 900; text-transform: uppercase; color: #64748b;">Scrimmage Clearance</div>
      <div style="margin-top: 2px;">
        ${
          isCleared
            ? '<span style="background: #d1fae5; color: #065f46; border: 1px solid #10b981; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 9pt;">CLEARED FOR LIVE SCRIMMAGE ✓</span>'
            : '<span style="background: #fee2e2; color: #991b1b; border: 1px solid #f87171; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 9pt;">NOT CLEARED - NEEDS PRACTICE HOURS</span>'
        }
      </div>
    </div>
  </div>

  <div class="status-grid">
    <div class="status-card ${isCondMet ? 'good' : 'need'}">
      <div style="font-size: 8pt; font-weight: 900; text-transform: uppercase; color: ${isCondMet ? '#065f46' : '#991b1b'};">Conditioning (Max 10.0h)</div>
      <div style="font-size: 16pt; font-weight: 900; color: ${isCondMet ? '#065f46' : '#991b1b'}; margin-top: 2px;">
        ${condCapped.toFixed(1)} / 10.0 hrs
      </div>
      <div style="font-size: 7.5pt; font-weight: 800; color: ${isCondMet ? '#047857' : '#b91c1c'}; margin-top: 2px;">
        ${isCondMet ? '✓ 10.0h Required Standard Met (Good)' : `Needs ${(10 - condCapped).toFixed(1)}h conditioning`}
      </div>
    </div>

    <div class="status-card ${isPadMet ? 'good' : 'need'}">
      <div style="font-size: 8pt; font-weight: 900; text-transform: uppercase; color: ${isPadMet ? '#065f46' : '#991b1b'};">Padded Contact (Max 10.0h)</div>
      <div style="font-size: 16pt; font-weight: 900; color: ${isPadMet ? '#065f46' : '#991b1b'}; margin-top: 2px;">
        ${padCapped.toFixed(1)} / 10.0 hrs
      </div>
      <div style="font-size: 7.5pt; font-weight: 800; color: ${isPadMet ? '#047857' : '#b91c1c'}; margin-top: 2px;">
        ${isPadMet ? '✓ 10.0h Required Standard Met (Good)' : `Needs ${(10 - padCapped).toFixed(1)}h contact pads`}
      </div>
    </div>

    <div class="status-card good">
      <div style="font-size: 8pt; font-weight: 900; text-transform: uppercase; color: #065f46;">Attended Practices</div>
      <div style="font-size: 16pt; font-weight: 900; color: #065f46; margin-top: 2px;">
        ${breakdown.attendedSessionsCount} <span style="font-size: 10pt; font-weight: 700;">/ ${breakdown.totalSessionsCount}</span>
      </div>
      <div style="font-size: 7.5pt; font-weight: 800; color: #047857; margin-top: 2px;">
        ${breakdown.attendanceRate}% Attendance Rate
      </div>
    </div>
  </div>

  <div style="font-size: 9pt; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.04em;">
    Itemized Practice Attendance Log (${breakdown.scopeLabel}):
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">#</th>
        <th style="width: 15%;">Date</th>
        <th style="width: 14%;">Week</th>
        <th style="width: 26%;">Practice Title</th>
        <th style="width: 16%; text-align: center;">Attire</th>
        <th style="width: 8%; text-align: center;">Hours</th>
        <th style="width: 8%; text-align: center;">Status</th>
        <th style="width: 8%; text-align: center;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${practiceRowsHtml}
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 8pt; font-family: monospace; color: #334155; margin-bottom: 12px;">
    <strong>Calculation Formula:</strong> ${breakdown.formulaEquation}
  </div>

  <div class="sign-row">
    <div>
      <div class="line"></div>
      <div class="lbl">Certified Head Coach Signature &bull; Date</div>
    </div>
    <div>
      <div class="line"></div>
      <div class="lbl">League Compliance Director &bull; Date</div>
    </div>
  </div>
</body>
</html>`;
}

export function printSinglePlayerHourReport(options: SinglePlayerHourReportOptions) {
  const html = generateSinglePlayerHourReportHTML(options);
  const title = `Practice_Certificate_${options.player.firstName}_${options.player.lastName}_#${options.player.num}`;
  printCleanHTML(html, title);
}

/**
 * Generates clean, standalone printable HTML for physical 4.5" x 2.25" wristband inserts.
 * Renders exact dimensions, dashed cut guides, team branding, colored column badges,
 * and high-contrast play typography.
 */
export function generateWristbandPrintHTML(
  wristbands: SingleWristband[],
  activeTeamName: string = 'Mahopac 10U',
  documentTitle?: string
): string {
  const title = documentTitle || `${activeTeamName} Wristband Inserts`;

  const getContrastColor = (hexColor: string, defaultColor?: string): string => {
    if (defaultColor) return defaultColor;
    if (!hexColor) return '#000000';
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
  };

  const getSlotLabel = (
    wb: SingleWristband,
    wbIndex: number,
    colIdx: number,
    rowIdx: number,
    play?: WristbandPlay
  ): string => {
    if (play?.customLabel && isNaN(Number(play.customLabel))) return play.customLabel;
    const mode = wb.labelingMode || 'continuous';
    const rows = wb.rowsCount || 13;

    if (mode === 'same_per_card') {
      return String(colIdx * rows + rowIdx + 1);
    }
    if (mode === 'letter_num') {
      const letter = colIdx === 0 ? 'A' : colIdx === 1 ? 'B' : 'C';
      return `${letter}${rowIdx + 1}`;
    }
    // Continuous numbering starting after previous wristband
    const wbStart = getWristbandStartNumber(wristbands, wbIndex);
    return String(wbStart + colIdx * rows + rowIdx);
  };

  const cardsHtml = wristbands
    .map((wb, wbIdx) => {
      const rows = wb.rowsCount || 13;
      const cols = wb.columns && wb.columns.length > 0 ? wb.columns : [
        { color: '#facc15', plays: [] },
        { color: '#38bdf8', plays: [] },
      ];

      const colHeadersHtml = cols
        .map((col, cIdx) => {
          const colBg = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#38bdf8');
          const colText = col.headerTextColor || getContrastColor(colBg, col.numberTextColor);
          const colName =
            col.name ||
            (cIdx === 0 ? `COL 1 (1 - ${rows})` : `COL 2 (${rows + 1} - ${rows * 2})`);

          return `
            <div class="col-head" style="background-color: ${colBg}; color: ${colText};">
              ${colName}
            </div>
          `;
        })
        .join('');

      const colsBodyHtml = cols
        .map((col, cIdx) => {
          const plays = col.plays || [];
          const colBg = col.numberBgColor || col.color || (cIdx === 0 ? '#facc15' : '#38bdf8');

          const rowsHtml = Array.from({ length: rows })
            .map((_, rIdx) => {
              const play = plays[rIdx] || { text: '' };
              const slotLabel = getSlotLabel(wb, wbIdx, cIdx, rIdx, play);
              const numberBg = play.numberHighlightColor || colBg;
              const numberTextColor = play.numberTextColor || col.numberTextColor || getContrastColor(numberBg);
              const rowBg = play.rowHighlightColor || '#ffffff';
              const playText = (play.text || '—').trim() || '—';

              return `
                <div class="row-item" style="background-color: ${rowBg}; height: calc(100% / ${rows});">
                  <div class="slot-num" style="background-color: ${numberBg}; color: ${numberTextColor};">
                    ${slotLabel}
                  </div>
                  <div class="slot-text">
                    ${playText}
                  </div>
                </div>
              `;
            })
            .join('');

          return `
            <div class="col-body">
              ${rowsHtml}
            </div>
          `;
        })
        .join('');

      return `
        <div class="card-wrapper">
          <div class="cut-guide">
            <span>✂ CUT ALONG DASHED LINE</span>
            <span>STANDARD 4.5&quot; &times; 2.25&quot; WRIST COACH INSERT</span>
          </div>
          <div class="card-box">
            <div class="card-header">
              ${wb.title || 'WRISTBAND INSERT'} &bull; ${activeTeamName.toUpperCase()}
            </div>
            <div class="cols-header">
              ${colHeadersHtml}
            </div>
            <div class="cols-grid">
              ${colsBodyHtml}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.35in;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #000000;
    }
    .print-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #0f172a;
    }
    .print-header h1 {
      font-size: 14pt;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: 0.04em;
    }
    .print-header p {
      font-size: 8.5pt;
      color: #475569;
      margin: 3px 0 0 0;
      font-weight: 700;
    }
    .cards-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 26px;
      margin: 0 auto;
    }
    .card-wrapper {
      page-break-inside: avoid;
      break-inside: avoid;
      width: 4.5in;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cut-guide {
      width: 4.5in;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.5pt;
      font-family: monospace;
      font-weight: bold;
      color: #334155;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
    }
    .card-box {
      width: 4.5in;
      height: 2.25in;
      min-width: 4.5in;
      max-width: 4.5in;
      min-height: 2.25in;
      max-height: 2.25in;
      border: 1.5px dashed #000000;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }
    .card-header {
      background: #000000;
      color: #ffffff;
      text-align: center;
      font-family: monospace, sans-serif;
      font-size: 9pt;
      font-weight: 900;
      text-transform: uppercase;
      padding: 2px 4px;
      border-bottom: 1.5px solid #000000;
      letter-spacing: 0.04em;
      height: 18px;
      line-height: 15px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .cols-header {
      display: flex;
      border-bottom: 1.5px solid #000000;
      height: 16px;
      flex-shrink: 0;
    }
    .col-head {
      flex: 1;
      text-align: center;
      font-family: monospace, sans-serif;
      font-size: 8pt;
      font-weight: 900;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1.5px solid #000000;
      overflow: hidden;
      white-space: nowrap;
      padding: 0 4px;
    }
    .col-head:last-child {
      border-right: none;
    }
    .cols-grid {
      display: flex;
      flex: 1;
      overflow: hidden;
      height: calc(2.25in - 34px);
    }
    .col-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1.5px solid #000000;
      height: 100%;
      overflow: hidden;
    }
    .col-body:last-child {
      border-right: none;
    }
    .row-item {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid rgba(0, 0, 0, 0.25);
      font-size: 8pt;
      line-height: 1;
      overflow: hidden;
      box-sizing: border-box;
    }
    .row-item:last-child {
      border-bottom: none;
    }
    .slot-num {
      width: 22px;
      min-width: 22px;
      max-width: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace, sans-serif;
      font-weight: 900;
      font-size: 8pt;
      border-right: 1px solid rgba(0, 0, 0, 0.4);
      user-select: none;
      flex-shrink: 0;
    }
    .slot-text {
      flex: 1;
      padding: 0 4px;
      display: flex;
      align-items: center;
      font-family: monospace, -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 900;
      font-size: 7.5pt;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #000000;
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>${activeTeamName} &bull; Game Day Wristband Cutouts</h1>
    <p>Standard 4.5&quot; &times; 2.25&quot; Inserts &bull; Ready for Sleeve Lamination &bull; High Contrast Font</p>
  </div>
  <div class="cards-container">
    ${cardsHtml}
  </div>
</body>
</html>`;
}

/**
 * Print wristband cards using dedicated isolated print engine.
 * Never modifies main window DOM or causes state re-renders.
 */
export function printWristbandInserts(
  wristbands: SingleWristband[],
  activeTeamName: string = 'Mahopac 10U',
  documentTitle?: string
) {
  const html = generateWristbandPrintHTML(wristbands, activeTeamName, documentTitle);
  const title = documentTitle || `${activeTeamName}_Wristband_Inserts`;
  printCleanHTML(html, title);
}


