# Infrastructure

Adaptadores técnicos del módulo:

- `controllers`: reciben HTTP, validan DTO, invocan un caso de uso y traducen el resultado a HTTP.
- `dto`: contratos de entrada y salida HTTP con validación y documentación Swagger.
- `repositories`: implementaciones de persistencia; `PrismaAccountRepository` implementa el port y usa una transacción PostgreSQL.
- `services`: integraciones externas que no son persistencia; no existe todavía porque el ejemplo no la necesita.

Infrastructure puede depender de application y domain. Las capas internas nunca deben importar controllers, DTO ni Prisma.
