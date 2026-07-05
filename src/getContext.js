// src/getContext.js — EL "CEREBRO" reutilizable
//
// Contiene toda la orquestacion (resolver ubicacion con fallback, pedir clima y
// aire en paralelo, ensamblar el JSON) y DEVUELVE el objeto de contexto, sin
// imprimir nada. Asi lo pueden reutilizar tanto el CLI (index.js) como el
// servidor HTTP (server.js) sin duplicar logica.

import { getLocationByZip } from "./services/zippopotam.js";
import { getLocationByIp } from "./services/ipApi.js";
import { getWeather, getAirQuality } from "./services/openMeteo.js";
import { buildContext } from "./buildContext.js";

// Resuelve la ubicacion con fallback:
//   1. Si hay ZIP -> intenta zippopotam. Si falla -> fallback por IP.
//   2. Si no hay ZIP -> va directo al fallback por IP.
async function resolveLocation(zip) {
  if (zip) {
    try {
      const location = await getLocationByZip(zip);
      return { location, input: { zip, source: "zip" } };
    } catch (err) {
      // El ZIP fallo (no existe o error de red): caemos al fallback por IP.
      console.error(`Aviso: ${err.message}. Usando fallback por IP...`);
    }
  }

  const location = await getLocationByIp();
  return { location, input: { zip: zip ?? null, source: "ip_fallback" } };
}

// Devuelve el objeto de contexto completo. Lanza un Error si no se puede
// resolver la ubicacion ni obtener el clima (los llamadores deciden como
// reportar ese error).
export async function getContext(zip) {
  const { location, input } = await resolveLocation(zip);

  // Clima y calidad del aire EN PARALELO.
  const [weather, airQuality] = await Promise.all([
    getWeather(location.lat, location.lon),
    getAirQuality(location.lat, location.lon),
  ]);

  return buildContext({ input, location, weather, airQuality });
}

// Objeto de error ESTRUCTURADO, compartido por el CLI y el servidor.
export function buildErrorObject(zip, message) {
  return {
    error: true,
    message,
    input: { zip: zip ?? null, source: null },
  };
}
