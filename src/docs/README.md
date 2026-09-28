# API documentation

Configuración central de Swagger/OpenAPI:

- Swagger UI: `/docs`
- OpenAPI JSON: `/docs/json`

Swagger es la interfaz visual; OpenAPI es la especificación que describe el contrato HTTP. Controllers, operaciones y DTOs alimentan esa documentación mediante decorators.

Cuando cambie una ruta, request, response o status documentado, actualizá sus decorators para mantener Swagger consistente. No coloques lógica HTTP ni de dominio en esta carpeta.
