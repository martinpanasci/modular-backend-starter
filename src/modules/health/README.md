# Health

`GET /api/health/live` confirma únicamente que el proceso Nest está vivo. Debe ser rápido y no consulta dependencias.

`GET /api/health/ready` confirma que la instancia puede trabajar; actualmente ejecuta un check mínimo de PostgreSQL mediante Prisma. Devuelve `503` con un error seguro si la base no responde.

ECS, ALB, Kubernetes u otro sistema de infraestructura decide cuándo y cómo consultar estos endpoints. El módulo no contiene lógica específica de ningún proveedor. Se pueden agregar nuevos checks implementando puertos equivalentes cuando aparezcan dependencias críticas reales.
