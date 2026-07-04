// src/services/openMeteo.js — SERVICIO: Open-Meteo
//
// Responsabilidad: dadas unas coordenadas (lat, lon), obtener el clima actual
// y la calidad del aire. Son DOS endpoints distintos de Open-Meteo:
//   - Clima:  https://api.open-meteo.com/v1/forecast
//   - Aire:   https://air-quality-api.open-meteo.com/v1/air-quality
//   Sin API key.
//
// Contrato previsto:
//   getWeather(lat, lon)      -> { temperature_c, windspeed_kmh, weathercode }
//   getAirQuality(lat, lon)   -> { aqi_us, dominant_pollutant, ... }
//   (El orquestador las llamara en paralelo con Promise.all.)
//
// Nota: el weathercode (entero WMO) se traduce a texto en logic/condition.js,
// no aqui — este servicio solo trae el dato crudo.
//
// (Implementacion pendiente.)
