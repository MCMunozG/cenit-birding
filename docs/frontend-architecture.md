# Arquitectura del frontend

## Estructura aplicada

Cada pantalla es un componente standalone, con TypeScript y HTML en archivos separados, ubicado en su contexto de producto y cargado de forma perezosa por el router.

```text
src/app/
  core/
    api/                       # un cliente REST por servicio remoto
    auth.guard.ts               # acceso autenticado
    session.service.ts          # sesión de cliente
  features/
    accounts/{auth,profile}/
    catalog/{species-list,species-detail}/
    community/{community-feed,notifications}/
    discovery/{home,explore}/
    observations/{map,new-sighting,my-sightings}/
    planning/
    tools/
  shared/
    models/                     # contratos TypeScript por contexto
    google-map.component.*
```

No hay un componente de páginas genérico ni plantillas grandes dentro de strings TypeScript. `app.routes.ts` es la única composición de navegación y cada ruta usa `loadComponent`.

## Regla de dependencia

Una página no llama directamente a `HttpClient` ni importa tipos de otro contexto. Habla con el cliente de su API en `core/api`; los contratos de red viven en `shared/models`. `shared` no contiene reglas de negocio.

Cuando una pantalla crezca, se divide en `ui/` (presentación) y `data-access/` (fachada o estado) dentro de su mismo contexto, sin volver a crear un componente global.

## Reglas operativas

- Los guards deciden si hay sesión; el backend sigue siendo la autoridad de permisos.
- Las respuestas paginadas se mantienen como tales; no se pierde metadato de paginación en los clientes.
- Los datos de ejemplo son un fallback de desarrollo, nunca una respuesta silenciosa de producción.
- El refresh y revocación de sesión se resolverán antes de mover la sesión a BFF + cookies `HttpOnly`, que es la dirección recomendada para producción.
