# Application

Coordina lo necesario para completar una transferencia sin conocer Prisma ni HTTP.

- `use-cases`: acciones del sistema, como `TransferMoneyUseCase`.
- `ports`: contratos que application necesita del exterior. `AccountRepositoryPort` expresa lectura y persistencia sin decidir tecnología.
- `types`: inputs, outputs y resultados de application.

El caso de uso carga cuentas mediante el port, ejecuta reglas del dominio y solicita persistencia. No agregues controllers, decoradores Swagger ni queries de ORM.
