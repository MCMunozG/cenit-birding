# Guía de desarrollo

## Arranque local

Los comandos se ejecutan desde Git Bash en la raíz del repositorio. Crea primero las cuatro bases con `infra/mysql/workbench-local.sql` y luego prepara el entorno:

```sh
bash bin/cenit prepare
bash bin/cenit service serve accounts
bash bin/cenit service serve catalog
bash bin/cenit service serve observation
bash bin/cenit service serve community
bash bin/cenit web install
bash bin/cenit web serve
```

`prepare` es seguro para uso cotidiano: aplica migrations pendientes y seeders sin borrar datos. `fresh <servicio>` sí destruye y vuelve a crear el esquema del servicio indicado. Para Docker, copia `.env.example` a `.env` y usa `bash bin/cenit up`.

## Cómo añadir una pantalla Angular

1. Elige el contexto dueño: por ejemplo, una nueva búsqueda de especies va en `features/catalog/`, no en `shared/`.
2. Crea `features/<contexto>/<página>/<página>.page.ts` y su `*.page.html`.
3. La página usa el cliente de `core/api` correspondiente; no instancia `HttpClient`.
4. Añade una ruta con `loadComponent` en `app.routes.ts`. Aplica `authenticatedGuard` sólo para mejorar la navegación; el servidor sigue autorizando.
5. Si hay estado reutilizado por varias páginas del mismo contexto, crea `features/<contexto>/data-access/`. Los componentes presentacionales van en `features/<contexto>/ui/`.

## Cómo añadir o cambiar un endpoint

1. Confirma en [service-boundaries.md](service-boundaries.md) qué servicio es dueño de la capacidad y los datos.
2. Crea o actualiza una ruta bajo `/api/<servicio>/v1`.
3. Valida la entrada con `FormRequest`; deja al controlador traducir HTTP y al caso de uso aplicar reglas.
4. Si la respuesta contiene datos privados, crea una proyección con `JsonResource`; no devuelvas el modelo directamente.
5. Actualiza el OpenAPI correspondiente, añade pruebas y adapta el cliente Angular dueño de esa API.
6. Si cambia un límite, integración, seguridad o persistencia, registra un ADR.

## Reglas que evitan errores costosos

- Nunca leas una tabla de otro servicio, incluso si ambas bases están en el mismo MySQL.
- Un identificador externo es una referencia opaca; no declares una foreign key hacia otra base.
- Propaga `X-Request-Id` en una llamada entre servicios.
- Las coordenadas privadas no salen de Observation y no se derivan durante una respuesta pública.
- No copies secretos a Git. Accounts conserva la clave privada JWT; los demás servicios requieren sólo la pública.
- Antes de abrir un cambio, ejecuta `npm run build` en `apps/web` y `php artisan test` en el servicio modificado.
