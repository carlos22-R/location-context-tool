// index.js — ENTRADA CLI
//
// Punto de entrada por linea de comandos. Lee uno o varios ZIPs, pide el
// contexto al "cerebro" (src/getContext.js) e imprime el resultado. Toda la
// orquestacion vive en getContext.js para reutilizarla en el servidor.
//
// Uso:  node index.js 80203
//       node index.js 80203 10001 90210   (varios -> array)

import {
  getContext,
  safeGetContext,
  buildErrorObject,
  normalizeZips,
  MAX_ZIPS,
} from "./src/getContext.js";

async function main() {
  // Lee todos los ZIPs de los argumentos; limpia y quita duplicados.
  const zips = normalizeZips(process.argv.slice(2));

  // Varios ZIPs -> array de contextos.
  if (zips.length > 1) {
    if (zips.length > MAX_ZIPS) {
      const msg = `Maximo ${MAX_ZIPS} ZIPs por llamada.`;
      console.log(JSON.stringify(buildErrorObject(null, msg), null, 2));
      process.exitCode = 1;
      return;
    }
    // En paralelo y a prueba de fallos: cada ZIP trae su contexto o su error.
    const contexts = await Promise.all(zips.map(safeGetContext));
    console.log(JSON.stringify(contexts, null, 2));
    return;
  }

  // Un solo ZIP (o ninguno -> fallback por IP) -> objeto.
  const zip = zips[0]; // undefined si no se paso ninguno
  try {
    const context = await getContext(zip);
    console.log(JSON.stringify(context, null, 2));
  } catch (err) {
    // Si todo fallo, objeto de error estructurado, nunca un crash.
    console.log(JSON.stringify(buildErrorObject(zip, err.message), null, 2));
    process.exitCode = 1;
  }
}

main();
