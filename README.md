# Modular Backend Starter

Template independiente de backend con **NestJS, TypeScript strict, Prisma y PostgreSQL**, organizado por módulos con principios de Hexagonal/Clean Architecture.

Este repositorio contiene únicamente el backend; no incluye frontend ni requiere el template fullstack.

## Estructura

```text
modular-backend-starter/
├── .github/          # CI y Dependabot
├── server/           # Aplicación, configuración, tests y dependencias npm
│   ├── .husky/
│   ├── prisma/
│   ├── src/
│   ├── test/
│   ├── AGENTS.md
│   ├── README.md
│   └── package.json
└── LICENSE
```

## Inicio rápido

Requiere Node.js >=22.12.0 y PostgreSQL para ejecutar la aplicación.

Desde la raíz del repositorio:

```bash
cd server
npm ci
```

Copiá `server/.env.example` a `server/.env` y ajustá la conexión a PostgreSQL y las demás variables antes de iniciar la aplicación. Desde `server/`:

```bash
npm run prisma:migrate
npm run dev
```

## Calidad y hooks

Todos los comandos npm se ejecutan desde `server/`:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm ci` ejecuta `prepare`, que configura Husky desde la raíz Git usando `server/.husky`. El pre-commit entra en `server/` y ejecuta lint-staged con las dependencias locales. Para reinstalar los hooks, ejecutá `npm run prepare` desde `server/`.

GitHub Actions usa `server/` como directorio de trabajo y Dependabot revisa `/server`. `.git` y `.github` permanecen en la raíz; no hay un paquete npm raíz.

Consultá [server/README.md](server/README.md) para arquitectura, configuración y comandos completos, y [server/AGENTS.md](server/AGENTS.md) para las reglas del backend.
