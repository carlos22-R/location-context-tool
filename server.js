// server.js — SERVIDOR HTTP (plus del ejercicio)
//
// Expone la herramienta como endpoint HTTP usando el modulo `http` NATIVO de
// Node (sin dependencias externas). Reutiliza el mismo "cerebro" que el CLI.
//
// Uso:
//   node server.js
//   curl "http://localhost:3000/context?zip=80203"

import http from "node:http";
import { getContext, buildErrorObject } from "./src/getContext.js";

const PORT = process.env.PORT || 3000;

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const server = http.createServer(async (req, res) => {
  // Parseamos la URL para separar la ruta de los query params (?zip=...).
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Unica ruta soportada: GET /context
  if (req.method === "GET" && url.pathname === "/context") {
    const zip = url.searchParams.get("zip") ?? undefined;

    try {
      const context = await getContext(zip);
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify(context, null, 2));
    } catch (err) {
      // Si todo fallo, respondemos el objeto de error estructurado con 500.
      res.writeHead(500, JSON_HEADERS);
      res.end(JSON.stringify(buildErrorObject(zip, err.message), null, 2));
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
