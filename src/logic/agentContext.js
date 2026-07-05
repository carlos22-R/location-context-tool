// src/logic/agentContext.js — LOGICA PROPIA: agent_context
//
// >>> LOGICA DISEÑADA POR NOSOTROS. <<<
//
// Genera un texto en lenguaje natural (en español) listo para que un agente/bot
// lo lea e injecte en su respuesta al usuario. El PDF deja este campo libre;
// elegimos un string natural porque es lo mas facil de consumir por un bot.
//
// Enriquecemos el texto con: ubicacion, temperatura, condicion (en palabras
// naturales), calidad del aire (solo si no es "Good") y una recomendacion
// basada en el outdoor_score. El viento solo se menciona si es fuerte.
//
// Contrato:
//   buildAgentContext({ location, weather, condition, airQuality, outdoor_score }) -> string

// Traduccion de nuestros grupos de condition (ingles) a frases naturales en
// español, para el texto del agente. El campo `condition` del JSON sigue en
// ingles; esto es solo para la narrativa.
const CONDITION_ES = {
  "Clear": "cielo despejado",
  "Partly cloudy": "cielo parcialmente nublado",
  "Cloudy": "cielo nublado",
  "Fog": "niebla",
  "Drizzle": "llovizna",
  "Rainy": "lluvia",
  "Snowy": "nieve",
  "Thunderstorm": "tormenta eléctrica",
  "Unknown": "condiciones variables",
};

// Nombres legibles en español de los contaminantes (para la nota de aire).
const POLLUTANT_ES = {
  pm2_5: "partículas finas (PM2.5)",
  pm10: "partículas (PM10)",
  ozone: "ozono",
  nitrogen_dioxide: "dióxido de nitrógeno",
  sulphur_dioxide: "dióxido de azufre",
  carbon_monoxide: "monóxido de carbono",
};

// Recomendacion segun el tramo del outdoor_score.
function recommendation(score) {
  if (score >= 8) return "excelentes condiciones para actividades al aire libre";
  if (score >= 6) return "buenas condiciones para salir";
  if (score >= 4) return "condiciones regulares; puedes salir tomando precauciones";
  return "condiciones desfavorables; mejor planear actividades bajo techo";
}

export function buildAgentContext({ location, weather, condition, airQuality, outdoor_score }) {
  const temp = Math.round(weather.temperature_c);
  const conditionEs = CONDITION_ES[condition] ?? "condiciones variables";

  // 1. Ubicacion + temperatura + condicion.
  let texto = `Estás en ${location.city}, ${location.state}. La temperatura es de ${temp}°C con ${conditionEs}`;

  // 2. Viento: solo si es fuerte (>30 km/h).
  if (weather.windspeed_kmh > 30) {
    texto += ` y viento fuerte (${Math.round(weather.windspeed_kmh)} km/h)`;
  }
  texto += ".";

  // 3. Calidad del aire: siempre el nivel; el contaminante solo si no es "Good".
  texto += ` La calidad del aire es ${airQuality.level}`;
  if (airQuality.level !== "Good") {
    const pollutant = POLLUTANT_ES[airQuality.dominant_pollutant] ?? airQuality.dominant_pollutant;
    texto += `, con contaminante dominante: ${pollutant}`;
  }
  texto += ".";

  // 4. Score + recomendacion.
  texto += ` Puntuación para actividades al aire libre: ${outdoor_score}/10 — ${recommendation(outdoor_score)}.`;

  return texto;
}
