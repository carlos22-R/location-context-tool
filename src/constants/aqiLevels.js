// src/constants/aqiLevels.js — Tabla de referencia del AQI de EE.UU.
//
// Categorias OFICIALES del US AQI segun la EPA (no es logica propia nuestra,
// es un estandar fijo).
//   Fuente: https://www.airnow.gov/aqi/aqi-basics/
//
// Es una tabla de RANGOS (no un enum), porque cada categoria cubre un intervalo
// de valores. La recorremos de menor a mayor y devolvemos la primera cuyo
// limite superior (max) no se ha superado.

// Object.freeze evita que la tabla se modifique por accidente en runtime.
export const AQI_LEVELS = Object.freeze([
  { max: 50, level: "Good" },
  { max: 100, level: "Moderate" },
  { max: 150, level: "Unhealthy for Sensitive Groups" },
  { max: 200, level: "Unhealthy" },
  { max: 300, level: "Very Unhealthy" },
  { max: Infinity, level: "Hazardous" }, // 301+
]);

// Recibe el numero us_aqi y devuelve su categoria de salud.
//   getAqiLevel(82) -> "Moderate"
export function getAqiLevel(aqi) {
  const match = AQI_LEVELS.find((range) => aqi <= range.max);
  // El ultimo rango es Infinity, asi que find siempre encuentra algo.
  return match.level;
}
