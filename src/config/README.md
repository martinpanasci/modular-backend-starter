# Config

Configuración dependiente del entorno. `@nestjs/config` expone valores tipados y Zod valida y transforma el environment durante el bootstrap. Si falta una variable crítica o su valor es inválido, la aplicación falla temprano antes de aceptar tráfico.

Para agregar una variable:

1. agregala al schema Zod de `environment.schema.ts`;
2. documentala en `.env.example`;
3. accedé mediante `ConfigService`;
4. no leas `process.env` arbitrariamente desde módulos.

`logger.config.ts` concentra la configuración de Pino. No coloques secretos ni reglas de negocio aquí.

Zod se usa para env/config. Los DTOs HTTP usan `class-validator` y `class-transformer`.
