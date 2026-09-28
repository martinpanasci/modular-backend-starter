# Domain

Reglas puras del ejemplo. `Account` protege el saldo y `assertTransferIsValid` valida monto y cuentas distintas. Los errores expresan fallos del dominio sin depender de NestJS, Prisma, HTTP ni Swagger.

Este código debe poder ejecutarse como TypeScript puro. No agregues DTO, decoradores, queries ni detalles de transporte. Evitá separar entidades y value objects si no mejora una regla concreta.
