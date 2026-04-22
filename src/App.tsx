import { useState, useEffect } from 'react';
import { Clock, MapPin, Code, Download, ExternalLink, Moon, Sun, Info, ChevronRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface City {
  name: string;
  lat: number;
  lng: number;
}

interface PrayerTimes {
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
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'api'>('demo');

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        setCities(data);
        if (data.length > 0) setSelectedCity(data[0]);
      });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setLoading(true);
      fetch(`/api/prayer-times?lat=${selectedCity.lat}&lng=${selectedCity.lng}`)
        .then(res => res.json())
        .then(data => {
          setPrayerTimes(data);
          setLoading(false);
        });
    }
  }, [selectedCity]);

  const prayerNames = [
    { key: 'fajr', label: 'Fajr (Suba)', icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { key: 'sunrise', label: 'Sunrise (Fidjar)', icon: <Sun className="w-5 h-5 text-orange-400" /> },
    { key: 'dhuhr', label: 'Dhuhr (Tisbaar)', icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: 'asr', label: 'Asr (Takussan)', icon: <Sun className="w-5 h-5 text-orange-500" /> },
    { key: 'maghrib', label: 'Maghrib (Timis)', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { key: 'isha', label: 'Isha (Gué)', icon: <Moon className="w-5 h-5 text-indigo-600" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Sama Julli</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">Sénégal • Bousso Method</p>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'demo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Démo
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'api' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              API Docs
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'demo' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar: City Selection */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-bold text-lg">Choix de la Ville</h2>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setSelectedCity(city)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${
                        selectedCity?.name === city.name 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-medium">{city.name}</span>
                      {selectedCity?.name === city.name && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
                <Info className="w-6 h-6 mb-3 opacity-80" />
                <h3 className="font-bold mb-2">Méthode Bousso</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Calculé selon l'approche de Serigne Mbacké Bousso (Tanwîru-l-Hawâlik) utilisant des angles précis de 19.5° (Fajr) et 17.5° (Isha) pour le Sénégal.
                </p>
              </div>
            </div>

            {/* Main Content: Prayer Times */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCity?.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Globe className="w-48 h-48" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">{selectedCity?.name}</h2>
                        <p className="text-slate-500 font-medium">Heures de prière au Sénégal</p>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Aujourd'hui • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {prayerNames.map((prayer) => (
                        <div 
                          key={prayer.key}
                          className="group bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 p-5 rounded-2xl border border-slate-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              {prayer.icon}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{prayer.label}</p>
                              <p className="text-xl font-black text-slate-800">
                                {loading ? '...' : (prayerTimes?.readable as any)?.[prayer.key]}
                              </p>
                            </div>
                          </div>
                          <Clock className="w-5 h-5 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-indigo-500" />
                      Aperçu de la réponse API
                    </h3>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-xs text-indigo-300 font-mono">
                        {JSON.stringify(prayerTimes, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-4">Documentation API</h2>
              <p className="text-slate-600 mb-6 font-medium">
                Cette API permet d'obtenir les heures de prière spécifiquement pour le Sénégal, en utilisant la méthode de Serigne Mbacké Bousso. Elle est hébergée sur ce serveur et peut être appelée directement.
              </p>

              <div className="space-y-6">
                {/* Endpoint 1 */}
                <div className="border-l-4 border-emerald-500 pl-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">GET</span>
                    <code className="text-slate-800 font-mono font-bold">/api/prayer-times</code>
                  </div>
                  <p className="text-sm text-slate-500">Récupère les heures pour un point géographique.</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm italic text-slate-600">
                    Query params: <code className="text-indigo-600">lat</code>, <code className="text-indigo-600">lng</code>, <code className="text-indigo-600">date</code> (optionnel, YYYY-MM-DD)
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="border-l-4 border-blue-500 pl-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">GET</span>
                    <code className="text-slate-800 font-mono font-bold">/api/cities</code>
                  </div>
                  <p className="text-sm text-slate-500">Liste des principales villes du Sénégal avec leurs coordonnées.</p>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Code className="w-8 h-8 text-indigo-400" />
                  <h2 className="text-2xl font-bold">Exemple d'intégration (JS)</h2>
                </div>
                <a href="/DOCS.md" target="_blank" className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2 border border-white/10">
                  <ExternalLink className="w-4 h-4" />
                  DOCS COMPLETES (KOTLIN/SWIFT)
                </a>
              </div>
              <div className="bg-black/30 rounded-2xl p-6 font-mono text-sm text-indigo-100 leading-relaxed border border-white/5 overflow-x-auto">
                <pre>{`const fetchPrayerTimes = async (lat, lng) => {
  const url = \`\${window.location.origin}/api/prayer-times?lat=\${lat}&lng=\${lng}\`;
  const response = await fetch(url);
  const data = await response.json();
  
  console.log("Heures de prière:", data.readable);
  // { fajr: "05:41", dhuhr: "13:02", asr: "16:21", ... }
};`}</pre>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl hover:shadow-md transition-shadow">
                  <Download className="w-6 h-6 text-indigo-600 mb-3" />
                  <h4 className="font-bold text-indigo-900">Format JSON Standard</h4>
                  <p className="text-sm text-indigo-700/80">Réponse structurée facile à parser en Swift, Kotlin ou React Native.</p>
               </div>
               <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl hover:shadow-md transition-shadow">
                  <ExternalLink className="w-6 h-6 text-emerald-600 mb-3" />
                  <h4 className="font-bold text-emerald-900">CORS Supporté</h4>
                  <p className="text-sm text-emerald-700/80">L'API accepte les requêtes provenant de n'importe quel domaine par défaut.</p>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="font-bold tracking-tight">SAMA JULLI</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Développé pour la communauté musulmane du Sénégal • Basé sur les travaux de Serigne Mbacké Bousso</p>
        </div>
      </footer>
    </div>
  );
}
