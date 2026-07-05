// src/buildContext.js — ENSAMBLADOR del JSON final
//
// Responsabilidad: recibir los datos ya obtenidos (ubicacion, clima, aire) y,
// usando nuestra logica propia (condition + outdoor_score), construir el objeto
// JSON con la forma EXACTA que pide el PDF. Lo separamos del index.js para que
// tanto el CLI como el futuro endpoint HTTP (plus) reutilicen el mismo
// ensamblador sin duplicar.
//
// Contrato:
//   buildContext({ input, location, weather, airQuality }) -> objeto JSON final

import { mapCondition } from "./logic/condition.js";
import { calculateOutdoorScore } from "./logic/outdoorScore.js";

export function buildContext({ input, location, weather, airQuality }) {
  // Traducimos el weathercode WMO (crudo) a texto legible con NUESTRA logica.
  const condition = mapCondition(weather.weathercode);

  // Calculamos el score combinando clima + aire con NUESTRA logica.
  const outdoor_score = calculateOutdoorScore({
    temperature_c: weather.temperature_c,
    windspeed_kmh: weather.windspeed_kmh,
    condition,
    aqi_us: airQuality.aqi_us,
  });

  return {
    input, // { zip, source }
    location, // { city, state, country, lat, lon }
    weather: {
      temperature_c: weather.temperature_c,
      windspeed_kmh: weather.windspeed_kmh,
      condition, // nuestro mapeo WMO
    },
    air_quality: airQuality, // { aqi_us, level, dominant_pollutant }
    outdoor_score, // 1..10 (nuestra logica)
    agent_context: buildAgentContext({ location, weather, condition, airQuality, outdoor_score }),
  };
}

// Genera el texto natural listo para que un agente/bot lo consuma.
// STUB TEMPORAL: se completara junto con la logica final (usa condition y
// outdoor_score, que aun son placeholders).
function buildAgentContext({ location, weather, condition, airQuality, outdoor_score }) {
  return "(pendiente)";
}
