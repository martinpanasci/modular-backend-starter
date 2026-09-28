# Bootstrap

Configuración global que se aplica cuando inicia Nest. `configure-application.ts` configura actualmente:

- prefijo global `/api`;
- Helmet;
- CORS desde `ConfigService`;
- `ValidationPipe` global;
- shutdown hooks para `SIGINT` y `SIGTERM`.

No contiene lógica de negocio ni configuración específica de módulos. `main.ts` debe mantenerse pequeño: crea la app, obtiene configuración, llama esta utilidad, configura Swagger e inicia el servidor.

Antes de agregar una configuración global nueva, verificá que realmente afecte a toda la aplicación y que no pertenezca a un módulo, `config/`, `docs/` o `common/`.
