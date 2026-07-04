// src/services/zippopotam.js — SERVICIO: zippopotam.us
//
// Responsabilidad: dado un ZIP de EE.UU., resolver la ubicacion.
//   API:   https://api.zippopotam.us/us/{zip}   (sin API key)
//
// Contrato:
//   getLocationByZip(zip) -> { city, state, country, lat, lon }
//   - Si el ZIP no existe (HTTP 404) o la llamada falla, lanza un Error
//     para que el orquestador active el fallback por IP.

import { pathToFileURL } from "node:url";

const BASE_URL = "https://api.zippopotam.us/us";

export async function getLocationByZip(zip) {
  // 1. Llamamos a la API. El ZIP va directo en la URL.
  const response = await fetch(`${BASE_URL}/${zip}`);

  // 2. Si el ZIP no existe, la API responde 404 con body vacio.
  //    Lanzamos un Error para que el orquestador use el fallback por IP.
  if (!response.ok) {
    throw new Error(`ZIP no encontrado en zippopotam (HTTP ${response.status})`);
  }

  // 3. Parseamos el JSON crudo de la API.
  const data = await response.json();

  // 4. Los datos utiles estan dentro de "places" (un array). Si por algun
  //    motivo viene vacio, tambien lo tratamos como fallo.
  const place = data.places?.[0];
  if (!place) {
    throw new Error("Respuesta de zippopotam sin datos de ubicacion");
  }

  // 5. Devolvemos SOLO lo que nos interesa, ya limpio y con los tipos
  //    correctos (lat/lon vienen como string en la API -> los pasamos a Number).
  return {
    city: place["place name"],
    state: place["state"],                 // nombre completo, ej. "Colorado"
    country: data["country abbreviation"], // ej. "US"
    lat: Number(place.latitude),
    lon: Number(place.longitude),
  };
}

// ---------------------------------------------------------------------------
// BLOQUE DE PRUEBA (solo se ejecuta si corres este archivo directamente):
//   node src/services/zippopotam.js 80203
// No se ejecuta cuando el archivo es importado por el orquestador.
// ---------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const zip = process.argv[2] || "80203";
  console.log(`Probando getLocationByZip("${zip}")...\n`);
  getLocationByZip(zip)
    .then((location) => console.log(JSON.stringify(location, null, 2)))
    .catch((err) => console.error("Error:", err.message));
}
