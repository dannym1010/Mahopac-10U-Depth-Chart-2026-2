/**
 * Safe Print Utility
 * Handles print invocations reliably across desktop, mobile, iframe, and physical printer spoolers.
 * Prevents DOM-mutation race conditions and layout lockups that cause physical printer drivers to freeze or stall.
 */

export interface PrintOptions {
  beforePrint?: () => void;
  afterPrint?: () => void;
  targetElementSelector?: string;
  documentTitle?: string;
}

/**
 * Standard triggerPrint that prepares document DOM, flattens ancestors, and invokes print safely.
 */
export function triggerPrint(options?: PrintOptions) {
  if (typeof window === 'undefined') return;

  const { beforePrint, afterPrint } = options || {};

  // Add printing class to body to enforce immediate layout flattening
  document.documentElement.classList.add('is-printing');
  document.body.classList.add('is-printing');

  if (beforePrint) {
    try {
      beforePrint();
    } catch (err) {
      console.error('Error during beforePrint:', err);
    }
  }

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
        console.error('Error during afterPrint:', err);
      }
    }
  };

  const onFocusReturn = () => {
    // When returning from the OS print dialog or cancelling, window regains focus
    setTimeout(doCleanup, 350);
  };

  window.addEventListener('afterprint', doCleanup, { once: true });
  window.addEventListener('focus', onFocusReturn, { once: true });

  // Allow browser layout and paint cycle to settle before initiating print job
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.error('window.print() error:', e);
          doCleanup();
        }
      }, 60);
    });
  });
}

/**
 * Print an isolated DOM element via a temporary clean iframe.
 * Completely isolates the printed content from React app DOM trees, backdrop filters, and flex layouts,
 * which eliminates physical printer spooler hangs on all printer brands (HP, Canon, Brother, Epson).
 */
export function printCleanElement(selector: string, title?: string) {
  if (typeof window === 'undefined') return;

  const targetEl = document.querySelector(selector);
  if (!targetEl) {
    // Fallback to standard triggerPrint if selector not found
    triggerPrint();
    return;
  }

  try {
    // Create an invisible iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      triggerPrint();
      return;
    }

    // Collect active stylesheets
    let stylesHtml = '';
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((el) => {
      stylesHtml += el.outerHTML;
    });

    const pageTitle = title || document.title || 'Print Document';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${pageTitle}</title>
          ${stylesHtml}
          <style>
            @page {
              size: letter portrait;
              margin: 0.25in;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            *, *::before, *::after {
              animation: none !important;
              transition: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              backdrop-filter: none !important;
            }
            .print\\:hidden, .hidden-print {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }
            .practice-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .practice-table thead {
              display: table-header-group !important;
            }
            .practice-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .practice-table th, .practice-table td {
              border: 1.2px solid #000000 !important;
              padding: 4px 6px !important;
              color: #000000 !important;
            }
            .formation-container {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              border: 2px solid #000000 !important;
              margin-bottom: 12px !important;
            }
          </style>
        </head>
        <body class="is-printing">
          ${targetEl.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    const cleanup = () => {
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (err) {
        console.error('Error removing print iframe:', err);
      }
    };

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error:', err);
      } finally {
        setTimeout(cleanup, 1000);
      }
    }, 250);
  } catch (err) {
    console.error('Failed to setup isolated print iframe:', err);
    triggerPrint();
  }
}

