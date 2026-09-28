# Transfers example module

Ejemplo didáctico de una transferencia entre cuentas internas. Existe para mostrar el recorrido completo de una request y puede eliminarse cuando el starter adopte dominios reales.

```text
POST /api/transfers
→ TransfersController
→ TransferMoneyUseCase
→ AccountRepositoryPort
→ PrismaAccountRepository
→ PostgreSQL
```

El dominio valida monto, cuentas diferentes y saldo disponible. Application coordina la carga de cuentas y la persistencia. Infrastructure traduce HTTP y ejecuta una transacción atómica en Prisma.

El módulo Nest registra el controller, el caso de uso y enlaza `AccountRepositoryPort` con `PrismaAccountRepository`. No hay autenticación, creación de cuentas ni lógica financiera adicional.

Ejemplo de body:

```json
{
  "sourceAccountId": "00000000-0000-4000-8000-000000000001",
  "destinationAccountId": "00000000-0000-4000-8000-000000000002",
  "amountInCents": 2500
}
```

Creá cuentas de demostración con Prisma Studio después de aplicar la migración.
