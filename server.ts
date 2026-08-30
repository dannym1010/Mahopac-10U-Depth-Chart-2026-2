import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // TeamSnap iCal proxy fetch to avoid CORS blocks
  app.all(['/api/teamsnap/fetch-ical'], async (req, res) => {
    try {
      let url = req.method === 'POST' ? req.body?.url : req.query?.url;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing calendar feed URL.' });
      }

      // Clean & normalize URL
      url = url.trim().replace(/^["']|["']$/g, '');
      
      let targetUrl = url;
      if (targetUrl.startsWith('webcal://')) {
        targetUrl = 'https://' + targetUrl.substring(9);
      }

      // Candidate URLs to try (in order of preference)
      const urlsToTry: string[] = [];
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        urlsToTry.push(targetUrl);
        if (targetUrl.startsWith('https://')) {
          urlsToTry.push('http://' + targetUrl.substring(8));
        } else if (targetUrl.startsWith('http://')) {
          urlsToTry.push('https://' + targetUrl.substring(7));
        }
      } else {
        urlsToTry.push('https://' + targetUrl);
        urlsToTry.push('http://' + targetUrl);
      }

      let icsContent = '';
      let lastError: any = null;

      for (const tryUrl of urlsToTry) {
        try {
          const response = await fetch(tryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/calendar, text/plain, */*',
            },
            redirect: 'follow',
          });

          if (response.ok) {
            const text = await response.text();
            if (text && text.includes('BEGIN:VCALENDAR')) {
              icsContent = text;
              break;
            }
          } else {
            lastError = new Error(`HTTP ${response.status} from ${tryUrl}`);
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
        return res.status(400).json({
          error: `Could not retrieve a valid iCal feed. ${lastError ? lastError.message : 'Please check URL.'}`,
        });
      }

      return res.json({ success: true, icsContent });
    } catch (err: any) {
      console.error('Error fetching TeamSnap calendar:', err);
      return res.status(500).json({ error: err?.message || 'Server failed to retrieve calendar feed.' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Football Operations Server running on port ${PORT}`);
  });
}

startServer();
