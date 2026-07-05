// index.js — ENTRADA CLI
//
// Punto de entrada por linea de comandos. Solo se encarga de: leer el ZIP,
// pedir el contexto al "cerebro" (src/getContext.js) e imprimirlo. Toda la
// orquestacion vive en getContext.js para poder reutilizarla en el servidor.
//
// Uso:  node index.js 80203

import { getContext, buildErrorObject } from "./src/getContext.js";

async function main() {
  // Lee el ZIP como argumento de linea de comandos (opcional: sin ZIP usa IP).
  const zip = process.argv[2];

  try {
    const context = await getContext(zip);
    console.log(JSON.stringify(context, null, 2));
  } catch (err) {
    // Si todo fallo (ej. sin internet), devolvemos un objeto de error
    // estructurado, nunca un crash del proceso.
    console.log(JSON.stringify(buildErrorObject(zip, err.message), null, 2));
    process.exitCode = 1;
  }
}

main();
