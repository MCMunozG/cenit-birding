# Accounts Service

Es dueño de la identidad: registro, login, perfiles, roles, access tokens RSA y refresh tokens hasheados. No guarda avistamientos, especies ni contenido comunitario.

## Operación desde Git Bash

Desde la raíz del repositorio, sin entrar a esta carpeta:

```sh
bash bin/cenit prepare accounts
bash bin/cenit service serve accounts
```

El servicio local escucha en `http://127.0.0.1:8001`. `prepare` aplica migrations y seeders sin borrar datos. La configuración MySQL local estándar es creada por `infra/mysql/workbench-local.sql`; el flujo completo está en el [README raíz](../../../README.md).

Para crear el superadministrador durante la primera siembra:

```sh
SUPERADMIN_EMAIL=admin@cenit.local SUPERADMIN_NAME='Cénit Admin' SUPERADMIN_PASSWORD='cambia-esta-clave' bash bin/cenit prepare accounts
```

El registro público genera siempre el rol `user`.

## API y dependencia

Expone `/api/accounts/v1/auth/register`, `/login`, `/refresh`, `/logout` y `/api/accounts/v1/me`. Firma JWT con su clave privada; Catalog, Observation y Community sólo reciben la clave pública para validar tokens localmente. El contrato inicial está en [contracts/openapi/accounts.yaml](../../../contracts/openapi/accounts.yaml).
