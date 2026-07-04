// src/services/openMeteo.js — SERVICIO: Open-Meteo
//
// Responsabilidad: dadas unas coordenadas (lat, lon), obtener el clima actual
// y la calidad del aire. Son DOS endpoints distintos (subdominios distintos):
//   - Clima:  https://api.open-meteo.com/v1/forecast
//   - Aire:   https://air-quality-api.open-meteo.com/v1/air-quality
//   Sin API key.
//
// Contrato:
//   getWeather(lat, lon)     -> { temperature_c, windspeed_kmh, weathercode }
//   getAirQuality(lat, lon)  -> { aqi_us, level, dominant_pollutant }
//
// El weathercode (entero WMO) se traduce a texto en logic/condition.js (al
// final); aqui solo traemos el dato crudo.

import { pathToFileURL } from "node:url";
import { getAqiLevel } from "../constants/aqiLevels.js";

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Sub-indices de AQI por contaminante que pedimos a la API. El "dominante" es
// el que tenga el valor mas alto (ese es el que define el us_aqi total).
const POLLUTANTS = [
  "us_aqi_pm2_5",
  "us_aqi_pm10",
  "us_aqi_ozone",
  "us_aqi_nitrogen_dioxide",
  "us_aqi_sulphur_dioxide",
  "us_aqi_carbon_monoxide",
];

// ---------------------------------------------------------------------------
// CLIMA
// ---------------------------------------------------------------------------
export async function getWeather(lat, lon) {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo clima fallo (HTTP ${response.status})`);
  }

  const data = await response.json();
  const current = data.current_weather;

  return {
    temperature_c: current.temperature, // °C
    windspeed_kmh: current.windspeed, // km/h
    weathercode: current.weathercode, // entero WMO -> se traduce despues
  };
}

// ---------------------------------------------------------------------------
// CALIDAD DEL AIRE
// ---------------------------------------------------------------------------
export async function getAirQuality(lat, lon) {
  // Pedimos el AQI total + un sub-indice por cada contaminante.
  const fields = ["us_aqi", ...POLLUTANTS].join(",");
  const url = `${AIR_URL}?latitude=${lat}&longitude=${lon}&current=${fields}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo aire fallo (HTTP ${response.status})`);
  }

  const data = await response.json();
  const current = data.current;

  return {
    aqi_us: current.us_aqi,
    level: getAqiLevel(current.us_aqi), // tabla EPA (constants/aqiLevels.js)
    dominant_pollutant: getDominantPollutant(current),
  };
}

// Encuentra el contaminante con el sub-indice de AQI mas alto y devuelve su
// nombre limpio (ej. "us_aqi_ozone" -> "ozone").
function getDominantPollutant(current) {
  let dominant = null;
  let maxValue = -Infinity;

  for (const key of POLLUTANTS) {
    const value = current[key];
    if (typeof value === "number" && value > maxValue) {
      maxValue = value;
      dominant = key;
    }
  }
  // Quitamos el prefijo "us_aqi_" para dejar solo el nombre del contaminante.
  return dominant ? dominant.replace("us_aqi_", "") : null;
}

// ---------------------------------------------------------------------------
// BLOQUE DE PRUEBA (solo si ejecutas este archivo directamente):
//   node src/services/openMeteo.js 39.7313 -104.9811
// ---------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lat = process.argv[2] || "39.7313";
  const lon = process.argv[3] || "-104.9811";
  console.log(`Probando con lat=${lat}, lon=${lon}...\n`);

  Promise.all([getWeather(lat, lon), getAirQuality(lat, lon)])
    .then(([weather, air]) => {
      console.log("CLIMA:", JSON.stringify(weather, null, 2));
      console.log("AIRE: ", JSON.stringify(air, null, 2));
    })
    .catch((err) => console.error("Error:", err.message));
}
