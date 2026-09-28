# Database

Infraestructura global de conexión. Contiene `PrismaService`, `PrismaModule`, composición de database y el lifecycle que desconecta Prisma durante el shutdown.

No contiene queries específicas de negocio. Los repositories pertenecen al módulo dueño del dominio:

```text
Incorrecto: database/user.repository.ts
Correcto:   modules/users/infrastructure/repositories/user.repository.ts
```

Flujo de generación y uso:

```text
prisma/schema.prisma
→ npm run prisma:generate
→ src/generated/prisma
→ repositories de cada módulo
```

Nunca modifiques manualmente `src/generated/prisma`.

Comandos frecuentes:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name <name>
```

Los módulos acceden a Prisma desde repositories o servicios de infrastructure, no desde domain, application o controllers.
