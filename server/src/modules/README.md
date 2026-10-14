# Modules

Cada carpeta representa un dominio funcional. Esta guía permite crear un módulo nuevo sin depender de los ejemplos actuales.

## Estructura estándar

```text
<domain>/
├── domain/
├── application/
│   ├── use-cases/
│   ├── ports/
│   └── types/
├── infrastructure/
│   ├── controllers/
│   ├── dto/
│   ├── repositories/
│   └── services/
└── <domain>.module.ts
```

Creá únicamente las carpetas que el módulo realmente necesite. Las dependencias apuntan hacia adentro:

```text
infrastructure → application → domain
```

Nunca al revés. Un módulo puede exponer una API intencional, pero no debe importar internals arbitrarios de otro dominio.

## `domain/`

Reglas puras del negocio: invariantes, entidades, value objects y errores de dominio.

Pregunta guía:

> Si cambio Nest, Prisma o PostgreSQL, ¿esta regla sigue existiendo?

Si la respuesta es sí, probablemente pertenece a domain. Ejemplos: saldo insuficiente, monto inválido, una transición de estado prohibida o cualquier restricción propia del negocio.

Domain no conoce NestJS, HTTP, DTOs, Prisma, application ni infrastructure.

## `application/use-cases/`

Coordina acciones del sistema. Por ejemplo, `transfer-money.use-case.ts` puede:

- recibir input;
- consultar ports;
- ejecutar reglas del domain;
- coordinar persistencia;
- devolver output.

Un use case no conoce Prisma ni HTTP y no usa decorators de Nest.

## `application/ports/`

Contratos que application necesita del exterior. Ejemplos:

```text
AccountRepositoryPort
EmailSenderPort
FileStoragePort
```

Application define qué necesita; infrastructure define cómo se implementa. Nombrá las operaciones con lenguaje del dominio, no con detalles del proveedor.

## `application/types/`

Inputs, outputs y tipos propios de application. No son necesariamente iguales a los DTOs HTTP: representan boundaries distintos aunque algunos campos coincidan.

## `infrastructure/controllers/`

Entrada HTTP. Su recorrido debe ser pequeño:

```text
request → DTO → use case → response
```

Un controller puede traducir request, respuesta y errores HTTP. No contiene reglas de negocio, queries Prisma ni workflows complejos.

## `infrastructure/dto/`

Contratos HTTP de entrada y salida. Usá `class-validator` y `class-transformer`; agregá decorators de Swagger para que el contrato publicado se mantenga actualizado. Zod queda reservado para environment/config.

## `infrastructure/repositories/`

Persistencia del dominio. Aquí viven:

- queries Prisma;
- SQL directo cuando un proyecto realmente lo requiera;
- implementaciones de repository ports.

Domain y application nunca importan estos repositories.

## `infrastructure/services/`

Integraciones técnicas externas que no son persistencia. Ejemplos futuros: email, password hashing, storage, payments, cache o APIs externas. Normalmente implementan un port definido por application.

No uses `services/` como carpeta genérica: un caso de uso pertenece a application y la persistencia pertenece a repositories.

## `<domain>.module.ts`

Composition root del dominio. Conecta controllers, use cases, ports, repositories e infrastructure services mediante providers de Nest. No contiene lógica de negocio.

```text
Controller
↓
Use Case
↓
Port
↓
Repository / Service implementation
```

## ¿Dónde va esto?

| Necesidad                               | Ubicación                      |
| --------------------------------------- | ------------------------------ |
| Validar que haya saldo suficiente       | `domain/`                      |
| Buscar cuentas, transferir y persistir  | `application/use-cases/`       |
| Declarar que necesito buscar una cuenta | `application/ports/`           |
| Ejecutar `prisma.account.findUnique`    | `infrastructure/repositories/` |
| Exponer `POST /transfers`               | `infrastructure/controllers/`  |
| Validar `amount` recibido por HTTP      | `infrastructure/dto/`          |
| Enviar un email mediante un proveedor   | `infrastructure/services/`     |

## Pasos para crear un módulo

1. Identificá el dominio y su responsabilidad.
2. Definí las reglas de negocio puras.
3. Definí los casos de uso.
4. Definí los ports que application necesita.
5. Implementá repositories y servicios de infraestructura.
6. Creá controllers y DTOs HTTP.
7. Conectá providers en `<domain>.module.ts`.
8. Agregá unit tests y tests HTTP relevantes.
9. Verificá que Swagger refleje los contratos.
10. Ejecutá lint, typecheck, tests, build y Prisma generate.

No es obligatorio crear un README por módulo. Los README de módulos concretos deben explicar solamente sus decisiones y flujo particular.
