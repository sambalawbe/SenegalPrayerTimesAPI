import { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, Code, Download, ExternalLink, Moon, Sun, Info, ChevronRight, Globe, Tv, X, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addSeconds, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SENEGAL_CITIES, City } from './lib/constants';
import { calculatePrayerTimes } from './lib/prayerUtils';

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

export default function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [activeTab, setActiveTab] = useState<'demo' | 'api' | 'tv'>('demo');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

  useEffect(() => {
    if (selectedCity) {
      // Calculate locally (Instant & Offline support)
      const data = calculatePrayerTimes(selectedCity.lat, selectedCity.lng) as any;
      setPrayerTimes(data);
      localStorage.setItem('selectedCity', JSON.stringify(selectedCity));
    }
  }, [selectedCity]);

  const prayerNames = [
    { key: 'fajr', label: 'Fajr', subLabel: 'Suba', icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { key: 'sunrise', label: 'Sunrise', subLabel: 'Fidjar', icon: <Sun className="w-5 h-5 text-orange-400" /> },
    { key: 'dhuhr', label: 'Dhuhr', subLabel: 'Tisbaar', icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: 'asr', label: 'Asr', subLabel: 'Takussan', icon: <Sun className="w-5 h-5 text-orange-500" /> },
    { key: 'maghrib', label: 'Maghrib', subLabel: 'Timis', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { key: 'isha', label: 'Isha', subLabel: 'Gué', icon: <Moon className="w-5 h-5 text-indigo-600" /> },
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
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <img 
             src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
             className="w-full h-full object-cover grayscale" 
             alt="Mosque background"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
        </div>

        {/* Top Header TV */}
        <div className="relative z-10 px-12 py-10 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-900/50">
              <Clock className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{selectedCity?.name}</h1>
              <p className="text-xl font-bold text-emerald-500 uppercase tracking-widest mt-1 opacity-80">Sénégal • Bousso Method</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-7xl font-black tabular-nums tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-2xl font-bold text-slate-400 uppercase tracking-widest mt-2">
              {format(currentTime, 'EEEE dd MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* Middle Section: Next Prayer Countdown */}
        <div className="relative z-10 flex-[2] flex flex-col items-center justify-center py-4">
          <AnimatePresence mode="wait">
            {nextPrayer && (
              <motion.div 
                key={nextPrayer.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-xl md:text-2xl font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 opacity-90">Prochaine Prière : {nextPrayer.label}</p>
                <div className="text-[14vw] md:text-[10rem] font-black tabular-nums tracking-[-0.05em] leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {nextPrayer.countdown}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Prayer List */}
        <div className="relative z-10 px-8 pb-10">
          <div className="grid grid-cols-6 gap-4">
            {prayerNames.map((prayer) => {
              const isNext = nextPrayer?.key === prayer.key;
              return (
                <div 
                  key={prayer.key}
                  className={`relative p-5 md:p-6 rounded-[1.5rem] border transition-all duration-500 flex flex-col items-center text-center gap-3 ${
                    isNext 
                      ? 'bg-emerald-600 border-emerald-400 shadow-2xl scale-105 z-20' 
                      : 'bg-white/5 border-white/10 opacity-80'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isNext ? 'bg-white/20' : 'bg-white/10'}`}>
                    {prayer.icon}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isNext ? 'text-white/80' : 'text-slate-400'}`}>
                      {prayer.subLabel}
                    </p>
                    <p className={`text-2xl md:text-3xl font-black ${isNext ? 'text-white' : 'text-slate-200'}`}>
                      {(prayerTimes?.readable as any)?.[prayer.key]}
                    </p>
                  </div>
                  {isNext && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-emerald-600 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      En Cours
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exit TV Mode Button */}
        <button 
          onClick={() => setActiveTab('demo')}
          className="absolute bottom-8 right-8 w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group z-50"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
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
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{prayer.label.split(' ')[0]}</p>
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
