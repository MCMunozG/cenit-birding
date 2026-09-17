# Referencia de entorno

Cada servicio parte de su propio `.env.example`. Copia ese archivo a `.env` mediante `bash bin/cenit prepare`; el archivo real queda fuera de Git. Esta guía documenta los valores de desarrollo y no sustituye la gestión de secretos de un entorno compartido o de producción.

## Variables comunes de Laravel

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `APP_NAME` | Nombre usado por Laravel en mensajes y logs. | Nombre del servicio Cénit. |
| `APP_ENV` | Activa comportamiento de entorno. | `local`; nunca usar para identificar permisos. |
| `APP_KEY` | Clave simétrica de Laravel para cifrado interno. | La genera `prepare` si está vacía. Nunca copiar entre entornos. |
| `APP_DEBUG` | Incluye detalles de excepciones en respuestas y logs. | `true` sólo local; `false` fuera de desarrollo. |
| `APP_URL` | URL base del servicio para generación de enlaces. | El puerto local del servicio. |
| `APP_LOCALE`, `APP_FALLBACK_LOCALE`, `APP_FAKER_LOCALE` | Idioma de Laravel y datos de ejemplo. | Configuración base de Laravel en Accounts. |
| `APP_MAINTENANCE_DRIVER`, `APP_MAINTENANCE_STORE` | Lugar donde Laravel guarda el estado de mantenimiento. | `file`; sólo cambiar si se coordina entre réplicas. |
| `PHP_CLI_SERVER_WORKERS` | Procesos del servidor PHP local. | `4`; requiere `--no-reload`, ya incluido en `bin/cenit`. |
| `BCRYPT_ROUNDS` | Coste de hash de contraseñas. | `12`; reducir sólo en pruebas automatizadas. |
| `LOG_CHANNEL`, `LOG_STACK`, `LOG_DEPRECATIONS_CHANNEL`, `LOG_LEVEL` | Destino y severidad de logs. | `stack`, `single`, `debug`. |

## Persistencia, cache y procesos

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `DB_CONNECTION` | Driver de base de datos. | `mysql`. |
| `DB_HOST`, `DB_PORT` | Host y puerto MySQL. | `127.0.0.1:3306`; Docker usa `mysql`. |
| `DB_DATABASE` | Base lógica propiedad de cada servicio. | `cenit_accounts`, `cenit_catalog`, `cenit_observation` o `cenit_community`. |
| `DB_USERNAME`, `DB_PASSWORD` | Credencial del servicio para MySQL. | `cenit` / `cenit_dev`, creados por el script de infraestructura. |
| `SESSION_DRIVER`, `SESSION_*` | Persistencia y alcance de la sesión web de Laravel. | Accounts usa `database`; la SPA usa JWT, no cookies de sesión. |
| `CACHE_STORE`, `CACHE_PREFIX` | Driver y prefijo de cache de Laravel. | `database`; definir prefijo al compartir store. |
| `QUEUE_CONNECTION` | Transporte de trabajos en segundo plano. | `database` en Accounts; no supone un worker activo por sí mismo. |
| `BROADCAST_CONNECTION` | Transporte de eventos en tiempo real. | `log`; no publica a un broker. |
| `FILESYSTEM_DISK` | Disco Laravel por defecto. | `local`. |
| `MEMCACHED_HOST`, `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT` | Valores preparados para futuros drivers. | No se usan mientras cache/colas sigan en `database`. |

## Correo y almacenamiento externo

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `MAIL_*` | Transporte, host y remitente del correo Laravel. | `log`: los mensajes se escriben en logs, no se envían. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_USE_PATH_STYLE_ENDPOINT` | Configuración de S3 compatible. | Vacía por defecto; definir sólo si se habilita ese disco. |
| `VITE_APP_NAME` | Nombre expuesto a assets compilados por Vite de Laravel. | Hereda `APP_NAME`; la SPA Angular no depende de él. |

## JWT entre servicios

| Variable | Consumidor y propósito |
| --- | --- |
| `JWT_ISSUER` | Los cuatro servicios. Debe ser igual a `cenit-accounts`; rechaza tokens emitidos por otro contexto. |
| `JWT_ACCESS_TTL_MINUTES` | Sólo Accounts. Duración del access token emitido. |
| `JWT_PRIVATE_KEY_PATH` | Sólo Accounts. Ruta de la clave RSA privada de firma. No se comparte ni se versiona. |
| `JWT_PUBLIC_KEY_PATH` | Los cuatro servicios. Ruta de la clave pública que verifica firmas. `prepare` la crea/copia localmente. |
| `CENIT_OPENSSL_BINARY` | Variable transitoria usada internamente por `bin/cenit` en Windows cuando PHP no puede generar RSA. No se guarda en `.env`. |

## Variables funcionales por servicio

| Servicio | Variable | Propósito |
| --- | --- | --- |
| Accounts | `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME`, `SUPERADMIN_PASSWORD` | Superadministrador repetible para `APP_ENV=local`. `prepare accounts` lo crea o actualiza. Son credenciales públicas de demo, no valores de producción. |
| Observation | `CATALOG_URL` | URL interna de Catalog usada sólo para leer la sensibilidad de una especie antes de publicar. |
| Todos | `GOOGLE_MAPS_API_KEY` | No existe en los `.env` de Laravel: la clave se suministra al front según el mecanismo de despliegue. Nunca incrustarla en código fuente. |

## Reglas operativas

1. Nunca edites o subas un `.env` real. Cambia `.env.example` y esta guía cuando se agregue una variable.
2. Si cambias `APP_KEY`, rutas de claves JWT o credenciales de base, reinicia el proceso Laravel correspondiente.
3. Para rotar las claves JWT locales, ejecuta `php artisan cenit:jwt-keys --force` dentro de Accounts y luego `bash bin/cenit prepare` para volver a distribuir la pública. Nunca uses esa rotación improvisada en producción.
