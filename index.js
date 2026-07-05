// index.js — ORQUESTADOR
//
// Es el "director de orquesta": coordina el flujo completo. NO contiene
// detalles de las APIs (eso vive en src/services) ni logica de negocio (eso
// vive en src/logic). Solo ordena las llamadas y maneja errores.
//
// Uso:  node index.js 80203

import { getLocationByZip } from "./src/services/zippopotam.js";
import { getLocationByIp } from "./src/services/ipApi.js";
import { getWeather, getAirQuality } from "./src/services/openMeteo.js";
import { buildContext } from "./src/buildContext.js";

// Resuelve la ubicacion con fallback:
//   1. Si hay ZIP -> intenta zippopotam. Si falla -> fallback por IP.
//   2. Si no hay ZIP -> va directo al fallback por IP.
// Devuelve { location, input } donde input.source indica el origen usado.
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

  // Fallback por IP (tambien es el camino cuando no se paso ZIP).
  const location = await getLocationByIp();
  return { location, input: { zip: zip ?? null, source: "ip_fallback" } };
}

async function main() {
  // 1. Leer el ZIP como argumento de linea de comandos.
  const zip = process.argv[2];

  try {
    // 2. Resolver ubicacion (con fallback interno).
    const { location, input } = await resolveLocation(zip);

    // 3. Con las coordenadas, pedir clima + calidad del aire EN PARALELO.
    const [weather, airQuality] = await Promise.all([
      getWeather(location.lat, location.lon),
      getAirQuality(location.lat, location.lon),
    ]);

    // 4. Ensamblar el JSON final e imprimirlo.
    const context = buildContext({ input, location, weather, airQuality });
    console.log(JSON.stringify(context, null, 2));
  } catch (err) {
    // 5. Si algo fallo sin recuperacion (ej. ambas fuentes de ubicacion, o el
    //    clima), devolvemos un objeto de error ESTRUCTURADO, nunca un crash.
    const errorObject = {
      error: true,
      message: err.message,
      input: { zip: zip ?? null, source: null },
    };
    console.log(JSON.stringify(errorObject, null, 2));
    process.exitCode = 1;
  }
}

main();
