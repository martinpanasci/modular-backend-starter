# Common

Código técnico transversal sin dueño de dominio. Que algo se use en dos módulos no significa automáticamente que pertenezca aquí: si representa un concepto de negocio, debe permanecer dentro del módulo que lo posee.

Categorías posibles, creadas solamente cuando contienen código real:

- `decorators/`: decorators Nest reutilizables.
- `filters/`: manejo transversal de excepciones.
- `guards/`: controles genéricos de acceso o request.
- `interceptors/`: comportamiento alrededor del ciclo request/response.
- `pipes/`: transformación o validación técnica transversal.
- `types/`: tipos técnicos globales.
- `utils/`: helpers puros y realmente agnósticos al dominio.

Ejemplos:

```text
HttpErrorResponse
→ common/types

Regla específica de una transferencia
→ modules/transfers/domain
```

No colocar aquí:

- queries Prisma específicas de un dominio;
- reglas de negocio;
- use cases;
- DTOs específicos de un módulo;
- services específicos de un dominio;
- configuración del arranque de Nest, que pertenece a `bootstrap/`.

Actualmente `filters/http-exception.filter.ts` normaliza errores HTTP y `types/http-error-response.ts` define su contrato compartido. `common` puede ser consumido por módulos funcionales, pero nunca debe importar sus internals.
