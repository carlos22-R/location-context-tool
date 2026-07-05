// src/logic/outdoorScore.js — LOGICA PROPIA: outdoor_score
//
// >>> LOGICA DISEÑADA POR NOSOTROS. <<<
//
// Calcula un numero del 1 al 10 que representa que tan buenas son las
// condiciones para estar al aire libre.
//
// MODELO: "empezar en 10 (dia perfecto) y RESTAR penalizaciones por cada
// factor incomodo". Es simple, coherente y facil de defender: cada resta
// tiene una razon clara. Al final acotamos el resultado al rango [1, 10].
//
// Considera los 4 factores que pide la consigna, de forma independiente:
//   - Temperatura actual (°C)
//   - Velocidad del viento (km/h)
//   - Condicion climatica (nuestra agrupacion de condition.js)
//   - Indice de calidad del aire (us_aqi)
//
// Contrato:
//   calculateOutdoorScore({ temperature_c, windspeed_kmh, condition, aqi_us }) -> 1..10

import { pathToFileURL } from "node:url";

const PERFECT_SCORE = 10;
const MIN_SCORE = 1;
const MAX_SCORE = 10;

// --- Penalizacion por TEMPERATURA (°C) ---
// Rango ideal 18-24. Cuanto mas se aleja, mas resta.
function temperaturePenalty(tempC) {
  if (tempC >= 18 && tempC <= 24) return 0; // confortable
  if (tempC < 5 || tempC > 32) return 4; // extrema (mucho frio / mucho calor)
  return 2; // fria (5-18) o calida (24-32)
}

// --- Penalizacion por VIENTO (km/h) ---
function windPenalty(windKmh) {
  if (windKmh < 15) return 0; // calmo
  if (windKmh <= 30) return 1; // moderado
  return 3; // fuerte
}

// --- Penalizacion por CONDICION climatica (nuestra agrupacion) ---
// Ordenada de "mejor" a "peor" para estar al aire libre.
const CONDITION_PENALTY = {
  "Clear": 0,
  "Partly cloudy": 0,
  "Cloudy": 1,
  "Fog": 2,
  "Drizzle": 2,
  "Rainy": 4,
  "Snowy": 4,
  "Thunderstorm": 6,
};

function conditionPenalty(condition) {
  // Si la condicion es desconocida, penalizamos moderado (2) por precaucion.
  return CONDITION_PENALTY[condition] ?? 2;
}

// --- Penalizacion por CALIDAD DEL AIRE (us_aqi) ---
// Alineada a las categorias oficiales de la EPA (mismos cortes que el "level").
function aqiPenalty(aqi) {
  if (aqi <= 50) return 0; // Good
  if (aqi <= 100) return 1; // Moderate
  if (aqi <= 150) return 3; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return 5; // Unhealthy
  return 7; // Very Unhealthy / Hazardous (201+)
}

export function calculateOutdoorScore({ temperature_c, windspeed_kmh, condition, aqi_us }) {
  const raw =
    PERFECT_SCORE -
    temperaturePenalty(temperature_c) -
    windPenalty(windspeed_kmh) -
    conditionPenalty(condition) -
    aqiPenalty(aqi_us);

  // Acotamos a [1, 10]: nunca menos de 1 ni mas de 10.
  const clamped = Math.min(MAX_SCORE, Math.max(MIN_SCORE, raw));
  return Math.round(clamped);
}

// ---------------------------------------------------------------------------
// BLOQUE DE PRUEBA (solo si ejecutas este archivo directamente):
//   node src/logic/outdoorScore.js
// ---------------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const casos = [
    { nombre: "Dia perfecto", temperature_c: 21, windspeed_kmh: 5, condition: "Clear", aqi_us: 20 },
    { nombre: "Denver real", temperature_c: 26, windspeed_kmh: 5, condition: "Clear", aqi_us: 53 },
    { nombre: "Frio y ventoso", temperature_c: 2, windspeed_kmh: 35, condition: "Cloudy", aqi_us: 40 },
    { nombre: "Tormenta + aire malo", temperature_c: 15, windspeed_kmh: 40, condition: "Thunderstorm", aqi_us: 160 },
    { nombre: "Calor extremo", temperature_c: 38, windspeed_kmh: 10, condition: "Clear", aqi_us: 90 },
  ];
  console.log("Caso -> outdoor_score:\n");
  for (const c of casos) {
    console.log(`  ${c.nombre.padEnd(22)} -> ${calculateOutdoorScore(c)}`);
  }
}
