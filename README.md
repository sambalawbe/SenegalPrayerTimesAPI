# Sama Julli - API Heures de Prière Sénégal (Méthode Serigne Mbacké Bousso)

Cette application est une API spécialisée pour le calcul des heures de prière au Sénégal, suivant rigoureusement la méthode de **Serigne Mbacké Bousso**. Elle est conçue pour être intégrée facilement dans des applications mobiles ou web.

## Méthode de Calcul
Le moteur utilise la bibliothèque `adhan` avec les paramètres spécifiques "Bousso" :
- **Fajr** : 19.5°
- **Isha** : 17.5°
- **Asr** : Madhab Maliki (Ratio d'ombre 1x)

## Points de Terminaison (Endpoints)

### 1. Liste des villes
`GET /api/cities`
Renvoie une liste des principales villes du Sénégal avec leurs coordonnées géographiques.

### 2. Heures de prière par coordonnées
`GET /api/prayer-times?lat={latitude}&lng={longitude}&date={YYYY-MM-DD}`

**Paramètres :**
- `lat` (Requis) : Latitude (ex: 14.7167)
- `lng` (Requis) : Longitude (ex: -17.4677)
- `date` (Optionnel) : Date précise. Par défaut, utilise la date du jour du serveur.

### 3. Heures de prière par ville
`GET /api/prayer-times/city/{cityName}`

**Exemples :**
- `/api/prayer-times/city/touba`
- `/api/prayer-times/city/darou-salam-diass`

**Exemple de réponse :**
```json
{
  "fajr": "2026-04-22T05:42:00.000Z",
  "readable": {
    "fajr": "05:42",
    "dhuhr": "13:01",
    "asr": "16:25",
    "maghrib": "19:15",
    "isha": "20:25"
  },
  "metadata": {
    "method": "Serigne Mbacke Bousso",
    "angles": { "fajr": 19.5, "isha": 17.5 }
  }
}
```

## Intégration Mobile

### JavaScript (fetch)
```javascript
const response = await fetch('https://[URL_APP]/api/prayer-times?lat=14.71&lng=-17.46');
const data = await response.json();
console.log(data.readable.fajr);
```

### cURL
```bash
curl "https://[URL_APP]/api/prayer-times?lat=14.71&lng=-17.46"
```

## Développement
- **Frontend** : React + Tailwind CSS
- **Backend** : Node.js + Express
- **Calculs** : Adhan JS

---
*Développé pour la sambaLawbeLO.*
