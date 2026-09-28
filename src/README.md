# Source map

`src` contiene el código ejecutable del backend:

- `bootstrap/`: configuración global aplicada al iniciar Nest.
- `common/`: código técnico transversal sin dueño de dominio.
- `config/`: environment y configuración validada.
- `database/`: conexión global y lifecycle de Prisma.
- `docs/`: configuración de Swagger y OpenAPI.
- `modules/`: dominios funcionales y módulos pragmáticos del sistema.
- `queues/`: lugar opcional para background processing cuando exista un caso real.
- `generated/`: código generado automáticamente; nunca se edita a mano.
- `app.module.ts`: módulo raíz que compone la aplicación.
- `main.ts`: entrada que crea e inicia la aplicación Nest.

Flujo conceptual de una operación:

```text
HTTP Request
→ Controller
→ Use Case
→ Domain
→ Port
→ Infrastructure
→ Database / External System
```

Las dependencias siempre apuntan hacia adentro:

```text
infrastructure → application → domain
```

Nunca al revés. Consultá `modules/README.md` para decidir dónde implementar cada responsabilidad.
