# Location Context Tool

Herramienta en **Node.js** que recibe un ZIP code de EE.UU. y devuelve un único
JSON enriquecido con contexto sobre esa ubicación (ciudad, clima, calidad del
aire y un `outdoor_score`), listo para que un agente de IA o bot lo consuma.

## Requisitos

- Node.js 18+ (usa `fetch` nativo, sin dependencias externas).

## Instalación

```bash
npm install
```

> No hay dependencias externas todavía; el comando queda documentado por convención.

## Uso

```bash
node index.js 80203
```

Devuelve un JSON con la estructura:

```json
{
  "input":       { "zip": "80203", "source": "zip" },
  "location":    { "city": "Denver", "state": "Colorado", "country": "US", "lat": 39.7392, "lon": -104.9903 },
  "weather":     { "temperature_c": 14.5, "windspeed_kmh": 18.2, "condition": "Partly cloudy" },
  "air_quality": { "aqi_us": 38, "level": "Good", "dominant_pollutant": "pm2_5" },
  "outdoor_score": 7,
  "agent_context": "Estás en Denver, CO. Temperatura de 14°C, condiciones aptas para salir."
}
```

## APIs utilizadas

| API | Uso |
|-----|-----|
| [zippopotam.us](https://api.zippopotam.us) | ZIP → ciudad, estado, país, coordenadas |
| [Open-Meteo](https://open-meteo.com) | Clima actual y calidad del aire por coordenadas |
| [ip-api.com](http://ip-api.com) | Fallback: ubicación por IP si el ZIP falla |

## Lógica propia

> Estas dos piezas son diseño propio: no existe una respuesta "correcta" única.
> El criterio buscado es que sean **coherentes y explicables**.

### Agrupación de weathercodes (WMO → `condition`)

Open-Meteo devuelve un `weathercode` entero según el estándar
[WMO](https://open-meteo.com/en/docs). Lo agrupamos en **8 categorías**, ordenadas
de "mejor" a "peor" para estar al aire libre (el mismo criterio alimenta el
`outdoor_score`):

| `condition` | Códigos WMO | Descripción |
|-------------|-------------|-------------|
| **Clear** | 0, 1 | Despejado o mayormente despejado |
| **Partly cloudy** | 2 | Parcialmente nublado |
| **Cloudy** | 3 | Cubierto |
| **Fog** | 45, 48 | Niebla (incluida con escarcha) |
| **Drizzle** | 51, 53, 55, 56, 57 | Llovizna (incluida la helada) |
| **Rainy** | 61, 63, 65, 66, 67, 80, 81, 82 | Lluvia y chubascos de toda intensidad |
| **Snowy** | 71, 73, 75, 77, 85, 86 | Nieve en todas sus formas |
| **Thunderstorm** | 95, 96, 99 | Tormentas (con o sin granizo) |

Criterio: agrupamos por **fenómeno físico** y por **impacto para estar afuera**.
Un código no mapeado devuelve `"Unknown"` (nunca rompe la salida).
Implementado en `src/logic/condition.js`.

### Cálculo del `outdoor_score` (1–10)

Modelo **"empezar en 10 (día perfecto) y restar penalizaciones"** por cada factor
incómodo. Al final se acota el resultado al rango `[1, 10]`. Considera los 4
factores que pide la consigna, de forma independiente:

| Factor | Penalización |
|--------|-------------|
| **Temperatura** | Ideal 18–24 °C = 0 · Fría (5–18) o cálida (24–32) = −2 · Extrema (<5 o >32) = −4 |
| **Viento** | <15 km/h = 0 · 15–30 = −1 · >30 = −3 |
| **Condición** | Clear/Partly cloudy = 0 · Cloudy = −1 · Fog/Drizzle = −2 · Rainy/Snowy = −4 · Thunderstorm = −6 |
| **Calidad del aire (AQI)** | 0–50 = 0 · 51–100 = −1 · 101–150 = −3 · 151–200 = −5 · 201+ = −7 |

```
score = 10 − pen(temp) − pen(viento) − pen(condición) − pen(aqi)   →  acotado a [1, 10]
```

Los cortes del AQI coinciden con las categorías oficiales de la EPA (el mismo
`level`). Los pesos reflejan prioridades: lo peligroso (tormenta, aire insalubre)
resta más. No hay valores "correctos"; lo relevante es que el orden relativo sea
coherente (peor clima → menor score). Implementado en `src/logic/outdoorScore.js`.

### Categorías de calidad del aire (`level`)

`level` y `dominant_pollutant` no vienen dados por la API; se derivan del estándar
oficial del US AQI (EPA):

- **`level`**: categoría según el valor `us_aqi` (0–50 Good, 51–100 Moderate,
  101–150 Unhealthy for Sensitive Groups, 151–200 Unhealthy, 201–300 Very
  Unhealthy, 301+ Hazardous). Fuente:
  [AirNow.gov](https://www.airnow.gov/aqi/aqi-basics/). Ver `src/constants/aqiLevels.js`.
- **`dominant_pollutant`**: el AQI total es el **máximo** de los sub-índices por
  contaminante; el dominante es el que produce ese máximo. Fuente:
  [EPA Technical Assistance Document](https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf).
