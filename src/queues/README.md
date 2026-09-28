# Queues

Placeholder arquitectúnico para background processing cuando exista un caso de uso concreto. Puede alojar en el futuro composición global para BullMQ, Redis, workers o scheduled jobs.

Usos razonables:

- procesamiento de emails;
- trabajos pesados fuera del request;
- reintentos controlados;
- procesos asincrúnicos o programados.

El starter no instala Redis ni BullMQ. No agregues queues preventivamente ni muevas aquí casos de uso o reglas de dominio: los workers deben invocar application mediante contratos claros.

Si un trabajo puede resolverse correctamente dentro de un request normal y no hay una necesidad operativa real, no uses una queue.
