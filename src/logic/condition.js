// src/logic/condition.js — LOGICA PROPIA: mapeo de condicion climatica
//
// >>> LOGICA DISEÑADA POR NOSOTROS. <<<
//
// Transforma el weathercode (entero estandar WMO de Open-Meteo) en un texto
// legible y AGRUPADO. No hay una agrupacion "correcta" unica; la nuestra
// agrupa por fenomeno fisico y en orden de "peor para estar al aire libre"
// (despejado -> nubes -> niebla -> llovizna -> lluvia -> nieve -> tormenta),
// porque esta misma clasificacion alimenta luego el outdoor_score.
//   Referencia de codigos WMO: https://open-meteo.com/en/docs
//
// Contrato:
//   mapCondition(weathercode) -> "Clear" | "Rainy" | ... | "Unknown"

import { pathToFileURL } from "node:url";

// Fuente de la verdad: cada grupo con los codigos WMO que abarca. Se lee igual
// que la tabla que documentamos en el README.
const WMO_GROUPS = {
  "Clear": [0, 1], // cielo despejado o casi
  "Partly cloudy": [2], // algo de nubes, buen clima aun
  "Cloudy": [3], // totalmente cubierto
  "Fog": [45, 48], // niebla (incluye con escarcha): visibilidad reducida
  "Drizzle": [51, 53, 55, 56, 57], // llovizna, incluida la helada: molesta pero leve
  "Rainy": [61, 63, 65, 66, 67, 80, 81, 82], // lluvia y chubascos de toda intensidad
  "Snowy": [71, 73, 75, 77, 85, 86], // toda la nieve
  "Thunderstorm": [95, 96, 99], // tormentas (lo mas peligroso para salir)
};

// A partir de WMO_GROUPS construimos un mapa plano { codigo -> grupo } para
// una busqueda directa O(1). No lo escribimos a mano: se genera solo, asi no
// se puede desincronizar de WMO_GROUPS.
const CODE_TO_CONDITION = {};
for (const [condition, codes] of Object.entries(WMO_GROUPS)) {
  for (const code of codes) {
    CODE_TO_CONDITION[code] = condition;
  }
}

export function mapCondition(weathercode) {
  // Si WMO agrega un codigo que no tenemos mapeado, devolvemos "Unknown"
  // en vez de undefined (nunca rompemos el JSON de salida).
  return CODE_TO_CONDITION[weathercode] ?? "Unknown";
}

// ---------------------------------------------------------------------------
// BLOQUE DE PRUEBA (solo si ejecutas este archivo directamente):
//   node src/logic/condition.js
// Recorre todos los codigos WMO y muestra a que grupo cae cada uno.
// ---------------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const allCodes = [
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77,
    80, 81, 82, 85, 86, 95, 96, 99,
  ];
  console.log("Codigo WMO -> condition:\n");
  for (const code of allCodes) {
    console.log(`  ${String(code).padStart(2)} -> ${mapCondition(code)}`);
  }
  console.log(`\n  999 (desconocido) -> ${mapCondition(999)}`);
}
