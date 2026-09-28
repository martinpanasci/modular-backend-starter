# Backend Agent Rules

Estas reglas aplican a todo `server/`.

Antes de modificar código:

1. inspeccioná el módulo afectado;
2. identificá la capa correcta;
3. reutilizá los patrones existentes;
4. evitá introducir arquitectura o dependencias nuevas si la solución actual puede resolver el problema.

La arquitectura sigue principios de Hexagonal/Clean Architecture de manera pragmática.

La prioridad es mantener boundaries claros sin introducir abstracciones artificiales.

---

# 1. Dependency rule

Las dependencias siempre deben apuntar hacia adentro:

```text
infrastructure → application → domain
```

## Domain

Puede depender únicamente de:

- TypeScript;
- otros elementos del mismo domain cuando corresponda.

Domain NO puede importar:

- NestJS;
- Prisma;
- HTTP;
- controllers;
- DTOs;
- application;
- infrastructure.

## Application

Puede importar:

- domain;
- sus propios ports;
- sus propios types.

Application NO puede importar:

- Prisma;
- controllers;
- DTOs HTTP;
- infrastructure implementations.

## Infrastructure

Puede importar:

- application;
- domain;
- NestJS;
- Prisma;
- librerías externas necesarias.

Nunca inviertas esta dependencia para ahorrar código.

---

# 2. Module ownership

Cada dominio funcional pertenece a:

```text
src/modules/<domain>/
```

La estructura estándar es:

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

No crees lógica específica de un dominio en:

```text
common/
database/
bootstrap/
config/
```

No crees carpetas globales de:

```text
controllers/
repositories/
services/
```

Los elementos específicos pertenecen a su módulo.

---

# 3. Domain rules

Domain contiene comportamiento y reglas puras del negocio.

Ejemplos:

```text
saldo insuficiente
monto inválido
estado que impide una operación
restricciones de negocio
```

Una regla pertenece a domain cuando debería continuar siendo válida aunque cambien:

- framework;
- transport;
- ORM;
- database;
- infraestructura.

No mover reglas de negocio a controllers o repositories.

No utilizar Prisma models como sustitutos automáticos de modelos de dominio cuando exista comportamiento de dominio real.

---

# 4. Use cases

Cada operación significativa de application debe representarse como un use case.

Ejemplos:

```text
create-customer.use-case.ts
transfer-money.use-case.ts
update-profile.use-case.ts
```

Un use case:

1. recibe input;
2. obtiene dependencias mediante ports;
3. coordina reglas del domain;
4. ejecuta operaciones necesarias;
5. devuelve output.

No debe saber cómo funciona Prisma.

No debe depender de request/response HTTP.

No debe contener decorators Nest.

Evitar clases `SomethingService` genéricas que acumulen múltiples casos de uso no relacionados.

Preferir casos de uso explícitos.

---

# 5. Ports

Un port representa una capacidad que application necesita del exterior.

Ejemplos:

```text
AccountRepositoryPort
EmailSenderPort
FileStoragePort
PasswordHasherPort
```

Definí el port desde la necesidad de application, no desde la API de la tecnología concreta.

Evitar:

```ts
interface Repository {
  prismaFindUnique(...)
}
```

Preferir lenguaje del dominio/application:

```ts
abstract findById(id: string): Promise<Account | null>;
```

Infrastructure implementa estos contratos.

---

# 6. Application types

Los inputs y outputs de application pertenecen a:

```text
application/types/
```

No confundas automáticamente:

```text
HTTP DTO
```

con:

```text
Application Input
```

Pueden tener campos similares pero representan boundaries diferentes.

No introduzcas mapeos artificiales cuando no aporten claridad, pero tampoco acoples application a decorators HTTP.

---

# 7. Controllers

Controllers son adapters HTTP de entrada.

Deben mantenerse finos.

Permitido:

```text
request
→ DTO
→ use case
→ response
```

Un controller puede:

- leer params;
- leer body;
- leer query params;
- obtener contexto HTTP;
- llamar un use case;
- mapear respuesta HTTP cuando sea necesario.

Un controller NO debe:

- ejecutar Prisma queries;
- implementar reglas de negocio;
- contener workflows complejos;
- conocer detalles de persistencia.

Si un controller comienza a crecer significativamente, revisá si la lógica pertenece a application.

---

# 8. DTOs

Los DTOs viven en:

```text
infrastructure/dto/
```

Usar:

- `class-validator`;
- `class-transformer`.

Los DTOs representan entrada/salida HTTP.

Agregar decorators Swagger cuando sean necesarios para mantener contratos correctamente documentados.

No usar Zod para DTOs.

Zod está reservado para environment/config.

No debilitar ValidationPipe para aceptar payloads inválidos.

La configuración global mantiene:

```text
whitelist
forbidNonWhitelisted
transform
```

---

# 9. Repositories

Todas las queries de base de datos específicas del dominio pertenecen a:

```text
infrastructure/repositories/
```

Prisma solo debe aparecer en infrastructure o infraestructura global de database.

Nunca usar Prisma directamente desde:

```text
domain/
application/
controllers/
```

Repositories implementan ports definidos por application cuando corresponda.

Si cambia Prisma por otro ORM, domain/application deberían requerir pocos o ningún cambio.

---

# 10. Infrastructure services

Usar:

```text
infrastructure/services/
```

para integraciones técnicas externas que no son persistencia.

Ejemplos:

- hashing;
- email;
- storage;
- payments;
- cache;
- third-party APIs.

No crear `services/` como cajón genérico.

Si el código es un caso de uso, pertenece a application.

Si es persistencia, pertenece a repositories.

Si implementa una integración técnica externa, pertenece a infrastructure/services.

---

# 11. Nest modules

`<domain>.module.ts` conecta las implementaciones.

Debe registrar:

- controllers;
- use cases;
- repository implementations;
- infrastructure services;
- port bindings.

El module es composition root.

No colocar lógica de negocio dentro de `@Module`.

---

# 12. Common

`src/common` contiene exclusivamente responsabilidades transversales.

Ejemplos válidos:

- global exception filters;
- decorators reutilizables;
- generic guards;
- interceptors;
- pipes;
- shared technical types;
- utilities realmente transversales.

No mover código a common simplemente porque se reutiliza.

Primero identificar si existe un dominio dueño del concepto.

---

# 13. Bootstrap

Configuración global de Nest pertenece a:

```text
src/bootstrap/
```

Actualmente incluye:

- global prefix;
- Helmet;
- CORS;
- ValidationPipe;
- shutdown hooks.

No mover esta configuración a `common`.

Mantener `main.ts` pequeño.

---

# 14. Config

Toda configuración dependiente del environment debe pasar por:

```text
src/config/
```

Usar Zod para validar environment.

No acceder arbitrariamente a:

```ts
process.env;
```

desde módulos de negocio.

Usar la configuración centralizada.

No hardcodear:

- URLs;
- secrets;
- credentials;
- environment-specific values.

---

# 15. Error handling

Los errores HTTP deben utilizar el formato estándar del proyecto.

No crear respuestas de error diferentes en cada controller.

Los errores inesperados:

- deben loguearse;
- deben transformarse al formato HTTP estándar;
- no deben exponer detalles internos.

Nunca devolver en producción:

- stack traces;
- Prisma errors crudos;
- SQL;
- secrets;
- paths internos.

---

# 16. Logging

Usar el logger estructurado existente.

No usar `console.log` para logging de aplicación.

Los logs deben incluir contexto útil cuando corresponda:

- request ID;
- módulo;
- operación;
- resultado.

Nunca loguear:

- passwords;
- JWTs;
- authorization headers;
- cookies completas;
- secrets;
- API keys;
- datos personales innecesarios.

---

# 17. Request IDs

Cada request HTTP debe mantener su `x-request-id`.

Cuando agregues logs relacionados con una request, preservá la correlación existente.

No generes sistemas paralelos de correlation IDs.

---

# 18. Health

El módulo `health` es intencionalmente pragmático.

No aplicar automáticamente la arquitectura completa domain/application/infrastructure si no aporta valor.

## `/health/live`

Solo indica que el proceso está vivo.

Nunca agregar checks de:

- database;
- Redis;
- workers;
- servicios externos.

Debe ser rápido.

## `/health/ready`

Verifica dependencias imprescindibles para aceptar tráfico.

Actualmente:

```text
PostgreSQL / Prisma
```

Si se agrega una dependencia futura, incorporarla a readiness solo si su ausencia realmente impide que la instancia opere.

No agregar integraciones opcionales a readiness.

---

# 19. Security

Mantener:

- Helmet;
- CORS explícito;
- DTO validation;
- env validation;
- safe logging.

No configurar:

```text
origin: *
```

en producción cuando se utilizan credentials.

No agregar rate limiting sin requerimiento.

No agregar autenticación genérica al starter.

---

# 20. Graceful shutdown

No eliminar:

```ts
app.enableShutdownHooks(...)
```

Los providers que administren recursos futuros deben participar correctamente del lifecycle de Nest cuando corresponda.

No utilizar:

```ts
process.exit(...)
```

como solución normal de shutdown.

Al agregar:

- workers;
- queues;
- external connections;

asegurarse de cerrarlos correctamente durante shutdown.

---

# 21. Testing strategy

Elegí el tipo de test según la responsabilidad.

## Domain

Agregar unit tests para:

- reglas;
- invariantes;
- edge cases;
- errores de dominio.

## Application

Agregar unit tests para use cases.

Preferir fakes/mocks de ports para aislar application de infraestructura.

Probar:

- happy path;
- errores relevantes;
- comportamiento ante respuestas de dependencias.

## Infrastructure

Agregar tests cuando exista comportamiento significativo que valga la pena proteger.

## HTTP

Usar Supertest cuando cambien:

- routes;
- DTO validation;
- status codes;
- filters;
- HTTP contracts.

No convertir todos los tests en E2E.

---

# 22. Test placement

Unit tests viven normalmente junto al archivo:

```text
transfer-money.use-case.ts
transfer-money.use-case.spec.ts
```

HTTP/E2E viven en:

```text
test/
```

No crear árboles de tests duplicando toda la estructura de `src`.

---

# 23. Coverage

Coverage debe permanecer visible mediante:

```bash
npm run test:cov
```

No existe threshold obligatorio.

No escribas tests inútiles para aumentar coverage.

Usá coverage para detectar:

- reglas sin probar;
- branches olvidadas;
- use cases sin protección.

La calidad del test importa más que el porcentaje global.

---

# 24. Architecture tests

No debilites las reglas ESLint de boundaries para resolver imports incorrectos.

Si aparece una violación:

1. revisá la dirección de dependencia;
2. mové la responsabilidad a la capa correcta;
3. introducí un port si realmente existe una dependencia exterior.

No agregues excepciones de lint salvo que exista una justificación arquitectónica real.

---

# 25. Prisma generated code

Nunca modificar manualmente:

```text
src/generated/prisma/
```

Ese código es generado desde Prisma schema.

Modificar:

```text
prisma/schema.prisma
```

y luego ejecutar:

```bash
npm run prisma:generate
```

No colocar lógica de negocio dentro de código generado.

---

# 26. Database changes

Al modificar Prisma schema:

1. actualizar el schema;
2. generar Prisma Client;
3. crear migration cuando corresponda;
4. actualizar repository implementations;
5. actualizar tests;
6. verificar Swagger/contratos si el cambio impacta HTTP.

No editar migrations antiguas ya utilizadas en ambientes compartidos.

---

# 27. Dependencies

Antes de instalar una dependencia nueva:

1. verificar si el stack actual ya resuelve el problema;
2. confirmar que la dependencia agrega valor real;
3. revisar impacto de mantenimiento y seguridad.

No agregar sin requerimiento explícito:

- Redis;
- BullMQ;
- JWT/auth;
- rate limiting;
- API versioning;
- Sentry;
- OpenTelemetry;
- Kafka;
- CQRS;
- event sourcing;
- cloud-specific implementations.

---

# 28. GitHub / CI

Los workflows viven únicamente en:

```text
/.github/
```

No crear:

```text
server/.github/
```

El backend CI debe usar `server/` como working directory.

No modificar workflows del client salvo que la tarea lo requiera.

---

# 29. Generated and temporary artifacts

No commitear:

- coverage output;
- build output;
- logs;
- local env files;
- temporary test artifacts.

No ignorar archivos necesarios para reproducir el proyecto.

---

# 30. Definition of Done

Antes de considerar una tarea terminada:

### Architecture

- la responsabilidad está en la capa correcta;
- domain sigue puro;
- application no conoce infrastructure;
- controllers siguen finos;
- Prisma permanece en infrastructure;
- boundaries pasan ESLint.

### HTTP

- DTOs están actualizados;
- validation funciona;
- Swagger refleja el contrato;
- errors utilizan el formato común.

### Security

- no se exponen secretos;
- logs son seguros;
- CORS/Helmet no fueron debilitados.

### Tests

- domain/use cases modificados tienen tests relevantes;
- HTTP changes tienen tests cuando corresponde;
- tests pasan.

### Quality

Ejecutar:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run prisma:generate
```

Cuando sea relevante revisar:

```bash
npm run test:cov
```

No finalizar una tarea con checks fallando.

---

# 31. Placement decision guide

Antes de crear código nuevo:

```text
¿Es una regla pura del negocio?
→ domain

¿Coordina una acción del sistema?
→ application/use-cases

¿Application necesita algo externo?
→ application/ports

¿Es input/output de application?
→ application/types

¿Recibe HTTP?
→ infrastructure/controllers

¿Describe/valida HTTP?
→ infrastructure/dto

¿Consulta o persiste datos?
→ infrastructure/repositories

¿Integra una capacidad técnica externa?
→ infrastructure/services

¿Es transversal a toda la aplicación?
→ common

¿Configura el arranque de Nest?
→ bootstrap

¿Configura environment?
→ config
```

Si ninguna categoría encaja, revisá la responsabilidad antes de crear una nueva carpeta.

---

# 32. General rule

Preferí:

- código explícito;
- responsabilidades pequeñas;
- nombres de dominio;
- boundaries claros;
- abstracciones justificadas.

Evitá:

- abstracciones preventivas;
- generic services gigantes;
- repositories genéricos universales;
- lógica de negocio en infraestructura;
- duplicación innecesaria;
- arquitectura ceremonial sin beneficio.

El objetivo es una arquitectura modular y mantenible para aplicaciones medianas, no maximizar la cantidad de capas.
