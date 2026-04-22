import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import * as adhan from 'adhan';

const APP_PORT = 3000;

// Major Senegalese Cities with coordinates
const SENEGAL_CITIES = [
  { name: 'Dakar', lat: 14.7167, lng: -17.4677 },
  { name: 'Touba', lat: 14.8647, lng: -15.8878 },
  { name: 'Thiès', lat: 14.791, lng: -16.9298 },
  { name: 'Kaolack', lat: 14.1333, lng: -16.0833 },
  { name: 'Saint-Louis', lat: 16.0333, lng: -16.5 },
  { name: 'Mbour', lat: 14.4167, lng: -16.9667 },
  { name: 'Ziguinchor', lat: 12.5833, lng: -16.2719 },
  { name: 'Diourbel', lat: 14.65, lng: -16.2333 },
  { name: 'Louga', lat: 15.6167, lng: -16.2333 },
  { name: 'Tambacounda', lat: 13.77, lng: -13.67 },
  { name: 'Kolda', lat: 12.8833, lng: -14.95 },
  { name: 'Matam', lat: 15.6559, lng: -13.2554 },
];

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

    const coordinates = new adhan.Coordinates(latitude, longitude);
    
    // Serigne Mbacke Bousso Method Parameters
    // Fajr: 19.5, Isha: 17.5
    const params = adhan.CalculationMethod.Other();
    params.fajrAngle = 19.5;
    params.ishaAngle = 17.5;
    params.madhab = adhan.Madhab.Shafi; // Equivalent to Maliki (1x shadow)

    const prayerTimes = new adhan.PrayerTimes(coordinates, queryDate, params);

    // Apply standard Senegal "Tamkhine" or rounding if needed
    // Usually, people add a few minutes for security.
    const response = {
      fajr: prayerTimes.fajr,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      sunrise: prayerTimes.sunrise,
      metadata: {
        method: 'Serigne Mbacke Bousso',
        angles: { fajr: 19.5, isha: 17.5 },
        madhab: 'Maliki/Shafi',
        location: { lat: latitude, lng: longitude },
        date: queryDate.toISOString()
      },
      readable: {
        fajr: prayerTimes.fajr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        dhuhr: prayerTimes.dhuhr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        asr: prayerTimes.asr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        maghrib: prayerTimes.maghrib.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isha: prayerTimes.isha.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sunrise: prayerTimes.sunrise.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
    };

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
