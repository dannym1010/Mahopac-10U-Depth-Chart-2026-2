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
