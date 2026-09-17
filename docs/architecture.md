# Arquitectura de software

## Objetivo y forma del sistema

Cénit Birding es un monorepo con una SPA Angular y cuatro aplicaciones Laravel autónomas. La división busca que identidad, catálogo editorial, avistamientos y comunidad evolucionen sin convertir cada entidad en un microservicio separado.

```text
Angular SPA
  ├── /api/accounts/...      → Accounts
  ├── /api/catalog/...       → Catalog
  ├── /api/observations/...  → Observation ──REST──→ Catalog (al publicar)
  └── /api/community/...     → Community

Cada servicio Laravel → su propia base lógica MySQL
```

No existe gateway de aplicación. En Docker, Nginx de la web solo enruta por prefijo; en desarrollo, el proxy Angular cumple el mismo papel. La SPA compone las vistas y cada API toma sus propias decisiones de autorización.

## Componentes, datos y puertos

| Componente | Responsabilidad | Base MySQL | Puerto local |
|---|---|---|---|
| `apps/web` | Interfaz Angular, sesión de cliente y composición REST | — | 4200 |
| Accounts | Registro, login, perfil, roles, JWT y refresh tokens | `cenit_accounts` | 8001 |
| Catalog | Especies y nivel editorial de sensibilidad | `cenit_catalog` | 8002 |
| Observation | Borradores/publicación de avistamientos y ubicación privada/pública | `cenit_observation` | 8003 |
| Community | Feed, posts, comentarios, reacciones, reportes, auditoría y avisos internos | `cenit_community` | 8004 |

MySQL puede ejecutarse como un único servidor, pero no como una base compartida. Cada servicio dispone de su propio usuario/configuración, migrations y seeders; la única comunicación admitida entre dominios es mediante sus APIs.

## Límites y comunicación

Accounts emite identidad; sus consumidores reciben el `sub` del JWT como ULID externo, no una copia de la tabla de usuarios. Catalog es fuente de verdad de especies y sensibilidad. Observation conserva avistamientos y coordenadas. Community conserva la conversación y el rastro de moderación, pero no modifica los datos de Observation ni de Catalog.

La dependencia síncrona actual es Observation → Catalog cuando se publica un avistamiento con especie. Observation solicita la sensibilidad y falla de manera cerrada si no puede resolverla: deja el elemento sin publicar antes que exponer una ubicación. No hay broker ni eventos de dominio en el MVP; al añadir efectos secundarios no críticos se prevé una outbox por servicio y un consumidor, sin compartir tablas.

Los detalles de propiedad y operaciones prohibidas están en [service-boundaries.md](service-boundaries.md).

## Seguridad e identidad

1. Accounts autentica al usuario y firma un access token JWT RSA de corta duración.
2. Catalog, Observation y Community tienen solamente la clave pública, por lo que validan firma, caducidad y claims localmente, sin llamar a Accounts en cada petición.
3. Accounts guarda refresh tokens con hash y los rota/revoca al renovar o cerrar sesión.
4. Los controladores Laravel resuelven el actor desde middleware; cada recurso comprueba que su propietario coincide con el `sub` autenticado.

El frontend actual guarda el access token en `sessionStorage`. Es una decisión transitoria adecuada para el MVP de SPA, pero una versión de producción con mayor exigencia de seguridad debería usar un BFF y cookies `HttpOnly`/`Secure` para que JavaScript no pueda leer el token.

## Modelo de privacidad geográfica

La ubicación exacta nace y se almacena únicamente en Observation. Al crear o publicar un avistamiento se guardan representaciones separadas: privada y pública. La API pública nunca deriva coordenadas a partir de los campos privados durante la respuesta.

| Sensibilidad de Catalog | Vista pública de Observation |
|---|---|
| `EXACT` | Coordenada original. |
| `APPROXIMATE` | Centro de una cuadrícula de aproximadamente 5,5 km. |
| `HIDDEN` | Ninguna coordenada. |

Las consultas de mapa usan solo columnas públicas e indexadas. Las coordenadas privadas se devuelven exclusivamente al propietario. Si se necesita geometría compleja más adelante, MySQL Spatial puede añadirla sin relajar esa separación.

## Diseño del código

Cada Laravel conserva el flujo HTTP habitual: rutas versionadas → middleware de autenticación/autorización → controlador → modelo/servicio de dominio → migration/seeder. Los puntos con reglas propias están aislados en servicios pequeños: Accounts concentra la emisión/verificación JWT y Observation concentra la transformación `LocationPrivacy`.

El diseño evita abstracciones prematuras como repositorios genéricos, CQRS o un bus de eventos local porque todavía no aportan una frontera adicional. Las migrations son el contrato del esquema de cada contexto; los seeders suministran un entorno repetible de desarrollo. Los contratos HTTP se documentan de forma inicial en `contracts/openapi/` y deben evolucionar junto a cada endpoint.

## Operación local y despliegue

Cada servicio se puede levantar sin Docker desde Git Bash con `bash bin/cenit service serve <servicio>`. El comando aplica migrations y seeders no destructivos antes de iniciar Laravel en el puerto asignado. `bash bin/cenit prepare` realiza esa preparación para las cuatro bases y es el paso recomendado después de crear MySQL local con `infra/mysql/workbench-local.sql`.

El modo Docker usa `compose.yaml`, un contenedor MySQL 8.4 y la inicialización `infra/mysql/init-databases.sql`. Ambos modos emplean MySQL; PostgreSQL no forma parte de la arquitectura.

## Estado y evolución consciente

El esqueleto implementa autenticación, catálogo, avistamientos con privacidad y la base de comunidad. Aún faltan capacidades completas previstas por el producto —por ejemplo rutas, viajes, medios, identificación asistida y acciones de moderación entre servicios—, por lo que no deben presentarse como terminadas. Antes de producción se requieren pruebas de integración con MySQL, migraciones en un entorno limpio, compilación de Angular, gestión real de secretos, observabilidad y políticas de backup/retención.
