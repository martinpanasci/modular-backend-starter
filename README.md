# Modular Backend Starter

Backend modular construido con **NestJS, TypeScript strict, Prisma y PostgreSQL**.

La arquitectura está pensada para aplicaciones de negocio medianas desarrolladas por equipos pequeños, priorizando:

- modularidad;
- separación de responsabilidades;
- bajo acoplamiento;
- testabilidad;
- mantenibilidad;
- contratos claros;
- seguridad básica;
- observabilidad;
- calidad automática.

La arquitectura adopta principios de **Hexagonal Architecture / Clean Architecture de forma pragmática**.

No se busca implementar capas o abstracciones porque sí. La complejidad arquitectónica debe responder a una necesidad real.

---

# Estructura

```text
src/
├── bootstrap/
├── common/
├── config/
├── database/
├── docs/
├── modules/
├── queues/
├── app.module.ts
└── main.ts
```

## `bootstrap/`

Configuración global necesaria al iniciar Nest.

Actualmente centraliza:

- prefijo global `/api`;
- Helmet;
- CORS;
- ValidationPipe;
- graceful shutdown.

Ejemplo:

```text
bootstrap/
└── configure-application.ts
```

No contiene lógica de negocio.

---

## `common/`

Código transversal reutilizable que no pertenece a ningún dominio.

Puede contener:

- exception filters;
- decorators;
- guards genéricos;
- interceptors;
- pipes;
- tipos compartidos;
- utilidades transversales.

Actualmente también contiene la infraestructura común para normalizar errores HTTP.

No debe convertirse en un lugar donde mover código simplemente porque se utiliza más de una vez.

Si una pieza representa un concepto de negocio, debe permanecer dentro de su módulo.

---

## `config/`

Configuración de la aplicación y validación del environment.

Se utiliza:

- `@nestjs/config`;
- Zod.

Las variables requeridas se validan durante startup.

Si una variable crítica falta o es inválida, la aplicación debe fallar inmediatamente.

Ejemplo:

```text
config/
├── environment.schema.ts
└── logger.config.ts
```

Las variables disponibles se documentan en:

```text
.env.example
```

Nunca deben hardcodearse secretos o configuración dependiente del ambiente.

---

## `database/`

Infraestructura global de conexión a PostgreSQL mediante Prisma.

Puede contener:

- `PrismaModule`;
- `PrismaService`;
- configuración global de Prisma.

Esta carpeta NO contiene queries específicas de negocio.

Las queries de un dominio pertenecen a:

```text
modules/<domain>/infrastructure/repositories/
```

Esto permite aislar Prisma del resto de la arquitectura.

---

## `docs/`

Configuración centralizada de Swagger/OpenAPI.

Swagger UI está disponible en:

```text
/docs
```

La especificación OpenAPI está disponible en:

```text
/docs/json
```

Los DTOs y controllers deben mantener esta documentación actualizada automáticamente siempre que sea posible.

---

## `queues/`

Lugar reservado para infraestructura de background jobs si un proyecto la necesita.

Por ejemplo:

- BullMQ;
- workers;
- scheduled jobs;
- Redis-backed queues.

El starter no instala Redis ni BullMQ por defecto.

No agregar infraestructura de queues hasta que exista un caso de uso real.

---

# Modules

Cada dominio funcional vive dentro de:

```text
src/modules/<domain>/
```

Ejemplos futuros:

```text
modules/
├── auth/
├── users/
├── transactions/
├── customers/
└── health/
```

Un módulo de negocio sigue esta estructura:

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

No todas las carpetas necesitan contener código si el dominio todavía no requiere esa responsabilidad.

---

# Domain

`domain/` contiene las reglas puras del negocio.

No conoce:

- NestJS;
- HTTP;
- Prisma;
- PostgreSQL;
- Swagger;
- controllers;
- infraestructura.

Ejemplo de regla de dominio:

> Una cuenta no puede transferir un monto mayor a su saldo disponible.

La misma regla debería continuar funcionando aunque mañana:

- Nest se reemplace;
- Prisma cambie;
- PostgreSQL cambie;
- la acción se ejecute desde HTTP, una queue o un script.

Pregunta útil:

> Si reemplazo toda la infraestructura, ¿esta regla sigue teniendo sentido?

Si la respuesta es sí, probablemente pertenece al dominio.

---

# Application

`application/` coordina los casos de uso del sistema.

Contiene:

```text
application/
├── use-cases/
├── ports/
└── types/
```

## Use cases

Representan acciones concretas que puede realizar la aplicación.

Ejemplos:

```text
transfer-money.use-case.ts
create-customer.use-case.ts
update-profile.use-case.ts
```

Un use case puede:

1. obtener información mediante ports;
2. utilizar el dominio;
3. coordinar operaciones;
4. persistir resultados;
5. devolver un resultado.

No debe ejecutar queries de Prisma directamente.

---

## Ports

Un port define una capacidad que application necesita del exterior sin conocer su implementación.

Ejemplo:

```ts
export abstract class AccountRepositoryPort {
  abstract findById(id: string): Promise<Account | null>;
  abstract save(account: Account): Promise<void>;
}
```

Application sabe que necesita buscar y guardar cuentas.

No sabe si debajo existe:

- Prisma;
- SQL;
- MongoDB;
- memoria;
- un fake de testing.

Infrastructure proporciona esa implementación.

---

## Types

Contiene inputs, outputs y tipos propios de la capa application.

Ejemplo:

```ts
export type TransferMoneyInput = {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
};
```

Los tipos HTTP y los tipos de application representan boundaries diferentes y no deben confundirse automáticamente.

---

# Infrastructure

`infrastructure/` conecta la aplicación con tecnologías externas.

```text
infrastructure/
├── controllers/
├── dto/
├── repositories/
└── services/
```

## Controllers

Son el adapter HTTP de entrada.

Su responsabilidad debe ser pequeña:

```text
HTTP request
      ↓
Controller
      ↓
Use Case
```

Un controller puede:

- recibir parámetros;
- recibir DTOs;
- obtener contexto HTTP;
- ejecutar un use case;
- devolver el resultado.

No debe:

- contener reglas de negocio;
- ejecutar queries Prisma;
- implementar procesos complejos.

---

## DTOs

Los DTOs representan contratos HTTP.

Se utilizan `class-validator` y `class-transformer`.

Ejemplo:

```ts
export class CreateTransferDto {
  @IsUUID()
  sourceAccountId!: string;

  @IsUUID()
  destinationAccountId!: string;

  @IsPositive()
  amount!: number;
}
```

El `ValidationPipe` global utiliza:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

Zod se reserva para validación del environment.

---

## Repositories

Implementan acceso a persistencia.

Acá deben vivir:

- queries Prisma;
- SQL directo si alguna vez fuera necesario;
- implementación de repository ports.

Flujo:

```text
Application
    ↓
Repository Port
    ↑
Infrastructure Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Cambiar de ORM debería impactar principalmente esta capa y no las reglas de negocio.

---

## Services

Implementaciones técnicas externas que no representan persistencia.

Ejemplos futuros:

```text
bcrypt-password-hasher.service.ts
s3-file-storage.service.ts
email.service.ts
payment-provider.service.ts
redis-cache.service.ts
```

Normalmente implementan un port definido por application.

No crear infrastructure services si no existe una necesidad real.

---

# Nest Module

`<domain>.module.ts` funciona como composition root del dominio.

Conecta:

- controllers;
- use cases;
- ports;
- repositories;
- infrastructure services.

Ejemplo conceptual:

```text
Controller
    ↓
TransferMoneyUseCase
    ↓
AccountRepositoryPort
    ↓
PrismaAccountRepository
```

La dependencia conceptual siempre apunta hacia adentro:

```text
infrastructure → application → domain
```

Nunca al revés.

---

# Flujo de una request

Una request típica atraviesa:

```text
HTTP Request
     ↓
ValidationPipe
     ↓
Controller
     ↓
Use Case
     ↓
Domain
     ↓
Port
     ↓
Repository / Infrastructure Service
     ↓
Database / External System
```

La respuesta vuelve atravesando las capas hacia HTTP.

---

# Health checks

El módulo `health` expone:

```text
GET /api/health/live
GET /api/health/ready
```

## Live

Responde a:

> ¿El proceso está vivo?

No consulta PostgreSQL ni otros servicios.

Debe ser extremadamente rápido.

## Ready

Responde a:

> ¿Esta instancia puede procesar tráfico correctamente?

En el starter verifica PostgreSQL mediante Prisma.

En proyectos futuros puede incorporar otras dependencias críticas, como Redis o workers.

No todo servicio externo debe formar parte de readiness. Solo aquellos cuya caída haga que la instancia no pueda operar correctamente.

La infraestructura de deployment decide cuándo y cómo consultar estos endpoints.

---

# Errors

Todas las respuestas de error HTTP siguen un formato consistente.

Conceptualmente:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": [],
  "path": "/api/example",
  "timestamp": "..."
}
```

Los errores inesperados se registran internamente.

En producción nunca deben exponerse:

- stack traces;
- detalles internos;
- secretos;
- información técnica sensible.

---

# Logging

El backend utiliza Pino para logging estructurado.

Los logs HTTP incluyen contexto como:

- método;
- path;
- status;
- duración;
- request ID.

Nunca deben registrarse:

- passwords;
- tokens;
- authorization headers;
- cookies completas;
- secrets;
- información personal innecesaria.

---

# Request ID

Cada request recibe un identificador de correlación.

Se utiliza:

```text
x-request-id
```

Permite relacionar todos los logs pertenecientes a una misma request.

Si llega un identificador válido desde upstream puede conservarse; de lo contrario se genera uno.

---

# Security

El starter incluye:

- Helmet;
- CORS explícito;
- DTO validation;
- environment validation;
- redacción de información sensible en logs.

Rate limiting no está habilitado por defecto.

Debe agregarse cuando el caso de uso lo requiera, especialmente en endpoints expuestos o sensibles.

---

# Graceful shutdown

Nest escucha señales de terminación como:

```text
SIGINT
SIGTERM
```

Esto permite cerrar el proceso de forma ordenada durante:

- deployments;
- reinicios;
- reemplazo de containers;
- apagados manuales.

La infraestructura futura puede usar este lifecycle para cerrar correctamente:

- conexiones;
- queues;
- workers;
- otros recursos.

---

# Testing

El backend utiliza Jest y Supertest.

## Unit tests

Se utilizan para:

- domain;
- use cases;
- helpers;
- lógica aislada.

Normalmente viven junto al archivo probado:

```text
transfer-money.use-case.ts
transfer-money.use-case.spec.ts
```

## HTTP / E2E

Supertest verifica el comportamiento HTTP real de Nest:

- routing;
- DTO validation;
- pipes;
- filters;
- status codes;
- response contracts.

Viven en:

```text
test/
```

Cuando es razonable, las dependencias externas pueden reemplazarse por fakes para evitar que una suite HTTP necesite infraestructura externa.

---

# Coverage

Ejecutar:

```bash
npm run test:cov
```

El reporte muestra:

- statements;
- branches;
- functions;
- lines.

No existe un threshold global obligatorio.

Coverage es una señal para detectar áreas poco testeadas, no un objetivo numérico por sí mismo.

Un porcentaje alto no garantiza buenos tests.

---

# Quality gates

El proyecto utiliza:

- ESLint;
- Prettier;
- TypeScript strict;
- Husky;
- lint-staged;
- Jest;
- Supertest;
- coverage;
- architecture boundaries;
- GitHub Actions;
- Dependabot.

Antes de integrar cambios deben pasar:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run prisma:generate
```

Coverage puede revisarse con:

```bash
npm run test:cov
```

---

# CI

GitHub Actions ejecuta el pipeline del backend desde:

```text
.github/workflows/server-ci.yml
```

El workflow trabaja sobre la raíz del repositorio y valida cambios relevantes antes de integración.

No incluye deployment.

---

# Dependencias

Dependabot revisa las dependencias del client y server desde la configuración raíz:

```text
.github/dependabot.yml
```

Las actualizaciones deben pasar por PR y los mismos quality gates que cualquier otro cambio.

No ejecutar `npm audit fix --force` automáticamente cuando implique cambios mayores o downgrades destructivos.

---

# Comandos

```bash
npm run dev
npm run build
npm run start

npm run lint
npm run lint:fix

npm run typecheck

npm test
npm run test:watch
npm run test:e2e
npm run test:cov

npm run format
npm run format:check

npm run prisma:generate
npm run prisma:migrate
```

---

# Antes de abrir un PR

Verificar:

- la lógica está en la capa correcta;
- domain permanece puro;
- application no conoce infraestructura;
- controllers son finos;
- Prisma vive en infrastructure;
- los DTOs validan correctamente;
- Swagger refleja cambios HTTP;
- errores usan el formato estándar;
- logs no exponen información sensible;
- tests relevantes fueron agregados;
- lint pasa;
- typecheck pasa;
- tests pasan;
- build pasa.

El código no está terminado solamente porque funciona.

También debe respetar la arquitectura y ser mantenible.

