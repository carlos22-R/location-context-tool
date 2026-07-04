// src/services/ipApi.js — SERVICIO: ip-api.com (FALLBACK)
//
// Responsabilidad: cuando el ZIP falla, detectar la ubicacion del cliente
// automaticamente por su IP.
//   API:   http://ip-api.com/json/
//   Sin API key.
//
// Contrato previsto:
//   getLocationByIp() -> { city, state, country, lat, lon }
//   - Si tambien falla, lanza error para que el orquestador devuelva el
//     objeto de error estructurado.
//
// El JSON final marcara source: "ip_fallback" cuando se use este servicio.
//
// (Implementacion pendiente.)
