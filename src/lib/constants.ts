export interface City {
  name: string;
  lat: number;
  lng: number;
}

export const SENEGAL_CITIES: City[] = [
  { name: 'Dakar', lat: 14.7167, lng: -17.4677 },
  { name: 'Touba', lat: 14.8647, lng: -15.8878 },
  { name: 'Darou Salam Diass', lat: 14.5880, lng: -17.0478 },
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

export interface Verse {
  arabic: string;
  french: string;
  reference: string;
}

export const DAILY_VERSES: Verse[] = [
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    french: "Et quand Mes serviteurs t'interrogent sur Moi.. alors Je suis tout proche : Je réponds à l'appel de celui qui Me prie quand il Me prie.",
    reference: "Sourate Al-Baqarah - 2:186"
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    french: "A côté de la difficulté est, certes, une facilité !",
    reference: "Sourate Ash-Sharh - 94:6"
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    french: "Souvenez-vous de Moi donc, Je vous récompenserai. Remerciez-Moi et ne soyez pas ingrats envers Moi.",
    reference: "Sourate Al-Baqarah - 2:152"
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    french: "Et quiconque craint Allah, Il lui donnera une issue favorable, et lui accordera ses dons par [des moyens] sur lesquels il ne comptait pas.",
    reference: "Sourate At-Talaq - 65:2-3"
  },
  {
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً",
    french: "Seigneur ! Ne laisse pas dévier nos cœurs après que Tu nous as guidés ; et accorde-nous Ta miséricorde.",
    reference: "Sourate Al-Imran - 3:8"
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    french: "Certes, Allah est avec les endurants.",
    reference: "Sourate Al-Baqarah - 2:153"
  },
  {
    arabic: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ",
    french: "Dis : « Ô Allah, Maître du Pouvoir Suprême ! Tu donnes le pouvoir à qui Tu veux... »",
    reference: "Sourate Al-Imran - 3:26"
  }
];
