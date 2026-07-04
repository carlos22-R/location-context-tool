// src/services/zippopotam.js — SERVICIO: zippopotam.us
//
// Responsabilidad: dado un ZIP de EE.UU., resolver la ubicacion.
//   API:   https://api.zippopotam.us/us/{zip}
//   Sin API key. Devuelve city, state, country y coordenadas (lat, lon).
//
// Contrato previsto:
//   getLocationByZip(zip) -> { city, state, country, lat, lon }
//   - Si el ZIP no existe o la llamada falla, lanza un error para que el
//     orquestador active el fallback por IP.
//
// (Implementacion pendiente.)
