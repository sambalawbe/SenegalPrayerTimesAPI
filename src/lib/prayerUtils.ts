import * as adhan from 'adhan';

export function calculatePrayerTimes(latitude: number, longitude: number, date: Date = new Date()) {
  const coordinates = new adhan.Coordinates(latitude, longitude);
  
  // Serigne Mbacke Bousso Method Parameters
  const params = adhan.CalculationMethod.Other();
  params.fajrAngle = 19.5;
  params.ishaAngle = 17.5;
  params.madhab = adhan.Madhab.Shafi; // Equivalent to Maliki (1x shadow)

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
      location: { lat: latitude, lng: longitude },
      date: date.toISOString()
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
}
