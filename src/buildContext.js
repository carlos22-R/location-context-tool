// src/buildContext.js — ENSAMBLADOR del JSON final
//
// Responsabilidad: recibir los datos ya obtenidos (ubicacion, clima, aire) y
// el resultado de la logica propia, y construir el objeto JSON con la forma
// EXACTA que pide el PDF. Lo separamos del index.js para que tanto el CLI como
// el futuro endpoint HTTP (plus) reutilicen el mismo ensamblador sin duplicar.
//
// Forma de salida prevista:
//   {
//     input:       { zip, source },            // source: "zip" | "ip_fallback"
//     location:    { city, state, country, lat, lon },
//     weather:     { temperature_c, windspeed_kmh, condition },
//     air_quality: { aqi_us, level, dominant_pollutant },
//     outdoor_score: <1..10>,
//     agent_context: "..."                      // texto natural para el bot
//   }
//
// Contrato previsto:
//   buildContext({ input, location, weather, airQuality }) -> objeto JSON final
//
// (Implementacion pendiente.)
