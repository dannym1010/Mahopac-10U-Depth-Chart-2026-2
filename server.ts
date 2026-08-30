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
  app.post('/api/teamsnap/fetch-ical', async (req, res) => {
    try {
      let { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing calendar feed URL.' });
      }

      // Normalize webcal:// to https://
      url = url.trim();
      if (url.startsWith('webcal://')) {
        url = 'https://' + url.substring(9);
      } else if (url.startsWith('http://')) {
        url = 'https://' + url.substring(7);
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (FootballOperations/1.0)',
          Accept: 'text/calendar, text/plain, */*',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Failed to fetch from TeamSnap server (Status: ${response.status})`,
        });
      }

      const icsContent = await response.text();
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
