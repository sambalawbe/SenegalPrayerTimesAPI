# Documentation Technique Complète - Sama Julli

## Architecture
Le projet est une application full-stack utilisant **Express** comme serveur API et **Vite/React** pour l'interface de démonstration et la documentation interactive.

## Détails de Calcul (Serigne Mbacké Bousso)
L'approche de Serigne Mbacké Bousso (ra) est reconnue pour sa précision astronomique adaptée au Sahel. Les angles de 19.5° et 17.5° sont les plus couramment acceptés pour le Sénégal (méthode de Touba).

### Paramètres de l'API Adhan utilisés :
```typescript
const params = adhan.CalculationMethod.Other();
params.fajrAngle = 19.5;
params.ishaAngle = 17.5;
params.madhab = adhan.Madhab.Shafi; // Utilise le ratio d'ombre 1x, identique au Maliki
```

### Heures de prière par nom de ville
`GET /api/prayer-times/city/:cityName`
Permet de récupérer les horaires sans connaître les coordonnées. L'API fait correspondre le nom (insensible à la casse).

**Exemple :** `https://[URL_APP]/api/prayer-times/city/darou-salam-diass`

## Structure des Données

### Ville (City)
```typescript
interface City {
  name: string;
  lat: number;
  lng: number;
}
```

### Heures de Prière (PrayerTimes)
L'objet retourné contient deux types de données :
1. **Objets Date ISO** : Pour les manipulations logiques (alarmes, comptes à rebours).
2. **Objets `readable`** : Chaînes de caractères formatées (HH:mm) pour l'affichage immédiat.

## Exemples d'Intégration Mobile

### Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> fetchPrayers(double lat, double lng) async {
  final response = await http.get(Uri.parse('https://[URL_APP]/api/prayer-times?lat=$lat&lng=$lng'));
  return json.decode(response.body);
}
```

### Swift (iOS)
```swift
func getPrayerTimes(lat: Double, lng: Double) {
    let url = URL(string: "https://[URL_APP]/api/prayer-times?lat=\(lat)&lng=\(lng)")!
    URLSession.shared.dataTask(with: url) { data, _, _ in
        if let data = data {
            let json = try? JSONSerialization.jsonObject(with: data)
            print(json)
        }
    }.resume()
}
```

### Kotlin (Android/Retrofit)
```kotlin
@GET("api/prayer-times")
suspend fun getPrayerTimes(
    @Query("lat") lat: Double,
    @Query("lng") lng: Double
): Response<PrayerResponse>
```

## Gestion des fuseaux horaires
L'API renvoie des objets Date basés sur le fuseau horaire du serveur (GMT). Le Sénégal étant à GMT+0, les heures correspondent directement à l'heure locale sans conversion nécessaire la majorité du temps.

## Licence
Ce projet est mis à disposition pour un usage spirituel et communautaire.
