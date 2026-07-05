// server.js — SERVIDOR HTTP (plus del ejercicio)
//
// Expone la herramienta como endpoint HTTP usando el modulo `http` NATIVO de
// Node (sin dependencias externas). Reutiliza el mismo "cerebro" que el CLI.
//
// Uso:
//   node server.js
//   curl "http://localhost:3000/context?zip=80203"

import http from "node:http";
import {
  getContext,
  safeGetContext,
  buildErrorObject,
  friendlyErrorMessage,
  normalizeZips,
  MAX_ZIPS,
} from "./src/getContext.js";

const PORT = process.env.PORT || 3000;

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const server = http.createServer(async (req, res) => {
  // Parseamos la URL para separar la ruta de los query params (?zip=...).
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Unica ruta soportada: GET /context?zip=80203  (o varios: ?zip=80203,10001)
  if (req.method === "GET" && url.pathname === "/context") {
    // El parametro zip puede traer varios separados por coma. Limpiar + dedupe.
    const zipParam = url.searchParams.get("zip");
    const zips = normalizeZips(zipParam ? zipParam.split(",") : []);

    // Tope de ZIPs -> 400.
    if (zips.length > MAX_ZIPS) {
      const msg = `Maximo ${MAX_ZIPS} ZIPs por llamada.`;
      res.writeHead(400, JSON_HEADERS);
      res.end(JSON.stringify(buildErrorObject(null, msg), null, 2));
      return;
    }

    // Varios ZIPs -> array de contextos (en paralelo, a prueba de fallos).
    if (zips.length > 1) {
      const contexts = await Promise.all(zips.map(safeGetContext));
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify(contexts, null, 2));
      return;
    }

    // Un solo ZIP (o ninguno -> fallback por IP) -> objeto.
    const zip = zips[0]; // undefined si no se paso ninguno
    try {
      const context = await getContext(zip);
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify(context, null, 2));
    } catch (err) {
      // Si todo fallo, respondemos el objeto de error estructurado con 500.
      res.writeHead(500, JSON_HEADERS);
      res.end(JSON.stringify(buildErrorObject(zip, friendlyErrorMessage(err)), null, 2));
    }
    return;
  }

  // Cualquier otra ruta o metodo -> 404.
  res.writeHead(404, JSON_HEADERS);
  res.end(
    JSON.stringify(
      { error: true, message: "Ruta no encontrada. Usa GET /context?zip=80203" },
      null,
      2
    )
  );
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Prueba: http://localhost:${PORT}/context?zip=80203`);
});
