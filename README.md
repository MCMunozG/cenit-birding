# Cénit Birding

Plataforma de observación de aves y ciencia ciudadana ligera. El avistamiento es el dato central: enlaza una persona, una especie opcional, fecha, evidencia y una ubicación protegida.

## Estructura y arquitectura

```text
apps/
├── web/                         SPA Angular
└── services/
    ├── accounts-service/        identidad, perfiles y tokens
    ├── catalog-service/         especies y sensibilidad geográfica
    ├── observation-service/     avistamientos y ubicaciones
    └── community-service/       publicaciones y moderación
```

Cada servicio Laravel es ejecutable por separado, tiene su propio `.env`, migrations, seeders y base de datos lógica MySQL. No hay foreign keys, modelos compartidos ni consultas entre bases. La SPA integra las APIs REST. Consulta la documentación de diseño en [docs/architecture.md](docs/architecture.md), los [límites de servicio](docs/service-boundaries.md) y los [ADRs](docs/adr).

## Documentación técnica

La referencia de variables de entorno está en [docs/environment-reference.md](docs/environment-reference.md). Describe qué configura cada `.env.example`, cuáles secretos no se versionan y cómo funcionan las claves JWT locales.

Para ubicar rápidamente cada componente, servicio, modelo y regla de dominio, consulta la [guía de lectura del código](docs/codebase-guide.md).

- [Arquitectura de software](docs/architecture.md): componentes, flujos, límites y decisiones de seguridad.
- [Estructura del frontend](docs/frontend-architecture.md): ubicación de páginas, clientes HTTP y reglas de dependencia.
- [Capas de los servicios Laravel](docs/backend-application-layers.md) y [guía de código](docs/service-code-guide.md).
- [Guía de desarrollo](docs/development-guide.md): cómo añadir pantallas, endpoints y pruebas.
- [Límites de servicio](docs/service-boundaries.md), [decisiones (ADR)](docs/decisions.md) y contratos [OpenAPI](contracts/openapi/).

## Requisitos

- Git Bash en Windows.
- PHP 8.2 o superior, con `pdo_mysql` y `openssl`.
- Composer 2.
- Node.js 20 o superior para la web.
- MySQL 8 local (Workbench) o Docker Desktop para el modo integrado.

Las dependencias Composer, los `.env` de desarrollo y las claves JWT de esta copia de trabajo ya están preparados. No se versionan las claves privadas ni los `.env` reales.

## Arranque local sin Docker (Git Bash)

1. En MySQL Workbench, ejecuta una sola vez [infra/mysql/workbench-local.sql](infra/mysql/workbench-local.sql) como usuario administrador. Crea las cuatro bases y el usuario local `cenit` con contraseña `cenit_dev`.

2. Desde cualquier ubicación de Git Bash, prepara las bases. En una copia nueva, el comando crea el `.env` de cada servicio desde su `.env.example` y genera su `APP_KEY` si falta; nunca sobreescribe un `.env` existente. El comando encuentra el repositorio por sí solo; no necesitas entrar en una carpeta de servicio:

```sh
bash /c/repositories/cenit-birding/bin/cenit prepare
```

Si ya estás en el repositorio, la forma corta es:

```sh
bash bin/cenit prepare
```

3. Abre cuatro terminales Git Bash y levanta los servicios:

```sh
bash bin/cenit service serve accounts
bash bin/cenit service serve catalog
bash bin/cenit service serve observation
bash bin/cenit service serve community
```

4. En una quinta terminal, instala y sirve la SPA:

```sh
bash bin/cenit web install
bash bin/cenit web serve
```

La SPA de desarrollo usa su proxy para llegar a los puertos locales. Los servicios escuchan en `8001` (Accounts), `8002` (Catalog), `8003` (Observation) y `8004` (Community). Angular usa el puerto `4200` por defecto.

El comando `service serve` usa `--no-reload` para permitir los workers de PHP configurados por Laravel. Esto evita un warning de desarrollo; sólo significa que, si cambias un `.env`, debes reiniciar ese servicio.

### Qué hace `prepare`

`prepare` es el comando seguro de inicialización y actualización de desarrollo:

```sh
bash bin/cenit prepare                 # las cuatro bases
bash bin/cenit prepare accounts        # solo Accounts
bash bin/cenit prepare catalog          # solo Catalog
bash bin/cenit prepare observation      # solo Observation
bash bin/cenit prepare community        # solo Community
```

Para cada servicio ejecuta, en este orden, la inicialización segura del entorno, la preparación de claves JWT, `php artisan migrate --force` y `php artisan db:seed --force`. Aplica migraciones pendientes y carga/actualiza los datos de semilla; no ejecuta `migrate:fresh` ni borra datos existentes. `bash bin/cenit service serve <servicio>` invoca ese mismo `prepare` para el servicio antes de arrancarlo, por lo que es correcto usar cualquiera de los dos flujos.

Durante la preparación, Accounts crea el par RSA local si no existe y comparte solamente `jwt-public.pem` con Catalog, Observation y Community. La privada permanece en Accounts y está ignorada por Git. En Docker, el volumen interno `jwt-keys` aplica la misma separación.

`fresh` sí elimina las tablas del servicio indicado y vuelve a sembrarlas; úsalo solo cuando quieras reiniciar datos:

```sh
bash bin/cenit fresh observation
```

### Comandos disponibles

| Comando                                   | Efecto                                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| `bash bin/cenit prepare [servicio]`       | Migra y ejecuta seeders sin borrar datos.                    |
| `bash bin/cenit migrate [servicio]`       | Ejecuta solo migraciones pendientes.                         |
| `bash bin/cenit seed [servicio]`          | Ejecuta solo seeders.                                        |
| `bash bin/cenit fresh [servicio]`         | Reinicia el esquema con `migrate:fresh --seed`; destructivo. |
| `bash bin/cenit test [servicio]`          | Ejecuta las pruebas Laravel.                                 |
| `bash bin/cenit service serve <servicio>` | Prepara y sirve un Laravel localmente.                       |
| `bash bin/cenit web install`              | Instala dependencias npm de Angular.                         |
| `bash bin/cenit web serve`                | Arranca Angular en desarrollo.                               |
| `bash bin/cenit web build`                | Genera la compilación de producción de Angular.              |
| `bash bin/cenit up` / `down`              | Arranca o detiene el conjunto Docker.                        |

Los valores posibles de `<servicio>` son `accounts`, `catalog`, `observation` y `community`.

En entorno local, `prepare accounts` crea o actualiza automáticamente el superadministrador de desarrollo. No uses estas credenciales fuera de tu equipo:

```text
Correo: admin@cenit.local
Contraseña: CenitAdmin2026!
```

Puedes sobrescribir esos tres valores en `apps/services/accounts-service/.env` con `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME` y `SUPERADMIN_PASSWORD` antes de ejecutar `prepare accounts`.

Los registros públicos siempre reciben el rol `user`. Los seeders cargan un catálogo inicial de especies y actividad de campo para desarrollo; toda identificación sensible debe validarse con fuentes y expertos antes de cualquier uso científico o de conservación.

## Modo integrado con Docker

Docker crea MySQL y las cuatro bases mediante [infra/mysql/init-databases.sql](infra/mysql/init-databases.sql):

```sh
cp .env.example .env
bash bin/cenit up
```

Para ver servicios en primer plano, usa `docker compose up --build`. El archivo `compose.yaml` publica los mismos puertos que el modo local y usa el proxy Nginx de la web para enrutar los prefijos `/api/...`.

## Claves JWT

Accounts firma con una clave RSA privada; los demás servicios verifican con la clave pública. Para generar un par nuevo en un entorno con OpenSSL:

```sh
openssl genrsa -out apps/services/accounts-service/storage/app/keys/jwt-private.pem 2048
openssl rsa -in apps/services/accounts-service/storage/app/keys/jwt-private.pem -pubout -out apps/services/accounts-service/storage/app/keys/jwt-public.pem
```

Copia solo `jwt-public.pem` a `storage/app/keys/` de Catalog, Observation y Community. Nunca subas la clave privada ni valores reales de `.env` al repositorio.

## Privacidad geográfica

Observation conserva `private_lat` y `private_lng`; solo el propietario (o moderación autorizada cuando se implemente) puede recibirlos. Los endpoints públicos usan exclusivamente coordenadas derivadas:

- `EXACT`: conserva el punto.
- `APPROXIMATE`: usa el centro de una cuadrícula aproximada de 5,5 km.
- `HIDDEN`: no devuelve coordenadas.

Al publicar un avistamiento de especie, Observation consulta a Catalog para obtener la sensibilidad. Si Catalog no está disponible, la publicación se rechaza de forma conservadora y el avistamiento puede continuar como borrador.

## Google Maps

La vista **Mapa** muestra solamente puntos públicos de Observation. El formulario **Registrar avistamiento** incorpora un mapa interactivo: haz clic o arrastra el marcador para elegir la ubicación privada que se enviará al servicio.

1. Crea una clave de navegador en Google Cloud y habilita **Maps JavaScript API**.
2. Restringe la clave por sitios web a tu origen local, por ejemplo http://localhost:4200 o el puerto que use tu entorno de desarrollo, y restríngele el uso únicamente a Maps JavaScript API.
3. En Cénit abre **Mapa** o **Registrar avistamiento**, pega la clave en el campo **Google Maps API key**.

La clave se guarda solo en sessionStorage, nunca en el repositorio ni en .env. Google recomienda restringir tanto el sitio de origen como las APIs autorizadas para prevenir uso no autorizado. [Configuración de Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key), [prácticas de seguridad de Google Maps Platform](https://developers.google.com/maps/api-security-best-practices).

## Verificación realizada

Se instalaron las dependencias Composer de los cuatro servicios, se generaron sus `APP_KEY` y se validó su configuración PHP con MySQL. Las rutas de los cuatro Laravel y pruebas unitarias de Catalog/Observation se ejecutaron correctamente. La compilación de producción y el arranque de desarrollo de Angular también se validaron.

Las migrations y seeders se ejecutaron contra MySQL local: Accounts contiene 12 perfiles; Catalog, 24 especies; Observation, 60 avistamientos (52 con representación pública y 8 protegidos); y Community contiene 18 publicaciones, 36 comentarios, 54 reacciones, 12 seguimientos, 4 reportes, 2 registros de auditoría y 12 notificaciones.
