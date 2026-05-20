import { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, Code, Download, ExternalLink, Moon, Sun, Info, ChevronRight, Globe, Tv, X, Wifi, WifiOff, Smartphone, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addSeconds, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SENEGAL_CITIES, City, DAILY_VERSES, Verse } from './lib/constants';
import { calculatePrayerTimes } from './lib/prayerUtils';
import daaruImage from './images/daaru.jpg';

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunrise: string;
  readable: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    sunrise: string;
  };
  metadata: {
    method: string;
    location: { lat: number; lng: number };
  };
}

interface Weather {
  temp: number;
  code: number;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [activeTab, setActiveTab] = useState<'demo' | 'api' | 'tv'>('demo');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [showPrayerNotification, setShowPrayerNotification] = useState(false);
  const [lastNotifiedPrayer, setLastNotifiedPrayer] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load city from localStorage
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      try {
        const city = JSON.parse(savedCity);
        setSelectedCity(city);
      } catch (e) {
        setSelectedCity(SENEGAL_CITIES[0]);
      }
    } else {
      setSelectedCity(SENEGAL_CITIES[0]);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  // Prayer Awareness Logic (Sound + Popup)
  useEffect(() => {
    if (!prayerTimes) return;

    const now = currentTime;
    const items = prayerNames.map(p => ({
      ...p,
      time: new Date((prayerTimes as any)[p.key])
    }));

    // Find if we are currently in a prayer window (e.g., first 20 mins of a prayer)
    const active = items.find(p => {
      // Don't show for sunrise
      if (p.key === 'sunrise') return false;
      const prayerTime = p.time;
      const windowEnd = addSeconds(prayerTime, 2 * 60); // 2 minutes window
      return now >= prayerTime && now <= windowEnd;
    });

    if (active) {
      if (!showPrayerNotification) {
        setShowPrayerNotification(true);
      }
      
      // Play sound only once when the prayer starts
      if (lastNotifiedPrayer !== active.key) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        setLastNotifiedPrayer(active.key);
      }
    } else {
      if (showPrayerNotification) {
        setShowPrayerNotification(false);
      }
    }
  }, [currentTime, prayerTimes, showPrayerNotification, lastNotifiedPrayer]);

  useEffect(() => {
    if (selectedCity) {
      // Calculate locally (Instant & Offline support)
      const data = calculatePrayerTimes(selectedCity.lat, selectedCity.lng) as any;
      setPrayerTimes(data);
      localStorage.setItem('selectedCity', JSON.stringify(selectedCity));

      // Fetch Weather (Open-Meteo)
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (data.current_weather) {
            setWeather({
              temp: Math.round(data.current_weather.temperature),
              code: data.current_weather.weathercode
            });
          }
        })
        .catch(() => setWeather(null));
    }
  }, [selectedCity]);

  const verseOfTheDay = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_VERSES[day % DAILY_VERSES.length];
  }, []);

  const prayerNames = [
    { key: 'fajr', label: 'Fajar', subLabel: 'الفجر', icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { key: 'sunrise', label: 'Fenk', subLabel: 'الشروق', icon: <Sun className="w-5 h-5 text-orange-400" /> },
    { key: 'dhuhr', label: 'Tisbaar', subLabel: 'الظهر', icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: 'asr', label: 'Tàkkusaan', subLabel: 'العصر', icon: <Sun className="w-5 h-5 text-orange-500" /> },
    { key: 'maghrib', label: 'Timis', subLabel: 'المغرب', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { key: 'isha', label: 'Gee', subLabel: 'العشاء', icon: <Moon className="w-5 h-5 text-indigo-600" /> },
  ];

  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    const now = currentTime;
    const items = prayerNames.map(p => ({
      ...p,
      time: new Date((prayerTimes as any)[p.key])
    }));

    // Sort by time
    const sorted = [...items].sort((a, b) => a.time.getTime() - b.time.getTime());
    
    // Find first prayer that is after now
    let next = sorted.find(p => p.time > now);
    
    // If none found, next is Fajr tomorrow
    if (!next) {
        next = { ...sorted[0], time: addSeconds(sorted[0].time, 24 * 3600) };
    }

    const diff = differenceInSeconds(next.time, now);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return {
      ...next,
      countdown: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }, [prayerTimes, currentTime]);

  if (activeTab === 'tv') {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white z-[100] flex flex-col font-sans overflow-hidden">
        {/* TV Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
           <img 
             src={daaruImage} 
             className="w-full h-full object-cover brightness-[0.4]" 
             alt="Mosque background"
           />
           {/* Islamic Pattern Overlay */}
           <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15-15-15L30 0zm0 60l15-15-15-15-15 15 15 15zM0 30l15-15 15 15-15 15L0 30zm60 0l-15-15-15 15 15 15 15-15z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
               backgroundSize: '80px 80px'
             }} 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950" />
        </div>

        {/* Top Header TV */}
        <div className="relative z-10 px-12 py-6 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/50">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <div className="text-emerald-500/60 font-serif italic text-sm mb-1 tracking-widest">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">{selectedCity?.name}</h1>
              <p className="text-lg font-bold text-emerald-500 uppercase tracking-widest mt-0.5 opacity-80">Sénégal • Bousso Method</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-6 mb-1">
              {weather && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-black tabular-nums">{weather.temp}°C</span>
                </div>
              )}
              <div className="text-6xl font-black tabular-nums tracking-tighter">
                {format(currentTime, 'HH:mm:ss')}
              </div>
            </div>
            <div className="text-xl font-bold text-slate-400 uppercase tracking-widest">
              {format(currentTime, 'EEEE dd MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* Middle Section: Next Prayer Countdown */}
        <div className="relative z-10 flex-[1.5] flex flex-col items-center justify-center p-0">
          <AnimatePresence mode="wait">
            {nextPrayer && (
              <motion.div 
                key={nextPrayer.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-32"></div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg md:text-xl font-black text-emerald-400 uppercase tracking-[0.4em] opacity-90">PROCHAINE PRIÈRE</p>
                    <p className="text-3xl font-black text-white mt-1 uppercase tracking-widest">{nextPrayer.label}</p>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-32"></div>
                </div>
                <div className="text-[12vw] md:text-[9rem] font-black tabular-nums tracking-[-0.05em] leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {nextPrayer.countdown}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Prayer List */}
        <div className="relative z-10 px-8 pb-12">
          <div className="grid grid-cols-6 gap-4">
            {prayerNames.map((prayer) => {
              const isNext = nextPrayer?.key === prayer.key;
              return (
                <div 
                  key={prayer.key}
                  className={`relative p-4 md:p-5 rounded-[1.2rem] border transition-all duration-500 flex flex-col items-center text-center gap-2 ${
                    isNext 
                      ? 'bg-emerald-600 border-emerald-300 shadow-2xl scale-105 z-20' 
                      : 'bg-white/5 border-white/5 opacity-70'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isNext ? 'bg-white/20' : 'bg-white/10'}`}>
                    {prayer.icon}
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm font-black uppercase tracking-widest mb-0.5 ${isNext ? 'text-white' : 'text-emerald-500'}`}>
                      {prayer.label}
                    </p>
                    <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60 ${isNext ? 'text-white/70' : 'text-slate-500'}`}>
                      {prayer.subLabel}
                    </p>
                    <p className={`text-2xl md:text-3xl font-black ${isNext ? 'text-white' : 'text-slate-200'}`}>
                      {(prayerTimes?.readable as any)?.[prayer.key]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exit TV Mode Button */}
        <button 
          onClick={() => setActiveTab('demo')}
          className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group z-[60]"
          title="Quitter le mode TV"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Verse of the Day Marquee TV */}
        <div className="relative z-10 bg-emerald-950/80 backdrop-blur-md border-t border-emerald-500/30 py-6 overflow-hidden mt-auto">
          <div className="flex w-max animate-marquee-tv text-emerald-100 pointer-events-none">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-32 px-16 whitespace-nowrap">
                <span className="flex items-center gap-8">
                  <span className="text-3xl font-serif">{verseOfTheDay.arabic}</span>
                  <span className="text-lg font-medium opacity-80">— {verseOfTheDay.french}</span>
                  <span className="text-sm font-black uppercase tracking-widest bg-emerald-500/20 px-4 py-1.5 rounded ml-4 border border-emerald-500/30">
                    {verseOfTheDay.reference}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer In Progress Popup */}
        <AnimatePresence>
          {showPrayerNotification && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
            >
              <div className="max-w-3xl w-full p-12 bg-emerald-600 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.4)] border border-emerald-400/50 text-center relative overflow-hidden group">
                {/* Decorative background pulse */}
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white/40 font-serif italic text-xl mb-6">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
                  
                  <div className="w-36 h-36 bg-white/20 rounded-full flex items-center justify-center mb-8 relative">
                    <Moon className="w-16 h-16 text-white animate-[pulse_3s_infinite]" />
                    <Smartphone className="w-10 h-10 text-white absolute bottom-0 right-0 bg-red-500 rounded-full p-2 border-4 border-emerald-600 animate-bounce" />
                  </div>
                  
                  <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                    Prière en Cours
                  </h2>
                  
                  <div className="space-y-4">
                    <p className="text-2xl font-bold text-white/90 uppercase tracking-[0.2em] bg-white/10 py-3 px-8 rounded-full inline-block">
                      Merci de mettre vos téléphones
                    </p>
                    <p className="text-4xl font-black text-white uppercase tracking-widest block">
                      SOUS SILENCE
                    </p>
                  </div>

                  <div className="mt-12 flex gap-4 items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <div className="w-2 h-2 bg-white rounded-full animate-ping [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white rounded-full animate-ping [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15-15-15L30 0zm0 60l15-15-15-15-15 15 15 15zM0 30l15-15 15 15-15 15L0 30zm60 0l-15-15-15 15 15 15 15-15z' fill='%23059669' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }} 
      />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[8px] text-emerald-600 font-serif italic tracking-widest leading-none mb-0.5">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">Senegal Prayer API</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold -mt-1">Methode: Serigne Mbacke Bousso</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('demo')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'demo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Sandbox
              </button>
              <button 
                onClick={() => setActiveTab('api')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'api' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Documentation
              </button>
            </nav>
            <div className="hidden md:flex gap-4">
              <button 
                onClick={() => setActiveTab('tv')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200"
              >
                <Tv className="w-4 h-4" />
                TV Mode
              </button>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isOffline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span> 
                {isOffline ? 'Mode Hors-ligne' : 'Système en ligne'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'demo' ? (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar: Endpoint Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xs font-bold text-slate-400 hover:text-slate-500 uppercase mb-5 tracking-[0.2em]">Endpoint Settings</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-wider">Base Endpoint</label>
                    <div className="flex p-3 bg-slate-100 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 overflow-hidden truncate">
                      api.samajulli.sn/v1/prayer-times
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-wider">Select Region</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {SENEGAL_CITIES.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => setSelectedCity(city)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all border ${
                            selectedCity?.name === city.name 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold z-10' 
                              : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <span>{city.name}</span>
                          {selectedCity?.name === city.name && <ChevronRight className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-wider">Calculation Method</label>
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold flex items-center justify-between">
                      <span>Serigne Mbacke Bousso</span>
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xs font-bold text-slate-400 uppercase mb-5 tracking-[0.2em]">Live Performance</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xl font-black text-slate-800">12ms</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Latency</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xl font-black text-slate-800">100%</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Uptime</div>
                  </div>
                </div>
              </section>
            </div>

            {/* Main Content: Response Visualizer */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCity?.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Globe className="w-48 h-48" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCity?.name}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Query Response Visualizer</p>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GMT+00 • {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {prayerNames.map((prayer) => (
                        <div 
                          key={prayer.key}
                          className="group bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 p-5 rounded-2xl border border-slate-100"
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              {prayer.icon}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">{prayer.label}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{prayer.subLabel}</p>
                              <p className="text-xl font-black text-slate-800 font-mono">
                                {(prayerTimes?.readable as any)?.[prayer.key]}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* JSON Terminal */}
                  <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 border-b border-white/5">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/50"></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">GET /v1/prayer-times?id={selectedCity?.name.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="p-8 font-mono text-xs leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar-dark select-all">
                      <pre className="text-emerald-400">
                        {JSON.stringify(prayerTimes, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-8 shadow-sm">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight">Standard API Schema</h3>
                      <p className="text-xs text-slate-500 leading-normal font-medium">Stable outputs in ISO-8601 and 24h format. Compatible with all major mobile architectures.</p>
                    </div>
                    <div className="flex gap-2">
                      {['JS', 'PY', 'SW', 'KT'].map(lang => (
                        <div key={lang} className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-default">
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Code className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">API Reference Documentation</h2>
              </div>
              <p className="text-slate-600 mb-8 font-medium leading-relaxed">
                Le Sénégal Prayer API fournit des horaires précis basés sur les coordonnées géographiques, calculés avec la rigueur des savants de Touba.
              </p>

              <div className="space-y-8">
                {/* Endpoint 1 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest leading-none">GET</span>
                      <code className="text-slate-800 font-mono font-bold text-sm">/api/prayer-times</code>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Lookup</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 font-medium">Récupération des horaires par coordonnées GPS.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-black text-slate-700 mr-2">LAT</span> Latitude décimale
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-black text-slate-700 mr-2">LNG</span> Longitude décimale
                    </div>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest leading-none">GET</span>
                      <code className="text-slate-800 font-mono font-bold text-sm">/api/prayer-times/city/:cityName</code>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City Lookup</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 font-medium">Récupération simplifiée par nom de ville (ex: /api/prayer-times/city/touba).</p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6 text-emerald-400" />
                      <h2 className="text-xl font-black">Swift / iOS Example</h2>
                    </div>
                    <a href="/DOCS.md" target="_blank" className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2 border border-white/5 uppercase tracking-widest">
                      More Languages <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-black/40 rounded-xl p-6 font-mono text-[11px] text-emerald-100 leading-relaxed border border-white/5 overflow-x-auto">
                    <pre>{`func fetchPrayers(lat: Double, lng: Double) async throws -> PrayerResponse {
    let url = URL(string: "https://api.samajulli.sn/v1/prayer-times?lat=\\(lat)&lng=\\(lng)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(PrayerResponse.self, from: data)
}`}</pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 SAMA JULLI • SOURCES: TANWÎRU-L-HAWÂLIK</p>
          </div>
          <div className="flex gap-8">
            {['Support Technique', 'Termes', 'Github'].map(link => (
              <a key={link} href="#" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">{link}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Verse of the Day Marquee Standard */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-600 text-white py-2 overflow-hidden shadow-[0_-4px_30px_rgba(5,150,105,0.3)]">
        <div className="flex w-max animate-marquee-std">
           {[1, 2].map((i) => (
             <div key={i} className="flex items-center gap-16 px-8 whitespace-nowrap">
                <span className="flex items-center gap-4">
                  <span className="text-base font-serif">{verseOfTheDay.arabic}</span>
                  <span className="text-[11px] font-bold opacity-90">{verseOfTheDay.french}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">{verseOfTheDay.reference}</span>
                </span>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
}
