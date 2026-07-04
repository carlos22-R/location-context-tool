// index.js — ORQUESTADOR
//
// Este archivo es el "director de orquesta". Su unica responsabilidad es
// coordinar el flujo; NO contiene detalles de las APIs ni logica de negocio.
//
// Flujo previsto:
//   1. Leer el ZIP desde los argumentos de linea de comandos (o variable).
//   2. Intentar resolver la ubicacion con services/zippopotam.js.
//      - Si falla, usar el fallback services/ipApi.js (source: "ip_fallback").
//   3. Con las coordenadas, pedir clima + calidad del aire en paralelo
//      (Promise.all) a services/openMeteo.js.
//   4. Calcular la logica propia: logic/condition.js y logic/outdoorScore.js.
//   5. Ensamblar el JSON final con buildContext.js e imprimirlo.
//   6. Si todo falla, imprimir un objeto de error estructurado (nunca crashear).
//
// (Implementacion pendiente — de momento solo definimos la estructura.)

async function main() {
  // TODO: implementar el flujo descrito arriba.
}

main();
