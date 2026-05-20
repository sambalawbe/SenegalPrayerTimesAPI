import * as adhan from 'adhan';

export function calculatePrayerTimes(latitude: number, longitude: number, date: Date = new Date()) {
  const coordinates = new adhan.Coordinates(latitude, longitude);
  
  // Serigne Mbacke Bousso Method Parameters
  const params = adhan.CalculationMethod.Other();
  params.fajrAngle = 19.5;
  params.ishaAngle = 17.5;
  params.madhab = adhan.Madhab.Shafi; // Equivalent to Maliki (1x shadow)

  // Marges de sécurité locales pour le Sénégal (Méthode de Touba / Dakar)
  params.adjustments.fajr = 0;
  params.adjustments.dhuhr = 5;    // +5 min pour garantir le passage du zénith
  params.adjustments.asr = 0;
  params.adjustments.maghrib = 4;  // +4 min recommandées à Touba pour le coucher du soleil
  params.adjustments.isha = 0;

  const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

  return {
    fajr: prayerTimes.fajr.toISOString(),
    dhuhr: prayerTimes.dhuhr.toISOString(),
    asr: prayerTimes.asr.toISOString(),
    maghrib: prayerTimes.maghrib.toISOString(),
    isha: prayerTimes.isha.toISOString(),
    sunrise: prayerTimes.sunrise.toISOString(),
    metadata: {
      method: 'Serigne Mbacke Bousso',
      angles: { fajr: 19.5, isha: 17.5 },
      madhab: 'Maliki/Shafi',
      adjustments: { fajr: 0, dhuhr: 5, asr: 0, maghrib: 4, isha: 0 },
      location: { lat: latitude, lng: longitude },
      date: date.toISOString(),
      timeZone: 'Africa/Dakar'
    },
    readable: {
      fajr: prayerTimes.fajr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
      dhuhr: prayerTimes.dhuhr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
      asr: prayerTimes.asr.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
      maghrib: prayerTimes.maghrib.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
      isha: prayerTimes.isha.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
      sunrise: prayerTimes.sunrise.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }),
    }
  };
}
