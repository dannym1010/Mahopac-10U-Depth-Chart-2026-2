/**
 * Bulletproof Print Engine for Football Manager
 * Handles practice plans, depth charts, wristbands, and schedules.
 * Supports direct window printing, clean standalone iframe printing, and new tab printable view.
 */

import { PracticePlan, PracticePeriod } from '../types';

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
