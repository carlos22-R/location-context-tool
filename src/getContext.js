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

// Traduce errores tecnicos conocidos a un mensaje claro para el usuario.
// (fetch nativo lanza "fetch failed" ante cualquier fallo de red.)
export function friendlyErrorMessage(err) {
  if (err.message === "fetch failed") {
    return "No se pudo conectar con los servicios externos. Verifica tu conexion a internet e intenta de nuevo.";
  }
  return err.message;
}

// Objeto de error ESTRUCTURADO, compartido por el CLI y el servidor.
export function buildErrorObject(zip, message) {
  return {
    error: true,
    message,
    input: { zip: zip ?? null, source: null },
  };
}

// --- Soporte para multiples ZIPs (plus) ---

// Tope de ZIPs por llamada. Defensa contra abuso y contra los rate limits de
// las APIs (cada ZIP dispara 3 peticiones).
export const MAX_ZIPS = 10;

// Limpia una lista de ZIPs crudos: quita espacios, descarta vacios y ELIMINA
// duplicados (dedupe), para no repetir llamadas por el mismo ZIP.
export function normalizeZips(rawZips) {
  const limpios = rawZips.map((z) => z.trim()).filter(Boolean);
  return [...new Set(limpios)];
}

// Version de getContext que NUNCA lanza: devuelve el contexto o, si falla, un
// objeto de error. Asi un ZIP malo no tumba al resto del lote (Promise.all).
export async function safeGetContext(zip) {
  try {
    return await getContext(zip);
  } catch (err) {
    return buildErrorObject(zip, friendlyErrorMessage(err));
  }
}
