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

### Agrupación de weathercodes (WMO → `condition`)

_(Pendiente — se documentará al implementar `src/logic/condition.js`.)_

### Cálculo del `outdoor_score` (1–10)

_(Pendiente — se documentará al implementar `src/logic/outdoorScore.js`.)_
