import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { SENEGAL_CITIES } from './src/lib/constants';
import { calculatePrayerTimes } from './src/lib/prayerUtils';

const APP_PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
  app.use(express.json());

  // API Routes
  app.get('/api/cities', (req, res) => {
    res.json(SENEGAL_CITIES);
  });

  app.get('/api/prayer-times', (req, res) => {
    const { lat, lng, date } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const queryDate = date ? new Date(date as string) : new Date();

    const response = calculatePrayerTimes(latitude, longitude, queryDate);
    res.json(response);
  });

  app.get('/api/prayer-times/city/:cityName', (req, res) => {
    const { cityName } = req.params;
    const { date } = req.query;

    const city = SENEGAL_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());

    if (!city) {
      return res.status(404).json({ error: `City '${cityName}' not found in our database. Use coordinates endpoint or check list of cities.` });
    }

    const queryDate = date ? new Date(date as string) : new Date();
    const response = calculatePrayerTimes(city.lat, city.lng, queryDate);
    
    // Add city name to metadata for clarity
    (response.metadata as any).cityName = city.name;

    res.json(response);
  });

  // Vite Integration
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

  app.listen(APP_PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${APP_PORT}`);
  });
}

startServer();
