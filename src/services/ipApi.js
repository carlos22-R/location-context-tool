// src/services/ipApi.js — SERVICIO: ip-api.com (FALLBACK)
//
// Responsabilidad: cuando el ZIP falla, detectar la ubicacion del cliente
// automaticamente por su IP.
//   API:   http://ip-api.com/json/   (sin API key; OJO: es HTTP, no HTTPS)
//
// Contrato:
//   getLocationByIp() -> { city, state, country, lat, lon }
//   - Si falla, lanza un Error para que el orquestador devuelva el objeto
//     de error estructurado (source ya no seria "zip" ni "ip_fallback").
//
// Devolvemos la MISMA forma que zippopotam.js, asi el resto del codigo no
// nota de donde salio la ubicacion. El JSON final marcara source: "ip_fallback".

import { pathToFileURL } from "node:url";

// Sin IP en la URL => la API usa la IP de quien hace la peticion (el cliente).
const BASE_URL = "http://ip-api.com/json/";

export async function getLocationByIp() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error(`ip-api fallo (HTTP ${response.status})`);
  }

  const data = await response.json();

  // ip-api indica el resultado en el campo "status", no en el codigo HTTP:
  // puede responder 200 pero con status "fail".
  if (data.status !== "success") {
    throw new Error(`ip-api no pudo resolver la ubicacion: ${data.message}`);
  }

  // Normalizamos a la misma forma que zippopotam.
  return {
    city: data.city,
    state: data.regionName,    // nombre completo, ej. "Virginia"
    country: data.countryCode, // ej. "US"
    lat: data.lat,             // ya son numeros
    lon: data.lon,
  };
}

// ---------------------------------------------------------------------------
// BLOQUE DE PRUEBA (solo si ejecutas este archivo directamente):
//   node src/services/ipApi.js
// Detectara TU ubicacion real por IP.
// ---------------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log("Probando getLocationByIp() (detecta tu IP)...\n");
  getLocationByIp()
    .then((location) => console.log(JSON.stringify(location, null, 2)))
    .catch((err) => console.error("Error:", err.message));
}
